from django.db import migrations


NEW_VALUES = {
    "page_name": "Početna",
    "primary_keyword": "digitalna rješenja za firme",
    "secondary_keywords": "tehnološki partner BiH\nposlovni softver\nAI automatizacija poslovanja\ndigitalna transformacija\nblockchain razvoj",
    "search_intent": "commercial",
    "title_bs": "Digitalna rješenja, poslovni softver i AI | GordonDM",
    "title_en": "Digital solutions, business software and AI | GordonDM",
    "title_de": "Digitale Lösungen, Unternehmenssoftware und KI | GordonDM",
    "description_bs": "GordonDM je tehnološki partner za digitalna rješenja, poslovni softver, AI automatizaciju, marketing, consulting i blockchain razvoj.",
    "description_en": "GordonDM is a technology partner for digital solutions, business software, AI automation, marketing, consulting and blockchain development.",
    "description_de": "GordonDM ist Ihr Technologiepartner für digitale Lösungen, Unternehmenssoftware, KI-Automatisierung, Marketing, Beratung und Blockchain-Entwicklung.",
    "og_title": "Digitalna rješenja, poslovni softver i AI | GordonDM",
    "og_description": "Softver po mjeri, AI automatizacija, marketing, consulting i blockchain razvoj za digitalni rast poslovanja.",
}


OLD_VALUES = {
    "primary_keyword": "digitalna agencija Sarajevo",
    "secondary_keywords": "digitalna agencija BiH\nagencija za digitalni marketing Sarajevo\ndigitalna rješenja za firme\ntehnološka agencija BiH",
    "search_intent": "local",
    "title_bs": "Digitalna agencija Sarajevo | AI, softver i marketing | GordonDM",
    "title_en": "Digital agency Sarajevo | AI, software and marketing | GordonDM",
    "title_de": "Digitalagentur Sarajevo | KI, Software und Marketing | GordonDM",
    "description_bs": "GordonDM je digitalna agencija iz Sarajeva za AI automatizaciju, poslovni softver, web rješenja, SEO i digitalni marketing usmjeren na rast.",
    "description_en": "GordonDM is a Sarajevo digital agency for AI automation, business software, web solutions, SEO and digital marketing focused on growth.",
    "description_de": "GordonDM ist eine Digitalagentur aus Sarajevo für KI-Automatisierung, Unternehmenssoftware, Weblösungen, SEO und digitales Wachstum.",
}


def update_home(apps, schema_editor):
    SEOPage = apps.get_model("website", "SEOPage")
    SEOPage.objects.filter(route="/").update(**NEW_VALUES)


def restore_home(apps, schema_editor):
    SEOPage = apps.get_model("website", "SEOPage")
    SEOPage.objects.filter(route="/").update(**OLD_VALUES)


class Migration(migrations.Migration):
    dependencies = [("website", "0010_seed_seo_pages")]
    operations = [migrations.RunPython(update_home, restore_home)]
