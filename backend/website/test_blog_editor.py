from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from website.models import BlogPost
from website.admin import BlogPostEditorForm


class BlogEditorTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_superuser('editor', 'editor@example.com', 'test-only-password')
        self.client.force_login(self.user)

    def test_dashboard_shortcuts_and_editor(self):
        response = self.client.get(reverse('admin:index'))
        self.assertContains(response, reverse('admin:website_blogpost_add'))
        self.assertContains(response, 'Novi članak')
        self.assertEqual(self.client.get(reverse('admin:website_blogpost_add')).status_code, 200)
        self.assertFalse(BlogPostEditorForm().fields['is_published'].initial)

    def test_existing_articles_editable(self):
        post = BlogPost.objects.create(title='Postojeći članak', slug='existing-article', excerpt='Opis', content='Tekst')
        response = self.client.get(reverse('admin:website_blogpost_change', args=[post.pk]))
        self.assertContains(response, 'Postojeći članak')
        self.assertContains(response, 'Tekst članka')

    def test_no_shortcuts_for_user_without_permissions(self):
        user = get_user_model().objects.create_user('staff', is_staff=True)
        self.client.force_login(user)
        response = self.client.get(reverse('admin:index'))
        self.assertNotContains(response, 'Novi članak')
        self.assertEqual(self.client.get(reverse('admin:website_blogpost_add')).status_code, 403)
