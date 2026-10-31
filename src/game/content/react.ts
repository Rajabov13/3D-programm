import { tx } from '@/i18n';
import type { Zone } from '../types';

const baseCss =
  'body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; background: #0b1220; color: #e2e8f0; }\nbutton { font: inherit; padding: 8px 16px; border-radius: 10px; border: 1px solid #38bdf8; background: #0c4a6e; color: white; cursor: pointer; }\n';
const render = "\ncreateRoot(document.getElementById('root')).render(<App />);\n";

export const reactZone: Zone = {
  id: 'react',
  nameKey: 'b.react',
  buildingId: 'react-tower',
  symbol: 'JSX',
  accent: '#22d3ee',
  requiredLevel: 4,
  stages: [
    {
      id: 'react-1',
      zoneId: 'react',
      title: tx('Komponentlar va JSX', 'Компоненты и JSX', 'Components & JSX'),
      tip: {
        text: tx(
          'Komponent — interfeys qaytaradigan funksiya, nomi katta harf bilan boshlanadi. JSX da class emas, className.',
          'Компонент — функция, возвращающая интерфейс; имя с большой буквы. В JSX вместо class пишут className.',
          'A component is a function that returns UI, named with a capital letter. JSX uses className, not class.',
        ),
        code: 'function Hello() {\n  return <h1 className="title">Hello</h1>;\n}',
        lang: 'jsx',
      },
      tasks: [
        { kind: 'pick', q: tx('Toʻgʻri komponent nomi', 'Правильное имя компонента', 'A valid component name'), options: ['HeroCard', 'heroCard', 'hero-card', 'hero_card'], answer: 0 },
        { kind: 'pick', q: tx('JSX da CSS klassi', 'CSS-класс в JSX', 'A CSS class in JSX'), options: ['className="card"', 'class="card"', 'css="card"', 'style="card"'], answer: 0 },
        { kind: 'blank', code: 'const name = "Ada";\nconst el = <h1>Hi, {___}!</h1>;', lang: 'jsx', options: ['name', '"name"', '$name', '#name'], answer: 0 },
        { kind: 'order', lines: ['function Hello() {', '  return <h1>Hello</h1>;', '}'], lang: 'jsx' },
        { kind: 'bug', lines: ['function App() {', '  return <img src="cat.png">;', '}'], bug: 1, fix: '  return <img src="cat.png" />;', lang: 'jsx' },
        { kind: 'match', pairs: [['<Hello />', '🧩'], ['{count}', '🔢'], ['className', '🎨'], ['onClick', '👆']] },
      ],
    },
    {
      id: 'react-2',
      zoneId: 'react',
      title: tx('Props', 'Props', 'Props'),
      tip: {
        text: tx(
          'Props — komponentga tashqaridan beriladigan maʼlumot: <Card title="Hi" />.',
          'Props — данные, которые передаются компоненту снаружи: <Card title="Hi" />.',
          'Props are data passed into a component from outside: <Card title="Hi" />.',
        ),
        code: 'function Card({ title }) {\n  return <h2>{title}</h2>;\n}\n\n<Card title="Hi" />',
        lang: 'jsx',
      },
      tasks: [
        {
          kind: 'pick',
          q: tx('title propini olish', 'Получить проп title', 'Receive the title prop'),
          options: ['function Card({ title })', 'function Card(title{})', 'function Card[title]', 'Card.title()'],
          answer: 0,
        },
        { kind: 'output', code: 'function Hi({ name }) {\n  return <p>Hi, {name}!</p>;\n}\n\n<Hi name="Nova" />', lang: 'jsx', options: ['Hi, Nova!', 'Hi, {name}!', 'Hi, name!', 'Nova'], answer: 0 },
        { kind: 'blank', code: 'function Badge({ label }) {\n  return <b>{label}</b>;\n}\n\n<Badge ___="Gold" />', lang: 'jsx', options: ['label', 'name', 'title', 'text'], answer: 0 },
        { kind: 'output', code: 'function Sum({ a, b }) {\n  return <p>{a + b}</p>;\n}\n\n<Sum a={2} b={3} />', lang: 'jsx', options: ['5', '23', 'a + b', '{a + b}'], answer: 0 },
        { kind: 'pick', q: tx('Son sifatida prop berish', 'Передать число как проп', 'Pass a number as a prop'), options: ['count={5}', 'count="5"', 'count=5', 'count:{5}'], answer: 0 },
        { kind: 'bug', lines: ['function Card({ title }) {', '  return <h2>{titel}</h2>;', '}'], bug: 1, fix: '  return <h2>{title}</h2>;', lang: 'jsx' },
      ],
    },
    {
      id: 'react-3',
      zoneId: 'react',
      title: tx('Holat (useState)', 'Состояние (useState)', 'State (useState)'),
      tip: {
        text: tx(
          'useState qiymatni eslab qoladi; setter chaqirilsa, komponent qayta chiziladi.',
          'useState запоминает значение; вызов сеттера перерисовывает компонент.',
          'useState remembers a value; calling the setter re-renders the component.',
        ),
        code: 'const [count, setCount] = useState(0);\n<button onClick={() => setCount(count + 1)}>{count}</button>',
        lang: 'jsx',
      },
      tasks: [
        { kind: 'pick', q: tx('Holat (state) hooki', 'Хук состояния', 'The state hook'), options: ['useState', 'useEffect', 'useMemo', 'useRef'], answer: 0 },
        { kind: 'blank', code: 'const [count, ___] = useState(0);', lang: 'jsx', options: ['setCount', 'count', 'useCount', 'getCount'], answer: 0 },
        { kind: 'output', code: 'const [hp, setHp] = useState(3);\nreturn <p>❤️ {hp}</p>;', lang: 'jsx', options: ['❤️ 3', '❤️ hp', '❤️ {hp}', '❤️ 0'], answer: 0 },
        {
          kind: 'order',
          lines: ['const [on, setOn] = useState(false);', 'return (', '  <button onClick={() => setOn(!on)}>', '    {on ? "ON" : "OFF"}', '  </button>', ');'],
          lang: 'jsx',
        },
        { kind: 'bug', lines: ['const [n, setN] = useState(0);', 'n = n + 1;'], bug: 1, fix: 'setN(n + 1);', lang: 'jsx' },
        { kind: 'match', pairs: [['useState(0)', '0'], ["useState('')", '""'], ['useState([])', '[ ]'], ['useState(false)', '✗']] },
      ],
    },
    {
      id: 'react-4',
      zoneId: 'react',
      title: tx('Roʻyxatlar va shartlar', 'Списки и условия', 'Lists & conditions'),
      tip: {
        text: tx(
          'Roʻyxat map() bilan chiziladi, har bir elementga key kerak. && va ? : — shartli koʻrsatish.',
          'Список рисуется через map(), каждому элементу нужен key. && и ? : — условный показ.',
          'Render lists with map(); each item needs a key. && and ? : show things conditionally.',
        ),
        code: '{items.map((it) => (\n  <li key={it.id}>{it.name}</li>\n))}',
        lang: 'jsx',
      },
      tasks: [
        { kind: 'pick', q: tx('Roʻyxat elementi uchun kalit', 'Ключ для элемента списка', 'The key for a list item'), options: ['key={item.id}', 'id={item.key}', 'index', 'ref={item}'], answer: 0 },
        { kind: 'blank', code: '{items.___((item) => (\n  <li key={item.id}>{item.name}</li>\n))}', lang: 'jsx', options: ['map', 'forEach', 'filter', 'each'], answer: 0 },
        { kind: 'output', code: 'const done = true;\nreturn <p>{done && "✅"}</p>;', lang: 'jsx', options: ['✅', 'true', 'done', 'false'], answer: 0 },
        { kind: 'output', code: 'const lives = 0;\nreturn <p>{lives > 0 ? "Play" : "Game over"}</p>;', lang: 'jsx', options: ['Game over', 'Play', '0', 'lives'], answer: 0 },
        { kind: 'bug', lines: ['<ul>', '  {heroes.map((h) => <li>{h}</li>)}', '</ul>'], bug: 1, fix: '  {heroes.map((h) => <li key={h}>{h}</li>)}', lang: 'jsx' },
        { kind: 'order', lines: ['<ul>', '  {tasks.map((t) => (', '    <li key={t.id}>{t.title}</li>', '  ))}', '</ul>'], lang: 'jsx' },
      ],
    },
    {
      id: 'react-5',
      zoneId: 'react',
      title: tx('Effektlar va formalar', 'Эффекты и формы', 'Effects & forms'),
      tip: {
        text: tx(
          'useEffect tashqi ishlarni bajaradi (sarlavha, taymer). Boshqariladigan input: value + onChange.',
          'useEffect выполняет внешние действия (заголовок, таймер). Управляемый input: value + onChange.',
          'useEffect does outside work (titles, timers). A controlled input uses value + onChange.',
        ),
        code: 'useEffect(() => {\n  document.title = name;\n}, [name]);\n<input value={name} onChange={(e) => setName(e.target.value)} />',
        lang: 'jsx',
      },
      tasks: [
        { kind: 'pick', q: tx('Tashqi ishlar uchun hook', 'Хук для внешних действий', 'The hook for side effects'), options: ['useEffect', 'useState', 'useMemo', 'useId'], answer: 0 },
        { kind: 'blank', code: '<input value={name} ___={(e) => setName(e.target.value)} />', lang: 'jsx', options: ['onChange', 'onType', 'change', 'onValue'], answer: 0 },
        { kind: 'output', code: 'const [q, setQ] = useState("");\nreturn <p>{q || "Empty"}</p>;', lang: 'jsx', options: ['Empty', '""', 'q', 'undefined'], answer: 0 },
        { kind: 'order', lines: ['useEffect(() => {', '  document.title = `XP: ${xp}`;', '}, [xp]);'], lang: 'jsx' },
        { kind: 'bug', lines: ['useEffect(() => {', '  document.title = count;', '}, count);'], bug: 2, fix: '}, [count]);', lang: 'jsx' },
        { kind: 'pick', q: tx('Effekt faqat bir marta ishlashi uchun', 'Чтобы эффект сработал один раз', 'Run an effect only once'), options: ['[]', '[count]', 'null', '{}'], answer: 0 },
      ],
    },
  ],
  boss: {
    zoneId: 'react',
    name: tx('Hisoblagich', 'Счётчик', 'The Counter'),
    task: tx(
      'useState bilan hisoblagich yarating: id="plus" tugmasi bosilganda <p id="count"> ichidagi son 1 ga oshsin.',
      'Сделай счётчик на useState: при нажатии кнопки id="plus" число в <p id="count"> увеличивается на 1.',
      'Build a counter with useState: clicking the button with id="plus" increases the number in <p id="count"> by 1.',
    ),
    mode: 'react',
    starter: {
      jsx: "import { useState } from 'react';\nimport { createRoot } from 'react-dom/client';\n\nfunction App() {\n  return (\n    <main>\n      <p id=\"count\">0</p>\n      <button id=\"plus\">+1</button>\n    </main>\n  );\n}\n" + render,
      css: baseCss,
    },
    solution: {
      jsx: "import { useState } from 'react';\nimport { createRoot } from 'react-dom/client';\n\nfunction App() {\n  const [count, setCount] = useState(0);\n  return (\n    <main>\n      <p id=\"count\">{count}</p>\n      <button id=\"plus\" onClick={() => setCount((c) => c + 1)}>+1</button>\n    </main>\n  );\n}\n" + render,
      css: baseCss,
    },
    checks: [
      { label: tx('useState ishlatilgan', 'Используется useState', 'Uses useState'), spec: { id: 'state', label: '', type: 'source_regex', file: 'jsx', pattern: 'useState\\s*\\(' } },
      { label: tx('onClick qoʻshilgan', 'Есть onClick', 'Has onClick'), spec: { id: 'click', label: '', type: 'source_regex', file: 'jsx', pattern: 'onClick\\s*=\\s*\\{' } },
      {
        label: tx('3 marta bosilsa — 3', '3 нажатия — 3', '3 clicks show 3'),
        spec: { id: 'runtime', label: '', type: 'dom_runtime', selector: '#count', textEquals: '3', before: [{ type: 'click', selector: '#plus', times: 3 }] },
      },
    ],
    xp: 50,
  },
};
