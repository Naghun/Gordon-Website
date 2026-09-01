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
import "./software.css";

export function SoftwarePage() {
  const solutions = [
    {
      icon: Code2,
      title: "Izrada web aplikacija",
      text: "Razvoj brzih i sigurnih web aplikacija po mjeri, dostupnih timu i klijentima na svakom uređaju.",
      tags: ["React", "Django", "API"],
    },
    {
      icon: Workflow,
      title: "CRM i poslovni sistemi",
      text: "Razvoj CRM sistema, radnih naloga, portala i dashboarda prilagođenih stvarnom toku vašeg posla.",
      tags: ["CRM", "ERP", "Dashboard"],
    },
    {
      icon: BrainCircuit,
      title: "API integracije",
      text: "Povezujemo postojeće alate kako informacije više ne bi ostajale u odvojenim sistemima.",
      tags: ["REST API", "Automation", "Data"],
    },
    {
      icon: MessageSquareText,
      title: "Korisnički portali",
      text: "Jedno mjesto za upite, dokumente, statuse, komunikaciju i samostalnu podršku klijentima.",
      tags: ["Portal", "Support", "UX"],
    },
  ];
  const process = [
    [
      "01",
      "Razumijemo poslovni problem",
      "Mapiramo korisnike, proces i rezultat koji softver mora ostvariti.",
    ],
    [
      "02",
      "Projektujemo digitalno rješenje",
      "Pretvaramo zahtjeve u jasan interfejs, strukturu podataka i tehnički plan.",
    ],
    [
      "03",
      "Razvijamo softver po mjeri",
      "Gradimo u kratkim provjerljivim etapama, uz redovne demonstracije.",
    ],
    [
      "04",
      "Unapređujemo korisničko iskustvo",
      "Mjerimo korištenje, otklanjamo trenje i razvijamo sistem zajedno s poslovanjem.",
    ],
  ];
  return (
    <section className="software-page">
      <section className="software-hero">
        <motion.div
          className="software-hero-copy"
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="eyebrow">SOFTVER RJEŠENJA / GORDONDM</p>
          <h1>
            Poslovni softver po mjeri.
            <br />
            <em>Radi kako vi radite.</em>
          </h1>
          <p>
            Izrada poslovnog softvera, web aplikacija, CRM sistema i API
            integracija prilagođenih vašim procesima — bez prisiljavanja tima
            da se prilagođava pogrešnom alatu.
          </p>
          <div className="software-hero-actions">
            <Link to="/kontakt">
              Razgovarajmo o sistemu <ArrowRight />
            </Link>
            <a href="#softver-rjesenja">Pogledaj rješenja</a>
          </div>
          <div className="software-tech-line">
            <span>WEB STRANICE</span>
            <span>WEB SHOPOVI</span>
            <span>CRM RJEŠENJA</span>
            <span>AUTOMATIZACIJE</span>
          </div>
        </motion.div>
        <motion.div
          className="software-window"
          initial={{ opacity: 0, x: 70, rotateY: -8 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="software-window-bar">
            <i />
            <i />
            <i />
            <span>gordon / workspace</span>
          </div>
          <div className="software-window-body">
            <aside>
              <b>G</b>
              {[0, 1, 2, 3].map((i) => (
                <i key={i} />
              ))}
            </aside>
            <div className="software-dashboard">
              <div className="software-dashboard-head">
                <div>
                  <small>DASHBOARD</small>
                  <strong>Dobro jutro, tim.</strong>
                </div>
                <button>+ Novi zadatak</button>
              </div>
              <div className="software-metrics">
                <article>
                  <small>AKTIVNI PROJEKTI</small>
                  <strong>24</strong>
                  <span>+ 12%</span>
                </article>
                <article>
                  <small>ZAVRŠENI ZADACI</small>
                  <strong>148</strong>
                  <span>ove sedmice</span>
                </article>
                <article className="software-chart">
                  <small>UČINAK</small>
                  <div>
                    {[42, 65, 48, 78, 66, 91, 83].map((h, i) => (
                      <i style={{ height: `${h}%` }} key={i} />
                    ))}
                  </div>
                </article>
              </div>
              <div className="software-table">
                <div>
                  <b>Posljednje aktivnosti</b>
                  <span>Status</span>
                </div>
                {[
                  "Nova ponuda poslana",
                  "Korisnik odobrio dizajn",
                  "Integracija uspješno završena",
                ].map((item, i) => (
                  <div key={item}>
                    <p>
                      <i />
                      {item}
                    </p>
                    <span>{i === 1 ? "ODOBRENO" : "ZAVRŠENO"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>
      <section className="software-solutions" id="softver-rjesenja">
        <div className="software-section-head">
          <p className="eyebrow">ŠTA GRADIMO</p>
          <h2>
            Jedan sistem.
            <br />
            Manje ručnog rada.
            <br />
            <em>Više kontrole.</em>
          </h2>
          <p>
            Svako rješenje projektujemo prema korisnicima, procesima i podacima
            koji već postoje u vašoj kompaniji.
          </p>
        </div>
        <div className="software-solution-grid">
          {solutions.map(({ icon: Icon, title, text, tags }, i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
            >
              <span>0{i + 1}</span>
              <Icon />
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
      <section className="software-build">
        <div className="software-build-title">
          <p className="eyebrow">NAČIN RADA</p>
          <h2>Od poslovnog problema do softvera koji tim stvarno koristi.</h2>
        </div>
        <div className="software-process">
          {process.map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <i />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="software-cta">
        <div>
          <span>
            Imate ideju, tabelu ili proces koji je prerastao postojeći alat?
          </span>
          <h2>Pretvorimo ga u softver koji može rasti s vama.</h2>
        </div>
        <Link to="/kontakt">
          Pokrenimo projekat <ArrowRight />
        </Link>
      </section>
    </section>
  );
}

export function SoftwareStackSlider() {
  const slides = [
    {
      type: "web",
      icon: Code2,
      kicker: "WEB APLIKACIJA",
      title: "Digitalno iskustvo koje vodi korisnika.",
    },
    {
      type: "system",
      icon: ChartNoAxesCombined,
      kicker: "POSLOVNI SISTEM",
      title: "Cijeli posao u jednom preglednom sistemu.",
    },
    {
      type: "data",
      icon: BrainCircuit,
      kicker: "INTEGRACIJE PODATAKA",
      title: "Podaci povezani bez ručnog prepisivanja.",
    },
    {
      type: "portal",
      icon: MessageSquareText,
      kicker: "KORISNIČKI PORTAL",
      title: "Jedno mjesto za korisnike, sadržaj i usluge.",
    },
  ];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = setInterval(
      () => setActive((value) => (value + 1) % slides.length),
      5800,
    );
    return () => clearInterval(timer);
  }, []);
  function preview(type) {
    if (type === "web")
      return (
        <div className="stack-preview preview-web">
          <nav>
            <b>NOVA.</b>
            <span>Usluge&nbsp;&nbsp; Projekti&nbsp;&nbsp; Kontakt</span>
            <button>Počnimo</button>
          </nav>
          <div className="web-preview-hero">
            <small>DIGITAL EXPERIENCE / 2026</small>
            <h3>
              Ideje pretvaramo u <em>iskustva.</em>
            </h3>
            <p>
              Brza, moderna i jasna web aplikacija napravljena oko vaših
              korisnika.
            </p>
            <button>
              Istraži projekat <ArrowRight />
            </button>
          </div>
          <div className="web-preview-cards">
            <i />
            <i />
            <i />
          </div>
        </div>
      );
    if (type === "system")
      return (
        <div className="stack-preview preview-system">
          <div className="system-sidebar">
            <b>G</b>
            {[0, 1, 2, 3].map((i) => (
              <i key={i} />
            ))}
          </div>
          <div className="system-main">
            <header>
              <div>
                <small>DASHBOARD</small>
                <strong>Pregled poslovanja</strong>
              </div>
              <button>+ Novi zadatak</button>
            </header>
            <div className="system-metrics">
              <article>
                <small>PROJEKTI</small>
                <strong>24</strong>
                <span>+12%</span>
              </article>
              <article>
                <small>ZADACI</small>
                <strong>148</strong>
                <span>ove sedmice</span>
              </article>
              <article>
                <small>UČINAK</small>
                <div>
                  {[43, 66, 52, 79, 69, 92].map((h, i) => (
                    <i style={{ height: `${h}%` }} key={i} />
                  ))}
                </div>
              </article>
            </div>
            <div className="system-rows">
              {["Ponuda odobrena", "Dizajn spreman", "Isporuka zakazana"].map(
                (row, i) => (
                  <p key={row}>
                    <i />
                    <span>{row}</span>
                    <b>{i === 2 ? "U TOKU" : "ZAVRŠENO"}</b>
                  </p>
                ),
              )}
            </div>
          </div>
        </div>
      );
    if (type === "data")
      return (
        <div className="stack-preview preview-data">
          <div className="data-title">
            <div>
              <small>DATA FLOW / LIVE</small>
              <strong>Sistemi razgovaraju međusobno.</strong>
            </div>
            <span>
              <i /> SVE VEZE AKTIVNE
            </span>
          </div>
          <div className="data-map">
            <article className="data-node node-crm">
              <b>CRM</b>
              <span>1.248 zapisa</span>
            </article>
            <article className="data-node node-core">
              <BrainCircuit />
              <b>GORDON API</b>
            </article>
            <article className="data-node node-mail">
              <b>EMAIL</b>
              <span>sinhronizovano</span>
            </article>
            <article className="data-node node-db">
              <b>DATABASE</b>
              <span>mysql / production</span>
            </article>
            <i className="data-line line-one" />
            <i className="data-line line-two" />
            <i className="data-line line-three" />
          </div>
          <div className="data-log">
            <span>12:42:08</span>
            <p>✓ Novi kontakt sinhronizovan kroz sve sisteme</p>
          </div>
        </div>
      );
    return (
      <div className="stack-preview preview-portal">
        <aside>
          <div className="portal-user">
            <i>AS</i>
            <span>
              <b>Amar S.</b>
              <small>Premium korisnik</small>
            </span>
          </div>
          {["Početna", "Moje narudžbe", "Dokumenti", "Podrška"].map(
            (item, i) => (
              <p className={i === 0 ? "active" : ""} key={item}>
                {item}
              </p>
            ),
          )}
        </aside>
        <main>
          <header>
            <div>
              <small>DOBRODOŠLI NAZAD</small>
              <strong>Vaš korisnički prostor</strong>
            </div>
            <span>3 obavijesti</span>
          </header>
          <div className="portal-banner">
            <div>
              <small>AKTIVNA USLUGA</small>
              <h3>Business paket</h3>
              <p>Sljedeća obnova: 24. septembar</p>
            </div>
            <b>AKTIVNO</b>
          </div>
          <div className="portal-grid">
            <article>
              <small>NARUDŽBE</small>
              <strong>08</strong>
              <span>Pogledaj sve →</span>
            </article>
            <article>
              <small>DOKUMENTI</small>
              <strong>14</strong>
              <span>Preuzmi →</span>
            </article>
            <article>
              <small>UPITI</small>
              <strong>02</strong>
              <span>Otvoreni →</span>
            </article>
          </div>
        </main>
      </div>
    );
  }
  return (
    <div
      className="software-stack-slider"
      aria-label="Primjeri softverskih rješenja"
    >
      {slides.map((slide, index) => {
        const offset = (index - active + slides.length) % slides.length;
        const Icon = slide.icon;
        return (
          <article
            key={slide.kicker}
            className={`software-stack-card stack-${offset} type-${slide.type}`}
            onClick={() => setActive(index)}
          >
            <div className="stack-card-bar">
              <span>
                <i />
                <i />
                <i />
              </span>
              <b>gordon / {slide.type}</b>
            </div>
            <div className="stack-card-content">
              <div className="stack-card-label">
                <Icon />
                <span>{slide.kicker}</span>
                <b>{String(index + 1).padStart(2, "0")} / 04</b>
              </div>
              <h2>{slide.title}</h2>
              {preview(slide.type)}
            </div>
          </article>
        );
      })}
      <div className="software-stack-nav">
        {slides.map((slide, index) => (
          <button
            key={slide.kicker}
            className={active === index ? "active" : ""}
            onClick={() => setActive(index)}
            aria-label={`Prikaži ${slide.kicker}`}
          />
        ))}
      </div>
    </div>
  );
}

export function SoftwareContact() {
  const [status, setStatus] = useState("");
  const services = [
    {
      value: "Web stranica",
      title: "Web stranica",
      text: "Prezentacija brenda",
      icon: Sparkles,
    },
    {
      value: "Web aplikacija",
      title: "Web aplikacija",
      text: "Interaktivni proizvod",
      icon: Code2,
    },
    {
      value: "Web shop",
      title: "Web shop",
      text: "Online prodaja",
      icon: Coins,
    },
    {
      value: "Korisnički portal",
      title: "Korisnički portal",
      text: "Privatni prostor",
      icon: MessageSquareText,
    },
    {
      value: "Digitalne novine",
      title: "Digitalne novine",
      text: "Medijski portal",
      icon: Lightbulb,
    },
    {
      value: "Poslovni sistem / CRM",
      title: "Poslovni sistem",
      text: "CRM i operacije",
      icon: ChartNoAxesCombined,
    },
    {
      value: "Integracija podataka i API",
      title: "Integracije",
      text: "API i podaci",
      icon: Workflow,
    },
    {
      value: "Drugo softversko rješenje",
      title: "Drugo rješenje",
      text: "Po vašoj mjeri",
      icon: BrainCircuit,
    },
  ];
  async function send(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("Šaljemo...");
    try {
      const r = await fetch(`${API}/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!r.ok) throw new Error();
      form.reset();
      setStatus("Hvala! Vaš softverski upit je uspješno poslan.");
    } catch {
      setStatus("Upit trenutno nije potvrđen. Pokušajte ponovo.");
    }
  }
  return (
    <section className="software-contact">
      <div className="software-contact-copy">
        <p className="eyebrow">VAŠ PROJEKAT / NAŠ SLJEDEĆI KORAK</p>
        <h2>
          Šta želite
          <br />
          {" "}<em>izgraditi?</em>
        </h2>
        <p>
          Izaberite rješenje kao proizvod iz kataloga, a zatim nam ukratko
          opišite ideju ili poslovni problem. Javit ćemo vam se s konkretnim
          sljedećim korakom.
        </p>
        <div className="software-contact-tags">
          <span>WEB</span>
          <span>SISTEM</span>
          <span>INTEGRACIJA</span>
          <span>PORTAL</span>
        </div>
        <div className="software-contact-benefits">
          <article>
            <span>01</span>
            <div>
              <h3>Prvo razumijemo problem</h3>
              <p>
                Ne nudimo generički paket. Analiziramo korisnike, procese i
                rezultat koji rješenje mora donijeti.
              </p>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <h3>Dobijate jasan sljedeći korak</h3>
              <p>
                Nakon upita predlažemo strukturu, tehnologiju i realan pravac
                razvoja bez nepotrebnog komplikovanja.
              </p>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <h3>Sistem raste zajedno s vama</h3>
              <p>
                Arhitekturu planiramo tako da se funkcionalnosti, integracije i
                broj korisnika mogu sigurno širiti.
              </p>
            </div>
          </article>
        </div>
        <p className="software-contact-note">
          Odgovaramo lično, najčešće unutar jednog radnog dana.
        </p>
      </div>
      <form onSubmit={send}>
        <div className="software-form-head">
          <Code2 />
          <span>SOFTWARE PROJECT REQUEST</span>
          <i>● ONLINE</i>
        </div>
        <div className="software-form-fields">
          <input required name="name" placeholder="Ime i prezime" />
          <input
            required
            type="email"
            name="email"
            placeholder="Email adresa"
          />
          <input name="company" placeholder="Kompanija" />
          <div className="software-service-picker">
            <p>Odaberite rješenje koje vas zanima</p>
            {services.map(({ value, title, text, icon: Icon }) => (
              <label className="software-service-option" key={value}>
                <input
                  required
                  type="radio"
                  name="service_type"
                  value={value}
                />
                <span>
                  <Icon />
                  <b>{title}</b>
                  <small>{text}</small>
                </span>
              </label>
            ))}
          </div>
          <textarea
            required
            name="message"
            rows="6"
            placeholder="Opišite ideju, proces ili problem koji želite riješiti"
          />
          <button className="cta">
            Pošaljite softverski upit <ArrowRight />
          </button>
          <small>{status}</small>
        </div>
      </form>
    </section>
  );
}
