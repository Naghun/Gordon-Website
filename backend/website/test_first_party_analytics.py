import json
import uuid
from django.test import TestCase, override_settings
from django.core.cache import cache
from django.contrib.auth import get_user_model
from .models import AnalyticsVisit, AnalyticsEvent

@override_settings(ALLOWED_HOSTS=['testserver'], GEOIP_PATH='')
class MetricsTests(TestCase):
    def setUp(self):
        cache.clear()
        self.payload = dict(consent=True, visit=str(uuid.uuid4()), event=str(uuid.uuid4()),
                            kind='page_view', path='/', device='mobile')

    def send(self, **changes):
        return self.client.post('/api/metrics/', json.dumps({**self.payload, **changes}),
                                content_type='application/json', HTTP_ORIGIN='https://gordon.ba')

    def test_deduplication(self):
        self.assertEqual(self.send().status_code, 200)
        self.send()
        self.assertEqual(AnalyticsEvent.objects.count(), 1)

    def test_consent_and_path_required(self):
        self.assertEqual(self.send(consent=False).status_code, 400)
        self.assertEqual(self.send(path='/backend/admin/').status_code, 400)
        self.assertEqual(self.send(path='/?email=private').status_code, 400)
        self.assertEqual(AnalyticsVisit.objects.count(), 0)

    def test_origin_rejected(self):
        response = self.client.post('/api/metrics/', json.dumps(self.payload), content_type='application/json', HTTP_ORIGIN='https://example.com')
        self.assertEqual(response.status_code, 403)

    def test_privacy_and_heartbeat_bound(self):
        self.send(kind='form_start', target='private email text', email='private@example.com')
        self.assertEqual(AnalyticsEvent.objects.get().target, 'contact')
        self.send(event=str(uuid.uuid4()), kind='heartbeat', seconds=900)
        self.assertEqual(AnalyticsVisit.objects.get().active_seconds, 20)

    def test_dashboard_permissions(self):
        self.assertEqual(self.client.get('/admin/analytics/data/').status_code, 302)
        user = get_user_model().objects.create_user(username='metrics-test', is_staff=True)
        self.client.force_login(user)
        self.assertEqual(self.client.get('/admin/analytics/data/').status_code, 403)
        user.is_superuser = True
        user.save()
        self.assertEqual(self.client.get('/admin/analytics/data/').status_code, 200)
        self.assertEqual(self.client.get('/admin/analytics/').status_code, 200)

    def test_gpc(self):
        response = self.client.post('/api/metrics/', json.dumps(self.payload), content_type='application/json', HTTP_ORIGIN='https://gordon.ba', HTTP_SEC_GPC='1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(AnalyticsVisit.objects.count(), 0)

    def test_automatic_collection(self):
        self.assertEqual(self.send(consent=False, collection_mode='automatic').status_code,200)
        self.assertEqual(AnalyticsVisit.objects.count(),1)
