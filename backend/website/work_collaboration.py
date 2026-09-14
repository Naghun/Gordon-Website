import base64
import re
from django.db import transaction
from django.db.models import F
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils.http import content_disposition_header
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.response import Response
from .models import WorkProject, WorkTask, WorkAttachment, WorkNotification
from .work_api import visible_tasks, require_editor, project_data, text, notify_task

@api_view(['PATCH','DELETE'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def member(request,pk,user_id):
    with transaction.atomic():
        p=get_object_or_404(WorkProject.objects.select_for_update(),pk=pk,members=request.user)
        if p.owner_id!=request.user.pk: raise PermissionDenied('Samo vlasnik upravlja članovima.')
        if user_id==p.owner_id: raise ValidationError('Vlasniku se ne može ukloniti pristup.')
        get_object_or_404(p.members,pk=user_id)
        if request.method=='DELETE':
            p.members.remove(user_id)
            p.roles.pop(str(user_id),None)
            p.tasks.filter(assignee_id=user_id).update(assignee=None,revision=F('revision')+1)
        else:
            role=request.data.get('role')
            if role not in ('editor','viewer'): raise ValidationError('Nepoznata uloga.')
            p.roles[str(user_id)]=role
        p.save()
    return Response(project_data(p))

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def upload(request,pk):
    with transaction.atomic():
        t=get_object_or_404(visible_tasks(request.user).select_for_update(),pk=pk,deleted_at__isnull=True)
        require_editor(t.project,request.user)
        if t.attachments.count()>=20: raise ValidationError('Dozvoljeno je 20 priloga po zadatku.')
        name=text(request.data.get('name',''),180,True)
        name=re.split(r'[/\\]',name)[-1]
        if not name or '.' not in name or name.rsplit('.',1)[-1].lower() not in ('pdf','png','jpg','jpeg','webp','txt','csv','docx','xlsx','pptx','zip'):
            raise ValidationError('Dozvoljeni su dokumenti, slike i ZIP arhive.')
        encoded=request.data.get('content','')
        if not isinstance(encoded,str) or len(encoded)>7_000_000: raise ValidationError('Prilog može imati do 5 MB.')
        try: content=base64.b64decode(encoded,validate=True)
        except ValueError: raise ValidationError('Neispravan prilog.')
        if not content or len(content)>5*1024*1024: raise ValidationError('Prilog mora imati 1 bajt – 5 MB.')
        a=WorkAttachment.objects.create(task=t,uploader=request.user,name=name,content=content,size=len(content))
        notify_task(t,request.user,'dodan prilog u „'+t.title+'“',[t.creator_id,t.assignee_id])
    return Response({'id':str(a.pk),'name':a.name,'size':a.size},status=201)

@api_view(['GET','DELETE'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def attachment(request,pk):
    a=get_object_or_404(WorkAttachment,pk=pk,task__in=visible_tasks(request.user).filter(deleted_at__isnull=True))
    if request.method=='DELETE':
        require_editor(a.task.project,request.user)
        a.delete()
        return Response({'ok':True})
    response=HttpResponse(bytes(a.content),content_type='application/octet-stream')
    response['Content-Disposition']=content_disposition_header(True,a.name)
    response['X-Content-Type-Options']='nosniff'
    response['Cache-Control']='private, no-store'
    return response

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def read_notifications(request):
    ids=request.data.get('ids',[])
    if not isinstance(ids,list) or len(ids)>100 or any(not isinstance(i,int) for i in ids): raise ValidationError('Neispravne obavijesti.')
    WorkNotification.objects.filter(recipient=request.user,pk__in=ids).update(read=True)
    return Response({'ok':True})
