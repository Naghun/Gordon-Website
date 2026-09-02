import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronLeft, ChevronRight, ExternalLink, MapPin, PlayCircle, X, ZoomIn } from "lucide-react";
import { API } from "../../config/site";
import "./blog.css";

const fallbackPosts = [
  { id: "binance", title: "GordonDM i Binance potpisali ugovor o saradnji", slug: "gordondm-binance-saradnja", excerpt: "Saradnja GordonDM-a i Binance ekosistema usmjerena je na događaje, edukaciju i jačanje svijesti o odgovornoj primjeni kripta u Sarajevu i na Balkanu.", content: "GordonDM i Binance potpisali su ugovor o saradnji usmjeren na razvoj zajedničkih inicijativa, razmjenu znanja i promociju odgovorne primjene blockchain tehnologije u Bosni i Hercegovini i širem regionu Balkana.\n\nVažan dio saradnje odnosi se na organizaciju događaja, edukativnih susreta i otvorenih razgovora u Sarajevu. Cilj je približiti kripto i Web3 teme ljudima koji žele razumjeti tehnologiju, ali i kompanijama koje istražuju njenu praktičnu poslovnu primjenu.\n\nKroz konferencije, radionice i lokalna okupljanja planirano je povezivanje domaće zajednice sa stručnjacima i predstavnicima blockchain ekosistema koji djeluju na Balkanu. Fokus neće biti samo na promociji kripta, nego i na sigurnosti, odgovornom upravljanju digitalnom imovinom i jasnom razumijevanju rizika.\n\nSaradnja otvara prostor i za kvalitetnije predstavljanje blockchain projekata, marketinške kampanje prilagođene regionalnom tržištu te podršku događajima koji okupljaju developere, poduzetnike, kompanije i nove korisnike. Sarajevo u tom procesu ima potencijal postati važna tačka povezivanja tehnoloških ideja i regionalne Web3 zajednice.\n\nGordonDM će kroz svoje iskustvo u digitalnom marketingu, razvoju softvera, organizaciji sadržaja i lokalnom tržištu doprinositi tome da se globalne kripto teme prevedu u razumljive i korisne inicijative za ljude i kompanije na Balkanu. Konkretni događaji i aktivnosti bit će predstavljeni kroz naredne objave.\n\nPartnerstvo tako stvara dugoročnu osnovu za lokalne edukativne programe, kvalitetniju produkciju sadržaja i povezivanje regionalnih organizacija sa provjerenim znanjem globalnog Binance ekosistema.", category: "crypto", category_label: "Kripto i Web3", cover_logo: "binance", published_at: "2026-08-26T09:00:00+02:00" },
  { id: "solana", title: "GordonDM i Solana potpisali ugovor o saradnji", slug: "gordondm-solana-saradnja", excerpt: "Saradnja GordonDM-a i Solana ekosistema povezuje događaje, edukaciju i razvoj praktičnih blockchain inicijativa u Sarajevu i širom Balkana.", content: "GordonDM i Solana potpisali su ugovor o saradnji s fokusom na edukaciju, razvoj blockchain rješenja i povezivanje poslovnih ideja s modernom Web3 infrastrukturom. Poseban naglasak stavljen je na Sarajevo i mogućnosti koje lokalna tehnološka zajednica može ponuditi regionalnom tržištu.\n\nPlanirana saradnja uključuje događaje, radionice, prezentacije i sadržaje koji Solana tehnologiju približavaju developerima, startupima, kompanijama i ljudima koji tek ulaze u svijet kripta. Ideja je pokazati gdje blockchain ima stvarnu primjenu, a gdje je potrebno dodatno znanje, testiranje i odgovoran pristup.\n\nKroz povezivanje s ljudima i zajednicama aktivnim u Solana ekosistemu na Balkanu, GordonDM želi pomoći razvoju regionalne mreže u kojoj se mogu razmjenjivati iskustva, predstavljati projekti i pokretati nove saradnje. Sarajevo može biti mjesto susreta lokalnih talenata, regionalnih partnera i međunarodnih Web3 inicijativa.\n\nSaradnja obuhvata i promociju događaja, digitalne kampanje, kvalitetniji edukativni sadržaj i komunikaciju koja kompleksne blockchain teme pretvara u razumljive poruke. Time se kripto ne predstavlja samo kao tržište digitalne imovine, nego kao infrastruktura za proizvode, zajednice i nove poslovne modele.\n\nU narednom periodu fokus će biti na inicijativama koje mogu ojačati svijest o sigurnoj i korisnoj primjeni Web3 tehnologije, podržati regionalne developere i otvoriti prostor za projekte razvijene u Bosni i Hercegovini. Detalji događaja i konkretnih aktivnosti bit će objavljivani kroz GordonDM blog i društvene kanale.\n\nTehnički dio saradnje dodatno otvara prostor za prototipe, softverske integracije i praktične Solana proizvode koje regionalni timovi mogu razvijati, testirati i predstavljati međunarodnoj publici.", category: "crypto", category_label: "Kripto i Web3", cover_logo: "solana", published_at: "2026-08-25T09:00:00+02:00" },
];

const additionalCategories = {
  "gordondm-solana-saradnja": ["software"],
  "binance-campus-montenegro-budva-gordondm": ["software"],
  "bitcoin-pizza-day-sarajevo": ["marketing"],
};

const postMatchesCategory = (post, category) => category === "all"
  || post.category === category
  || additionalCategories[post.slug]?.includes(category);

const categories = [
  ["all", "all"], ["general", "general"], ["crypto", "crypto"],
  ["marketing", "marketing"], ["software", "software"],
  ["ai", "ai"], ["consulting", "consulting"],
];

const copy = {
  bs: {
    all: "Sve", general: "Općenito", crypto: "Kripto", marketing: "Marketing", software: "Softver", ai: "AI automatizacija", consulting: "Konsulting",
    homeEyebrow: "BLOG / SARADNJE", homeTitle: "Novosti, partnerstva i ideje koje dijelimo.", homeDescription: "Pratite saradnje, tehnološke teme i praktične uvide GordonDM tima.", allBlogs: "Pogledaj sve blogove",
    heroTitle: <>Ideje, saradnje i <em>digitalni napredak.</em></>, heroDescription: "Novosti iz GordonDM-a, priče o partnerstvima i praktični sadržaji o softveru, AI automatizaciji, marketingu i Web3 tehnologiji.", categoryNav: "Kategorije bloga", empty: "U ovoj kategoriji još nema objavljenih članaka.",
    read: "Pročitaj članak", loading: "Učitavamo članak...", back: "Svi blogovi", videoStory: "VIDEO PRIČA", storyFrom: "Priča iz", youtube: "Pogledajte video na YouTubeu", eventVideo: "VIDEO SA DOGAĐAJA", watch: "Pogledajte", photoStory: "FOTO PRIČA", atmosphere: "Atmosfera", openPhoto: "Otvori fotografiju", photo: "fotografija", gallery: "Galerija fotografija", closeGallery: "Zatvori galeriju", close: "Zatvori", previous: "Prethodna fotografija", next: "Sljedeća fotografija",
  },
  en: {
    all: "All", general: "General", crypto: "Crypto", marketing: "Marketing", software: "Software", ai: "AI automation", consulting: "Consulting",
    homeEyebrow: "BLOG / PARTNERSHIPS", homeTitle: "News, partnerships and ideas worth sharing.", homeDescription: "Follow GordonDM partnerships, technology stories and practical insights from our team.", allBlogs: "View all articles",
    heroTitle: <>Ideas, partnerships and <em>digital progress.</em></>, heroDescription: "GordonDM news, partnership stories and practical content on software, AI automation, marketing and Web3 technology.", categoryNav: "Blog categories", empty: "There are no published articles in this category yet.",
    read: "Read article", loading: "Loading article...", back: "All articles", videoStory: "VIDEO STORY", storyFrom: "A story from", youtube: "Watch on YouTube", eventVideo: "EVENT VIDEO", watch: "Watch", photoStory: "PHOTO STORY", atmosphere: "Atmosphere", openPhoto: "Open photo", photo: "photo", gallery: "Photo gallery", closeGallery: "Close gallery", close: "Close", previous: "Previous photo", next: "Next photo",
  },
  de: {
    all: "Alle", general: "Allgemein", crypto: "Krypto", marketing: "Marketing", software: "Software", ai: "KI-Automatisierung", consulting: "Beratung",
    homeEyebrow: "BLOG / PARTNERSCHAFTEN", homeTitle: "Neuigkeiten, Partnerschaften und Ideen, die wir teilen.", homeDescription: "Entdecken Sie GordonDM-Partnerschaften, Technologiethemen und praktische Einblicke unseres Teams.", allBlogs: "Alle Artikel ansehen",
    heroTitle: <>Ideen, Partnerschaften und <em>digitaler Fortschritt.</em></>, heroDescription: "Neuigkeiten von GordonDM, Geschichten über Partnerschaften und praxisnahe Inhalte zu Software, KI-Automatisierung, Marketing und Web3-Technologie.", categoryNav: "Blog-Kategorien", empty: "In dieser Kategorie wurden noch keine Artikel veröffentlicht.",
    read: "Artikel lesen", loading: "Artikel wird geladen...", back: "Alle Artikel", videoStory: "VIDEO-STORY", storyFrom: "Eine Geschichte aus", youtube: "Auf YouTube ansehen", eventVideo: "EVENT-VIDEO", watch: "Ansehen", photoStory: "FOTO-STORY", atmosphere: "Atmosphäre", openPhoto: "Foto öffnen", photo: "Foto", gallery: "Fotogalerie", closeGallery: "Galerie schließen", close: "Schließen", previous: "Vorheriges Foto", next: "Nächstes Foto",
  },
};

const sectionCopy = {
  bs: {
    eyebrow: "IZDVOJENO IZ BLOGA",
    all: ["Novosti i ideje iz GordonDM bloga.", "Priče o projektima, tehnologiji i saradnjama koje povezuju poslovanje i digitalni razvoj."],
    general: ["Još ideja za pametnije poslovanje.", "Praktični tekstovi o digitalnom razvoju, od prvog pitanja do održivog poslovnog sistema."],
    crypto: ["Web3 priče iz Sarajeva i regije.", "Događaji, partnerstva i razgovori s ljudima koji razvijaju blockchain ekosistem na Balkanu."],
    marketing: ["Marketing odluke zasnovane na podacima.", "SEO, sadržaj i kampanje objašnjeni kroz praktične uvide i iskustva s tržišta."],
    software: ["Kako nastaju softverska rješenja koja traju.", "SaaS platforme, enterprise rješenja, web aplikacije i integracije posmatrane iz poslovne i tehničke perspektive."],
    ai: ["AI automatizacija bez nepotrebne buke.", "Primjeri, procesi i odluke koje pomažu timovima da AI pretvore u mjerljivu poslovnu vrijednost."],
    consulting: ["Jasniji smjer prije velikog ulaganja.", "Uvidi o digitalnoj strategiji, procesima i tehnologiji za sigurnije poslovne odluke."],
    empty: "Pripremamo prvi članak za ovu kategoriju. Do tada možete pregledati sve objavljene GordonDM priče.",
  },
  en: {
    eyebrow: "FEATURED FROM THE BLOG",
    all: ["News and ideas from the GordonDM blog.", "Stories about projects, technology and partnerships connecting business with digital growth."],
    general: ["More ideas for smarter business.", "Practical articles about digital growth, from the first question to a sustainable business system."],
    crypto: ["Web3 stories from Sarajevo and the region.", "Events, partnerships and conversations with people building the Balkan blockchain ecosystem."],
    marketing: ["Marketing decisions backed by data.", "SEO, content and campaigns explained through practical insights and market experience."],
    software: ["How lasting software solutions are built.", "SaaS platforms, enterprise solutions, web applications and integrations viewed from business and technical perspectives."],
    ai: ["AI automation without unnecessary noise.", "Examples, processes and decisions that turn AI into measurable business value."],
    consulting: ["A clearer direction before a major investment.", "Insights into digital strategy, processes and technology for more confident business decisions."],
    empty: "We are preparing the first article in this category. Until then, explore all published GordonDM stories.",
  },
  de: {
    eyebrow: "AUSGEWÄHLT AUS DEM BLOG",
    all: ["Neuigkeiten und Ideen aus dem GordonDM-Blog.", "Geschichten über Projekte, Technologie und Partnerschaften, die Unternehmen mit digitalem Wachstum verbinden."],
    general: ["Mehr Ideen für intelligentere Unternehmen.", "Praxisnahe Beiträge über digitale Entwicklung – von der ersten Frage bis zum nachhaltigen Geschäftssystem."],
    crypto: ["Web3-Geschichten aus Sarajevo und der Region.", "Events, Partnerschaften und Gespräche mit Menschen, die das Blockchain-Ökosystem auf dem Balkan entwickeln."],
    marketing: ["Marketingentscheidungen auf Basis von Daten.", "SEO, Inhalte und Kampagnen erklärt durch praktische Einblicke und Markterfahrung."],
    software: ["Wie langlebige Softwarelösungen entstehen.", "SaaS-Plattformen, Enterprise-Lösungen, Webanwendungen und Integrationen aus geschäftlicher und technischer Sicht."],
    ai: ["KI-Automatisierung ohne unnötigen Lärm.", "Beispiele, Prozesse und Entscheidungen, die KI in messbaren Geschäftswert verwandeln."],
    consulting: ["Eine klarere Richtung vor großen Investitionen.", "Einblicke in digitale Strategie, Prozesse und Technologie für fundiertere Geschäftsentscheidungen."],
    empty: "Wir bereiten den ersten Artikel für diese Kategorie vor. Bis dahin können Sie alle veröffentlichten GordonDM-Geschichten entdecken.",
  },
};

const dateLocales = { bs: "bs-BA", en: "en-GB", de: "de-DE" };
const localizedLocation = (location, language) => {
  if (!location) return location;
  if (language === "en") return location.replace("Crna Gora", "Montenegro").replace("Hrvatska", "Croatia");
  if (language === "de") return location.replace("Crna Gora", "Montenegro").replace("Hrvatska", "Kroatien");
  return location;
};

function useLanguage() {
  const [language, setLanguage] = useState(() => localStorage.getItem("gordondm_language") || "bs");
  useEffect(() => {
    const update = (event) => setLanguage(event.detail);
    window.addEventListener("gordondm:language", update);
    return () => window.removeEventListener("gordondm:language", update);
  }, []);
  return [language, copy[language] || copy.bs];
}

const logoPath = (logo) => logo === "binance" ? "/partners/binance.png" : logo === "solana" ? "/partners/solana.png" : "/logo-gordondm-dark.png";
const coverPath = (post) => post.cover_image || "/blog/web3-featured-v1.png";
const youtubeVideoId = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes("youtu.be") ? parsed.pathname.slice(1) : parsed.searchParams.get("v");
  } catch { return null; }
};
const youtubeStartSeconds = (url) => {
  if (!url) return 0;
  try {
    const value = new URL(url).searchParams.get("t") || "0";
    const hours = Number(value.match(/(\d+)h/)?.[1] || 0);
    const minutes = Number(value.match(/(\d+)m/)?.[1] || 0);
    const seconds = Number(value.match(/(\d+)s/)?.[1] || (value.match(/^\d+$/)?.[0] || 0));
    return (hours * 3600) + (minutes * 60) + seconds;
  } catch { return 0; }
};

function ArticleContent({ content }) {
  return content.split(/\n\n+/).map((block) => {
    if (block.startsWith("## ")) return <h2 key={block}>{block.slice(3)}</h2>;
    return <p key={block}>{block}</p>;
  });
}

function useBlogPosts(language) {
  const [posts, setPosts] = useState(language === "bs" ? fallbackPosts : []);
  useEffect(() => {
    setPosts(language === "bs" ? fallbackPosts : []);
    fetch(`${API}/blog/?lang=${language}`).then((response) => response.ok ? response.json() : Promise.reject()).then((data) => setPosts(data)).catch(() => setPosts(language === "bs" ? fallbackPosts : []));
  }, [language]);
  return posts;
}

export function BlogCards({ posts, compact = false, language = "bs", labels = copy.bs }) {
  return (
    <div className={`blog-grid ${compact ? "compact" : ""}`}>
      {posts.map((post, index) => (
        <motion.article key={post.slug} initial={{ opacity: 0, y: 38 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ delay: index * .08 }}>
          <Link className="blog-cover" to={`/blog/${post.slug}`} aria-label={post.title}>
            <img className="blog-featured-image" src={coverPath(post)} alt={post.title} loading="lazy" style={{ objectPosition: "center top" }} />
            <span className="blog-partner-badge"><img src={logoPath(post.cover_logo)} alt={`${post.cover_logo} logo`} loading="lazy" /></span>
            <small>GORDONDM / {post.cover_logo.toUpperCase()}</small>
          </Link>
          <div className="blog-card-copy">
            <span>{post.category_label || "Blog"} · {new Date(post.published_at).toLocaleDateString(dateLocales[language])}</span>
            <h3><Link to={`/blog/${post.slug}`}>{post.title}</Link></h3>
            <p>{post.excerpt}</p>
            <Link className="blog-read" to={`/blog/${post.slug}`}>{labels.read} <ArrowRight /></Link>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

export function HomeBlogSection() {
  const [language, labels] = useLanguage();
  const posts = useBlogPosts(language);
  return (
    <section className="home-blog-section">
      <header><div><p className="eyebrow">{labels.homeEyebrow}</p><h2>{labels.homeTitle}</h2></div><p>{labels.homeDescription}</p></header>
      <BlogCards posts={posts.slice(0, 3)} compact language={language} labels={labels} />
      <Link className="blog-all-link" to="/blog">{labels.allBlogs} <ArrowRight /></Link>
    </section>
  );
}

export function CategoryBlogSection({ category = "all" }) {
  const [language, labels] = useLanguage();
  const posts = useBlogPosts(language);
  const localized = sectionCopy[language] || sectionCopy.bs;
  const [title, description] = localized[category] || localized.all;
  const filtered = posts.filter((post) => postMatchesCategory(post, category)).slice(0, 2);
  return (
    <section className="home-blog-section page-blog-section" data-blog-category={category}>
      <header><div><p className="eyebrow">{localized.eyebrow}</p><h2>{title}</h2></div><p>{description}</p></header>
      {filtered.length ? <BlogCards posts={filtered} compact language={language} labels={labels} /> : (
        <div className="blog-category-empty">
          <p>{localized.empty}</p>
          <Link className="blog-all-link" to="/blog">{labels.allBlogs} <ArrowRight /></Link>
        </div>
      )}
      {filtered.length > 0 && <Link className="blog-all-link" to="/blog">{labels.allBlogs} <ArrowRight /></Link>}
    </section>
  );
}

export function BlogPage() {
  const [language, labels] = useLanguage();
  const posts = useBlogPosts(language);
  const [category, setCategory] = useState("all");
  const filtered = useMemo(() => posts.filter((post) => postMatchesCategory(post, category)), [posts, category]);
  return (
    <main className="blog-page">
      <section className="blog-hero"><p className="eyebrow">GORDONDM / BLOG</p><h1>{labels.heroTitle}</h1><p>{labels.heroDescription}</p></section>
      <section className="blog-index">
        <nav aria-label={labels.categoryNav}>{categories.map(([value, key]) => <button type="button" className={category === value ? "active" : ""} onClick={() => setCategory(value)} key={value}>{labels[key]}</button>)}</nav>
        {filtered.length ? <BlogCards posts={filtered} language={language} labels={labels} /> : <p className="blog-empty">{labels.empty}</p>}
      </section>
    </main>
  );
}

export function BlogPostPage() {
  const { slug } = useParams();
  const [language, labels] = useLanguage();
  const posts = useBlogPosts(language);
  const [post, setPost] = useState(() => language === "bs" ? fallbackPosts.find((item) => item.slug === slug) : null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  useEffect(() => {
    setPost(null);
    fetch(`${API}/blog/${slug}/?lang=${language}`).then((response) => response.ok ? response.json() : Promise.reject()).then(setPost).catch(() => {
      if (language === "bs") setPost(fallbackPosts.find((item) => item.slug === slug));
    });
  }, [slug, language]);
  const current = post || posts.find((item) => item.slug === slug);
  const gallery = current?.images || [];
  const youtubeId = youtubeVideoId(current?.video_url);
  const youtubeStart = youtubeStartSeconds(current?.video_url);
  const eventPlace = current?.location?.split(",")[0] || (language === "de" ? "dem Event" : language === "en" ? "the event" : "događaja");
  useEffect(() => {
    if (lightboxIndex === null) return undefined;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowRight") setLightboxIndex((index) => (index + 1) % gallery.length);
      if (event.key === "ArrowLeft") setLightboxIndex((index) => (index - 1 + gallery.length) % gallery.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxIndex, gallery.length]);
  if (!current) return <main className="blog-detail loading">{labels.loading}</main>;
  return (
    <main className="blog-detail">
      <Link className="blog-back" to="/blog"><ArrowLeft /> {labels.back}</Link>
      <header>
        <span>{current.category_label} · {new Date(current.published_at).toLocaleDateString(dateLocales[language])}</span>
        <h1>{current.title}</h1>
        <p>{current.excerpt}</p>
        {(current.location || current.video_url) && <div className="blog-event-meta">
          <span><CalendarDays /> {new Date(current.published_at).toLocaleDateString(dateLocales[language])}</span>
          {current.location && <span><MapPin /> {localizedLocation(current.location, language)}</span>}
        </div>}
      </header>
      <div className="blog-detail-cover">
        <img className="blog-featured-image" src={coverPath(current)} alt={current.title} style={{ objectPosition: "center bottom" }} />
        <span className="blog-partner-badge"><img src={logoPath(current.cover_logo)} alt={`${current.cover_logo} logo`} /></span>
        <small>GORDONDM × {current.cover_logo.toUpperCase()}</small>
      </div>
      <article><ArticleContent content={current.content} /></article>
      {youtubeId ? <section className="blog-video-feature">
        <header><p className="eyebrow">{labels.videoStory}</p><h2>{labels.storyFrom} {eventPlace}.</h2></header>
        <div className="blog-video-frame"><iframe src={`https://www.youtube-nocookie.com/embed/${youtubeId}?start=${youtubeStart}&rel=0`} title={`${current.title} — ${labels.eventVideo.toLowerCase()}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
        <a href={current.video_url} target="_blank" rel="noreferrer">{labels.youtube} <ExternalLink /></a>
      </section> : current.video_url && <a className="blog-video-link" href={current.video_url} target="_blank" rel="noreferrer">
        <span><PlayCircle /></span>
        <div><small>{labels.eventVideo}</small><strong>{labels.watch}: {current.title}</strong></div>
        <ExternalLink />
      </a>}
      {current.images?.length > 0 && <section className="blog-gallery">
        <header><p className="eyebrow">{labels.photoStory}</p><h2>{labels.atmosphere}: {eventPlace}.</h2></header>
        <div>{current.images.map((item, index) => <figure key={item.id || item.image}>
          <button type="button" onClick={() => setLightboxIndex(index)} aria-label={`${labels.openPhoto} ${index + 1}`}>
            <img src={item.image} alt={`${current.title} — ${labels.photo} ${index + 1}`} loading="lazy" />
            <span aria-hidden="true"><ZoomIn /></span>
          </button>
        </figure>)}</div>
      </section>}
      {lightboxIndex !== null && gallery[lightboxIndex] && <div className="blog-lightbox" role="dialog" aria-modal="true" aria-label={labels.gallery}>
        <button className="blog-lightbox-backdrop" type="button" onClick={() => setLightboxIndex(null)} aria-label={labels.closeGallery} />
        <button className="blog-lightbox-close" type="button" onClick={() => setLightboxIndex(null)} aria-label={labels.close}><X /></button>
        <button className="blog-lightbox-prev" type="button" onClick={() => setLightboxIndex((lightboxIndex - 1 + gallery.length) % gallery.length)} aria-label={labels.previous}><ChevronLeft /></button>
        <div className="blog-lightbox-image"><img src={gallery[lightboxIndex].image} alt={`${current.title} — ${labels.photo} ${lightboxIndex + 1}`} /></div>
        <button className="blog-lightbox-next" type="button" onClick={() => setLightboxIndex((lightboxIndex + 1) % gallery.length)} aria-label={labels.next}><ChevronRight /></button>
      </div>}
    </main>
  );
}
