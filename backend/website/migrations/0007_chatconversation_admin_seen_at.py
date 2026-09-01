from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("website", "0006_remove_cryptolesson_slug")]

    operations = [
        migrations.AddField(
            model_name="chatconversation",
            name="admin_seen_at",
            field=models.DateTimeField(blank=True, editable=False, null=True),
        ),
    ]
