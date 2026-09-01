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
import ContactForm from "../../components/ContactForm";
import "./ai.css";

function AITerminal() {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("gordondm_language") || "bs",
  );
  const scripts = {
    bs: "$ gordon-ai inspect --workflow\n✓ proces učitan: korisnički upiti\n✓ pronađeno 7 ponovljivih koraka\n$ connect --sources crm,email,docs\n✓ pristup podacima potvrđen\n$ build --assistant support\n✓ pravila odgovora testirana\n✓ ljudska provjera uključena\nSTATUS: AUTOMATION READY",
    en: "$ gordon-ai inspect --workflow\n✓ process loaded: customer inquiries\n✓ 7 repeatable steps found\n$ connect --sources crm,email,docs\n✓ data access confirmed\n$ build --assistant support\n✓ response rules tested\n✓ human review enabled\nSTATUS: AUTOMATION READY",
    de: "$ gordon-ai inspect --workflow\n✓ Prozess geladen: Kundenanfragen\n✓ 7 wiederholbare Schritte gefunden\n$ connect --sources crm,email,docs\n✓ Datenzugriff bestätigt\n$ build --assistant support\n✓ Antwortregeln getestet\n✓ menschliche Prüfung aktiviert\nSTATUS: AUTOMATION READY",
  };
  const script = scripts[language] || scripts.bs;
  const [position, setPosition] = useState(0);
  useEffect(() => {
    const updateLanguage = (event) => {
      setLanguage(event.detail);
      setPosition(0);
    };
    window.addEventListener("gordondm:language", updateLanguage);
    return () =>
      window.removeEventListener("gordondm:language", updateLanguage);
  }, []);
  useEffect(() => {
    const done = position >= script.length;
    const timer = setTimeout(
      () => setPosition(done ? 0 : position + 1),
      done ? 3800 : script[position] === "\n" ? 360 : 38,
    );
    return () => clearTimeout(timer);
  }, [position, script]);
  const progress = Math.round((position / script.length) * 100);
  const filled = Math.ceil(progress / 8);
  return (
    <div
      className="ai-terminal"
      aria-label="Animirani prikaz izrade AI automatizacije"
    >
      <div className="ai-terminal-bar">
        <span>
          <i />
          <i />
          <i />
        </span>
        <b>GORDON AI / TERMINAL</b>
      </div>
      <pre>
        {script.slice(0, position)}
        <em>▋</em>
      </pre>
      <div className="ai-terminal-progress">
        <span>
          {Array.from({ length: 13 }, (_, i) => (
            <i className={i < filled ? "filled" : ""} key={i} />
          ))}
        </span>
        <b>{progress}%</b>
      </div>
    </div>
  );
}

export function AIContact() {
  return (
    <section className="ai-contact">
      <div className="ai-contact-copy">
        <p className="eyebrow">POKRENIMO PRVI AI PROCES</p>
        <span className="ai-contact-command">
          $ tell-us --what-slows-you-down
        </span>
        <h2>
          Koji zadatak vaš tim radi <em>opet i opet?</em>
        </h2>
        <p>
          Opišite nam proces koji oduzima vrijeme. Predložit ćemo gdje AI
          automatizacija ima smisla, a gdje je čovjek i dalje važniji.
        </p>
        <div>
          <span>01 / PROCES</span>
          <span>02 / PODACI</span>
          <span>03 / REZULTAT</span>
        </div>
      </div>
      <div className="ai-contact-form">
        <div className="ai-form-bar">
          <i />
          <i />
          <i />
          <span>AI PROJECT REQUEST</span>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}

export function AIPage() {
  const solutions = [
    {
      icon: MessageSquareText,
      kicker: "RAZGOVOR",
      title: "AI chatbot i asistenti",
      text: "AI chatbot za korisničku podršku odgovara iz provjerenih podataka, pomaže klijentima i rasterećuje tim.",
    },
    {
      icon: Workflow,
      kicker: "PROCES",
      title: "Automatizacija poslovnih procesa",
      text: "Povezuju forme, email, CRM i interne alate bez ručnog prepisivanja.",
    },
    {
      icon: BrainCircuit,
      kicker: "PODACI",
      title: "Pametna obrada",
      text: "Čitaju, razvrstavaju i sažimaju informacije u sljedeću konkretnu akciju.",
    },
  ];
  const blueprint = [
    ["01", "Posmatramo", "Gdje se ponavlja rad?"],
    ["02", "Povezujemo", "Koji podaci već postoje?"],
    ["03", "Kontrolišemo", "Gdje čovjek potvrđuje odluku?"],
    ["04", "Mjerimo", "Kolika je stvarna ušteda?"],
  ];
  return (
    <section className="ai-page">
      <div className="ai-grid-bg" />
      <motion.div
        className="ai-hero-copy"
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85 }}
      >
        <p className="ai-label">
          <Sparkles /> AI AUTOMATIZACIJA <span>GORDONDM / 01</span>
        </p>
        <h1>
          AI automatizacija poslovanja.
          <br />
          <em>Manje rutine. Više stvarnog rada.</em>
        </h1>
        <p>
          Projektujemo AI automatizaciju poslovnih procesa koja smanjuje ručni
          rad, povezuje vaše alate i daje timu više vremena za klijente, odluke
          i rast.
        </p>
        <div className="ai-hero-points">
          <span>AI ASISTENTI</span>
          <span>WORKFLOW AUTOMATIZACIJA</span>
          <span>INTEGRACIJE PODATAKA</span>
        </div>
        <div className="ai-actions">
          <Link to="/kontakt">
            Pronađimo prvi proces <ArrowRight />
          </Link>
          <a href="#ai-rjesenja">Pogledaj rješenja</a>
        </div>
      </motion.div>
      <div className="ai-neural">
        <motion.div
          className="ai-core"
          animate={{
            boxShadow: [
              "0 0 30px rgba(46,211,211,.18)",
              "0 0 75px rgba(46,211,211,.5)",
              "0 0 30px rgba(46,211,211,.18)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Bot />
        </motion.div>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.i
            aria-hidden="true"
            key={i}
            style={{ "--node-angle": `${i * 60}deg` }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.42, 1, 0.42] }}
            transition={{ duration: 3.4, repeat: Infinity, delay: i * 0.28 }}
          />
        ))}
        <span className="ai-ring ring-one" />
        <span className="ai-ring ring-two" />
        <AITerminal />
      </div>
      <div className="ai-status">
        <span>
          <i /> SISTEM ONLINE
        </span>
        <span>PRIVATNOST PODATAKA</span>
        <span>HUMAN + AI</span>
      </div>
      <section className="ai-solutions" id="ai-rjesenja">
        <div className="ai-solutions-head">
          <p className="eyebrow">GDJE AI STVARNO POMAŽE</p>
          <h2>
            Tri načina da posao
            <br />
            <em>prestane čekati.</em>
          </h2>
          <p>
            AI rješenja za firme razvijamo prema procesu koji ima jasnu svrhu,
            vlasnika i mjerljiv rezultat — od AI agenata do automatizacije
            korisničke podrške.
          </p>
        </div>
        <div className="ai-solution-rows">
          {solutions.map(({ icon: Icon, kicker, title, text }, i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, x: -55 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.12 }}
            >
              <span>{kicker}</span>
              <Icon />
              <h3>{title}</h3>
              <p>{text}</p>
              <ArrowRight />
            </motion.article>
          ))}
        </div>
      </section>
      <section className="ai-blueprint">
        <div className="ai-blueprint-title">
          <span>GORDON / AI METHOD</span>
          <h2>
            Prvo jasan proces.
            <br />
            Onda pametna automatizacija.
          </h2>
        </div>
        <div className="ai-blueprint-track">
          {blueprint.map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <i />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="ai-blueprint-cta">
          <p>Imate proces koji troši sate svake sedmice?</p>
          <Link to="/kontakt">
            Pokažite nam ga <ArrowRight />
          </Link>
        </div>
      </section>
    </section>
  );
}
