import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, Globe, ShoppingBag, AppWindow, Smartphone, Users, Workflow, Search, MousePointer2, Megaphone, MessageCircle, FileText, Mail } from 'lucide-react';
import { services, categories } from '../../content/services';
import { business } from '../../config/business';
import './services.css';

const icons = [Globe, ShoppingBag, AppWindow, Smartphone, Users, Workflow, Search, MousePointer2, Megaphone, MessageCircle, FileText, Mail];
export function ServiceCards({ category, exclude }) {
  return <div className="service-catalog-grid">{services.filter(s => s.category === category && s.slug !== exclude).map(s => {
    const Icon = icons[services.indexOf(s)];
    return <Link className="service-catalog-card" key={s.path} to={s.path}>
      <span className="service-card-top"><Icon size={25}/><ArrowUpRight size={20}/></span>
      <h3>{s.title}</h3><p>{s.summary}</p><span className="service-card-link">Istražite uslugu <ArrowRight size={17}/></span>
    </Link>;
  })}</div>;
}

export default function ServiceDetail({ service }) {
  const Icon = icons[services.indexOf(service)];
  return <div className="service-detail">
    <div className="service-hero">
      <nav aria-label="Putanja stranice"><Link to="/">Početna</Link><span>/</span><Link to={`/${service.category}`}>{categories[service.category]}</Link><span>/</span><span aria-current="page">{service.title}</span></nav>
      <div className="service-hero-grid"><div><p className="service-kicker">GORDONDM · {categories[service.category]}</p><h1>{service.title}</h1><p className="service-lead">{service.summary}</p>
        <Link className="service-cta" to="/kontakt">Razgovarajmo o vašem projektu <ArrowUpRight size={19}/></Link>
        <a className="service-text-link" href="#detalji-usluge">Pogledajte šta uključuje ↓</a>
      </div><aside className="service-deliverables"><Icon size={36}/><h2>Šta dobijate</h2><ul>{service.deliverables.map(item => <li key={item}><Check size={18}/>{item}</li>)}</ul><p>Obim, rok i ponudu dogovaramo prema vašem projektu.</p></aside></div>
    </div>
    <div className="service-reading-layout" id="detalji-usluge">
      <aside className="service-toc"><p>U OVOJ USLUZI</p><nav aria-label="Sadržaj usluge">{service.sections.map((section,i) => <a key={section.heading} href={`#tema-${i}`}>{section.heading}</a>)}<a href="#pitanja">Česta pitanja</a></nav><Link to="/kontakt">Zatražite ponudu <ArrowRight size={16}/></Link></aside>
      <article className="service-copy">{service.sections.map((section,i) => <section id={`tema-${i}`} key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map(p => <p key={p}>{p}</p>)}</section>)}
        <section id="pitanja" className="service-faq"><p className="service-kicker">PRIJE NEGO ŠTO KRENEMO</p><h2>Česta pitanja</h2>{service.faqs.map(faq => <details key={faq.question} open><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>
      </article>
    </div>
    <section className="service-contact"><div><p className="service-kicker">OD IDEJE DO KONKRETNOG DOGOVORA</p><h2>Šta želite postići?</h2><p>Opišite cilj i trenutno stanje. Zajedno ćemo odrediti obim, prioritete i sljedeći korak.</p><p>{business.email} · {business.phoneDisplay}</p></div><Link className="service-cta" to="/kontakt">Pošaljite upit <ArrowUpRight size={19}/></Link></section>
    <section className="service-related"><p className="service-kicker">POVEZANE USLUGE</p><h2>Šta još možemo povezati s vašim projektom?</h2><ServiceCards category={service.category} exclude={service.slug}/><Link className="service-text-link" to={service.category === 'marketing' ? '/softver-rjesenja' : '/marketing'}>{service.category === 'marketing' ? 'Istražite i softverska rješenja' : 'Istražite i digitalni marketing'} <ArrowRight size={18}/></Link></section>
  </div>;
}
