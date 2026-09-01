from rest_framework import serializers
from .models import BlogPost,BlogPostImage,ChatConversation,ChatMessage,ContactMessage,CryptoEvent,CryptoEventImage,CryptoLesson,Project,SEOPage,Service
class ServiceSerializer(serializers.ModelSerializer):
 class Meta: model=Service; fields='__all__'
class ProjectSerializer(serializers.ModelSerializer):
 class Meta: model=Project; fields='__all__'
class ContactSerializer(serializers.ModelSerializer):
 class Meta: model=ContactMessage; fields=('id','name','email','company','service_type','message','created_at'); read_only_fields=('id','created_at')
class ChatConversationSerializer(serializers.ModelSerializer):
 class Meta: model=ChatConversation; fields=('token','name','email','created_at'); read_only_fields=('token','created_at')
class ChatMessageSerializer(serializers.ModelSerializer):
 class Meta: model=ChatMessage; fields=('id','sender','message','created_at'); read_only_fields=('id','sender','created_at')
class CryptoEventImageSerializer(serializers.ModelSerializer):
 class Meta: model=CryptoEventImage; fields=('id','image','caption','order')
class CryptoEventSerializer(serializers.ModelSerializer):
 images=CryptoEventImageSerializer(many=True,read_only=True)
 class Meta: model=CryptoEvent; fields=('id','title','slug','excerpt','content','event_date','location','cover_image','is_featured','images')
class CryptoLessonSerializer(serializers.ModelSerializer):
 level_label=serializers.CharField(source='get_level_display',read_only=True)
 class Meta: model=CryptoLesson; fields=('id','title','question','answer','level','level_label','order')
class SEOPageSerializer(serializers.ModelSerializer):
 class Meta:
  model=SEOPage
  fields=('route','page_name','title_bs','description_bs','title_en','description_en','title_de','description_de','primary_keyword','secondary_keywords','search_intent','canonical_url','og_title','og_description','og_image','schema_type','is_indexed','updated_at')
class BlogPostSerializer(serializers.ModelSerializer):
 category_label=serializers.SerializerMethodField()
 images=serializers.SerializerMethodField()
 def get_language(self):
  request=self.context.get('request')
  params=getattr(request,'query_params',getattr(request,'GET',{})) if request else {}
  language=params.get('lang','bs')
  return language if language in ('bs','en','de') else 'bs'
 def get_category_label(self,obj):
  labels={
   'bs':dict(BlogPost.CATEGORY_CHOICES),
   'en':{'general':'General','crypto':'Crypto & Web3','marketing':'Marketing','software':'Software','ai':'AI automation','consulting':'Consulting'},
   'de':{'general':'Allgemein','crypto':'Krypto & Web3','marketing':'Marketing','software':'Software','ai':'KI-Automatisierung','consulting':'Beratung'},
  }
  return labels[self.get_language()].get(obj.category,obj.get_category_display())
 def get_images(self,obj):
  return BlogPostImageSerializer(obj.images.all(),many=True,context=self.context).data
 def to_representation(self,instance):
  data=super().to_representation(instance)
  language=self.get_language()
  if language in ('en','de'):
   data['title']=getattr(instance,f'title_{language}') or instance.title
   data['excerpt']=getattr(instance,f'excerpt_{language}') or instance.excerpt
   data['content']=getattr(instance,f'content_{language}') or instance.content
  return data
 class Meta:
  model=BlogPost
  fields=('id','title','slug','excerpt','content','category','category_label','cover_logo','cover_image','location','video_url','published_at','is_featured','images')

class BlogPostImageSerializer(serializers.ModelSerializer):
 class Meta:
  model=BlogPostImage
  fields=('id','image','caption','order')
