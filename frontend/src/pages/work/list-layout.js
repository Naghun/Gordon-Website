// Lanes are independent vertical stacks. Older row layouts are transposed on read.
export function listLanes(columns) {
  if (columns.some(c => Number.isInteger(c.lane))) {
    const groups = new Map();
    let next = Math.max(-1, ...columns.map(c => c.lane ?? -1)) + 1;
    for (const c of columns) {
      const lane = Number.isInteger(c.lane) ? c.lane : next++;
      if (!groups.has(lane)) groups.set(lane, []);
      groups.get(lane).push(c.id);
    }
    return [...groups.entries()].sort((a,b) => a[0]-b[0]).map(([,ids]) => ids);
  }
  const lanes = [];
  let index = 0;
  for (const c of columns) {
    if (c.rowBreak) index = 0;
    (lanes[index++] ||= []).push(c.id);
  }
  return lanes;
}

export function placeList(lanes, id, target, placement) {
  if (id === target) return lanes;
  const next = lanes.map(lane => lane.filter(value => value !== id)).filter(lane => lane.length);
  const lane = next.findIndex(items => items.includes(target));
  if (lane < 0) return lanes;
  if (placement === 'below' || placement === 'above') {
    next[lane].splice(next[lane].indexOf(target) + (placement === 'below' ? 1 : 0), 0, id);
  } else next.splice(lane + (placement === 'after' ? 1 : 0), 0, [id]);
  return next;
}

export function stackPositions(lanes, heights, width = 278, gap = 16) {
  const positions = {};
  let height = 0;
  lanes.forEach((lane, index) => {
    let top = 0;
    lane.forEach(id => {
      positions[id] = { x: index * (width + gap), y: top };
      top += (heights[id] || 160) + gap;
    });
    height = Math.max(height, top);
  });
  return { positions, height: Math.max(180, height), width: (lanes.length + 1) * (width + gap), addX: lanes.length * (width + gap) };
}
