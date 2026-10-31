import { tx } from '@/i18n';
import type { Zone } from '../types';

export const jsZone: Zone = {
  id: 'js',
  nameKey: 'b.js',
  buildingId: 'js-lab',
  symbol: 'JS',
  accent: '#facc15',
  requiredLevel: 3,
  stages: [
    {
      id: 'js-1',
      zoneId: 'js',
      title: tx('Oʻzgaruvchilar', 'Переменные', 'Variables'),
      tip: {
        text: tx(
          'let — oʻzgaradigan, const — oʻzgarmas qiymat. console.log() natijani chiqaradi.',
          'let — изменяемое значение, const — неизменяемое. console.log() выводит результат.',
          'let holds a value that can change, const one that can’t. console.log() prints it.',
        ),
        code: 'let score = 0;\nscore = score + 10;\nconsole.log(score); // 10',
        lang: 'js',
      },
      tasks: [
        { kind: 'output', code: 'let a = 5;\na = a + 2;\nconsole.log(a);', lang: 'js', options: ['7', '5', '52', 'a'], answer: 0 },
        { kind: 'output', code: 'const name = "Ada";\nconsole.log(`Hi, ${name}!`);', lang: 'js', options: ['Hi, Ada!', 'Hi, ${name}!', 'Hi, name!', 'Ada'], answer: 0 },
        { kind: 'pick', q: tx('Oʻzgarmas qiymat', 'Неизменяемое значение', 'A value that never changes'), options: ['const', 'let', 'var', 'static'], answer: 0 },
        { kind: 'blank', code: '___ score = 0;\nscore = score + 10;', lang: 'js', options: ['let', 'const', 'int', 'num'], answer: 0 },
        { kind: 'bug', lines: ['let x = 10;', 'console.log(X);'], bug: 1, fix: 'console.log(x);', lang: 'js' },
        { kind: 'match', pairs: [['"5" + 1', '"51"'], ['5 + 1', '6'], ['"5" * 2', '10'], ['typeof 5', '"number"']], verify: 'js-expr' },
      ],
    },
    {
      id: 'js-2',
      zoneId: 'js',
      title: tx('Shartlar', 'Условия', 'Conditions'),
      tip: {
        text: tx(
          'if (shart) { … } else { … } — shart rost boʻlsa, birinchi blok ishlaydi. === — qatʼiy tenglik.',
          'if (условие) { … } else { … } — если условие истинно, работает первый блок. === — строгое равенство.',
          'if (condition) { … } else { … } runs the first block when the condition is true. === is strict equality.',
        ),
        code: 'if (hp > 0) {\n  console.log("alive");\n} else {\n  console.log("game over");\n}',
        lang: 'js',
      },
      tasks: [
        {
          kind: 'output',
          code: 'const age = 15;\nif (age >= 18) {\n  console.log("adult");\n} else {\n  console.log("teen");\n}',
          lang: 'js',
          options: ['teen', 'adult', '15', 'undefined'],
          answer: 0,
        },
        { kind: 'output', code: 'console.log(5 === "5");', lang: 'js', options: ['false', 'true', '5', 'error'], answer: 0 },
        { kind: 'pick', q: tx('“Va” (and) operatori', 'Оператор «и» (and)', 'The “and” operator'), options: ['&&', '||', '!', '&'], answer: 0 },
        { kind: 'blank', code: 'if (score ___ 100) {\n  console.log("Max!");\n}', lang: 'js', options: ['===', '=', '=>', '=<'], answer: 0 },
        { kind: 'order', lines: ['if (hp > 0) {', '  console.log("alive");', '} else {', '  console.log("game over");', '}'], lang: 'js' },
        { kind: 'bug', lines: ['let hp = 0;', 'if (hp = 0) {', '  console.log("game over");', '}'], bug: 1, fix: 'if (hp === 0) {', lang: 'js' },
      ],
    },
    {
      id: 'js-3',
      zoneId: 'js',
      title: tx('Massivlar va sikllar', 'Массивы и циклы', 'Arrays & loops'),
      tip: {
        text: tx(
          'Massiv — roʻyxat [1, 2, 3]; indekslar 0 dan boshlanadi. for sikli amalni takrorlaydi.',
          'Массив — список [1, 2, 3]; индексы начинаются с 0. Цикл for повторяет действие.',
          'An array is a list [1, 2, 3]; indexes start at 0. A for loop repeats work.',
        ),
        code: 'const xp = [10, 20, 30];\nfor (const n of xp) {\n  console.log(n);\n}',
        lang: 'js',
      },
      tasks: [
        { kind: 'output', code: 'const a = [3, 5, 7];\nconsole.log(a[1]);', lang: 'js', options: ['5', '3', '7', 'undefined'], answer: 0 },
        { kind: 'output', code: 'const a = [1, 2, 3];\nconsole.log(a.length);', lang: 'js', options: ['3', '2', '4', '[1, 2, 3]'], answer: 0 },
        { kind: 'output', code: 'let s = 0;\nfor (let i = 1; i <= 3; i++) {\n  s += i;\n}\nconsole.log(s);', lang: 'js', options: ['6', '3', '123', '4'], answer: 0 },
        { kind: 'blank', code: 'const big = [1, 5, 9].___((n) => n > 3);', lang: 'js', options: ['filter', 'map', 'push', 'join'], answer: 0 },
        {
          kind: 'match',
          pairs: [['[1,2].map(n => n * 2)', '[2,4]'], ['[1,2,3].filter(n => n > 1)', '[2,3]'], ['[1,2,3].includes(2)', 'true'], ['[4,5].indexOf(5)', '1']],
          verify: 'js-expr',
        },
        { kind: 'order', lines: ['for (const x of [1, 2, 3]) {', '  console.log(x);', '}'], lang: 'js' },
      ],
    },
    {
      id: 'js-4',
      zoneId: 'js',
      title: tx('Funksiyalar va obyektlar', 'Функции и объекты', 'Functions & objects'),
      tip: {
        text: tx(
          'Funksiya — qayta ishlatiladigan kod, return natijani qaytaradi. Obyekt — kalit: qiymat juftlari.',
          'Функция — переиспользуемый код, return возвращает результат. Объект — пары ключ: значение.',
          'A function is reusable code and return gives back a result. An object holds key: value pairs.',
        ),
        code: 'const hero = { name: "Nova", hp: 3 };\nfunction heal(h) {\n  return h.hp + 1;\n}\nconsole.log(heal(hero)); // 4',
        lang: 'js',
      },
      tasks: [
        { kind: 'output', code: 'function add(a, b) {\n  return a + b;\n}\nconsole.log(add(2, 3));', lang: 'js', options: ['5', '23', 'undefined', 'add'], answer: 0 },
        { kind: 'output', code: 'const hero = { name: "Nova", hp: 3 };\nconsole.log(hero.hp);', lang: 'js', options: ['3', 'Nova', 'hp', 'undefined'], answer: 0 },
        { kind: 'output', code: 'const double = (n) => n * 2;\nconsole.log(double(4));', lang: 'js', options: ['8', '4', 'n * 2', 'NaN'], answer: 0 },
        { kind: 'blank', code: 'function greet(name) {\n  ___ "Hi " + name;\n}', lang: 'js', options: ['return', 'print', 'give', 'echo'], answer: 0 },
        { kind: 'bug', lines: ['function area(w, h) {', '  w * h;', '}', 'console.log(area(2, 3));'], bug: 1, fix: '  return w * h;', lang: 'js' },
        {
          kind: 'match',
          pairs: [['Math.max(2, 9)', '9'], ['Math.round(2.6)', '3'], ['"code".toUpperCase()', '"CODE"'], ['[1,2,3].join("-")', '"1-2-3"']],
          verify: 'js-expr',
        },
      ],
    },
    {
      id: 'js-5',
      zoneId: 'js',
      title: tx('DOM va asinxronlik', 'DOM и асинхронность', 'DOM & async'),
      tip: {
        text: tx(
          'querySelector elementni topadi, addEventListener hodisani tinglaydi, setTimeout esa kodni keyinroq bajaradi.',
          'querySelector находит элемент, addEventListener слушает событие, а setTimeout выполняет код позже.',
          'querySelector finds an element, addEventListener listens for events and setTimeout runs code later.',
        ),
        code: 'const btn = document.querySelector("#play");\nbtn.addEventListener("click", () => {\n  console.log("Start!");\n});',
        lang: 'js',
      },
      tasks: [
        {
          kind: 'pick',
          q: tx('CSS selektor boʻyicha element topish', 'Найти элемент по CSS-селектору', 'Find an element by CSS selector'),
          options: ['document.querySelector()', 'document.find()', 'getElement()', 'select()'],
          answer: 0,
        },
        {
          kind: 'pick',
          q: tx('Bosishni tinglash', 'Слушать нажатие', 'Listen for clicks'),
          options: ['addEventListener("click", fn)', 'onClick(fn)', 'listen("click")', 'click.on(fn)'],
          answer: 0,
        },
        { kind: 'blank', code: 'button.addEventListener("___", () => {\n  count++;\n});', lang: 'js', options: ['click', 'press', 'tap', 'push'], answer: 0 },
        {
          kind: 'output',
          code: 'console.log("A");\nsetTimeout(() => console.log("B"), 0);\nconsole.log("C");',
          lang: 'js',
          options: ['A\nC\nB', 'A\nB\nC', 'B\nA\nC', 'C\nA\nB'],
          answer: 0,
        },
        { kind: 'output', code: 'async function load() {\n  return 42;\n}\nload().then((v) => console.log(v));', lang: 'js', options: ['42', 'Promise', 'undefined', 'load'], answer: 0 },
        { kind: 'match', pairs: [['textContent', '✏️'], ['classList.add', '🎨'], ['addEventListener', '👂'], ['remove()', '🗑️']] },
      ],
    },
  ],
  boss: {
    zoneId: 'js',
    name: tx('Ikkilagich', 'Удвоитель', 'The Doubler'),
    task: tx(
      'double(n) funksiyasini yozing: u n * 2 ni qaytarsin. Soʻng double(1), double(2) va double(3) natijalarini alohida qatorlarda chiqaring.',
      'Напиши функцию double(n), которая возвращает n * 2. Затем выведи double(1), double(2) и double(3) — каждое с новой строки.',
      'Write a function double(n) that returns n * 2. Then print double(1), double(2) and double(3), each on its own line.',
    ),
    mode: 'console',
    starter: { js: '// 👇\n\n' },
    solution: { js: 'function double(n) {\n  return n * 2;\n}\n\nconsole.log(double(1));\nconsole.log(double(2));\nconsole.log(double(3));\n' },
    checks: [
      {
        label: tx('double funksiyasi', 'Функция double', 'A double function'),
        spec: { id: 'fn', label: '', type: 'source_regex', file: 'js', pattern: '(function\\s+double\\s*\\(|(const|let)\\s+double\\s*=)' },
      },
      { label: tx('return ishlatilgan', 'Используется return', 'Uses return'), spec: { id: 'return', label: '', type: 'source_regex', file: 'js', pattern: '\\breturn\\b' } },
      { label: tx('Natija: 2, 4, 6', 'Вывод: 2, 4, 6', 'Prints 2, 4, 6'), spec: { id: 'out', label: '', type: 'output_equals', expected: '2\n4\n6' } },
    ],
    xp: 50,
  },
};
