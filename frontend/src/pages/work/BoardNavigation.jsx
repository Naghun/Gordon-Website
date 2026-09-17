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
  const end = direction => board?.scrollTo({left:direction < 0 ? 0 : info.max,behavior:'smooth'});
  const arrow = direction => direction < 0 ? '‹' : '›';
  const controls = direction => {
    const count = direction < 0 ? info.left : info.right;
    const enabled = direction < 0 ? info.x > 2 : info.x < info.max - 2;
    const word = direction < 0 ? 'lijevo' : 'desno';
    return <div className="gw-scroll-side" style={{visibility:enabled ? 'visible' : 'hidden'}}>
      <span>{count ? `Još ${count} ${word}` : direction > 0 ? 'Dodaj listu' : ''}</span>
      <button disabled={!enabled} onClick={() => move(direction * 294)} aria-label={`Jedna kolona ${word}`} title={`Pomjeri jednu kolonu ${word}`}><i aria-hidden="true">{arrow(direction)}</i></button>
      <button disabled={!enabled} onClick={() => end(direction)} aria-label={`Skroz ${word}`} title={`Pomjeri do kraja ${word}`}><i className="gw-triple-arrow" aria-hidden="true">{arrow(direction).repeat(3)}</i></button>
    </div>;
  };
  return <nav className="gw-board-navigation" aria-label="Pomjeranje table">
    {controls(-1)}
    <span className="gw-scroll-spacer" aria-hidden="true" />
    {controls(1)}
    {(info.above > 0 || info.below > 0) && <div className="gw-board-vertical-nav">
      {info.above > 0 && <button onClick={() => move(0,-board.clientHeight * .7)} aria-label="Prikaži liste iznad" title="Liste iznad">↑ {info.above}</button>}
      {info.below > 0 && <button onClick={() => move(0,board.clientHeight * .7)} aria-label="Prikaži liste ispod" title="Liste ispod">↓ {info.below}</button>}
    </div>}
  </nav>;
}
