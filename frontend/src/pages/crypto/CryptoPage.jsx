import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBitcoin, faEthereum } from "@fortawesome/free-brands-svg-icons";
import {
  faArrowTrendUp,
  faCalendarDays,
  faChartLine,
  faCubes,
  faGlobe,
  faGraduationCap,
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
  MessageSquareText,
  Send,
  Sparkles,
  Workflow,
} from "lucide-react";
import { API } from "../../config/site";
import "./crypto.css";

const marketFallback = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "XRP", name: "XRP" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "LINK", name: "Chainlink" },
];

const binanceSymbols = ["BTCUSDT", "ETHUSDT", "XRPUSDT", "SOLUSDT", "LINKUSDT"];
const binanceNames = { BTCUSDT: "Bitcoin", ETHUSDT: "Ethereum", XRPUSDT: "XRP", SOLUSDT: "Solana", LINKUSDT: "Chainlink" };

function normalizeBinanceMarket(items) {
  return items.map((item) => ({
    symbol: item.symbol.replace("USDT", ""),
    pair: item.symbol,
    name: binanceNames[item.symbol],
    price: item.lastPrice,
    change_percent: Number(item.priceChangePercent),
    high: item.highPrice,
    low: item.lowPrice,
  }));
}

function formatMarketPrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price)) return "—";
  if (price >= 1000)
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(price);
  if (price >= 1)
    return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 4 }).format(price);
}

function CryptoMarketMachine() {
  const [assets, setAssets] = useState(marketFallback);
  const [active, setActive] = useState(0);
  const [status, setStatus] = useState("CONNECTING");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        let response = await fetch(`${API}/crypto/market/`);
        let data;
        if (response.ok) {
          data = await response.json();
        } else {
          const symbols = encodeURIComponent(JSON.stringify(binanceSymbols));
          response = await fetch(`https://data-api.binance.vision/api/v3/ticker/24hr?symbols=${symbols}&type=MINI`);
          if (!response.ok) throw new Error("Binance market request failed");
          data = { assets: normalizeBinanceMarket(await response.json()) };
        }
        if (!cancelled && data.assets?.length) {
          setAssets(data.assets);
          setStatus("LIVE");
        }
      } catch {
        if (!cancelled) setStatus("RETRYING");
      }
    };
    load();
    const refresh = window.setInterval(load, 20000);
    return () => {
      cancelled = true;
      window.clearInterval(refresh);
    };
  }, []);

  useEffect(() => {
    const rotation = window.setInterval(
      () => setActive((current) => (current + 1) % assets.length),
      3500,
    );
    return () => window.clearInterval(rotation);
  }, [assets.length]);

  const selected = assets[active] || assets[0];
  const change = Number(selected?.change_percent);
  const isUp = Number.isFinite(change) && change >= 0;

  return (
    <div className="web3-hero-machine web3-market-machine">
      <div className="web3-machine-top">
        <span>BINANCE SPOT / USDT</span>
        <i className={status === "LIVE" ? "is-live" : ""}>● {status}</i>
      </div>
      <div className="web3-market-focus">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected.symbol}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.42 }}
          >
            <span className="web3-market-symbol">{selected.symbol}</span>
            <small>{selected.name} / USDT</small>
            <strong>${formatMarketPrice(selected.price)}</strong>
            <em className={isUp ? "positive" : "negative"}>
              {Number.isFinite(change) ? `${isUp ? "+" : ""}${change.toFixed(2)}%` : "24H —"}
            </em>
          </motion.div>
        </AnimatePresence>
        <div className={`web3-market-spark ${isUp ? "positive" : "negative"}`} aria-hidden="true">
          {[22, 36, 29, 51, 44, 68, 58, 82, 73, 94].map((height, index) => (
            <i key={height} style={{ height: `${height}%`, opacity: 0.28 + index * 0.07 }} />
          ))}
        </div>
      </div>
      <div className="web3-market-list">
        {assets.map((asset, index) => {
          const itemChange = Number(asset.change_percent);
          return (
            <button
              type="button"
              key={asset.symbol}
              className={index === active ? "active" : ""}
              onClick={() => setActive(index)}
            >
              <span><b>{asset.symbol}</b><small>{asset.name}</small></span>
              <strong>${formatMarketPrice(asset.price)}</strong>
              <em className={Number.isFinite(itemChange) && itemChange < 0 ? "negative" : "positive"}>
                {Number.isFinite(itemChange) ? `${itemChange >= 0 ? "+" : ""}${itemChange.toFixed(2)}%` : "—"}
              </em>
            </button>
          );
        })}
      </div>
      <footer className="web3-market-footer">
        <span>Automatsko osvježavanje / 20 s</span>
        <span>Izvor: Binance public market data</span>
      </footer>
    </div>
  );
}

function CryptoContactV2() {
  const [status, setStatus] = useState("");
  const [bookTick, setBookTick] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setBookTick((value) => value + 1), 1700);
    return () => window.clearInterval(timer);
  }, []);
  const buyOrders = Array.from({ length: 5 }, (_, index) => ({
    price: (71848.6 - index * 16.7 - (bookTick % 4) * 2.15).toFixed(2),
    amount: (0.041 + ((bookTick + index * 3) % 11) * 0.0137).toFixed(4),
    depth: 34 + ((bookTick * 9 + index * 17) % 62),
  }));
  const sellOrders = Array.from({ length: 5 }, (_, index) => ({
    price: (71867.4 + index * 17.9 + (bookTick % 5) * 1.85).toFixed(2),
    amount: (0.052 + ((bookTick * 2 + index * 4) % 12) * 0.0119).toFixed(4),
    depth: 31 + ((bookTick * 13 + index * 19) % 65),
  }));
  async function send(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("Kreiramo sigurnu poruku...");
    try {
      const r = await fetch(`${API}/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!r.ok) throw new Error();
      form.reset();
      setStatus("Poruka je potvrđena. GordonDM tim će vam se javiti.");
    } catch {
      setStatus("Poruka trenutno nije potvrđena. Pokušajte ponovo.");
    }
  }
  return (
    <section className="web3-contact-v2" id="web3-contact">
      <div className="web3-contact-card">
        <div className="web3-contact-card-top">
          <span>
            <FontAwesomeIcon icon={faWallet} />
            <b>GORDON / PROJECT WALLET</b>
          </span>
          <i>● NETWORK READY</i>
        </div>
        <div className="web3-contact-visual">
          <div className="web3-spot-panel" aria-label="Simulacija spot tržišta">
            <header>
              <span><b>BTC</b> / USDT</span>
              <i>SPOT MARKET</i>
            </header>
            <div className="web3-spot-price">
              <span>
                <small>MARKET PRICE</small>
                <strong>71,857.99</strong>
                <em>+11.04%</em>
              </span>
              <motion.div
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <FontAwesomeIcon icon={faArrowTrendUp} />
              </motion.div>
            </div>
            <div className="web3-order-book">
              <section className="buy-side">
                <header><b>BUY</b><span>PRICE / AMOUNT</span></header>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={`buy-${bookTick}`}
                    initial={{ opacity: 0, y: -18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 18 }}
                    transition={{ duration: 0.42 }}
                  >
                    {buyOrders.map((order) => (
                      <p key={order.price} style={{ "--depth": `${order.depth}%` }}>
                        <span>{order.price}</span><b>{order.amount}</b>
                      </p>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </section>
              <section className="sell-side">
                <header><b>SELL</b><span>PRICE / AMOUNT</span></header>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={`sell-${bookTick}`}
                    initial={{ opacity: 0, y: -18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 18 }}
                    transition={{ duration: 0.42 }}
                  >
                    {sellOrders.map((order) => (
                      <p key={order.price} style={{ "--depth": `${order.depth}%` }}>
                        <span>{order.price}</span><b>{order.amount}</b>
                      </p>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </section>
            </div>
            <div className="web3-trade-actions">
              <button type="button">BUY BTC</button>
              <button type="button">SELL BTC</button>
            </div>
            <footer><span>24H HIGH 72,490</span><span>24H LOW 64,707</span></footer>
          </div>
          <div className="web3-market-chart" aria-label="BTC tržišni grafikon">
            <header><span>BTC / USDT</span><b>1H MARKET TREND</b></header>
            <img
              src="/btc-market-chart.jpg"
              alt="BTC USDT tržišni grafikon sa prikazom cijene i volumena"
              loading="lazy"
            />
          </div>
        </div>
      </div>
      <form onSubmit={send}>
        <div className="web3-form-step">
          <span>01</span>
          <i />
          <span>PROJECT BRIEF</span>
        </div>
        <div className="web3-brief-chain" aria-hidden="true">
          <span>
            <i>01</i>
            <FontAwesomeIcon icon={faWallet} />
            <b>IDENTITY</b>
          </span>
          <em>→</em>
          <span>
            <i>02</i>
            <FontAwesomeIcon icon={faCubes} />
            <b>PROTOCOL</b>
          </span>
          <em>→</em>
          <span>
            <i>03</i>
            <FontAwesomeIcon icon={faShieldHalved} />
            <b>VERIFY</b>
          </span>
        </div>
        <p className="eyebrow">START / WEB3 CONVERSATION</p>
        <h2>
          Imate ideju?
          <br />
          <em>Provjerimo ima li smisla.</em>
        </h2>
        <div className="web3-contact-options">
          <label>
            <input
              required
              type="radio"
              name="service_type"
              value="Web3 strategija"
            />
            <span>
              <FontAwesomeIcon icon={faChartLine} />
              Strategija
            </span>
          </label>
          <label>
            <input
              required
              type="radio"
              name="service_type"
              value="Blockchain razvoj"
            />
            <span>
              <FontAwesomeIcon icon={faCubes} />
              Razvoj
            </span>
          </label>
          <label>
            <input
              required
              type="radio"
              name="service_type"
              value="Kripto edukacija"
            />
            <span>
              <FontAwesomeIcon icon={faGraduationCap} />
              Edukacija
            </span>
          </label>
        </div>
        <div className="web3-contact-fields">
          <input required name="name" placeholder="Ime i prezime" />
          <input
            required
            type="email"
            name="email"
            placeholder="Email adresa"
          />
          <input name="company" placeholder="Kompanija / projekat" />
          <textarea
            required
            name="message"
            rows="5"
            placeholder="Opišite ideju, problem ili pitanje"
          />
        </div>
        <button>
          Potvrdite project brief <ArrowRight />
        </button>
        <div className="web3-form-hash">
          <span>NETWORK: GORDON / WEB3</span>
          <b>TX 0x07...GDM</b>
        </div>
        <small>{status}</small>
      </form>
    </section>
  );
}

export function CryptoPageV2() {
  const fallbackEvents = [
    {
      id: "demo-1",
      slug: "web3-sarajevo-meetup",
      title: "Web3 Sarajevo Meetup",
      excerpt: "Ljudi, ideje i tehnologija bez praznih obećanja.",
      event_date: "2026-10-18T18:00:00+02:00",
      location: "Sarajevo",
      cover_image: "",
    },
    {
      id: "demo-2",
      slug: "blockchain-za-biznis",
      title: "Blockchain za biznis",
      excerpt:
        "Radionica o stvarnim poslovnim primjenama decentralizovanih sistema.",
      event_date: "2026-11-07T10:00:00+01:00",
      location: "GordonDM studio",
      cover_image: "",
    },
  ];
  const fallbackLessons = [
    {
      id: 1,
      level_label: "Osnove",
      question: "Šta blockchain zapravo rješava?",
      answer:
        "Blockchain omogućava da više učesnika dijeli provjerljiv zapis bez jednog centralnog vlasnika podataka. Koristan je samo kada takva vrsta povjerenja donosi stvarnu prednost.",
    },
    {
      id: 2,
      level_label: "Sigurnost",
      question: "Kako sigurno čuvati digitalnu imovinu?",
      answer:
        "Razumijevanje privatnih ključeva, hardverskih novčanika, dozvola pametnih ugovora i oporavka pristupa važnije je od izbora same imovine.",
    },
    {
      id: 3,
      level_label: "Analiza",
      question: "Kako prepoznati ozbiljan Web3 projekat?",
      answer:
        "Analiziramo problem, proizvod, tim, korisnike, tokenomiku, sigurnost i transparentnost. Popularnost na društvenim mrežama nije zamjena za održiv model.",
    },
  ];
  const [events, setEvents] = useState(fallbackEvents);
  const [lessons, setLessons] = useState(fallbackLessons);
  const [open, setOpen] = useState(0);
  useEffect(() => {
    fetch(`${API}/crypto/`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (data.events?.length) setEvents(data.events);
        if (data.lessons?.length) setLessons(data.lessons);
      })
      .catch(() => {});
  }, []);
  const capabilities = [
    {
      icon: faChartLine,
      title: "Web3 strategija",
      text: "Procjena prilike, rizika i poslovne logike prije prve linije koda.",
    },
    {
      icon: faCubes,
      title: "Blockchain razvoj",
      text: "Smart contract development, blockchain integracije i Web3 proizvodi s jasnom tehničkom svrhom.",
    },
    {
      icon: faGraduationCap,
      title: "Edukacija",
      text: "Radionice i sadržaj koji kompleksne teme pretvara u razumljive odluke.",
    },
    {
      icon: faShieldHalved,
      title: "Sigurnost",
      text: "Threat modeling, custody pristup i pravila koja smanjuju operativni rizik.",
    },
  ];
  return (
    <main className="web3-v2">
      <section className="web3-hero-v2">
        <div className="web3-hero-copy-v2">
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            GORDONDM / WEB3 LAB
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Blockchain razvoj bez buke.
            <br />
            <em>Web3 sa svrhom.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            Web3 development, blockchain consulting, Solana razvoj i edukacija
            za novu digitalnu ekonomiju — s fokusom na sigurnost i stvarnu
            poslovnu primjenu.
          </motion.p>
          <div>
            <a href="#web3-events">
              Događaji i sadržaj <ArrowRight />
            </a>
            <a href="#web3-academy">Gordon Academy</a>
          </div>
          <footer>
            <span>
              <FontAwesomeIcon icon={faShieldHalved} />
              Security first
            </span>
            <span>
              <FontAwesomeIcon icon={faGlobe} />
              Built for real use
            </span>
          </footer>
        </div>
        <CryptoMarketMachine />
        <div className="web3-marquee">
          {[
            "BLOCKCHAIN",
            "STRATEGY",
            "SECURITY",
            "EDUCATION",
            "COMMUNITY",
            "DEVELOPMENT",
          ].map((word) => (
            <span key={word}>
              {word}
              <i>✦</i>
            </span>
          ))}
        </div>
      </section>
      <section className="web3-capabilities">
        <header>
          <p className="eyebrow">ŠTA RADIMO</p>
          <h2>
            Tehnologija je alat.
            <br />
            <em>Rezultat je poenta.</em>
          </h2>
        </header>
        <div>
          {capabilities.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <span>0{index + 1}</span>
              <FontAwesomeIcon icon={item.icon} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </motion.article>
          ))}
        </div>
      </section>
      <section className="web3-events-v2" id="web3-events">
        <header>
          <div>
            <p className="eyebrow">EVENTS / COMMUNITY</p>
            <h2>
              Znanje se ne čuva.
              <br />
              <em>Znanje se dijeli.</em>
            </h2>
          </div>
          <p>
            Meetupi, konferencije i radionice na kojima tehnologiju pretvaramo u
            razgovor, znanje i korisne veze.
          </p>
        </header>
        <div className="web3-event-list">
          {events.map((event, index) => (
            <article key={event.id || event.slug}>
              <div className="web3-event-number">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="web3-event-media">
                {event.cover_image ? (
                  <img
                    src={event.cover_image}
                    alt={event.title}
                    loading="lazy"
                  />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCalendarDays} />
                    <i />
                  </>
                )}
              </div>
              <div className="web3-event-copy">
                <span>
                  {new Date(event.event_date).toLocaleDateString("bs", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  / {event.location || "Online"}
                </span>
                <h3>{event.title}</h3>
                <p>{event.excerpt}</p>
                {String(event.id).startsWith("demo") ? (
                  <small>USKORO VIŠE INFORMACIJA</small>
                ) : (
                  <Link to={`/kripto/event/${event.slug}`}>
                    Otvori događaj <ArrowRight />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="web3-academy-v2" id="web3-academy">
        <aside>
          <p className="eyebrow">GORDON ACADEMY</p>
          <h2>
            Učite.
            <br />
            Pitajte.
            <br />
            <em>Razumijte.</em>
          </h2>
          <FontAwesomeIcon icon={faGraduationCap} />
          <p>
            Kratka i jasna objašnjenja za sigurnije razumijevanje blockchaina,
            digitalne imovine i Web3 proizvoda.
          </p>
        </aside>
        <div className="web3-qa">
          {lessons.map((lesson, index) => (
            <article
              className={open === index ? "open" : ""}
              key={lesson.id || lesson.slug}
            >
              <button onClick={() => setOpen(open === index ? -1 : index)}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{lesson.question}</strong>
                </div>
                <i>{open === index ? "−" : "+"}</i>
              </button>
              <AnimatePresence>
                {open === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <p>{lesson.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
          ))}
        </div>
      </section>
      <section className="web3-invest-v2">
        <header>
          <div>
            <p className="eyebrow">RESPONSIBLE APPROACH</p>
            <p>
              Bez obećanja brzog prinosa. Bez odluka zasnovanih na buci. Samo
              tehnologija, kontekst i rizik koji razumijete.
            </p>
          </div>
          <h2>
            Prvo razumijte.
            <br />
            <em>Onda odlučite.</em>
          </h2>
        </header>
        <div className="web3-risk-principles">
          <article>
            <span>01 / VERIFY</span>
            <FontAwesomeIcon icon={faCubes} />
            <h3>Razumijte proizvod</h3>
            <p>
              Koji problem rješava, ko ga koristi i zašto blockchain ima stvarnu
              ulogu?
            </p>
            <i>
              <b />
            </i>
          </article>
          <article>
            <span>02 / PROTECT</span>
            <FontAwesomeIcon icon={faShieldHalved} />
            <h3>Zaštitite pristup</h3>
            <p>
              Wallet, privatni ključevi, dozvole i plan oporavka važniji su od
              svake kratkoročne prilike.
            </p>
            <i>
              <b />
            </i>
          </article>
          <article>
            <span>03 / DECIDE</span>
            <FontAwesomeIcon icon={faChartLine} />
            <h3>Definišite rizik</h3>
            <p>
              Postavite cilj, vremenski horizont i granicu gubitka prije nego
              što donesete odluku.
            </p>
            <i>
              <b />
            </i>
          </article>
        </div>
      </section>
      <CryptoContactV2 />
    </main>
  );
}

export function CryptoEventPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    fetch(`${API}/crypto/events/${slug}/`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then(setEvent)
      .catch(() => setEvent(false));
  }, [slug]);
  if (event === null)
    return (
      <section className="crypto-event-state">Učitavamo događaj...</section>
    );
  if (event === false)
    return (
      <section className="crypto-event-state">
        <h1>Događaj nije pronađen.</h1>
        <Link to="/kripto">← Nazad na kripto stranicu</Link>
      </section>
    );
  const gallery = [
    event.cover_image,
    ...event.images.map((item) => item.image),
  ].filter(Boolean);
  return (
    <article className="crypto-event-page">
      <Link to="/kripto">← Svi događaji</Link>
      <header>
        <div>
          <p className="eyebrow">GORDONDM / KRIPTO DOGAĐAJ</p>
          <h1>{event.title}</h1>
          <p>{event.excerpt}</p>
        </div>
        <aside>
          <span>DATUM</span>
          <strong>
            {new Date(event.event_date).toLocaleDateString("bs", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </strong>
          <span>LOKACIJA</span>
          <strong>{event.location || "Online"}</strong>
        </aside>
      </header>
      {gallery.length > 0 && (
        <section className="crypto-event-gallery">
          <div>
            {gallery.map((image, index) => (
              <img
                key={image}
                className={active === index ? "active" : ""}
                src={image}
                alt={`${event.title} — fotografija ${index + 1}`}
                loading={index === 0 ? "eager" : "lazy"}
              />
            ))}
          </div>
          {gallery.length > 1 && (
            <nav>
              {gallery.map((image, index) => (
                <button
                  key={image}
                  className={active === index ? "active" : ""}
                  onClick={() => setActive(index)}
                >
                  <img src={image} alt="" loading="lazy" />
                </button>
              ))}
            </nav>
          )}
        </section>
      )}
      <section className="crypto-event-content">
        {event.content
          .split("\n")
          .filter(Boolean)
          .map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
      </section>
    </article>
  );
}
