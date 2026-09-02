import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const distRoot = join(projectRoot, "dist");
const sourceHtml = await readFile(join(distRoot, "index.html"), "utf8");

const pages = [
  {
    path: "/",
    title: "Digitalna rješenja, poslovni softver i AI | GordonDM",
    description: "GordonDM je tehnološki partner iz Sarajeva za poslovni softver, AI automatizaciju, SEO i digitalni marketing, consulting te blockchain i Web3 razvoj.",
    eyebrow: "GORDONDM · TEHNOLOŠKI PARTNER",
    h1: "Digitalna rješenja koja pokreću poslovanje.",
    intro: "GordonDM povezuje razvoj poslovnog softvera, AI automatizaciju, digitalni marketing, tehnološki konsalting i Web3 ekspertizu. Kompanijama u Sarajevu, Bosni i Hercegovini i regiji pomažemo da složene poslovne izazove pretvore u jasne, sigurne i mjerljive digitalne sisteme.",
    sections: [
      ["SaaS, enterprise softver i web aplikacije po mjeri", "Razvijamo SaaS platforme, enterprise rješenja, web aplikacije, CRM sisteme, interne portale, dashboarde i API integracije prema načinu na koji vaš tim stvarno radi. Prije razvoja mapiramo korisnike, procese, podatke i očekivani poslovni rezultat kako bi novo softversko rješenje smanjilo ručni rad i moglo rasti zajedno s kompanijom."],
      ["AI automatizacija poslovnih procesa", "AI asistente i automatizovane tokove povezujemo s alatima koje tim već koristi. Automatizacija može ubrzati obradu upita i dokumenata, unos podataka, internu komunikaciju, izvještavanje i korisničku podršku, uz kontrolu ljudi tamo gdje je ona važna."],
      ["SEO i digitalni marketing usmjereni na rast", "Tehnički SEO, sadržaj, Google Ads, Meta kampanje i analitiku povezujemo u sistem koji povećava online vidljivost i dovodi kvalitetne poslovne upite. Odluke zasnivamo na pretragama, ponašanju korisnika i konverzijama, a ne samo na broju klikova."],
      ["Digitalni consulting, blockchain i Web3", "Pomažemo kompanijama da prije ulaganja definišu digitalnu strategiju, prioritete, tehnologiju i realan plan realizacije. Za blockchain i Web3 projekte procjenjujemo poslovnu svrhu, sigurnost, integracije i način na koji novu tehnologiju treba približiti korisnicima na Balkanu."],
    ],
  },
  {
    path: "/ai-automatizacija",
    title: "AI automatizacija poslovnih procesa | GordonDM",
    description: "AI asistenti i automatizacija poslovnih procesa za kompanije koje žele povezati podatke, ukloniti rutinske zadatke i ubrzati rad tima.",
    eyebrow: "AI AUTOMATIZACIJA",
    h1: "AI automatizacija koja vraća vrijeme vašem timu.",
    intro: "Projektujemo AI asistente i automatizovane poslovne tokove koji rade s vašim dokumentima, podacima i postojećim alatima. Cilj nije dodati još jednu aplikaciju, nego ukloniti ponavljanje i ubrzati posao koji tim svakodnevno obavlja.",
    sections: [
      ["Automatizacija poslovnih procesa", "Analiziramo gdje se informacije ručno prepisuju, gdje zahtjevi čekaju i koji koraci mogu postati pouzdan automatizovan tok. Rješenje povezujemo s jasnim pravilima, kontrolnim tačkama i odgovornim korištenjem AI tehnologije."],
      ["AI asistenti i povezivanje podataka", "Interni asistenti mogu pretraživati bazu znanja, pripremati odgovore, obrađivati dokumente i pomagati zaposlenicima. Integracijama povezujemo CRM, email, obrasce, baze podataka i druge sisteme koje kompanija već koristi."],
      ["Razvoj, mjerenje i unapređenje", "Automatizaciju prvo testiramo na konkretnom procesu, mjerimo uštedu vremena i kvalitet rezultata, a zatim je postepeno širimo. Tako tim dobija praktično AI rješenje koje može kontrolisati i razumjeti."],
    ],
  },
  {
    path: "/softver-rjesenja",
    title: "Poslovni softver i web aplikacije po mjeri | GordonDM",
    description: "Razvoj SaaS platformi, enterprise rješenja, poslovnog softvera, web aplikacija, CRM sistema, portala, web shopova i API integracija.",
    eyebrow: "SOFTVER RJEŠENJA",
    h1: "Poslovni softver koji prati vaš način rada.",
    intro: "GordonDM razvija SaaS platforme, enterprise rješenja, web aplikacije, poslovne sisteme i digitalne proizvode po mjeri. Od prve analize do produkcije fokus ostaje na korisniku, sigurnosti, brzini i rezultatu koji softver treba ostvariti.",
    sections: [
      ["Web aplikacije, portali i web shopovi", "Gradimo brze i responzivne web aplikacije dostupne timu i klijentima na svakom uređaju. Korisničko iskustvo, administracija sadržaja i pouzdana tehnička arhitektura planiraju se kao jedna cjelina."],
      ["SaaS platforme i enterprise sistemi", "Projektujemo skalabilna SaaS rješenja za proizvode dostupne većem broju korisnika te enterprise sisteme koji povezuju složene procese, uloge i podatke unutar organizacije. CRM, radni nalozi, dashboardi i klijentski portali prilagođavaju se stvarnom toku posla umjesto da tim prisiljavaju na generičan proces."],
      ["API integracije i automatizacije", "Povezujemo postojeće servise i baze kako informacije ne bi ostajale u odvojenim sistemima. Nakon lansiranja pratimo korištenje, uklanjamo trenje i razvijamo proizvod zajedno s poslovanjem."],
    ],
  },
  {
    path: "/marketing",
    title: "SEO optimizacija i digitalni marketing | GordonDM",
    description: "SEO optimizacija, Google Ads, Meta kampanje, sadržaj i analitika za veću online vidljivost i kvalitetne poslovne upite.",
    eyebrow: "DIGITALNI MARKETING",
    h1: "Digitalni marketing koji pretvara pažnju u rezultat.",
    intro: "Povezujemo SEO optimizaciju, Google Ads, Meta kampanje, content marketing i analitiku za kompanije u Sarajevu, cijeloj Bosni i Hercegovini i na Balkanu. Svaki kanal dobija jasnu ulogu u putu od pretrage do kvalitetnog upita.",
    sections: [
      ["Tehnički SEO i sadržaj", "Istraživanje ključnih riječi, strukturu stranice, meta podatke, interne linkove, brzinu i sadržaj usklađujemo s namjerom korisnika. Cilj je dugoročna organska vidljivost za usluge koje kompanija zaista nudi."],
      ["Google Ads i Meta kampanje", "Search, Display i kampanje na društvenim mrežama povezujemo s jasnom porukom i odredišnom stranicom koja konvertuje. Budžet usmjeravamo prema upitima i publikama s najvećim poslovnim potencijalom."],
      ["Analitika i optimizacija konverzija", "Pratimo organski promet, cijenu, konverzije i kvalitet upita. Izvještaj pokazuje šta donosi rezultat i koji sljedeći potez može unaprijediti prodaju, vidljivost ili povrat ulaganja."],
    ],
  },
  {
    path: "/kripto",
    title: "Web3 i blockchain rješenja | GordonDM",
    description: "Web3 strategija, blockchain integracije, razvoj digitalnih proizvoda, edukacija i sigurna primjena blockchain tehnologije na Balkanu.",
    eyebrow: "KRIPTO · WEB3 · BLOCKCHAIN",
    h1: "Blockchain rješenja s jasnom poslovnom svrhom.",
    intro: "Pomažemo timovima da razumiju gdje blockchain donosi stvarnu vrijednost, kako oblikovati Web3 proizvod i kako tehnologiju odgovorno predstaviti korisnicima. Fokus je na sigurnosti, primjeni i dugoročnom razvoju zajednice.",
    sections: [
      ["Web3 strategija i procjena prilike", "Prije prve linije koda provjeravamo korisnički problem, poslovni model, tehnički rizik i razlog zbog kojeg decentralizovana infrastruktura ima smisla. Rezultat je realan plan umjesto odluke zasnovane na tržišnoj buci."],
      ["Blockchain razvoj i integracije", "Razvijamo integracije, pametne ugovore i digitalne proizvode s jasnim pravilima, kontrolom pristupa i planom testiranja. Sigurnost walleta, ključeva i podataka posmatramo kao dio proizvoda, ne kao naknadni dodatak."],
      ["Kripto edukacija i događaji na Balkanu", "Kroz sadržaj, radionice, intervjue i regionalne događaje približavamo Web3 tehnologiju developerima, kompanijama i široj publici. GordonDM povezuje Sarajevo i Balkan s ljudima i zajednicama koje grade globalni ekosistem."],
    ],
  },
  {
    path: "/konsulting",
    title: "Digitalni i tehnološki konsalting | GordonDM",
    description: "Digitalna strategija, analiza poslovnih procesa i tehnološko savjetovanje za sigurnije odluke prije razvoja i ulaganja.",
    eyebrow: "DIGITALNI KONSULTING",
    h1: "Jasan plan za digitalnu transformaciju poslovanja.",
    intro: "Digitalni consulting povezuje poslovni cilj, procese, korisnike i tehnologiju prije kupovine alata ili početka skupog razvoja. Pomažemo rukovodstvu da odredi prioritete i napravi ostvariv plan realizacije.",
    sections: [
      ["Digitalna strategija", "Definišemo problem, mjerljiv rezultat, prioritete i faze projekta. Kompanija dobija jasniju sliku šta treba razvijati, šta se može unaprijediti postojećim alatima i gdje ulaganje donosi najveću vrijednost."],
      ["Analiza poslovnih procesa", "Mapiramo način na koji tim radi, gdje informacije zapinju i koji koraci stvaraju nepotrebni trošak. Analiza pokazuje prilike za softver, integraciju, AI automatizaciju ili organizacijsku promjenu."],
      ["Tehnološko savjetovanje", "Pomažemo pri izboru arhitekture, platforme, partnera i realnog opsega. Odluke objašnjavamo poslovnim jezikom kako bi odgovorne osobe razumjele korist, rizik i sljedeći korak."],
    ],
  },
  {
    path: "/kontakt",
    title: "Kontakt GordonDM Sarajevo | Pokrenimo digitalni projekat",
    description: "Kontaktirajte GordonDM tim u Sarajevu za AI automatizaciju, poslovni softver, SEO, digitalni marketing, consulting ili Web3 razvoj.",
    eyebrow: "KONTAKT · SARAJEVO",
    h1: "Počnimo od vašeg poslovnog izazova.",
    intro: "Opišite ideju, proces koji želite unaprijediti ili rezultat koji želite postići. GordonDM tim će pregledati kontekst i predložiti konkretan sljedeći korak za softver, AI automatizaciju, marketing, consulting ili blockchain projekat.",
    sections: [
      ["Razgovor prije ponude", "Prvi razgovor služi da razumijemo cilj, postojeće stanje, korisnike, rok i ograničenja. Ne nudimo generičan paket prije nego što znamo koji problem treba riješiti i kako ćete mjeriti uspjeh."],
      ["GordonDM Sarajevo", "Dostupni smo putem kontakt forme, email adrese info@gordondm.com i telefona +387 61 264 263. Adresa je Džemala Bijedića 279L, 71320 Sarajevo, Bosna i Hercegovina."],
    ],
  },
  {
    path: "/blog",
    title: "Blog o softveru, AI, marketingu i Web3 | GordonDM",
    description: "GordonDM blog donosi priče o tehnološkim događajima, partnerstvima, poslovnom softveru, AI automatizaciji, marketingu i Web3 industriji.",
    eyebrow: "GORDONDM BLOG",
    h1: "Novosti, partnerstva i ideje koje dijelimo.",
    intro: "Pratite GordonDM saradnje, regionalne događaje i praktične uvide o softveru, AI automatizaciji, digitalnom marketingu, blockchainu i Web3 tehnologiji. Sadržaj povezujemo s iskustvom ljudi i kompanija iz Sarajeva, Bosne i Hercegovine i Balkana.",
    sections: [
      ["Kripto i Web3 događaji", "Donosimo priče, intervjue i fotografije s događaja koji povezuju regionalnu zajednicu s Binance, Solana i drugim globalnim blockchain ekosistemima."],
      ["Digitalni razvoj poslovanja", "Blog obrađuje i teme vezane za razvoj softvera, AI automatizaciju, SEO, marketing i odluke koje kompanijama pomažu da digitalne projekte pokrenu s jasnijim ciljem."],
    ],
  },
  {
    path: "/faq",
    title: "Česta pitanja o digitalnim uslugama | GordonDM",
    description: "Odgovori na česta pitanja o poslovnom softveru, AI automatizaciji, SEO optimizaciji, digitalnom marketingu, konsultingu i Web3 uslugama GordonDM tima.",
    eyebrow: "FAQ · GORDONDM",
    h1: "Česta pitanja o našim digitalnim uslugama.",
    intro: "Saznajte kako izgleda saradnja s GordonDM timom, koje sisteme razvijamo i kako kompanijama pomažemo kroz AI, softver, marketing, consulting i Web3 ekspertizu.",
    sections: [
      ["Čime se GordonDM bavi?", "GordonDM je tehnološki partner iz Sarajeva za razvoj poslovnog softvera, web aplikacija, AI automatizaciju, SEO i digitalni marketing, tehnološki consulting te blockchain i Web3 projekte."],
      ["Kako počinje saradnja?", "Prvo definišemo cilj, postojeći proces i očekivani rezultat. Nakon analize predlažemo prioritete, realan opseg, faze i konkretan sljedeći korak."],
      ["Da li radite izvan Sarajeva?", "Da. Sarađujemo s kompanijama iz cijele Bosne i Hercegovine, regije i međunarodnih tržišta, dok su sjedište i tim u Sarajevu."],
      ["Kako zatražiti ponudu?", "Pošaljite opis ideje putem kontakt forme ili na info@gordondm.com. Odgovorit ćemo s relevantnim pitanjima i prijedlogom daljeg postupka."],
    ],
  },
];

const blogPages = [
  ["gordondm-binance-saradnja", "GordonDM i Binance potpisali ugovor o saradnji", "Saradnja GordonDM-a i Binance ekosistema usmjerena je na događaje, edukaciju i odgovornu primjenu blockchain tehnologije u Sarajevu i na Balkanu."],
  ["gordondm-solana-saradnja", "GordonDM i Solana potpisali ugovor o saradnji", "Saradnja s fokusom na Solana edukaciju, regionalne događaje, blockchain razvoj i povezivanje Web3 zajednice u Bosni i Hercegovini i na Balkanu."],
  ["bitcoin-pizza-day-sarajevo", "Bitcoin Pizza Day Sarajevo: zajednica i kripto edukacija", "Sarajevo je obilježilo Bitcoin Pizza Day, datum prve poznate kupovine fizičkog proizvoda bitcoinom i važan susret lokalne kripto zajednice."],
  ["superteam-balkan-split-solana-event", "Superteam Balkan Split i budućnost Solana ekosistema", "GordonDM intervjui i priča sa Startup Village Split događaja koji je okupio Superteam Balkan zajednicu, Web3 buildere i regionalne Solana projekte."],
  ["binance-campus-montenegro-budva-gordondm", "Binance Campus Montenegro u Budvi", "GordonDM donosi priču s regionalnog Binance Campus događaja u Budvi koji je povezao edukaciju, Web3 zajednicu, sadržaj i networking."],
].map(([slug, title, description]) => ({
  path: `/blog/${slug}`,
  title: `${title} | GordonDM`,
  description,
  eyebrow: "KRIPTO I WEB3 · GORDONDM BLOG",
  h1: title,
  intro: description,
  sections: [
    ["Regionalna Web3 zajednica", "GordonDM kroz događaje, intervjue i sadržaj povezuje ljude koji razvijaju blockchain projekte sa širom publikom u Sarajevu, Bosni i Hercegovini i na Balkanu."],
    ["Edukacija i odgovorna primjena kripta", "Fokus sadržaja je na znanju, sigurnosti, praktičnoj upotrebi tehnologije i saradnjama koje regionalnim talentima otvaraju prostor unutar globalnog Web3 ekosistema."],
  ],
}));

pages.push(...blogPages);

const staticBlogLinks = blogPages.map((post) => (
  `<article><h3><a href="${post.path}">${post.h1}</a></h3><p>${post.description}</p></article>`
)).join("");

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

function staticBody(page, notFound = false) {
  const sections = page.sections.map(([heading, text]) => `<section><h2>${escapeHtml(heading)}</h2><p>${escapeHtml(text)}</p></section>`).join("");
  const blogSection = notFound ? "" : `<section class="static-blog-links"><h2>Izdvojeno iz GordonDM bloga</h2><p>Pročitajte priče o partnerstvima, događajima, tehnologiji i ljudima koji povezuju Sarajevo i Balkan s globalnim Web3 ekosistemom.</p>${staticBlogLinks}</section>`;
  return `<main class="static-seo-shell" data-static-seo="true"><p>${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.h1)}</h1><p>${escapeHtml(page.intro)}</p>${sections}${blogSection}<nav aria-label="Glavne stranice"><h2>${notFound ? "Nastavite pregled stranice" : "Istražite GordonDM usluge"}</h2><p><a href="/">Početna</a> · <a href="/ai-automatizacija">AI automatizacija</a> · <a href="/softver-rjesenja">Softver rješenja</a> · <a href="/marketing">Marketing</a> · <a href="/kripto">Web3</a> · <a href="/konsulting">Konsulting</a> · <a href="/blog">Blog</a> · <a href="/faq">FAQ</a> · <a href="/kontakt">Kontakt</a></p></nav></main>`;
}

function renderDocument(page, { noindex = false, notFound = false } = {}) {
  const canonical = `https://gordon.ba${page.path === "/" ? "/" : page.path}`;
  let html = sourceHtml
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(page.title)}</title>`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(page.description)}" />`)
    .replace(/<meta name="robots" content="[^"]*"\s*\/>/, `<meta name="robots" content="${noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeHtml(page.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeHtml(page.description)}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace('<div id="root"></div>', `<div id="root">${staticBody(page, notFound)}</div>`);

  const organizationId = "https://gordon.ba/#organization";
  const websiteId = "https://gordon.ba/#website";
  const pageSchema = {
    "@type": page.path === "/faq" ? "FAQPage" : page.path.startsWith("/blog/") ? "BlogPosting" : "WebPage",
    "@id": `${canonical}#webpage`,
    name: page.title,
    url: canonical,
    description: page.description,
    isPartOf: { "@id": websiteId },
    publisher: { "@id": organizationId },
  };
  if (page.path === "/faq") {
    pageSchema.mainEntity = page.sections.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    }));
  }
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": organizationId,
        name: "GordonDM",
        alternateName: "Gordon Digital Marketing",
        url: "https://gordon.ba/",
        logo: "https://gordon.ba/logo-gordondm-dark.png",
        image: "https://gordon.ba/logo-gordondm-dark.png",
        email: "info@gordondm.com",
        telephone: "+38761264263",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Džemala Bijedića 279L",
          addressLocality: "Sarajevo",
          postalCode: "71320",
          addressCountry: "BA",
        },
        areaServed: ["Sarajevo", "Bosna i Hercegovina", "Balkan"],
        knowsAbout: ["AI automatizacija", "SaaS platforme", "Enterprise rješenja", "Poslovni softver", "Digitalni marketing", "Web3", "Digitalni konsalting"],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: "https://gordon.ba/",
        name: "GordonDM",
        publisher: { "@id": organizationId },
      },
      pageSchema,
    ],
  };
  html = html.replace("</head>", `<script id="gordondm-static-schema" type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script></head>`);
  return html;
}

for (const page of pages) {
  const output = page.path === "/"
    ? join(distRoot, "index.html")
    : join(distRoot, "seo-pages", `${page.path.slice(1)}.html`);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, renderDocument(page), "utf8");
}

const notFound = {
  path: "/404",
  title: "Stranica nije pronađena | GordonDM",
  description: "Tražena GordonDM stranica nije pronađena. Vratite se na početnu stranicu ili kontaktirajte naš tim.",
  eyebrow: "404 · STRANICA NIJE PRONAĐENA",
  h1: "Ovdje nema stranice koju tražite.",
  intro: "Link je možda promijenjen ili više nije dostupan. Vratite se na početnu stranicu, pregledajte naše digitalne usluge ili kontaktirajte GordonDM tim.",
  sections: [["Možemo vam pomoći", "GordonDM razvija poslovni softver, AI automatizaciju, digitalni marketing, consulting i Web3 rješenja za kompanije u Sarajevu, Bosni i Hercegovini i regiji."]],
};
await writeFile(join(distRoot, "404.html"), renderDocument(notFound, { noindex: true, notFound: true }), "utf8");

console.log(`Generated ${pages.length + 1} crawler-visible HTML pages.`);
