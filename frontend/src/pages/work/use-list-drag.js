import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { listLanes, placeList, stackPositions } from "./list-layout";

// Keep DOM slots stable during pointer capture; translate columns into preview slots.
export default function useListDrag(columns, commit) {
  const active = useRef(null);
  const [preview, setPreview] = useState(null);
  const [board, setBoard] = useState(null);
  const [heights, setHeights] = useState({});
  useLayoutEffect(() => {
    if (!board) return;
    const nodes = [...board.querySelectorAll('[data-list-id]')];
    const measure = () => {
      const next = Object.fromEntries(nodes.map(n => [n.dataset.listId, n.offsetHeight]));
      setHeights(old => JSON.stringify(old) === JSON.stringify(next) ? old : next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    nodes.forEach(n => observer.observe(n));
    return () => observer.disconnect();
  }, [board, columns]);
  useLayoutEffect(() => {
    if (!board) return;
    const resize = () => board.style.setProperty('--board-height', `${Math.max(120, board.clientHeight - 12)}px`);
    const observer = new ResizeObserver(resize);
    observer.observe(board);
    resize();
    let pan = null;
    const stop = () => {
      pan = null;
      board.classList.remove('gw-panning');
    };
    const down = e => {
      if (e.button !== 0 || e.pointerType === 'touch') return;
      // Pan from list backgrounds and gaps too, without taking over task/list dragging.
      if (e.target.closest('button, a, input, textarea, select, label, [role=button], [contenteditable=true], [draggable=true], .gw-card, .gw-list-grip')) return;
      const r = board.getBoundingClientRect();
      if (e.clientX >= r.left + board.clientWidth || e.clientY >= r.top + board.clientHeight) return;
      pan = { id:e.pointerId, x:e.clientX, left:board.scrollLeft };
      board.setPointerCapture(e.pointerId);
      board.classList.add('gw-panning');
      e.preventDefault();
    };
    const move = e => {
      if (!pan || e.pointerId !== pan.id) return;
      board.scrollLeft = pan.left - (e.clientX - pan.x);
    };
    const up = e => {
      if (!pan || e.pointerId !== pan.id) return;
      if (board.hasPointerCapture(e.pointerId)) board.releasePointerCapture(e.pointerId);
      stop();
    };
    board.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    window.addEventListener('blur', stop);
    board.addEventListener('lostpointercapture', stop);
    return () => {
      stop(); observer.disconnect();
      board.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      window.removeEventListener('blur', stop);
      board.removeEventListener('lostpointercapture', stop);
    };
  }, [board]);
  const lanes = preview?.lanes || listLanes(columns);
  const layout = stackPositions(lanes, heights);
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
    if (s.y < r.top + 35) s.board.scrollTop -= 10;
    if (s.y > r.bottom - 35) s.board.scrollTop += 10;
    const valid =
      s.x >= r.left - 25 &&
      s.x <= r.right + 25 &&
      s.y >= r.top - 45 &&
      s.y <= r.bottom + 45;
    const x = s.x - r.left + s.board.scrollLeft;
    const y = s.y - r.top + s.board.scrollTop;
    const distance = box => Math.hypot(Math.max(box.left - x, 0, x - box.right), Math.max(box.top - y, 0, y - box.bottom));
    const target = [...s.slots].sort((a, b) => distance(a) - distance(b))[0];
    const placement = x < target.left + 32 ? "before" : x > target.right - 32 ? "after" : y >= (target.top + target.bottom) / 2 ? "below" : "above";
    s.lanes = placeList(s.lanesStart, s.id, target.id, placement);
    s.order = s.lanes.flat();
    s.valid = valid;
    s.ghost.style.left = `${s.x - s.dx}px`;
    s.ghost.style.top = `${s.y - s.dy}px`;
    setPreview((previous) =>
      previous?.valid === valid &&
      JSON.stringify(previous?.lanes) === JSON.stringify(s.lanes)
        ? previous
        : { id: s.id, order: s.order, lanes: s.lanes, valid },
    );
    s.frame = requestAnimationFrame(() => update(s));
  }
  const handlers = (id, enabled) => ({
    onPointerDown(e) {
      if (!enabled || e.button !== 0) return;
      const column = e.currentTarget.closest("[data-list-id]"),
        board = column.closest('.gw-board'),
        r = column.getBoundingClientRect();
      const nodes = [...board.querySelectorAll("[data-list-id]")];
      const boardRect = board.getBoundingClientRect();
      active.current = {
        id,
        column,
        board,
        ids: nodes.map((n) => n.dataset.listId),
        lanesStart: listLanes(columns),
        slots: nodes.map(n => {
          const box = n.getBoundingClientRect();
          return { id: n.dataset.listId, left: box.left - boardRect.left + board.scrollLeft, right: box.right - boardRect.left + board.scrollLeft, top: box.top - boardRect.top + board.scrollTop, bottom: box.bottom - boardRect.top + board.scrollTop };
        }),
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
      if (order && JSON.stringify(s.lanes) !== JSON.stringify(s.lanesStart)) {
        cancelAnimationFrame(s.frame);
        s.ghost.remove();
        active.current = null;
        try {
          await commit(s.lanes);
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
    board,
    boardRef: setBoard,
    stageStyle: { width: layout.width, height: layout.height + 40 },
    addStyle: { transform: `translate(${layout.addX}px, 0)` },
    style(id) {
      const p = layout.positions[id] || { x: 0, y: 0 };
      return { transform: `translate(${p.x}px, ${p.y}px)` };
    },
  };
}
