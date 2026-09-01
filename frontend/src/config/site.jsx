import {
  Bot,
  ChartNoAxesCombined,
  Code2,
  Coins,
  Lightbulb,
  MessageSquareText,
} from "lucide-react";

export const API = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
export const pages = {
  "/ai-automatizacija": {
    tag: "AI AUTOMATIZACIJA",
    title: "Manje rutine. Više pametnog rada.",
    intro:
      "AI automatizacija poslovanja koja uklanja rutinske zadatke, povezuje alate i vraća vrijeme vašem timu.",
    icon: Bot,
    items: [
      [
        "AI asistenti",
        "Interni i korisnički asistenti povezani s vašim znanjem.",
      ],
      [
        "Automatizacija procesa",
        "Tokovi koji povezuju alate, podatke i vaš tim.",
      ],
      [
        "Pametna obrada podataka",
        "Brža analiza dokumenata, upita i poslovnih informacija.",
      ],
    ],
  },
  "/softver-rjesenja": {
    tag: "SOFTVER RJEŠENJA",
    title: "Softver koji prati vaš način rada.",
    intro:
      "Poslovni softver, web aplikacije i digitalni sistemi razvijeni po mjeri vaših procesa i ciljeva.",
    icon: Code2,
    items: [
      ["Web aplikacije", "Moderne, brze i sigurne aplikacije dostupne svuda."],
      ["Poslovni sistemi", "CRM, portali, dashboardi i alati po mjeri."],
      [
        "Integracije",
        "Povezujemo postojeće sisteme u jednu funkcionalnu cjelinu.",
      ],
    ],
  },
  "/marketing": {
    tag: "DIGITALNI MARKETING",
    title: "Pažnja je dobra. Rezultat je bolji.",
    intro:
      "SEO, sadržaj i digitalne kampanje koje povećavaju vidljivost, grade brend i dovode kvalitetne upite.",
    icon: ChartNoAxesCombined,
    items: [
      [
        "Strategija brenda",
        "Jasna pozicija, poruka i plan digitalnog nastupa.",
      ],
      [
        "Plaćene kampanje",
        "Efikasne kampanje usmjerene na mjerljive rezultate.",
      ],
      [
        "Sadržaj i društvene mreže",
        "Sadržaj koji gradi povjerenje i pokreće akciju.",
      ],
    ],
  },
  "/kripto": {
    tag: "KRIPTO & WEB3",
    title: "Siguran korak u novu digitalnu ekonomiju.",
    intro:
      "Blockchain razvoj, Web3 strategija i sigurne integracije s jasnom poslovnom svrhom.",
    icon: Coins,
    items: [
      ["Web3 strategija", "Procjena prilika i smislen plan primjene."],
      [
        "Blockchain rješenja",
        "Razvoj integracija, platformi i transparentnih procesa.",
      ],
      [
        "Edukacija i podrška",
        "Jasno objašnjavamo tehnologiju, rizike i mogućnosti.",
      ],
    ],
  },
  "/konsulting": {
    tag: "DIGITALNI KONSULTING",
    title: "Dobre odluke prije skupog razvoja.",
    intro:
      "Digitalnu transformaciju pretvaramo u jasan plan tehnologije, prioriteta i konkretnih sljedećih koraka.",
    icon: Lightbulb,
    items: [
      [
        "Digitalna strategija",
        "Plan transformacije prilagođen vašoj poziciji i budžetu.",
      ],
      ["Analiza procesa", "Otkrivamo uska grla i prilike za poboljšanje."],
      [
        "Tehničko savjetovanje",
        "Odabir tehnologija, arhitekture i pouzdanih rješenja.",
      ],
    ],
  },
};
export const nav = [
  ["/ai-automatizacija", "AI Automatizacija"],
  ["/softver-rjesenja", "Softver rješenja"],
  ["/marketing", "Marketing"],
  ["/kripto", "Kripto"],
  ["/konsulting", "Konsulting"],
  ["/blog", "Blog"],
  ["/kontakt", "Kontakt"],
];
export const heroSlides = [
  {
    number: "01",
    eyebrow: "TEHNOLOŠKA RJEŠENJA",
    title: "Digitalna rješenja koja pokreću poslovanje.",
    text: "Kao tehnološki partner razvijamo softver po mjeri, AI automatizacije i digitalne sisteme koji rješavaju stvarne poslovne izazove.",
    to: "/softver-rjesenja",
    icon: Code2,
  },
  {
    number: "02",
    eyebrow: "AI AUTOMATIZACIJA",
    title: "AI automatizacija koja vraća vrijeme timu.",
    text: "Automatizujemo ponavljajuće poslovne procese i povezujemo AI asistente s alatima koje vaš tim već koristi.",
    to: "/ai-automatizacija",
    icon: Bot,
  },
  {
    number: "03",
    eyebrow: "DIGITALNI MARKETING",
    title: "Digitalni marketing usmjeren na rast.",
    text: "SEO optimizacija, sadržaj i kampanje koje povećavaju online vidljivost i pretvaraju pažnju u kvalitetne poslovne upite.",
    to: "/marketing",
    icon: ChartNoAxesCombined,
  },
  {
    number: "04",
    eyebrow: "DIGITALNI KONSULTING",
    title: "Jasan plan za digitalnu transformaciju.",
    text: "Povezujemo poslovne ciljeve, procese i tehnologiju u ostvarivu digitalnu strategiju s jasnim prioritetima.",
    to: "/konsulting",
    icon: Lightbulb,
  },
  {
    number: "05",
    eyebrow: "KRIPTO & WEB3",
    title: "Blockchain rješenja s poslovnom svrhom.",
    text: "Razvijamo Web3 strategije, blockchain integracije i digitalne proizvode koji imaju jasan razlog, sigurnost i vrijednost.",
    to: "/kripto",
    icon: Coins,
  },
  {
    number: "06",
    eyebrow: "KONTAKT",
    title: "Počnimo od vaše ideje.",
    text: "Recite nam šta želite unaprijediti, a mi ćemo predložiti jasan i ostvariv sljedeći korak.",
    to: "/kontakt",
    icon: MessageSquareText,
  },
];
export const seoPages = {
  "/": {
    title: "Digitalna rješenja, poslovni softver i AI | GordonDM",
    description:
      "GordonDM je tehnološki partner za digitalna rješenja, poslovni softver, AI automatizaciju, marketing, consulting i blockchain razvoj.",
  },
  "/ai-automatizacija": {
    title: "AI automatizacija poslovnih procesa | GordonDM",
    description:
      "AI asistenti, automatizacija poslovnih procesa i pametne integracije koje štede vrijeme, povezuju podatke i ubrzavaju rad vašeg tima.",
  },
  "/softver-rjesenja": {
    title: "Poslovni softver i web aplikacije po mjeri | GordonDM",
    description:
      "Razvoj poslovnog softvera, web aplikacija, CRM sistema i integracija prilagođenih procesima vaše kompanije.",
  },
  "/marketing": {
    title: "SEO optimizacija i Google Ads marketing | GordonDM",
    description:
      "SEO optimizacija, Google Search i Display oglasi, Meta kampanje, sadržaj i analitika za kvalitetne upite i mjerljiv rast poslovanja.",
  },
  "/kripto": {
    title: "Web3 i blockchain rješenja | GordonDM",
    description:
      "Web3 strategija, blockchain integracije i konsultacije za sigurnu i održivu primjenu novih digitalnih tehnologija.",
  },
  "/konsulting": {
    title: "Digitalni i tehnološki konsalting | GordonDM",
    description:
      "Digitalna strategija, analiza poslovnih procesa i tehničko savjetovanje za kvalitetnije odluke prije razvoja.",
  },
  "/kontakt": {
    title: "Kontakt GordonDM Sarajevo | Pokrenimo digitalni projekat",
    description:
      "Kontaktirajte GordonDM tim u Sarajevu za AI automatizaciju, poslovni softver, SEO, digitalni marketing, consulting ili blockchain razvoj.",
  },
  "/blog": {
    title: "Blog o softveru, AI, marketingu i Web3 | GordonDM",
    description: "GordonDM blog donosi novosti o saradnjama, poslovnom softveru, AI automatizaciji, digitalnom marketingu, blockchainu i Web3 tehnologiji.",
  },
};
