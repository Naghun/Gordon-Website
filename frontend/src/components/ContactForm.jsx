import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { API } from "../config/site";
import { trackLead } from "../utils/analytics";
import ContactOptions from './ContactOptions';

export default function ContactForm() {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const inFlight = useRef(false);
  async function send(e) {
    e.preventDefault();
    if (inFlight.current) return;
    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    inFlight.current = true;
    setSending(true);
    setStatus("Šaljemo...");
    try {
      const r = await fetch(`${API}/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20000),
      });
      if (!r.ok) {
        const details = await r.json().catch(() => null);
        throw new Error(details ? JSON.stringify(details) : `HTTP ${r.status}`);
      }
      form.reset();
      trackLead("contact");
      setStatus("Hvala! Vaša poruka je uspješno poslana.");
    } catch {
      window.dispatchEvent(new Event('gordon-lead-error'));
      setStatus(
        "Poruka nije potvrđena. Pokušajte ponovo ili nas kontaktirajte direktno.",
      );
    } finally {
      inFlight.current = false;
      setSending(false);
    }
  }
  return (
    <form onSubmit={send}>
      <input required name="name" aria-label="Ime i prezime" autoComplete="name" maxLength={120} placeholder="Ime i prezime" />
      <input required type="email" name="email" aria-label="Email adresa" autoComplete="email" maxLength={254} placeholder="Email adresa" />
      <input name="company" aria-label="Kompanija" autoComplete="organization" maxLength={120} placeholder="Kompanija" />
      <textarea
        required
        name="message"
        aria-label="Poruka"
        rows="6"
        placeholder="Opišite projekat ili izazov"
      />
      <button className="cta" type="submit" disabled={sending}>
        {sending ? 'Šaljemo…' : 'Pošalji upit'} <ArrowRight size={19} />
      </button>
      <small role="status" aria-live="polite">{status}</small>
      <ContactOptions />
    </form>
  );
}
