import { useEffect } from "react";
import { ArrowRight, Home, Mail, Search } from "lucide-react";
import { Link } from "react-router-dom";
import "./static-pages.css";

import { faqs } from "../../config/faqs";

export function FAQPage() {
  useEffect(() => {
    const script = document.createElement("script");
    script.id = "gordondm-faq-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  return (
    <div className="static-page faq-page">
      <section className="static-page-hero">
        <p className="eyebrow">FAQ · GORDONDM</p>
        <h1>Česta pitanja o našim digitalnim uslugama.</h1>
        <p>
          Kratki i jasni odgovori o razvoju softvera, AI automatizaciji,
          digitalnom marketingu, konsultingu i Web3 projektima.
        </p>
      </section>

      <section className="faq-list" aria-label="Česta pitanja i odgovori">
        {faqs.map(([question, answer], index) => (
          <details key={question} open={index === 0}>
            <summary>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{question}</strong>
              <i aria-hidden="true">+</i>
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>

      <section className="static-page-cta">
        <div>
          <p className="eyebrow">NISTE PRONAŠLI ODGOVOR?</p>
          <h2>Razgovarajmo o vašem konkretnom projektu.</h2>
        </div>
        <Link to="/kontakt">
          Kontaktirajte nas <ArrowRight />
        </Link>
      </section>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="static-page not-found-page">
      <section className="not-found-panel">
        <div className="not-found-code" aria-hidden="true">
          <span>4</span>
          <Search />
          <span>4</span>
        </div>
        <p className="eyebrow">STRANICA NIJE PRONAĐENA</p>
        <h1>Ovdje nema stranice koju tražite.</h1>
        <p>
          Link je možda promijenjen ili više nije dostupan. Vratite se na
          početnu stranicu ili nam pošaljite poruku ako tražite određenu uslugu.
        </p>
        <div className="not-found-actions">
          <Link className="not-found-primary" to="/">
            <Home /> Početna stranica
          </Link>
          <Link className="not-found-secondary" to="/kontakt">
            <Mail /> Kontakt
          </Link>
        </div>
      </section>
    </div>
  );
}
