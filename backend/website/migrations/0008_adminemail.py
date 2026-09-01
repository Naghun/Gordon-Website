from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("website", "0007_chatconversation_admin_seen_at")]
    operations = [
        migrations.CreateModel(
            name="AdminEmail",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("uid", models.CharField(max_length=80, unique=True)),
                ("message_id", models.CharField(blank=True, max_length=255)),
                ("sender_name", models.CharField(blank=True, max_length=180)),
                ("sender_email", models.EmailField(max_length=254)),
                ("recipient", models.CharField(blank=True, max_length=255)),
                ("subject", models.CharField(blank=True, max_length=300)),
                ("body_text", models.TextField(blank=True)),
                ("received_at", models.DateTimeField()),
                ("is_read", models.BooleanField(default=False)),
                ("replied_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"verbose_name": "Email poruka", "verbose_name_plural": "Email poruke", "ordering": ["-received_at"]},
        )
    ]
