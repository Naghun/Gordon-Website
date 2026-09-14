# Gordon Work

Lokalni pregled: http://127.0.0.1:5173/dashboard/work
Demo: http://127.0.0.1:5173/dashboard/work?demo=1

## Pristup i podaci

Prijava koristi postojeće Django korisničke račune. Administrator kreira aktivne račune u administraciji; običnom članu nije potreban pristup administraciji. Svaki korisnik ima privatni Inbox. Vlasnik projekta dodaje postojeće korisnike njihovim korisničkim imenom. Članovi vide i uređuju zadatke zajedničkog projekta te ih dodjeljuju članovima tog projekta. Vlasnik uređuje pozadinu i liste.

Timski projekti i zadaci čuvaju se u bazi. Otvorena stranica provjerava izmjene svakih 15 sekundi. Provjera verzije sprečava prepisivanje tuđe novije izmjene; tada treba ponovo otvoriti osvježenu karticu. Komentari se objavljuju dugmetom Sačuvaj.

Demo je odvojen i ostaje u lokalnom pregledniku. Prvi ulazak prenosi prethodni `gordon-work-v1` u `gordon-work-v2`, bez brisanja stare kopije. Demo podaci se ne prenose automatski u zajedničku bazu.

## Korištenje

- Inbox, Planer i Tabla uključuju se nezavisno u donjoj traci. Projekti otvara izbor i kreiranje projekta.
- Dodaj karticu ili plus u listi: naslov + Enter; Shift+Enter pravi novi red.
- Klik na karticu otvara opis, člana, rok, prioritet, oznaku, korake, komentare i aktivnost.
- Završen zadatak prelazi u Završeni. Arhiva sklanja karticu; brisanje je premješta u Korpu. Oba prikaza nude vraćanje. Inbox ima svoje odvojene prikaze.
- Prevlačenje mijenja listu, a u Planeru rok. Planer pokazuje lične i dodijeljene nezavršene zadatke.
- Pozadina: šest gradijenata, tri lokalno spremljene besplatne fotografije i vlastita JPG/PNG/WebP slika do 10 MB. Slika se smanjuje prije čuvanja; najveća dozvoljena pohranjena slika je oko 1,5 MB. Izvori fotografija su u `public/work-backgrounds/CREDITS.md`.

## Pokretanje i provjere

Instalirati backend requirements (uključuje Pillow), pokrenuti migracije i oba lokalna servera. Migracija 0029 dodaje WorkProject i WorkTask. API koristi prijavljenu sesiju i CSRF zaštitu. Svaki upit provjerava članstvo, uključujući direktan pristup zadatku.

Provjere: `python manage.py test website.test_work`; frontend `npm run build` uključuje postojeće SEO provjere. Ova izmjena nije objava na produkciju.

## Saradnja i AI uvoz — druga dorada

- Migracija 0030 dodaje podzadatke, uloge, priloge, obavijesti i evidenciju uvoza. Pokrenuti sve migracije prije otvaranja nove verzije.
- Uloge: vlasnik uređuje članove/boje/liste; član s uređivanjem upravlja zadacima i prilozima; pregled ima samo čitanje. Uklanjanje člana odmah ukida serverski pristup. Već preuzete kopije datoteka se ne mogu povući.
- Prilozi do 5 MB, najviše 20 po zadatku, čuvaju se privatno u bazi i preuzimaju kroz provjeru sesije/članstva. Nisu u javnom media direktoriju. Demo podržava do 350 KB po prilogu; browser storage je ograničen.
- @korisničkoime u sačuvanom komentaru šalje obavijest samo postojećem članu projekta. Dodjela i promjena statusa također stvaraju obavijesti. Obavijesti su unutar Worka, bez email/push dostave; osvježavaju se svakih 15 sekundi. Svi moji zadaci uključuje filtere aktivni/kasne/završeni/svi i pretragu kroz projekte.
- Boje omogućavaju pozadinu cijele liste, okvir i kartice. Tekst automatski bira svijetli ili tamni kontrast. Dodana su tri gradijenta Bakar/Laguna/Svemir; prethodne fotografije ostaju.
- AI radi kroz server `/api/work/import/preview/` i OpenAI Responses API sa strukturiranim izlazom, `store:false`, bez alata. Šalju se samo izričito uneseni tekst i pravilnik. Ne šalju se postojeći projekti, korisnici, datoteke ili drugi podaci.
- **Aktivacija:** opozvati ključ otkriven u razgovoru. Novi `OPENAI_API_KEY` postaviti direktno u privatni `backend/.env` ili serverske environment postavke. Model je podesiv kroz `OPENAI_WORK_MODEL`, početno `gpt-4.1-mini`. Restartovati backend. Ključ ne unositi u frontend/VITE varijable. Lokalni serverski ključ je konfigurisan i stvarni OpenAI zahtjev uspješno provjeren 14. 9. 2026. Automatizirani testovi koriste izolirani lažni odgovor.
- Uvoz ima pregled s izmjenom naziva, opisa, rokova i ciljnog projekta, do 10 projekata i ukupno 200 glavnih/podzadataka. Novi projekti su privatni za autora. Spremanje je jedna transakcija; ponavljanje istog tokena ne duplira zadatke. Podzadaci su zasebne kartice s roditeljem, ne samo stavke checkliste.
- Ručni raspored radi bez AI: `# Projekat` ili `Projekat:` otvara projekat; uvučeni red postaje podzadatak. Prikaz jasno razlikuje ovo pravilo od AI analize.
- Provjere: `python manage.py test website.test_work website.test_work_collaboration` (22 testa) i frontend build/SEO provjere.

Dokumentacija integracije: https://developers.openai.com/api/docs/guides/structured-outputs i https://developers.openai.com/api/docs/models/gpt-4.1-mini.

## Dorada kartica, lista i uvoza

- Migracija 0031 dodaje `appearance` svakoj kartici. Njene boje imaju prednost nad bojama liste. Dugme ◐ otvara detalje s bojom kartice i okvira; „Koristi boje liste“ uklanja pojedinačno podešavanje.
- Gornji deblji rub liste je hvatište za prevlačenje (miš i dodir). Meni ⋯ nudi pomjeranje lijevo/desno i uklanjanje liste. Uklanjanje prenosi sve njene zadatke u odabranu preostalu listu, u istoj transakciji. Posljednja lista se ne uklanja.
- „Početni izgled“ vraća Auroru i početne boje lista/kartica, čuva zadatke i redoslijed lista. Reset se odnosi samo na odabrani projekat.
- Novo pravilo uvoza zamjenjuje prethodno pravilo uvlačenja: prvi red bloka je glavni zadatak, svaki sljedeći red podzadatak. Dva ili više Entera (jedan ili više praznih redova) počinju novi glavni zadatak. `#` i `Projekat:` i dalje označavaju projekte. Isti pravilnik je početno postavljen za AI.
- AI analiza sada radi i bez timske prijave u lokalnom demo prikazu. `/api/work/import/local-preview/` zahtijeva DEBUG, lokalni host, loopback klijenta i CSRF. Na produkciji je zatvoren. Demo rezultat se potvrđuje i sprema lokalno, ne u zajedničku bazu.
- U „Poveži AI bez prijave“ korisnik može unijeti novi ključ za jednu analizu, ako server već nema ključ. Ključ se ne sprema u localStorage ili bazu; nakon uspjeha briše se iz stanja forme. Nije uključen u build. Stvarni poziv i dalje zahtijeva važeći ključ; testovi koriste lažni odgovor servisa.
- Dodatne provjere: `node scripts/check-work-import.mjs` i `python manage.py test website.test_work website.test_work_collaboration`.


- Paleta uz naziv liste uređuje samo odabranu listu; plus je uz meni. Podzadaci se otvaraju strelicom na kartici. Završavanje svih aktivnih podzadataka i checklist stavki automatski završava roditelja; ponovno otvaranje koraka vraća roditelja u rad. Vrijedi u demo i timskom prikazu.
- Demo vlasnik prikazuje Abdullah. Prava sesija i dalje zahtijeva postojeću prijavu Abdullah; demo ne daje pristup timskim podacima.

- Paleta uz listu otvara uski popover sa simulatorom. Kružići direktno uređuju status, rub, kartice i pozadinu; spremanje potvrđuje promjene. Globalni pregled boja ostaje dostupan u alatnoj traci.
- Prevlačenje preko gornjeg ruba koristi poluprozirnu kopiju liste, animirano pomjeranje susjeda i označeno mjesto ubacivanja. Raspored se sprema tek na drop; Escape ili puštanje izvan table odustaje. Uz rub table radi automatsko horizontalno pomjeranje.

- Masovni uvoz na vrhu nudi odredišni projekat (početno trenutno otvoreni) i opis posla. Opis može sam pokrenuti AI planiranje; bilješke su opcionalne. Odabrani postojeći projekat objedinjuje predložene zadatke u jednom pregledu. Spremanje je i dalje zasebna potvrda.


## Pregled projekata i razgovor
- Projekti → Svi projekti prikazuje dostupne projekte sa skupljanjem/proširivanjem i unosom kartica u pojedinačne liste.
- Live chat zamjenjuje Inbox panel. Razgovori pripadaju projektu i dostupni su samo članovima; poruke se čuvaju u WorkChatMessage, osvježavaju svake 3 sekunde i starije se učitavaju na zahtjev. Demo razgovor ostaje u lokalnom pregledniku.
- Detalji zadatka prvo prikazuju glavni zadatak, podzadatke, opis i korake. Odgovorna osoba, prioritet i oznaka ostaju sačuvani u podacima, ali su skriveni iz obrasca.
- Podzadaci su vidljivi i na tabli; sve liste se mogu preimenovati kroz meni liste. Klik na pozadinu dijaloga ne odbacuje izmjene tokom izbora boje.
