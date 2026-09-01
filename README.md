# GordonDM — Django + React

Web stranica GordonDM tehnološkog partnera za softverska rješenja, AI automatizaciju, digitalni marketing, consulting i Web3. React frontend koristi Django REST API, dok kontakt poruke, blogovi, SEO sadržaj i notifikacije imaju upravljanje kroz Django administraciju.

## Lokalno pokretanje

Otvorite dva terminala u ovom folderu.

Backend:

```powershell
.\.venv\Scripts\python.exe .\backend\manage.py runserver
```

Frontend:

```powershell
cd frontend
npm run dev
```

Stranica: http://localhost:5173  
Administracija: http://localhost:8000/admin

Za administratorski račun pokrenite:

```powershell
.\.venv\Scripts\python.exe .\backend\manage.py createsuperuser
```

## Baza

Lokalno se automatski koristi SQLite. Za Verpex kopirajte `backend/.env.example` u `backend/.env` i unesite MySQL/MariaDB podatke. Ako je `DB_NAME` postavljen, Django automatski koristi MySQL.

## Struktura repozitorija

- `frontend/` — React/Vite korisnički interfejs i javni SEO resursi;
- `backend/` — Django API, administracija, migracije, predlošci i javni blog mediji;
- `seo-keyword-mapa.csv` i `seo-keywords-gordondm.txt` — pripremljena SEO mapa i lista ključnih riječi;
- `DEPLOYMENT.md` — kontrolisana procedura postavljanja na `gordon.ba`.

Privatne `.env` datoteke, lokalna SQLite baza, dependency folderi, sirove event fotografije i deployment arhive namjerno nisu dio repozitorija.

## Git workflow

Izmjene se prvo razvijaju i provjeravaju lokalno. Nakon uspješnog builda i Django provjere šalju se na `main` granu. GitHub čuva izvorni kod, ali sam po sebi ne mijenja live stranicu; postavljanje na Verpex radi se zasebno i isključivo za `gordon.ba`.

## Live postavljanje

Kompletna produkcijska procedura i potrebne varijable nalaze se u [DEPLOYMENT.md](./DEPLOYMENT.md).
