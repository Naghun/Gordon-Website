from django.db import migrations


ADDITIONS = {
    "gordondm-binance-saradnja": {
        "content": "Partnerstvo tako stvara dugoročnu osnovu za lokalne edukativne programe, kvalitetniju produkciju sadržaja i povezivanje regionalnih organizacija sa provjerenim znanjem globalnog Binance ekosistema.",
        "content_en": "The partnership also creates a long-term foundation for local education programmes, stronger content production and connections between regional organisations and trusted knowledge from the global Binance ecosystem.",
        "content_de": "Die Partnerschaft schafft außerdem eine langfristige Grundlage für lokale Bildungsprogramme, hochwertige Content-Produktion und die Verbindung regionaler Organisationen mit fundiertem Wissen aus dem globalen Binance-Ökosystem.",
    },
    "gordondm-solana-saradnja": {
        "content": "Tehnički dio saradnje dodatno otvara prostor za prototipe, softverske integracije i praktične Solana proizvode koje regionalni timovi mogu razvijati, testirati i predstavljati međunarodnoj publici.",
        "content_en": "The technical side also creates room for prototypes, software integrations and practical Solana products that regional teams can build, test and present to an international audience.",
        "content_de": "Die technische Zusammenarbeit schafft zudem Raum für Prototypen, Softwareintegrationen und praktische Solana-Produkte, die regionale Teams entwickeln, testen und einem internationalen Publikum präsentieren können.",
    },
    "binance-campus-montenegro-budva-gordondm": {
        "content": "Kontakti ostvareni u Budvi nastavljaju živjeti kroz razmjenu iskustava, nove formate sadržaja i buduće regionalne inicijative koje Web3 znanje približavaju kompanijama, timovima i široj publici.",
        "content_en": "Connections made in Budva continue through knowledge exchange, new content formats and future regional initiatives that make Web3 more accessible to companies, teams and wider audiences.",
        "content_de": "Die in Budva entstandenen Kontakte wirken durch Erfahrungsaustausch, neue Content-Formate und künftige regionale Initiativen weiter, die Web3-Wissen Unternehmen, Teams und einem breiteren Publikum zugänglich machen.",
    },
}


def expand_posts(apps, schema_editor):
    BlogPost = apps.get_model("website", "BlogPost")
    for slug, additions in ADDITIONS.items():
        post = BlogPost.objects.filter(slug=slug).first()
        if not post:
            continue
        changed = []
        for field, paragraph in additions.items():
            current = getattr(post, field, "") or ""
            if paragraph not in current:
                setattr(post, field, f"{current.rstrip()}\n\n{paragraph}".strip())
                changed.append(field)
        if changed:
            post.save(update_fields=changed)


class Migration(migrations.Migration):
    dependencies = [("website", "0022_update_live_domain_to_gordon_ba")]
    operations = [migrations.RunPython(expand_posts, migrations.RunPython.noop)]
