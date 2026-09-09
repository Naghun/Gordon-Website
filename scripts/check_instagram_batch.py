"""Local render checks without printing private admin data or credentials."""
import os
import sys
import json
from pathlib import Path
root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root/'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.conf import settings
from django.test import Client, override_settings
from django.contrib.auth import get_user_model
from website.models import BlogPost

assert settings.DEBUG and settings.DATABASES['default']['ENGINE'].endswith('sqlite3')
posts = sum([json.loads((root/f'content/instagram-batch-{batch}.json').read_text(encoding='utf-8')) for batch in ('01','02')], [])
with override_settings(ALLOWED_HOSTS=['testserver', '127.0.0.1']):
    client = Client()
    for post in posts:
        response = client.get('/api/blog/'+post['slug']+'/')
        assert response.status_code == 200
        assert len(response.json()['images']) == (0 if post.get('video_url') else len(post['photos']))
        assert BlogPost.objects.filter(slug=post['slug']).count() == 1
    user = get_user_model().objects.filter(is_superuser=True, is_active=True).first()
    assert user, 'An existing local admin is required for render verification'
    client.force_login(user)
    response = client.get('/admin/website/seopage/')
    assert response.status_code == 200
    output = root/'output/instagram-review/admin-check.html'
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(response.content.decode().replace('<head>', '<head><base href="http://127.0.0.1:8011/">'), encoding='utf-8')
    response = client.get('/admin/analytics/')
    assert response.status_code == 200
    (output.parent/'metrics-check.html').write_text(response.content.decode().replace('<head>', '<head><base href="http://127.0.0.1:8011/">'), encoding='utf-8')
    stats = client.get('/admin/analytics/data/')
    assert stats.status_code == 200
    (output.parent/'metrics-check.json').write_text(stats.content.decode(), encoding='utf-8')
    response = client.get('/admin/')
    assert response.status_code == 200
    (output.parent/'dashboard-check.html').write_text(response.content.decode().replace('<head>', '<head><base href="http://127.0.0.1:8011/">'), encoding='utf-8')
    client.logout()
print('6 API articles, galleries, unique slugs and authenticated admin renders passed.')
