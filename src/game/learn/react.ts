import { tx } from '@/i18n';
import type { LearnCard } from '../types';

const card = '.card{border:1px solid #cbd5e1;border-radius:12px;padding:10px 14px;display:inline-block}button{font:inherit;padding:6px 14px;border-radius:8px;border:1px solid #0ea5e9;background:#e0f2fe}';

export const reactLearn: Record<string, LearnCard[]> = {
  'react-1': [
    {
      icon: '🧩',
      title: tx('Komponent', 'Компонент', 'Component'),
      text: tx(
        'Komponent — interfeys (JSX) qaytaradigan funksiya. Nomi katta harf bilan boshlanadi: HeroCard. Uni teg kabi ishlatamiz: <Hello />.',
        'Компонент — функция, которая возвращает интерфейс (JSX). Имя с большой буквы: HeroCard. Используют его как тег: <Hello />.',
        'A component is a function that returns UI (JSX). Its name starts with a capital letter: HeroCard. Use it like a tag: <Hello />.',
      ),
      picture: {
        kind: 'parts',
        code: 'function Hello() {\n  return <h1>Hello!</h1>;\n}\n\n<Hello />',
        lang: 'jsx',
        parts: [
          { text: 'Hello', label: tx('nomi katta harfdan', 'имя с большой буквы', 'a capitalised name') },
          { text: '<h1>Hello!</h1>', label: tx('qaytariladigan JSX', 'возвращаемый JSX', 'the JSX it returns') },
          { text: '<Hello />', label: tx('komponentni ishlatish', 'использование компонента', 'using the component') },
        ],
      },
      example: { code: 'function Welcome() {\n  return <h1>Welcome, coder!</h1>;\n}\n\n<Welcome />', lang: 'jsx', result: { kind: 'browser', html: '<h1>Welcome, coder!</h1>' } },
    },
    {
      icon: '🏷️',
      title: tx('JSX qoidalari', 'Правила JSX', 'JSX rules'),
      text: tx(
        'JSX da class oʻrniga className yoziladi. Har bir teg yopilishi shart: <img />. { } ichida JavaScript qiymat yoziladi.',
        'В JSX вместо class пишут className. Каждый тег обязательно закрывается: <img />. В { } пишут значение JavaScript.',
        'In JSX write className instead of class. Every tag must be closed: <img />. Inside { } goes a JavaScript value.',
      ),
      picture: {
        kind: 'parts',
        code: '<div className="card">\n  <h2>{name}</h2>\n  <img src="cat.png" alt="Cat" />\n</div>',
        lang: 'jsx',
        parts: [
          { text: 'className="card"', label: tx('CSS klassi', 'CSS-класс', 'a CSS class') },
          { text: '{name}', label: tx('JavaScript qiymati', 'значение из JavaScript', 'a JavaScript value') },
          { text: '/>', label: tx('teg yopiladi', 'тег закрыт', 'the tag is closed') },
        ],
      },
      example: {
        code: 'const name = "Nova";\n\n<div className="card">\n  <h2>{name}</h2>\n  <img src="cat.png" alt="Cat" />\n</div>',
        lang: 'jsx',
        result: { kind: 'browser', html: '<div class="card"><h2>Nova</h2><img src="cat.png" alt="Cat"></div>', css: card },
      },
    },
    {
      icon: '🗂️',
      title: tx('Eslab qoling', 'Запомни', 'Remember'),
      text: tx(
        'Toʻrt asosiy belgi: komponent tegi, { } dagi qiymat, className va onClick (bosish hodisasi).',
        'Четыре главных знака: тег компонента, значение в { }, className и onClick (событие нажатия).',
        'Four key pieces: a component tag, a value in { }, className, and onClick (the click event).',
      ),
      picture: {
        kind: 'table',
        rows: [
          ['<Hello />', tx('🧩 komponent', '🧩 компонент', '🧩 a component')],
          ['{count}', tx('🔢 JavaScript qiymat', '🔢 значение JavaScript', '🔢 a JavaScript value')],
          ['className', tx('🎨 CSS klassi', '🎨 CSS-класс', '🎨 a CSS class')],
          ['onClick', tx('👆 bosilganda', '👆 при нажатии', '👆 on click')],
        ],
      },
      example: {
        code: 'const count = 3;\n\n<button className="btn" onClick={play}>\n  Lives: {count}\n</button>',
        lang: 'jsx',
        result: { kind: 'browser', html: '<button class="btn">Lives: 3</button>', css: card },
      },
    },
  ],
  'react-2': [
    {
      icon: '📨',
      title: tx('Props', 'Props', 'Props'),
      text: tx(
        'Props — komponentga tashqaridan beriladigan maʼlumot: <Card title="Hi" />. Komponent ularni qabul qiladi: function Card({ title }).',
        'Props — данные, которые передают компоненту снаружи: <Card title="Hi" />. Компонент принимает их так: function Card({ title }).',
        'Props are data passed into a component: <Card title="Hi" />. The component receives them: function Card({ title }).',
      ),
      picture: {
        kind: 'parts',
        code: 'function Card({ title }) {\n  return <h2>{title}</h2>;\n}\n\n<Card title="Hi" />',
        lang: 'jsx',
        parts: [
          { text: '{ title }', label: tx('propni qabul qilish', 'приём пропа', 'receive the prop') },
          { text: '{title}', label: tx('uni koʻrsatish', 'показ значения', 'show it') },
          { text: 'title="Hi"', label: tx('propni berish (nomi bir xil!)', 'передача пропа (то же имя!)', 'pass the prop (same name!)') },
        ],
      },
      example: { code: 'function Badge({ label }) {\n  return <b>🏅 {label}</b>;\n}\n\n<Badge label="Silver" />', lang: 'jsx', result: { kind: 'browser', html: '<b>🏅 Silver</b>' } },
    },
    {
      icon: '🔢',
      title: tx('Matn va son props', 'Строки и числа в props', 'Text & number props'),
      text: tx(
        'Matn qoʻshtirnoqda beriladi: name="Nova". Son yoki JavaScript qiymat — { } ichida: count={5}.',
        'Строку передают в кавычках: name="Nova". Число или значение JavaScript — в { }: count={5}.',
        'Text is passed in quotes: name="Nova". A number or JavaScript value goes in { }: count={5}.',
      ),
      picture: {
        kind: 'table',
        rows: [
          ['name="Nova"', tx('matn', 'строка', 'text')],
          ['count={5}', tx('son', 'число', 'a number')],
          ['done={true}', tx('true / false', 'true / false', 'true / false')],
        ],
      },
      example: {
        code: 'function Score({ points, bonus }) {\n  return <p>{points + bonus}</p>;\n}\n\n<Score points={7} bonus={3} />',
        lang: 'jsx',
        result: { kind: 'browser', html: '<p>10</p>' },
      },
    },
  ],
  'react-3': [
    {
      icon: '🧠',
      title: tx('useState — holat', 'useState — состояние', 'useState — state'),
      text: tx(
        'useState qiymatni eslab qoladi. const [count, setCount] = useState(0): count — joriy qiymat, setCount — uni oʻzgartiradi va ekranni yangilaydi.',
        'useState запоминает значение. const [count, setCount] = useState(0): count — текущее значение, setCount — меняет его и обновляет экран.',
        'useState remembers a value. const [count, setCount] = useState(0): count is the current value; setCount changes it and updates the screen.',
      ),
      picture: {
        kind: 'parts',
        code: 'const [count, setCount] = useState(0);',
        lang: 'jsx',
        parts: [
          { text: 'count', label: tx('joriy qiymat', 'текущее значение', 'the current value') },
          { text: 'setCount', label: tx('oʻzgartiruvchi funksiya', 'функция для изменения', 'the setter function') },
          { text: 'useState(0)', label: tx('boshlangʻich qiymat 0', 'начальное значение 0', 'starting value 0') },
        ],
      },
      example: {
        code: 'const [lives, setLives] = useState(3);\nreturn <p>❤️ {lives}</p>;',
        lang: 'jsx',
        result: { kind: 'browser', html: '<p>❤️ 3</p>' },
      },
    },
    {
      icon: '👆',
      title: tx('Holatni oʻzgartirish', 'Изменение состояния', 'Changing state'),
      text: tx(
        'Holatni toʻgʻridan-toʻgʻri oʻzgartirib boʻlmaydi: n = n + 1 ishlamaydi. Faqat setter: setN(n + 1). Odatda onClick ichida chaqiriladi.',
        'Состояние нельзя менять напрямую: n = n + 1 не сработает. Только через сеттер: setN(n + 1). Обычно его вызывают в onClick.',
        'You can’t change state directly: n = n + 1 won’t work. Use the setter: setN(n + 1), usually inside onClick.',
      ),
      example: {
        code: 'const [on, setOn] = useState(false);\nreturn (\n  <button onClick={() => setOn(!on)}>\n    {on ? "ON" : "OFF"}\n  </button>\n);',
        lang: 'jsx',
        caption: tx('bosilgandan keyin OFF → ON', 'после нажатия OFF → ON', 'after a click OFF → ON'),
        result: { kind: 'browser', html: '<button>ON</button>', css: card },
      },
    },
    {
      icon: '🎛️',
      title: tx('Boshlangʻich qiymatlar', 'Начальные значения', 'Starting values'),
      text: tx(
        'useState(…) ichiga istalgan boshlangʻich qiymat beriladi: son, matn, roʻyxat yoki true/false.',
        'В useState(…) можно передать любое начальное значение: число, строку, список или true/false.',
        'useState(…) takes any starting value: a number, text, a list or true/false.',
      ),
      picture: {
        kind: 'table',
        rows: [
          ['useState(0)', tx('0 — son', '0 — число', '0 — a number')],
          ["useState('')", tx('"" — boʻsh matn', '"" — пустая строка', '"" — empty text')],
          ['useState([])', tx('[ ] — boʻsh roʻyxat', '[ ] — пустой список', '[ ] — an empty list')],
          ['useState(false)', tx('✗ — false (yoʻq)', '✗ — false (нет)', '✗ — false (no)')],
        ],
      },
      example: {
        code: 'const [name, setName] = useState("");\nconst [items, setItems] = useState([]);\nreturn <p>{items.length} items</p>;',
        lang: 'jsx',
        result: { kind: 'browser', html: '<p>0 items</p>' },
      },
    },
  ],
  'react-4': [
    {
      icon: '📋',
      title: tx('map() bilan roʻyxat', 'Список через map()', 'Lists with map()'),
      text: tx(
        'items.map() har bir elementdan JSX yasaydi. Har bir elementga noyob key kerak, masalan key={item.id}.',
        'items.map() делает JSX из каждого элемента. Каждому элементу нужен уникальный key, например key={item.id}.',
        'items.map() turns each item into JSX. Every item needs a unique key, for example key={item.id}.',
      ),
      picture: {
        kind: 'parts',
        code: '{fruits.map((f) => (\n  <li key={f}>{f}</li>\n))}',
        lang: 'jsx',
        parts: [
          { text: '.map(', label: tx('har bir element uchun', 'для каждого элемента', 'for every item') },
          { text: 'key={f}', label: tx('noyob kalit (shart!)', 'уникальный ключ (обязательно!)', 'a unique key (required!)') },
        ],
      },
      example: {
        code: 'const fruits = ["🍎", "🍌", "🍇"];\n\n<ul>\n  {fruits.map((f) => <li key={f}>{f}</li>)}\n</ul>',
        lang: 'jsx',
        result: { kind: 'browser', html: '<ul><li>🍎</li><li>🍌</li><li>🍇</li></ul>' },
      },
    },
    {
      icon: '❓',
      title: tx('Shartli koʻrsatish', 'Условный показ', 'Showing things conditionally'),
      text: tx(
        '{ok && "✅"} — ok true boʻlsa koʻrsatadi, aks holda hech narsa. {a ? "X" : "Y"} — shartga qarab ikkisidan birini tanlaydi.',
        '{ok && "✅"} показывает, если ok true, иначе ничего. {a ? "X" : "Y"} выбирает одно из двух по условию.',
        '{ok && "✅"} shows it when ok is true, otherwise nothing. {a ? "X" : "Y"} picks one of two by the condition.',
      ),
      picture: {
        kind: 'table',
        head: [tx('JSX', 'JSX', 'JSX'), tx('Ekranda', 'На экране', 'On screen')],
        rows: [
          ['{true && "✅"}', '✅'],
          ['{false && "✅"}', tx('(hech narsa)', '(ничего)', '(nothing)')],
          ['{2 > 0 ? "Play" : "Game over"}', 'Play'],
        ],
      },
      example: {
        code: 'const lives = 2;\nconst win = false;\nreturn (\n  <p>\n    {lives > 0 ? "Play" : "Game over"} {win && "🏆"}\n  </p>\n);',
        lang: 'jsx',
        result: { kind: 'browser', html: '<p>Play </p>' },
      },
    },
  ],
  'react-5': [
    {
      icon: '⏰',
      title: tx('useEffect', 'useEffect', 'useEffect'),
      text: tx(
        'useEffect ekran chizilgandan keyin tashqi ish bajaradi (sarlavha, taymer). Oxiridagi massiv — qachon qayta ishlashi: [xp] — xp oʻzgarganda, [] — faqat bir marta.',
        'useEffect выполняет внешние действия после отрисовки (заголовок, таймер). Массив в конце — когда повторять: [xp] — при изменении xp, [] — только один раз.',
        'useEffect does outside work after rendering (titles, timers). The array at the end says when to rerun: [xp] when xp changes, [] only once.',
      ),
      picture: {
        kind: 'parts',
        code: 'useEffect(() => {\n  document.title = `XP: ${xp}`;\n}, [xp]);',
        lang: 'jsx',
        parts: [
          { text: 'useEffect', label: tx('effekt hooki', 'хук эффекта', 'the effect hook') },
          { text: 'document.title', label: tx('tashqi ish: tab sarlavhasi', 'внешнее действие: заголовок вкладки', 'outside work: the tab title') },
          { text: '[xp]', label: tx('xp oʻzgarganda qayta ishlaydi', 'повторить при изменении xp', 'rerun when xp changes') },
        ],
      },
      example: {
        code: 'const [xp, setXp] = useState(30);\nuseEffect(() => {\n  document.title = `XP: ${xp}`;\n}, [xp]);',
        lang: 'jsx',
        caption: tx('tab sarlavhasiga qarang', 'посмотри на заголовок вкладки', 'look at the tab title'),
        result: { kind: 'browser', html: '<p>XP: 30</p>', title: 'XP: 30' },
      },
    },
    {
      icon: '⌨️',
      title: tx('Boshqariladigan input', 'Управляемый input', 'Controlled input'),
      text: tx(
        'value={name} va onChange={(e) => setName(e.target.value)} — har bir harf holatga yoziladi. {q || "Empty"} — q boʻsh boʻlsa "Empty" chiqadi.',
        'value={name} и onChange={(e) => setName(e.target.value)} — каждая буква попадает в состояние. {q || "Empty"} — если q пустая, покажет "Empty".',
        'value={name} and onChange={(e) => setName(e.target.value)} put every letter into state. {q || "Empty"} shows "Empty" when q is empty.',
      ),
      picture: {
        kind: 'parts',
        code: '<input value={name} onChange={(e) => setName(e.target.value)} />',
        lang: 'jsx',
        parts: [
          { text: 'value={name}', label: tx('koʻrsatiladigan qiymat', 'показываемое значение', 'the shown value') },
          { text: 'onChange', label: tx('yozilganda ishlaydi', 'срабатывает при вводе', 'runs when you type') },
          { text: 'e.target.value', label: tx('yozilgan matn', 'введённый текст', 'the typed text') },
        ],
      },
      example: {
        code: 'const [name, setName] = useState("Ada");\nreturn (\n  <>\n    <input value={name} onChange={(e) => setName(e.target.value)} />\n    <p>Hi, {name || "stranger"}</p>\n  </>\n);',
        lang: 'jsx',
        result: { kind: 'browser', html: '<input value="Ada">\n<p>Hi, Ada</p>' },
      },
    },
  ],
};
