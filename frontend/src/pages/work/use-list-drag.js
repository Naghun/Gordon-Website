import { useEffect, useRef, useState } from "react";

// Keep DOM slots stable during pointer capture; translate columns into preview slots.
export default function useListDrag(commit) {
  const active = useRef(null);
  const [preview, setPreview] = useState(null);
  function cancel() {
    const s = active.current;
    if (s) {
      cancelAnimationFrame(s.frame);
      s.ghost?.remove();
    }
    active.current = null;
    setPreview(null);
  }
  useEffect(() => {
    const escape = (e) => {
      if (e.key === "Escape") cancel();
    };
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("keydown", escape);
      const s = active.current;
      if (s) {
        cancelAnimationFrame(s.frame);
        s.ghost?.remove();
      }
    };
  }, []);
  function update(s) {
    const r = s.board.getBoundingClientRect();
    if (s.x < r.left + 45) s.board.scrollLeft -= 12;
    if (s.x > r.right - 45) s.board.scrollLeft += 12;
    const valid =
      s.x >= r.left - 25 &&
      s.x <= r.right + 25 &&
      s.y >= r.top - 45 &&
      s.y <= r.bottom + 45;
    const index = Math.max(
      0,
      Math.min(
        s.ids.length - 1,
        Math.floor((s.x - r.left + s.board.scrollLeft) / s.step),
      ),
    );
    s.order = s.ids.filter((id) => id !== s.id);
    s.order.splice(index, 0, s.id);
    s.valid = valid;
    s.ghost.style.left = `${s.x - s.dx}px`;
    s.ghost.style.top = `${s.y - s.dy}px`;
    setPreview((previous) =>
      previous?.valid === valid &&
      previous?.order.join("|") === s.order.join("|")
        ? previous
        : { id: s.id, order: s.order, step: s.step, valid },
    );
    s.frame = requestAnimationFrame(() => update(s));
  }
  const handlers = (id, enabled) => ({
    onPointerDown(e) {
      if (!enabled || e.button !== 0) return;
      const column = e.currentTarget.closest("[data-list-id]"),
        board = column.parentElement,
        r = column.getBoundingClientRect();
      const nodes = [...board.querySelectorAll(":scope > [data-list-id]")];
      active.current = {
        id,
        column,
        board,
        ids: nodes.map((n) => n.dataset.listId),
        step: r.width + parseFloat(getComputedStyle(board).columnGap || 0),
        dx: e.clientX - r.left,
        dy: e.clientY - r.top,
        x: e.clientX,
        y: e.clientY,
        startX: e.clientX,
        startY: e.clientY,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove(e) {
      const s = active.current;
      if (!s) return;
      s.x = e.clientX;
      s.y = e.clientY;
      if (!s.ghost && Math.hypot(s.x - s.startX, s.y - s.startY) > 6) {
        const r = s.column.getBoundingClientRect();
        s.ghost = s.column.cloneNode(true);
        s.ghost.removeAttribute("data-list-id");
        s.ghost.setAttribute("aria-hidden", "true");
        s.ghost.inert = true;
        s.ghost.classList.add("gw-list-ghost");
        s.ghost.style.width = `${r.width}px`;
        s.ghost.style.height = `${r.height}px`;
        (document.querySelector(".gw-app") || document.body).appendChild(s.ghost);
        update(s);
      }
    },
    async onPointerUp() {
      const s = active.current;
      const order = s?.ghost && s.valid ? s.order : null;
      if (order && order.some((id, i) => id !== s.ids[i])) {
        cancelAnimationFrame(s.frame);
        s.ghost.remove();
        active.current = null;
        try {
          await commit(order);
        } finally {
          setPreview(null);
        }
      } else cancel();
    },
    onPointerCancel: cancel,
    onLostPointerCapture() {
      if (active.current) cancel();
    },
  });
  return {
    handlers,
    preview,
    style(id, index) {
      return preview
        ? {
            transform: `translateX(${(preview.order.indexOf(id) - index) * preview.step}px)`,
          }
        : {};
    },
  };
}
