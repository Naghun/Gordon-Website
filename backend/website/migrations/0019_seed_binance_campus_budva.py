from datetime import datetime

from django.db import migrations
from django.utils import timezone


TITLE = 'Binance Campus Montenegro u Budvi: GordonDM među regionalnim Web3 liderima'
SLUG = 'binance-campus-montenegro-budva-gordondm'
EXCERPT = (
    'Binance Campus Montenegro u Budvi spojio je kripto edukaciju, regionalni networking '
    'i iskustvo zajednice, a GordonDM je događaj zabilježio iz prve ruke.'
)
CONTENT = '''## Binance Campus Montenegro u Budvi

Sredinom juna 2025. Budva je bila mjesto susreta kripto profesionalaca, kreatora sadržaja, osnivača i članova zajednice iz različitih dijelova Evrope i šireg regiona. Binance Campus Montenegro donio je višednevni format u kojem su se edukativni program, razgovori s ljudima iz industrije i networking nastavili i izvan konferencijske sale.

Maestral Resort na crnogorskoj obali dao je događaju okruženje koje je istovremeno bilo profesionalno i dovoljno opušteno za otvorene razgovore. Predavanja, prezentacije, zajedničke večere i aktivnosti na moru nisu bili odvojeni dijelovi programa, nego različiti načini da se ljudi koji rade u Web3 industriji upoznaju i razmijene iskustva.

## Znanje prije buke

Vrijednost ovakvog kripto događaja nije u velikim riječima nego u kvalitetu pitanja koja otvara. Kako blockchain proizvode učiniti razumljivijim? Kako sigurnost i odgovorno korištenje digitalne imovine staviti ispred kratkoročnog uzbuđenja? Kako lokalne zajednice povezati s globalnim znanjem bez gubitka regionalnog konteksta?

Program Binance Campusa bio je usmjeren na učenje, razmjenu perspektiva i povezivanje ljudi koji kripto industriju posmatraju iz različitih uglova. Upravo takav format pomaže da se razgovor pomjeri od praćenja cijena prema stvarnim proizvodima, korisničkom iskustvu, edukaciji i dugoročnom razvoju Web3 ekosistema.

## GordonDM na Binance Campus Montenegro

GordonDM je u Budvi pratio događaj iz prve ruke i pripremio ekskluzivnu video priču za regionalnu publiku. Cilj nije bio zabilježiti samo binu i službeni program, nego prenijeti cjelokupno iskustvo: dolazak zajednice, razgovore između sesija, atmosferu uz more i kontakte koji nastaju kada se regionalni kreatori i ljudi iz industrije nađu na istom mjestu.

Učešće na Binance Campus Montenegro predstavlja nastavak GordonDM fokusa na kripto edukaciju i približavanje globalnih Web3 tema publici na Balkanu. Kroz sadržaj, intervjue i prisustvo na događajima, složene teme mogu dobiti jasniji lokalni kontekst i postati korisnije ljudima koji tek ulaze u industriju, ali i timovima koji već razvijaju proizvode i zajednice.

## Zašto su regionalna povezivanja važna

Balkan ima tehnički talent, kreativce, poduzetnike i sve aktivniju kripto zajednicu, ali je za ozbiljniji razvoj potrebna bolja povezanost. Događaji poput Binance Campusa omogućavaju direktan kontakt s ljudima koji rade na međunarodnim tržištima, razmjenu iskustava i stvaranje saradnji koje se teško mogu zamijeniti komunikacijom na daljinu.

Za regionalne projekte taj kontakt može značiti jasnije razumijevanje tržišta, kvalitetniju komunikaciju i pristup ljudima koji su već prošli dio puta od ideje do proizvoda. Za širu publiku znači dostupnije znanje i više sadržaja na jeziku i u kontekstu koji poznaje.

## Događaj koji se nastavio izvan konferencijske sale

Fotografije iz Budve pokazuju zašto je Campus format drugačiji od jednodnevne konferencije. Uz predavanja i prezentacije, program je uključivao networking na otvorenom, zajedničke večere i iskustvo crnogorske obale. Takav ritam ostavlja više prostora za stvarne razgovore, upoznavanje ljudi i povezivanje ideja.

Vizuelni identitet Binancea bio je prisutan kroz cijeli događaj, ali je glavnu priču ipak činila zajednica. Od pune sale i razgovora uz more do neformalnih trenutaka na brodu, svaki dio programa doprinosio je osjećaju da se Web3 ekosistem gradi kroz ljude, povjerenje i kontinuiranu razmjenu znanja.

## Budva kao dio šire Web3 priče Balkana

Binance Campus Montenegro pokazao je da regionalna kripto scena može biti domaćin događaja međunarodnog karaktera i mjesto na kojem se spajaju edukacija, produkcija sadržaja i poslovno povezivanje. Budva je na nekoliko dana postala tačka susreta globalne industrije i balkanske perspektive.

Za GordonDM ova priča ne završava objavom fotografija. Ona je dio dugoročnog rada na jačanju svijesti o odgovornoj primjeni kripta, promociji regionalnih talenata i stvaranju sadržaja koji ljudima pomaže da razumiju smjer u kojem se Web3 razvija. Video i galerija u nastavku donose naš pogled na Binance Campus Montenegro — iz publike, iza kamere i među ljudima koji grade zajednicu.'''


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
            'cover_image': 'blog/covers/binance-campus-budva.jpg',
            'location': 'Maestral Resort, Budva, Crna Gora',
            'video_url': 'https://www.youtube.com/watch?v=PY72dQklLP4&t=406s',
            'published_at': timezone.make_aware(datetime(2025, 6, 19, 12, 0)),
            'is_featured': True,
            'is_published': True,
        },
    )
    captions = [
        'Binance Campus iskustvo na crnogorskoj obali',
        'Networking zajednice na Binance Campus Montenegro',
        'Edukativni program i prezentacije u Budvi',
        'GordonDM na Binance Campus Montenegro',
        'Zajednička večera i razgovori učesnika',
        'Razgovori i sadržaj na moru',
        'Aktivnosti zajednice izvan konferencijske sale',
        'Akreditacije GordonDM tima za Binance Campus',
        'Portret sa Binance Campus Montenegro',
    ]
    BlogPostImage.objects.filter(post=post).delete()
    BlogPostImage.objects.bulk_create([
        BlogPostImage(
            post=post,
            image=f'blog/gallery/binance-campus-budva/binance-campus-budva-{index:02d}.jpg',
            caption=caption,
            order=index,
        )
        for index, caption in enumerate(captions, start=1)
    ])


def remove_article(apps, schema_editor):
    apps.get_model('website', 'BlogPost').objects.filter(slug=SLUG).delete()


class Migration(migrations.Migration):
    dependencies = [('website', '0018_seed_superteam_balkan_split')]
    operations = [migrations.RunPython(add_article, remove_article)]
