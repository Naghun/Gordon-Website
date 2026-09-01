from django.db import migrations


def update_domain(apps, schema_editor):
    SEOPage = apps.get_model("website", "SEOPage")
    for page in SEOPage.objects.all():
        changed = []
        for field in ("canonical_url", "og_image"):
            value = getattr(page, field, "") or ""
            updated = value.replace("https://gordondm.com", "https://gordon.ba")
            if updated != value:
                setattr(page, field, updated)
                changed.append(field)
        if changed:
            page.save(update_fields=changed)


def restore_domain(apps, schema_editor):
    SEOPage = apps.get_model("website", "SEOPage")
    for page in SEOPage.objects.all():
        changed = []
        for field in ("canonical_url", "og_image"):
            value = getattr(page, field, "") or ""
            updated = value.replace("https://gordon.ba", "https://gordondm.com")
            if updated != value:
                setattr(page, field, updated)
                changed.append(field)
        if changed:
            page.save(update_fields=changed)


class Migration(migrations.Migration):
    dependencies = [("website", "0021_seed_blog_translations")]
    operations = [migrations.RunPython(update_domain, restore_domain)]
