# GordonDM — postavljanje live

Projekt je pripremljen za rad na `https://gordon.ba` sa React frontendom i Django API/admin dijelom na istom domenu.

## 1. Produkcijske varijable

Kopirati `backend/.env.production.example` u `backend/.env`, zatim obavezno unijeti:

- novi, dugi `SECRET_KEY`;
- MySQL/MariaDB podatke;
- stvarne SMTP i IMAP podatke;
- tačan domen u `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` i `CSRF_TRUSTED_ORIGINS`.

Datoteku `backend/.env` ne postavljati u javni direktorij niti slati u Git.

## 2. Backend

```powershell
python -m pip install -r backend/requirements.txt
python backend/manage.py check --deploy
python backend/manage.py migrate
python backend/manage.py collectstatic --noinput
```

Na trenutnom Verpex/cPanel hostingu backend je montiran na `/backend`. Web server treba usmjeriti:

- `/backend/api/` i `/backend/admin/` na Django WSGI aplikaciju;
- `/backend/static/` na prikupljene Django statičke datoteke;
- `/backend/media/` na trajni direktorij s javnim medijima.

Direktorij `backend/media/` mora biti uključen u backup jer sadrži covere i galerije blogova.

## 3. Frontend

Prije svakog builda nakon objave ili izmjene bloga izvesti javni snapshot iz iste baze
koja se objavljuje. Izvoz uključuje samo objavljene članke, bez privatnih podataka:

```powershell
.\.venv\Scripts\python.exe backend/manage.py export_public_blog --output content/published-blog.json
```

`generate-static-seo.mjs` iz tog snapshota generiše puni tekst članaka i sitemap.
Izmjenu u blog administraciji prati novi izvoz, build i postavljanje; sama izmjena
u bazi još ne osvježava statički HTML na hostingu. Build prekida rad ako snapshot
nedostaje ili sadrži nevažeće/duple slugove.

Javni kontakt i poslovni schema podaci imaju zajednički izvor
`frontend/src/config/business.js`. Za email obavijesti u produkcijskom `.env`
postaviti `CONTACT_RECIPIENT=kontakt@gordondm.com`; postojeće SMTP podatke ne
mijenjati bez provjere. Upiti se spremaju u administraciji i kad SMTP nije dostupan.

Lokalni Gordon Work prototip nije javna ruta i ne dodaje se u sitemap niti hosting
pravila. Nove kontakt/SEO izmjene prvo se provjeravaju lokalno.

Produkcijski frontend koristi relativni API `/backend/api`, pa radi na istom domenu bez lokalnih adresa.

```powershell
cd frontend
npm install
npm run build
```

Sadržaj `frontend/dist/` postaviti u javni web direktorij. Za React rute web server mora vraćati `index.html` kada tražena datoteka ne postoji.

## 4. Završna provjera

- otvoriti `/`, `/blog` i sva tri event članka;
- poslati probnu kontakt poruku i provjeriti Django admin;
- provjeriti `/robots.txt`, `/sitemap.xml`, `/llms.txt` i `/backend/admin/`;
- potvrditi da se slike učitavaju preko HTTPS-a;
- napraviti prvi backup baze i `backend/media/` direktorija.
