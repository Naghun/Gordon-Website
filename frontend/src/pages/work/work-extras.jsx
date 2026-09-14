import { manualPlan } from "./import-plan";
import { applyImportDestination } from "./import-destination";
import { useState } from "react";
import {
  Bell,
  ListTodo,
  FileInput,
  Palette,
  Paperclip,
  Plus,
  X,
} from "lucide-react";
import { API } from "../../config/site";
import { request, uid, blankTask, columns, people, day } from "./work-data";

export function WorkToolbar({ setModal, data }) {
  const unread = (data.notifications || []).filter((n) => !n.read).length;
  return (
    <div className="gw-extra-tools">
      <button onClick={() => setModal("x-mine")}>
        <ListTodo size={15} />
        Svi moji zadaci
      </button>
      <button onClick={() => setModal("x-import")}>
        <FileInput size={15} />
        Masovni uvoz
      </button>
      <button onClick={() => setModal("x-colors")}>
        <Palette size={15} />
        Boje lista
      </button>
      <button onClick={() => setModal("x-reset")}>↺ Početni izgled</button>
      <button
        onClick={() => setModal("x-notifications")}
        aria-label={`Obavijesti${unread ? ` · ${unread}` : ""}`}
      >
        <Bell size={15} />
        {unread > 0 && <b>{unread}</b>}
      </button>
    </div>
  );
}

export const readable = (hex) => {
  if (!/^#[0-9a-f]{6}$/i.test(hex || "")) return "#e8ebf3";
  const rgb = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2] > 0.179
    ? "#17202d"
    : "#e8ebf3";
};

export function TeamMemberControls({
  member,
  project,
  user,
  mode,
  setData,
  run,
  busy,
}) {
  const [confirm, setConfirm] = useState(false);
  const role = project.roles?.[member.id] || "editor";
  if (member.isAdmin) return <b>Administrator</b>;
  if (project.owner === member.id) return <b>Vlasnik</b>;
  if (project.owner !== user.id && !user.isAdmin && mode !== "demo")
    return <b>{role === "viewer" ? "Pregled" : "Uređivanje"}</b>;
  const change = (next, remove = false) =>
    run(async () => {
      let result;
      if (mode === "team")
        result = await request(
          `projects/${project.id}/members/${member.id}/`,
          remove ? "DELETE" : "PATCH",
          { role: next },
        );
      else
        result = {
          ...project,
          roles: { ...project.roles, [member.id]: next },
          members: remove
            ? project.members.filter((p) => p.id !== member.id)
            : project.members,
        };
      setData((d) => ({
        ...d,
        projects: d.projects.map((p) => (p.id === result.id ? result : p)),
        tasks: remove
          ? d.tasks.map((t) =>
              t.project === project.id && t.person === member.id
                ? { ...t, person: null }
                : t,
            )
          : d.tasks,
      }));
    });
  return (
    <div className="gw-role-controls">
      <select
        aria-label={`Uloga za ${member.name}`}
        value={role}
        disabled={busy}
        onChange={(e) => change(e.target.value)}
      >
        <option value="editor">Uređivanje</option>
        <option value="viewer">Samo pregled</option>
      </select>
      <button
        disabled={busy}
        onClick={() => (confirm ? change(role, true) : setConfirm(true))}
      >
        {confirm ? "Potvrdi uklanjanje" : "Ukloni"}
      </button>
    </div>
  );
}

async function fileBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("Datoteka se ne može pročitati."));
    reader.readAsDataURL(file);
  });
}
export function Attachments({
  draft,
  setDraft,
  data,
  setData,
  mode,
  run,
  busy,
}) {
  const saved = data.tasks.some((t) => t.id === draft.id);
  const upload = async (file) =>
    run(async () => {
      if (!file) return;
      const max = mode === "demo" ? 350000 : 5 * 1024 * 1024;
      if (file.size > max)
        throw new Error(
          mode === "demo"
            ? "Demo prilog može imati do 350 KB. Timski račun podržava 5 MB."
            : "Prilog može imati do 5 MB.",
        );
      if (
        !/\.(pdf|png|jpe?g|webp|txt|csv|docx|xlsx|pptx|zip)$/i.test(file.name)
      )
        throw new Error("Odaberi dokument, sliku ili ZIP arhivu.");
      const content = await fileBase64(file);
      const a =
        mode === "team"
          ? await request(`tasks/${draft.id}/attachments/`, "POST", {
              name: file.name,
              content,
            })
          : { id: uid(), name: file.name, size: file.size, content };
      const update = (t) => ({
        ...t,
        attachments: [...(t.attachments || []), a],
      });
      setDraft(update);
      setData((d) => ({
        ...d,
        tasks: d.tasks.map((t) => (t.id === draft.id ? update(t) : t)),
      }));
    });
  return (
    <section className="gw-extra-section">
      <h3>
        <Paperclip size={16} />
        Prilozi
      </h3>
      {(draft.attachments || []).map((a) => (
        <div className="gw-attachment" key={a.id}>
          <a
            href={
              mode === "team"
                ? `${API}/work/attachments/${a.id}/`
                : `data:application/octet-stream;base64,${a.content}`
            }
            download={a.name}
          >
            {a.name}
          </a>
          <small>{Math.ceil(a.size / 1024)} KB</small>
        </div>
      ))}
      {saved ? (
        <label className="gw-upload-small">
          + Dodaj prilog
          <input
            type="file"
            disabled={busy || draft.deleted}
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.csv,.docx,.xlsx,.pptx,.zip"
            onChange={(e) => {
              const file = e.target.files[0];
              e.target.value = "";
              upload(file);
            }}
          />
        </label>
      ) : (
        <p>Sačuvaj novi zadatak pa mu dodaj priloge.</p>
      )}
      <small>
        Prilog se sprema odmah. Dostupan je članovima koji mogu vidjeti zadatak.
      </small>
    </section>
  );
}

export function WorkExtras({
  modal,
  setModal,
  Modal,
  project,
  data,
  setData,
  user,
  mode,
  owner,
  patchProject,
  run,
  busy,
  openTask,
  error,
}) {
  const [source, setSource] = useState("");
  const [brief, setBrief] = useState("");
  const [importTarget, setImportTarget] = useState(null);
  const [localKey, setLocalKey] = useState("");
  const [rules, setRules] = useState(
    "Prvi red bloka je glavni zadatak. Jedan Enter nastavlja njegove podzadatke. Dva ili više Entera (prazan red) otvaraju novi glavni zadatak. Naslov sa # ili Projekat: označava projekat. Analiziraj i značenje teksta, ali poštuj ova pravila grupisanja. Ne izmišljaj rokove.",
  );
  const [plan, setPlan] = useState(null),
    [token, setToken] = useState(uid),
    [message, setMessage] = useState("");
  const [colors, setColors] = useState(null),
    [mineFilter, setMineFilter] = useState("active"),
    [query, setQuery] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  if (!modal?.startsWith("x-")) return null;
  const close = () => {
    if (!busy && !analyzing) setModal(null);
  };
  const mutate = (fn) => {
    setPlan((p) => {
      const next = structuredClone(p);
      fn(next);
      return next;
    });
    setToken(uid());
  };
  if (modal === "x-reset")
    return (
      <Modal title="Vrati početni izgled" close={close}>
        <div className="gw-modal-body">
          <p>
            Vrati početnu tamnu pozadinu i originalne boje svih lista i kartica
            u ovom projektu. Zadaci, nazivi lista i njihov raspored ostaju
            sačuvani.
          </p>
          <button
            className="gw-primary"
            disabled={busy || !owner || !project}
            onClick={async () => {
              if (await run(() => patchProject({ reset_display: true }))) {
                setColors(null);
                setModal(null);
              }
            }}
          >
            Vrati početni izgled
          </button>
          {error && <p role="alert">{error}</p>}
        </div>
      </Modal>
    );
  if (modal === "x-colors" || modal.startsWith("x-colors:"))
    return (
      <Modal title="Boje lista i kartica" close={close} wide>
        <div className="gw-modal-body">
          {error && (
            <p role="alert" className="gw-modal-error">
              {error}
            </p>
          )}
          <p>
            Oboji cijelu listu, okvir i kartice. Svaka lista može imati svoje
            boje.
          </p>
          {!project ? (
            <p>Prvo odaberi projekat.</p>
          ) : (
            <>
              <div className="gw-color-editors">
                {(colors?.id === project.id
                  ? colors.columns
                  : project.columns
                ).map((c, i) => (
                  <section
                    key={c.id}
                    style={{
                      display:
                        modal !== "x-colors" && modal !== `x-colors:${c.id}`
                          ? "none"
                          : undefined,
                      background: c.fill || "#151c29",
                      color: readable(c.fill),
                      border: `2px solid ${c.border || c.color}`,
                    }}
                  >
                    <h3>{c.name}</h3>
                    {[
                      ["color", "Boja statusa", c.color],
                      ["fill", "Cijela lista", "#151c29"],
                      ["border", "Okvir liste", c.color],
                      ["card", "Kartice", "#242d3d"],
                    ].map(([key, label, fallback]) => (
                      <label key={key}>
                        {label}
                        <input
                          type="color"
                          aria-label={`${label}: ${c.name}`}
                          value={c[key] || fallback}
                          disabled={!owner}
                          onInput={(e) => {
                            const cols = structuredClone(
                              colors?.id === project.id
                                ? colors.columns
                                : project.columns,
                            );
                            cols[i][key] = e.target.value;
                            setColors({ id: project.id, columns: cols });
                          }}
                        />
                      </label>
                    ))}
                    <div
                      className="gw-color-example"
                      style={{
                        background: c.card || "#242d3d",
                        color: readable(c.card),
                        borderLeft: `3px solid ${c.color}`,
                      }}
                    >
                      Ovako izgleda kartica
                    </div>
                  </section>
                ))}
              </div>
              {owner ? (
                <div className="gw-extra-actions">
                  <button
                    onClick={() =>
                      setColors({
                        id: project.id,
                        columns: project.columns.map((c) =>
                          modal !== "x-colors" && modal !== `x-colors:${c.id}`
                            ? c
                            : {
                                id: c.id,
                                name: c.name,
                                color: c.color,
                              },
                        ),
                      })
                    }
                  >
                    Vrati početne boje
                  </button>
                  <button
                    className="gw-primary"
                    disabled={busy}
                    onClick={async () => {
                      if (
                        await run(() =>
                          patchProject({
                            columns:
                              colors?.id === project.id
                                ? colors.columns
                                : project.columns,
                          }),
                        )
                      )
                        close();
                    }}
                  >
                    Sačuvaj boje
                  </button>
                </div>
              ) : (
                <p>Boje uređuje vlasnik projekta.</p>
              )}
            </>
          )}
        </div>
      </Modal>
    );
  if (modal === "x-notifications") {
    const notes = data.notifications || [];
    return (
      <Modal title="Obavijesti" close={close}>
        <div className="gw-modal-body">
          <p>Dodjele, spominjanja i promjene na tvojim zadacima.</p>
          {error && (
            <p role="alert" className="gw-modal-error">
              {error}
            </p>
          )}
          <button
            disabled={busy || !notes.some((n) => !n.read)}
            onClick={() =>
              run(async () => {
                if (mode === "team")
                  await request("notifications/read/", "POST", {
                    ids: notes.filter((n) => !n.read).map((n) => n.id),
                  });
                setData((d) => ({
                  ...d,
                  notifications: (d.notifications || []).map((n) => ({
                    ...n,
                    read: true,
                  })),
                }));
              })
            }
          >
            Označi sve pročitanim
          </button>
          {notes.map((n) => (
            <button
              className={`gw-notification ${n.read ? "" : "unread"}`}
              key={n.id}
              onClick={() =>
                run(async () => {
                  const t = data.tasks.find((t) => t.id === n.task);
                  if (mode === "team")
                    await request("notifications/read/", "POST", {
                      ids: [n.id],
                    });
                  setData((d) => ({
                    ...d,
                    notifications: d.notifications.map((x) =>
                      x.id === n.id ? { ...x, read: true } : x,
                    ),
                  }));
                  if (t) openTask(t);
                })
              }
            >
              <strong>{n.text}</strong>
              <small>{new Date(n.time).toLocaleString("hr-HR")}</small>
            </button>
          ))}
          {!notes.length && (
            <p>
              Za sada nema obavijesti.
              {mode === "demo"
                ? " U demo prikazu nema drugih prijavljenih članova."
                : ""}
            </p>
          )}
        </div>
      </Modal>
    );
  }
  if (modal === "x-mine") {
    const tasks = data.tasks
      .filter(
        (t) =>
          (t.person === user.id || (!t.project && t.creator === user.id)) &&
          !t.deleted &&
          !t.archived &&
          t.title.toLowerCase().includes(query.toLowerCase()) &&
          (mineFilter === "done"
            ? t.status === "done"
            : mineFilter === "late"
              ? t.status !== "done" && t.due && t.due < day()
              : mineFilter === "all" || t.status !== "done"),
      )
      .sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"));
    return (
      <Modal title="Svi moji zadaci" close={close} wide>
        <div className="gw-modal-body">
          <p>Svi projekti i tvoj privatni Inbox, na jednom mjestu.</p>
          <div className="gw-extra-actions">
            <input
              aria-label="Pretraga mojih zadataka"
              placeholder="Pronađi zadatak…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              aria-label="Filter mojih zadataka"
              value={mineFilter}
              onChange={(e) => setMineFilter(e.target.value)}
            >
              <option value="active">Aktivni</option>
              <option value="late">Kasne</option>
              <option value="done">Završeni</option>
              <option value="all">Svi</option>
            </select>
          </div>
          {tasks.map((t) => (
            <button
              className="gw-notification"
              key={t.id}
              onClick={() => openTask(t)}
            >
              <strong>{t.title}</strong>
              <small>
                {data.projects.find((p) => p.id === t.project)?.name ||
                  "Privatni Inbox"}{" "}
                · {t.due || "Bez roka"}
                {t.parent ? " · Podzadatak" : ""}
              </small>
            </button>
          ))}
          {!tasks.length && <p>Nema zadataka za ovaj izbor.</p>}
        </div>
      </Modal>
    );
  }
  if (modal !== "x-import") return null;
  const destinations = data.projects.filter(
    (p) => user.isAdmin || p.owner === user.id || p.roles?.[user.id] !== "viewer",
  );
  const target =
    importTarget ??
    (destinations.some((p) => p.id === project?.id) ? project.id : "");
  const chooseDestination = (value) => {
    setImportTarget(value);
    if (plan) setPlan(applyImportDestination(plan, value, destinations));
    setToken(uid());
  };
  const count =
    plan?.projects.reduce(
      (n, p) => n + p.tasks.reduce((m, t) => m + 1 + t.subtasks.length, 0),
      0,
    ) || 0;
  const previewAI = async () => {
    setAnalyzing(true);
    setMessage("");
    try {
      await request("session/");
      const result = await request(
        mode === "demo" ? "import/local-preview/" : "import/preview/",
        "POST",
        {
          source: !brief.trim()
            ? source
            : [
                brief.trim() && `OPIS POSLA:\n${brief.trim()}`,
                source.trim() && `BILJEŠKE I LISTA:\n${source.trim()}`,
              ]
                .filter(Boolean)
                .join("\n\n"),
          rules: `${rules}${brief.trim() ? "\nOpis posla je zahtjev za planiranje: predloži konkretne glavne zadatke i podzadatke koji su potrebni da se posao obavi. Listu i bilješke koristi kao dodatne zahtjeve. Ne izmišljaj osobe ili rokove. Ne pravi zadatak od samog naslova OPIS POSLA ili BILJEŠKE I LISTA." : ""}`,
          ...(mode === "demo" ? { api_key: localKey } : {}),
        },
      );
      setLocalKey("");
      setPlan(applyImportDestination(result, target, destinations));
      setToken(uid());
      setMessage("AI prijedlog je spreman. Provjeri i prilagodi prije uvoza.");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setAnalyzing(false);
    }
  };
  return (
    <Modal title="Masovni uvoz · napravi plan posla" close={close} wide>
      <div className="gw-modal-body gw-import">
        {error && (
          <p role="alert" className="gw-modal-error">
            {error}
          </p>
        )}
        <p>
          Zalijepi listu ili opiši posao. Prvo se pravi prijedlog; zadaci se
          spremaju tek kada potvrdiš uvoz.
        </p>
        <div className="gw-import-setup">
          <label>
            <span className="gw-import-step">1 · Odredište</span>U koji projekat
            dodajemo zadatke?
            <select
              aria-label="Projekat za uvoz"
              disabled={analyzing || busy}
              value={target}
              onChange={(e) => chooseDestination(e.target.value)}
            >
              <option value="">Novi projekat</option>
              {destinations.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="gw-import-step">2 · Opiši posao</span>Šta treba
            odraditi?
            <textarea
              rows={3}
              maxLength={3000}
              disabled={analyzing || busy}
              value={brief}
              onChange={(e) => {
                setBrief(e.target.value);
                setPlan(null);
                setMessage("");
              }}
              placeholder="Npr. Pripremi plan lansiranja web stranice: sadržaj, dizajn, razvoj i završne provjere. Razradi svaki dio u podzadatke."
            />
          </label>
        </div>
        <label>
          Lista i bilješke (opcionalno uz opis posla)
          <textarea
            rows={7}
            maxLength={16000}
            disabled={analyzing || busy}
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setPlan(null);
              setMessage("");
            }}
            placeholder={
              "# Novi web\nPriprema sadržaja\n  Napisati naslovnu\n  Prikupiti fotografije\n\nRazvoj kontakt forme"
            }
          />
        </label>
        <details className="gw-import-rules">
          <summary>Pravila raspoređivanja · prilagodi po potrebi</summary>
          <label>
            Pravilnik za AI
            <textarea
              rows={3}
              maxLength={3400}
              disabled={analyzing || busy}
              value={rules}
              onChange={(e) => {
                setRules(e.target.value);
                setPlan(null);
              }}
            />
          </label>
        </details>
        {mode === "demo" && (
          <details className="gw-local-ai">
            <summary>Drugi API ključ (opcionalno)</summary>
            <p>
              AI automatski koristi ključ sa servera. Ovo polje koristi samo ako
              želiš drugi ključ za ovu analizu. Ključ se ne čuva u pregledniku
              ni u projektu.
            </p>
            <input
              type="password"
              autoComplete="off"
              aria-label="OpenAI ključ za lokalnu analizu"
              placeholder="Novi OpenAI API ključ"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
            />
          </details>
        )}
        <small>
          Klikom na AI analizu šalješ samo ovaj tekst i pravilnik OpenAI
          servisu. Postojeći zadaci i prilozi se ne šalju.
        </small>
        <div className="gw-extra-actions">
          <button
            className="gw-primary"
            disabled={analyzing || busy || (!source.trim() && !brief.trim())}
            onClick={previewAI}
          >
            {analyzing ? "AI priprema zadatke…" : "Napravi plan uz ChatGPT"}
          </button>
          <button
            disabled={analyzing || busy || !source.trim()}
            onClick={() => {
              setPlan(
                applyImportDestination(
                  manualPlan(source),
                  target,
                  destinations,
                ),
              );
              setToken(uid());
              setMessage(
                "Raspored po redovima: prvi red je glavni zadatak; naredni redovi su podzadaci. Prazan red započinje novi glavni zadatak. Ovo nije AI analiza.",
              );
            }}
          >
            Rasporedi listu bez AI
          </button>
        </div>
        {message && (
          <p role="status" className="gw-import-message">
            {message}
          </p>
        )}
        {plan && (
          <>
            <h3>Pregled uvoza · {count} zadataka</h3>
            {plan.projects.map((p, i) => (
              <section className="gw-import-project" key={i}>
                <div className="gw-extra-actions">
                  <input
                    aria-label={`Naziv projekta ${i + 1}`}
                    value={p.name}
                    maxLength={100}
                    onChange={(e) =>
                      mutate((v) => (v.projects[i].name = e.target.value))
                    }
                  />
                  <select
                    aria-label={`Odredište projekta ${i + 1}`}
                    value={p.target || ""}
                    onChange={(e) =>
                      mutate((v) => (v.projects[i].target = e.target.value))
                    }
                  >
                    <option value="">Kreiraj novi projekat</option>
                    {data.projects
                      .filter((p) => user.isAdmin || p.roles?.[user.id] !== "viewer")
                      .map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.name}
                        </option>
                      ))}
                  </select>
                  <button
                    aria-label={`Ukloni projekat ${i + 1}`}
                    onClick={() => mutate((v) => v.projects.splice(i, 1))}
                  >
                    <X size={15} />
                  </button>
                </div>
                {p.tasks.map((t, j) => (
                  <div className="gw-import-task" key={j}>
                    <div className="gw-extra-actions">
                      <input
                        aria-label={`Zadatak ${i + 1}.${j + 1}`}
                        value={t.title}
                        maxLength={180}
                        onChange={(e) =>
                          mutate(
                            (v) =>
                              (v.projects[i].tasks[j].title = e.target.value),
                          )
                        }
                      />
                      <input
                        type="date"
                        aria-label={`Rok ${i + 1}.${j + 1}`}
                        value={t.due}
                        onChange={(e) =>
                          mutate(
                            (v) =>
                              (v.projects[i].tasks[j].due = e.target.value),
                          )
                        }
                      />
                      <button
                        aria-label={`Ukloni zadatak ${i + 1}.${j + 1}`}
                        onClick={() =>
                          mutate((v) => v.projects[i].tasks.splice(j, 1))
                        }
                      >
                        <X size={15} />
                      </button>
                    </div>
                    <textarea
                      aria-label={`Opis ${i + 1}.${j + 1}`}
                      value={t.description}
                      rows={2}
                      placeholder="Opis zadatka"
                      onChange={(e) =>
                        mutate(
                          (v) =>
                            (v.projects[i].tasks[j].description =
                              e.target.value),
                        )
                      }
                    />
                    {t.subtasks.map((s, k) => (
                      <div className="gw-extra-actions gw-import-child" key={k}>
                        <span>↳</span>
                        <input
                          aria-label={`Podzadatak ${i + 1}.${j + 1}.${k + 1}`}
                          value={s.title}
                          maxLength={180}
                          onChange={(e) =>
                            mutate(
                              (v) =>
                                (v.projects[i].tasks[j].subtasks[k].title =
                                  e.target.value),
                            )
                          }
                        />
                        <input
                          type="date"
                          aria-label={`Rok podzadatka ${i + 1}.${j + 1}.${k + 1}`}
                          value={s.due}
                          onChange={(e) =>
                            mutate(
                              (v) =>
                                (v.projects[i].tasks[j].subtasks[k].due =
                                  e.target.value),
                            )
                          }
                        />
                        <button
                          aria-label="Ukloni podzadatak"
                          onClick={() =>
                            mutate((v) =>
                              v.projects[i].tasks[j].subtasks.splice(k, 1),
                            )
                          }
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        mutate((v) =>
                          v.projects[i].tasks[j].subtasks.push({
                            title: "Novi podzadatak",
                            description: "",
                            due: "",
                          }),
                        )
                      }
                    >
                      <Plus size={14} />
                      Podzadatak
                    </button>
                  </div>
                ))}
                <button
                  onClick={() =>
                    mutate((v) =>
                      v.projects[i].tasks.push({
                        title: "Novi zadatak",
                        description: "",
                        due: "",
                        subtasks: [],
                      }),
                    )
                  }
                >
                  <Plus size={14} />
                  Glavni zadatak
                </button>
              </section>
            ))}
            <button
              className="gw-primary"
              disabled={
                busy ||
                analyzing ||
                !count ||
                count > 200 ||
                plan.projects.some(
                  (p) =>
                    !p.name.trim() ||
                    !p.tasks.length ||
                    p.tasks.some(
                      (t) =>
                        !t.title.trim() ||
                        t.subtasks.some((s) => !s.title.trim()),
                    ),
                )
              }
              onClick={async () => {
                const ok = await run(async () => {
                  if (mode === "team") {
                    await request("import/commit/", "POST", { plan, token });
                    setData(await request("state/"));
                  } else {
                    if ((data.imports || []).includes(token)) return;
                    const addedProjects = [],
                      tasks = [];
                    for (const p of plan.projects) {
                      const existing = data.projects.find(
                        (x) => x.id === p.target,
                      );
                      const target = existing || {
                        id: uid(),
                        name: p.name,
                        owner: user.id,
                        members: people,
                        roles: {},
                        columns: columns(),
                        background: "aurora",
                      };
                      if (!existing) addedProjects.push(target);
                      for (const t of p.tasks) {
                        const parent = {
                          ...blankTask(target.id, target.columns[0].id),
                          creator: user.id,
                          title: t.title,
                          description: t.description,
                          due: t.due,
                        };
                        tasks.push(parent);
                        for (const child of t.subtasks)
                          tasks.push({
                            ...blankTask(target.id, target.columns[0].id),
                            creator: user.id,
                            ...child,
                            parent: parent.id,
                          });
                      }
                    }
                    setData((d) => ({
                      ...d,
                      projects: [...d.projects, ...addedProjects],
                      tasks: [...d.tasks, ...tasks],
                      imports: [...(d.imports || []), token],
                    }));
                  }
                });
                if (ok) {
                  setMessage(
                    `Uvezeno ${count} zadataka. Projekte pronađi u donjoj kartici Projekti.`,
                  );
                  setPlan(null);
                  setSource("");
                  setToken(uid());
                }
              }}
            >
              Potvrdi uvoz ({count})
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
