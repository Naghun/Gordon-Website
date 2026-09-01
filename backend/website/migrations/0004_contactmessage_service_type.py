from django.db import migrations, models

class Migration(migrations.Migration):
 dependencies=[('website','0003_alter_chatconversation_options')]
 operations=[migrations.AddField(model_name='contactmessage',name='service_type',field=models.CharField(blank=True,max_length=120))]
