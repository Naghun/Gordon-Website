import json
import logging
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import URLError
from django.core.cache import cache
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from django.core.mail import EmailMessage
from .models import BlogPost,ChatConversation,ChatMessage,ContactMessage,CryptoEvent,CryptoLesson,Project,SEOPage,Service
from .serializers import BlogPostSerializer,ChatConversationSerializer,ChatMessageSerializer,ContactSerializer,CryptoEventSerializer,CryptoLessonSerializer,ProjectSerializer,SEOPageSerializer,ServiceSerializer
logger=logging.getLogger(__name__)
DEFAULT_SERVICES=[{'id':1,'title':'Web stranice','description':'Brze i upečatljive stranice koje pretvaraju posjetioce u klijente.','icon':'Code2'},{'id':2,'title':'Poslovni softver','description':'Aplikacije skrojene prema procesima i potrebama vašeg tima.','icon':'Layers'},{'id':3,'title':'AI automatizacija','description':'Pametni sistemi koji uklanjaju rutinski posao i štede vrijeme.','icon':'Bot'},{'id':4,'title':'Digitalni marketing','description':'Kampanje i sadržaj koji vaš brend dovode pred pravu publiku.','icon':'Megaphone'}]
class ContentView(APIView):
 def get(self,request):
  services=ServiceSerializer(Service.objects.all(),many=True).data or DEFAULT_SERVICES
  return Response({'services':services,'projects':ProjectSerializer(Project.objects.filter(is_featured=True),many=True).data})
class ContactView(generics.CreateAPIView):
 queryset=ContactMessage.objects.all(); serializer_class=ContactSerializer
 def perform_create(self, serializer):
  contact=serializer.save()
  if settings.CONTACT_RECIPIENT:
   email=EmailMessage(subject=f'Novi GordonDM upit — {contact.name}',body=f'Ime: {contact.name}\nEmail: {contact.email}\nKompanija: {contact.company or "-"}\nVrsta projekta: {contact.service_type or "-"}\n\nPoruka:\n{contact.message}',from_email=settings.DEFAULT_FROM_EMAIL,to=[settings.CONTACT_RECIPIENT],reply_to=[contact.email])
   email.send(fail_silently=True)

class ChatConversationView(generics.CreateAPIView):
 serializer_class=ChatConversationSerializer

class ChatMessagesView(APIView):
 def get_conversation(self,token):
  return generics.get_object_or_404(ChatConversation,token=token)
 def get(self,request,token):
  conversation=self.get_conversation(token)
  return Response({'name':conversation.name,'is_closed':conversation.is_closed,'messages':ChatMessageSerializer(conversation.messages.all(),many=True).data})
 def post(self,request,token):
  conversation=self.get_conversation(token)
  if conversation.is_closed: return Response({'detail':'Razgovor je zatvoren.'},status=400)
  serializer=ChatMessageSerializer(data=request.data)
  serializer.is_valid(raise_exception=True)
  serializer.save(conversation=conversation,sender=ChatMessage.VISITOR)
  conversation.save(update_fields=['updated_at'])
  return Response(serializer.data,status=201)

class CryptoContentView(APIView):
 def get(self,request):
  events=CryptoEvent.objects.filter(is_published=True).prefetch_related('images')
  lessons=CryptoLesson.objects.filter(is_published=True)
  return Response({'events':CryptoEventSerializer(events,many=True,context={'request':request}).data,'lessons':CryptoLessonSerializer(lessons,many=True).data})

class SEOPageListView(APIView):
 authentication_classes=[]
 permission_classes=[]
 def get(self,request):
  pages=SEOPage.objects.filter(is_active=True)
  data=SEOPageSerializer(pages,many=True).data
  return Response({'pages':{item['route']:item for item in data}})

class CryptoMarketView(APIView):
 """Small cached proxy for public Binance market data; no API key is required."""
 authentication_classes=[]
 permission_classes=[]
 symbols=('BTCUSDT','ETHUSDT','XRPUSDT','SOLUSDT','LINKUSDT')
 labels={'BTCUSDT':'Bitcoin','ETHUSDT':'Ethereum','XRPUSDT':'XRP','SOLUSDT':'Solana','LINKUSDT':'Chainlink'}

 def get(self,request):
  cached=cache.get('gordondm_crypto_market')
  if cached: return Response({'source':'cache','assets':cached})
  query=urlencode({'symbols':json.dumps(self.symbols,separators=(',',':')),'type':'MINI'})
  urls=[f'https://data-api.binance.vision/api/v3/ticker/24hr?{query}',f'https://api.binance.com/api/v3/ticker/24hr?{query}']
  try:
   last_error=None
   for url in urls:
    try:
     req=Request(url,headers={'User-Agent':'GordonDM-Market/1.0','Accept':'application/json'})
     with urlopen(req,timeout=6) as response:
      payload=json.loads(response.read().decode('utf-8'))
     break
    except (URLError,TimeoutError,ValueError,json.JSONDecodeError) as exc:
     last_error=exc
   else:
    raise last_error
   by_symbol={item['symbol']:item for item in payload}
   assets=[]
   for symbol in self.symbols:
    item=by_symbol.get(symbol,{})
    try:
     last_price=float(item.get('lastPrice',0))
     open_price=float(item.get('openPrice',0))
     change_percent=((last_price-open_price)/open_price)*100 if open_price else None
    except (TypeError,ValueError,ZeroDivisionError):
     change_percent=None
    assets.append({
     'symbol':symbol.replace('USDT',''),
     'pair':symbol,
     'name':self.labels[symbol],
     'price':item.get('lastPrice'),
     'change_percent':round(change_percent,2) if change_percent is not None else None,
     'high':item.get('highPrice'),
     'low':item.get('lowPrice'),
    })
   cache.set('gordondm_crypto_market',assets,15)
   cache.set('gordondm_crypto_market_stale',assets,3600)
   return Response({'source':'binance','assets':assets})
  except (URLError,TimeoutError,ValueError,KeyError,json.JSONDecodeError) as exc:
   logger.warning('Binance market data unavailable: %s',exc)
   stale=cache.get('gordondm_crypto_market_stale')
   if stale: return Response({'source':'stale-cache','assets':stale})
   return Response({'detail':'Tržišni podaci trenutno nisu dostupni.','assets':[]},status=status.HTTP_503_SERVICE_UNAVAILABLE)

class CryptoEventDetailView(generics.RetrieveAPIView):
 serializer_class=CryptoEventSerializer
 lookup_field='slug'
 def get_queryset(self): return CryptoEvent.objects.filter(is_published=True).prefetch_related('images')

class BlogPostListView(generics.ListAPIView):
 serializer_class=BlogPostSerializer
 authentication_classes=[]
 permission_classes=[]
 def get_queryset(self):
  queryset=BlogPost.objects.filter(is_published=True)
  category=self.request.query_params.get('category')
  queryset=queryset.prefetch_related('images')
  return queryset.filter(category=category) if category else queryset

class BlogPostDetailView(generics.RetrieveAPIView):
 serializer_class=BlogPostSerializer
 lookup_field='slug'
 authentication_classes=[]
 permission_classes=[]
 def get_queryset(self): return BlogPost.objects.filter(is_published=True).prefetch_related('images')
