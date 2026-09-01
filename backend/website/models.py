from django.db import models
from django.core.validators import FileExtensionValidator
from django.utils import timezone
import uuid
class Service(models.Model):
 title=models.CharField(max_length=120); description=models.TextField(); icon=models.CharField(max_length=40,default='Code2'); order=models.PositiveIntegerField(default=0)
 class Meta: ordering=['order','id']
 def __str__(self): return self.title
class Project(models.Model):
 title=models.CharField(max_length=120); category=models.CharField(max_length=80); description=models.TextField(); accent=models.CharField(max_length=20,default='#b7ff5a'); is_featured=models.BooleanField(default=True)
 def __str__(self): return self.title
class ContactMessage(models.Model):
 name=models.CharField(max_length=120); email=models.EmailField(); company=models.CharField(max_length=120,blank=True); service_type=models.CharField(max_length=120,blank=True); message=models.TextField(); created_at=models.DateTimeField(auto_now_add=True); is_read=models.BooleanField(default=False)
 class Meta: ordering=['-created_at']
 def __str__(self): return f'{self.name} — {self.email}'

class ChatConversation(models.Model):
 token=models.UUIDField(default=uuid.uuid4,unique=True,editable=False)
 name=models.CharField(max_length=120)
 email=models.EmailField(blank=True)
 created_at=models.DateTimeField(auto_now_add=True)
 updated_at=models.DateTimeField(auto_now=True)
 is_closed=models.BooleanField(default=False)
 admin_seen_at=models.DateTimeField(null=True,blank=True,editable=False)
 class Meta:
  ordering=['-updated_at']
  verbose_name='Chat razgovor'
  verbose_name_plural='Chat razgovori'
 def __str__(self): return self.name

class ChatMessage(models.Model):
 VISITOR='visitor'; ADMIN='admin'
 SENDER_CHOICES=((VISITOR,'Posjetilac'),(ADMIN,'GordonDM'))
 conversation=models.ForeignKey(ChatConversation,on_delete=models.CASCADE,related_name='messages')
 sender=models.CharField(max_length=10,choices=SENDER_CHOICES,default=VISITOR)
 message=models.TextField(max_length=2000)
 created_at=models.DateTimeField(auto_now_add=True)
 class Meta: ordering=['created_at']
 def __str__(self): return f'{self.conversation.name}: {self.message[:45]}'

class AdminEmail(models.Model):
 uid=models.CharField(max_length=80,unique=True)
 message_id=models.CharField(max_length=255,blank=True)
 sender_name=models.CharField(max_length=180,blank=True)
 sender_email=models.EmailField()
 recipient=models.CharField(max_length=255,blank=True)
 subject=models.CharField(max_length=300,blank=True)
 body_text=models.TextField(blank=True)
 received_at=models.DateTimeField()
 is_read=models.BooleanField(default=False)
 replied_at=models.DateTimeField(null=True,blank=True)
 created_at=models.DateTimeField(auto_now_add=True)
 class Meta:
  ordering=['-received_at']
  verbose_name='Email poruka'
  verbose_name_plural='Email poruke'
 def __str__(self): return self.subject or f'Email: {self.sender_email}'

class SEOPage(models.Model):
 INTENT_CHOICES=(('commercial','Komercijalna'),('local','Lokalna'),('informational','Informativna'),('transactional','Transakcijska'),('navigational','Navigacijska'))
 SCHEMA_CHOICES=(('WebPage','Web stranica'),('Service','Usluga'),('ContactPage','Kontakt'),('CollectionPage','Kolekcija'),('AboutPage','O nama'))
 route=models.CharField('URL putanja',max_length=180,unique=True,help_text='Primjer: /ai-automatizacija')
 page_name=models.CharField('Naziv stranice',max_length=120)
 title_bs=models.CharField('SEO naslov — BS',max_length=180)
 description_bs=models.TextField('Meta opis — BS',max_length=320)
 title_en=models.CharField('SEO naslov — EN',max_length=180,blank=True)
 description_en=models.TextField('Meta opis — EN',max_length=320,blank=True)
 title_de=models.CharField('SEO naslov — DE',max_length=180,blank=True)
 description_de=models.TextField('Meta opis — DE',max_length=320,blank=True)
 primary_keyword=models.CharField('Primarni keyword',max_length=180,blank=True)
 secondary_keywords=models.TextField('Sekundarni keywordi',blank=True,help_text='Jedan keyword po redu ili odvojeni zarezom.')
 search_intent=models.CharField('Search intent',max_length=20,choices=INTENT_CHOICES,default='commercial')
 canonical_url=models.URLField('Canonical URL',blank=True)
 og_title=models.CharField('Open Graph naslov',max_length=180,blank=True)
 og_description=models.TextField('Open Graph opis',max_length=320,blank=True)
 og_image=models.URLField('Open Graph slika',blank=True)
 schema_type=models.CharField('Schema tip',max_length=40,choices=SCHEMA_CHOICES,default='WebPage')
 is_indexed=models.BooleanField('Dozvoli indeksiranje',default=True)
 is_active=models.BooleanField('Aktivno',default=True)
 updated_at=models.DateTimeField(auto_now=True)
 class Meta:
  ordering=['route']
  verbose_name='SEO stranica'
  verbose_name_plural='SEO Manager'
 def __str__(self): return f'{self.page_name} — {self.route}'

class CryptoEvent(models.Model):
 title=models.CharField(max_length=180)
 slug=models.SlugField(max_length=200,unique=True)
 excerpt=models.TextField(max_length=420)
 content=models.TextField()
 event_date=models.DateTimeField()
 location=models.CharField(max_length=160,blank=True)
 cover_image=models.FileField(upload_to='crypto/events/covers/',blank=True,validators=[FileExtensionValidator(['jpg','jpeg','png','webp','gif'])])
 is_featured=models.BooleanField(default=False)
 is_published=models.BooleanField(default=True)
 created_at=models.DateTimeField(auto_now_add=True)
 class Meta:
  ordering=['-event_date']
  verbose_name='Kripto događaj'
  verbose_name_plural='Kripto događaji'
 def __str__(self): return self.title

class CryptoEventImage(models.Model):
 event=models.ForeignKey(CryptoEvent,on_delete=models.CASCADE,related_name='images')
 image=models.FileField(upload_to='crypto/events/gallery/',validators=[FileExtensionValidator(['jpg','jpeg','png','webp','gif'])])
 caption=models.CharField(max_length=180,blank=True)
 order=models.PositiveIntegerField(default=0)
 class Meta:
  ordering=['order','id']
  verbose_name='Slika događaja'
  verbose_name_plural='Slike događaja'
 def __str__(self): return self.caption or f'Slika: {self.event.title}'

class CryptoLesson(models.Model):
 BEGINNER='beginner'; INTERMEDIATE='intermediate'; ADVANCED='advanced'
 LEVEL_CHOICES=((BEGINNER,'Početni'),(INTERMEDIATE,'Srednji'),(ADVANCED,'Napredni'))
 title=models.CharField(max_length=180)
 question=models.CharField(max_length=240)
 answer=models.TextField()
 level=models.CharField(max_length=20,choices=LEVEL_CHOICES,default=BEGINNER)
 order=models.PositiveIntegerField(default=0)
 is_published=models.BooleanField(default=True)
 created_at=models.DateTimeField(auto_now_add=True)
 class Meta:
  ordering=['order','id']
  verbose_name='Kripto lekcija'
  verbose_name_plural='Kripto lekcije'
 def __str__(self): return self.title

class BlogPost(models.Model):
 GENERAL='general'; CRYPTO='crypto'; MARKETING='marketing'; SOFTWARE='software'; AI='ai'; CONSULTING='consulting'
 CATEGORY_CHOICES=((GENERAL,'Općenito'),(CRYPTO,'Kripto i Web3'),(MARKETING,'Marketing'),(SOFTWARE,'Softver'),(AI,'AI automatizacija'),(CONSULTING,'Konsulting'))
 LOGO_CHOICES=(('binance','Binance'),('solana','Solana'),('gordondm','GordonDM'))
 title=models.CharField(max_length=220)
 title_en=models.CharField('Naslov — EN',max_length=220,blank=True)
 title_de=models.CharField('Naslov — DE',max_length=220,blank=True)
 slug=models.SlugField(max_length=240,unique=True)
 excerpt=models.TextField(max_length=500)
 excerpt_en=models.TextField('Kratki opis — EN',max_length=500,blank=True)
 excerpt_de=models.TextField('Kratki opis — DE',max_length=500,blank=True)
 content=models.TextField()
 content_en=models.TextField('Sadržaj — EN',blank=True)
 content_de=models.TextField('Sadržaj — DE',blank=True)
 category=models.CharField(max_length=20,choices=CATEGORY_CHOICES,default=GENERAL)
 cover_logo=models.CharField(max_length=20,choices=LOGO_CHOICES,default='gordondm')
 cover_image=models.FileField(upload_to='blog/covers/',blank=True,validators=[FileExtensionValidator(['jpg','jpeg','png','webp','gif'])])
 location=models.CharField(max_length=160,blank=True)
 video_url=models.URLField(blank=True)
 published_at=models.DateTimeField(default=timezone.now)
 is_featured=models.BooleanField(default=False)
 is_published=models.BooleanField(default=True)
 created_at=models.DateTimeField(auto_now_add=True)
 updated_at=models.DateTimeField(auto_now=True)
 class Meta:
  ordering=['-published_at','-id']
  verbose_name='Blog članak'
 verbose_name_plural='Blogovi'
 def __str__(self): return self.title

class BlogPostImage(models.Model):
 post=models.ForeignKey(BlogPost,on_delete=models.CASCADE,related_name='images')
 image=models.FileField(upload_to='blog/gallery/',validators=[FileExtensionValidator(['jpg','jpeg','png','webp','gif'])])
 caption=models.CharField(max_length=220,blank=True)
 order=models.PositiveIntegerField(default=0)
 class Meta:
  ordering=['order','id']
  verbose_name='Slika bloga'
  verbose_name_plural='Galerija bloga'
 def __str__(self): return self.caption or f'Slika: {self.post.title}'
