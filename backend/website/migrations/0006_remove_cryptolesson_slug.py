from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('website', '0005_cryptoevent_cryptolesson_cryptoeventimage'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='cryptolesson',
            name='slug',
        ),
    ]
