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
