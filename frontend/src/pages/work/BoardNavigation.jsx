import { useLayoutEffect, useState } from "react";

export default function BoardNavigation({ board, columns, preview }) {
  const [info, setInfo] = useState({ left: 0, right: 0, above: 0, below: 0, x: 0, max: 0 });
  useLayoutEffect(() => {
    if (!board) return;
    let frame;
    const measure = () => {
      const r = board.getBoundingClientRect();
      const boxes = [...board.querySelectorAll('[data-list-id]')].map(n => n.getBoundingClientRect());
      setInfo({
        left: boxes.filter(b => b.left < r.left - 2).length,
        right: boxes.filter(b => b.right > r.left + board.clientWidth + 2).length,
        above: boxes.filter(b => b.top < r.top - 2 && b.right > r.left && b.left < r.right).length,
        below: boxes.filter(b => b.bottom > r.top + board.clientHeight + 2 && b.right > r.left && b.left < r.right).length,
        x: board.scrollLeft, max: Math.max(0, board.scrollWidth - board.clientWidth),
      });
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    observer.observe(board);
    if (board.firstElementChild) observer.observe(board.firstElementChild);
    board.addEventListener('scroll', schedule, { passive: true });
    board.addEventListener('transitionend', schedule);
    schedule();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); board.removeEventListener('scroll', schedule); board.removeEventListener('transitionend', schedule); };
  }, [board, columns, preview]);
  const move = (x, y = 0) => board?.scrollBy({ left: x, top: y, behavior: 'smooth' });
  return <nav className="gw-board-navigation" aria-label="Pomjeranje table">
    <button disabled={info.x <= 2} onClick={() => move(-294)} title="Pomjeri tablu lijevo">← <span>{info.left ? `${info.left} lijevo` : 'Početak'}</span></button>
    <div className="gw-board-scroll-track">
      <label htmlFor="gw-board-scroll">Pregled table <span>{columns.length} lista</span></label>
      <input id="gw-board-scroll" type="range" min="0" max={info.max || 1} value={info.x} disabled={!info.max} aria-label="Vodoravno pomjeranje table" style={{'--board-progress': `${info.max ? info.x / info.max * 100 : 100}%`}} onChange={e => board?.scrollTo({left: Number(e.target.value), behavior:'instant'})} />
    </div>
    <button className={info.right ? 'gw-more-lists' : ''} disabled={info.x >= info.max - 2} onClick={() => move(294)} title="Pomjeri tablu desno"><span>{info.right ? `Još ${info.right} desno` : info.x < info.max - 2 ? 'Dalje' : 'Kraj'}</span> →</button>
    {(info.above > 0 || info.below > 0) && <div className="gw-board-vertical-nav">
      <button disabled={!info.above} onClick={() => move(0, -board.clientHeight * .7)} aria-label="Prikaži liste iznad">↑</button>
      <button disabled={!info.below} className={info.below ? 'gw-more-lists' : ''} onClick={() => move(0, board.clientHeight * .7)}><span>{info.below ? `Još ${info.below} ispod` : 'Dno'}</span> ↓</button>
    </div>}
  </nav>;
}
