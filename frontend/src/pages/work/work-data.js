import { API } from "../../config/site";
export const uid = () => crypto.randomUUID();
export const columns = () => [
  { id: "ideas", name: "Ideje", color: "#aa8cff" },
  { id: "todo", name: "Za uraditi", color: "#5ca9ff" },
  { id: "doing", name: "U toku", color: "#ffbc57" },
  { id: "review", name: "Na pregledu", color: "#f087c9" },
];
export const day = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const people = [
  { id: 1, name: "Abdullah", username: "Abdullah" },
  { id: 2, name: "Dizajn tim", username: "dizajn" },
  { id: 3, name: "Marketing tim", username: "marketing" },
  { id: 4, name: "Razvoj tim", username: "razvoj" },
];
export const blankTask = (project, status = "todo") => ({
  parent: null,
  attachments: [],
  id: uid(),
  project,
  title: "",
  description: "",
  status,
  person: null,
  priority: "Srednji",
  label: "",
  due: "",
  checklist: [],
  comments: [],
  activity: [],
  archived: false,
  deleted: false,
  revision: 1,
  creator: 1,
});
export function demoData() {
  try {
    const d = JSON.parse(localStorage.getItem("gordon-work-v2"));
    if (d?.projects?.length && Array.isArray(d.tasks))
      return {
        ...d,
        projects: d.projects.map((p) => ({
          ...p,
          members: p.members.map((m) => (m.id === 1 ? people[0] : m)),
        })),
      };
  } catch {
    /* use examples */
  }
  try {
    const d = JSON.parse(localStorage.getItem("gordon-work-v1"));
    if (d?.projects?.length && Array.isArray(d.tasks))
      return {
        projects: d.projects.map((p) => ({
          ...p,
          owner: 1,
          members: people,
          columns: columns(),
          background: "aurora",
        })),
        tasks: d.tasks.map((t) => ({
          ...blankTask(t.project),
          ...t,
          status: ["ideas", "todo", "doing", "review", "done"][t.status],
          person:
            t.person === "Semir"
              ? 1
              : people.find((p) => p.name === t.person)?.id || null,
        })),
      };
  } catch {
    /* original data is left intact */
  }
  const projects = [
    {
      id: "web",
      name: "Gordon web stranica",
      owner: 1,
      members: people,
      columns: columns(),
      background: "aurora",
    },
    {
      id: "marketing",
      name: "Marketing & sadržaj",
      owner: 1,
      members: people,
      columns: columns(),
      background: "ocean",
    },
  ];
  const names = [
    "Nova struktura početne stranice",
    "Ideje za sljedeću kampanju",
    "Pripremiti tekst za novu uslugu",
    "Dizajn projektnog prostora",
    "Povezati kontakt formu",
    "Pregled mobilne verzije",
    "Dogovoriti vizuelni smjer",
  ];
  return {
    projects,
    tasks: names.map((title, i) => ({
      ...blankTask("web"),
      title,
      status: ["ideas", "ideas", "todo", "doing", "doing", "review", "done"][i],
      person: (i % 4) + 1,
      label: [
        "Strategija",
        "Marketing",
        "Sadržaj",
        "Dizajn",
        "Razvoj",
        "Dizajn",
        "Strategija",
      ][i],
      priority: i === 3 ? "Visok" : "Srednji",
      due: day(i - 1),
      description:
        "Dogovoriti cilj, pripremiti prvi prijedlog i podijeliti ga s timom.",
      checklist: [
        { id: uid(), title: "Pripremiti prijedlog", done: i > 3 },
        { id: uid(), title: "Provjeriti detalje", done: i > 5 },
      ],
    })),
  };
}
let csrf = "";
export async function request(path, method = "GET", body) {
  const response = await fetch(`${API}/work/${path}`, {
    method,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(method !== "GET" ? { "X-CSRFToken": csrf } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response
    .json()
    .catch(() => ({ detail: "Server trenutno nije dostupan." }));
  if (data.csrf) csrf = data.csrf;
  if (!response.ok) {
    const error = new Error(
      typeof data.detail === "string"
        ? data.detail
        : Array.isArray(data)
          ? data.join(" ")
          : "Promjena nije sačuvana. Provjerite podatke.",
    );
    error.status = response.status;
    throw error;
  }
  return data;
}
export const backgrounds = [
  { id: "white", name: "Bijela", css: "#ffffff", light: true },
  { id: "pearl", name: "Biserna", css: "#f1f4f6", light: true },
  { id: "mint-day", name: "Mint jutro", css: "linear-gradient(135deg,#e9fff5,#c5eade)", light: true },
  { id: "sky-day", name: "Vedro nebo", css: "linear-gradient(135deg,#f4fbff,#c5e4fa)", light: true },
  { id: "rose-day", name: "Breskva", css: "linear-gradient(135deg,#fff4e8,#f6d5dc)", light: true },
  { id: "lavender-day", name: "Lavanda", css: "linear-gradient(135deg,#f8f5ff,#dcd8f4)", light: true },
  {
    id: "copper",
    name: "Bakar",
    css: "radial-gradient(ellipse at top right,#93573599,transparent 70%),linear-gradient(125deg,#1e1821,#412932)",
  },
  {
    id: "lagoon",
    name: "Laguna",
    css: "radial-gradient(ellipse at bottom left,#196a7099,transparent 70%),linear-gradient(140deg,#102b39,#163c46)",
  },
  {
    id: "cosmos",
    name: "Svemir",
    css: "radial-gradient(ellipse at top left,#553d8f99,transparent 60%),radial-gradient(ellipse at bottom right,#23577e88,transparent 70%),#13172a",
  },
  {
    id: "aurora",
    name: "Aurora",
    css: "radial-gradient(ellipse at 90% 0%,#164e4c88,transparent 60%),radial-gradient(ellipse at 0% 100%,#49307d66,transparent 65%),#11151f",
  },
  { id: "midnight", name: "Ponoć", css: "#11151e" },
  {
    id: "ocean",
    name: "Ocean",
    css: "linear-gradient(135deg,#082b35,#0b4052 50%,#141c38)",
  },
  {
    id: "sunset",
    name: "Zalazak",
    css: "linear-gradient(135deg,#372345,#794652,#432445)",
  },
  {
    id: "forest",
    name: "Šuma",
    css: "linear-gradient(130deg,#112b28,#1c4437,#172322)",
  },
  {
    id: "plum",
    name: "Ljubičasta",
    css: "linear-gradient(135deg,#241d40,#513363,#252242)",
  },
  {
    id: "photo-mountain",
    name: "Planinski vrhovi",
    image: "/work-backgrounds/mountain.jpg",
    author: "Paul Earle",
    source: "https://unsplash.com/photos/xJ2tjuUHD9M",
  },
  { id: "photo-dunes", name: "Zlatne dine", image: "/work-backgrounds/dunes.jpg", author: "Zetong Li", source: "https://unsplash.com/photos/HEf0fKgJA1Q" },
  { id: "photo-tetons", name: "Mirno planinsko jezero", image: "/work-backgrounds/tetons.jpg", author: "Miles Farnsworth", source: "https://unsplash.com/photos/LXGKvnff7SQ" },
  { id: "photo-mist", name: "Šuma u magli", image: "/work-backgrounds/mist.jpg", author: "Austin Schmid", source: "https://unsplash.com/photos/zQ-y4Gj8194" },
  {
    id: "photo-lake",
    name: "Planinski pejzaž",
    image: "/work-backgrounds/lake.jpg",
    author: "Narayan Gopalan",
    source: "https://unsplash.com/photos/MaG8tiHjqXc",
  },
  {
    id: "photo-forest",
    name: "Priroda",
    image: "/work-backgrounds/forest.jpg",
    author: "Hendrik Cornelissen",
    source: "https://unsplash.com/photos/-qrcOR33ErA",
  },
];
export function backdrop(value) {
  if (/^color:#[0-9a-f]{6}$/i.test(value || "")) return value.slice(6);
  const gradient = /^gradient:(\d{1,3}):(#[0-9a-f]{6}):(#[0-9a-f]{6})$/i.exec(value || "");
  if (gradient && Number(gradient[1]) <= 360) return `linear-gradient(${gradient[1]}deg,${gradient[2]},${gradient[3]})`;
  const b = backgrounds.find((p) => p.id === value);
  return (
    b?.css ||
    `linear-gradient(#080c14b3,#080c144d),url("${b?.image || (value?.startsWith("data:image/jpeg;base64,") ? value : "")}") center/cover`
  );
}
export function lightBackground(value) {
  const preset = backgrounds.find(b => b.id === value);
  if (preset) return !!preset.light;
  const colors = (value || '').match(/#[0-9a-f]{6}/gi) || [];
  return colors.length > 0 && colors.reduce((sum, hex) => {
    const channels = [1,3,5].map(i => parseInt(hex.slice(i,i+2),16));
    return sum + channels[0]*.299 + channels[1]*.587 + channels[2]*.114;
  },0) / colors.length > 165;
}
export async function imageData(file) {
  if (
    !file ||
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 10 * 1024 * 1024
  )
    throw new Error("Odaberite JPG, PNG ili WebP sliku do 10 MB.");
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const ratio = Math.min(1, 1600 / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * ratio);
    canvas.height = Math.round(img.height * ratio);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    const result = canvas.toDataURL("image/jpeg", 0.82);
    if (result.length > 2000000)
      throw new Error("Slika je prevelika. Odaberite manju.");
    return result;
  } finally {
    URL.revokeObjectURL(url);
  }
}
