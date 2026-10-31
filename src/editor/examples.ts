import type { ExerciseFiles, ExerciseMode } from '@shared/checks';
import { tx, type L10n } from '@/i18n';

export interface CodeExample {
  id: string;
  title: L10n;
  files: ExerciseFiles;
}

export const EXAMPLES: Record<ExerciseMode, CodeExample[]> = {
  web: [
    {
      id: 'web-hello',
      title: tx('Salom, Code World', 'Привет, Code World', 'Hello, Code World'),
      files: {
        html: '<main class="card">\n  <h1>Hello, Code World</h1>\n  <p>HTML · CSS · JS ✨</p>\n  <button id="greet">Greet me</button>\n  <p id="message"></p>\n</main>\n',
        css: 'body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  font-family: system-ui, sans-serif;\n  background: radial-gradient(circle at top, #0f2a44, #030712);\n  color: #e2e8f0;\n}\n\n.card {\n  padding: 2rem;\n  border-radius: 16px;\n  border: 1px solid #1e3a5f;\n  background: rgba(15, 23, 42, 0.8);\n  max-width: 360px;\n}\n\nbutton {\n  padding: .6rem 1rem;\n  border: 0;\n  border-radius: 10px;\n  background: #38bdf8;\n  font-weight: 600;\n  cursor: pointer;\n}\n',
        js: "const button = document.querySelector('#greet');\nconst message = document.querySelector('#message');\n\nbutton.addEventListener('click', () => {\n  message.textContent = `Welcome, explorer! It is ${new Date().toLocaleTimeString()}.`;\n  console.log('Button clicked');\n});\n",
      },
    },
    {
      id: 'web-flex',
      title: tx('Flexbox menyu', 'Меню на Flexbox', 'Flexbox navigation bar'),
      files: {
        html: '<nav class="nav">\n  <strong>Code World</strong>\n  <ul>\n    <li><a href="#">Courses</a></li>\n    <li><a href="#">Missions</a></li>\n    <li><a href="#">Profile</a></li>\n  </ul>\n</nav>\n',
        css: 'body { margin: 0; font-family: system-ui, sans-serif; }\n.nav {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 1rem 1.5rem;\n  background: #0f172a;\n  color: white;\n}\n.nav ul { display: flex; gap: 1.25rem; list-style: none; margin: 0; padding: 0; }\n.nav a { color: #7dd3fc; text-decoration: none; }\n.nav a:hover { text-decoration: underline; }\n',
        js: '',
      },
    },
    {
      id: 'web-todo',
      title: tx('Vazifalar roʻyxati (DOM)', 'Список дел (DOM)', 'To-do list (DOM)'),
      files: {
        html: '<h2>Mission log</h2>\n<form id="form">\n  <input id="task" placeholder="New task" required />\n  <button>Add</button>\n</form>\n<ul id="list"></ul>\n',
        css: 'body { font-family: system-ui, sans-serif; padding: 1.5rem; }\nli { cursor: pointer; padding: .25rem 0; }\nli.done { text-decoration: line-through; color: #94a3b8; }\n',
        js: "const form = document.querySelector('#form');\nconst input = document.querySelector('#task');\nconst list = document.querySelector('#list');\n\nform.addEventListener('submit', (event) => {\n  event.preventDefault();\n  const item = document.createElement('li');\n  item.textContent = input.value;\n  item.addEventListener('click', () => item.classList.toggle('done'));\n  list.append(item);\n  input.value = '';\n});\n",
      },
    },
  ],
  console: [
    { id: 'js-hello', title: tx('Salom, konsol', 'Привет, консоль', 'Hello, console'), files: { js: "const name = 'Explorer';\nconsole.log(`Hello, ${name}!`);\nconsole.log('2 + 2 =', 2 + 2);\n" } },
    {
      id: 'js-arrays',
      title: tx('Massiv metodlari', 'Методы массивов', 'Array methods'),
      files: {
        js: "const missions = [\n  { title: 'Explore', xp: 25, done: true },\n  { title: 'Style a card', xp: 40, done: false },\n  { title: 'Ace a quiz', xp: 50, done: true },\n];\n\nconst earned = missions.filter((m) => m.done).reduce((sum, m) => sum + m.xp, 0);\nconsole.log('XP earned:', earned);\nconsole.log(missions.map((m) => `${m.done ? '✓' : '·'} ${m.title}`).join('\\n'));\n",
      },
    },
    {
      id: 'js-async',
      title: tx('Async / await', 'Async / await', 'Async / await'),
      files: {
        js: "const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));\n\nasync function boot() {\n  for (const system of ['grid', 'lights', 'holograms']) {\n    await wait(150);\n    console.log(`${system} online`);\n  }\n  console.log('Code World ready!');\n}\n\nboot();\n",
      },
    },
    {
      id: 'js-class',
      title: tx('Klasslar', 'Классы', 'Classes'),
      files: {
        js: "class Robot {\n  constructor(name) {\n    this.name = name;\n    this.battery = 100;\n  }\n  work(hours) {\n    this.battery = Math.max(0, this.battery - hours * 10);\n    return this;\n  }\n  toString() {\n    return `${this.name} (${this.battery}%)`;\n  }\n}\n\nconst nova = new Robot('Nova');\nconsole.log(String(nova.work(3)));\n",
      },
    },
  ],
  python: [
    { id: 'py-hello', title: tx('Salom, Python', 'Привет, Python', 'Hello, Python'), files: { py: 'name = "Explorer"\nprint(f"Hello, {name}!")\nprint("2 ** 10 =", 2 ** 10)\n' } },
    {
      id: 'py-words',
      title: tx('Soʻzlar chastotasi', 'Частота слов', 'Word frequency'),
      files: {
        py: 'text = """Code World is a city of code. Every tower in the city teaches code."""\n\ncounts = {}\nfor word in text.lower().replace(".", "").split():\n    counts[word] = counts.get(word, 0) + 1\n\nfor word, n in sorted(counts.items(), key=lambda kv: -kv[1])[:5]:\n    print(f"{word:>6} {\'#\' * n}")\n',
      },
    },
    {
      id: 'py-input',
      title: tx('input() bilan oʻqish', 'Чтение input()', 'Reading input()'),
      files: { py: '# Type a name in the "Program input" box below, then press Run.\nname = input("What is your name? ")\nprint(f"Welcome to Code World, {name}!")\n' },
    },
    {
      id: 'py-class',
      title: tx('Klasslar va dataclass', 'Классы и dataclass', 'Classes & dataclasses'),
      files: {
        py: 'from dataclasses import dataclass\n\n\n@dataclass\nclass Course:\n    title: str\n    lessons: int\n\n    def describe(self) -> str:\n        return f"{self.title}: {self.lessons} lessons"\n\n\nfor course in [Course("HTML", 6), Course("Python", 6)]:\n    print(course.describe())\n',
      },
    },
  ],
  react: [
    {
      id: 'react-counter',
      title: tx('Hisoblagich', 'Счётчик', 'Counter'),
      files: {
        jsx: "import { useState } from 'react';\nimport { createRoot } from 'react-dom/client';\n\nfunction App() {\n  const [count, setCount] = useState(0);\n  return (\n    <main>\n      <h1>Clicks: {count}</h1>\n      <button onClick={() => setCount((c) => c + 1)}>+1</button>\n    </main>\n  );\n}\n\ncreateRoot(document.getElementById('root')).render(<App />);\n",
        css: 'body { font-family: system-ui, sans-serif; padding: 1.5rem; background: #0b1220; color: #e2e8f0; }\nbutton { padding: .5rem 1rem; border-radius: 8px; border: 1px solid #38bdf8; background: #0c4a6e; color: white; }\n',
      },
    },
    {
      id: 'react-list',
      title: tx('Filtrlanadigan roʻyxat', 'Фильтруемый список', 'Filterable list'),
      files: {
        jsx: "import { useState } from 'react';\nimport { createRoot } from 'react-dom/client';\n\nconst TOWERS = ['HTML Academy', 'CSS Design Studio', 'JavaScript Laboratory', 'Python Center', 'React Tower'];\n\nfunction App() {\n  const [query, setQuery] = useState('');\n  const visible = TOWERS.filter((t) => t.toLowerCase().includes(query.toLowerCase()));\n  return (\n    <main>\n      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder=\"Search towers\" />\n      <ul>\n        {visible.map((t) => <li key={t}>{t}</li>)}\n      </ul>\n      {visible.length === 0 && <p>No towers match.</p>}\n    </main>\n  );\n}\n\ncreateRoot(document.getElementById('root')).render(<App />);\n",
        css: 'body { font-family: system-ui, sans-serif; padding: 1.5rem; }\ninput { padding: .4rem .6rem; }\n',
      },
    },
  ],
};
