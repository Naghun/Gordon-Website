import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { day } from "./work-data";

const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export default function WorkCalendar({
  tasks,
  projects,
  scopeLabel,
  openTask,
  addTask,
  reschedule,
  editable,
  busy,
  close,
}) {
  const [date, setDate] = useState(day());
  const [view, setView] = useState("month");
  const anchor = new Date(`${date}T12:00:00`);
  const start = new Date(anchor);
  if (view === "month") start.setDate(1);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const days = Array.from({ length: view === "month" ? 42 : 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
  function navigate(offset) {
    const d = new Date(anchor);
    if (view === "month") {
      d.setDate(1);
      d.setMonth(d.getMonth() + offset);
    } else d.setDate(d.getDate() + offset * 7);
    setDate(iso(d));
  }
  const item = (t) => (
    <button
      key={t.id}
      className={`gw-calendar-task ${t.status === "done" ? "is-done" : ""}`}
      draggable={editable(t.project)}
      onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)}
      onClick={() => openTask(t)}
      title={t.title}
      style={{
        borderLeftColor:
          projects
            .find((p) => p.id === t.project)
            ?.columns.find((c) => c.id === t.status)?.color || "#91e5c6",
      }}
    >
      <span>
        {t.status === "done" ? "✓ " : ""}
        {t.title}
      </span>
      <small>
        {projects.find((p) => p.id === t.project)?.name || "Privatni zadatak"}
      </small>
    </button>
  );
  return (
    <section className="gw-calendar-full">
      <div className="gw-calendar-toolbar">
        <div>
          <strong>{`${["Januar", "Februar", "Mart", "April", "Maj", "Juni", "Juli", "August", "Septembar", "Oktobar", "Novembar", "Decembar"][anchor.getMonth()]} ${anchor.getFullYear()}`}</strong>
          <small>{scopeLabel}</small>
        </div>
        <button aria-label="Prethodni period" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} />
        </button>
        <button onClick={() => setDate(day())}>Danas</button>
        <button aria-label="Sljedeći period" onClick={() => navigate(1)}>
          <ChevronRight size={18} />
        </button>
        <input
          type="date"
          aria-label="Datum kalendara"
          value={date}
          onChange={(e) => setDate(e.target.value || day())}
        />
        <button
          aria-pressed={view === "month"}
          onClick={() => setView("month")}
        >
          Mjesec
        </button>
        <button aria-pressed={view === "week"} onClick={() => setView("week")}>
          Sedmica
        </button>
        <button onClick={close}>Prikaži tablu</button>
      </div>
      <div className="gw-calendar-layout">
        <div className="gw-calendar-scroll">
          <div className="gw-calendar-weekdays">
            {["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"].map((d) => (
              <b key={d}>{d}</b>
            ))}
          </div>
          <div
            className={`gw-calendar-grid ${view === "week" ? "gw-calendar-week" : ""}`}
          >
            {days.map((d) => {
              const key = iso(d);
              return (
                <div
                  key={key}
                  className={`gw-calendar-day ${d.getMonth() !== anchor.getMonth() ? "outside-month" : ""} ${key === day() ? "today" : ""}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const task = tasks.find(
                      (t) => t.id === e.dataTransfer.getData("text/plain"),
                    );
                    if (task && editable(task.project) && !busy)
                      reschedule(task, key);
                  }}
                >
                  <div className="gw-calendar-day-head">
                    <time dateTime={key}>{d.getDate()}</time>
                    <button
                      aria-label={`Dodaj zadatak za ${key}`}
                      disabled={busy}
                      onClick={() => addTask(key)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  {tasks.filter((t) => t.due === key).map(item)}
                </div>
              );
            })}
          </div>
        </div>
        <aside className="gw-calendar-unscheduled">
          <h3>
            Bez roka <small>{tasks.filter((t) => !t.due).length}</small>
          </h3>
          <p>Prevuci zadatak na datum.</p>
          {tasks.filter((t) => !t.due).map(item)}
        </aside>
      </div>
    </section>
  );
}
