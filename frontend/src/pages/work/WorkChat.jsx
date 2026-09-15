import { useEffect, useRef, useState } from "react";
import { MessageSquare, X, Send, AtSign } from "lucide-react";
import { request, uid } from "./work-data";

export default function WorkChat({
  projects,
  user,
  mode,
  visible,
  onUnread,
  close,
}) {
  const [room, setRoom] = useState("general"),
    [messages, setMessages] = useState([]),
    [members, setMembers] = useState([]);
  const [text, setText] = useState(""),
    [cursor, setCursor] = useState(0),
    [error, setError] = useState(""),
    [sending, setSending] = useState(false);
  const [limit, setLimit] = useState(100),
    [more, setMore] = useState(false),
    [unread, setUnread] = useState({ total: 0, rooms: {} });
  const scroll = useRef(null),
    input = useRef(null),
    generation = useRef(0),
    reading = useRef(false),
    summaryVersion = useRef(0);
  const storageKey = `gordon-work-chat-demo:${user.id}:${room}`;
  const path = room === "general" ? "chat/" : `projects/${room}/chat/`;
  async function refreshUnread() {
    if (mode !== "team") return;
    const version = ++summaryVersion.current,
      result = await request("chat/summary/");
    if (version === summaryVersion.current) {
      setUnread(result);
      onUnread(result.total);
    }
  }
  useEffect(() => {
    onUnread(0);
    const poll = () => refreshUnread().catch(() => {});
    poll();
    const timer = setInterval(poll, 3000);
    return () => {
      clearInterval(timer);
      ++summaryVersion.current;
    };
  }, [mode, user.id, onUnread]);
  useEffect(() => {
    if (room !== "general" && !projects.some((p) => p.id === room))
      setRoom("general");
  }, [projects, room]);
  useEffect(() => {
    const current = ++generation.current;
    let stopped = false,
      pending = false;
    setMessages([]);
    setMembers([]);
    setError("");
    async function refresh() {
      if (!visible || pending) return;
      pending = true;
      try {
        const result =
          mode === "team"
            ? await request(`${path}?limit=${limit}`)
            : {
                messages: JSON.parse(localStorage.getItem(storageKey) || "[]"),
                more: false,
                members:
                  room === "general"
                    ? [
                        ...new Map(
                          [user, ...projects.flatMap((p) => p.members)].map(
                            (m) => [m.id, m],
                          ),
                        ).values(),
                      ]
                    : projects.find((p) => p.id === room)?.members || [],
              };
        if (stopped || current !== generation.current) return;
        const bottom =
          !scroll.current ||
          scroll.current.scrollHeight -
            scroll.current.scrollTop -
            scroll.current.clientHeight <
            80;
        setMessages(result.messages);
        setMembers(result.members);
        setMore(result.more);
        setError("");
        if (bottom)
          requestAnimationFrame(() =>
            scroll.current?.scrollTo({ top: scroll.current.scrollHeight }),
          );
      } catch (e) {
        if (!stopped) setError(e.message);
      } finally {
        pending = false;
      }
    }
    refresh();
    const timer = setInterval(refresh, 3000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [room, mode, storageKey, limit, visible]);
  useEffect(() => {
    const current = generation.current,
      box = scroll.current;
    async function readVisible() {
      if (
        !visible ||
        document.visibilityState !== "visible" ||
        mode !== "team" ||
        reading.current
      )
        return;
      if (box && box.scrollHeight - box.scrollTop - box.clientHeight > 80)
        return;
      const ids = messages.filter((m) => m.unreadMention).map((m) => m.id);
      if (!ids.length) return;
      reading.current = true;
      try {
        await request("chat/read/", "POST", { messages: ids });
        if (current === generation.current)
          setMessages((old) =>
            old.map((m) =>
              ids.includes(m.id) ? { ...m, unreadMention: false } : m,
            ),
          );
        await refreshUnread();
      } catch (e) {
        setError(e.message);
      } finally {
        reading.current = false;
      }
    }
    const frame = requestAnimationFrame(readVisible);
    document.addEventListener("visibilitychange", readVisible);
    box?.addEventListener("scroll", readVisible);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", readVisible);
      box?.removeEventListener("scroll", readVisible);
    };
  }, [messages, visible, mode]);
  async function send(e) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    setError("");
    const current = generation.current;
    try {
      const message =
        mode === "team"
          ? await request(path, "POST", { text: text.trim() })
          : {
              id: uid(),
              text: text.trim(),
              author: user,
              time: new Date().toISOString(),
              mentions: members.filter((m) => text.includes(`@${m.username}`)),
            };
      if (mode === "demo")
        localStorage.setItem(
          storageKey,
          JSON.stringify([
            ...JSON.parse(localStorage.getItem(storageKey) || "[]"),
            message,
          ]),
        );
      if (current === generation.current) {
        setMessages((old) =>
          old.some((m) => m.id === message.id) ? old : [...old, message],
        );
        setText("");
        setCursor(0);
        requestAnimationFrame(() =>
          scroll.current?.scrollTo({ top: scroll.current.scrollHeight }),
        );
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }
  const match = text.slice(0, cursor).match(/(?:^|\s)@([\w.+-]*)$/);
  const suggestions = match
    ? members
        .filter(
          (m) =>
            m.id !== user.id &&
            `${m.name} ${m.username}`
              .toLowerCase()
              .includes(match[1].toLowerCase()),
        )
        .slice(0, 8)
    : [];
  function put(prefix, suffix) {
    setText((prefix + suffix).slice(0, 4000));
    setCursor(prefix.length);
    requestAnimationFrame(() => {
      input.current?.focus();
      input.current?.setSelectionRange(prefix.length, prefix.length);
    });
  }
  function insertMention(m) {
    put(
      text.slice(0, cursor - match[1].length - 1) + `@${m.username} `,
      text.slice(cursor),
    );
  }
  function addAt() {
    const at = input.current?.selectionStart ?? text.length;
    put(
      text.slice(0, at) +
        (at && !/\s$/.test(text.slice(0, at)) ? " " : "") +
        "@",
      text.slice(at),
    );
  }
  function changeRoom(id) {
    setRoom(id);
    setLimit(100);
    setText("");
    setCursor(0);
  }
  return (
    <aside hidden={!visible} className="gw-inbox gw-panel gw-chat">
      <div className="gw-panel-title">
        <h2>
          <MessageSquare size={18} />
          Live chat{" "}
          {unread.total > 0 && (
            <span className="gw-chat-badge">{unread.total}</span>
          )}
        </h2>
        <button onClick={close} aria-label="Sakrij chat">
          <X size={16} />
        </button>
      </div>
      <select
        aria-label="Razgovor"
        disabled={sending}
        value={room}
        onChange={(e) => changeRoom(e.target.value)}
      >
        <option value="general">
          Opći chat · cijeli tim
          {unread.rooms.general ? ` (${unread.rooms.general})` : ""}
        </option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
            {unread.rooms[p.id] ? ` (${unread.rooms[p.id]})` : ""}
          </option>
        ))}
      </select>
      <p className="gw-panel-note">
        {mode === "demo"
          ? "Demo poruke čuvaju se u ovom pregledniku."
          : room === "general"
            ? "Zajednički razgovor, dostupan iz svakog projekta."
            : "Razgovor članova ovog projekta."}
      </p>
      {Object.entries(unread.rooms)
        .filter(([id, count]) => id !== room && count > 0)
        .map(([id, count]) => (
          <button
            key={id}
            className="gw-chat-unread-room"
            disabled={sending}
            onClick={() => changeRoom(id)}
          >
            <AtSign size={14} />
            {id === "general"
              ? "Opći chat"
              : projects.find((p) => p.id === id)?.name || "Projekat"}
            <span className="gw-chat-badge">{count}</span>
          </button>
        ))}
      <div ref={scroll} className="gw-chat-messages">
        {more && (
          <button onClick={() => setLimit((v) => v + 100)}>
            Prikaži starije poruke
          </button>
        )}
        {!messages.length && (
          <p className="gw-panel-note">Ovdje počinje vaš razgovor.</p>
        )}
        {messages.map((m) => (
          <article
            key={m.id}
            className={`${m.author.id === user.id ? "mine" : ""} ${(m.mentions || []).some((p) => p.id === user.id) ? "gw-mentioned-message" : ""}`}
          >
            <div className="gw-chat-author">
              <b>{m.author.name}</b>
              <time>
                {new Date(m.time).toLocaleString("bs-BA", {
                  day: "numeric",
                  month: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </div>
            <p>
              {m.text
                .split(/(@[\w.+-]+)/g)
                .map((part, i) =>
                  (m.mentions || []).some((p) => part === `@${p.username}`) ? (
                    <mark key={i}>{part}</mark>
                  ) : (
                    part
                  ),
                )}
            </p>
          </article>
        ))}
      </div>
      {error && (
        <p role="alert" className="gw-panel-note">
          {error}
        </p>
      )}
      <form onSubmit={send}>
        {suggestions.length > 0 && (
          <div className="gw-chat-mention-options" aria-label="Spomeni kolegu">
            {suggestions.map((m) => (
              <button type="button" key={m.id} onClick={() => insertMention(m)}>
                <b>{m.name}</b>
                <small>@{m.username}</small>
              </button>
            ))}
          </div>
        )}
        <textarea
          ref={input}
          aria-label="Poruka kolegama"
          placeholder="Poruka… @ za kolegu"
          maxLength={4000}
          value={text}
          disabled={sending}
          onSelect={(e) => setCursor(e.currentTarget.selectionStart)}
          onChange={(e) => {
            setText(e.target.value);
            setCursor(e.target.selectionStart);
          }}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              if (suggestions.length) insertMention(suggestions[0]);
              else e.currentTarget.form.requestSubmit();
            }
          }}
        />
        <div className="gw-chat-compose-actions">
          <button
            type="button"
            onClick={addAt}
            disabled={sending}
            aria-label="Spomeni kolegu"
          >
            <AtSign size={17} />
          </button>
          <button className="gw-primary" disabled={sending || !text.trim()}>
            <Send size={16} />
            {sending ? "Šaljem…" : "Pošalji"}
          </button>
        </div>
      </form>
    </aside>
  );
}
