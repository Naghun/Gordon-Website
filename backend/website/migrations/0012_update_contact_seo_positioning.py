from django.db import migrations


NEW_VALUES = {
    "primary_keyword": "GordonDM kontakt Sarajevo",
    "secondary_keywords": "AI consulting BiH\nizrada softvera upit\nSEO konsultacije Sarajevo\ndigitalni projekat",
    "title_bs": "Kontakt GordonDM Sarajevo | Pokrenimo digitalni projekat",
    "title_en": "Contact GordonDM Sarajevo | Start a digital project",
    "title_de": "Kontakt GordonDM Sarajevo | Digitalprojekt starten",
    "description_bs": "Kontaktirajte GordonDM tim u Sarajevu za AI automatizaciju, poslovni softver, SEO, digitalni marketing, consulting ili blockchain razvoj.",
    "description_en": "Contact the GordonDM team in Sarajevo for AI automation, business software, SEO, digital marketing, consulting or blockchain development.",
    "description_de": "Kontaktieren Sie GordonDM in Sarajevo für KI-Automatisierung, Unternehmenssoftware, SEO, Digitalmarketing, Beratung oder Blockchain-Entwicklung.",
    "og_title": "Kontakt GordonDM Sarajevo | Pokrenimo digitalni projekat",
    "og_description": "Razgovarajte s GordonDM timom o softveru, AI automatizaciji, marketingu, consultingu ili blockchain razvoju.",
}


def update_contact(apps, schema_editor):
    SEOPage = apps.get_model("website", "SEOPage")
    SEOPage.objects.filter(route="/kontakt").update(**NEW_VALUES)


class Migration(migrations.Migration):
    dependencies = [("website", "0011_update_home_seo_positioning")]
    operations = [migrations.RunPython(update_contact, migrations.RunPython.noop)]
