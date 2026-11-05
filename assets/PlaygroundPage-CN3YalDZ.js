import{r,j as o}from"./three-core-Cy1vprC-.js";import{u as S,f as c,a as C,M as j,W as k}from"./useDraft-DNek051U.js";import{v as t,u as E,o as R,d as M,a7 as W,a8 as L}from"./index-PyFXmlK8.js";import"./Modal-BUBksosa.js";import"./monaco-C3KHSFI8.js";const i={web:[{id:"web-hello",title:t("Salom, Code World","Привет, Code World","Hello, Code World"),files:{html:`<main class="card">
  <h1>Hello, Code World</h1>
  <p>HTML · CSS · JS ✨</p>
  <button id="greet">Greet me</button>
  <p id="message"></p>
</main>
`,css:`body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: radial-gradient(circle at top, #0f2a44, #030712);
  color: #e2e8f0;
}

.card {
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid #1e3a5f;
  background: rgba(15, 23, 42, 0.8);
  max-width: 360px;
}

button {
  padding: .6rem 1rem;
  border: 0;
  border-radius: 10px;
  background: #38bdf8;
  font-weight: 600;
  cursor: pointer;
}
`,js:`const button = document.querySelector('#greet');
const message = document.querySelector('#message');

button.addEventListener('click', () => {
  message.textContent = \`Welcome, explorer! It is \${new Date().toLocaleTimeString()}.\`;
  console.log('Button clicked');
});
`}},{id:"web-flex",title:t("Flexbox menyu","Меню на Flexbox","Flexbox navigation bar"),files:{html:`<nav class="nav">
  <strong>Code World</strong>
  <ul>
    <li><a href="#">Courses</a></li>
    <li><a href="#">Missions</a></li>
    <li><a href="#">Profile</a></li>
  </ul>
</nav>
`,css:`body { margin: 0; font-family: system-ui, sans-serif; }
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #0f172a;
  color: white;
}
.nav ul { display: flex; gap: 1.25rem; list-style: none; margin: 0; padding: 0; }
.nav a { color: #7dd3fc; text-decoration: none; }
.nav a:hover { text-decoration: underline; }
`,js:""}},{id:"web-todo",title:t("Vazifalar roʻyxati (DOM)","Список дел (DOM)","To-do list (DOM)"),files:{html:`<h2>Mission log</h2>
<form id="form">
  <input id="task" placeholder="New task" required />
  <button>Add</button>
</form>
<ul id="list"></ul>
`,css:`body { font-family: system-ui, sans-serif; padding: 1.5rem; }
li { cursor: pointer; padding: .25rem 0; }
li.done { text-decoration: line-through; color: #94a3b8; }
`,js:`const form = document.querySelector('#form');
const input = document.querySelector('#task');
const list = document.querySelector('#list');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const item = document.createElement('li');
  item.textContent = input.value;
  item.addEventListener('click', () => item.classList.toggle('done'));
  list.append(item);
  input.value = '';
});
`}}],console:[{id:"js-hello",title:t("Salom, konsol","Привет, консоль","Hello, console"),files:{js:"const name = 'Explorer';\nconsole.log(`Hello, ${name}!`);\nconsole.log('2 + 2 =', 2 + 2);\n"}},{id:"js-arrays",title:t("Massiv metodlari","Методы массивов","Array methods"),files:{js:`const missions = [
  { title: 'Explore', xp: 25, done: true },
  { title: 'Style a card', xp: 40, done: false },
  { title: 'Ace a quiz', xp: 50, done: true },
];

const earned = missions.filter((m) => m.done).reduce((sum, m) => sum + m.xp, 0);
console.log('XP earned:', earned);
console.log(missions.map((m) => \`\${m.done ? '✓' : '·'} \${m.title}\`).join('\\n'));
`}},{id:"js-async",title:t("Async / await","Async / await","Async / await"),files:{js:`const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function boot() {
  for (const system of ['grid', 'lights', 'holograms']) {
    await wait(150);
    console.log(\`\${system} online\`);
  }
  console.log('Code World ready!');
}

boot();
`}},{id:"js-class",title:t("Klasslar","Классы","Classes"),files:{js:`class Robot {
  constructor(name) {
    this.name = name;
    this.battery = 100;
  }
  work(hours) {
    this.battery = Math.max(0, this.battery - hours * 10);
    return this;
  }
  toString() {
    return \`\${this.name} (\${this.battery}%)\`;
  }
}

const nova = new Robot('Nova');
console.log(String(nova.work(3)));
`}}],python:[{id:"py-hello",title:t("Salom, Python","Привет, Python","Hello, Python"),files:{py:`name = "Explorer"
print(f"Hello, {name}!")
print("2 ** 10 =", 2 ** 10)
`}},{id:"py-words",title:t("Soʻzlar chastotasi","Частота слов","Word frequency"),files:{py:`text = """Code World is a city of code. Every tower in the city teaches code."""

counts = {}
for word in text.lower().replace(".", "").split():
    counts[word] = counts.get(word, 0) + 1

for word, n in sorted(counts.items(), key=lambda kv: -kv[1])[:5]:
    print(f"{word:>6} {'#' * n}")
`}},{id:"py-input",title:t("input() bilan oʻqish","Чтение input()","Reading input()"),files:{py:`# Type a name in the "Program input" box below, then press Run.
name = input("What is your name? ")
print(f"Welcome to Code World, {name}!")
`}},{id:"py-class",title:t("Klasslar va dataclass","Классы и dataclass","Classes & dataclasses"),files:{py:`from dataclasses import dataclass


@dataclass
class Course:
    title: str
    lessons: int

    def describe(self) -> str:
        return f"{self.title}: {self.lessons} lessons"


for course in [Course("HTML", 6), Course("Python", 6)]:
    print(course.describe())
`}}],react:[{id:"react-counter",title:t("Hisoblagich","Счётчик","Counter"),files:{jsx:`import { useState } from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  const [count, setCount] = useState(0);
  return (
    <main>
      <h1>Clicks: {count}</h1>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
`,css:`body { font-family: system-ui, sans-serif; padding: 1.5rem; background: #0b1220; color: #e2e8f0; }
button { padding: .5rem 1rem; border-radius: 8px; border: 1px solid #38bdf8; background: #0c4a6e; color: white; }
`}},{id:"react-list",title:t("Filtrlanadigan roʻyxat","Фильтруемый список","Filterable list"),files:{jsx:`import { useState } from 'react';
import { createRoot } from 'react-dom/client';

const TOWERS = ['HTML Academy', 'CSS Design Studio', 'JavaScript Laboratory', 'Python Center', 'React Tower'];

function App() {
  const [query, setQuery] = useState('');
  const visible = TOWERS.filter((t) => t.toLowerCase().includes(query.toLowerCase()));
  return (
    <main>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search towers" />
      <ul>
        {visible.map((t) => <li key={t}>{t}</li>)}
      </ul>
      {visible.length === 0 && <p>No towers match.</p>}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
`,css:`body { font-family: system-ui, sans-serif; padding: 1.5rem; }
input { padding: .4rem .6rem; }
`}}]},g=["web","console","python","react"];function D(){const s=E(),h=R();M(s("lab.title"));const[e,y]=r.useState(()=>{const n=W("cw.playground.mode","web");return g.includes(n)?n:"web"}),a=S(`playground.${e}`,c(e,i[e][0].files)),l=C(e),[d,b]=r.useState(""),[u,x]=r.useState(!0);r.useEffect(()=>{L("cw.playground.mode",e)},[e]);const m=u&&(e==="web"||e==="react"),p=a.files;r.useEffect(()=>{if(!m)return;const n=window.setTimeout(()=>void l.run(p),700);return()=>window.clearTimeout(n)},[p,m]);const w=o.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[o.jsx("h1",{className:"sr-only",children:s("lab.title")}),o.jsx("label",{htmlFor:"pg-language",className:"sr-only",children:s("lab.language")}),o.jsx("select",{id:"pg-language",value:e,onChange:n=>y(n.target.value),className:"focus-ring h-8 rounded-lg border border-white/10 bg-night-950 px-2.5 text-[13px] text-slate-200",children:g.map(n=>o.jsx("option",{value:n,children:j[n]},n))}),o.jsx("label",{htmlFor:"pg-example",className:"sr-only",children:s("lab.example")}),o.jsxs("select",{id:"pg-example",value:"",onChange:n=>{const f=i[e].find(v=>v.id===n.target.value);f&&a.replace(c(e,f.files))},className:"focus-ring h-8 max-w-[11rem] rounded-lg border border-white/10 bg-night-950 px-2.5 text-[13px] text-slate-300",children:[o.jsx("option",{value:"",disabled:!0,children:s("lab.example")}),i[e].map(n=>o.jsx("option",{value:n.id,children:h(n.title)},n.id))]}),(e==="web"||e==="react")&&o.jsxs("label",{className:"flex items-center gap-1.5 text-[12px] text-slate-400",children:[o.jsx("input",{type:"checkbox",checked:u,onChange:n=>x(n.target.checked),className:"accent-cyan-400"}),s("lab.live")]})]});return o.jsx(k,{mode:e,files:a.files,onFileChange:a.setFile,runner:l,onRun:()=>void l.run(a.files,{stdin:d}),onReset:()=>a.replace(c(e,i[e][0].files)),stdin:d,onStdinChange:b,storageKey:`playground-${e}`,toolbarStart:w})}export{D as default};
