import { useEffect, useRef, useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { request, uid } from "./work-data";

export default function WorkChat({ projects, projectId, user, mode, close }) {
  const [room, setRoom] = useState(projectId || "");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [limit, setLimit] = useState(100);
  const [more, setMore] = useState(false);
  const scroll = useRef();
  const generation = useRef(0);
  const storageKey = `gordon-work-chat-demo:${user.id}:${room}`;
  useEffect(() => {
    const current = ++generation.current;
    setMessages([]); setError("");
    let stopped = false;
    async function refresh() {
      if (!room) return;
      try {
        const result = mode === "team"
          ? await request(`projects/${room}/chat/?limit=${limit}`)
          : { messages: JSON.parse(localStorage.getItem(storageKey) || "[]"), more: false };
        if (stopped || current !== generation.current) return;
        const bottom = !scroll.current || scroll.current.scrollHeight - scroll.current.scrollTop - scroll.current.clientHeight < 80;
        setMessages(result.messages); setMore(result.more); setError("");
        if (bottom) requestAnimationFrame(() => scroll.current?.scrollTo({top:scroll.current.scrollHeight}));
      } catch (e) { if (!stopped) setError(e.message); }
    }
    refresh();
    const timer = setInterval(refresh, 3000);
    return () => { stopped = true; clearInterval(timer); };
  }, [room, mode, storageKey, limit]);
  async function send(e) {
    e.preventDefault();
    if (!text.trim() || sending || !room) return;
    setSending(true); setError("");
    const current = generation.current;
    try {
      const message = mode === "team"
        ? await request(`projects/${room}/chat/`, "POST", {text:text.trim()})
        : {id:uid(), text:text.trim(), author:user, time:new Date().toISOString()};
      if (mode === "demo") localStorage.setItem(storageKey, JSON.stringify([...JSON.parse(localStorage.getItem(storageKey) || "[]"),message]));
      if (current === generation.current) {
        setMessages(old => old.some(m=>m.id===message.id) ? old : [...old,message]);setText("");
        requestAnimationFrame(() => scroll.current?.scrollTo({top:scroll.current.scrollHeight}));
      }
    } catch (e) { setError(e.message); }
    finally {setSending(false);}
  }
  return <aside className="gw-inbox gw-panel gw-chat">
    <div className="gw-panel-title"><h2><MessageSquare size={18}/> Live chat</h2><button onClick={close} aria-label="Sakrij chat"><X size={16}/></button></div>
    <select aria-label="Projekat za chat" disabled={sending} value={room} onChange={e=>{setRoom(e.target.value);setLimit(100);setText("");}}>
      {!room && <option value="">Odaberi projekat</option>}
      {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
    <p className="gw-panel-note">{mode === "demo" ? "Demo poruke čuvaju se u ovom pregledniku." : "Razgovor članova projekta · poruke ostaju sačuvane."}</p>
    <div ref={scroll} className="gw-chat-messages">
      {more && <button onClick={()=>setLimit(v=>v+100)}>Prikaži starije poruke</button>}
      {!messages.length && <p className="gw-panel-note">Ovdje počinje vaš razgovor.</p>}
      {messages.map(m=><article className={m.author.id===user.id ? "mine" : ""} key={m.id}><div className="gw-chat-author"><b>{m.author.name}</b><time>{new Date(m.time).toLocaleString("bs-BA",{day:"numeric",month:"numeric",hour:"2-digit",minute:"2-digit"})}</time></div><p>{m.text}</p></article>)}
    </div>
    {error && <p role="alert" className="gw-panel-note">{error}</p>}
    <form onSubmit={send}><textarea aria-label="Poruka kolegama" placeholder="Napiši poruku…" maxLength={4000} value={text} disabled={sending} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();e.currentTarget.form.requestSubmit();}}}/><button className="gw-primary" disabled={sending || !room || !text.trim()}><Send size={16}/>{sending ? "Šaljem…" : "Pošalji"}</button></form>
  </aside>;
}
