from datetime import datetime

from django.db import migrations
from django.utils import timezone


TITLE = 'Bitcoin Pizza Day Sarajevo: zajednica, pizza i priča koja je promijenila kripto'
SLUG = 'bitcoin-pizza-day-sarajevo'
EXCERPT = (
    'Sarajevo je obilježilo Bitcoin Pizza Day — datum koji podsjeća na prvu poznatu '
    'kupovinu fizičkog proizvoda bitcoinom i danas povezuje kripto zajednice širom svijeta.'
)
CONTENT = '''## Dan kada je bitcoin dobio stvarnu upotrebu

Bitcoin Pizza Day obilježava se 22. maja u znak sjećanja na jednu od najpoznatijih transakcija u historiji kriptovaluta. Programer Laszlo Hanyecz je 18. maja 2010. na BitcoinTalk forumu ponudio 10.000 BTC za dvije pizze. Četiri dana kasnije potvrdio je da je razmjena uspješno završena. Taj trenutak ostao je zapamćen kao prvi široko dokumentovan slučaj u kojem je bitcoin poslužio za kupovinu fizičkog proizvoda.

Priča se često prepričava kroz današnju vrijednost tih 10.000 bitcoina, ali njena stvarna važnost je drugačija. U vrijeme kada je Bitcoin bio mali eksperiment poznat uskom krugu ljudi, neko ga je upotrijebio za svakodnevnu kupovinu. Digitalna ideja dobila je praktičnu vrijednost, a zajednica dokaz da kripto može izaći izvan računara i postati sredstvo razmjene među ljudima.

## Sarajevo u znaku Bitcoin Pizza Daya

Na godišnjicu historijske transakcije, 22. maja 2025, kripto zajednica okupila se u Sarajevu uz prepoznatljive Binance Pizza Day vizuale. Ambijent The Coffee Stationa, pizza, razgovori i zajedničke fotografije pretvorili su globalni datum u lokalno iskustvo koje je bilo otvoreno i ljudima koji tek upoznaju svijet digitalne imovine.

Ovakvo okupljanje pokazuje koliko su neformalni događaji važni za razvoj zajednice. Kripto teme često zvuče tehnički i udaljeno, ali razgovor uživo omogućava ljudima da postave pitanja, razmijene iskustva i upoznaju tehnologiju bez pritiska. Upravo taj spoj edukacije, druženja i prepoznatljive priče čini Bitcoin Pizza Day posebnim.

## Više od nostalgije za jednom pizzom

Bitcoin se od 2010. godine razvio u globalnu mrežu, tržište i tehnološki ekosistem. Ipak, osnovna pitanja ostaju jednako važna: kako digitalna imovina može imati praktičnu primjenu, kako je koristiti odgovorno i kako korisnicima jasno objasniti sigurnost, rizike i mogućnosti blockchain tehnologije.

Zbog toga Pizza Day nije samo pogled unazad. On je dobar povod za razgovor o narednoj fazi kripta — jednostavnijim proizvodima, sigurnijem korištenju, kvalitetnijoj edukaciji i rješenjima koja ljudima daju stvarnu vrijednost. Za Sarajevo i širi Balkan takvi događaji pomažu da se globalni Web3 trendovi prevedu u lokalni kontekst.

## Lokalna zajednica gradi regionalnu priču

Bosna i Hercegovina ima developere, kreativce, poduzetnike i korisnike koji aktivno prate blockchain industriju. Redovna okupljanja mogu ih povezati s regionalnim i međunarodnim ekosistemima, otvoriti prostor za nova partnerstva i ohrabriti razvoj proizvoda koji nastaju upravo na Balkanu.

GordonDM kroz kripto događaje, sadržaj i saradnje želi doprinijeti jasnijoj komunikaciji o digitalnoj imovini i jačanju svijesti o njenoj odgovornoj primjeni. Cilj nije graditi priču na kratkoročnom uzbuđenju, nego povezivati ljude, znanje i projekte koji mogu ostaviti dugoročan trag u Sarajevu i regionu.

## Atmosfera sa događaja

Fotografije u nastavku donose dio atmosfere sarajevskog obilježavanja: zajednicu za istim stolom, prepoznatljivu Binance žutu boju i pizzu kao simbol trenutka kada je jedna digitalna valuta prvi put pokazala svoju praktičnu stranu.'''


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
            'cover_logo': 'binance',
            'cover_image': 'blog/covers/bitcoin-pizza-day-sarajevo.jpg',
            'location': 'The Coffee Station, Sarajevo',
            'video_url': 'https://www.instagram.com/reel/DKEGDioItg9/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA==',
            'published_at': timezone.make_aware(datetime(2025, 5, 22, 15, 0)),
            'is_featured': True,
            'is_published': True,
        },
    )
    captions = [
        'Bitcoin Pizza Day u Sarajevu',
        'Druženje kripto zajednice uz Pizza Day program',
        'Tim The Coffee Stationa i gosti događaja',
        'Pizza Day foto-kutak u Sarajevu',
        'Binance Pizza Day atmosfera',
        'Zajednica u centru sarajevskog događaja',
        'Pizza, razgovori i kripto zajednica',
        'Zajednička fotografija učesnika događaja',
        'Binance detalji sa sarajevskog Pizza Daya',
    ]
    BlogPostImage.objects.filter(post=post).delete()
    BlogPostImage.objects.bulk_create([
        BlogPostImage(
            post=post,
            image=f'blog/gallery/pizza-day-sarajevo/pizza-day-{index:02d}.jpg',
            caption=caption,
            order=index,
        )
        for index, caption in enumerate(captions, start=1)
    ])


def remove_article(apps, schema_editor):
    apps.get_model('website', 'BlogPost').objects.filter(slug=SLUG).delete()


class Migration(migrations.Migration):
    dependencies = [('website', '0016_alter_blogpost_options_blogpost_cover_image_and_more')]
    operations = [migrations.RunPython(add_article, remove_article)]
