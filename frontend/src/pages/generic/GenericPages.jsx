import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MessageSquareText,
} from "lucide-react";
import ContactForm from "../../components/ContactForm";
import "./generic.css";

export function ServicePage({ data }) {
  const Icon = data.icon;
  return (
    <section className="page service-page">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="eyebrow">{data.tag}</p>
        <Icon className="page-icon" />
        <h1>{data.title}</h1>
        <p className="lead">{data.intro}</p>
        <Link className="cta" to="/kontakt">
          Zatražite razgovor <ArrowRight size={19} />
        </Link>
      </motion.div>
      <div className="feature-grid">
        {data.items.map(([title, description], index) => (
          <motion.article
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            key={title}
          >
            <b>0{index + 1}</b>
            <h2>{title}</h2>
            <p>{description}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <main className="contact-page">
      <section className="page contact">
        <div>
          <p className="eyebrow">KONTAKT</p>
          <MessageSquareText className="page-icon" />
          <h1>Pokrenimo vaš digitalni projekat.</h1>
          <p className="lead">
            Kontaktirajte GordonDM tim u Sarajevu za AI automatizaciju,
            poslovni softver, SEO, digitalni marketing, consulting ili
            blockchain razvoj. Predložit ćemo konkretan sljedeći korak.
          </p>
        </div>
        <ContactForm />
      </section>

      <section className="contact-team-intro">
        <div className="contact-team-heading">
          <div>
            <p className="eyebrow">LJUDI IZA RJEŠENJA</p>
            <h2>Mali tim. Velika širina znanja.</h2>
          </div>
          <p>
            Ne prodajemo gotove recepte. Slušamo, postavljamo prava pitanja i
            okupljamo ljude koji vaš izazov mogu pretvoriti u konkretan pomak.
          </p>
        </div>
        <div className="contact-team-values">
          <article>
            <span>01</span>
            <strong>Direktan razgovor</strong>
            <p>Od početka znate s kim radite i šta je sljedeći korak.</p>
          </article>
          <article>
            <span>02</span>
            <strong>Znanje koje se povezuje</strong>
            <p>Strategija, dizajn, razvoj i marketing rade kao jedan sistem.</p>
          </article>
          <article>
            <span>03</span>
            <strong>Odgovornost za rezultat</strong>
            <p>Ne završavamo na isporuci — pratimo šta rješenje stvarno donosi.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
