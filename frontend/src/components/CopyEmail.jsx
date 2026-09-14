import { useEffect, useRef, useState } from 'react';
import { Mail, ArrowUpRight, Check } from 'lucide-react';
import { business } from '../config/business';
import './copy-email.css';

export default function CopyEmail({ outlook = false }) {
  const [status, setStatus] = useState('');
  const timer = useRef();
  useEffect(()=>()=>clearTimeout(timer.current),[]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(business.email);
      setStatus('Copied!');
    } catch { setStatus('Kopiranje nije uspjelo'); }
    clearTimeout(timer.current);timer.current=setTimeout(()=>setStatus(''),2500);
  }
  return <span className="copy-email-group">
    <button type="button" className="copy-email-button" onClick={copy} aria-label={`Kopiraj email ${business.email}`} title="Kopiraj email">{status==='Copied!'?<Check size={16}/>:<Mail size={16}/>}<span>{status||business.email}</span></button>
    <span className="copy-email-status" role="status">{status}</span>
    {outlook&&<a className="email-outlook" href={`https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(business.email)}`} target="_blank" rel="noreferrer" aria-label="Napiši email u Outlooku" title="Otvori Outlook"><ArrowUpRight size={17}/></a>}
  </span>;
}
