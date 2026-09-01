from django.db import migrations


PAGES = [
    {
        "route": "/", "page_name": "Početna", "primary_keyword": "digitalna agencija Sarajevo",
        "secondary_keywords": "digitalna agencija BiH\nagencija za digitalni marketing Sarajevo\ndigitalna rješenja za firme\ntehnološka agencija BiH",
        "search_intent": "local", "schema_type": "WebPage",
        "title_bs": "Digitalna agencija Sarajevo | AI, softver i marketing | GordonDM",
        "title_en": "Digital agency Sarajevo | AI, software and marketing | GordonDM",
        "title_de": "Digitalagentur Sarajevo | KI, Software und Marketing | GordonDM",
        "description_bs": "GordonDM je digitalna agencija iz Sarajeva za AI automatizaciju, poslovni softver, web rješenja, SEO i digitalni marketing usmjeren na rast.",
        "description_en": "GordonDM is a Sarajevo digital agency for AI automation, business software, web solutions, SEO and digital marketing focused on growth.",
        "description_de": "GordonDM ist eine Digitalagentur aus Sarajevo für KI-Automatisierung, Unternehmenssoftware, Weblösungen, SEO und digitales Wachstum.",
    },
    {
        "route": "/ai-automatizacija", "page_name": "AI automatizacija", "primary_keyword": "AI automatizacija poslovanja",
        "secondary_keywords": "automatizacija poslovnih procesa\nAI rješenja za firme\nAI agenti za poslovanje\nAI chatbot za firme\nautomatizacija korisničke podrške",
        "search_intent": "commercial", "schema_type": "Service",
        "title_bs": "AI automatizacija poslovanja i procesa | GordonDM",
        "title_en": "AI business and process automation | GordonDM",
        "title_de": "KI-Automatisierung für Unternehmen und Prozesse | GordonDM",
        "description_bs": "AI automatizacija poslovanja, pametni asistenti i integracije koje uklanjaju rutinske zadatke, povezuju podatke i ubrzavaju rad vašeg tima.",
        "description_en": "AI business automation, intelligent assistants and integrations that remove repetitive work, connect data and accelerate your team.",
        "description_de": "KI-Automatisierung, intelligente Assistenten und Integrationen reduzieren Routinearbeit, verbinden Daten und beschleunigen Ihr Team.",
    },
    {
        "route": "/softver-rjesenja", "page_name": "Softver rješenja", "primary_keyword": "izrada poslovnog softvera",
        "secondary_keywords": "softver po mjeri\nizrada web aplikacija\nrazvoj poslovnog softvera\ncustom softver BiH\nrazvoj CRM sistema\nAPI integracije",
        "search_intent": "transactional", "schema_type": "Service",
        "title_bs": "Izrada poslovnog softvera i web aplikacija | GordonDM",
        "title_en": "Business software and web application development | GordonDM",
        "title_de": "Entwicklung von Unternehmenssoftware und Webanwendungen | GordonDM",
        "description_bs": "Izrada poslovnog softvera, web aplikacija, CRM sistema i API integracija po mjeri stvarnih procesa vaše kompanije u BiH i regiji.",
        "description_en": "Custom business software, web applications, CRM systems and API integrations designed around your company's real processes.",
        "description_de": "Individuelle Unternehmenssoftware, Webanwendungen, CRM-Systeme und API-Integrationen für Ihre realen Geschäftsprozesse.",
    },
    {
        "route": "/marketing", "page_name": "Digitalni marketing", "primary_keyword": "digitalni marketing Sarajevo",
        "secondary_keywords": "SEO optimizacija Sarajevo\nSEO agencija Sarajevo\nGoogle Ads Sarajevo\nlokalni SEO Sarajevo\ncontent marketing BiH\non-page SEO optimizacija",
        "search_intent": "local", "schema_type": "Service",
        "title_bs": "Digitalni marketing i SEO optimizacija Sarajevo | GordonDM",
        "title_en": "Digital marketing and SEO in Sarajevo | GordonDM",
        "title_de": "Digitalmarketing und SEO in Sarajevo | GordonDM",
        "description_bs": "Digitalni marketing u Sarajevu: SEO optimizacija, Google Ads, Meta kampanje, sadržaj i analitika za veću vidljivost i kvalitetne poslovne upite.",
        "description_en": "Digital marketing in Sarajevo: SEO, Google Ads, Meta campaigns, content and analytics for stronger visibility and qualified leads.",
        "description_de": "Digitalmarketing in Sarajevo: SEO, Google Ads, Meta-Kampagnen, Inhalte und Analysen für mehr Sichtbarkeit und qualifizierte Anfragen.",
    },
    {
        "route": "/kripto", "page_name": "Kripto i Web3", "primary_keyword": "blockchain razvoj",
        "secondary_keywords": "Web3 development\nrazvoj Web3 aplikacija\nblockchain consulting\nblockchain integracije\nSolana development\nsmart contract development",
        "search_intent": "commercial", "schema_type": "Service",
        "title_bs": "Blockchain razvoj i Web3 rješenja | GordonDM",
        "title_en": "Blockchain development and Web3 solutions | GordonDM",
        "title_de": "Blockchain-Entwicklung und Web3-Lösungen | GordonDM",
        "description_bs": "Blockchain razvoj, Web3 strategija, Solana aplikacije i integracije za kompanije koje nove tehnologije žele koristiti sigurno i s poslovnom svrhom.",
        "description_en": "Blockchain development, Web3 strategy, Solana applications and integrations for companies seeking secure, purposeful implementation.",
        "description_de": "Blockchain-Entwicklung, Web3-Strategie, Solana-Anwendungen und sichere Integrationen mit klarem geschäftlichem Nutzen.",
    },
    {
        "route": "/konsulting", "page_name": "Digitalni konsulting", "primary_keyword": "digitalna transformacija poslovanja",
        "secondary_keywords": "digitalni konsalting\nIT consulting BiH\ndigitalna strategija\ntehnološko savjetovanje\nanaliza poslovnih procesa\nkonsultacije za digitalizaciju",
        "search_intent": "commercial", "schema_type": "Service",
        "title_bs": "Digitalna transformacija i IT konsalting | GordonDM",
        "title_en": "Digital transformation and IT consulting | GordonDM",
        "title_de": "Digitale Transformation und IT-Beratung | GordonDM",
        "description_bs": "Digitalna transformacija poslovanja, analiza procesa i tehnološko savjetovanje za kompanije koje žele jasan plan, prioritete i sigurnije odluke.",
        "description_en": "Digital transformation, process analysis and technology consulting for companies that need a clear plan, priorities and better decisions.",
        "description_de": "Digitale Transformation, Prozessanalyse und Technologieberatung für klare Pläne, Prioritäten und bessere Entscheidungen.",
    },
    {
        "route": "/kontakt", "page_name": "Kontakt", "primary_keyword": "digitalna agencija Sarajevo kontakt",
        "secondary_keywords": "AI consulting BiH\nizrada softvera upit\nSEO konsultacije Sarajevo\ndigitalni projekat",
        "search_intent": "navigational", "schema_type": "ContactPage",
        "title_bs": "Kontaktirajte digitalnu agenciju GordonDM Sarajevo",
        "title_en": "Contact GordonDM digital agency Sarajevo",
        "title_de": "Kontakt zur Digitalagentur GordonDM Sarajevo",
        "description_bs": "Kontaktirajte GordonDM tim u Sarajevu za AI automatizaciju, poslovni softver, web aplikacije, SEO, marketing i digitalnu transformaciju.",
        "description_en": "Contact the GordonDM team in Sarajevo for AI automation, business software, web applications, SEO, marketing and digital transformation.",
        "description_de": "Kontaktieren Sie GordonDM in Sarajevo für KI-Automatisierung, Unternehmenssoftware, Webanwendungen, SEO und digitale Transformation.",
    },
]


def seed_pages(apps, schema_editor):
    SEOPage = apps.get_model("website", "SEOPage")
    for page in PAGES:
        page["canonical_url"] = "https://gordondm.com" + (page["route"] if page["route"] != "/" else "")
        page["og_title"] = page["title_bs"]
        page["og_description"] = page["description_bs"]
        page["og_image"] = "https://gordondm.com/logo-gordondm-dark.png"
        SEOPage.objects.update_or_create(route=page["route"], defaults=page)


def unseed_pages(apps, schema_editor):
    SEOPage = apps.get_model("website", "SEOPage")
    SEOPage.objects.filter(route__in=[page["route"] for page in PAGES]).delete()


class Migration(migrations.Migration):
    dependencies = [("website", "0009_seopage")]
    operations = [migrations.RunPython(seed_pages, unseed_pages)]
