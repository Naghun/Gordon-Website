import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Inbox,
  CalendarDays,
  LayoutGrid,
  Layers,
  Plus,
  Palette,
  X,
  Check,
  CheckCheck,
  Search,
  Image as ImageIcon,
  ChevronDown,
  ArrowUpRight,
  Users,
  Clock3,
  MessageSquare,
  Trash2,
  RotateCcw,
  Archive,
  LogOut,
  Flag,
  Download,
  LockKeyhole,
} from "lucide-react";
import {
  uid,
  columns,
  day,
  people,
  blankTask,
  demoData,
  request,
  backgrounds,
  backdrop,
  imageData,
} from "./work-data";
import "./work.css";
import ListColorPopover from "./ListColorPopover";
import useListDrag from "./use-list-drag";
import { syncTaskCompletion } from "./task-completion";
import {
  WorkToolbar,
  WorkExtras,
  TeamMemberControls,
  Attachments,
  readable,
} from "./work-extras";
const shortDate = (d) =>
  d ? `${Number(d.slice(8))}.${Number(d.slice(5, 7))}.` : "Bez roka";
const initials = (name) =>
  (name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
function Modal({ title, children, close, wide = false }) {
  const ref = useRef();
  useEffect(() => {
    const old = document.activeElement;
    ref.current.showModal();
    return () => old?.focus();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`gw-dialog ${wide ? "gw-wide" : ""}`}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="gw-dialog-head">
        <span>{title}</span>
        <button onClick={close} aria-label="Zatvori">
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export default function WorkSpace() {
  const navigate = useNavigate();
  const [inboxView, setInboxView] = useState("active");
  const [mode, setMode] = useState(null),
    [user, setUser] = useState(null),
    [data, setData] = useState({ projects: [], tasks: [] }),
    [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState(""),
    [panels, setPanels] = useState({
      inbox: false,
      planner: false,
      board: true,
    }),
    [view, setView] = useState("board");
  const [modal, setModal] = useState(null),
    [draft, setDraft] = useState(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  const [listEdit, setListEdit] = useState(null),
    [listTarget, setListTarget] = useState("");
  const [listColors, setListColors] = useState(null);
  const listSort = useListDrag(async (order) => {
    const ok = await run(() =>
      patchProject({
        columns: order.map((id) => project.columns.find((c) => c.id === id)),
      }),
    );
    if (ok) setNotice("Raspored lista je sačuvan.");
  });
  const [expandedTasks, setExpandedTasks] = useState({});
  const [search, setSearch] = useState(""),
    [mine, setMine] = useState(false),
    [quick, setQuick] = useState(null),
    [quickText, setQuickText] = useState("");
  const [projectName, setProjectName] = useState(""),
    [memberName, setMemberName] = useState(""),
    [columnName, setColumnName] = useState(""),
    [columnColor, setColumnColor] = useState("#5ca9ff");
  const [checkText, setCheckText] = useState(""),
    [comment, setComment] = useState(""),
    [deleteConfirm, setDeleteConfirm] = useState(false),
    [photoSearch, setPhotoSearch] = useState("");
  const [plannerDay, setPlannerDay] = useState(day()),
    [username, setUsername] = useState("Abdullah"),
    [password, setPassword] = useState("");
  const operation = useRef(false);
  useEffect(() => {
    const existing = document.querySelector('meta[name="robots"]');
    const previous = existing?.content;
    const robots = existing || document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    if (!existing) document.head.appendChild(robots);
    return () => {
      if (existing) existing.content = previous;
      else robots.remove();
    };
  }, []);
  const project =
    data.projects.find((p) => p.id === projectId) || data.projects[0];
  const projectPeople = project?.members || [];
  const owner = mode === "demo" || project?.owner === user?.id;
  const editable = (projectId) =>
    mode === "demo" ||
    data.projects.find((p) => p.id === projectId)?.roles?.[user?.id] !==
      "viewer";
  function startDemo() {
    navigate("/dashboard/work?demo=1", { replace: true });
    setMode("demo");
    setUser(people[0]);
    setData(demoData());
    setLoading(false);
    setError("");
  }
  useEffect(() => {
    document.title = "Gordon Work · Tvoj radni prostor";
    let active = true;
    if (new URLSearchParams(location.search).get("demo") === "1") {
      startDemo();
      return;
    }
    request("session/")
      .then(async (s) => {
        if (!active) return;
        if (s.user) {
          const d = await request("state/");
          if (active) {
            setUser(s.user);
            setMode("team");
            setData(d);
          }
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (mode !== "demo") return;
    try {
      localStorage.setItem("gordon-work-v2", JSON.stringify(data));
    } catch {
      setError(
        "Preglednik nije uspio sačuvati promjenu. Izvezite podatke ili odaberite manju pozadinu.",
      );
    }
  }, [data, mode]);
  useEffect(() => {
    if (mode !== "team") return;
    let active = true;
    const timer = setInterval(() => {
      if (document.visibilityState !== "visible" || operation.current) return;
      request("state/")
        .then((d) => {
          if (active) setData(d);
        })
        .catch((e) => {
          if (e.status === 403 || e.status === 401) {
            setData({ projects: [], tasks: [] });
            setUser(null);
            setMode(null);
            setError("Sesija je istekla. Prijavite se ponovo.");
          }
        });
    }, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [mode]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
  async function run(action) {
    if (operation.current) return false;
    operation.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
      return true;
    } catch (e) {
      setError(e.message);
      if (e.status === 409) {
        try {
          setData(await request("state/"));
        } catch {
          /* keep draft */
        }
      }
      return false;
    } finally {
      operation.current = false;
      setBusy(false);
    }
  }
  async function login(e) {
    e.preventDefault();
    await run(async () => {
      await request("session/");
      const s = await request("login/", "POST", { username, password });
      const d = await request("state/");
      setUser(s.user);
      setMode("team");
      setData(d);
      setPassword("");
      setProjectId("");
      navigate("/dashboard/work", { replace: true });
    });
  }
  async function leave() {
    await run(async () => {
      if (mode === "team") await request("logout/", "POST", {});
      setData({ projects: [], tasks: [] });
      setUser(null);
      setMode(null);
      setModal(null);
      navigate("/dashboard/work", { replace: true });
    });
  }
  function member(id, p = project) {
    return (
      p?.members.find((u) => u.id === id) ||
      people.find((u) => mode === "demo" && u.id === id) ||
      (user?.id === id ? user : null)
    );
  }
  async function writeTask(task, extra = {}, remove = false) {
    const existing = data.tasks.find((t) => t.id === task.id);
    let result;
    if (mode === "team") {
      const body = {
        project: task.project,
        title: task.title,
        description: task.description,
        status: task.status,
        person: task.person,
        priority: task.priority,
        label: task.label,
        due: task.due,
        checklist: task.checklist,
        parent: task.parent || null,
        appearance: task.appearance || {},
        archived: task.archived,
        revision: task.revision,
        ...extra,
      };
      result = await request(
        existing ? `tasks/${task.id}/` : "tasks/",
        remove ? "DELETE" : existing ? "PATCH" : "POST",
        body,
      );
    } else {
      result = {
        ...task,
        ...extra,
        revision: (existing?.revision || 0) + 1,
        deleted: remove ? true : (extra.deleted ?? task.deleted),
      };
      if (extra.comment)
        result.comments = [
          ...task.comments,
          {
            id: uid(),
            text: extra.comment,
            author: user,
            time: new Date().toISOString(),
          },
        ];
      result.activity = [
        {
          text: remove
            ? "Premješteno u korpu"
            : existing
              ? "Zadatak ažuriran"
              : "Zadatak kreiran",
          author: user,
          time: new Date().toISOString(),
        },
        ...(task.activity || []),
      ];
      delete result.comment;
      const recipients = new Set();
      if (result.person && result.person !== existing?.person)
        recipients.add(result.person);
      if (extra.comment)
        for (const name of extra.comment.matchAll(/(?<!\w)@([\w.@+-]+)/g)) {
          const match = (project?.members || [user]).find(
            (p) => p.username === name[1],
          );
          if (match) recipients.add(match.id);
        }
      if (recipients.has(user.id))
        setData((d) => ({
          ...d,
          notifications: [
            {
              id: uid(),
              task: task.id,
              text: `Nova aktivnost: ${task.title}`,
              read: false,
              time: new Date().toISOString(),
            },
            ...(d.notifications || []),
          ],
        }));
    }
    setData((d) => {
      let tasks = existing
        ? d.tasks.map((t) => (t.id === result.id ? result : t))
        : [...d.tasks, result];
      tasks =
        mode === "demo"
          ? syncTaskCompletion(tasks, result, existing, d.projects)
          : tasks.map((t) => result.related?.find((x) => x.id === t.id) || t);
      return { ...d, tasks };
    });
    return result;
  }
  async function patchProject(values) {
    if (mode === "team" && (values.remove_column || values.reset_display)) {
      await request(`projects/${project.id}/`, "PATCH", values);
      setData(await request("state/"));
      return;
    }
    if (mode === "demo" && (values.remove_column || values.reset_display)) {
      const defaults = columns();
      setData((d) => ({
        ...d,
        projects: d.projects.map((p) =>
          p.id !== project.id
            ? p
            : values.reset_display
              ? {
                  ...p,
                  background: "aurora",
                  columns: p.columns.map((c) => ({
                    id: c.id,
                    name: c.name,
                    color:
                      defaults.find((x) => x.id === c.id)?.color || "#aa8cff",
                  })),
                }
              : {
                  ...p,
                  columns: p.columns.filter(
                    (c) => c.id !== values.remove_column,
                  ),
                },
        ),
        tasks: d.tasks.map((t) =>
          t.project !== project.id
            ? t
            : values.reset_display
              ? { ...t, appearance: {} }
              : t.status === values.remove_column
                ? { ...t, status: values.move_to }
                : t,
        ),
      }));
      return;
    }
    const result =
      mode === "team"
        ? await request(`projects/${project.id}/`, "PATCH", values)
        : { ...project, ...values };
    setData((d) => ({
      ...d,
      projects: d.projects.map((p) => (p.id === result.id ? result : p)),
    }));
  }
  function openTask(t) {
    setDraft(structuredClone(t));
    setCheckText("");
    setComment("");
    setDeleteConfirm(false);
    setError("");
    setModal("task");
  }
  async function reorderList(id, target) {
    if (!owner || id === target) return;
    const next = [...project.columns],
      from = next.findIndex((c) => c.id === id),
      to = next.findIndex((c) => c.id === target);
    if (from < 0 || to < 0) return;
    const [col] = next.splice(from, 1);
    next.splice(to, 0, col);
    await run(() => patchProject({ columns: next }));
  }
  function newTask() {
    openTask({
      ...blankTask(project?.id || null, project?.columns[0]?.id || "inbox"),
      creator: user.id,
    });
  }
  async function saveTask(e) {
    e.preventDefault();
    if (!editable(draft.project)) return;
    if (!draft.title.trim()) return;
    const ok = await run(() =>
      writeTask(
        { ...draft, title: draft.title.trim() },
        { ...(comment.trim() ? { comment: comment.trim() } : {}) },
      ),
    );
    if (ok) {
      setModal(null);
      setNotice("Zadatak je sačuvan.");
    }
  }
  async function move(t, status) {
    await run(async () => {
      await writeTask({ ...t, status });
      if (status === "done")
        setNotice("Završeno! Zadatak je u pregledu „Završeni“.");
    });
  }
  async function quickAdd(e, p, status) {
    e.preventDefault();
    if (!quickText.trim()) return;
    const ok = await run(() =>
      writeTask({
        ...blankTask(p, status),
        title: quickText.trim(),
        creator: user.id,
      }),
    );
    if (ok) {
      setQuickText("");
      setQuick(null);
    }
  }
  function toggle(id) {
    setPanels((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      return Object.values(next).some(Boolean) ? next : prev;
    });
  }
  function selectProject(p) {
    setProjectId(p.id);
    setView("board");
    setSearch("");
    setMine(false);
    setPanels((prev) => ({ ...prev, board: true }));
    setModal(null);
  }
  const active = data.tasks.filter(
      (t) => t.project === project?.id && !t.deleted && !t.archived,
    ),
    done = active.filter((t) => t.status === "done");
  const matches = (t) =>
    (!mine || t.person === user?.id) &&
    `${t.title} ${t.label} ${t.description}`
      .toLowerCase()
      .includes(search.toLowerCase());
  const boardTasks = data.tasks.filter(
    (t) =>
      t.project === project?.id &&
      matches(t) &&
      (view === "trash"
        ? t.deleted
        : view === "archive"
          ? t.archived && !t.deleted
          : !t.archived &&
            !t.deleted &&
            (view === "done" ? t.status === "done" : t.status !== "done")),
  );
  const inboxTasks = data.tasks.filter(
    (t) =>
      !t.project &&
      (inboxView === "trash"
        ? t.deleted
        : inboxView === "archive"
          ? t.archived && !t.deleted
          : !t.deleted &&
            !t.archived &&
            (inboxView === "done" ? t.status === "done" : t.status !== "done")),
  );
  const personal = data.tasks.filter(
    (t) =>
      !t.deleted &&
      !t.archived &&
      t.status !== "done" &&
      (t.person === user?.id || (!t.project && t.creator === user?.id)),
  );
  function taskCard(t, compact = false) {
    const children = data.tasks.filter(
      (c) => c.parent === t.id && !c.deleted && !c.archived,
    );
    const total = children.length + t.checklist.length;
    const finished =
      children.filter((c) => c.status === "done").length +
      t.checklist.filter((c) => c.done).length;
    const p = data.projects.find((p) => p.id === t.project),
      color =
        t.status === "done"
          ? "#56d8a0"
          : p?.columns.find((c) => c.id === t.status)?.color || "#aa8cff",
      person = member(t.person, p);
    return (
      <article
        key={t.id}
        className={`gw-card ${compact ? "gw-card-compact" : ""}`}
        style={{
          "--status": color,
          "--card-border": t.appearance?.border || undefined,
          "--card-fill":
            t.appearance?.fill ||
            p?.columns.find((c) => c.id === t.status)?.card ||
            undefined,
          "--card-text": readable(
            t.appearance?.fill ||
              p?.columns.find((c) => c.id === t.status)?.card,
          ),
        }}
        draggable={!t.deleted && !t.archived && editable(t.project)}
        onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)}
      >
        <button className="gw-card-open" onClick={() => openTask(t)}>
          <div className="gw-card-tags">
            {t.label && <span>{t.label}</span>}
            {t.priority === "Visok" && (
              <b>
                <Flag size={11} />
                Visok
              </b>
            )}
          </div>
          <h3>{t.title}</h3>
          {t.parent && (
            <small className="gw-parent-label">
              ↳{" "}
              {data.tasks.find((x) => x.id === t.parent)?.title || "Podzadatak"}
            </small>
          )}
          {!compact && t.checklist.length > 0 && (
            <div className="gw-progress">
              <i
                style={{
                  width: `${(t.checklist.filter((c) => c.done).length / t.checklist.length) * 100}%`,
                }}
              />
            </div>
          )}
          <div className="gw-card-meta">
            {t.due && (
              <span
                className={t.due < day() && t.status !== "done" ? "late" : ""}
              >
                <Clock3 size={12} />
                {shortDate(t.due)}
              </span>
            )}
            {t.checklist.length > 0 && (
              <span>
                <CheckCheck size={13} />
                {t.checklist.filter((c) => c.done).length}/{t.checklist.length}
              </span>
            )}
            {t.comments.length > 0 && (
              <span>
                <MessageSquare size={12} />
                {t.comments.length}
              </span>
            )}
            <span
              className="gw-avatar"
              title={person?.name || "Nije dodijeljeno"}
            >
              {initials(person?.name)}
            </span>
          </div>
        </button>
        {total > 0 && (
          <div className="gw-subtasks" style={{ color: "var(--card-text)" }}>
            <button
              className="gw-subtask-toggle"
              aria-label={`Podzadaci: ${t.title}`}
              aria-expanded={!!expandedTasks[t.id]}
              onClick={() =>
                setExpandedTasks((v) => ({ ...v, [t.id]: !v[t.id] }))
              }
            >
              <ChevronDown
                size={15}
                style={{
                  transform: expandedTasks[t.id] ? "rotate(180deg)" : undefined,
                }}
              />
              {finished}/{total} podzadataka i koraka
            </button>
            {expandedTasks[t.id] && (
              <div className="gw-subtask-items">
                {children.map((c) => (
                  <label key={c.id}>
                    <input
                      type="checkbox"
                      checked={c.status === "done"}
                      disabled={busy || !editable(c.project)}
                      onChange={() =>
                        move(
                          c,
                          c.status === "done"
                            ? data.projects.find((p) => p.id === c.project)
                                ?.columns[0]?.id || "inbox"
                            : "done",
                        )
                      }
                    />
                    <span className={c.status === "done" ? "struck" : ""}>
                      {c.title}
                    </span>
                  </label>
                ))}
                {t.checklist.map((c) => (
                  <label key={c.id}>
                    <input
                      type="checkbox"
                      checked={c.done}
                      disabled={busy || !editable(t.project)}
                      onChange={() =>
                        run(() =>
                          writeTask({
                            ...t,
                            checklist: t.checklist.map((x) =>
                              x.id === c.id ? { ...x, done: !x.done } : x,
                            ),
                          }),
                        )
                      }
                    />
                    <span className={c.done ? "struck" : ""}>{c.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
        <button
          className="gw-card-color"
          aria-label={`Boje kartice: ${t.title}`}
          title="Boje ove kartice"
          onClick={() => openTask(t)}
        >
          ◐
        </button>
        {!t.deleted && !t.archived && (
          <button
            className={`gw-complete ${t.status === "done" ? "checked" : ""}`}
            aria-label={`${t.status === "done" ? "Vrati u rad" : "Završi"}: ${t.title}`}
            disabled={busy || !editable(t.project)}
            onClick={() =>
              move(
                t,
                t.status === "done" ? p?.columns[0]?.id || "inbox" : "done",
              )
            }
          >
            <Check size={12} />
          </button>
        )}
      </article>
    );
  }
  function quickForm(key, p, status) {
    if (!editable(p)) return null;
    return quick === key ? (
      <form className="gw-quick" onSubmit={(e) => quickAdd(e, p, status)}>
        <textarea
          autoFocus
          aria-label="Naziv novog zadatka"
          placeholder="Šta treba uraditi?"
          value={quickText}
          onChange={(e) => setQuickText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form.requestSubmit();
            }
            if (e.key === "Escape") {
              setQuick(null);
              setQuickText("");
            }
          }}
          maxLength={180}
        />
        <div>
          <button className="gw-primary" disabled={busy || !quickText.trim()}>
            Dodaj karticu
          </button>
          <button
            type="button"
            aria-label="Odustani"
            onClick={() => setQuick(null)}
          >
            <X size={17} />
          </button>
        </div>
      </form>
    ) : (
      <button
        className="gw-add-card"
        onClick={() => {
          setQuick(key);
          setQuickText("");
        }}
      >
        <Plus size={16} />
        Dodaj karticu
      </button>
    );
  }
  function exportData() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "gordon-work.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  if (loading)
    return <div className="gw-login">Otvaram tvoj radni prostor…</div>;
  if (!user)
    return (
      <div className="gw-login">
        <div className="gw-login-card">
          <Link to="/" className="gw-brand">
            <b>g.</b>gordon <span>work</span>
          </Link>
          <LockKeyhole size={30} />
          <h1>
            Tvoj prostor.
            <br />
            Tvoj sljedeći korak.
          </h1>
          <p>
            Prijavi se svojim Gordon računom. Vidjet ćeš privatni Inbox i
            projekte u kojima si član.
          </p>
          <form onSubmit={login}>
            <label>
              Korisničko ime
              <input
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label>
              Lozinka
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button className="gw-primary" disabled={busy}>
              Prijavi se <ArrowUpRight size={17} />
            </button>
          </form>
          {error && (
            <p role="alert" className="gw-error">
              {error}
            </p>
          )}
          <button className="gw-demo-button" onClick={startDemo}>
            Isprobaj demo izgled bez prijave →
          </button>
          <small>Račun kreira administrator u postojećoj administraciji.</small>
        </div>
      </div>
    );
  return (
    <div
      className="gw-app"
      style={{ background: backdrop(project?.background || "aurora") }}
    >
      <header className="gw-topbar">
        <Link to="/" className="gw-brand">
          <b>g.</b>gordon <span>work</span>
        </Link>
        <span className="gw-divider" />
        <button
          className="gw-project-switch"
          onClick={() => setModal("projects")}
        >
          <Layers size={16} />
          {project?.name || "Izaberi projekat"}
          <ChevronDown size={15} />
        </button>
        <div className="gw-top-right">
          <span className={`gw-mode ${mode === "demo" ? "demo" : ""}`}>
            {mode === "demo" ? "DEMO · LOKALNO" : "TIMSKI PROSTOR"}
          </span>
          <span className="gw-avatar">{initials(user.name)}</span>
          <span className="gw-user-name">{user.name}</span>
          <button aria-label="Odjavi se" onClick={leave}>
            <LogOut size={17} />
          </button>
        </div>
      </header>
      <div className="gw-project-bar">
        <div>
          <span className="gw-eyebrow">MALO PO MALO. VELIKE STVARI.</span>
          <h1>
            {project?.name || "Dobro došao u Gordon Work"}
            <span className="gw-private">
              <LockKeyhole size={12} />
              Privatni projekat
            </span>
          </h1>
        </div>
        <div className="gw-project-actions">
          <div className="gw-members">
            {projectPeople.slice(0, 4).map((p) => (
              <span key={p.id} title={p.name} className="gw-avatar">
                {initials(p.name)}
              </span>
            ))}
          </div>
          <button onClick={() => setModal("members")} disabled={!project}>
            <Users size={16} />
            Članovi
          </button>
          <button onClick={() => setModal("background")} disabled={!project}>
            <ImageIcon size={16} />
            Pozadina
          </button>
          <button
            className="gw-primary"
            onClick={newTask}
            disabled={!editable(project?.id)}
          >
            <Plus size={17} />
            Novi zadatak
          </button>
        </div>
      </div>
      <div className="gw-controls">
        <label className="gw-search">
          <Search size={16} />
          <input
            placeholder="Pronađi zadatak…"
            aria-label="Pretraži zadatke"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <button className={mine ? "active" : ""} onClick={() => setMine(!mine)}>
          Dodijeljeno meni
        </button>
        <div className="gw-view-tabs">
          {[
            ["board", "Aktivni", LayoutGrid],
            ["done", `Završeni · ${done.length}`, CheckCheck],
            ["archive", "Arhiva", Archive],
            ["trash", "Korpa", Trash2],
          ].map(([id, label, Icon]) => (
            <button
              key={id}
              className={view === id ? "active" : ""}
              onClick={() => {
                setView(id);
                setPanels((p) => ({ ...p, board: true }));
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
        <span className="gw-progress-label">
          {done.length}/{active.length} završeno
        </span>
        <button aria-label="Izvezi dostupne projekte" onClick={exportData}>
          <Download size={16} />
        </button>
      </div>
      <WorkToolbar setModal={setModal} data={data} />
      {error && (
        <div role="alert" className="gw-error-bar">
          {error}
          <button aria-label="Zatvori obavijest" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}
      <div className="gw-panels">
        {panels.inbox && (
          <aside className="gw-inbox gw-panel">
            <div className="gw-panel-title">
              <h2>
                <Inbox size={18} />
                Moj Inbox <b>{inboxTasks.length}</b>
              </h2>
              <button aria-label="Sakrij Inbox" onClick={() => toggle("inbox")}>
                <X size={16} />
              </button>
            </div>
            <p className="gw-panel-note">
              Samo tvoje ideje. Otvori karticu i prebaci je u projekat kada bude
              spremna.
            </p>
            <select
              className="gw-inbox-filter"
              aria-label="Pregled Inboxa"
              value={inboxView}
              onChange={(e) => setInboxView(e.target.value)}
            >
              <option value="active">Aktivne ideje</option>
              <option value="done">Završeno</option>
              <option value="archive">Arhiva</option>
              <option value="trash">Korpa</option>
            </select>
            {inboxView === "active" && quickForm("inbox", null, "inbox")}
            <div className="gw-panel-scroll">
              {inboxTasks.filter(matches).map((t) => taskCard(t, true))}
              {!inboxTasks.length && (
                <div className="gw-empty">
                  <Inbox size={27} />
                  <p>Uhvatimo sljedeću dobru ideju.</p>
                </div>
              )}
            </div>
          </aside>
        )}
        {panels.planner && (
          <aside className="gw-planner gw-panel">
            <div className="gw-panel-title">
              <h2>
                <CalendarDays size={18} />
                Moj planer
              </h2>
              <button
                aria-label="Sakrij planer"
                onClick={() => toggle("planner")}
              >
                <X size={16} />
              </button>
            </div>
            <div className="gw-planner-date">
              <input
                type="date"
                aria-label="Početni datum planera"
                value={plannerDay}
                onChange={(e) => setPlannerDay(e.target.value || day())}
              />
              <button onClick={() => setPlannerDay(day())}>Danas</button>
            </div>
            <p className="gw-panel-note">Tvoji rokovi iz svih projekata.</p>
            <div className="gw-panel-scroll">
              {Array.from({ length: 7 }, (_, i) => {
                const d = new Date(`${plannerDay}T12:00:00`);
                d.setDate(d.getDate() + i);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
                  items = personal.filter((t) => t.due === key && matches(t));
                return (
                  <section
                    className="gw-planner-day"
                    key={key}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const t = personal.find(
                        (t) => t.id === e.dataTransfer.getData("text/plain"),
                      );
                      if (t) run(() => writeTask({ ...t, due: key }));
                    }}
                  >
                    <h3>
                      {key === day() ? "Danas" : shortDate(key)}{" "}
                      <small>
                        {
                          [
                            "Nedjelja",
                            "Ponedjeljak",
                            "Utorak",
                            "Srijeda",
                            "Četvrtak",
                            "Petak",
                            "Subota",
                          ][d.getDay()]
                        }
                      </small>
                    </h3>
                    {items.map((t) => taskCard(t, true))}
                    {!items.length && <p>Nema planiranih zadataka</p>}
                  </section>
                );
              })}
              <section className="gw-planner-day">
                <h3>Bez roka</h3>
                {personal
                  .filter((t) => !t.due && matches(t))
                  .map((t) => taskCard(t, true))}
              </section>
            </div>
          </aside>
        )}
        {panels.board && (
          <section className="gw-board-panel">
            <div className="gw-board-caption">
              <span>
                <LayoutGrid size={16} />
                {view === "board"
                  ? "Tabla projekta"
                  : view === "done"
                    ? "Završeni zadaci"
                    : view === "trash"
                      ? "Obrisani zadaci"
                      : "Arhivirani zadaci"}
              </span>
              <span>
                {view === "board"
                  ? "Prevuci karticu ili promijeni status u detaljima"
                  : view === "done"
                    ? "Završeni su sklonjeni s aktivne table."
                    : view === "trash"
                      ? "Zadatke možeš vratiti iz korpe."
                      : "Sačuvano za kasnije."}
              </span>
            </div>
            {!project ? (
              <div className="gw-welcome">
                <Layers size={36} />
                <h2>Prvi projekat, prvi korak.</h2>
                <p>Kreiraj projekat pa dodaj kolege i zadatke.</p>
                <button
                  className="gw-primary"
                  onClick={() => setModal("projects")}
                >
                  <Plus size={16} />
                  Kreiraj projekat
                </button>
              </div>
            ) : view === "board" ? (
              <div className="gw-board">
                {project.columns.map((col, columnIndex) => (
                  <section
                    key={col.id}
                    data-list-id={col.id}
                    className={`gw-column ${listSort.preview?.id === col.id ? "gw-list-placeholder" : ""}`}
                    style={{
                      ...listSort.style(col.id, columnIndex),
                      "--status": col.color,
                      "--list-fill": col.fill || undefined,
                      "--list-border": col.border || undefined,
                      "--list-text": readable(col.fill),
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const t = data.tasks.find(
                        (t) => t.id === e.dataTransfer.getData("text/plain"),
                      );
                      if (
                        t &&
                        t.project === project.id &&
                        !t.deleted &&
                        !t.archived
                      )
                        move(t, col.id);
                    }}
                  >
                    <div
                      className="gw-list-grip"
                      role="button"
                      aria-label={`Prevuci listu ${col.name}`}
                      data-sortable={owner}
                      title="Povuci za promjenu rasporeda"
                      {...listSort.handlers(col.id, owner && !busy)}
                    >
                      <span />
                    </div>
                    <div className="gw-column-head">
                      <i />
                      <h2>{col.name}</h2>
                      <b>
                        {
                          boardTasks.filter(
                            (t) =>
                              t.status === col.id &&
                              (!t.parent ||
                                !boardTasks.some(
                                  (parent) => parent.id === t.parent,
                                )),
                          ).length
                        }
                      </b>
                      <button
                        className="gw-list-palette"
                        aria-label={`Boje liste ${col.name}`}
                        onClick={(e) => {
                          setError("");
                          setListColors({
                            id: col.id,
                            anchor: e.currentTarget,
                          });
                        }}
                      >
                        <Palette size={15} />
                      </button>
                      <span className="gw-column-spacer" />
                      <button
                        aria-label={`Dodaj u ${col.name}`}
                        onClick={() => {
                          setQuick(col.id);
                          setQuickText("");
                        }}
                      >
                        <Plus size={17} />
                      </button>
                      {owner && (
                        <button
                          aria-label={`Opcije liste ${col.name}`}
                          onClick={() => {
                            setListEdit(col);
                            setListTarget(
                              project.columns.find((c) => c.id !== col.id)
                                ?.id || "",
                            );
                            setModal("list-options");
                          }}
                        >
                          ⋯
                        </button>
                      )}
                    </div>
                    <div className="gw-column-cards">
                      {boardTasks
                        .filter(
                          (t) =>
                            !t.parent ||
                            !boardTasks.some(
                              (parent) => parent.id === t.parent,
                            ),
                        )
                        .filter((t) => t.status === col.id)
                        .map((t) => taskCard(t))}
                    </div>
                    {quickForm(col.id, project.id, col.id)}
                  </section>
                ))}
                {owner && (
                  <button
                    className="gw-add-list"
                    onClick={() => setModal("column")}
                  >
                    <Plus size={17} />
                    Dodaj listu
                  </button>
                )}
              </div>
            ) : (
              <div className="gw-task-list">
                {boardTasks.map((t) => (
                  <div key={t.id} className="gw-list-row">
                    <span className={view === "done" ? "gw-done-icon" : ""}>
                      <CheckCheck size={20} />
                    </span>
                    <button onClick={() => openTask(t)}>
                      <strong>{t.title}</strong>
                      <small>
                        {t.label || project.name} ·{" "}
                        {member(t.person)?.name || "Nije dodijeljeno"}
                      </small>
                    </button>
                    <span>{shortDate(t.due)}</span>
                    <button
                      className="gw-restore"
                      disabled={busy}
                      onClick={() =>
                        run(() =>
                          writeTask(
                            {
                              ...t,
                              status:
                                view === "done"
                                  ? project.columns[0].id
                                  : t.status,
                            },
                            { deleted: false, archived: false },
                          ),
                        )
                      }
                    >
                      <RotateCcw size={15} />
                      Vrati
                    </button>
                  </div>
                ))}
                {!boardTasks.length && (
                  <div className="gw-empty">
                    <CheckCheck size={32} />
                    <h3>
                      {search
                        ? "Nema rezultata pretrage"
                        : "Ovdje još nema zadataka."}
                    </h3>
                    <p>
                      {view === "done"
                        ? "Završi zadatak na tabli i pojavit će se ovdje."
                        : "Sve je pregledno i na svom mjestu."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>
      <nav className="gw-dock" aria-label="Radni paneli">
        {[
          ["inbox", "Inbox", Inbox],
          ["planner", "Planer", CalendarDays],
          ["board", "Tabla", LayoutGrid],
        ].map(([id, label, Icon]) => (
          <button
            key={id}
            aria-pressed={panels[id]}
            className={panels[id] ? "active" : ""}
            onClick={() => toggle(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
        <span />
        <button onClick={() => setModal("projects")}>
          <Layers size={18} />
          <span>Projekti</span>
          <ChevronDown size={13} />
        </button>
      </nav>
      <div className="gw-save-state">
        {busy
          ? "Čuvamo…"
          : mode === "demo"
            ? "Demo · čuva se u ovom pregledniku"
            : "Privatni prostor · automatsko osvježavanje svakih 15 s"}
      </div>
      {notice && (
        <div role="status" className="gw-toast">
          <Check size={18} />
          {notice}
        </div>
      )}
      {modal === "task" && draft && (
        <Modal
          title={
            draft.project
              ? data.projects.find((p) => p.id === draft.project)?.name ||
                "Zadatak"
              : "Moj privatni Inbox"
          }
          wide
          close={() => !busy && setModal(null)}
        >
          <form onSubmit={saveTask}>
            <div className="gw-task-layout">
              <div className="gw-task-details">
                <input
                  className="gw-task-title"
                  aria-label="Naziv zadatka"
                  required
                  maxLength={180}
                  value={draft.title}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                  placeholder="Naziv zadatka"
                  autoFocus
                />
                <div className="gw-task-fields">
                  <label>
                    Projekat
                    <select
                      value={draft.project || ""}
                      onChange={(e) => {
                        const p = data.projects.find(
                          (p) => p.id === e.target.value,
                        );
                        setDraft({
                          ...draft,
                          project: p?.id || null,
                          status: p?.columns[0].id || "inbox",
                          person: null,
                        });
                      }}
                    >
                      {draft.creator === user.id && (
                        <option value="">Privatni Inbox</option>
                      )}
                      {data.projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Status
                    <select
                      value={draft.status}
                      onChange={(e) =>
                        setDraft({ ...draft, status: e.target.value })
                      }
                    >
                      {(
                        data.projects.find((p) => p.id === draft.project)
                          ?.columns || [{ id: "inbox", name: "Inbox" }]
                      )
                        .concat([{ id: "done", name: "Završeno" }])
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label>
                    Odgovorna osoba
                    <select
                      value={draft.person || ""}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          person: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                    >
                      <option value="">Nije dodijeljeno</option>
                      {(
                        data.projects.find((p) => p.id === draft.project)
                          ?.members || [user]
                      ).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Rok
                    <input
                      type="date"
                      value={draft.due}
                      onChange={(e) =>
                        setDraft({ ...draft, due: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Prioritet
                    <select
                      value={draft.priority}
                      onChange={(e) =>
                        setDraft({ ...draft, priority: e.target.value })
                      }
                    >
                      {["Nizak", "Srednji", "Visok"].map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Oznaka
                    <input
                      maxLength={40}
                      placeholder="Dizajn, marketing…"
                      value={draft.label}
                      onChange={(e) =>
                        setDraft({ ...draft, label: e.target.value })
                      }
                    />
                  </label>
                </div>
                <section className="gw-card-appearance">
                  <h3>Boje ove kartice</h3>
                  <div className="gw-extra-actions">
                    {[
                      ["fill", "Boja kartice", "#242d3d"],
                      ["border", "Boja okvira", "#aa8cff"],
                    ].map(([key, label, fallback]) => (
                      <label key={key}>
                        {label}
                        <input
                          type="color"
                          aria-label={label}
                          value={draft.appearance?.[key] || fallback}
                          disabled={!editable(draft.project)}
                          onInput={(e) =>
                            setDraft({
                              ...draft,
                              appearance: {
                                ...draft.appearance,
                                [key]: e.target.value,
                              },
                            })
                          }
                        />
                      </label>
                    ))}
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, appearance: {} })}
                    >
                      Koristi boje liste
                    </button>
                  </div>
                  <div
                    className="gw-color-example"
                    style={{
                      background: draft.appearance?.fill || "#242d3d",
                      color: readable(draft.appearance?.fill),
                      border: `2px solid ${draft.appearance?.border || "#aa8cff"}`,
                    }}
                  >
                    {draft.title || "Pregled kartice"}
                  </div>
                  <small>
                    Promjena važi samo za ovaj zadatak. Potvrdi dugmetom
                    Sačuvaj.
                  </small>
                </section>
                <label className="gw-description">
                  Glavni zadatak
                  <select
                    value={draft.parent || ""}
                    onChange={(e) =>
                      setDraft({ ...draft, parent: e.target.value || null })
                    }
                  >
                    <option value="">Samostalan zadatak</option>
                    {data.tasks
                      .filter(
                        (t) =>
                          t.project === draft.project &&
                          t.id !== draft.id &&
                          !t.parent &&
                          !t.deleted,
                      )
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                  </select>
                </label>
                {data.tasks.filter((t) => t.parent === draft.id && !t.deleted)
                  .length > 0 && (
                  <section className="gw-extra-section">
                    <h3>Podzadaci</h3>
                    {data.tasks
                      .filter((t) => t.parent === draft.id && !t.deleted)
                      .map((t) => (
                        <button
                          className="gw-subtask-link"
                          type="button"
                          key={t.id}
                          onClick={() => openTask(t)}
                        >
                          {t.status === "done" ? "✓" : "↳"} {t.title}
                        </button>
                      ))}
                  </section>
                )}
                <label className="gw-description">
                  <strong>Opis zadatka</strong>
                  <textarea
                    rows={4}
                    maxLength={20000}
                    placeholder="Šta želimo postići? Dodaj kontekst i detalje…"
                    value={draft.description}
                    onChange={(e) =>
                      setDraft({ ...draft, description: e.target.value })
                    }
                  />
                </label>
                <h3>
                  <CheckCheck size={17} />
                  Koraci{" "}
                  <small>
                    {draft.checklist.filter((c) => c.done).length}/
                    {draft.checklist.length}
                  </small>
                </h3>
                <div className="gw-progress">
                  <i
                    style={{
                      width: `${draft.checklist.length ? (draft.checklist.filter((c) => c.done).length / draft.checklist.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                {draft.checklist.map((c) => (
                  <div className="gw-check-row" key={c.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={c.done}
                        onChange={() =>
                          setDraft({
                            ...draft,
                            checklist: draft.checklist.map((x) =>
                              x.id === c.id ? { ...x, done: !x.done } : x,
                            ),
                          })
                        }
                      />
                      <span className={c.done ? "struck" : ""}>{c.title}</span>
                    </label>
                    <button
                      type="button"
                      aria-label={`Ukloni korak ${c.title}`}
                      onClick={() =>
                        setDraft({
                          ...draft,
                          checklist: draft.checklist.filter(
                            (x) => x.id !== c.id,
                          ),
                        })
                      }
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div className="gw-inline-add">
                  <input
                    aria-label="Novi korak"
                    placeholder="Dodaj mali korak…"
                    maxLength={300}
                    value={checkText}
                    onChange={(e) => setCheckText(e.target.value)}
                  />
                  <button
                    type="button"
                    disabled={
                      !checkText.trim() || draft.checklist.length >= 100
                    }
                    onClick={() => {
                      setDraft({
                        ...draft,
                        checklist: [
                          ...draft.checklist,
                          { id: uid(), title: checkText.trim(), done: false },
                        ],
                      });
                      setCheckText("");
                    }}
                  >
                    <Plus size={17} />
                  </button>
                </div>
              </div>
              <aside className="gw-task-conversation">
                <Attachments
                  draft={draft}
                  setDraft={setDraft}
                  data={data}
                  setData={setData}
                  mode={mode}
                  run={run}
                  busy={busy || !editable(draft.project)}
                />
                <h3>
                  <MessageSquare size={17} />
                  Komentari i aktivnost
                </h3>
                {draft.comments.map((c) => (
                  <div className="gw-comment" key={c.id}>
                    <div>
                      <span className="gw-avatar">
                        {initials(c.author?.name || "Semir")}
                      </span>
                      <strong>{c.author?.name || "Semir"}</strong>
                    </div>
                    <p>{c.text}</p>
                    <small>{new Date(c.time).toLocaleString("hr-HR")}</small>
                  </div>
                ))}
                <textarea
                  aria-label="Novi komentar"
                  placeholder="Napiši komentar…"
                  rows={3}
                  maxLength={5000}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <small>Komentar se objavljuje uz „Sačuvaj“.</small>
                <div className="gw-mentions">
                  {(
                    data.projects.find((p) => p.id === draft.project)
                      ?.members || [user]
                  )
                    .filter((p) => p.id !== user.id)
                    .map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() =>
                          setComment(
                            (c) =>
                              `${c}${c && !c.endsWith(" ") ? " " : ""}@${p.username} `,
                          )
                        }
                      >
                        @{p.username}
                      </button>
                    ))}
                </div>
                <div className="gw-activity">
                  {(draft.activity || []).map((a, i) => (
                    <p key={i}>
                      <span className="gw-avatar">
                        {initials(a.author?.name)}
                      </span>
                      <span>
                        <strong>{a.author?.name}</strong>
                        <br />
                        {a.text}
                        <small>
                          {new Date(a.time).toLocaleString("hr-HR")}
                        </small>
                      </span>
                    </p>
                  ))}
                </div>
              </aside>
            </div>
            {error && (
              <p className="gw-modal-error" role="alert">
                {error}
              </p>
            )}
            {!editable(draft.project) && (
              <p className="gw-modal-error">
                Ovaj projekat možeš pregledati. Za izmjene se obrati vlasniku.
              </p>
            )}
            <div className="gw-task-footer">
              {data.tasks.some((t) => t.id === draft.id) && (
                <>
                  <button
                    type="button"
                    className="gw-danger"
                    disabled={busy || !editable(draft.project)}
                    onClick={async () => {
                      if (!deleteConfirm && !draft.deleted) {
                        setDeleteConfirm(true);
                        return;
                      }
                      const ok = await run(() =>
                        writeTask(
                          draft,
                          draft.deleted ? { deleted: false } : {},
                          !draft.deleted,
                        ),
                      );
                      if (ok) {
                        setModal(null);
                        setNotice(
                          draft.deleted
                            ? "Zadatak je vraćen."
                            : "Zadatak je u korpi. Možeš ga vratiti.",
                        );
                      }
                    }}
                  >
                    <Trash2 size={16} />
                    {draft.deleted
                      ? "Vrati iz korpe"
                      : deleteConfirm
                        ? "Potvrdi brisanje"
                        : "Obriši"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      const ok = await run(
                        () =>
                          editable(draft.project) &&
                          writeTask({ ...draft, archived: !draft.archived }),
                      );
                      if (ok) setModal(null);
                    }}
                  >
                    <Archive size={16} />
                    {draft.archived ? "Vrati iz arhive" : "Arhiviraj"}
                  </button>
                </>
              )}
              <button
                className="gw-primary"
                disabled={busy || !editable(draft.project)}
              >
                <Check size={17} />
                {busy ? "Čuvamo…" : "Sačuvaj"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === "projects" && (
        <Modal title="Tvoji projekti" close={() => setModal(null)}>
          <div className="gw-modal-body">
            <p>Sve na svom mjestu. Odaberi prostor za sljedeći zadatak.</p>
            <div className="gw-project-grid">
              {data.projects.map((p) => (
                <button
                  key={p.id}
                  className={p.id === project?.id ? "selected" : ""}
                  onClick={() => selectProject(p)}
                >
                  <span style={{ background: backdrop(p.background) }}>
                    <Layers size={25} />
                    {p.id === project?.id && <Check size={18} />}
                  </span>
                  <strong>{p.name}</strong>
                  <small>
                    {p.members.length} članova ·{" "}
                    {
                      data.tasks.filter(
                        (t) =>
                          t.project === p.id &&
                          !t.deleted &&
                          !t.archived &&
                          t.status !== "done",
                      ).length
                    }{" "}
                    aktivnih zadataka
                  </small>
                </button>
              ))}
            </div>
            <form
              className="gw-new-project"
              onSubmit={async (e) => {
                e.preventDefault();
                const ok = await run(async () => {
                  const p =
                    mode === "team"
                      ? await request("projects/", "POST", {
                          name: projectName,
                        })
                      : {
                          id: uid(),
                          name: projectName.trim(),
                          owner: user.id,
                          members: people,
                          columns: columns(),
                          background: "aurora",
                        };
                  setData((d) => ({ ...d, projects: [...d.projects, p] }));
                  setProjectId(p.id);
                  setProjectName("");
                  setView("board");
                  setPanels((p) => ({ ...p, board: true }));
                });
                if (ok) setModal(null);
              }}
            >
              <label>
                Novi projekat
                <input
                  required
                  maxLength={100}
                  placeholder="Npr. Nova web stranica"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </label>
              <button className="gw-primary" disabled={busy}>
                <Plus size={17} />
                Kreiraj
              </button>
            </form>
            {error && (
              <p role="alert" className="gw-error">
                {error}
              </p>
            )}
          </div>
        </Modal>
      )}
      {modal === "background" && (
        <Modal title="Pozadina projekta" close={() => setModal(null)}>
          <div className="gw-modal-body">
            <p>Izaberi atmosferu za svoj projekat.</p>
            {!owner && (
              <p>Samo vlasnik projekta može promijeniti zajedničku pozadinu.</p>
            )}
            <h3>Boje i gradijenti</h3>
            <div className="gw-bg-colors">
              {backgrounds
                .filter((b) => !b.image)
                .map((b) => (
                  <button
                    disabled={!owner || busy}
                    key={b.id}
                    title={b.name}
                    aria-label={`Pozadina ${b.name}`}
                    style={{ background: b.css }}
                    onClick={() =>
                      run(() => patchProject({ background: b.id }))
                    }
                  >
                    {project.background === b.id ? <Check size={20} /> : null}
                    <span>{b.name}</span>
                  </button>
                ))}
            </div>
            <h3>Fotografije</h3>
            <label className="gw-search">
              <Search size={15} />
              <input
                placeholder="Pretraži ponuđene fotografije…"
                aria-label="Pretraži pozadine"
                value={photoSearch}
                onChange={(e) => setPhotoSearch(e.target.value)}
              />
            </label>
            <div className="gw-bg-photos">
              {backgrounds
                .filter(
                  (b) =>
                    b.image &&
                    b.name.toLowerCase().includes(photoSearch.toLowerCase()),
                )
                .map((b) => (
                  <div key={b.id}>
                    <button
                      disabled={!owner || busy}
                      onClick={() =>
                        run(() => patchProject({ background: b.id }))
                      }
                    >
                      <img src={b.image} alt={b.name} />
                      {project.background === b.id && <Check size={20} />}
                    </button>
                    <a href={b.source} target="_blank" rel="noreferrer">
                      {b.author} ↗
                    </a>
                  </div>
                ))}
            </div>
            <small>
              Odabrane besplatne fotografije ·{" "}
              <a
                href="https://unsplash.com/license"
                target="_blank"
                rel="noreferrer"
              >
                Unsplash licenca
              </a>
            </small>
            <h3>Tvoja fotografija</h3>
            <label className="gw-upload">
              <Plus size={20} />
              <span>{busy ? "Obrada slike…" : "Dodaj sliku s uređaja"}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={!owner || busy}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file)
                    run(async () =>
                      patchProject({ background: await imageData(file) }),
                    );
                  e.target.value = "";
                }}
              />
            </label>
            <small>
              JPG, PNG ili WebP, do 10 MB. Slika se prilagođava za pozadinu i
              dijeli s članovima projekta.
            </small>
            {error && (
              <p role="alert" className="gw-error">
                {error}
              </p>
            )}
          </div>
        </Modal>
      )}
      {modal === "members" && (
        <Modal title="Članovi projekta" close={() => setModal(null)}>
          <div className="gw-modal-body">
            {projectPeople.map((p) => (
              <div className="gw-member-row" key={p.id}>
                <span className="gw-avatar">{initials(p.name)}</span>
                <span>
                  <strong>{p.name}</strong>
                  <small>@{p.username}</small>
                </span>
                <TeamMemberControls
                  member={p}
                  project={project}
                  user={user}
                  mode={mode}
                  setData={setData}
                  run={run}
                  busy={busy}
                />
              </div>
            ))}
            {owner && (
              <form
                className="gw-new-project"
                onSubmit={async (e) => {
                  e.preventDefault();
                  await run(async () => {
                    if (mode === "demo")
                      throw new Error(
                        "Dodavanje stvarnih korisnika dostupno je nakon prijave.",
                      );
                    const p = await request(`projects/${project.id}/`, "POST", {
                      username: memberName,
                    });
                    setData((d) => ({
                      ...d,
                      projects: d.projects.map((x) => (x.id === p.id ? p : x)),
                    }));
                    setMemberName("");
                    setNotice("Član je dodan u projekat.");
                  });
                }}
              >
                <label>
                  Dodaj postojećeg korisnika
                  <input
                    required
                    placeholder="Tačno korisničko ime"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                  />
                </label>
                <button className="gw-primary" disabled={busy}>
                  <Plus size={17} />
                  Dodaj
                </button>
              </form>
            )}
            <p className="gw-panel-note">
              Član vidi sve zadatke ovog projekta i može ih uređivati i
              dodjeljivati. Njegov privatni Inbox ostaje privatan.
            </p>
            {error && (
              <p role="alert" className="gw-error">
                {error}
              </p>
            )}
          </div>
        </Modal>
      )}
      {listColors && project?.columns.some((c) => c.id === listColors.id) && (
        <ListColorPopover
          key={`${project.id}:${listColors.id}`}
          column={project.columns.find((c) => c.id === listColors.id)}
          anchor={listColors.anchor}
          close={() => setListColors(null)}
          owner={owner}
          busy={busy}
          error={error}
          save={async (value) => {
            if (
              await run(() =>
                patchProject({
                  columns: project.columns.map((c) =>
                    c.id === value.id ? value : c,
                  ),
                }),
              )
            )
              setListColors(null);
          }}
        />
      )}
      <WorkExtras
        modal={modal}
        setModal={setModal}
        Modal={Modal}
        project={project}
        data={data}
        setData={setData}
        user={user}
        mode={mode}
        owner={owner}
        patchProject={patchProject}
        run={run}
        busy={busy}
        openTask={openTask}
        error={error}
      />
      {modal === "list-options" && listEdit && (
        <Modal title={`Lista · ${listEdit.name}`} close={() => setModal(null)}>
          <div className="gw-modal-body">
            <p>Promijeni raspored povlačenjem naslova ili ovim dugmadima.</p>
            <div className="gw-extra-actions">
              {[-1, 1].map((offset) => {
                const idx = project.columns.findIndex(
                    (c) => c.id === listEdit.id,
                  ),
                  target = project.columns[idx + offset];
                return (
                  <button
                    key={offset}
                    disabled={busy || !target}
                    onClick={() => reorderList(listEdit.id, target.id)}
                  >
                    {offset < 0 ? "← Pomjeri lijevo" : "Pomjeri desno →"}
                  </button>
                );
              })}
            </div>
            <h3>Ukloni listu</h3>
            {project.columns.length < 2 ? (
              <p>Projekat mora imati barem jednu listu.</p>
            ) : (
              <>
                <p>
                  Zadaci se čuvaju i prelaze u odabranu listu. Uklanja se samo „
                  {listEdit.name}“.
                </p>
                <label>
                  Premjesti zadatke u
                  <select
                    value={listTarget}
                    onChange={(e) => setListTarget(e.target.value)}
                  >
                    {project.columns
                      .filter((c) => c.id !== listEdit.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </label>
                <button
                  className="gw-danger"
                  disabled={busy}
                  onClick={async () => {
                    if (
                      await run(() =>
                        patchProject({
                          remove_column: listEdit.id,
                          move_to: listTarget,
                        }),
                      )
                    )
                      setModal(null);
                  }}
                >
                  Potvrdi uklanjanje liste
                </button>
              </>
            )}
            {error && <p role="alert">{error}</p>}
          </div>
        </Modal>
      )}
      {modal === "column" && (
        <Modal title="Dodaj listu" close={() => setModal(null)}>
          <form
            className="gw-modal-body"
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await run(() =>
                patchProject({
                  columns: [
                    ...project.columns,
                    { id: uid(), name: columnName.trim(), color: columnColor },
                  ],
                }),
              );
              if (ok) {
                setColumnName("");
                setModal(null);
              }
            }}
          >
            <label>
              Naziv liste
              <input
                required
                maxLength={50}
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                placeholder="Npr. Čeka klijenta"
              />
            </label>
            <label>
              Boja liste
              <input
                type="color"
                value={columnColor}
                onChange={(e) => setColumnColor(e.target.value)}
              />
            </label>
            <button
              className="gw-primary"
              disabled={busy || project.columns.length >= 12}
            >
              Dodaj listu
            </button>
            {error && <p role="alert">{error}</p>}
          </form>
        </Modal>
      )}
    </div>
  );
}
