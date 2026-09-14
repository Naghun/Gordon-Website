from unittest.mock import patch, MagicMock
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import AdminEmail
from .mailbox import sync_mailbox

class MailAccountTests(TestCase):
    def setUp(self):
        self.client.force_login(get_user_model().objects.create_user('mail-admin',is_staff=True,is_superuser=True))
        for box in ('primary','contact'):
            AdminEmail.objects.create(uid='1',mailbox=box,sender_email='sender@example.com',subject=box,received_at=timezone.now())

    @patch('website.admin_notifications.sync_mailbox',return_value={'ok':True})
    def test_selection_and_mark_read_are_scoped(self,sync):
        response=self.client.get('/admin/emails/?mailbox=contact')
        self.assertEqual([i['title'] for i in response.context['notifications']],['contact'])
        self.client.post('/admin/emails/',{'mailbox':'contact','type':'email','action':'read_all_emails'})
        self.assertTrue(AdminEmail.objects.get(mailbox='contact').is_read)
        self.assertFalse(AdminEmail.objects.get(mailbox='primary').is_read)
        response=self.client.get('/admin/emails/?mailbox=contact')
        self.assertEqual(len(response.context['notifications']),1)

    @override_settings(CONTACT_MAIL_PASSWORD='test-only')
    @patch('website.mailbox.imaplib.IMAP4_SSL')
    def test_sync_uses_selected_credentials_and_separate_uids(self,imap):
        c=imap.return_value
        c.uid.side_effect=[('OK',[b'2']),('OK',[(b'2',b'From: Sender <sender@example.com>\r\nSubject: Imported\r\n\r\nTest body')])]
        result=sync_mailbox(force=True,mailbox='contact')
        self.assertTrue(result['ok'])
        c.login.assert_called_once_with('kontakt@gordondm.com','test-only')
        self.assertTrue(AdminEmail.objects.filter(mailbox='contact',uid='2').exists())
        self.assertFalse(AdminEmail.objects.filter(mailbox='primary',uid='2').exists())
