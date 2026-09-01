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
  Send,
  Sparkles,
  Workflow,
} from "lucide-react";
import { heroSlides, pages } from "../../config/site";
import ContactForm from "../../components/ContactForm";
import { HomeBlogSection } from "../blog/BlogPage";
import "./home.css";

const partners = [
  ["Binance", "/partners/binance.png", "Kripto i Web3"],
  ["Solana", "/partners/solana.png", "Blockchain tehnologija"],
  ["ASA BANKA", "/partners/asa.svg", "Bankarstvo i finansije"],
  ["Inter Cars", "/partners/intercars.jpg", "Automobilska industrija"],
  ["Suzuki", "/partners/suzuki.png", "Automobilska industrija"],
  ["KORPA", "/partners/partner-mark.avif", "Dostava i e-commerce"],
  ["Opel", "/partners/opel.png", "Automobilska industrija"],
  ["Halal", "/partners/halal.png", "Certifikacija i standardi"],
];

function ExperimentalHero() {
  const slides = heroSlides.slice(0, 5);
  const [step, setStep] = useState(0);
  const active = ((step % slides.length) + slides.length) % slides.length;
  useEffect(() => {
    const timer = setInterval(() => setStep((current) => current + 1), 3000);
    return () => clearInterval(timer);
  }, []);
  const slide = slides[active];
  const selectSlide = (index) => {
    const forward = (index - active + slides.length) % slides.length;
    setStep((current) => current + forward);
  };
  return (
    <section className="hero-concept hero-slider compact-loader-slider">
      <div className="hero-concept-grid" />
      <AnimatePresence mode="wait">
        <motion.div
          className="hero-slide-copy"
          key={active}
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <p className="hero-slide-number">{slide.number} / 05</p>
          <p className="hero-kicker">
            <Sparkles size={15} />
            {slide.eyebrow}
          </p>
          <h1>{slide.title}</h1>
          <p className="hero-slide-text">{slide.text}</p>
          <div className="hero-slide-actions">
            <Link className="hero-primary" to={slide.to}>
              Saznaj više <ArrowRight size={18} />
            </Link>
            <Link className="hero-secondary" to="/kontakt">
              Pokrenimo projekat
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
      <div
        className="hero-orbit compact-icon-loader"
        aria-label="Odaberi uslugu"
      >
        <div
          className="compact-loader-track"
          style={{ "--loader-turn": `${step * -72}deg` }}
        >
          {slides.map((item, index) => {
            const distance = (active - index + slides.length) % slides.length;
            const state =
              distance === 0
                ? "active"
                : distance === 1
                  ? "trail-1"
                  : distance === 2
                    ? "trail-2"
                    : distance === 3
                      ? "trail-3"
                      : "empty";
            const Icon = item.icon;
            return (
              <button
                key={item.to}
                className={`compact-loader-dot ${state}`}
                style={{
                  "--dot-angle": `${index * 72}deg`,
                  "--icon-turn": `${(step - index) * 72}deg`,
                }}
                onClick={() => selectSlide(index)}
                aria-label={item.eyebrow}
                aria-current={active === index ? "true" : undefined}
              >
                <Icon aria-hidden="true" />
              </button>
            );
          })}
        </div>
        <div className="compact-loader-center">
          <strong>{slide.number}</strong>
          <span>{slide.eyebrow}</span>
        </div>
      </div>
      <div className="hero-slider-count">
        <strong>{String(active + 1).padStart(2, "0")}</strong>
        <span>/ 05</span>
      </div>
      <a className="hero-scroll" href="#ekspertize" aria-label="Pogledaj više">
        <span>Istraži</span>
        <motion.i
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowDown size={18} />
        </motion.i>
      </a>
    </section>
  );
}

export function Home() {
  const words = ["Razmišljamo.", "Dizajniramo.", "Gradimo."];
  return (
    <>
      <ExperimentalHero />
      <section className="services glass-services" id="ekspertize">
        <p className="eyebrow">NAŠE EKSPERTIZE</p>
        <div className="service-grid">
          {Object.entries(pages).map(([path, p], i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={path}
                initial={{ opacity: 0, x: -100, rotate: -20 }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  rotate: 0,
                  transition: {
                    duration: 1.05,
                    delay: i * 0.16,
                    ease: [0.16, 1, 0.3, 1],
                  },
                }}
                whileHover={{
                  y: -10,
                  scale: 1.015,
                  transition: { duration: 0.2, ease: "easeOut" },
                }}
                viewport={{ once: true, amount: 0.18 }}
              >
                <Link to={path}>
                  <Icon />
                  <h2>{p.tag}</h2>
                  <p>{p.intro}</p>
                  <ArrowRight />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
      <section className="home-partners" aria-labelledby="partners-title">
        <div className="home-partners-heading">
          <p className="eyebrow">NAŠI PARTNERI</p>
          <h2 id="partners-title">Povjerenje tehnoloških i poslovnih lidera.</h2>
          <p>Od finansija i automobilske industrije do blockchaina — razvijamo digitalna rješenja prilagođena stvarnim ciljevima svakog partnera.</p>
        </div>
        <div className="partner-showcase">
          <div className="partner-track">
            {partners.map(([name, src, industry], index) => (
              <motion.article
                className="partner-card"
                key={name}
                initial={{ opacity: 0, x: -50, rotate: -8, filter: "blur(5px)" }}
                whileInView={{ opacity: 1, x: 0, rotate: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.58, delay: index * 0.055, ease: [0.16, 1, 0.3, 1] }}
              >
                <span>{industry}</span>
                <img src={src} alt={`${name} logo`} loading="lazy" />
                <strong>{name}</strong>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
      <HomeBlogSection />
      <section className="manifest manifest-impact">
        <div className="impact-heading">
          <p className="eyebrow">GORDON DIGITAL MARKETING</p>
          <p>
            Softver, AI automatizacija, marketing i consulting u jednom timu —
            od poslovnog izazova do gotovog digitalnog rješenja.
          </p>
        </div>
        <div className="impact-words">
          {words.map((word, i) => (
            <motion.div
              key={word}
              initial={{ opacity: 0, x: i % 2 ? -100 : 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{
                duration: 0.85,
                delay: i * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <i aria-hidden="true" />
              <strong>{word}</strong>
            </motion.div>
          ))}
        </div>
        <div className="impact-bottom">
          <p>Tehnologija ima vrijednost tek kada unaprijedi poslovanje.</p>
          <h3>
            Gradimo digitalna rješenja koja vašem poslu daju <em>prednost.</em>
          </h3>
          <Link to="/kontakt">
            Razgovarajmo <ArrowRight />
          </Link>
        </div>
      </section>
      <section className="home-contact" id="kontakt">
        <div className="home-contact-copy">
          <h2>Hajde da vaš poslovni izazov pretvorimo u rješenje.</h2>
          <p>
            Opišite nam proces, projekat ili cilj. Predložit ćemo konkretan
            sljedeći korak za softver, AI automatizaciju ili digitalni rast.
          </p>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
