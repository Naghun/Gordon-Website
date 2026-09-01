from django.contrib import admin
from django import forms
from django.http import HttpResponseRedirect
from django.core.mail import send_mail
from django.contrib import messages
from django.template.response import TemplateResponse
from django.urls import path, reverse
from django.utils.html import format_html,format_html_join
from django.utils import timezone
from .models import AdminEmail,BlogPost,BlogPostImage,ChatConversation,ChatMessage,ContactMessage,CryptoEvent,CryptoEventImage,CryptoLesson,Project,SEOPage,Service
from .email_filters import suspected_sales_or_scam_q
from .mailbox import sync_mailbox
admin.site.site_header='Studio administracija'

class ConciseChangeListTitleMixin:
 changelist_title=None
 def changelist_view(self,request,extra_context=None):
  context=dict(extra_context or {})
  context['title']=self.changelist_title or self.model._meta.verbose_name_plural
  return super().changelist_view(request,context)

# Keep the development server's admin customizations hot-reloadable.
@admin.register(Service)
class ServiceAdmin(ConciseChangeListTitleMixin,admin.ModelAdmin):
 changelist_title='Usluge'
 list_display=('title','order')
@admin.register(Project)
class ProjectAdmin(ConciseChangeListTitleMixin,admin.ModelAdmin):
 changelist_title='Projekti'
 list_display=('title','category','is_featured')

@admin.register(SEOPage)
class SEOPageAdmin(ConciseChangeListTitleMixin,admin.ModelAdmin):
 changelist_title='SEO Manager'
 list_display=('page_name','route','primary_keyword','search_intent','seo_score','is_indexed','is_active','updated_at')
 list_editable=('is_indexed','is_active')
 list_filter=('search_intent','schema_type','is_indexed','is_active')
 search_fields=('page_name','route','title_bs','description_bs','primary_keyword','secondary_keywords')
 readonly_fields=('seo_preview','updated_at')
 fieldsets=(
  ('Stranica',{'fields':('page_name','route','is_active','is_indexed')}),
  ('Keyword mapa',{'fields':('primary_keyword','secondary_keywords','search_intent')}),
  ('Bosanski SEO',{'fields':('title_bs','description_bs')}),
  ('English SEO',{'fields':('title_en','description_en'),'classes':('collapse',)}),
  ('Deutsch SEO',{'fields':('title_de','description_de'),'classes':('collapse',)}),
  ('Google i dijeljenje',{'fields':('canonical_url','og_title','og_description','og_image','schema_type')}),
  ('Pregled',{'fields':('seo_preview','updated_at')}),
 )
 @admin.display(description='SEO ocjena')
 def seo_score(self,obj):
  score=0
  score+=25 if obj.primary_keyword else 0
  score+=20 if 30 <= len(obj.title_bs) <= 65 else 8 if obj.title_bs else 0
  score+=20 if 110 <= len(obj.description_bs) <= 170 else 8 if obj.description_bs else 0
  score+=15 if obj.primary_keyword and obj.primary_keyword.lower() in obj.title_bs.lower() else 0
  score+=10 if obj.secondary_keywords else 0
  score+=10 if obj.canonical_url else 0
  color='#078f93' if score >= 80 else '#d58b16' if score >= 55 else '#b3261e'
  return format_html('<b style="color:{}">{} / 100</b>',color,score)
 @admin.display(description='Google pregled')
 def seo_preview(self,obj):
  if not obj: return 'Sačuvajte stranicu za SEO pregled.'
  url=obj.canonical_url or f'https://gordon.ba{obj.route if obj.route != "/" else ""}'
  return format_html('<div style="max-width:680px;padding:20px;border:1px solid #d8dddd;border-radius:12px;background:#fff"><small style="color:#202124">{}</small><h3 style="margin:7px 0;color:#1a0dab;font:400 20px Arial">{}</h3><p style="margin:0;color:#4d5156;font:14px/1.5 Arial">{}</p></div>',url,obj.title_bs,obj.description_bs)
@admin.register(ContactMessage)
class ContactAdmin(ConciseChangeListTitleMixin,admin.ModelAdmin):
 changelist_title='Kontakt poruke'
 list_display=('name','email','service_type','created_at','read_status'); readonly_fields=('name','email','company','service_type','message','created_at')
 @admin.display(description='Is read', ordering='is_read')
 def read_status(self, obj):
  symbol='✓' if obj.is_read else '×'
  css_class='read-yes' if obj.is_read else 'read-no'
  return format_html('<span class="read-status {}">{}</span>',css_class,symbol)

class ChatConversationAdminForm(forms.ModelForm):
 reply=forms.CharField(label='Vaš odgovor',required=False,widget=forms.Textarea(attrs={'rows':1,'class':'chat-message-input','placeholder':'Napišite odgovor korisniku...'}))
 class Meta:
  model=ChatConversation
  fields='__all__'

@admin.register(ChatConversation)
class ChatConversationAdmin(ConciseChangeListTitleMixin,admin.ModelAdmin):
 changelist_title='Chat'
 form=ChatConversationAdminForm
 change_form_template='admin/website/chatconversation/change_form.html'
 list_display=('name','email','updated_at','is_closed')
 list_filter=('is_closed',)
 search_fields=('name','email','messages__message')
 readonly_fields=('name','email','conversation_history','created_at','updated_at')
 fields=('name','email','conversation_history','reply','is_closed','created_at','updated_at')
 @admin.display(description='Razgovor')
 def conversation_history(self,obj):
  rows=[]
  for item in obj.messages.all():
   is_admin=item.sender==ChatMessage.ADMIN
   label='GordonDM' if is_admin else obj.name
   rows.append(format_html('<div class="admin-chat-message {}"><div class="admin-chat-avatar">{}</div><div class="admin-chat-content"><strong>{}:</strong><span>{}</span><time>{}</time></div></div>','is-admin' if is_admin else 'is-visitor','G' if is_admin else '',label,item.message,item.created_at.strftime('%d.%m.%Y. %H:%M')))
  if not rows: return format_html('<p class="admin-chat-empty">Još nema poruka u ovom razgovoru.</p>')
  return format_html('<div class="admin-chat-history">{}</div>',format_html_join('', '{}', ((row,) for row in rows)))
 def save_model(self,request,obj,form,change):
  obj.admin_seen_at=timezone.now()
  super().save_model(request,obj,form,change)
  reply=form.cleaned_data.get('reply','').strip()
  if reply:
   ChatMessage.objects.create(conversation=obj,sender=ChatMessage.ADMIN,message=reply)
   obj.save(update_fields=['updated_at','admin_seen_at'])
 def response_change(self,request,obj):
  return HttpResponseRedirect(request.path)
 class Media:
  js=('admin/chat-message.js',)
  css={'all':('admin/chat-message.css','admin/chat-conversation.css')}

class AdminEmailForm(forms.ModelForm):
 reply=forms.CharField(label='Vaš odgovor',required=False,widget=forms.Textarea(attrs={'rows':7,'class':'email-reply-input','placeholder':'Napišite odgovor primaocu...'}))
 class Meta:
  model=AdminEmail
  fields='__all__'

class ComposeEmailForm(forms.Form):
 recipient=forms.EmailField(label='Primaoc',widget=forms.EmailInput(attrs={'placeholder':'ime@domena.com'}))
 subject=forms.CharField(label='Predmet',max_length=300,widget=forms.TextInput(attrs={'placeholder':'Predmet emaila'}))
 message=forms.CharField(label='Poruka',widget=forms.Textarea(attrs={'rows':12,'placeholder':'Napišite email poruku...'}))

class PartnerEmailFilter(admin.SimpleListFilter):
 title='Brzi partneri'
 parameter_name='partner'
 def lookups(self,request,model_admin):
  return (('asa','ASA BANKA'),('halal','Halal'))
 def queryset(self,request,queryset):
  if self.value()=='asa': return queryset.filter(sender_email__iendswith='@asabanka.ba')
  if self.value()=='halal': return queryset.filter(sender_email__iendswith='@halal.ba')
  return queryset

class EmailTypeFilter(admin.SimpleListFilter):
 title='Vrsta poruke'
 parameter_name='mail_type'
 def lookups(self,request,model_admin):
  return (('inbox','Primljene poruke'),('spam','Spam / prodajne ponude'),('all','Prikaži sve'))
 def queryset(self,request,queryset):
  if self.value()=='spam': return queryset.filter(suspected_sales_or_scam_q())
  if self.value()=='all': return queryset
  return queryset.exclude(suspected_sales_or_scam_q())

@admin.register(AdminEmail)
class AdminEmailAdmin(ConciseChangeListTitleMixin,admin.ModelAdmin):
 changelist_title='Email'
 form=AdminEmailForm
 change_form_template='admin/website/adminemail/change_form.html'
 change_list_template='admin/website/adminemail/change_list.html'
 list_display=('subject','sender_email','received_at','is_read','replied_at')
 list_filter=(PartnerEmailFilter,EmailTypeFilter,'is_read','replied_at')
 search_fields=('subject','sender_name','sender_email','body_text')
 readonly_fields=('email_reader',)
 fields=('email_reader','reply','is_read')
 @admin.display(description='Email')
 def email_reader(self,obj):
  if not obj or not obj.pk: return ''
  initials=''.join(part[:1] for part in (obj.sender_name or obj.sender_email).split()[:2]).upper() or '@'
  sender=obj.sender_name or obj.sender_email
  body=(obj.body_text or '').strip()
  if body.startswith('PK') or body.count('�') > 3: body='Ovaj email sadrži automatski XML/ZIP izvještaj kao prilog. Za pregled datoteke otvorite originalnu poruku u email sandučiću.'
  main_body,disclaimer=self._split_email_body(body)
  disclaimer_html=format_html('<aside class="admin-email-disclaimer"><b>Potpis i napomena</b>{}</aside>',disclaimer) if disclaimer else ''
  return format_html('<article class="admin-email-reader"><header><div class="admin-email-avatar">{}</div><div><h2>{}</h2><p><strong>{}</strong> &lt;{}&gt;</p><p>Za: {}</p></div><time>{}</time></header><div class="admin-email-body">{}</div>{}</article>',initials,obj.subject or '(Bez naslova)',sender,obj.sender_email,obj.recipient,obj.received_at.strftime('%d.%m.%Y. %H:%M'),main_body or 'Ovaj email nema tekstualni sadržaj. Provjerite priložene datoteke u email sandučiću.',disclaimer_html)
 def _split_email_body(self,body):
  lowered=body.lower()
  markers=['\n-- ','\n--\n','\nkind regards','\nbest regards','\nsincerely','\nsrdačan pozdrav','\nlijep pozdrav','\npozdrav,','confidentiality notice','confidentiality disclaimer','disclaimer:','unsubscribe','ova poruka i svi prilozi','this email and any attachments']
  positions=[lowered.find(marker,120) for marker in markers]
  positions=[position for position in positions if position >= 0]
  if not positions: return body,''
  cut=min(positions)
  return body[:cut].strip(),body[cut:].strip()
 def get_urls(self):
  return [
   path('refresh/',self.admin_site.admin_view(self.refresh_view),name='website_adminemail_refresh'),
   path('compose/',self.admin_site.admin_view(self.compose_view),name='website_adminemail_compose'),
  ]+super().get_urls()
 def changelist_view(self,request,extra_context=None):
  result=sync_mailbox(force=True)
  if not result.get('ok'):
   messages.warning(request,'Email sandučić nije osvježen. Provjerite IMAP postavke.')
  return super().changelist_view(request,extra_context)
 def refresh_view(self,request):
  result=sync_mailbox(force=True)
  if result.get('ok'):
   messages.success(request,f'Emailovi su osvježeni. Novih poruka: {result.get("created",0)}.')
  else:
   messages.error(request,'Emailovi nisu osvježeni. Provjerite IMAP vezu i pristupne podatke.')
  return HttpResponseRedirect(reverse('admin:website_adminemail_changelist'))
 def compose_view(self,request):
  form=ComposeEmailForm(request.POST or None)
  if request.method=='POST' and form.is_valid():
   cleaned=form.cleaned_data
   body=f"{cleaned['message'].strip()}\n\nSrdačan pozdrav,\nGordonDM tim"
   try:
    send_mail(cleaned['subject'],body,None,[cleaned['recipient']],fail_silently=False)
    messages.success(request,'Email je uspješno poslan.')
    return HttpResponseRedirect(reverse('admin:website_adminemail_changelist'))
   except Exception:
    messages.error(request,'Email nije poslan. Provjerite SMTP vezu i pokušajte ponovo.')
  context={**self.admin_site.each_context(request),'title':'Napiši email','form':form,'opts':self.model._meta}
  return TemplateResponse(request,'admin/website/adminemail/compose.html',context)
 def save_model(self,request,obj,form,change):
  obj.is_read=True
  reply=form.cleaned_data.get('reply','').strip()
  if reply:
   try:
    quoted='\n'.join(f'> {line}' for line in (obj.body_text or '').splitlines()[:80])
    complete=f'{reply}\n\nSrdačan pozdrav,\nGordonDM tim\n\n--- Originalna poruka ---\nOd: {obj.sender_name or obj.sender_email} <{obj.sender_email}>\nDatum: {obj.received_at:%d.%m.%Y. %H:%M}\nPredmet: {obj.subject}\n\n{quoted}'
    send_mail(f'Re: {obj.subject}',complete,None,[obj.sender_email],fail_silently=False)
    obj.replied_at=timezone.now()
    messages.success(request,'Email odgovor je uspješno poslan.')
   except Exception:
    messages.error(request,'Email odgovor nije poslan. Provjerite SMTP pristupne podatke.')
  super().save_model(request,obj,form,change)
 class Media:
  css={'all':('admin/admin-email.css',)}
  js=('admin/admin-email.js',)

class CryptoEventImageInline(admin.TabularInline):
 model=CryptoEventImage
 extra=1
 fields=('image','caption','order')

@admin.register(CryptoEvent)
class CryptoEventAdmin(ConciseChangeListTitleMixin,admin.ModelAdmin):
 changelist_title='Kripto događaji'
 list_display=('title','event_date','location','is_featured','is_published')
 list_filter=('is_published','is_featured','event_date')
 search_fields=('title','excerpt','content','location')
 prepopulated_fields={'slug':('title',)}
 inlines=(CryptoEventImageInline,)
 class Media:
  js=('admin/crypto-event-v3.js',)

@admin.register(CryptoLesson)
class CryptoLessonAdmin(ConciseChangeListTitleMixin,admin.ModelAdmin):
 changelist_title='Kripto lekcije'
 list_display=('title','level','order','is_published')
 list_filter=('level','is_published')
 search_fields=('title','question','answer')

class BlogPostImageInline(admin.TabularInline):
 model=BlogPostImage
 extra=1
 fields=('image','caption','order')

@admin.register(BlogPost)
class BlogPostAdmin(ConciseChangeListTitleMixin,admin.ModelAdmin):
 changelist_title='Blogovi'
 list_display=('title','category','location','published_at','is_featured','is_published')
 list_filter=('category','cover_logo','is_featured','is_published')
 search_fields=('title','title_en','title_de','excerpt','excerpt_en','excerpt_de','content','content_en','content_de','location')
 prepopulated_fields={'slug':('title',)}
 fieldsets=(
  ('Osnovno',{'fields':('title','slug','category','cover_logo','cover_image','location','video_url','published_at','is_featured','is_published')}),
  ('Bosanski',{'fields':('excerpt','content')}),
  ('English',{'fields':('title_en','excerpt_en','content_en')}),
  ('Deutsch',{'fields':('title_de','excerpt_de','content_de')}),
 )
 inlines=(BlogPostImageInline,)
