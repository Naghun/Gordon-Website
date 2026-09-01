import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  Bot,
  BrainCircuit,
  ChartNoAxesCombined,
  Code2,
  Coins,
  Lightbulb,
  MessageSquareText,
  Send,
  Sparkles,
  Workflow,
} from "lucide-react";
import { API } from "../../config/site";
import "./marketing.css";

export function MarketingContact() {
  const [status, setStatus] = useState("");
  async function send(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("Šaljemo brief...");
    try {
      const r = await fetch(`${API}/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!r.ok) throw new Error();
      form.reset();
      setStatus("Brief je poslan. Javit ćemo vam se s prijedlogom kampanje.");
    } catch {
      setStatus("Brief trenutno nije potvrđen. Pokušajte ponovo.");
    }
  }
  return (
    <section className="marketing-contact">
      <div className="marketing-ad-preview">
        <div className="marketing-ad-top">
          <span>GORDONDM</span>
          <small>SPONZORISANO · PRIJEDLOG KAMPANJE</small>
        </div>
        <p>
          Vaš sljedeći klijent
          <br />
          već nešto <em>pretražuje.</em>
        </p>
        <div className="marketing-ad-search">
          <span>Kako povećati prodaju online?</span>
          <b>⌕</b>
        </div>
        <div className="marketing-ad-result">
          <small>OGLAS · gordon.ba</small>
          <strong>Strategija koja pretvara pretragu u rast</strong>
          <p>SEO, Google Ads i sadržaj povezani s vašim poslovnim ciljem.</p>
        </div>
        <i>Ovo može biti početak vaše kampanje.</i>
      </div>
      <form onSubmit={send}>
        <div className="marketing-brief-head">
          <span>NEW CAMPAIGN BRIEF</span>
          <b>● READY</b>
        </div>
        <h2>
          Recite nam šta želite <em>postići.</em>
        </h2>
        <div className="marketing-goals">
          <label>
            <input
              required
              type="radio"
              name="service_type"
              value="Više prodaje"
            />
            <span>Više prodaje</span>
          </label>
          <label>
            <input
              required
              type="radio"
              name="service_type"
              value="Više upita"
            />
            <span>Više upita</span>
          </label>
          <label>
            <input
              required
              type="radio"
              name="service_type"
              value="Veća vidljivost"
            />
            <span>Veća vidljivost</span>
          </label>
        </div>
        <input required name="name" placeholder="Ime i prezime" />
        <input
          required
          type="email"
          name="email"
          placeholder="Poslovni email"
        />
        <input name="company" placeholder="Kompanija / web stranica" />
        <textarea
          required
          name="message"
          rows="4"
          placeholder="Šta trenutno oglašavate i koji rezultat želite postići?"
        />
        <button>
          Pošaljite campaign brief <ArrowRight />
        </button>
        <small>{status}</small>
      </form>
    </section>
  );
}

export function MarketingPage() {
  const channels = [
    {
      icon: Lightbulb,
      label: "SEO OPTIMIZACIJA",
      title: "SEO optimizacija za veću vidljivost.",
      text: "Tehnički SEO, lokalni SEO u Sarajevu, sadržaj i struktura stranice usmjereni na relevantne ključne riječi i organski rast.",
      tags: ["Tehnički SEO", "Ključne riječi", "Content"],
    },
    {
      icon: ChartNoAxesCombined,
      label: "GOOGLE SEARCH ADS",
      title: "Pojavite se kada postoji namjera kupovine.",
      text: "Search kampanje koje povezuju pravu pretragu, jasnu poruku i odredišnu stranicu koja konvertuje.",
      tags: ["Search", "Remarketing", "Konverzije"],
    },
    {
      icon: Sparkles,
      label: "GOOGLE DISPLAY",
      title: "Ostanite vidljivi kroz cijeli put kupca.",
      text: "Vizuelne kampanje, remarketing i pametna publika za prepoznatljivost i povratak zainteresovanih korisnika.",
      tags: ["Display", "YouTube", "Publike"],
    },
    {
      icon: MessageSquareText,
      label: "SADRŽAJ I DRUŠTVENE MREŽE",
      title: "Gradite povjerenje prije prodajnog razgovora.",
      text: "Sadržaj i kampanje za Meta platforme koje vašem brendu daju dosljedan glas i stvaraju potražnju.",
      tags: ["Meta Ads", "Sadržaj", "Community"],
    },
  ];
  const stages = [
    ["01", "Privlačimo", "SEO, oglasi i sadržaj dovode relevantnu publiku."],
    ["02", "Pretvaramo", "Poruka i landing stranica pretvaraju pažnju u upit."],
    [
      "03",
      "Mjerimo",
      "Praćenje konverzija pokazuje šta zaista donosi rezultat.",
    ],
    [
      "04",
      "Unapređujemo",
      "Budžet i sadržaj usmjeravamo prema najboljim prilikama.",
    ],
  ];
  return (
    <section className="marketing-page">
      <section className="marketing-hero">
        <motion.div
          className="marketing-hero-copy"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85 }}
        >
          <p className="eyebrow">DIGITALNI MARKETING / GORDONDM</p>
          <h1>
            Digitalni marketing.
            <br />
            <em>Vidljiv u rezultatima.</em>
          </h1>
          <p>
            Povezujemo SEO optimizaciju, Google Ads, Meta kampanje, content
            marketing i analitiku za kompanije u Sarajevu, cijeloj BiH i na
            Balkanu — u sistem koji povećava vidljivost i dovodi klijente.
          </p>
          <div>
            <a href="#marketing-kontakt">
              Pokrenimo rast <ArrowRight />
            </a>
            <a href="#marketing-usluge">Istražite kanale</a>
          </div>
          <small>SEO · GOOGLE ADS · DISPLAY · META · ANALITIKA</small>
        </motion.div>
        <motion.div
          className="marketing-console"
          initial={{ opacity: 0, x: 70, rotateY: -7 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <header>
            <span>
              <i />
              <i />
              <i />
            </span>
            <b>gordon / growth dashboard</b>
            <small>LIVE</small>
          </header>
          <div className="marketing-console-head">
            <div>
              <small>PERFORMANSE / 30 DANA</small>
              <strong>Kampanje rastu zajedno.</strong>
            </div>
            <span>+34.8%</span>
          </div>
          <div className="marketing-kpis">
            <article>
              <small>ORGANSKI KLIKOVI</small>
              <strong>8.420</strong>
              <i>+28%</i>
            </article>
            <article>
              <small>KONVERZIJE</small>
              <strong>316</strong>
              <i>+41%</i>
            </article>
            <article>
              <small>ROAS</small>
              <strong>4.7×</strong>
              <i>+19%</i>
            </article>
          </div>
          <div className="marketing-chart">
            <span>RAST KONVERZIJA</span>
            <div>
              {[28, 34, 31, 45, 48, 62, 59, 73, 78, 91, 86, 100].map(
                (height, index) => (
                  <i style={{ height: `${height}%` }} key={index} />
                ),
              )}
            </div>
          </div>
          <div className="marketing-campaigns">
            <p>
              <b>Google Search</b>
              <span>AKTIVNO</span>
              <i>48%</i>
            </p>
            <p>
              <b>Organic / SEO</b>
              <span>RASTE</span>
              <i>31%</i>
            </p>
            <p>
              <b>Display + Meta</b>
              <span>AKTIVNO</span>
              <i>21%</i>
            </p>
          </div>
        </motion.div>
      </section>
      <section className="marketing-channels" id="marketing-usluge">
        <div className="marketing-section-head">
          <p className="eyebrow">KANALI KOJI RADE ZAJEDNO</p>
          <h2>
            Nije cilj biti svuda.
            <br />
            Cilj je biti tamo gdje <em>odluka nastaje.</em>
          </h2>
          <p>
            Svaki kanal ima jasnu ulogu, zajedničku poruku i mjerenje koje
            povezuje ulaganje s poslovnim rezultatom.
          </p>
        </div>
        <div className="marketing-channel-grid">
          {channels.map(({ icon: Icon, label, title, text, tags }, index) => (
            <motion.article
              key={label}
              initial={{ opacity: 0, y: 45, rotate: -3 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.75,
                delay: index * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <span>0{index + 1}</span>
              <Icon />
              <small>{label}</small>
              <h3>{title}</h3>
              <p>{text}</p>
              <div>
                {tags.map((tag) => (
                  <i key={tag}>{tag}</i>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </section>
      <section className="marketing-funnel">
        <div className="marketing-funnel-copy">
          <p className="eyebrow">OD PRETRAGE DO KLIJENTA</p>
          <h2>
            Jedan marketinški sistem.
            <br />
            <em>Četiri povezana koraka.</em>
          </h2>
          <p>
            Ne gledamo klikove kao završni rezultat. Pratimo put od prve
            pretrage do kvalitetnog upita i ponovnog dolaska korisnika.
          </p>
        </div>
        <div className="marketing-funnel-flow">
          {stages.map(([number, title, text], index) => (
            <motion.article
              key={number}
              initial={{ opacity: 0, x: -45 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.65, delay: index * 0.18 }}
            >
              <span>{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
      <section className="marketing-proof">
        <div>
          <p className="eyebrow">MJERENJE BEZ NAGAĐANJA</p>
          <h2>
            Znate šta raste.
            <br />
            Znate zašto raste.
          </h2>
        </div>
        <div className="marketing-proof-grid">
          <article>
            <span>01</span>
            <strong>SEO pregled</strong>
            <p>
              Pozicije, organski promet i upiti iz pretrage objedinjeni u jednom
              jasnom izvještaju.
            </p>
          </article>
          <article>
            <span>02</span>
            <strong>Ads rezultat</strong>
            <p>
              Trošak, konverzije i povrat ulaganja bez uljepšavanja brojeva koji
              nisu važni.
            </p>
          </article>
          <article>
            <span>03</span>
            <strong>Growth plan</strong>
            <p>
              Sljedeći konkretan potez zasnovan na podacima, a ne na
              pretpostavkama.
            </p>
          </article>
        </div>
        <a href="#marketing-kontakt">
          Napravimo plan rasta <ArrowRight />
        </a>
      </section>
    </section>
  );
}
