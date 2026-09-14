import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { readable } from "./work-extras";

export default function ListColorPopover({
  column,
  anchor,
  close,
  save,
  busy,
  error,
  owner,
}) {
  const [value, setValue] = useState({ ...column });
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
    const escape = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
      }
    };

    document.addEventListener("keydown", escape);
    return () => {

      document.removeEventListener("keydown", escape);
    };
  }, [anchor, close]);
  const rect = anchor.getBoundingClientRect();
  const dot = (key, label, fallback) => (
    <label
      className={`gw-sim-dot gw-sim-dot-${key}`}
      title={label}
      style={{ background: value[key] || fallback }}
    >
      <input
        type="color"
        aria-label={label}
        disabled={!owner}
        value={value[key] || fallback}
        onChange={(e) => setValue((v) => ({ ...v, [key]: e.target.value }))}
      />
    </label>
  );
  return createPortal(
    <div
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-label={`Izgled liste ${column.name}`}
      className="gw-color-popover"
      style={{
        left: Math.max(12, Math.min(rect.left, innerWidth - 304)),
        top: Math.max(12, Math.min(rect.bottom + 10, innerHeight - 360)),
      }}
    >
      <div className="gw-pop-head">
        <strong>Izgled liste</strong>
        <button disabled={busy} onClick={() => owner ? save(value) : close()} aria-label="Sačuvaj i zatvori boje">
          <X size={16} />
        </button>
      </div>
      <p>Klikni kružić na dijelu koji želiš obojiti.</p>
      <div
        className="gw-list-simulator"
        style={{
          background: value.fill || "#151c29",
          color: readable(value.fill),
          borderColor: value.border || value.color,
        }}
      >
        {dot("border", "Okvir liste", value.color)}
        <div className="gw-sim-heading">
          {dot("color", "Boja statusa", value.color)}
          <strong>{value.name}</strong>
          <small>2</small>
        </div>
        <div
          className="gw-sim-card"
          style={{
            background: value.card || "#242d3d",
            color: readable(value.card),
            borderLeftColor: value.color,
          }}
        >
          <span className="gw-sim-tag" style={{ color: value.color }}>
            Ideja
          </span>
          {dot("card", "Boja kartica", "#242d3d")}
          <strong>Pripremiti novu ideju</strong>
          <small>
            ✓ 1/3 <span>12. sep</span>
          </small>
        </div>
        <div className="gw-sim-foot">
          <span>＋ Dodaj karticu</span>
          {dot("fill", "Pozadina liste", "#151c29")}
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="gw-pop-actions">
        <button
          disabled={!owner || busy}
          onClick={() =>
            setValue({ id: column.id, name: column.name, color: column.color })
          }
        >
          Početne boje
        </button>
        <button
          className="gw-sim-save"
          disabled={!owner || busy}
          onClick={() => save(value)}
        >
          {busy ? "Čuvam…" : "Sačuvaj"}
        </button>
      </div>
    </div>,
    document.body,
  );
}
