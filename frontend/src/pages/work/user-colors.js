const colors = ['#83c9ff', '#c5a3ff', '#7de0bd', '#ffc785', '#f5a3c7', '#a6d97b'];
export function userColor(id) {
  const hash = [...String(id ?? '')].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 0);
  return colors[hash % colors.length];
}
