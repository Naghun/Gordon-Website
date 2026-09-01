import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  ChartNoAxesCombined,
  Compass,
  Lightbulb,
  Route,
  Search,
  Workflow,
} from "lucide-react";
import { API } from "../../config/site";
import "./consulting.css";

const areas = [
  {
    icon: Compass,
    label: "SMJER",
    title: "Digitalna strategija",
    text: "Pretvaramo poslovni cilj u realan digitalni plan, prioritete i sljedeće korake.",
  },
  {
    icon: Workflow,
    label: "PROCES",
    title: "Analiza poslovnih procesa",
    text: "Otkrivamo gdje tim gubi vrijeme, gdje podaci zapinju i šta prvo treba optimizovati ili digitalizovati.",
  },
  {
    icon: Lightbulb,
    label: "ODLUKA",
    title: "Tehničko savjetovanje",
    text: "Pomažemo pri izboru tehnologije, partnera i opsega prije skupog razvoja.",
  },
];

const goals = [
  "Novi generator prihoda",
  "Nova vrsta prihoda u firmi",
  "Riješiti problem u poslovanju",
  "Ojačati postojeći dio firme",
];

const focuses = [
  ["Poslovanje i strategija", "Ciljevi, procesi i prioriteti"],
  ["Softver i automatizacija", "Sistem, aplikacija ili pametniji proces"],
  ["Marketing i rast", "Vidljivost, prodaja i kvalitetniji upiti"],
  ["Kripto i Web3", "Edukacija, proizvod ili blockchain integracija"],
];

function ConsultingDiagnostic() {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("");
  const [focus, setFocus] = useState("");
  const [timing, setTiming] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!modalOpen) return undefined;
    const close = (event) => event.key === "Escape" && setModalOpen(false);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("keydown", close);
    };
  }, [modalOpen]);

  async function send(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus("Šaljemo vaš consulting brief...");
    try {
      const response = await fetch(`${API}/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          company: data.company || "Consulting upit",
          message: `CONSULTING DIJAGNOSTIKA\nCilj: ${goal}\nPodručje: ${focus}\n\nPoruka: ${data.message}`,
        }),
      });
      if (!response.ok) throw new Error();
      form.reset();
      setStatus("Upit je zaprimljen. Javit ćemo vam se sa sljedećim korakom.");
    } catch {
      setStatus("Upit trenutno nije potvrđen. Pokušajte ponovo.");
    }
  }

  return (
    <>
      <div className="consulting-diagnostic consulting-pathfinder">
        <header><span>GORDON / STRATEGY PATH</span><b>0{step + 1} / 03</b></header>
        <div className="pathfinder-rail"><em className="pathfinder-line pathfinder-line-one" /><em className="pathfinder-line pathfinder-line-two" />{["CILJ", "PODRUČJE", "TAJMING"].map((item, index) => <span key={item} className={index <= step ? "active" : ""}><i>{index < step ? <Check /> : index + 1}</i><b>{item}</b></span>)}</div>
        <AnimatePresence mode="wait">
          <motion.section className="pathfinder-stage" key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: .35 }}>
            {step === 0 && <><small>POČNIMO OD REZULTATA</small><h3>Šta želite promijeniti u firmi?</h3><p>Izaberite pravac koji je najbliži vašoj trenutnoj ambiciji.</p><div className="pathfinder-options">{goals.map((item, index) => <button type="button" key={item} onClick={() => { setGoal(item); setStep(1); }}><span>0{index + 1}</span><b>{item}</b><ArrowRight /></button>)}</div></>}
            {step === 1 && <><button className="pathfinder-back" type="button" onClick={() => setStep(0)}><ArrowLeft /> Nazad</button><small>ODABERITE PODRUČJE</small><h3>Gdje se krije najveća prilika?</h3><p>Rješenje ćemo kasnije definisati zajedno.</p><div className="pathfinder-options">{focuses.map(([title, text], index) => <button type="button" key={title} onClick={() => { setFocus(title); setStep(2); }}><span>0{index + 1}</span><b>{title}<small>{text}</small></b><ArrowRight /></button>)}</div></>}
            {step === 2 && <><button className="pathfinder-back" type="button" onClick={() => setStep(1)}><ArrowLeft /> Nazad</button><small>REALAN VREMENSKI OKVIR</small><h3>Kada želite prvi konkretan potez?</h3><p>Izbor otvara vaš pripremljeni consulting brief.</p><div className="pathfinder-options timing-options">{["Odmah", "U naredna 3 mjeseca", "Prvo želim procjenu"].map((item, index) => <button type="button" key={item} onClick={() => { setTiming(item); setModalOpen(true); }}><span>0{index + 1}</span><b>{item}</b><ArrowRight /></button>)}</div></>}
          </motion.section>
        </AnimatePresence>
        <AnimatePresence>
          {modalOpen && <motion.div className="consulting-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.form className="consulting-modal-card" onSubmit={send} initial={{ opacity: 0, y: 28, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15 }}><button className="consulting-modal-close" type="button" onClick={() => setModalOpen(false)} aria-label="Zatvori">×</button><small>VAŠ CONSULTING BRIEF</small><h3>Imamo početni smjer.</h3><div className="consulting-summary"><span><small>CILJ</small>{goal}</span><span><small>PODRUČJE</small>{focus}</span><span><small>VRIJEME</small>{timing}</span></div><div className="consulting-fields"><input required name="name" placeholder="Ime i prezime" /><input required type="email" name="email" placeholder="Email adresa" /><input name="company" placeholder="Kompanija" /><textarea required name="message" rows="2" placeholder="Šta vas trenutno najviše koči?" /></div><button className="consulting-next" type="submit">Pošalji consulting brief <ArrowRight /></button><p className="consulting-status">{status}</p></motion.form></motion.div>}
        </AnimatePresence>
      </div>
    </>
  );
}

function ScenarioLab() {
  const items = [
    [ChartNoAxesCombined, "RAST", "Novi izvor prihoda", "Od ideje do modela koji se može testirati."],
    [Search, "PROBLEM", "Manje poslovnog trenja", "Otkrivamo gdje vrijeme, novac ili prilike nestaju."],
    [Route, "PREDNOST", "Pametniji sljedeći potez", "Tehnologiju i tržište pretvaramo u jasan prioritet."],
  ];
  const [active, setActive] = useState(0);
  const [Icon, label, title, text] = items[active];
  return <motion.aside className="consulting-map scenario-lab" initial={{ opacity: 0, x: 45 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9 }}><header><span>BUSINESS SCENARIO LAB</span><b>LIVE / 0{active + 1}</b></header><div className="scenario-screen"><div className="scenario-tabs">{items.map(([ItemIcon, itemLabel], index) => <button type="button" className={active === index ? "active" : ""} key={itemLabel} onClick={() => setActive(index)}><ItemIcon /><span>0{index + 1}</span><b>{itemLabel}</b></button>)}</div><AnimatePresence mode="wait"><motion.div className="scenario-result" key={label} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}><span><Icon /></span><small>IZABRANI SCENARIO</small><h3>{title}</h3><p>{text}</p><div><i /><b>STRATEGY SIGNAL READY</b></div></motion.div></AnimatePresence></div><footer><i /> IZABERITE SCENARIO / POGLEDAJTE SMJER</footer></motion.aside>;
}

export function ConsultingPage() {
  return (
    <main className="consulting-page">
      <section className="consulting-hero">
        <motion.div
          className="consulting-hero-copy"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="eyebrow">DIGITALNI KONSALTING / GORDONDM</p>
          <h1>
            Digitalna transformacija poslovanja.
            <br />
            <em>Jasniji plan. Manje skupih grešaka.</em>
          </h1>
          <p>
            Kroz digitalni konsalting, analizu poslovnih procesa i tehnološko
            savjetovanje povezujemo cilj, procese i tehnologiju u ostvarivu
            digitalnu strategiju.
          </p>
          <div>
            <a href="#consulting-contact">
              Razgovarajmo <ArrowRight />
            </a>
            <a href="#consulting-areas">Kako pomažemo</a>
          </div>
        </motion.div>
        <ScenarioLab />
      </section>

      <section className="consulting-areas" id="consulting-areas">
        <header>
          <p className="eyebrow">KAKO POMAŽEMO</p>
          <h2>
            Ne treba vam još jedan alat.
            <br />
            <em>Treba vam pravi sljedeći potez.</em>
          </h2>
        </header>
        <div>
          {areas.map(({ icon: Icon, label, title, text }, index) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: index * 0.12 }}
            >
              <span>{label}</span>
              <Icon />
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="consulting-process">
        <div>
          <p className="eyebrow">JEDNOSTAVAN PROCES</p>
          <h2>Od razgovora do jasnog plana.</h2>
          <p>
            Bez dugih prezentacija i komplikovanja. Fokus ostaje na odluci koju
            trebate donijeti.
          </p>
        </div>
        <ol>
          <li>
            <span>01</span>
            <b>Razgovor</b>
            <p>Definišemo problem, cilj i kontekst.</p>
          </li>
          <li>
            <span>02</span>
            <b>Analiza</b>
            <p>Provjeravamo opcije, rizike i prioritete.</p>
          </li>
          <li>
            <span>03</span>
            <b>Preporuka</b>
            <p>Dobijate jasan plan i konkretan sljedeći korak.</p>
          </li>
        </ol>
      </section>

      <section className="consulting-contact" id="consulting-contact">
        <div>
          <p className="eyebrow">PRVI RAZGOVOR</p>
          <h2>Imate odluku koju ne želite donijeti napamet?</h2>
          <p>
            Opišite situaciju i cilj. Javit ćemo vam da li i kako možemo pomoći.
          </p>
          <Link to="/kontakt">
            Ili otvorite kontakt stranicu <ArrowRight />
          </Link>
        </div>
        <ConsultingDiagnostic />
      </section>
    </main>
  );
}
