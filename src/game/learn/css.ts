import { tx } from '@/i18n';
import type { LearnCard } from '../types';

const cells = (n: number) => Array.from({ length: n }, (_, i) => `  <div>${i + 1}</div>`).join('\n');
const cellCss = 'div>div{background:#c7d2fe;border-radius:6px;padding:8px;text-align:center;font-weight:600}';

export const cssLearn: Record<string, LearnCard[]> = {
  'css-1': [
    {
      icon: '🎯',
      title: tx('CSS qoidasi', 'Правило CSS', 'A CSS rule'),
      text: tx(
        'CSS koʻrinishni beradi. Qoida: selektor { xususiyat: qiymat; }. Qavslar { } ochiladi va yopiladi, har bir qator ; bilan tugaydi.',
        'CSS задаёт внешний вид. Правило: селектор { свойство: значение; }. Скобки { } открываются и закрываются, каждая строка кончается на ;.',
        'CSS controls how things look. A rule is selector { property: value; }. Braces { } open and close, and every line ends with ;.',
      ),
      picture: {
        kind: 'parts',
        code: '.title {\n  color: red;\n}',
        lang: 'css',
        parts: [
          { text: '.title', label: tx('selektor — kimga', 'селектор — кому', 'selector — who') },
          { text: '{', label: tx('qoida boshlanadi', 'начало правила', 'the rule starts') },
          { text: 'color', label: tx('xususiyat — nimani', 'свойство — что', 'property — what') },
          { text: 'red;', label: tx('qiymat va ; (shart!)', 'значение и ; (обязательно!)', 'value and ; (required!)') },
        ],
      },
      example: { code: '.title {\n  color: tomato;\n}', lang: 'css', result: { kind: 'browser', html: '<h1 class="title">Code World</h1>\n<p>Plain text</p>' } },
    },
    {
      icon: '🔍',
      title: tx('Selektorlar', 'Селекторы', 'Selectors'),
      text: tx(
        'Teg nomi — shu teglarning hammasi (p). Nuqta — klass: .card → class="card". Panjara — id: #logo → id="logo".',
        'Имя тега — все такие теги (p). Точка — класс: .card → class="card". Решётка — id: #logo → id="logo".',
        'A tag name selects all those tags (p). A dot is a class: .card → class="card". A hash is an id: #logo → id="logo".',
      ),
      picture: {
        kind: 'table',
        head: [tx('Selektor', 'Селектор', 'Selector'), tx('Kimni tanlaydi', 'Что выбирает', 'What it selects')],
        rows: [
          ['p', tx('barcha <p> teglar', 'все теги <p>', 'every <p> tag')],
          ['.card', tx('class="card" boʻlganlar', 'элементы с class="card"', 'elements with class="card"')],
          ['#logo', tx('id="logo" boʻlgan bitta element', 'один элемент с id="logo"', 'the one element with id="logo"')],
        ],
      },
      example: {
        code: '#logo {\n  color: royalblue;\n}\n.card {\n  background: lightyellow;\n}',
        lang: 'css',
        result: { kind: 'browser', html: '<h2 id="logo">Logo</h2>\n<p class="card">Card 1</p>\n<p class="card">Card 2</p>' },
      },
    },
    {
      icon: '🎨',
      title: tx('Rang nomlari', 'Названия цветов', 'Color names'),
      text: tx(
        'color — matn rangi, background — fon rangi. Rangni nomi bilan yozish mumkin: tomato, royalblue, seagreen…',
        'color — цвет текста, background — цвет фона. Цвет можно писать названием: tomato, royalblue, seagreen…',
        'color is the text color and background the background color. You can write a color by name: tomato, royalblue, seagreen…',
      ),
      picture: {
        kind: 'compare',
        preview: 'text',
        items: [
          { code: 'color: tomato;', style: { color: 'tomato' } },
          { code: 'color: royalblue;', style: { color: 'royalblue' } },
          { code: 'color: seagreen;', style: { color: 'seagreen' } },
        ],
      },
      example: { code: 'p {\n  color: white;\n  background: seagreen;\n}', lang: 'css', result: { kind: 'browser', html: '<p>Green background</p>' } },
    },
    {
      icon: '🌈',
      title: tx('HEX ranglar', 'HEX-цвета', 'HEX colors'),
      text: tx(
        '#RRGGBB — qizil, yashil va koʻk ulushlari (00 dan ff gacha). #ff0000 — toza qizil.',
        '#RRGGBB — доли красного, зелёного и синего (от 00 до ff). #ff0000 — чистый красный.',
        '#RRGGBB is the amount of red, green and blue (00 to ff). #ff0000 is pure red.',
      ),
      picture: {
        kind: 'table',
        rows: [
          ['#ff0000', tx('🟥 qizil', '🟥 красный', '🟥 red')],
          ['#00ff00', tx('🟩 yashil', '🟩 зелёный', '🟩 green')],
          ['#0000ff', tx('🟦 koʻk', '🟦 синий', '🟦 blue')],
          ['#ffff00', tx('🟨 sariq (qizil + yashil)', '🟨 жёлтый (красный + зелёный)', '🟨 yellow (red + green)')],
        ],
      },
      example: {
        code: '.a { background: #ff0000; }\n.b { background: #00ff00; }\n.c { background: #0000ff; }',
        lang: 'css',
        result: { kind: 'browser', html: '<p class="a">#ff0000</p>\n<p class="b">#00ff00</p>\n<p class="c" style="color:white">#0000ff</p>' },
      },
    },
  ],
  'css-2': [
    {
      icon: '📦',
      title: tx('Quti modeli', 'Блочная модель', 'The box model'),
      text: tx(
        'Har bir element — quti. Ichida kontent, uning atrofida padding (ichki boʻshliq), keyin border (chegara), eng tashqarida margin (tashqi boʻshliq).',
        'Каждый элемент — коробка. Внутри контент, вокруг padding (внутренний отступ), затем border (рамка), снаружи margin (внешний отступ).',
        'Every element is a box: the content, then padding (inner space) around it, then the border, and margin (outer space) outside.',
      ),
      picture: { kind: 'boxmodel' },
      example: {
        code: '.box {\n  padding: 16px;\n  border: 4px solid teal;\n  margin: 12px;\n}',
        lang: 'css',
        result: { kind: 'browser', html: '<div class="box">Box</div>\n<div class="box">Box 2</div>' },
      },
    },
    {
      icon: '🖌️',
      title: tx('Chegara turlari', 'Виды рамок', 'Border styles'),
      text: tx(
        'border: qalinlik uslub rang. Uslublar: solid — yaxlit, dashed — shtrix, dotted — nuqtali, double — ikki chiziq.',
        'border: толщина стиль цвет. Стили: solid — сплошная, dashed — штрих, dotted — точки, double — двойная.',
        'border: width style color. Styles: solid, dashed, dotted and double (two lines).',
      ),
      picture: {
        kind: 'compare',
        preview: 'box',
        items: [
          { code: 'border: 4px solid', style: { border: '4px solid #fbbf24' } },
          { code: 'border: 4px dashed', style: { border: '4px dashed #fbbf24' } },
          { code: 'border: 4px dotted', style: { border: '4px dotted #fbbf24' } },
          { code: 'border: 6px double', style: { border: '6px double #fbbf24' } },
        ],
      },
      example: { code: '.card {\n  border: 3px dashed coral;\n  padding: 10px;\n}', lang: 'css', result: { kind: 'browser', html: '<div class="card">Dashed card</div>' } },
    },
    {
      icon: '⚪',
      title: tx('Burchaklar va box-sizing', 'Углы и box-sizing', 'Corners & box-sizing'),
      text: tx(
        'border-radius burchaklarni yumaloqlaydi: 50% — doira. box-sizing: border-box — padding va border kenglik ichida hisoblanadi.',
        'border-radius скругляет углы: 50% — круг. box-sizing: border-box — padding и border входят в ширину.',
        'border-radius rounds the corners: 50% makes a circle. box-sizing: border-box counts padding and border inside the width.',
      ),
      picture: {
        kind: 'compare',
        preview: 'box',
        items: [
          { code: 'border-radius: 0;', style: { borderRadius: '0' } },
          { code: 'border-radius: 12px;', style: { borderRadius: '12px' } },
          { code: 'border-radius: 50%;', style: { borderRadius: '50%' } },
        ],
      },
      example: {
        code: '* {\n  box-sizing: border-box;\n}\n.avatar {\n  width: 80px;\n  height: 80px;\n  border-radius: 50%;\n  background: orchid;\n}',
        lang: 'css',
        result: { kind: 'browser', html: '<div class="avatar"></div>' },
      },
    },
  ],
  'css-3': [
    {
      icon: '🔠',
      title: tx('Oʻlcham va qalinlik', 'Размер и жирность', 'Size & weight'),
      text: tx(
        'font-size — matn oʻlchami: 1rem — oddiy, 2rem — ikki barobar katta. font-weight: bold — qalin matn.',
        'font-size — размер текста: 1rem — обычный, 2rem — вдвое больше. font-weight: bold — жирный текст.',
        'font-size is the text size: 1rem is normal, 2rem twice as big. font-weight: bold makes text bold.',
      ),
      picture: {
        kind: 'compare',
        preview: 'text',
        items: [
          { code: 'font-size: 1rem;', style: { fontSize: '1rem' } },
          { code: 'font-size: 1.5rem;', style: { fontSize: '1.5rem' } },
          { code: 'font-weight: bold;', style: { fontWeight: 'bold' } },
        ],
      },
      example: { code: 'h1 {\n  font-size: 2rem;\n  font-weight: bold;\n}\np {\n  font-size: 1rem;\n}', lang: 'css', result: { kind: 'browser', html: '<h1>Big title</h1>\n<p>Normal text</p>' } },
    },
    {
      icon: '↔️',
      title: tx('Tekislash', 'Выравнивание', 'Alignment'),
      text: tx(
        'text-align matnni joylashtiradi: left — chapga, center — oʻrtaga, right — oʻngga.',
        'text-align выравнивает текст: left — влево, center — по центру, right — вправо.',
        'text-align places the text: left, center or right.',
      ),
      picture: {
        kind: 'compare',
        preview: 'text',
        items: [
          { code: 'text-align: left;', style: { textAlign: 'left' } },
          { code: 'text-align: center;', style: { textAlign: 'center' } },
          { code: 'text-align: right;', style: { textAlign: 'right' } },
        ],
      },
      example: { code: '.price {\n  text-align: right;\n}', lang: 'css', result: { kind: 'browser', html: '<p>Item</p>\n<p class="price">$9.99</p>' } },
    },
    {
      icon: '✨',
      title: tx('Uslub va bezak', 'Стиль и оформление', 'Style & decoration'),
      text: tx(
        'font-style: italic — qiya. text-decoration: underline — tagiga chiziq, line-through — ustidan chiziq. text-transform: uppercase — KATTA HARFLAR.',
        'font-style: italic — курсив. text-decoration: underline — подчёркнутый, line-through — зачёркнутый. text-transform: uppercase — ЗАГЛАВНЫЕ.',
        'font-style: italic slants text. text-decoration: underline or line-through draws a line. text-transform: uppercase makes CAPITALS.',
      ),
      picture: {
        kind: 'compare',
        preview: 'text',
        items: [
          { code: 'font-style: italic;', style: { fontStyle: 'italic' } },
          { code: 'text-decoration: underline;', style: { textDecoration: 'underline' } },
          { code: 'text-decoration: line-through;', style: { textDecoration: 'line-through' } },
          { code: 'text-transform: uppercase;', style: { textTransform: 'uppercase' } },
        ],
      },
      example: {
        code: '.quote {\n  font-style: italic;\n}\n.old {\n  text-decoration: line-through;\n}',
        lang: 'css',
        result: { kind: 'browser', html: '<p class="quote">“Code is poetry.”</p>\n<p class="old">$20</p>\n<p>$9</p>' },
      },
    },
  ],
  'css-4': [
    {
      icon: '➡️',
      title: tx('display: flex', 'display: flex', 'display: flex'),
      text: tx(
        'display: flex ichki elementlarni bir qatorga teradi. gap — ular orasidagi masofa.',
        'display: flex выстраивает вложенные элементы в ряд. gap — расстояние между ними.',
        'display: flex lines up the children in a row. gap is the space between them.',
      ),
      picture: {
        kind: 'compare',
        preview: 'row',
        items: [
          { code: 'gap: 0;', style: { gap: '0' } },
          { code: 'gap: 16px;', style: { gap: '16px' } },
        ],
      },
      example: {
        code: '.row {\n  display: flex;\n  gap: 8px;\n}',
        lang: 'css',
        result: { kind: 'browser', html: '<div class="row">\n  <div>A</div>\n  <div>B</div>\n  <div>C</div>\n</div>', css: '.row{display:flex;gap:8px}' + cellCss },
      },
    },
    {
      icon: '↕️',
      title: tx('Yoʻnalish', 'Направление', 'Direction'),
      text: tx(
        'flex-direction: row — qator boʻylab (odatiy), column — ustun boʻylab, yuqoridan pastga.',
        'flex-direction: row — в строку (по умолчанию), column — в столбик, сверху вниз.',
        'flex-direction: row goes across (the default); column goes top to bottom.',
      ),
      picture: {
        kind: 'compare',
        preview: 'row',
        items: [
          { code: 'flex-direction: row;', style: { flexDirection: 'row' } },
          { code: 'flex-direction: column;', style: { flexDirection: 'column' } },
        ],
      },
      example: {
        code: '.menu {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}',
        lang: 'css',
        result: { kind: 'browser', html: '<div class="menu">\n  <div>Home</div>\n  <div>Map</div>\n  <div>Quests</div>\n</div>', css: '.menu{display:flex;flex-direction:column;gap:4px}' + cellCss },
      },
    },
    {
      icon: '📐',
      title: tx('justify-content', 'justify-content', 'justify-content'),
      text: tx(
        'justify-content elementlarni qator boʻylab joylaydi: flex-start — boshida, center — oʻrtada, flex-end — oxirida, space-between — teng tarqatib.',
        'justify-content расставляет элементы вдоль ряда: flex-start — в начале, center — по центру, flex-end — в конце, space-between — равномерно.',
        'justify-content places items along the row: flex-start (start), center, flex-end (end), space-between (spread out).',
      ),
      picture: {
        kind: 'compare',
        preview: 'row',
        items: [
          { code: 'justify-content: flex-start;', style: { justifyContent: 'flex-start' } },
          { code: 'justify-content: center;', style: { justifyContent: 'center' } },
          { code: 'justify-content: flex-end;', style: { justifyContent: 'flex-end' } },
          { code: 'justify-content: space-between;', style: { justifyContent: 'space-between' } },
        ],
      },
      example: {
        code: '.bar {\n  display: flex;\n  justify-content: space-between;\n}',
        lang: 'css',
        result: { kind: 'browser', html: '<div class="bar">\n  <div>Logo</div>\n  <div>Menu</div>\n</div>', css: '.bar{display:flex;justify-content:space-between}' + cellCss },
      },
    },
  ],
  'css-5': [
    {
      icon: '▦',
      title: tx('display: grid', 'display: grid', 'display: grid'),
      text: tx(
        'Grid — katakli maket. grid-template-columns ustunlarni belgilaydi: 1fr — boʻsh joyning bitta ulushi. 1fr 1fr 1fr — uchta teng ustun.',
        'Grid — сетка. grid-template-columns задаёт колонки: 1fr — одна доля места. 1fr 1fr 1fr — три равные колонки.',
        'Grid is a layout of cells. grid-template-columns sets the columns: 1fr is one share of the space, so 1fr 1fr 1fr is three equal columns.',
      ),
      picture: {
        kind: 'compare',
        preview: 'grid',
        items: [
          { code: 'grid-template-columns: 1fr;', style: { gridTemplateColumns: '1fr' } },
          { code: 'grid-template-columns: 1fr 1fr;', style: { gridTemplateColumns: '1fr 1fr' } },
          { code: 'grid-template-columns: 1fr 1fr 1fr;', style: { gridTemplateColumns: '1fr 1fr 1fr' } },
        ],
      },
      example: {
        code: '.grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;\n  gap: 8px;\n}',
        lang: 'css',
        result: { kind: 'browser', html: `<div class="grid">\n${cells(6)}\n</div>`, css: '.grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}' + cellCss },
      },
    },
    {
      icon: '🔁',
      title: tx('repeat() va birliklar', 'repeat() и единицы', 'repeat() & units'),
      text: tx(
        'repeat(3, 1fr) — bu 1fr 1fr 1fr ning qisqasi. Oʻlchamlarga birlik kerak: gap: 16px (faqat 16 emas!).',
        'repeat(3, 1fr) — короткая запись 1fr 1fr 1fr. Размерам нужна единица: gap: 16px (не просто 16!).',
        'repeat(3, 1fr) is short for 1fr 1fr 1fr. Sizes need a unit: gap: 16px (not just 16!).',
      ),
      picture: {
        kind: 'table',
        head: [tx('Kod', 'Код', 'Code'), tx('Ustunlar', 'Колонки', 'Columns')],
        rows: [
          ['repeat(1, 1fr)', '▮'],
          ['repeat(2, 1fr)', '▮▮'],
          ['repeat(3, 1fr)', '▮▮▮'],
          ['repeat(4, 1fr)', '▮▮▮▮'],
        ],
      },
      example: {
        code: '.gallery {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  gap: 16px;\n}',
        lang: 'css',
        result: { kind: 'browser', html: `<div class="gallery">\n${cells(8)}\n</div>`, css: '.gallery{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}' + cellCss },
      },
    },
    {
      icon: '📱',
      title: tx('@media — moslashuvchanlik', '@media — адаптивность', '@media — responsive'),
      text: tx(
        '@media ekran oʻlchamiga qarab uslub beradi. (min-width: 768px) — ekran kamida 768px keng boʻlsa ishlaydi: telefonda bir xil, kompyuterda boshqacha.',
        '@media задаёт стили по размеру экрана. (min-width: 768px) срабатывает, если экран шире 768px: на телефоне одно, на компьютере другое.',
        '@media applies styles by screen size. (min-width: 768px) only applies on screens at least 768px wide — one look on phones, another on computers.',
      ),
      picture: {
        kind: 'parts',
        code: '@media (min-width: 768px) {\n  .menu { display: flex; }\n}',
        lang: 'css',
        parts: [
          { text: '@media', label: tx('shartli qoida', 'условное правило', 'a conditional rule') },
          { text: 'min-width: 768px', label: tx('ekran kamida 768px boʻlsa', 'если экран от 768px', 'if the screen is 768px or wider') },
          { text: '.menu { display: flex; }', label: tx('shunda ishlaydigan uslub', 'стиль, который тогда работает', 'the style that applies then') },
        ],
      },
      example: {
        code: '.menu {\n  display: grid;\n  gap: 4px;\n}\n@media (min-width: 768px) {\n  .menu {\n    display: flex;\n  }\n}',
        lang: 'css',
        caption: tx('ekran kengligiga bogʻliq', 'зависит от ширины экрана', 'depends on your screen width'),
        result: { kind: 'browser', html: '<div class="menu">\n  <div>Home</div>\n  <div>Map</div>\n  <div>Quests</div>\n</div>', css: '.menu{display:grid;gap:4px}@media (min-width:768px){.menu{display:flex}}' + cellCss },
      },
    },
  ],
};
