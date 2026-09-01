import uuid
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
 dependencies=[('website','0001_initial')]
 operations=[
  migrations.CreateModel(name='ChatConversation',fields=[('id',models.BigAutoField(auto_created=True,primary_key=True,serialize=False,verbose_name='ID')),('token',models.UUIDField(default=uuid.uuid4,editable=False,unique=True)),('name',models.CharField(max_length=120)),('email',models.EmailField(blank=True,max_length=254)),('created_at',models.DateTimeField(auto_now_add=True)),('updated_at',models.DateTimeField(auto_now=True)),('is_closed',models.BooleanField(default=False))],options={'ordering':['-updated_at']}),
  migrations.CreateModel(name='ChatMessage',fields=[('id',models.BigAutoField(auto_created=True,primary_key=True,serialize=False,verbose_name='ID')),('sender',models.CharField(choices=[('visitor','Posjetilac'),('admin','GordonDM')],default='visitor',max_length=10)),('message',models.TextField(max_length=2000)),('created_at',models.DateTimeField(auto_now_add=True)),('conversation',models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,related_name='messages',to='website.chatconversation'))],options={'ordering':['created_at']})
 ]
