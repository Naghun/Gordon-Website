"""Private project workspaces. Session auth and CSRF apply to every write."""
import base64
import io
import json
from datetime import date
from uuid import UUID
from PIL import Image
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.core.cache import cache
from django.db import transaction
from django.db.models import Q
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.utils import timezone
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_POST
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.shortcuts import get_object_or_404

from .models import WorkProject, WorkTask, WorkNotification, work_columns

ADMIN_TEAM_ID = UUID('e6f3350e-d093-48ae-b583-50810d328917')

def sync_admin_team(user):
    """Existing site administrators share one team board; personal projects stay private."""
    if not user.is_active or not (user.is_staff or user.is_superuser): return
    admins = list(get_user_model().objects.filter(is_active=True).filter(Q(is_staff=True)|Q(is_superuser=True)).order_by('pk'))
    with transaction.atomic():
        p, _ = WorkProject.all_objects.get_or_create(pk=ADMIN_TEAM_ID, defaults={'name':'Gordon tim','owner':admins[0],'team_visible':True})
        if not p.deleted_at and p.team_visible: p.members.add(*admins)
        for shared in WorkProject.objects.filter(team_visible=True):
            shared.members.add(*admins)

def open_work(request):
    from django.conf import settings
    from django.shortcuts import redirect
    destination = f'http://{request.get_host().split(":")[0]}:5173/dashboard/work' if settings.DEBUG else '/dashboard/work'
    return redirect(destination)

def is_work_admin(user):
    return user.is_active and (user.is_staff or user.is_superuser)

def require_editor(project, user):
    if project and not is_work_admin(user) and project.owner_id != user.pk and project.roles.get(str(user.pk)) == 'viewer':
        raise PermissionDenied('Imate pristup samo za pregled ovog projekta.')

def notify_task(t, actor, message, recipients):
    allowed=set(t.project.members.filter(is_active=True).values_list('pk',flat=True)) if t.project else {t.creator_id}
    for uid in set(recipients) & allowed - {actor.pk}:
        WorkNotification.objects.create(recipient_id=uid,task=t,text=f'{person(actor)["name"]}: {message}'[:300])

def person(user):
    return {'id':user.pk,'name':user.get_full_name() or user.username,'username':user.username,'isAdmin':is_work_admin(user)}

@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([])
def session(request):
    user=request._request.user
    return Response({'user':person(user) if user.is_authenticated else None,'csrf':get_token(request._request)})

@csrf_protect
@require_POST
def sign_in(request):
    try:
        data=json.loads(request.body)
        if not isinstance(data,dict): raise ValueError()
    except (ValueError,UnicodeDecodeError): return JsonResponse({'detail':'Neispravan zahtjev.'},status=400)
    key='work-login:'+request.META.get('REMOTE_ADDR','unknown')
    if cache.get(key,0)>=8: return JsonResponse({'detail':'Previše pokušaja. Pokušajte za pet minuta.'},status=429)
    user=authenticate(request,username=str(data.get('username',''))[:150],password=data.get('password',''))
    if user is None:
        cache.set(key,cache.get(key,0)+1,300)
        return JsonResponse({'detail':'Korisničko ime ili lozinka nisu ispravni.'},status=400)
    cache.delete(key)
    login(request,user)
    return JsonResponse({'user':person(user),'csrf':get_token(request)})

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def sign_out(request):
    logout(request._request)
    return Response({'user':None,'csrf':get_token(request._request)})

def visible_tasks(user):
    return WorkTask.objects.filter(Q(project__members=user,project__deleted_at__isnull=True)|Q(project__isnull=True,creator=user)).distinct()

def project_data(p):
    return {'id':str(p.pk),'name':p.name,'owner':p.owner_id,'members':[person(u) for u in p.members.filter(is_active=True)],'columns':p.columns,'background':p.background,'roles':p.roles,'teamVisible':p.team_visible}

def task_data(t):
    return {'id':str(t.pk),'project':str(t.project_id) if t.project_id else None,'title':t.title,'description':t.description,
      'status':t.status,'person':t.assignee_id,'priority':t.priority,'label':t.label,'due':t.due.isoformat() if t.due else '',
      'checklist':t.checklist,'comments':t.comments,'activity':t.activity,'deleted':bool(t.deleted_at),'archived':t.archived,
      'revision':t.revision,'creator':t.creator_id,'appearance':t.appearance,'parent':str(t.parent_id) if t.parent_id else None,
      'attachments':[{'id':str(a.pk),'name':a.name,'size':a.size} for a in t.attachments.defer('content').all()]}

def sync_completion(t,actor):
    if t.deleted_at or t.archived: return None
    children=t.subtasks.filter(deleted_at__isnull=True,archived=False)
    if not t.checklist and not children.exists(): return None
    complete=all(c['done'] for c in t.checklist) and not children.exclude(status='done').exists()
    next_status='done' if complete else (t.project.columns[0]['id'] if t.project else 'inbox')
    if complete and t.status!='done' or not complete and t.status=='done':
        t.status=next_status;t.revision+=1
        t.activity=[{'text':'Završeni svi podzadaci i koraci' if complete else 'Ponovo otvoreno zbog podzadatka','author':person(actor),'time':timezone.now().isoformat()}]+t.activity[:99]
        t.save();notify_task(t,actor,'ažuriran napredak zadatka „'+t.title+'“',[t.creator_id,t.assignee_id])
        return t
    return None

@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def state(request):
    sync_admin_team(request.user)
    return Response({'projects':[project_data(p) for p in WorkProject.objects.filter(members=request.user).order_by('created_at')],
      'tasks':[task_data(t) for t in visible_tasks(request.user).order_by('created_at')],
      'notifications':[{'id':n.pk,'task':str(n.task_id),'text':n.text,'read':n.read,'time':n.created_at.isoformat()} for n in WorkNotification.objects.filter(recipient=request.user,task__in=visible_tasks(request.user).filter(deleted_at__isnull=True)).order_by('-created_at')[:100]]})

def text(value, limit, required=False):
    if not isinstance(value,str) or len(value)>limit or (required and not value.strip()): raise ValidationError('Provjerite tekst i dozvoljenu dužinu.')
    return value.strip()

def validate_background(value):
    presets={'aurora','midnight','ocean','sunset','forest','plum','copper','lagoon','cosmos','photo-mountain','photo-lake','photo-forest'}
    if isinstance(value,str) and value in presets: return value
    if not isinstance(value,str) or len(value)>2000000 or not value.startswith('data:image/jpeg;base64,'): raise ValidationError('Pozadina mora biti slika do 1,5 MB.')
    try:
        content=base64.b64decode(value.split(',',1)[1],validate=True)
        with Image.open(io.BytesIO(content)) as img:
            if img.format!='JPEG' or img.width*img.height>5000000: raise ValueError()
            img.verify()
    except Exception: raise ValidationError('Slika pozadine nije ispravna.')
    return value

def create_team_project(name,user,shared=True):
    if not isinstance(shared,bool): raise ValidationError('Odaberite vidljivost projekta.')
    p=WorkProject.objects.create(name=name,owner=user,team_visible=shared)
    p.members.add(user)
    if shared:
        p.members.add(*get_user_model().objects.filter(is_active=True).filter(Q(is_staff=True)|Q(is_superuser=True)))
    return p

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def projects(request):
    p=create_team_project(text(request.data.get('name',''),100,True),request.user,request.data.get('teamVisible',True))
    return Response(project_data(p),status=201)

@api_view(['PATCH','POST','DELETE'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def project(request,pk):
    with transaction.atomic():
        p=get_object_or_404(WorkProject.objects.select_for_update(),pk=pk,members=request.user)
        if p.owner_id!=request.user.pk and not is_work_admin(request.user): raise PermissionDenied('Samo vlasnik uređuje projekat i članove.')
        if request.method=='DELETE':
            p.deleted_at=timezone.now()
            p.save(update_fields=['deleted_at'])
            return Response({'ok':True,'deleted':str(p.pk)})
        if request.method=='POST':
            username=text(request.data.get('username',''),150,True)
            u=get_user_model().objects.filter(username=username,is_active=True).first()
            if not u: raise ValidationError('Aktivan korisnik s tim korisničkim imenom nije pronađen.')
            p.members.add(u)
            role=request.data.get('role','editor')
            if role not in ('editor','viewer'): raise ValidationError('Nepoznata uloga.')
            if u.pk!=p.owner_id: p.roles[str(u.pk)]=role
            p.save()
        else:
            if request.data.get('clear_lists') is True:
                from django.db.models import F
                p.tasks.filter(deleted_at__isnull=True).update(deleted_at=timezone.now(),revision=F('revision')+1)
            if 'teamVisible' in request.data:
                if p.owner_id!=request.user.pk: raise PermissionDenied('Samo vlasnik mijenja vidljivost projekta.')
                shared=request.data['teamVisible']
                if not isinstance(shared,bool): raise ValidationError('Odaberite vidljivost projekta.')
                p.team_visible=shared
                if shared:
                    p.members.add(*get_user_model().objects.filter(is_active=True).filter(Q(is_staff=True)|Q(is_superuser=True)))
                else:
                    if p.owner_id!=request.user.pk: raise PermissionDenied('Samo vlasnik može sakriti projekat od tima.')
                    p.members.set([p.owner])
                    from django.db.models import F
                    p.tasks.exclude(assignee=p.owner).filter(assignee__isnull=False).update(assignee=None,revision=F('revision')+1)
            if 'name' in request.data: p.name=text(request.data['name'],100,True)
            if 'background' in request.data: p.background=validate_background(request.data['background'])
            if request.data.get('reset_display') is True:
                defaults={c['id']:c['color'] for c in work_columns()}
                p.background='aurora'
                p.columns=[{'id':c['id'],'name':c['name'],'color':defaults.get(c['id'],'#aa8cff'),**({key:c[key] for key in ('rowBreak','lane') if key in c})} for c in p.columns]
                from django.db.models import F
                p.tasks.update(appearance={},revision=F('revision')+1)
            if 'remove_column' in request.data:
                cid=text(request.data['remove_column'],50,True)
                remaining=[c for c in p.columns if c['id']!=cid]
                if len(remaining)==len(p.columns) or not remaining: raise ValidationError('Projekat mora imati barem jednu listu.')
                target=request.data.get('move_to',remaining[0]['id'])
                if target not in [c['id'] for c in remaining]: raise ValidationError('Odaberite preostalu listu za zadatke.')
                from django.db.models import F
                p.tasks.filter(status=cid).update(status=target,revision=F('revision')+1)
                p.columns=remaining
            if 'columns' in request.data:
                cols=request.data['columns']
                if not isinstance(cols,list) or not 1<=len(cols)<=12: raise ValidationError('Dozvoljeno je 1–12 lista.')
                checked=[]
                for c in cols:
                    if not isinstance(c,dict): raise ValidationError('Neispravna lista.')
                    cid=text(c.get('id',''),50,True)
                    color=c.get('color','')
                    if cid in ('done','inbox') or not isinstance(color,str) or not __import__('re').fullmatch(r'#[0-9a-fA-F]{6}',color): raise ValidationError('Neispravna boja ili oznaka liste.')
                    checked.append({'id':cid,'name':text(c.get('name',''),50,True),'color':color})
                    if 'rowBreak' in c:
                        if not isinstance(c['rowBreak'],bool): raise ValidationError('Neispravan raspored liste.')
                        checked[-1]['rowBreak']=c['rowBreak']
                    if 'lane' in c:
                        if type(c['lane']) is not int or not 0 <= c['lane'] <= 11: raise ValidationError('Neispravna kolona liste.')
                        checked[-1]['lane']=c['lane']
                    for key in ('fill','card','border'):
                        val=c.get(key,'')
                        if val and (not isinstance(val,str) or not __import__('re').fullmatch(r'#[0-9a-fA-F]{6}',val)): raise ValidationError('Neispravna boja.')
                        checked[-1][key]=val
                ids=[c['id'] for c in checked]
                if len(ids)!=len(set(ids)) or p.tasks.exclude(status__in=ids+['done']).exists(): raise ValidationError('Liste sa zadacima se ne mogu ukloniti.')
                p.columns=checked
            p.save()
    return Response(project_data(p))

@api_view(['POST','PATCH','DELETE'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def task(request,pk=None):
    if (pk is None and request.method!='POST') or (pk is not None and request.method=='POST'):
        return Response({'detail':'Metoda nije dozvoljena.'},status=405)
    with transaction.atomic():
        if pk:
            t=get_object_or_404(visible_tasks(request.user).select_for_update(),pk=pk)
            require_editor(t.project,request.user)
            if request.data.get('revision')!=t.revision:
                return Response({'detail':'Zadatak je promijenio drugi član. Zatvorite detalje i otvorite osvježeni zadatak.'},status=409)
        else:
            t=WorkTask(creator=request.user)
        data=request.data
        old_assignee=t.assignee_id
        old_status=t.status
        old_checks=t.checklist
        old_parent=t.parent_id
        if request.method=='DELETE':
            t.deleted_at=timezone.now()
            action='Premješteno u korpu'
        else:
            if 'project' in data:
                if data['project']:
                    try: UUID(str(data['project']))
                    except (ValueError,TypeError): raise ValidationError('Neispravan projekat.')
                t.project=get_object_or_404(WorkProject,pk=data['project'],members=request.user) if data['project'] else None
                require_editor(t.project,request.user)
                if pk and t.subtasks.exclude(project=t.project).exists(): raise ValidationError('Prvo premjestite ili odvojite podzadatke.')
                # A shared card may move to another shared project, never into somebody else's private inbox.
                if t.project is None and t.creator_id!=request.user.pk: raise ValidationError('Samo autor može premjestiti zadatak u svoj Inbox.')
            if 'parent' in data:
                parent_id=data['parent']
                if parent_id:
                    try: UUID(str(parent_id))
                    except (ValueError,TypeError): raise ValidationError('Neispravan glavni zadatak.')
                    parent=get_object_or_404(visible_tasks(request.user),pk=parent_id,project=t.project,deleted_at__isnull=True)
                    if parent.pk==t.pk or parent.parent_id or (pk and t.subtasks.exists()): raise ValidationError('Podzadatak pripada jednom glavnom zadatku.')
                    t.parent=parent
                else: t.parent=None
            if t.parent_id and t.parent.project_id!=t.project_id: raise ValidationError('Podzadatak i glavni zadatak moraju biti u istom projektu.')
            for field,limit in [('title',180),('description',20000),('label',40)]:
                if field in data: setattr(t,field,text(data[field],limit,field=='title'))
            if not t.title: raise ValidationError('Unesite naziv zadatka.')
            if 'appearance' in data:
                appearance=data['appearance']
                if not isinstance(appearance,dict) or set(appearance)-{'fill','border'}: raise ValidationError('Neispravne boje kartice.')
                for value in appearance.values():
                    if not isinstance(value,str) or not __import__('re').fullmatch(r'#[0-9a-fA-F]{6}',value): raise ValidationError('Neispravna boja kartice.')
                t.appearance=appearance
            if 'status' in data: t.status=text(data['status'],50,True)
            allowed=[c['id'] for c in t.project.columns]+['done'] if t.project else ['inbox','done']
            if t.status not in allowed: raise ValidationError('Izaberite listu koja postoji u projektu.')
            if 'person' in data:
                assignee=data['person']
                if assignee and (not isinstance(assignee,int) or isinstance(assignee,bool)): raise ValidationError('Neispravan član.')
                allowed_users=t.project.members.filter(is_active=True) if t.project else get_user_model().objects.filter(pk=request.user.pk)
                t.assignee=get_object_or_404(allowed_users,pk=assignee) if assignee else None
            elif t.assignee_id and t.project and not t.project.members.filter(pk=t.assignee_id).exists(): t.assignee=None
            if 'priority' in data:
                if data['priority'] not in ('Nizak','Srednji','Visok'): raise ValidationError('Neispravan prioritet.')
                t.priority=data['priority']
            if 'due' in data:
                try: t.due=date.fromisoformat(data['due']) if data['due'] else None
                except (ValueError,TypeError): raise ValidationError('Neispravan datum.')
            if 'checklist' in data:
                checks=data['checklist']
                if not isinstance(checks,list) or len(checks)>100: raise ValidationError('Dozvoljeno je do 100 koraka.')
                t.checklist=[{'id':text(c.get('id',''),80,True),'title':text(c.get('title',''),300,True),'done':c.get('done') is True} for c in checks if isinstance(c,dict)]
            if 'comment' in data and text(data['comment'],5000):
                t.comments=(t.comments+[{'id':str(__import__('uuid').uuid4()),'text':text(data['comment'],5000,True),'author':person(request.user),'time':timezone.now().isoformat()}])[-200:]
            if 'deleted' in data and data['deleted'] is False: t.deleted_at=None
            if 'archived' in data and isinstance(data['archived'],bool): t.archived=data['archived']
            action='Zadatak ažuriran' if pk else 'Zadatak kreiran'
        t.activity=([{'text':action,'author':person(request.user),'time':timezone.now().isoformat()}]+t.activity)[:100]
        if pk: t.revision+=1
        t.save()
        related=[]
        if old_checks!=t.checklist: sync_completion(t,request.user)
        for parent_id in {old_parent,t.parent_id}-{None}:
            parent=WorkTask.objects.select_for_update().get(pk=parent_id)
            updated=sync_completion(parent,request.user)
            if updated: related.append(task_data(updated))
        if t.assignee_id and t.assignee_id!=old_assignee: notify_task(t,request.user,'dodijeljen ti je zadatak „'+t.title+'“',[t.assignee_id])
        if old_status!=t.status: notify_task(t,request.user,'promijenjen status zadatka „'+t.title+'“',[t.assignee_id,t.creator_id])
        if request.method!='DELETE' and data.get('comment'):
            import re
            names=re.findall(r'(?<!\w)@([\w.@+-]+)',data['comment'])
            ids=get_user_model().objects.filter(username__in=names).values_list('pk',flat=True)
            notify_task(t,request.user,'spomenut/a si u „'+t.title+'“',ids)
    return Response({**task_data(t),'related':related},status=200 if pk else 201)


@api_view(['GET','POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def chat(request,pk=None):
    from .work_chat import room
    return room(request,pk)
