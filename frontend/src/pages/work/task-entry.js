// The first line is the title; subsequent dash-prefixed lines become checklist steps.
export function parseTaskEntry(text) {
  const lines = text.split(/\r?\n/);
  const title = [];
  const steps = [];
  lines.forEach((line, index) => {
    const match = index > 0 && line.match(/^\s*-\s+(.+)$/);
    if (match) steps.push(match[1].trim());
    else title.push(line);
  });
  return { title:title.join("\n").trim(), steps };
}
