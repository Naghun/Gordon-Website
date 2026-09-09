from django.db import migrations

def update(apps, schema_editor):
    apps.get_model('website','BlogPost').objects.using(schema_editor.connection.alias).filter(slug='superquiz-sarajevo-superteam-balkan-zajednica').update(cover_image='blog/instagram/superquiz-sarajevo-superteam-balkan-zajednica/banner-wide.png')

class Migration(migrations.Migration):
    dependencies=[('website','0027_publish_ai_quiz_articles')]
    operations=[migrations.RunPython(update,migrations.RunPython.noop)]
