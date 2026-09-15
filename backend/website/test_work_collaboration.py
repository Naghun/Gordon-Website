import base64
import io
import json
from uuid import uuid4
from unittest.mock import patch
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from .models import WorkProject, WorkTask, WorkAttachment, WorkNotification, WorkImport
from .work_import import analyze_with_openai

@override_settings(PASSWORD_HASHERS=['django.contrib.auth.hashers.MD5PasswordHasher'])
class CollaborationTests(TestCase):
    def setUp(self):
        U=get_user_model()
        self.owner=U.objects.create_user('owner')
        self.editor=U.objects.create_user('editor')
        self.outside=U.objects.create_user('outside')
        self.project=WorkProject.objects.create(name='Shared',owner=self.owner)
        self.project.members.add(self.owner,self.editor)
        self.task=WorkTask.objects.create(project=self.project,creator=self.owner,title='Main')
        self.client=APIClient();self.client.force_login(self.owner)
    def plan(self):
        return {'projects':[{'name':'Imported','tasks':[{'title':'Main','description':'Context','due':'','subtasks':[{'title':'Child','description':'','due':'2026-10-01'}]}]}]}

    def test_new_projects_shared_and_hide_revokes_team_access(self):
        self.editor.is_staff=True;self.editor.save()
        response=self.client.post('/api/work/projects/',{'name':'Open project'},format='json')
        self.assertEqual(response.status_code,201)
        p=WorkProject.objects.get(pk=response.json()['id'])
        self.assertTrue(p.team_visible);self.assertTrue(p.members.filter(pk=self.editor.pk).exists())
        late=get_user_model().objects.create_user('new-admin',is_staff=True)
        self.client.force_login(late)
        self.assertIn(str(p.pk),[row['id'] for row in self.client.get('/api/work/state/').json()['projects']])
        self.assertEqual(self.client.patch(f'/api/work/projects/{p.pk}/',{'teamVisible':False},format='json').status_code,403)
        self.assertEqual(self.client.patch(f'/api/work/projects/{p.pk}/',{'teamVisible':True},format='json').status_code,403)
        self.client.force_login(self.owner)
        assigned=WorkTask.objects.create(project=p,creator=self.owner,assignee=late,title='Assigned')
        self.assertEqual(self.client.patch(f'/api/work/projects/{p.pk}/',{'teamVisible':False},format='json').status_code,200)
        assigned.refresh_from_db();self.assertIsNone(assigned.assignee_id)
        self.client.force_login(late)
        self.assertNotIn(str(p.pk),[row['id'] for row in self.client.get('/api/work/state/').json()['projects']])
        self.assertEqual(self.client.get(f'/api/work/projects/{p.pk}/chat/').status_code,404)
        self.client.force_login(self.owner)
        private=self.client.post('/api/work/projects/',{'name':'Hidden','teamVisible':False},format='json')
        self.assertEqual(len(private.json()['members']),1)
        self.client.patch(f'/api/work/projects/{p.pk}/',{'teamVisible':True},format='json')
        self.assertTrue(p.members.filter(pk=late.pk).exists())

    def test_clear_lists_preserves_project_and_other_projects(self):
        url=f'/api/work/projects/{self.project.pk}/'
        other=WorkProject.objects.create(name='Other',owner=self.owner)
        other_task=WorkTask.objects.create(project=other,creator=self.owner,title='Keep')
        columns=self.project.columns
        self.client.force_login(self.editor)
        self.assertEqual(self.client.patch(url,{'clear_lists':True},format='json').status_code,403)
        self.client.force_login(self.owner)
        self.assertEqual(self.client.patch(url,{'clear_lists':True},format='json').status_code,200)
        self.project.refresh_from_db();self.task.refresh_from_db();other_task.refresh_from_db()
        self.assertIsNone(self.project.deleted_at)
        self.assertEqual(self.project.columns,columns)
        self.assertIsNotNone(self.task.deleted_at)
        self.assertIsNone(other_task.deleted_at)
        response=self.client.patch(f'/api/work/tasks/{self.task.pk}/',{'revision':self.task.revision,'deleted':False},format='json')
        self.assertEqual(response.status_code,200)
        self.task.refresh_from_db();self.assertIsNone(self.task.deleted_at)

    def test_delete_project_removes_it_and_content_from_work(self):
        url=f'/api/work/projects/{self.project.pk}/'
        self.client.force_login(self.editor)
        self.assertEqual(self.client.delete(url).status_code,403)
        self.client.force_login(self.owner)
        self.assertEqual(self.client.patch(url,{'name':'Renamed'},format='json').status_code,200)
        self.assertEqual(self.client.delete(url).status_code,200)
        self.assertFalse(WorkProject.objects.filter(pk=self.project.pk).exists())
        self.client.force_login(self.editor)
        state=self.client.get('/api/work/state/').json()
        self.assertEqual(state['projects'],[]);self.assertEqual(state['tasks'],[])
        self.assertEqual(self.client.get(url+'chat/').status_code,404)
        self.assertEqual(self.client.patch(f'/api/work/tasks/{self.task.pk}/',{'revision':1,'title':'No'},format='json').status_code,404)
        self.assertEqual(self.client.patch(url,{'name':'No'},format='json').status_code,404)

    def test_default_team_does_not_return_after_deletion(self):
        from .work_api import ADMIN_TEAM_ID
        self.owner.is_staff=True;self.owner.save()
        self.client.get('/api/work/state/')
        self.assertEqual(self.client.delete(f'/api/work/projects/{ADMIN_TEAM_ID}/').status_code,200)
        ids=[p['id'] for p in self.client.get('/api/work/state/').json()['projects']]
        self.assertNotIn(str(ADMIN_TEAM_ID),ids)

    def test_general_chat_mentions_are_shared_and_read_per_recipient(self):
        url='/api/work/chat/'
        r=self.client.post(url,{'text':'@editor @outside @owner provjerite plan'},format='json')
        self.assertEqual(r.status_code,201)
        mid=r.json()['id']
        self.assertEqual({m['id'] for m in r.json()['mentions']},{self.editor.pk,self.outside.pk})
        self.assertEqual(self.client.get('/api/work/chat/summary/').json()['total'],0)
        self.client.force_login(self.editor)
        self.assertEqual(self.client.get(url).json()['messages'][0]['text'],'@editor @outside @owner provjerite plan')
        self.assertEqual(self.client.get('/api/work/chat/summary/').json(),{'total':1,'rooms':{'general':1}})
        self.client.get(url)  # Polling alone must not clear the badge.
        self.assertEqual(self.client.get('/api/work/chat/summary/').json()['total'],1)
        self.assertEqual(self.client.post('/api/work/chat/read/',{'messages':[mid]},format='json').status_code,200)
        self.assertEqual(self.client.get('/api/work/chat/summary/').json()['total'],0)
        self.client.force_login(self.outside)
        self.assertEqual(self.client.get('/api/work/chat/summary/').json()['total'],1)
        self.client.logout()
        self.assertEqual(self.client.get(url).status_code,403)
        self.assertEqual(self.client.get('/api/work/chat/summary/').status_code,403)

    def test_project_mentions_do_not_notify_outsiders_or_other_rooms(self):
        url=f'/api/work/projects/{self.project.pk}/chat/'
        r=self.client.post(url,{'text':'@editor @editor @outside'},format='json')
        self.assertEqual(len(r.json()['mentions']),1)
        general=self.client.post('/api/work/chat/',{'text':'@editor opci'},format='json')
        self.client.force_login(self.editor)
        self.assertEqual(self.client.get('/api/work/chat/summary/').json()['total'],2)
        self.client.post('/api/work/chat/read/',{'messages':[general.json()['id']]},format='json')
        self.assertEqual(self.client.get('/api/work/chat/summary/').json()['rooms'],{str(self.project.pk):1})
        self.project.members.remove(self.editor)
        self.assertEqual(self.client.get('/api/work/chat/summary/').json()['total'],0)
        self.client.force_login(self.outside)
        self.assertEqual(self.client.get('/api/work/chat/summary/').json()['total'],0)

    def test_mentions_match_complete_usernames(self):
        short=get_user_model().objects.create_user('ann')
        full=get_user_model().objects.create_user('ann.smith')
        r=self.client.post('/api/work/chat/',{'text':'@ann.smith, molim. email@ann nije tag.'},format='json')
        self.assertEqual([m['id'] for m in r.json()['mentions']],[full.pk])
        self.assertEqual(self.client.post('/api/work/chat/read/',{'messages':['bad']},format='json').status_code,400)

    def test_chat_persists_for_members_and_blocks_outsiders(self):
        url=f'/api/work/projects/{self.project.pk}/chat/'
        self.assertEqual(self.client.post(url,{'text':'Prva poruka'},format='json').status_code,201)
        self.client.force_login(self.editor)
        self.assertEqual(self.client.get(url).json()['messages'][0]['text'],'Prva poruka')
        self.assertEqual(self.client.post(url,{'text':'Odgovor'},format='json').status_code,201)
        page=self.client.get(url+'?limit=1').json()
        self.assertTrue(page['more']);self.assertEqual(page['messages'][0]['text'],'Odgovor')
        self.assertEqual(len(self.client.get(url).json()['messages']),2)
        self.assertEqual(self.client.post(url,{'text':' '},format='json').status_code,400)
        self.assertEqual(self.client.post(url,{'text':'x'*4001},format='json').status_code,400)
        self.client.force_login(self.outside)
        self.assertEqual(self.client.get(url).status_code,404)
        self.assertEqual(self.client.post(url,{'text':'Denied'},format='json').status_code,404)
        self.client.logout();self.assertEqual(self.client.get(url).status_code,403)

    def test_site_admin_has_owner_controls_despite_viewer_role(self):
        self.editor.is_staff=True;self.editor.save()
        self.project.roles={str(self.editor.pk):'viewer'};self.project.save()
        self.client.force_login(self.editor)
        self.assertTrue(self.client.get('/api/work/session/').json()['user']['isAdmin'])
        columns=self.project.columns+[{'id':'new-list','name':'Nova lista','color':'#abcdef'}]
        url=f'/api/work/projects/{self.project.pk}/'
        self.assertEqual(self.client.patch(url,{'columns':columns,'background':'ocean'},format='json').status_code,200)
        self.assertEqual(self.client.patch(f'/api/work/tasks/{self.task.pk}/',{'revision':1,'title':'Updated'},format='json').status_code,200)
        self.assertEqual(self.client.post(url,{'username':self.outside.username},format='json').status_code,200)
        self.assertEqual(self.client.delete(f'{url}members/{self.outside.pk}/').status_code,200)
        self.assertEqual(self.client.patch(url,{'remove_column':'new-list'},format='json').status_code,200)
        private=WorkProject.objects.create(name='Private',owner=self.outside)
        private.members.add(self.outside)
        self.assertEqual(self.client.patch(f'/api/work/projects/{private.pk}/',{'name':'Denied'},format='json').status_code,404)

    def test_regular_editor_cannot_manage_project(self):
        self.client.force_login(self.editor)
        self.assertEqual(self.client.patch(f'/api/work/projects/{self.project.pk}/',{'name':'Denied'},format='json').status_code,403)

    def test_viewer_cannot_edit_upload_or_import(self):
        self.project.roles={str(self.editor.pk):'viewer'};self.project.save()
        self.client.force_login(self.editor)
        self.assertEqual(self.client.get('/api/work/state/').status_code,200)
        self.assertEqual(self.client.patch(f'/api/work/tasks/{self.task.pk}/',{'title':'Denied','revision':1},format='json').status_code,403)
        self.assertEqual(self.client.post(f'/api/work/tasks/{self.task.pk}/attachments/',{},format='json').status_code,403)
        plan=self.plan();plan['projects'][0]['target']=str(self.project.pk)
        self.assertEqual(self.client.post('/api/work/import/commit/',{'plan':plan,'token':str(uuid4())},format='json').status_code,403)
        self.assertEqual(WorkImport.objects.count(),0)

    def test_remove_member_revokes_task_and_attachment_access(self):
        a=WorkAttachment.objects.create(task=self.task,uploader=self.owner,name='test.txt',content=b'private',size=7)
        self.assertEqual(self.client.delete(f'/api/work/projects/{self.project.pk}/members/{self.editor.pk}/').status_code,200)
        self.client.force_login(self.editor)
        self.assertEqual(self.client.get(f'/api/work/attachments/{a.pk}/').status_code,404)
        self.assertEqual(self.client.get('/api/work/state/').json()['tasks'],[])

    def test_mentions_and_assignment_notify_only_authorized_recipient(self):
        body={'revision':1,'person':self.editor.pk,'comment':'@editor molim provjeri; @outside nije član.'}
        self.assertEqual(self.client.patch(f'/api/work/tasks/{self.task.pk}/',body,format='json').status_code,200)
        self.assertEqual(set(WorkNotification.objects.values_list('recipient_id',flat=True)),{self.editor.pk})
        self.client.force_login(self.editor)
        notes=self.client.get('/api/work/state/').json()['notifications']
        self.assertEqual(len(notes),2)
        self.client.post('/api/work/notifications/read/',{'ids':[n['id'] for n in notes]},format='json')
        self.assertFalse(WorkNotification.objects.filter(read=False).exists())

    def test_private_attachment_is_authenticated_download(self):
        payload={'name':'brief.txt','content':base64.b64encode(b'private brief').decode()}
        r=self.client.post(f'/api/work/tasks/{self.task.pk}/attachments/',payload,format='json')
        self.assertEqual(r.status_code,201)
        path=f'/api/work/attachments/{r.json()["id"]}/'
        r=self.client.get(path)
        self.assertEqual(r.content,b'private brief')
        self.assertTrue(r['Content-Disposition'].startswith('attachment;'))
        self.assertEqual(r['Cache-Control'],'private, no-store')
        self.client.force_login(self.outside)
        self.assertEqual(self.client.get(path).status_code,404)
        self.client.logout();self.assertEqual(self.client.get(path).status_code,403)

    def test_subtasks_are_same_project_and_no_cycles(self):
        child=WorkTask.objects.create(project=self.project,creator=self.owner,title='Child',parent=self.task)
        r=self.client.patch(f'/api/work/tasks/{self.task.pk}/',{'revision':1,'parent':str(child.pk)},format='json')
        self.assertEqual(r.status_code,400)
        self.assertEqual(self.client.patch(f'/api/work/tasks/{child.pk}/',{'revision':1,'project':None},format='json').status_code,400)

    def test_import_atomic_idempotent_and_creates_real_subtasks(self):
        body={'plan':self.plan(),'token':str(uuid4())}
        r=self.client.post('/api/work/import/commit/',body,format='json');self.assertEqual(r.status_code,201)
        self.assertEqual(r.json()['count'],2)
        r=self.client.post('/api/work/import/commit/',body,format='json');self.assertTrue(r.json()['duplicate'])
        imported=WorkProject.objects.get(name='Imported')
        self.assertEqual(imported.tasks.count(),2)
        child=imported.tasks.get(title='Child');self.assertEqual(child.parent.title,'Main')
        self.assertEqual(list(imported.members.all()),[self.owner])

    def test_import_invalid_target_rolls_back_every_project(self):
        plan=self.plan();plan['projects'].append({**plan['projects'][0],'target':str(uuid4())})
        before=WorkProject.objects.count()
        self.assertEqual(self.client.post('/api/work/import/commit/',{'plan':plan,'token':str(uuid4())},format='json').status_code,404)
        self.assertEqual(WorkProject.objects.count(),before)
        self.assertEqual(WorkImport.objects.count(),0)

    def test_import_rejects_bad_dates_and_large_plans(self):
        plan=self.plan();plan['projects'][0]['tasks'][0]['due']='not-date'
        self.assertEqual(self.client.post('/api/work/import/commit/',{'plan':plan,'token':str(uuid4())},format='json').status_code,400)
        plan=self.plan();plan['projects'][0]['tasks']*=101
        self.assertEqual(self.client.post('/api/work/import/commit/',{'plan':plan,'token':str(uuid4())},format='json').status_code,400)

    @patch.dict('os.environ',{'OPENAI_API_KEY':'unit-test-placeholder','OPENAI_WORK_MODEL':'gpt-4.1-mini'})
    @patch('website.work_import.urlopen')
    def test_ai_structured_response_has_no_write_and_no_existing_data(self,open_mock):
        open_mock.return_value=io.BytesIO(json.dumps({'status':'completed','output':[{'content':[{'type':'output_text','text':json.dumps(self.plan())}]}]}).encode())
        result=analyze_with_openai('Only this source','Only this rule')
        self.assertEqual(result['projects'][0]['name'],'Imported')
        req=open_mock.call_args.args[0];body=json.loads(req.data)
        self.assertFalse(body['store']);self.assertEqual(body['input'],'Only this source')
        self.assertEqual(body['text']['format']['type'],'json_schema')
        self.assertNotIn('private brief',req.data.decode())
        self.assertEqual(WorkProject.objects.count(),1)

    def test_colors_round_trip(self):
        cols=self.project.columns
        cols[0].update(fill='#123456',border='#ffbb33',card='#abcdef')
        r=self.client.patch(f'/api/work/projects/{self.project.pk}/',{'columns':cols},format='json')
        self.assertEqual(r.status_code,200);self.assertEqual(r.json()['columns'][0]['card'],'#abcdef')

    def test_children_and_checklist_complete_parent_and_reopen(self):
        self.task.checklist=[{'id':'check','title':'Finalna provjera','done':False}];self.task.save()
        child=WorkTask.objects.create(project=self.project,creator=self.owner,parent=self.task,title='Child')
        r=self.client.patch(f'/api/work/tasks/{child.pk}/',{'revision':1,'status':'done'},format='json')
        self.assertEqual(r.status_code,200);self.task.refresh_from_db();self.assertNotEqual(self.task.status,'done')
        r=self.client.patch(f'/api/work/tasks/{self.task.pk}/',{'revision':self.task.revision,'checklist':[{'id':'check','title':'Finalna provjera','done':True}]},format='json')
        self.assertEqual(r.json()['status'],'done')
        child.refresh_from_db()
        r=self.client.patch(f'/api/work/tasks/{child.pk}/',{'revision':child.revision,'status':'todo'},format='json')
        self.assertEqual(r.status_code,200);self.task.refresh_from_db();self.assertNotEqual(self.task.status,'done')
        self.assertEqual(r.json()['related'][0]['id'],str(self.task.pk))

    def test_individual_colors_reorder_remove_and_reset(self):
        other=WorkTask.objects.create(project=self.project,creator=self.owner,title='Other',status='doing')
        response=self.client.patch(f'/api/work/tasks/{self.task.pk}/',{'revision':1,'appearance':{'fill':'#ffeecc','border':'#123456'}},format='json')
        self.assertEqual(response.status_code,200)
        other.refresh_from_db();self.assertEqual(other.appearance,{})
        cols=list(reversed(self.project.columns))
        self.assertEqual(self.client.patch(f'/api/work/projects/{self.project.pk}/',{'columns':cols},format='json').status_code,200)
        r=self.client.patch(f'/api/work/projects/{self.project.pk}/',{'remove_column':'doing','move_to':'todo'},format='json')
        self.assertEqual(r.status_code,200)
        other.refresh_from_db();self.assertEqual(other.status,'todo')
        self.assertEqual(WorkTask.objects.count(),2)
        expected=[c['id'] for c in r.json()['columns']]
        r=self.client.patch(f'/api/work/projects/{self.project.pk}/',{'reset_display':True},format='json')
        self.assertEqual(r.status_code,200);self.assertEqual([c['id'] for c in r.json()['columns']],expected)
        self.task.refresh_from_db();self.assertEqual(self.task.appearance,{})
        self.assertEqual(r.json()['background'],'aurora')

    def test_cannot_remove_last_column_or_modify_as_viewer(self):
        self.project.columns=[{'id':'todo','name':'Last','color':'#aa8cff'}];self.project.save()
        url=f'/api/work/projects/{self.project.pk}/'
        self.assertEqual(self.client.patch(url,{'remove_column':'todo'},format='json').status_code,400)
        self.client.force_login(self.editor)
        self.assertEqual(self.client.patch(url,{'reset_display':True},format='json').status_code,403)

    @override_settings(DEBUG=True,ALLOWED_HOSTS=['127.0.0.1'])
    @patch('website.work_import.analyze_with_openai')
    def test_local_ai_without_login_requires_csrf_and_is_local_only(self,analyze):
        from django.core.cache import cache
        cache.delete('work-ai-local')
        analyze.return_value=self.plan()
        c=APIClient(enforce_csrf_checks=True)
        payload={'source':'Main\nChild\n\nOther','rules':'Blank line starts a new task','api_key':'test-placeholder'}
        path='/api/work/import/local-preview/'
        self.assertEqual(c.post(path,payload,format='json',HTTP_HOST='127.0.0.1').status_code,403)
        csrf=c.get('/api/work/session/',HTTP_HOST='127.0.0.1').json()['csrf']
        r=c.post(path,payload,format='json',HTTP_HOST='127.0.0.1',HTTP_X_CSRFTOKEN=csrf)
        self.assertEqual(r.status_code,200);self.assertEqual(analyze.call_args.args[2],'test-placeholder')
        with override_settings(DEBUG=False):
            self.assertEqual(c.post(path,payload,format='json',HTTP_HOST='127.0.0.1',HTTP_X_CSRFTOKEN=csrf).status_code,403)
        self.assertEqual(c.post(path,payload,format='json',HTTP_HOST='127.0.0.1',HTTP_X_CSRFTOKEN=csrf,REMOTE_ADDR='203.0.113.10').status_code,403)
