"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.conf import settings
from django.http import JsonResponse
from django.urls import include, path, re_path
from django.views.static import serve
from website.admin_notifications import notification_open, notifications_feed, notifications_page

def home(request):
    return JsonResponse({
        'status': 'online',
        'service': 'GordonDM API',
        'admin': '/admin/',
        'api': '/api/content/',
    })

urlpatterns = [
    path('', home, name='home'),
    path('admin/notifications/', notifications_page, name='admin_notifications'),
    path('admin/notifications/feed/', notifications_feed, name='admin_notifications_feed'),
    path('admin/notifications/open/<str:kind>/<int:object_id>/', notification_open, name='admin_notification_open'),
    path('admin/', admin.site.urls),
    path('api/', include('website.urls')),
]
if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # Na cPanel/Passenger hostingu aplikacija je montirana pod /backend.
    # Ovi mali statički skupovi se poslužuju kroz Django kako bi admin i
    # blog galerije radili bez izmjene konfiguracije ostalih domena.
    urlpatterns += [
        re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
        re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    ]
