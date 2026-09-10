from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import ContactMessage


@override_settings(CONTACT_RECIPIENT='')
class PublicContactTests(TestCase):
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=True)
        self.payload = {
            'name': 'Contact regression test',
            'email': 'test@example.com',
            'company': 'Test',
            'message': 'Test contact submission',
        }

    def test_anonymous_submission(self):
        response = self.client.post('/api/contact/', self.payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(ContactMessage.objects.count(), 1)

    def test_admin_session_does_not_block_public_submission(self):
        user = get_user_model().objects.create_user(
            username='contact-admin', password='test-only', is_staff=True,
        )
        self.client.force_login(user)
        response = self.client.post('/api/contact/', self.payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(ContactMessage.objects.count(), 1)
        # The same session must not bypass CSRF on the admin login endpoint.
        response = self.client.post('/admin/login/', {})
        self.assertEqual(response.status_code, 403)

    def test_invalid_submission_does_not_create_message(self):
        response = self.client.post('/api/contact/', {}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(ContactMessage.objects.count(), 0)
