from datetime import datetime

from django.db import migrations
from django.utils import timezone


TITLE = 'Superteam Balkan u Splitu: gdje se gradi budućnost Solana ekosistema'
SLUG = 'superteam-balkan-split-solana-event'
EXCERPT = (
    'Startup Village Split okupio je Superteam Balkan zajednicu, Web3 buildere i ljude koji '
    'Solana ekosistem na Balkanu pretvaraju u projekte, prilike i stvarne proizvode.'
)
CONTENT = '''## Web3 energija koja se osjetila u Splitu

Startup Village Split je od 9. do 18. juna 2025. pretvorio dalmatinski grad u mjesto susreta regionalnih Web3 talenata, osnivača, developera, kreatora i ljudi koji aktivno grade u Solana ekosistemu. Superteam Balkan događaj nije izgledao kao klasična konferencija na kojoj se samo sluša — prostor je bio namijenjen radu, povezivanju, razmjeni iskustava i razgovorima o projektima koji tek trebaju doći do tržišta.

Obim programa i energija zajednice pokazali su da interes za blockchain tehnologiju na Balkanu više nije vezan samo za trgovanje kriptovalutama. U Splitu se govorilo o proizvodima, startupima, grantovima, razvoju vještina i načinima na koje regionalni talent može postati vidljiv unutar globalnog Web3 ekosistema.

## GordonDM intervjui: glasovi ljudi koji grade ekosistem

GordonDM se događaju posvetio kroz terensku video produkciju i razgovore s ljudima iz Superteam Balkan zajednice. Umjesto kratkog promotivnog pregleda, cilj intervjua bio je saznati kako regionalni builderi vide smjer u kojem se kripto industrija kreće i šta je potrebno da blockchain dobije kvalitetniju, sigurniju i korisniju primjenu na Balkanu.

Kamera je zabilježila proces iza sadržaja: pripremu rasvjete, intervju set, razgovore u coworking prostoru i atmosferu između snimanja. Takav pristup daje prostor ljudima koji direktno rade na razvoju zajednice da objasne zašto su mentorstvo, lokalni događaji, dostupno znanje i povezivanje sa svjetskim ekosistemima jednako važni kao i sama tehnologija.

## Šta Superteam Balkan donosi regionalnoj zajednici

Superteam Balkan djeluje kao regionalna mreža koja pomaže talentima i projektima da uđu u Solana ekosistem, pronađu saradnike, razviju ideju i dođu do prilika za finansiranje. Zvanični fokus zajednice obuhvata developere, kreativce, operatere i osnivače koji u Web3 prostoru žele graditi kroz konkretan rad.

Za lokalne timove to znači pristup mentorstvu, grantovima, bounty zadacima, poslovima i ljudima koji razumiju put od prve ideje do proizvoda. Za širi region znači stvaranje infrastrukture zbog koje kvalitetan blockchain projekat ne mora napustiti Balkan da bi dobio međunarodnu podršku i publiku.

## Od kripto spekulacije prema proizvodima koji imaju svrhu

Jedna od najvažnijih poruka ovakvih događaja jeste pomjeranje fokusa sa kratkoročnih tržišnih kretanja prema dugoročnom razvoju. Budućnost kripta neće zavisiti samo od cijene digitalne imovine, nego od aplikacija koje su jednostavne, sigurnih korisničkih iskustava i proizvoda koji rješavaju stvarne probleme.

Solana ekosistem regionalnim developerima pruža prostor za brzo testiranje ideja, razvoj aplikacija i povezivanje sa globalnom zajednicom. Ipak, tehnologija je samo početak. Da bi implementacija kripta na Balkanu bila održiva, potrebni su edukacija, odgovorna komunikacija, kvalitetan dizajn proizvoda i jasna korist za krajnjeg korisnika.

## Split kao tačka povezivanja Balkana i globalnog Web3 tržišta

Startup Village je pokazao koliko fizički prostor može ubrzati saradnju. Kada se osnivači, developeri, kreatori sadržaja i zajednice sretnu na jednom mjestu, ideje se brže provjeravaju, timovi se lakše formiraju, a prilike postaju konkretnije.

Za GordonDM ovaj događaj predstavlja dio šire misije: dokumentovati regionalni kripto razvoj, dati prostor ljudima koji ga pokreću i približiti njihove ideje publici izvan uskog tehnološkog kruga. Razgovori iz Splita nisu samo izvještaj s događaja — oni su zapis o tome kako Balkan pokušava pronaći vlastiti glas u sljedećoj fazi Web3 industrije.

## Pogledajte priču iz Splita

Video u nastavku donosi GordonDM obilazak događaja, razgovore sa Superteam Balkan zajednicom i atmosferu Startup Villagea. Fotografije prikazuju i ono što obično ostane izvan finalnog kadra: pripremu produkcije, intervju prostor i ljude zbog kojih regionalna Web3 scena raste.'''


def add_article(apps, schema_editor):
    BlogPost = apps.get_model('website', 'BlogPost')
    BlogPostImage = apps.get_model('website', 'BlogPostImage')
    post, _ = BlogPost.objects.update_or_create(
        slug=SLUG,
        defaults={
            'title': TITLE,
            'excerpt': EXCERPT,
            'content': CONTENT,
            'category': 'crypto',
            'cover_logo': 'solana',
            'cover_image': 'blog/covers/superteam-balkan-split.jpg',
            'location': 'Startup Village, Split, Hrvatska',
            'video_url': 'https://www.youtube.com/watch?v=BTuhme2f25A&t=28s',
            'published_at': timezone.make_aware(datetime(2025, 6, 9, 12, 0)),
            'is_featured': True,
            'is_published': True,
        },
    )
    captions = [
        'Priprema GordonDM intervju seta na Startup Village Split',
        'Superteam Balkan coworking prostor u Splitu',
        'GordonDM razgovor sa članom Superteam Balkan zajednice',
        'Superteam Balkan zajednica u Splitu',
        'Intervju studio prije početka snimanja',
    ]
    BlogPostImage.objects.filter(post=post).delete()
    BlogPostImage.objects.bulk_create([
        BlogPostImage(
            post=post,
            image=f'blog/gallery/superteam-split/superteam-split-{index:02d}.jpg',
            caption=caption,
            order=index,
        )
        for index, caption in enumerate(captions, start=1)
    ])


def remove_article(apps, schema_editor):
    apps.get_model('website', 'BlogPost').objects.filter(slug=SLUG).delete()


class Migration(migrations.Migration):
    dependencies = [('website', '0017_seed_bitcoin_pizza_day_sarajevo')]
    operations = [migrations.RunPython(add_article, remove_article)]
