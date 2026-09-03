import { useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBitcoin, faEthereum } from "@fortawesome/free-brands-svg-icons";
import {
  faArrowTrendUp,
  faCalendarDays,
  faChartLine,
  faCubes,
  faGlobe,
  faGraduationCap,
  faKey,
  faShieldHalved,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bot,
  BrainCircuit,
  ChartNoAxesCombined,
  Code2,
  Coins,
  Lightbulb,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquareText,
  Phone,
  Send,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";
import "./App.css";
import "./styles/shared.css";
import { API, nav, pages, seoPages } from "./config/site";
import { trackContactClick, trackPageView } from "./utils/analytics";
import { Home } from "./pages/home/HomePage";
import { AIContact, AIPage } from "./pages/ai/AIPage";
import {
  SoftwareContact,
  SoftwarePage,
  SoftwareStackSlider,
} from "./pages/software/SoftwarePage";
import {
  MarketingContact,
  MarketingPage,
} from "./pages/marketing/MarketingPage";
import { CryptoEventPage, CryptoPageV2 } from "./pages/crypto/CryptoPage";
import { ConsultingPage } from "./pages/consulting/ConsultingPage";
import { Contact, ServicePage } from "./pages/generic/GenericPages";
import { BlogPage, BlogPostPage, CategoryBlogSection } from "./pages/blog/BlogPage";
import { FAQPage, NotFoundPage } from "./pages/static/StaticPages";
import FrontendTranslator from "./i18n/FrontendTranslator";
import { translatePhrase } from "./i18n/translations";
import "./styles/internal-typography.css";
import "./styles/mobile-polish.css";

let seoManagerPromise;
function loadSEOManager() {
  if (!seoManagerPromise) {
    seoManagerPromise = fetch(`${API}/seo/`)
      .then((response) => {
        if (!response.ok) throw new Error("SEO Manager nije dostupan");
        return response.json();
      })
      .then((data) => data.pages || {})
      .catch(() => ({}));
  }
  return seoManagerPromise;
}

function SEO({ path, language = "bs" }) {
  const [managedPages, setManagedPages] = useState({});

  useEffect(() => {
    let active = true;
    loadSEOManager().then((pages) => {
      if (active) setManagedPages(pages);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const route = path.startsWith("/kripto/event/") ? "/kripto" : path.startsWith("/blog/") ? "/blog" : path;
    const fallback = seoPages[route] || seoPages["/404"];
    const managed = managedPages[route];
    const languageKey = ["bs", "en", "de"].includes(language) ? language : "bs";
    const managedTitle = managed?.[`title_${languageKey}`] || managed?.title_bs;
    const managedDescription = managed?.[`description_${languageKey}`] || managed?.description_bs;
    const title = managedTitle || translatePhrase(fallback.title, language);
    const description = managedDescription || translatePhrase(fallback.description, language);
    const defaultCanonical = `https://gordon.ba${path === "/" ? "" : path}`;
    const canonical = path.startsWith("/kripto/event/")
      ? defaultCanonical
      : managed?.canonical_url || defaultCanonical;
    const ogTitle = languageKey === "bs" && managed?.og_title ? managed.og_title : title;
    const ogDescription = languageKey === "bs" && managed?.og_description ? managed.og_description : description;
    const ogImage = managed?.og_image || "https://gordon.ba/logo-gordondm-dark.png";
    document.documentElement.lang =
      localStorage.getItem("gordondm_language") || "bs";
    document.title = title;
    const setMeta = (selector, attributes) => {
      let node = document.head.querySelector(selector);
      if (!node) {
        node = document.createElement("meta");
        document.head.appendChild(node);
      }
      Object.entries(attributes).forEach(([key, value]) =>
        node.setAttribute(key, value),
      );
    };
    setMeta('meta[name="description"]', {
      name: "description",
      content: description,
    });
    setMeta('meta[name="robots"]', {
      name: "robots",
      content: managed?.is_indexed === false || fallback.noindex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large",
    });
    setMeta('meta[property="og:title"]', {
      property: "og:title",
      content: ogTitle,
    });
    setMeta('meta[property="og:description"]', {
      property: "og:description",
      content: ogDescription,
    });
    setMeta('meta[property="og:url"]', {
      property: "og:url",
      content: canonical,
    });
    setMeta('meta[property="og:image"]', {
      property: "og:image",
      content: ogImage,
    });
    setMeta('meta[property="og:type"]', {
      property: "og:type",
      content: "website",
    });
    setMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    setMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: ogTitle,
    });
    setMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: ogDescription,
    });
    setMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: ogImage,
    });
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical;
    let schema = document.getElementById("gordondm-schema");
    if (!schema) {
      schema = document.createElement("script");
      schema.id = "gordondm-schema";
      schema.type = "application/ld+json";
      document.head.appendChild(schema);
    }
    const organizationId = "https://gordon.ba/#organization";
    const websiteId = "https://gordon.ba/#website";
    const knowsAbout = managed
      ? [managed.primary_keyword, ...String(managed.secondary_keywords || "").split(/[\n,]+/)].filter(Boolean)
      : ["AI automatizacija", "SaaS platforme", "Enterprise rješenja", "Razvoj poslovnog softvera", "Web aplikacije", "Digitalni marketing", "Web3", "Digitalni konsalting"];
    schema.textContent = JSON.stringify({
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
          knowsAbout,
        },
        {
          "@type": "WebSite",
          "@id": websiteId,
          url: "https://gordon.ba/",
          name: "GordonDM",
          publisher: { "@id": organizationId },
        },
        {
          "@type": path.startsWith("/blog/") ? "BlogPosting" : "WebPage",
          "@id": `${canonical}#webpage`,
          url: canonical,
          name: title,
          description,
          isPartOf: { "@id": websiteId },
          publisher: { "@id": organizationId },
        },
      ],
    });
  }, [path, language, managedPages]);
  return null;
}
function Header() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState(
    () => localStorage.getItem("gordondm_language") || "bs",
  );
  const loc = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.classList.add("navigation-open");
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("navigation-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);
  useEffect(() => {
    localStorage.setItem("gordondm_language", language);
    document.documentElement.lang = language;
    window.dispatchEvent(
      new CustomEvent("gordondm:language", { detail: language }),
    );
  }, [language]);
  const languages = [
    { code: "bs", flag: "BS", label: "Bosanski" },
    { code: "en", flag: "EN", label: "English" },
    { code: "de", flag: "DE", label: "Deutsch" },
  ];
  return (
    <>
      <SEO path={loc.pathname} language={language} />
      <header>
        <Link
          className="logo-link"
          to="/"
          aria-label="GordonDM početna stranica"
        >
          <img
            src="/logo-gordondm-dark.png"
            alt="GordonDM – digitalni marketing, AI i softverska rješenja"
            width="1000"
            height="211"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </Link>
        <button
          className="menu"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Zatvori navigaciju" : "Otvori navigaciju"}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? "open" : ""} aria-label="Glavna navigacija">
          {nav.map(([to, label]) => (
            <NavLink key={to} onClick={() => setOpen(false)} to={to}>
              {label}
            </NavLink>
          ))}
          <div className="language-switcher" aria-label="Odaberite jezik">
            {languages
              .filter(({ code }) => code !== language)
              .map(({ code, flag, label }) => (
                <button
                  type="button"
                  key={code}
                  data-language={code}
                  title={label}
                  aria-label={`Prikaži stranicu na jeziku: ${label}`}
                  onClick={() => setLanguage(code)}
                >
                  <span aria-hidden="true">{flag}</span>
                </button>
              ))}
          </div>
        </nav>
        <button
          className={`nav-overlay ${open ? "open" : ""}`}
          aria-label="Zatvori navigaciju"
          onClick={() => setOpen(false)}
        />
      </header>
    </>
  );
}

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    const timer = window.setTimeout(
      () => trackPageView(`${location.pathname}${location.search}`),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const trackLink = (event) => {
      const link = event.target.closest?.("a[href]");
      if (!link) return;
      const url = link.getAttribute("href") || "";
      if (url.startsWith("tel:")) trackContactClick("phone", url);
      else if (url.startsWith("mailto:")) trackContactClick("email", url);
      else if (url.includes("wa.me") || url.includes("whatsapp"))
        trackContactClick("whatsapp", url);
      else if (url.startsWith("viber:")) trackContactClick("viber", url);
    };
    document.addEventListener("click", trackLink);
    return () => document.removeEventListener("click", trackLink);
  }, []);

  return null;
}

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState("choose");
  const [showTop, setShowTop] = useState(false);
  const [token, setToken] = useState(
    () => localStorage.getItem("gordondm_chat_token") || "",
  );
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  useEffect(() => {
    const update = () => setShowTop(window.scrollY > 500);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  async function load() {
    if (!token) return;
    try {
      const r = await fetch(`${API}/chat/conversations/${token}/messages/`, {
        cache: "no-store",
      });
      if (!r.ok) throw new Error();
      const data = await r.json();
      setMessages((current) =>
        JSON.stringify(current) === JSON.stringify(data.messages)
          ? current
          : data.messages,
      );
      setError("");
    } catch {
      setError("Razgovor trenutno nije dostupan.");
    }
  }
  useEffect(() => {
    if (!open || channel !== "live" || !token) return;
    load();
    const refresh = () => {
      if (!document.hidden) load();
    };
    const timer = setInterval(refresh, 1500);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [open, channel, token]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  async function start(e) {
    e.preventDefault();
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const r = await fetch(`${API}/chat/conversations/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error();
      const conversation = await r.json();
      localStorage.setItem("gordondm_chat_token", conversation.token);
      setToken(conversation.token);
    } catch {
      setError("Chat trenutno nije dostupan. Pokušajte ponovo.");
    }
  }
  async function send(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const message = new FormData(form).get("message")?.trim();
    if (!message) return;
    try {
      const r = await fetch(`${API}/chat/conversations/${token}/messages/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!r.ok) throw new Error();
      form.reset();
      await load();
    } catch {
      setError("Poruka nije poslana. Pokušajte ponovo.");
    }
  }
  function toggle() {
    if (!open) setChannel("choose");
    setOpen((value) => !value);
  }
  return (
    <div className="chat-widget">
      <AnimatePresence>
        {open && (
          <motion.section
            className="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.97 }}
          >
            <header>
              <div>
                <strong>
                  {channel === "choose"
                    ? "Kontaktirajte GordonDM"
                    : "GordonDM live chat"}
                </strong>
                <span>
                  {channel === "choose"
                    ? "Izaberite način razgovora"
                    : "Odgovaramo čim budemo dostupni"}
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Zatvori kontakt"
              >
                <X />
              </button>
            </header>
            {channel === "choose" ? (
              <div className="chat-channel-choice">
                <p>Kako želite razgovarati s nama?</p>
                <a href="https://wa.me/38761264263" target="_blank" rel="noreferrer" aria-label="Otvorite WhatsApp razgovor s GordonDM timom">
                  <b>W</b>
                  <span>
                    <strong>WhatsApp</strong>
                    <small>Otvorite razgovor u aplikaciji</small>
                  </span>
                  <ArrowRight />
                </a>
                <a href="viber://chat?number=%2B38761264263" aria-label="Otvorite Viber razgovor s GordonDM timom">
                  <b>V</b>
                  <span>
                    <strong>Viber</strong>
                    <small>Pozovite ili pošaljite poruku</small>
                  </span>
                  <ArrowRight />
                </a>
                <button onClick={() => setChannel("live")}>
                  <MessageCircle />
                  <span>
                    <strong>Live chat</strong>
                    <small>Pišite nam direktno na stranici</small>
                  </span>
                  <ArrowRight />
                </button>
              </div>
            ) : !token ? (
              <form className="chat-start" onSubmit={start}>
                <button
                  type="button"
                  className="chat-back"
                  onClick={() => setChannel("choose")}
                >
                  ← Načini kontakta
                </button>
                <p>Kako vam možemo pomoći?</p>
                <input required name="name" placeholder="Ime i prezime" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email (nije obavezno)"
                />
                <button>
                  Pokreni razgovor <ArrowRight size={17} />
                </button>
                <small>{error}</small>
              </form>
            ) : (
              <>
                <div className="chat-messages">
                  <button
                    className="chat-back"
                    onClick={() => setChannel("choose")}
                  >
                    ← Načini kontakta
                  </button>
                  <div className="chat-bubble admin">
                    Pozdrav! Ostavite poruku i javit ćemo vam se ovdje.
                  </div>
                  {messages.map((item) => (
                    <div key={item.id} className={`chat-bubble ${item.sender}`}>
                      {item.message}
                      <time>
                        {new Date(item.created_at).toLocaleTimeString("bs", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                  ))}
                  {error && <small>{error}</small>}
                  <i ref={endRef} />
                </div>
                <form className="chat-send" onSubmit={send}>
                  <input
                    required
                    autoComplete="off"
                    name="message"
                    maxLength="2000"
                    placeholder="Napišite poruku..."
                  />
                  <button aria-label="Pošalji">
                    <Send />
                  </button>
                </form>
              </>
            )}
          </motion.section>
        )}
      </AnimatePresence>
      <div className="floating-actions">
        {showTop && (
          <button
            className="scroll-top-button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Vrati se na vrh"
          >
            <ArrowUp />
          </button>
        )}
        <button
          className="chat-toggle"
          onClick={toggle}
          aria-label={open ? "Zatvori kontakt" : "Otvori kontakt"}
        >
          {open ? <X /> : <MessageCircle />}
          <span>Kontakt</span>
        </button>
      </div>
    </div>
  );
}

function Shell() {
  const loc = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [loc.pathname]);
  const footerLinks = [
    ["/ai-automatizacija", "AI"],
    ["/softver-rjesenja", "Software"],
    ["/marketing", "Marketing"],
    ["/kripto", "Web3"],
    ["/konsulting", "Consulting"],
  ];
  return (
    <>
      <Header />
      <AnalyticsTracker />
      <AnimatePresence mode="wait">
        <motion.main
          key={loc.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            {Object.entries(pages).map(([path, data]) => (
              <Route
                key={path}
                path={path}
                element={
                  path === "/ai-automatizacija" ? (
                    <>
                      <AIPage data={data} />
                      <CategoryBlogSection category="ai" />
                      <AIContact />
                    </>
                  ) : path === "/softver-rjesenja" ? (
                    <>
                      <SoftwarePage />
                      <SoftwareStackSlider />
                      <CategoryBlogSection category="software" />
                      <SoftwareContact />
                    </>
                  ) : path === "/marketing" ? (
                    <>
                      <MarketingPage />
                      <CategoryBlogSection category="marketing" />
                      <div id="marketing-kontakt">
                        <MarketingContact />
                      </div>
                    </>
                  ) : path === "/kripto" ? (
                    <>
                      <CryptoPageV2 />
                      <CategoryBlogSection category="crypto" />
                    </>
                  ) : path === "/konsulting" ? (
                    <>
                      <ConsultingPage />
                      <CategoryBlogSection category="consulting" />
                    </>
                  ) : (
                    <ServicePage data={data} />
                  )
                }
              />
            ))}
            <Route path="/kripto/event/:slug" element={<CryptoEventPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/konsalting" element={<Navigate to="/konsulting" replace />} />
            <Route path="/kontakt" element={<><Contact /><CategoryBlogSection category="all" /></>} />
            <Route path="/faq" element={<><FAQPage /><CategoryBlogSection category="general" /></>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <Link className="footer-logo" to="/" aria-label="GordonDM početna stranica">
              <img src="/logo-gordondm-dark.png" alt="GordonDM – AI automatizacija, softver i digitalni marketing" width="1000" height="211" loading="lazy" decoding="async" />
            </Link>
            <p>Tehnološki partner za poslovni softver, AI automatizaciju, digitalni marketing, consulting i blockchain razvoj.</p>
            <address className="footer-contact">
              <a href="mailto:info@gordondm.com"><Mail /> info@gordondm.com</a>
              <a href="tel:+38761264263"><Phone /> +387 61 264 263</a>
              <a href="https://www.google.com/maps/search/?api=1&query=D%C5%BEemala+Bijedi%C4%87a+279L%2C+Sarajevo+71320" target="_blank" rel="noreferrer"><MapPin /> Džemala Bijedića 279L, Sarajevo 71320</a>
            </address>
          </div>
          <nav className="footer-links" aria-label="Usluge">
            <strong>Usluge</strong>
            {footerLinks.map(([to, label]) => <Link to={to} key={to}>{label}</Link>)}
          </nav>
          <nav className="footer-company" aria-label="Kompanija">
            <strong>GordonDM</strong>
            <Link to="/">Početna</Link>
            <Link to="/kontakt">Kontakt</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/kontakt" className="footer-cta">Pokrenimo projekat <ArrowRight /></Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <p>© 2026 GordonDM</p>
          <span>Digitalna rješenja iz Sarajeva za kompanije u BiH i regiji.</span>
        </div>
      </footer>
      <ChatWidget />
    </>
  );
}
export default function App() {
  useEffect(() => {
    const seen = new WeakSet();
    const reveal = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            reveal.unobserve(entry.target);
          }
        }),
      { threshold: 0.24 },
    );
    const register = () =>
      document.querySelectorAll(".software-process").forEach((element) => {
        if (!seen.has(element)) {
          seen.add(element);
          reveal.observe(element);
        }
      });
    register();
    const changes = new MutationObserver(register);
    changes.observe(document.body, { childList: true, subtree: true });
    return () => {
      changes.disconnect();
      reveal.disconnect();
    };
  }, []);
  return (
    <BrowserRouter>
      <FrontendTranslator />
      <Shell />
    </BrowserRouter>
  );
}
