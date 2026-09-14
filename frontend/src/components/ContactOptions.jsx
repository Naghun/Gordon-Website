import { Mail, Phone, MapPin, Clock3, ArrowUpRight } from 'lucide-react';
import { business, mapUrl } from '../config/business';
import './contact-options.css';

export default function ContactOptions({ details = false }) {
  return details ? <div className="contact-business-details">
    <p className="contact-business-label">DIREKTNO S NAMA</p>
    <a className="contact-email-feature" href={`mailto:${business.email}`}><span>{business.email}</span><ArrowUpRight size={23}/></a>
    <a href={`tel:${business.phone}`}><Phone size={18}/><span>{business.phoneDisplay}</span></a>
    <a href={mapUrl} target="_blank" rel="noreferrer"><MapPin size={18}/><span>{business.street}<br/>{business.postalCode} {business.city}, BiH</span></a>
    <p className="contact-hours"><Clock3 size={18}/><span>{business.hours}</span></p>
    <small>{business.name}</small>
  </div> : <div className="contact-direct-options">
    <span>Više vam odgovara direktan razgovor?</span>
    <div><a href={`mailto:${business.email}`}><Mail size={17}/><span>{business.email}</span><ArrowUpRight size={14}/></a>
    <a href={`tel:${business.phone}`}><Phone size={17}/><span>Pozovite {business.phoneDisplay}</span></a></div>
  </div>;
}
