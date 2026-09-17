import { useState } from 'react';
import { backdrop } from './work-data';

export default function BackgroundControls({ value, disabled, save }) {
  const parts = value?.startsWith('gradient:') ? value.split(':') : [];
  const [color,setColor] = useState(value?.startsWith('color:') ? value.slice(6) : '#ffffff');
  const [start,setStart] = useState(parts[2] || '#e7fff4');
  const [end,setEnd] = useState(parts[3] || '#d5def9');
  const [angle,setAngle] = useState(parts[1] || '135');
  const gradient = `gradient:${angle}:${start}:${end}`;
  return <div className="gw-custom-backgrounds">
    <form onSubmit={e=>{e.preventDefault();save(`color:${color}`);}}>
      <h3>Odaberi boju BG-a</h3>
      <div className="gw-background-sample" style={{background:color}}><label title="Promijeni boju"><input type="color" aria-label="Boja pozadine" value={color} onChange={e=>setColor(e.target.value)} disabled={disabled}/></label></div>
      <button className="gw-primary" disabled={disabled}>Primijeni boju</button>
    </form>
    <form onSubmit={e=>{e.preventDefault();save(gradient);}}>
      <h3>Dodaj gradijent</h3>
      <div className="gw-background-sample" style={{background:backdrop(gradient)}}>
        <input type="color" aria-label="Početna boja gradijenta" value={start} onChange={e=>setStart(e.target.value)} disabled={disabled}/>
        <input type="color" aria-label="Završna boja gradijenta" value={end} onChange={e=>setEnd(e.target.value)} disabled={disabled}/>
      </div>
      <label className="gw-gradient-angle">Smjer <select aria-label="Smjer gradijenta" value={angle} onChange={e=>setAngle(e.target.value)} disabled={disabled}><option value="135">↘ Dijagonalno</option><option value="90">→ Vodoravno</option><option value="180">↓ Uspravno</option><option value="45">↗ Obrnuto</option></select></label>
      <button className="gw-primary" disabled={disabled}>Primijeni gradijent</button>
    </form>
  </div>;
}
