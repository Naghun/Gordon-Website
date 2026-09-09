"""Consent-based first-party metrics. No form values, raw IPs or full referrers."""
import hashlib
import ipaddress
import json
import re
import uuid
from datetime import timedelta
from django.conf import settings
from django.core.cache import cache
from django.db import transaction
from django.db.models import Count, Sum, F, Q
from django.db.models.functions import TruncDate
from django.http import JsonResponse
from django.template.response import TemplateResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .models import AnalyticsVisit, AnalyticsEvent

KINDS = {'page_view','heartbeat','click','form_view','form_start','form_attempt','form_success','form_error','scroll'}
PATH = re.compile(r'^/(?:|ai-automatizacija|softver-rjesenja|marketing|kripto|konsulting|kontakt|faq|blog(?:/[a-z0-9-]{1,220})?)/?$')

def location(ip):
    if not getattr(settings, 'GEOIP_PATH', ''):
        return 'Nepoznato', 'Nepoznato'
    try:
        if not ipaddress.ip_address(ip).is_global:
            return 'Lokalno', 'Lokalno'
        from django.contrib.gis.geoip2 import GeoIP2
        city = GeoIP2().city(ip)
        return city.get('country_name') or 'Nepoznato', city.get('city') or 'Nepoznato'
    except Exception:
        # Optional database/reader failures must never interrupt visitor requests.
        return 'Nepoznato', 'Nepoznato'

def label(value, limit=100):
    if not isinstance(value, str):
        return ''
    return re.sub(r'[^a-zA-Z0-9_. -]', '', value)[:limit]

@csrf_exempt
@require_POST
def collect(request):
    origin = request.headers.get('Origin', '')
    allowed = {'https://gordon.ba', 'https://www.gordon.ba'}
    if settings.DEBUG:
        allowed |= {'http://127.0.0.1:5173', 'http://localhost:5173'}
    if origin not in allowed or len(request.body) > 4096:
        return JsonResponse({'detail':'Rejected'}, status=403)
    if request.headers.get('Sec-GPC') == '1' or request.headers.get('DNT') == '1':
        return JsonResponse({'ignored': True})
    ip = request.META.get('REMOTE_ADDR','')  # Never trust arbitrary forwarded headers.
    rate_key = 'metrics:' + hashlib.sha256((settings.SECRET_KEY+ip).encode()).hexdigest()
    count = cache.get(rate_key,0)
    if count >= 180:
        return JsonResponse({'detail':'Rate limit'}, status=429)
    cache.set(rate_key,count+1,60)
    try:
        data = json.loads(request.body)
        if not isinstance(data, dict) or (data.get('consent') is not True and data.get('collection_mode') != 'automatic'):
            raise ValueError()
        visit_id, event_id = uuid.UUID(data['visit']), uuid.UUID(data['event'])
        kind, path = data['kind'], data['path']
        if kind not in KINDS or not isinstance(path,str) or not PATH.fullmatch(path):
            raise ValueError()
        target = data.get('target','')
        if kind == 'click':
            if not isinstance(target,str) or not (PATH.fullmatch(target) or target in {'phone','email','whatsapp','viber','external','button'}):
                raise ValueError()
        else:
            target = 'contact' if kind.startswith('form_') else ''
        seconds = min(20,max(0,int(data.get('seconds',0)))) if kind == 'heartbeat' else 0
    except (ValueError, KeyError, TypeError, OverflowError):
        return JsonResponse({'detail':'Invalid event'}, status=400)
    now = timezone.now()
    with transaction.atomic():
        visit, created = AnalyticsVisit.objects.get_or_create(token=visit_id, defaults={
            'current_path':path, 'device':data.get('device') if data.get('device') in ('mobile','tablet','desktop') else 'unknown',
            'source': label(data.get('source'),120) or 'direct', 'campaign':label(data.get('campaign')),
            'placement':label(data.get('placement')),
        })
        if created:
            visit.country, visit.city = location(ip)
            visit.save(update_fields=['country','city'])
        event, inserted = AnalyticsEvent.objects.get_or_create(token=event_id, defaults={'visit':visit,'kind':kind,'path':path,'target':target,'seconds':seconds})
        if inserted:
            AnalyticsVisit.objects.filter(pk=visit_id).update(last_seen=now,current_path=path,active_seconds=F('active_seconds')+seconds)
    # Bounded retention is also enforced during normal ingestion, without a cron dependency.
    if cache.add('metrics-retention',True,3600):
        AnalyticsVisit.objects.filter(last_seen__lt=now-timedelta(days=30)).delete()
        AnalyticsEvent.objects.filter(created_at__lt=now-timedelta(days=30)).delete()
    return JsonResponse({'ok':True})

def permitted(request):
    return request.user.is_active and request.user.is_staff and request.user.has_perm('website.view_analyticsvisit')

def dashboard(request):
    if not permitted(request):
        return JsonResponse({'detail':'Forbidden'},status=403)
    from django.contrib import admin
    return TemplateResponse(request,'admin/analytics.html',{**admin.site.each_context(request),'title':'Analitika posjeta'})

def stats(request):
    if not permitted(request):
        return JsonResponse({'detail':'Forbidden'},status=403)
    now = timezone.now()
    visits = AnalyticsVisit.objects.filter(last_seen__gte=now-timedelta(days=30))
    events = AnalyticsEvent.objects.filter(created_at__gte=now-timedelta(days=30))
    live = visits.filter(last_seen__gte=now-timedelta(seconds=45)).order_by('-last_seen')
    def groups(query, field):
        return list(query.values(field).annotate(count=Count('pk')).order_by('-count')[:15])
    today = timezone.localdate(now)
    counts = {row['day']:row['count'] for row in events.filter(kind='page_view').annotate(day=TruncDate('created_at')).values('day').annotate(count=Count('pk'))}
    daily = [{'label':(today-timedelta(days=i)).isoformat(),'count':counts.get(today-timedelta(days=i),0)} for i in range(29,-1,-1)]
    hourly = []
    for i in range(6,0,-1):
        start, end = now-timedelta(hours=i), now-timedelta(hours=i-1)
        bound = {'created_at__lte':end} if i == 1 else {'created_at__lt':end}
        hourly.append({'label':timezone.localtime(start).strftime('%H:%M'),'count':events.filter(kind='page_view',created_at__gte=start,**bound).count()})
    channels = {}
    for row in visits.values('source').annotate(count=Count('pk')):
        source = row['source'].lower()
        channel = 'Instagram' if source in ('ig','instagram') or source.endswith('instagram.com') else 'Facebook' if source in ('fb','facebook') or source.endswith('facebook.com') else 'Google' if source == 'google' or source.endswith('google.com') else 'Direktno' if source == 'direct' else row['source']
        channels[channel] = channels.get(channel,0)+row['count']
    result = {
        'daily':daily, 'hourly':hourly, 'channels':[{'label':k,'count':v} for k,v in sorted(channels.items(),key=lambda item:-item[1])],
        'live':list(live.values('token','current_path','device','source','country','city','active_seconds')[:50]),
        'live_count':live.count(), 'sessions':visits.count(),
        'pageviews':events.filter(kind='page_view').count(),
        'active_seconds':visits.aggregate(total=Sum('active_seconds'))['total'] or 0,
        'pages':list(events.values('path').annotate(events=Count('pk', filter=Q(kind='page_view')),sessions=Count('visit_id',distinct=True),seconds=Sum('seconds')).order_by('-seconds')[:15]),
        'devices':groups(visits,'device'), 'sources':groups(visits,'source'),
        'campaigns':groups(visits.exclude(campaign=''),'campaign'), 'placements':groups(visits.exclude(placement=''),'placement'),
        'locations':list(visits.values('country','city').annotate(count=Count('pk')).order_by('-count')[:15]),
        'clicks':list(events.filter(kind='click').values('path','target').annotate(count=Count('pk')).order_by('-count')[:20]),
        'forms':{kind:events.filter(kind=kind).values('visit_id').distinct().count() for kind in ('form_view','form_start','form_attempt','form_success','form_error')},
        'geo_enabled':bool(getattr(settings,'GEOIP_PATH','')), 'updated':now.isoformat(),
    }
    response = JsonResponse(result)
    response['Cache-Control'] = 'private, no-store'
    return response
