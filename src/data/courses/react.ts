import type { CourseDraft } from './types';

const baseCss = `body { font-family: system-ui, sans-serif; margin: 0; padding: 1.5rem; background: #0b1220; color: #e2e8f0; }
button { font: inherit; padding: .45rem .9rem; border-radius: 8px; border: 1px solid #38bdf8; background: #0c4a6e; color: white; cursor: pointer; }
input { font: inherit; padding: .45rem .6rem; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: white; }
`;

const render = `\ncreateRoot(document.getElementById('root')).render(<App />);\n`;

export const reactCourse: CourseDraft = {
  course: {
    id: 'react',
    title: 'React Development Tower',
    tagline: 'Compose modern user interfaces from components.',
    description:
      'Build interactive interfaces the way modern teams do: components, JSX, props, state, lists and effects. Your components render live in a sandboxed preview running React 18.',
    track: 'react',
    objectives: [
      'Write function components with JSX',
      'Pass data through props',
      'Manage interactive state with useState',
      'Render lists with stable keys',
      'Build controlled forms and synchronise with useEffect',
    ],
    prerequisites: ['html', 'javascript'],
    requiredLevel: 5,
    buildingId: 'react-tower',
    accent: '#22d3ee',
    estimatedHours: 4,
    order: 5,
  },
  lessons: [
    {
      lesson: {
        id: 'react-1',
        title: 'Components & JSX',
        summary: 'Functions that return UI, written in JSX.',
        difficulty: 'beginner',
        durationMinutes: 14,
        xp: 25,
        quizXp: 15,
        blocks: [
          {
            type: 'text',
            md: 'A React **component** is a JavaScript function that returns UI. Component names start with a **capital letter** so React can tell them apart from HTML tags.',
          },
          {
            type: 'code',
            language: 'jsx',
            code: "import { createRoot } from 'react-dom/client';\n\nfunction Greeting() {\n  return <h1>Hello from React</h1>;\n}\n\nfunction App() {\n  return (\n    <main>\n      <Greeting />\n      <p>Components can be reused anywhere.</p>\n    </main>\n  );\n}\n\ncreateRoot(document.getElementById('root')).render(<App />);",
          },
          {
            type: 'text',
            md: 'JSX looks like HTML but is JavaScript underneath. A few differences:\n\n- Use `className` instead of `class`\n- Every tag must be closed (`<img />`)\n- Return a **single** root element (or a fragment `<>…</>`)\n- Embed JavaScript expressions in `{curly braces}`',
          },
        ],
      },
      exercises: [
        {
          id: 'react-1-ex1',
          title: 'Welcome component',
          instructions:
            '1. Create a component called `Welcome` that returns an `<h1>` with the text **Welcome to React Tower**\n2. Render `<Welcome />` inside `App`',
          mode: 'react',
          starter: {
            jsx: "import { createRoot } from 'react-dom/client';\n\n// 1. Create the Welcome component\n\nfunction App() {\n  return (\n    <main>\n      {/* 2. Render <Welcome /> here */}\n    </main>\n  );\n}\n" + render,
            css: baseCss,
          },
          solution: {
            jsx: "import { createRoot } from 'react-dom/client';\n\nfunction Welcome() {\n  return <h1>Welcome to React Tower</h1>;\n}\n\nfunction App() {\n  return (\n    <main>\n      <Welcome />\n    </main>\n  );\n}\n" + render,
            css: baseCss,
          },
          hints: ['`function Welcome() { return <h1>…</h1>; }`', 'Use it like a tag: `<Welcome />`.'],
          xp: 40,
          checks: [
            { id: 'component', label: 'Defines a Welcome component', type: 'source_regex', file: 'jsx', pattern: '(function\\s+Welcome\\s*\\(|const\\s+Welcome\\s*=)' },
            { id: 'usage', label: 'Renders <Welcome />', type: 'source_regex', file: 'jsx', pattern: '<Welcome\\s*/>' },
            { id: 'rendered', label: 'The heading appears in the preview', type: 'dom_runtime', selector: 'h1', textIncludes: 'Welcome to React Tower' },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'Why must component names start with a capital letter?',
          options: ['Style convention only', 'JSX treats lowercase tags as HTML elements', 'For performance', 'It is required by JavaScript'],
          answer: 1,
          explanation: '<welcome /> would be treated as an unknown HTML tag.',
        },
        {
          prompt: 'Which attribute sets a CSS class in JSX?',
          options: ['class', 'className', 'css', 'styleClass'],
          answer: 1,
          explanation: 'class is a reserved word in JavaScript, so JSX uses className.',
        },
        {
          prompt: 'How do you embed a JavaScript expression in JSX?',
          options: ['{{ expr }}', '{expr}', '${expr}', '<%= expr %>'],
          answer: 1,
          explanation: 'Single curly braces evaluate expressions inside JSX.',
        },
      ],
    },
    {
      lesson: {
        id: 'react-2',
        title: 'Props',
        summary: 'Configure components with data passed from parents.',
        difficulty: 'beginner',
        durationMinutes: 14,
        xp: 25,
        quizXp: 15,
        blocks: [
          {
            type: 'text',
            md: '**Props** are the inputs of a component, passed like HTML attributes. The component receives them as one object — usually destructured.',
          },
          {
            type: 'code',
            language: 'jsx',
            code: 'function Building({ name, floors }) {\n  return <li>{name} — {floors} floors</li>;\n}\n\nfunction City() {\n  return (\n    <ul>\n      <Building name="HTML Academy" floors={12} />\n      <Building name="CSS Studio" floors={9} />\n    </ul>\n  );\n}',
          },
          {
            type: 'callout',
            variant: 'info',
            md: 'Props are **read-only**. A component must never modify its own props — data flows down from parent to child.',
          },
        ],
      },
      exercises: [
        {
          id: 'react-2-ex1',
          title: 'Skill badges',
          instructions:
            '1. Create a `Badge` component that destructures `{ label, level }` props and renders `<span className="badge">{label} · L{level}</span>`\n2. Render **three** badges in `App` with different labels and levels',
          mode: 'react',
          starter: {
            jsx: "import { createRoot } from 'react-dom/client';\n\n// Create Badge here\n\nfunction App() {\n  return (\n    <section className=\"badges\">\n      {/* render three badges */}\n    </section>\n  );\n}\n" + render,
            css: baseCss + '.badges { display: flex; gap: .5rem; flex-wrap: wrap; }\n.badge { padding: .3rem .7rem; border-radius: 999px; background: #164e63; border: 1px solid #22d3ee; font-size: .85rem; }\n',
          },
          solution: {
            jsx: "import { createRoot } from 'react-dom/client';\n\nfunction Badge({ label, level }) {\n  return <span className=\"badge\">{label} · L{level}</span>;\n}\n\nfunction App() {\n  return (\n    <section className=\"badges\">\n      <Badge label=\"HTML\" level={3} />\n      <Badge label=\"CSS\" level={2} />\n      <Badge label=\"JavaScript\" level={1} />\n    </section>\n  );\n}\n" + render,
            css: baseCss + '.badges { display: flex; gap: .5rem; flex-wrap: wrap; }\n.badge { padding: .3rem .7rem; border-radius: 999px; background: #164e63; border: 1px solid #22d3ee; font-size: .85rem; }\n',
          },
          hints: ['`function Badge({ label, level }) { … }`', 'Pass numbers with braces: `level={3}`.'],
          xp: 40,
          checks: [
            { id: 'props', label: 'Badge destructures its props', type: 'source_regex', file: 'jsx', pattern: '(function\\s+Badge|const\\s+Badge\\s*=)\\s*\\(?\\s*\\(?\\s*\\{\\s*[\\w\\s,]*label' },
            { id: 'usage', label: 'Renders Badge with props', type: 'source_regex', file: 'jsx', pattern: '<Badge\\s+[^>]*label=' },
            { id: 'three', label: 'Three badges are visible', type: 'dom_runtime', selector: '.badge', min: 3, textIncludes: '· L' },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'In which direction do props flow?',
          options: ['Child to parent', 'Parent to child', 'Between siblings', 'Both ways'],
          answer: 1,
          explanation: 'Parents pass props down to children.',
        },
        {
          prompt: 'Can a component change its own props?',
          options: ['Yes, freely', 'No — props are read-only', 'Only numbers', 'Only in useEffect'],
          answer: 1,
          explanation: 'Treat props as immutable; use state for changing data.',
        },
        {
          prompt: 'How do you pass the number 5 as a prop?',
          options: ['count="5"', 'count={5}', 'count=5', 'count:{5}'],
          answer: 1,
          explanation: 'Quotes pass strings; braces pass JavaScript values.',
        },
      ],
    },
    {
      lesson: {
        id: 'react-3',
        title: 'State with useState',
        summary: 'Remember values between renders and respond to events.',
        difficulty: 'intermediate',
        durationMinutes: 16,
        xp: 30,
        quizXp: 15,
        blocks: [
          {
            type: 'text',
            md: '**State** is data a component remembers. When you call the setter, React re-renders the component with the new value.',
          },
          {
            type: 'code',
            language: 'jsx',
            code: "import { useState } from 'react';\n\nfunction EnergyCell() {\n  const [charge, setCharge] = useState(0);\n  return (\n    <button onClick={() => setCharge(charge + 10)}>\n      Charge: {charge}%\n    </button>\n  );\n}",
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Updater functions',
            md: 'When the next value depends on the previous one, prefer `setCharge((c) => c + 10)`. It always uses the latest state, even when updates are batched.',
          },
        ],
      },
      exercises: [
        {
          id: 'react-3-ex1',
          title: 'Mission counter',
          instructions:
            'Build a counter with `useState`:\n\n1. A button with `id="increment"` that adds 1\n2. A paragraph `<p id="count">` that shows **Count: N**\n\nThe checker clicks the button three times and expects **Count: 3**.',
          mode: 'react',
          starter: {
            jsx: "import { useState } from 'react';\nimport { createRoot } from 'react-dom/client';\n\nfunction App() {\n  // add state here\n  return (\n    <main>\n      <p id=\"count\">Count: 0</p>\n      <button id=\"increment\">+1</button>\n    </main>\n  );\n}\n" + render,
            css: baseCss,
          },
          solution: {
            jsx: "import { useState } from 'react';\nimport { createRoot } from 'react-dom/client';\n\nfunction App() {\n  const [count, setCount] = useState(0);\n  return (\n    <main>\n      <p id=\"count\">Count: {count}</p>\n      <button id=\"increment\" onClick={() => setCount((c) => c + 1)}>+1</button>\n    </main>\n  );\n}\n" + render,
            css: baseCss,
          },
          hints: ['`const [count, setCount] = useState(0);`', '`onClick={() => setCount((c) => c + 1)}`'],
          xp: 50,
          checks: [
            { id: 'state', label: 'Uses useState', type: 'source_regex', file: 'jsx', pattern: 'useState\\s*\\(' },
            { id: 'onclick', label: 'Handles onClick', type: 'source_regex', file: 'jsx', pattern: 'onClick\\s*=\\s*\\{' },
            {
              id: 'runtime',
              label: 'Three clicks show “Count: 3”',
              type: 'dom_runtime',
              selector: '#count',
              textIncludes: 'Count: 3',
              before: [{ type: 'click', selector: '#increment', times: 3 }],
            },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'What does useState return?',
          options: ['Just the value', 'An array: [value, setter]', 'A promise', 'An object with get/set'],
          answer: 1,
          explanation: 'useState returns the current value and a function to update it.',
        },
        {
          prompt: 'What happens when you call a state setter?',
          options: ['Nothing until reload', 'React schedules a re-render with the new state', 'The page navigates', 'Props change'],
          answer: 1,
          explanation: 'Updating state triggers a re-render.',
        },
        {
          prompt: 'Why use setCount((c) => c + 1)?',
          options: ['It is shorter', 'It always uses the latest state value', 'It avoids re-rendering', 'It is required in React 18'],
          answer: 1,
          explanation: 'Updater functions are safe when updates are batched.',
        },
      ],
    },
    {
      lesson: {
        id: 'react-4',
        title: 'Lists & Keys',
        summary: 'Render arrays with map and stable keys; conditional UI.',
        difficulty: 'intermediate',
        durationMinutes: 16,
        xp: 30,
        quizXp: 15,
        blocks: [
          {
            type: 'text',
            md: 'Transform arrays of data into arrays of elements with `map`. Every item needs a **key** that is stable and unique among its siblings — usually an id from your data.',
          },
          {
            type: 'code',
            language: 'jsx',
            code: "const towers = [\n  { id: 'html', name: 'HTML Academy', open: true },\n  { id: 'react', name: 'React Tower', open: false },\n];\n\nfunction TowerList() {\n  return (\n    <ul>\n      {towers.map((t) => (\n        <li key={t.id} className={t.open ? 'open' : 'closed'}>\n          {t.name} {t.open && '✓'}\n        </li>\n      ))}\n    </ul>\n  );\n}",
          },
          {
            type: 'callout',
            variant: 'warning',
            md: 'Avoid using the array index as a key when items can be reordered, inserted or removed — React may then reuse the wrong component state.',
          },
        ],
      },
      exercises: [
        {
          id: 'react-4-ex1',
          title: 'Mission log',
          instructions:
            'Render the `missions` array:\n\n1. Map each mission to an `<li>` with `key={mission.id}`\n2. Give completed missions the class `done`\n3. Show the mission title inside each item',
          mode: 'react',
          starter: {
            jsx: "import { createRoot } from 'react-dom/client';\n\nconst missions = [\n  { id: 'm1', title: 'Explore the city', done: true },\n  { id: 'm2', title: 'Pass a CSS exercise', done: false },\n  { id: 'm3', title: 'Ace a knowledge check', done: true },\n];\n\nfunction App() {\n  return (\n    <ul className=\"log\">\n      {/* map the missions here */}\n    </ul>\n  );\n}\n" + render,
            css: baseCss + '.log li { padding: .4rem 0; }\n.log li.done { color: #4ade80; text-decoration: line-through; }\n',
          },
          solution: {
            jsx: "import { createRoot } from 'react-dom/client';\n\nconst missions = [\n  { id: 'm1', title: 'Explore the city', done: true },\n  { id: 'm2', title: 'Pass a CSS exercise', done: false },\n  { id: 'm3', title: 'Ace a knowledge check', done: true },\n];\n\nfunction App() {\n  return (\n    <ul className=\"log\">\n      {missions.map((mission) => (\n        <li key={mission.id} className={mission.done ? 'done' : ''}>\n          {mission.title}\n        </li>\n      ))}\n    </ul>\n  );\n}\n" + render,
            css: baseCss + '.log li { padding: .4rem 0; }\n.log li.done { color: #4ade80; text-decoration: line-through; }\n',
          },
          hints: ['`{missions.map((mission) => <li key={mission.id}>…</li>)}`', "Conditional class: `className={mission.done ? 'done' : ''}`"],
          xp: 50,
          checks: [
            { id: 'map', label: 'Uses .map()', type: 'source_regex', file: 'jsx', pattern: 'missions\\s*\\.map\\s*\\(' },
            { id: 'key', label: 'Provides a key from the data', type: 'source_regex', file: 'jsx', pattern: 'key\\s*=\\s*\\{\\s*\\w+\\.id\\s*\\}' },
            { id: 'items', label: 'Three missions are listed', type: 'dom_runtime', selector: '.log li', min: 3 },
            { id: 'done', label: 'Completed missions have the done class', type: 'dom_runtime', selector: '.log li.done', min: 2, textIncludes: 'Explore the city' },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'Why does React need keys on list items?',
          options: ['For CSS styling', 'To match items between renders', 'To sort the list', 'Keys are optional decoration'],
          answer: 1,
          explanation: 'Keys let React identify which items changed, were added or removed.',
        },
        {
          prompt: 'Which is the best key?',
          options: ['Math.random()', 'A stable id from the data', 'The array index always', 'The item’s text'],
          answer: 1,
          explanation: 'Stable, unique ids keep component state attached to the right item.',
        },
        {
          prompt: 'What does {isOpen && <Badge />} render when isOpen is false?',
          options: ['The Badge', 'Nothing', 'The text “false”', 'An error'],
          answer: 1,
          explanation: 'React renders nothing for false.',
        },
      ],
    },
    {
      lesson: {
        id: 'react-5',
        title: 'Forms & Effects',
        summary: 'Controlled inputs and synchronising with useEffect.',
        difficulty: 'advanced',
        durationMinutes: 20,
        xp: 35,
        quizXp: 20,
        blocks: [
          {
            type: 'text',
            md: 'A **controlled input** takes its value from state and reports changes through `onChange`. React state becomes the single source of truth.',
          },
          {
            type: 'code',
            language: 'jsx',
            code: "function Search() {\n  const [query, setQuery] = useState('');\n  return (\n    <input\n      value={query}\n      onChange={(event) => setQuery(event.target.value)}\n      placeholder=\"Search courses\"\n    />\n  );\n}",
          },
          { type: 'heading', text: 'Effects' },
          {
            type: 'text',
            md: '`useEffect` synchronises a component with something **outside** React — the document title, timers, subscriptions. The dependency array decides when it re-runs.',
          },
          {
            type: 'code',
            language: 'jsx',
            code: "useEffect(() => {\n  document.title = `${unread} new messages`;\n}, [unread]); // re-run only when unread changes",
          },
          {
            type: 'callout',
            variant: 'tip',
            md: 'If a value can be calculated from props or state during render, compute it directly — you don’t need an effect for it.',
          },
        ],
      },
      exercises: [
        {
          id: 'react-5-ex1',
          title: 'Personal greeting',
          instructions:
            '1. Store the name in state and make `<input id="name">` **controlled** (`value` + `onChange`)\n2. Show `<p id="greeting">Hello, NAME!</p>` — use **stranger** when the input is empty\n3. Use `useEffect` to set `document.title` to the greeting\n\nThe checker types **Ada** and expects **Hello, Ada!**.',
          mode: 'react',
          starter: {
            jsx: "import { useState, useEffect } from 'react';\nimport { createRoot } from 'react-dom/client';\n\nfunction App() {\n  return (\n    <main>\n      <label htmlFor=\"name\">Your name </label>\n      <input id=\"name\" />\n      <p id=\"greeting\">Hello, stranger!</p>\n    </main>\n  );\n}\n" + render,
            css: baseCss,
          },
          solution: {
            jsx: "import { useState, useEffect } from 'react';\nimport { createRoot } from 'react-dom/client';\n\nfunction App() {\n  const [name, setName] = useState('');\n  const greeting = `Hello, ${name || 'stranger'}!`;\n\n  useEffect(() => {\n    document.title = greeting;\n  }, [greeting]);\n\n  return (\n    <main>\n      <label htmlFor=\"name\">Your name </label>\n      <input id=\"name\" value={name} onChange={(e) => setName(e.target.value)} />\n      <p id=\"greeting\">{greeting}</p>\n    </main>\n  );\n}\n" + render,
            css: baseCss,
          },
          hints: ['`value={name}` and `onChange={(e) => setName(e.target.value)}`', "`name || 'stranger'` falls back when the string is empty."],
          xp: 60,
          checks: [
            { id: 'value', label: 'The input value comes from state', type: 'source_regex', file: 'jsx', pattern: 'value\\s*=\\s*\\{\\s*\\w+\\s*\\}' },
            { id: 'onchange', label: 'Changes are handled with onChange', type: 'source_regex', file: 'jsx', pattern: 'onChange\\s*=\\s*\\{' },
            { id: 'effect', label: 'Uses useEffect', type: 'source_regex', file: 'jsx', pattern: 'useEffect\\s*\\(' },
            { id: 'title', label: 'Sets document.title', type: 'source_regex', file: 'jsx', pattern: 'document\\.title\\s*=' },
            { id: 'empty', label: 'Greets a stranger when empty', type: 'dom_runtime', selector: '#greeting', textIncludes: 'Hello, stranger!' },
            {
              id: 'typed',
              label: 'Typing “Ada” shows “Hello, Ada!”',
              type: 'dom_runtime',
              selector: '#greeting',
              textIncludes: 'Hello, Ada!',
              before: [{ type: 'input', selector: '#name', value: 'Ada' }],
            },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'What makes an input “controlled”?',
          options: ['It has an id', 'Its value comes from state and changes go through onChange', 'It is inside a form', 'It uses a ref'],
          answer: 1,
          explanation: 'React state drives the value; onChange updates the state.',
        },
        {
          prompt: 'When does useEffect(fn, [a]) re-run?',
          options: ['Every render', 'Only when a changes (after the first run)', 'Never', 'Only on unmount'],
          answer: 1,
          explanation: 'The dependency array limits re-runs to changes of listed values.',
        },
        {
          prompt: 'Do you need an effect to compute fullName from first and last name state?',
          options: ['Yes, always', 'No — compute it during render', 'Only with useMemo', 'Only in class components'],
          answer: 1,
          explanation: 'Derived values should be calculated directly while rendering.',
        },
      ],
    },
  ],
};
