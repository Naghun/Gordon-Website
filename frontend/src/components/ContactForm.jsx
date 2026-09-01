import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { API } from "../config/site";

export default function ContactForm() {
  const [status, setStatus] = useState("");
  async function send(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    setStatus("Šaljemo...");
    try {
      const r = await fetch(`${API}/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const details = await r.json().catch(() => null);
        throw new Error(details ? JSON.stringify(details) : `HTTP ${r.status}`);
      }
      form.reset();
      setStatus("Hvala! Vaša poruka je uspješno poslana.");
    } catch (error) {
      console.error("Kontakt forma:", error);
      setStatus(
        "Poruka nije potvrđena. Pokušajte ponovo ili nas kontaktirajte direktno.",
      );
    }
  }
  return (
    <form onSubmit={send}>
      <input required name="name" placeholder="Ime i prezime" />
      <input required type="email" name="email" placeholder="Email adresa" />
      <input name="company" placeholder="Kompanija" />
      <textarea
        required
        name="message"
        rows="6"
        placeholder="Opišite projekat ili izazov"
      />
      <button className="cta">
        Pošalji upit <ArrowRight size={19} />
      </button>
      <small>{status}</small>
    </form>
  );
}
