import { Quote, Star, ArrowUpRight } from "lucide-react";
import "./client-reviews.css";

// Keep fictional design samples out of public builds and search markup.
// Publish only authentic, approved entries in verifiedReviews.
export const verifiedReviews = [];
const samples = [
  {
    name: "Sanel",
    service: "Web stranica",
    text: "Od prvog razgovora do završne stranice sve je bilo jasno dogovoreno. Posebno mi je značilo što su saslušali naše ideje i pretvorili ih u nešto što lako koristimo.",
    rating: 5,
  },
  {
    name: "Amila",
    service: "Digitalni marketing",
    text: "Komunikacija je bila jednostavna i redovna. U svakom trenutku smo znali šta se radi i šta slijedi. Baš prijatna saradnja.",
    rating: 5,
  },
  {
    name: "Adnan",
    service: "Softver po mjeri",
    text: "Objasnili smo gdje gubimo vrijeme u svakodnevnom poslu, a ekipa je predložila praktično rješenje. Sve su nam pokazali korak po korak.",
    rating: 5,
  },
  {
    name: "Lejla",
    service: "Vizuelni identitet",
    text: "Dobili smo svjež izgled koji odgovara našem brendu. Dopalo mi se koliko su pažnje posvetili detaljima i našim komentarima.",
    rating: 5,
  },
  {
    name: "Mirza",
    service: "Automatizacija",
    text: "Najviše cijenim što se može normalno razgovarati, bez komplikovanih izraza. Dogovor je bio konkretan, a podrška dostupna kada nam je trebala.",
    rating: 5,
  },
  {
    name: "Emina",
    service: "Poslovno savjetovanje",
    text: "Pomogli su nam da posložimo prioritete i vidimo odakle da krenemo. Razgovor je donio jasne naredne korake za naš tim.",
    rating: 5,
  },
];
export default function ClientReviews() {
  const preview = import.meta.env.DEV && !verifiedReviews.length;
  const reviews = verifiedReviews.length
    ? verifiedReviews
    : preview
      ? samples
      : [];
  if (!reviews.length) return null;
  return (
    <section
      className="client-reviews"
      id="recenzije"
      aria-labelledby="reviews-title"
    >
      <div className="reviews-heading">
        <div>
          <p className="reviews-kicker">DOBRA SARADNJA OSTAVLJA UTISAK.</p>
          <h2 id="reviews-title">
            Ljudi iza
            <br />
            <em>lijepih riječi.</em>
          </h2>
        </div>
        <p>
          Najbolji dio svakog projekta je povjerenje koje izgradimo kroz rad.
        </p>
      </div>
      {preview && (
        <p className="reviews-preview">
          Lokalni prijedlog izgleda · imena, izjave i ocjene ispod su izmišljeni
          primjeri. Nisu uključeni u javnu verziju.
        </p>
      )}
      <div className="reviews-grid">
        {reviews.map((r, i) => (
          <figure className="review-card" key={i}>
            <div className="review-top">
              <Quote size={25} />
              <span aria-label={`${r.rating} od 5 zvjezdica`}>
                {Array.from({ length: r.rating }, (_, j) => (
                  <Star key={j} size={14} fill="currentColor" />
                ))}
              </span>
            </div>
            <blockquote>{r.text}</blockquote>
            <figcaption>
              <b className="review-avatar">{r.name[0]}</b>
              <span>
                <strong>{r.name}</strong>
                <small>{r.service}</small>
              </span>
              {r.source && (
                <a
                  href={r.source}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Izvor recenzije: ${r.name}`}
                >
                  <ArrowUpRight size={18} />
                </a>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
