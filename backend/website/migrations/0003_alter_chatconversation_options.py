from django.db import migrations

class Migration(migrations.Migration):
 dependencies=[('website','0002_chatconversation_chatmessage')]
 operations=[migrations.AlterModelOptions(name='chatconversation',options={'ordering':['-updated_at'],'verbose_name':'Chat razgovor','verbose_name_plural':'Chat razgovori'})]
