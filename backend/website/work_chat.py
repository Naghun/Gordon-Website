"""Team chat, project chat and recipient-scoped mention notifications."""
import re
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .models import WorkProject, WorkChatMessage, WorkChatMention


def accessible_mentions(user):
    return WorkChatMention.objects.filter(recipient=user).filter(
        Q(message__project__isnull=True) |
        Q(message__project__members=user, message__project__deleted_at__isnull=True)
    ).distinct()


def room(request, pk=None):
    from .work_api import person, text
    project = get_object_or_404(WorkProject, pk=pk, members=request.user) if pk else None
    members = (project.members if project else get_user_model().objects).filter(is_active=True)
    if request.method == 'POST':
        body = text(request.data.get('text', ''), 4000, True)
        # Match complete usernames, including dots/hyphens, without interpreting email addresses.
        mentioned = [member for member in members if member.pk != request.user.pk and re.search(
            r'(?<![\w@])@' + re.escape(member.username) + r'(?![\w@+-]|\.[\w])', body, re.IGNORECASE)]
        with transaction.atomic():
            message = WorkChatMessage.objects.create(project=project, author=request.user, text=body)
            WorkChatMention.objects.bulk_create([
                WorkChatMention(message=message, recipient=member) for member in mentioned])
        return Response(serialize(message, request.user), status=201)
    try:
        limit = min(10000, max(1, int(request.query_params.get('limit', 100))))
    except (ValueError, TypeError):
        raise ValidationError('Neispravan broj poruka.')
    messages = list(WorkChatMessage.objects.filter(project=project).select_related('author')
                    .prefetch_related('mentions__recipient').order_by('-id')[:limit+1])
    return Response({'messages': [serialize(m, request.user) for m in reversed(messages[:limit])],
                     'more': len(messages) > limit, 'members': [person(m) for m in members]})


def serialize(message, user):
    from .work_api import person
    mentions = list(message.mentions.all())
    return {'id': message.pk, 'text': message.text,
            'author': person(message.author) if message.author else {'id': None, 'name': 'Bivši član'},
            'time': message.created_at.isoformat(),
            'mentions': [person(m.recipient) for m in mentions],
            'unreadMention': any(m.recipient_id == user.pk and not m.read for m in mentions)}


@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def summary(request):
    rows = accessible_mentions(request.user).filter(read=False).values('message__project_id').annotate(count=Count('id'))
    rooms = {str(row['message__project_id']) if row['message__project_id'] else 'general': row['count'] for row in rows}
    return Response({'total': sum(rooms.values()), 'rooms': rooms})


@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def mark_read(request):
    ids = request.data.get('messages', [])
    if not isinstance(ids, list) or len(ids) > 10000 or any(type(i) is not int or i < 1 for i in ids):
        raise ValidationError('Neispravan izbor poruka.')
    accessible_mentions(request.user).filter(message_id__in=ids, read=False).update(read=True)
    return Response({'ok': True})
