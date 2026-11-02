import { tx } from '@/i18n';
import type { Zone } from '../types';

const cardHtml = '<div class="card">\n  <h2 class="title">Code World</h2>\n  <p>Level 5 · 1200 XP</p>\n</div>\n';
const baseCss = 'body {\n  font-family: system-ui, sans-serif;\n  padding: 24px;\n  background: #0b1220;\n  color: #e2e8f0;\n}\n';

export const cssZone: Zone = {
  id: 'css',
  nameKey: 'b.css',
  buildingId: 'css-studio',
  symbol: '{ }',
  accent: '#38bdf8',
  requiredLevel: 2,
  stages: [
    {
      id: 'css-1',
      zoneId: 'css',
      title: tx('Selektorlar va ranglar', 'Селекторы и цвета', 'Selectors & colors'),
      tasks: [
        { kind: 'pick', q: tx('Klass selektori', 'Селектор класса', 'A class selector'), options: ['.card', '#card', 'card', '*card'], answer: 0 },
        { kind: 'pick', q: tx('ID selektori', 'Селектор id', 'An id selector'), options: ['#logo', '.logo', 'logo', '@logo'], answer: 0 },
        { kind: 'look', code: 'color: tomato;', preview: 'text', options: [{ color: 'tomato' }, { color: 'royalblue' }, { color: 'seagreen' }], answer: 0 },
        { kind: 'blank', code: '.title ___\n  color: red;\n}', lang: 'css', options: ['{', '(', '[', ':'], answer: 0 },
        { kind: 'bug', lines: ['.btn {', '  color: white', '  background: navy;', '}'], bug: 1, fix: '  color: white;', lang: 'css' },
        { kind: 'match', pairs: [['#ff0000', '🟥'], ['#0000ff', '🟦'], ['#00ff00', '🟩'], ['#ffff00', '🟨']] },
      ],
    },
    {
      id: 'css-2',
      zoneId: 'css',
      title: tx('Quti modeli', 'Блочная модель', 'The box model'),
      tasks: [
        { kind: 'pick', q: tx('Ichki boʻshliq', 'Внутренний отступ', 'Inner spacing'), options: ['padding', 'margin', 'border', 'gap'], answer: 0 },
        { kind: 'pick', q: tx('Tashqi boʻshliq', 'Внешний отступ', 'Outer spacing'), options: ['margin', 'padding', 'outline', 'space'], answer: 0 },
        { kind: 'look', code: 'border-radius: 50%;', preview: 'box', options: [{ borderRadius: '50%' }, { borderRadius: '0' }, { borderRadius: '12px' }], answer: 0 },
        { kind: 'blank', code: '* {\n  box-sizing: ___;\n}', lang: 'css', options: ['border-box', 'content', 'inline', 'flex'], answer: 0 },
        { kind: 'bug', lines: ['.box {', '  padding 10px;', '  margin: 0;', '}'], bug: 1, fix: '  padding: 10px;', lang: 'css' },
        { kind: 'match', pairs: [['solid', '───'], ['dashed', '- - -'], ['dotted', '·····'], ['double', '═══']] },
      ],
    },
    {
      id: 'css-3',
      zoneId: 'css',
      title: tx('Matn uslubi', 'Типографика', 'Typography'),
      tasks: [
        { kind: 'pick', q: tx('Matn oʻlchami', 'Размер текста', 'Text size'), options: ['font-size', 'text-size', 'font-weight', 'size'], answer: 0 },
        { kind: 'pick', q: tx('Qalin matn', 'Жирный текст', 'Bold text'), options: ['font-weight: bold', 'font-style: bold', 'text: bold', 'bold: true'], answer: 0 },
        { kind: 'look', code: 'text-align: right;', preview: 'text', options: [{ textAlign: 'right' }, { textAlign: 'left' }, { textAlign: 'center' }], answer: 0 },
        { kind: 'look', code: 'font-style: italic;', preview: 'text', options: [{ fontStyle: 'italic' }, { fontWeight: '800' }, { textDecoration: 'underline' }], answer: 0 },
        { kind: 'blank', code: 'h1 {\n  font-size: 2___;\n}', lang: 'css', options: ['rem', 'rm', 'x', 'pp'], answer: 0 },
        { kind: 'match', pairs: [['underline', 'U̲'], ['line-through', 'S̶'], ['uppercase', 'AB'], ['italic', '𝘐']] },
      ],
    },
    {
      id: 'css-4',
      zoneId: 'css',
      title: tx('Flexbox', 'Flexbox', 'Flexbox'),
      tasks: [
        { kind: 'pick', q: tx('Flex konteyner yaratish', 'Создать flex-контейнер', 'Make a flex container'), options: ['display: flex', 'flex: on', 'display: row', 'position: flex'], answer: 0 },
        { kind: 'pick', q: tx('Elementlar orasidagi masofa', 'Расстояние между элементами', 'Space between items'), options: ['gap', 'space', 'between', 'padding'], answer: 0 },
        {
          kind: 'look',
          code: 'justify-content: space-between;',
          preview: 'row',
          options: [{ justifyContent: 'space-between' }, { justifyContent: 'center' }, { justifyContent: 'flex-start' }],
          answer: 0,
        },
        { kind: 'look', code: 'flex-direction: column;', preview: 'row', options: [{ flexDirection: 'column' }, { flexDirection: 'row' }, { flexDirection: 'row-reverse' }], answer: 0 },
        { kind: 'blank', code: '.row {\n  display: ___;\n  gap: 8px;\n}', lang: 'css', options: ['flex', 'block', 'inline', 'none'], answer: 0 },
        { kind: 'match', pairs: [['flex-start', '▮▮▮···'], ['center', '·▮▮▮·'], ['flex-end', '···▮▮▮'], ['space-between', '▮··▮··▮']] },
      ],
    },
    {
      id: 'css-5',
      zoneId: 'css',
      title: tx('Grid va moslashuvchanlik', 'Grid и адаптивность', 'Grid & responsive'),
      tasks: [
        { kind: 'pick', q: tx('Grid konteyner', 'Grid-контейнер', 'A grid container'), options: ['display: grid', 'grid: on', 'display: table', 'layout: grid'], answer: 0 },
        { kind: 'pick', q: tx('Ekran kengligiga qarab uslub', 'Стили по ширине экрана', 'Styles by screen width'), options: ['@media', '@screen', '@width', '@responsive'], answer: 0 },
        {
          kind: 'look',
          code: 'grid-template-columns: 1fr 1fr 1fr;',
          preview: 'grid',
          options: [{ gridTemplateColumns: '1fr 1fr 1fr' }, { gridTemplateColumns: '1fr 1fr' }, { gridTemplateColumns: '1fr' }],
          answer: 0,
        },
        { kind: 'blank', code: '@media (___: 768px) {\n  .menu { display: flex; }\n}', lang: 'css', options: ['min-width', 'width-min', 'screen', 'size'], answer: 0 },
        { kind: 'bug', lines: ['.grid {', '  display: grid;', '  gap: 16;', '}'], bug: 2, fix: '  gap: 16px;', lang: 'css' },
        { kind: 'match', pairs: [['repeat(1, 1fr)', '▮'], ['repeat(2, 1fr)', '▮▮'], ['repeat(3, 1fr)', '▮▮▮'], ['repeat(4, 1fr)', '▮▮▮▮']] },
      ],
    },
  ],
  boss: {
    zoneId: 'css',
    name: tx('Oʻyinchi kartasi', 'Карточка игрока', 'Player card'),
    task: tx(
      '.card ga padding, border-radius va fon rangi (background-color) bering, .title ga esa color qoʻshing.',
      'Задай .card свойства padding, border-radius и цвет фона (background-color), а .title — color.',
      'Give .card padding, border-radius and a background-color, and give .title a color.',
    ),
    mode: 'web',
    starter: { html: cardHtml, css: `${baseCss}\n.card {\n  \n}\n\n.title {\n  \n}\n`, js: '' },
    solution: {
      html: cardHtml,
      css: `${baseCss}\n.card {\n  padding: 20px;\n  border-radius: 16px;\n  background-color: #1e293b;\n}\n\n.title {\n  color: #5ce1ff;\n}\n`,
      js: '',
    },
    checks: [
      { label: tx('.card — padding', '.card — padding', '.card has padding'), spec: { id: 'padding', label: '', type: 'css_declaration', selector: '.card', property: 'padding' } },
      {
        label: tx('.card — border-radius', '.card — border-radius', '.card has border-radius'),
        spec: { id: 'radius', label: '', type: 'css_declaration', selector: '.card', property: 'border-radius' },
      },
      {
        label: tx('.card — fon rangi', '.card — цвет фона', '.card has a background color'),
        spec: { id: 'bg', label: '', type: 'source_regex', file: 'css', pattern: '\\.card\\s*\\{[^}]*background(-color)?\\s*:\\s*[^;\\s}]' },
      },
      { label: tx('.title — color', '.title — color', '.title has a color'), spec: { id: 'color', label: '', type: 'css_declaration', selector: '.title', property: 'color' } },
    ],
    xp: 50,
  },
};
