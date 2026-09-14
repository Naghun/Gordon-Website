from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from .models import WorkProject, WorkTask

class WorkTests(TestCase):
    def test_admin_team_uses_existing_accounts_without_exposing_private_projects(self):
        U=get_user_model()
        admin=U.objects.create_user('admin-new',is_staff=True)
        colleague=U.objects.create_user('admin-colleague',is_staff=True)
        disabled=U.objects.create_user('admin-disabled',is_staff=True,is_active=False)
        self.client.force_login(admin)
        response=self.client.get('/api/work/state/')
        team=response.json()['projects'][0]
        self.assertEqual(team['name'],'Gordon tim')
        self.assertEqual({m['id'] for m in team['members']},{admin.pk,colleague.pk})
        self.assertNotIn(disabled.pk,{m['id'] for m in team['members']})
        self.assertEqual(response.json()['tasks'],[])
        self.client.get('/api/work/state/')
        self.assertEqual(WorkProject.objects.filter(name='Gordon tim').count(),1)
        self.client.force_login(self.c)
        self.assertEqual(self.client.get('/api/work/state/').json()['projects'],[])

    def setUp(self):
        U=get_user_model()
        self.a=U.objects.create_user('work-a',password='test-only-A1')
        self.b=U.objects.create_user('work-b',password='test-only-B2')
        self.c=U.objects.create_user('work-c',password='test-only-C3')
        self.project=WorkProject.objects.create(name='Project A',owner=self.a)
        self.project.members.add(self.a,self.b)
        self.task=WorkTask.objects.create(project=self.project,creator=self.a,title='Shared',status='todo')
        self.private=WorkTask.objects.create(creator=self.a,title='Private',status='inbox')
        self.client=APIClient()
        self.client.force_login(self.a)

    def test_anonymous_cannot_read_or_write(self):
        self.client.logout()
        self.assertEqual(self.client.get('/api/work/state/').status_code,403)
        self.assertEqual(self.client.post('/api/work/projects/',{'name':'x'},format='json').status_code,403)

    def test_invalid_methods_and_values_do_not_create_or_modify_tasks(self):
        before=WorkTask.objects.count()
        self.assertEqual(self.client.delete('/api/work/tasks/',{},format='json').status_code,405)
        self.assertEqual(self.client.post(f'/api/work/tasks/{self.task.pk}/',{},format='json').status_code,405)
        for invalid in ({'comment':42},{'project':'not-a-uuid'},{'person':'invalid'}):
            self.assertEqual(self.client.patch(f'/api/work/tasks/{self.task.pk}/',{'revision':1,**invalid},format='json').status_code,400)
        self.assertEqual(WorkTask.objects.count(),before)

    def test_member_sees_shared_tasks_not_others_inbox(self):
        self.client.force_login(self.b)
        data=self.client.get('/api/work/state/').json()
        self.assertEqual([t['title'] for t in data['tasks']],['Shared'])
        self.assertEqual(self.client.patch(f'/api/work/tasks/{self.private.pk}/',{'revision':1,'title':'Intrusion'},format='json').status_code,404)

    def test_outsider_cannot_read_change_or_delete_project_task(self):
        self.client.force_login(self.c)
        self.assertEqual(self.client.get('/api/work/state/').json(),{'projects':[],'tasks':[],'notifications':[]})
        for method in ('patch','delete'):
            self.assertEqual(getattr(self.client,method)(f'/api/work/tasks/{self.task.pk}/',{'revision':1},format='json').status_code,404)
        self.assertEqual(self.client.patch(f'/api/work/projects/{self.project.pk}/',{'background':'sunset'},format='json').status_code,404)

    def test_assignment_only_to_members(self):
        url=f'/api/work/tasks/{self.task.pk}/'
        self.assertEqual(self.client.patch(url,{'revision':1,'person':self.c.pk},format='json').status_code,404)
        response=self.client.patch(url,{'revision':1,'person':self.b.pk},format='json')
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.json()['person'],self.b.pk)

    def test_complete_delete_restore_and_stale_revision(self):
        url=f'/api/work/tasks/{self.task.pk}/'
        response=self.client.patch(url,{'revision':1,'status':'done'},format='json')
        self.assertEqual(response.json()['status'],'done')
        self.assertEqual(self.client.patch(url,{'revision':1,'title':'stale'},format='json').status_code,409)
        self.assertTrue(self.client.delete(url,{'revision':2},format='json').json()['deleted'])
        self.assertFalse(self.client.patch(url,{'revision':3,'deleted':False},format='json').json()['deleted'])
        self.assertEqual(WorkTask.objects.count(),2)

    def test_member_cannot_add_members_or_change_background(self):
        self.client.force_login(self.b)
        self.assertEqual(self.client.post(f'/api/work/projects/{self.project.pk}/',{'username':self.c.username},format='json').status_code,403)
        self.assertEqual(self.client.patch(f'/api/work/projects/{self.project.pk}/',{'background':'sunset'},format='json').status_code,403)

    def test_owner_can_add_member_and_member_can_assign(self):
        response=self.client.post(f'/api/work/projects/{self.project.pk}/',{'username':self.c.username},format='json')
        self.assertEqual(response.status_code,200)
        self.client.force_login(self.b)
        self.assertEqual(self.client.patch(f'/api/work/tasks/{self.task.pk}/',{'revision':1,'person':self.c.pk},format='json').status_code,200)

    def test_private_card_can_move_to_project(self):
        response=self.client.patch(f'/api/work/tasks/{self.private.pk}/',{'revision':1,'project':str(self.project.pk),'status':'doing','person':self.b.pk},format='json')
        self.assertEqual(response.status_code,200)
        self.client.force_login(self.b)
        self.assertEqual(len(self.client.get('/api/work/state/').json()['tasks']),2)

    def test_comment_author_is_authenticated_user(self):
        self.client.force_login(self.b)
        response=self.client.patch(f'/api/work/tasks/{self.task.pk}/',{'revision':1,'comment':'Hello','comments':[{'author':{'id':self.a.pk}}]},format='json')
        self.assertEqual(response.json()['comments'][0]['author']['id'],self.b.pk)

    def test_session_and_csrf_enforcement_including_login(self):
        client=APIClient(enforce_csrf_checks=True)
        session=client.get('/api/work/session/').json()
        self.assertIsNone(session['user'])
        self.assertEqual(client.post('/api/work/login/',{'username':'work-a','password':'test-only-A1'},format='json').status_code,403)
        response=client.post('/api/work/login/',{'username':'work-a','password':'test-only-A1'},format='json',HTTP_X_CSRFTOKEN=session['csrf'])
        self.assertEqual(response.status_code,200)
        self.assertEqual(client.get('/api/work/session/').json()['user']['id'],self.a.pk)
        self.assertEqual(client.post('/api/work/projects/',{'name':'CSRF'},format='json').status_code,403)
        response=client.post('/api/work/projects/',{'name':'Own space'},format='json',HTTP_X_CSRFTOKEN=response.json()['csrf'])
        self.assertEqual(response.status_code,201)
        self.assertEqual([m['id'] for m in response.json()['members']],[self.a.pk])

    def test_reject_unsafe_background(self):
        response=self.client.patch(f'/api/work/projects/{self.project.pk}/',{'background':'data:image/svg+xml,<svg/>'},format='json')
        self.assertEqual(response.status_code,400)
