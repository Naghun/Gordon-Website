import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { API } from '../config/site';
import './first-party-analytics.css';

const key = 'gordon-first-party-consent';
const blocked = () => navigator.globalPrivacyControl || navigator.doNotTrack === '1';
const read = () => { try { return localStorage.getItem(key); } catch { return 'no'; } };
const clean = value => (value || '').replace(/[^a-zA-Z0-9_. -]/g, '').slice(0,100);
const contactForm = el => el?.closest?.('form')?.querySelector('[name="message"]') && el.closest('form').querySelector('[name="email"]') ? el.closest('form') : null;

export default function FirstPartyAnalytics() {
  const location = useLocation();
  const [consent,setConsent] = useState(read);
  const [open,setOpen] = useState(!read());
  function choose(value) {
    try { localStorage.setItem(key,value); if(value !== 'yes') sessionStorage.removeItem('gordon-metrics-tab'); } catch { /* storage unavailable: no tracking */ }
    setConsent(value); setOpen(false);
  }
  useEffect(() => {
    if(consent !== 'yes' || blocked()) return;
    let visit;
    try { visit = sessionStorage.getItem('gordon-metrics-tab') || crypto.randomUUID(); sessionStorage.setItem('gordon-metrics-tab',visit); } catch { return; }
    const params = new URLSearchParams(window.location.search);
    let ref = '';
    try { ref = document.referrer ? new URL(document.referrer).hostname : ''; } catch { /* no referrer */ }
    const common = {consent:true,visit,path:location.pathname,
      device:/iPad|Tablet|Android(?!.*Mobile)/i.test(navigator.userAgent) ? 'tablet' : /Mobi/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      source:clean(params.get('utm_source')) || (ref && ref !== window.location.hostname ? ref : 'direct'),
      campaign:clean(params.get('utm_campaign')),placement:clean(params.get('utm_content'))};
    const send = (kind,target='',seconds=0) => {
      if(read() !== 'yes' || blocked()) return;
      fetch(`${API}/metrics/`,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',keepalive:true,
        body:JSON.stringify({...common,event:crypto.randomUUID(),kind,target,seconds})}).catch(()=>{});
    };
    let cancelled=false;
    queueMicrotask(()=>{if(!cancelled)send('page_view');});
    let lastActive=Date.now(),lastTick=Date.now();
    const activity = () => { lastActive=Date.now(); };
    const heartbeat = () => {
      const now=Date.now();
      if(document.visibilityState === 'visible' && now-lastActive < 60000) send('heartbeat','',Math.min(20,Math.round((now-lastTick)/1000)));
      lastTick=now;
    };
    const timer=setInterval(heartbeat,15000);
    const started=new WeakSet(), viewed=new WeakSet(), observed=new WeakSet();
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting && !viewed.has(entry.target)) { viewed.add(entry.target);send('form_view','contact'); }
    }),{threshold:0.15});
    const discover=()=>document.querySelectorAll('form').forEach(form=>{
      if(contactForm(form) && !observed.has(form)) { observed.add(form);observer.observe(form); }
    });
    discover();
    const mutation=new MutationObserver(discover);mutation.observe(document.body,{childList:true,subtree:true});
    const input=e=>{const form=contactForm(e.target);if(form && !started.has(form)){started.add(form);send('form_start','contact');}};
    const submit=e=>{if(contactForm(e.target))send('form_attempt','contact');};
    const success=()=>send('form_success','contact');
    const failure=()=>send('form_error','contact');
    const click=e=>{
      const element=e.target.closest?.('a,button');if(!element || element.closest('.metrics-consent')) return;
      const href=element.getAttribute('href') || '';
      let target='button';
      if(href.startsWith('tel:'))target='phone'; else if(href.startsWith('mailto:'))target='email';
      else if(href.includes('wa.me') || href.includes('whatsapp'))target='whatsapp';else if(href.startsWith('viber:'))target='viber';
      else if(href){try{const url=new URL(href,window.location.origin);target=url.origin === window.location.origin?url.pathname:'external';}catch{return;}}
      send('click',target);
    };
    const visibility=()=>{lastTick=Date.now();if(document.visibilityState==='visible')lastActive=Date.now();};
    document.addEventListener('pointerdown',activity);document.addEventListener('keydown',activity);document.addEventListener('scroll',activity,{passive:true});
    document.addEventListener('input',input);document.addEventListener('submit',submit,true);document.addEventListener('click',click);
    document.addEventListener('visibilitychange',visibility);window.addEventListener('gordon-lead-success',success);window.addEventListener('gordon-lead-error',failure);
    return ()=>{cancelled=true;clearInterval(timer);observer.disconnect();mutation.disconnect();document.removeEventListener('pointerdown',activity);document.removeEventListener('keydown',activity);document.removeEventListener('scroll',activity);document.removeEventListener('input',input);document.removeEventListener('submit',submit,true);document.removeEventListener('click',click);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('gordon-lead-success',success);window.removeEventListener('gordon-lead-error',failure);};
  },[consent,location.pathname]);
  if(blocked())return null;
  return <aside className={`metrics-consent ${open ? 'is-open' : ''}`} aria-label="Postavke privatnosti">
    {open ? <><span className="metrics-eyebrow">GORDONDM · PRIVATNOST</span><strong>Bolje iskustvo, uz vaš izbor.</strong><p>Koristimo lokalnu pohranu, sličnu kolačićima, za statistiku posjeta i poboljšanje stranice. Uz vaš pristanak pratimo stranice, klikove, uređaj i aktivno vrijeme — ne sadržaj iz formi.</p><small>Našu statistiku čuvamo 30 dana i ne šaljemo Googleu. Izbor možete promijeniti u postavkama privatnosti.</small><div><button onClick={()=>choose('yes')}>Prihvati</button><button onClick={()=>choose('no')}>Odbij</button></div></> : <button onClick={()=>setOpen(true)}>Postavke privatnosti</button>}
  </aside>;
}
