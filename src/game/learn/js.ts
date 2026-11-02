import { tx } from '@/i18n';
import type { LearnCard } from '../types';

export const jsLearn: Record<string, LearnCard[]> = {
  'js-1': [
    {
      icon: '📦',
      title: tx('let va const', 'let и const', 'let and const'),
      text: tx(
        'Oʻzgaruvchi — nomlangan quti. let bilan yaratilgan qiymatni keyin oʻzgartirish mumkin, const — oʻzgarmas qiymat.',
        'Переменная — коробка с именем. Значение let можно потом менять, а const — неизменяемое значение.',
        'A variable is a named box. A let value can change later; a const value never changes.',
      ),
      picture: {
        kind: 'boxes',
        items: [
          { name: 'let coins', value: '8' },
          { name: 'const hero', value: '"Nova"' },
        ],
      },
      example: { code: 'let coins = 5;\ncoins = coins + 3;\nconst hero = "Nova";\nconsole.log(coins);\nconsole.log(hero);', lang: 'js', result: { kind: 'terminal', lines: ['8', 'Nova'] } },
    },
    {
      icon: '💬',
      title: tx('Shablon satr', 'Шаблонная строка', 'Template string'),
      text: tx(
        'Teskari qoʻshtirnoq ` ichida ${…} oʻzgaruvchi qiymatini matnga qoʻyadi. console.log() natijani konsolga chiqaradi.',
        'В обратных кавычках ` конструкция ${…} вставляет значение переменной в текст. console.log() выводит результат в консоль.',
        'Inside backticks `, ${…} puts a variable’s value into the text. console.log() prints the result to the console.',
      ),
      picture: {
        kind: 'parts',
        code: 'console.log(`Hello, ${hero}!`);',
        lang: 'js',
        parts: [
          { text: 'console.log', label: tx('konsolga chiqarish', 'вывод в консоль', 'print to the console') },
          { text: '`Hello, ', label: tx('` bilan boshlanadigan matn', 'текст в обратных кавычках', 'text in backticks') },
          { text: '${hero}', label: tx('bu yerga qiymat qoʻyiladi', 'сюда подставится значение', 'the value goes here') },
        ],
      },
      example: { code: 'const hero = "Nova";\nconsole.log(`Hello, ${hero}!`);', lang: 'js', result: { kind: 'terminal', lines: ['Hello, Nova!'] } },
    },
    {
      icon: '🔤',
      title: tx('Harflar va turlar', 'Регистр и типы', 'Case & types'),
      text: tx(
        'JavaScript katta-kichik harfni farqlaydi: x va X — ikki xil nom. Matn + son = matn ("5" + 1 → "51"), lekin * sonlarni koʻpaytiradi. typeof turini aytadi.',
        'JavaScript различает регистр: x и X — разные имена. Строка + число = строка ("5" + 1 → "51"), а * умножает числа. typeof сообщает тип.',
        'JavaScript is case-sensitive: x and X are different names. Text + number = text ("5" + 1 → "51"), but * multiplies. typeof tells the type.',
      ),
      picture: {
        kind: 'table',
        head: [tx('Ifoda', 'Выражение', 'Expression'), tx('Natija', 'Результат', 'Result')],
        rows: [
          ['"5" + 1', '"51"'],
          ['5 + 1', '6'],
          ['"5" * 2', '10'],
          ['typeof 5', '"number"'],
        ],
        verify: 'js-expr',
      },
      example: { code: 'let x = 10;\nconsole.log(x);\nconsole.log(typeof "hi");\nconsole.log("2" + 2);', lang: 'js', result: { kind: 'terminal', lines: ['10', 'string', '22'] } },
    },
  ],
  'js-2': [
    {
      icon: '🔀',
      title: tx('if / else', 'if / else', 'if / else'),
      text: tx(
        'if (shart) { … } — shart toʻgʻri (true) boʻlsa ishlaydi. Aks holda else { … } bloki ishlaydi.',
        'if (условие) { … } выполняется, если условие истинно (true). Иначе выполняется блок else { … }.',
        'if (condition) { … } runs when the condition is true. Otherwise the else { … } block runs.',
      ),
      picture: {
        kind: 'parts',
        code: 'if (hp > 0) {\n  console.log("alive");\n} else {\n  console.log("game over");\n}',
        lang: 'js',
        parts: [
          { text: '(hp > 0)', label: tx('shart', 'условие', 'the condition') },
          { text: 'console.log("alive");', label: tx('shart true boʻlsa', 'если условие true', 'if it is true') },
          { text: 'else', label: tx('aks holda', 'иначе', 'otherwise') },
          { text: 'console.log("game over");', label: tx('shart false boʻlsa', 'если условие false', 'if it is false') },
        ],
      },
      example: { code: 'const age = 20;\nif (age >= 18) {\n  console.log("adult");\n} else {\n  console.log("teen");\n}', lang: 'js', result: { kind: 'terminal', lines: ['adult'] } },
    },
    {
      icon: '⚖️',
      title: tx('Taqqoslash', 'Сравнение', 'Comparison'),
      text: tx(
        '=== — qatʼiy tenglik: qiymat ham, tur ham bir xil boʻlishi kerak. Bitta = esa qiymat beradi, taqqoslamaydi! Yana: >, <, >=, <=.',
        '=== — строгое равенство: совпадать должны и значение, и тип. Одно = присваивает, а не сравнивает! Ещё: >, <, >=, <=.',
        '=== is strict equality: both value and type must match. A single = assigns, it doesn’t compare! Also: >, <, >=, <=.',
      ),
      picture: {
        kind: 'table',
        head: [tx('Ifoda', 'Выражение', 'Expression'), tx('Natija', 'Результат', 'Result')],
        rows: [
          ['3 === 3', 'true'],
          ['3 === "3"', 'false'],
          ['7 > 3', 'true'],
          ['2 >= 3', 'false'],
        ],
        verify: 'js-expr',
      },
      example: { code: 'const score = 100;\nif (score === 100) {\n  console.log("Max!");\n}\nconsole.log(score === "100");', lang: 'js', result: { kind: 'terminal', lines: ['Max!', 'false'] } },
    },
    {
      icon: '🔗',
      title: tx('Mantiqiy operatorlar', 'Логические операторы', 'Logical operators'),
      text: tx(
        '&& — “va”: ikkala shart ham true boʻlishi kerak. || — “yoki”: bittasi yetarli. ! — teskarisi.',
        '&& — «и»: оба условия должны быть true. || — «или»: достаточно одного. ! — отрицание.',
        '&& means “and”: both must be true. || means “or”: one is enough. ! means “not”.',
      ),
      picture: {
        kind: 'table',
        head: [tx('Ifoda', 'Выражение', 'Expression'), tx('Natija', 'Результат', 'Result')],
        rows: [
          ['true && false', 'false'],
          ['true || false', 'true'],
          ['!true', 'false'],
        ],
        verify: 'js-expr',
      },
      example: { code: 'const hp = 3;\nconst hasKey = true;\nif (hp > 0 && hasKey) {\n  console.log("Door opens");\n}', lang: 'js', result: { kind: 'terminal', lines: ['Door opens'] } },
    },
  ],
  'js-3': [
    {
      icon: '📚',
      title: tx('Massiv', 'Массив', 'Array'),
      text: tx(
        'Massiv — tartiblangan roʻyxat: [3, 5, 7]. Sanash 0 dan boshlanadi: a[0] — birinchi, a[1] — ikkinchi. length — elementlar soni.',
        'Массив — упорядоченный список: [3, 5, 7]. Счёт с 0: a[0] — первый, a[1] — второй. length — количество элементов.',
        'An array is an ordered list: [3, 5, 7]. Counting starts at 0: a[0] is the first, a[1] the second. length is the number of items.',
      ),
      picture: { kind: 'list', name: 'xp', items: ['10', '20', '30'] },
      example: { code: 'const xp = [10, 20, 30];\nconsole.log(xp[0]);\nconsole.log(xp[2]);\nconsole.log(xp.length);', lang: 'js', result: { kind: 'terminal', lines: ['10', '30', '3'] } },
    },
    {
      icon: '🔁',
      title: tx('Sikllar', 'Циклы', 'Loops'),
      text: tx(
        'for (const x of list) — roʻyxatning har bir elementidan oʻtadi. Klassik for (let i = 1; i <= 3; i++) — i ni 1 dan 3 gacha oshiradi.',
        'for (const x of list) проходит по каждому элементу. Классический for (let i = 1; i <= 3; i++) увеличивает i от 1 до 3.',
        'for (const x of list) visits every item. The classic for (let i = 1; i <= 3; i++) counts i from 1 to 3.',
      ),
      picture: {
        kind: 'table',
        head: ['i', 's += i'],
        rows: [
          ['1', '1'],
          ['2', '3'],
          ['3', '6'],
        ],
      },
      example: { code: 'let s = 0;\nfor (let i = 1; i <= 3; i++) {\n  s += i;\n}\nconsole.log(s);\nfor (const x of [7, 8]) {\n  console.log(x);\n}', lang: 'js', result: { kind: 'terminal', lines: ['6', '7', '8'] } },
    },
    {
      icon: '🛠️',
      title: tx('Massiv metodlari', 'Методы массивов', 'Array methods'),
      text: tx(
        'map — har bir elementni oʻzgartiradi, filter — shartga mos keladiganlarini qoldiradi, includes — bormi?, indexOf — qaysi oʻrinda?',
        'map — меняет каждый элемент, filter — оставляет подходящие, includes — есть ли?, indexOf — на каком месте?',
        'map changes every item, filter keeps the matching ones, includes asks “is it there?”, indexOf asks “where?”.',
      ),
      picture: {
        kind: 'table',
        head: [tx('Ifoda', 'Выражение', 'Expression'), tx('Natija', 'Результат', 'Result')],
        rows: [
          ['[1,2].map(n => n * 2)', '[2,4]'],
          ['[1,2,3].filter(n => n > 1)', '[2,3]'],
          ['[1,2,3].includes(2)', 'true'],
          ['[4,5].indexOf(5)', '1'],
        ],
        verify: 'js-expr',
      },
      example: { code: 'const big = [2, 6, 8].filter((n) => n > 5);\nconsole.log(big.join(", "));', lang: 'js', result: { kind: 'terminal', lines: ['6, 8'] } },
    },
  ],
  'js-4': [
    {
      icon: '⚙️',
      title: tx('Funksiya', 'Функция', 'Function'),
      text: tx(
        'Funksiya — nomlangan amallar toʻplami. Parametrlar qavsda, natija return bilan qaytariladi. return boʻlmasa, natija undefined.',
        'Функция — именованный набор действий. Параметры в скобках, результат возвращается через return. Без return получится undefined.',
        'A function is a named set of steps. Parameters go in parentheses and return gives back the result. Without return you get undefined.',
      ),
      picture: {
        kind: 'parts',
        code: 'function add(a, b) {\n  return a + b;\n}',
        lang: 'js',
        parts: [
          { text: 'add', label: tx('funksiya nomi', 'имя функции', 'the name') },
          { text: '(a, b)', label: tx('parametrlar', 'параметры', 'parameters') },
          { text: 'return', label: tx('natijani qaytaradi', 'возвращает результат', 'gives back the result') },
        ],
      },
      example: { code: 'function times(a, b) {\n  return a * b;\n}\nconsole.log(times(3, 4));', lang: 'js', result: { kind: 'terminal', lines: ['12'] } },
    },
    {
      icon: '➡️',
      title: tx('Strelkali funksiya', 'Стрелочная функция', 'Arrow function'),
      text: tx(
        'Qisqa yozuv: (n) => n * 2 — n ni oladi va n * 2 ni qaytaradi. Uni oʻzgaruvchiga saqlaymiz.',
        'Короткая запись: (n) => n * 2 — принимает n и возвращает n * 2. Её сохраняют в переменную.',
        'Short form: (n) => n * 2 takes n and returns n * 2. We store it in a variable.',
      ),
      picture: {
        kind: 'parts',
        code: 'const triple = (n) => n * 3;',
        lang: 'js',
        parts: [
          { text: '(n)', label: tx('parametr', 'параметр', 'parameter') },
          { text: '=>', label: tx('strelka', 'стрелка', 'the arrow') },
          { text: 'n * 3', label: tx('qaytadigan qiymat', 'возвращаемое значение', 'the returned value') },
        ],
      },
      example: { code: 'const triple = (n) => n * 3;\nconsole.log(triple(5));', lang: 'js', result: { kind: 'terminal', lines: ['15'] } },
    },
    {
      icon: '🧸',
      title: tx('Obyekt', 'Объект', 'Object'),
      text: tx(
        'Obyekt — kalit: qiymat juftliklari { name: "Nova", hp: 3 }. Qiymatni nuqta bilan olamiz: hero.hp.',
        'Объект — пары ключ: значение { name: "Nova", hp: 3 }. Значение берут через точку: hero.hp.',
        'An object holds key: value pairs { name: "Nova", hp: 3 }. Read a value with a dot: hero.hp.',
      ),
      picture: {
        kind: 'boxes',
        items: [
          { name: 'hero.name', value: '"Nova"' },
          { name: 'hero.hp', value: '3' },
        ],
      },
      example: { code: 'const hero = { name: "Nova", hp: 3 };\nconsole.log(hero.name);\nconsole.log(hero.hp + 1);', lang: 'js', result: { kind: 'terminal', lines: ['Nova', '4'] } },
    },
    {
      icon: '🧮',
      title: tx('Tayyor funksiyalar', 'Готовые функции', 'Built-in functions'),
      text: tx(
        'JavaScript da tayyor yordamchilar bor: Math.max — eng kattasi, Math.round — yaxlitlash, toUpperCase — katta harflar, join — birlashtirish.',
        'В JavaScript есть готовые помощники: Math.max — максимум, Math.round — округление, toUpperCase — заглавные буквы, join — склеить.',
        'JavaScript has ready-made helpers: Math.max (largest), Math.round (rounding), toUpperCase (capitals), join (glue together).',
      ),
      picture: {
        kind: 'table',
        head: [tx('Ifoda', 'Выражение', 'Expression'), tx('Natija', 'Результат', 'Result')],
        rows: [
          ['Math.max(2, 9)', '9'],
          ['Math.round(2.6)', '3'],
          ['"code".toUpperCase()', '"CODE"'],
          ['[1,2,3].join("-")', '"1-2-3"'],
        ],
        verify: 'js-expr',
      },
      example: { code: 'console.log(Math.max(4, 11));\nconsole.log("nova".toUpperCase());', lang: 'js', result: { kind: 'terminal', lines: ['11', 'NOVA'] } },
    },
  ],
  'js-5': [
    {
      icon: '🌳',
      title: tx('Elementni topish', 'Найти элемент', 'Finding an element'),
      text: tx(
        'document.querySelector() CSS selektor boʻyicha sahifadagi elementni topadi. textContent — uning matnini oʻzgartiradi.',
        'document.querySelector() находит элемент страницы по CSS-селектору. textContent меняет его текст.',
        'document.querySelector() finds an element on the page by CSS selector. textContent changes its text.',
      ),
      picture: {
        kind: 'table',
        rows: [
          ['textContent', tx('✏️ matnni oʻzgartiradi', '✏️ меняет текст', '✏️ changes the text')],
          ['classList.add', tx('🎨 klass qoʻshadi', '🎨 добавляет класс', '🎨 adds a class')],
          ['addEventListener', tx('👂 hodisani tinglaydi', '👂 слушает событие', '👂 listens for an event')],
          ['remove()', tx('🗑️ elementni oʻchiradi', '🗑️ удаляет элемент', '🗑️ removes the element')],
        ],
      },
      example: {
        code: 'const title = document.querySelector("#title");\ntitle.textContent = "Level 2!";',
        lang: 'js',
        caption: tx('<h1 id="title">Level 1</h1> oʻzgardi', '<h1 id="title">Level 1</h1> изменился', '<h1 id="title">Level 1</h1> changed'),
        result: { kind: 'browser', html: '<h1 id="title">Level 2!</h1>' },
      },
    },
    {
      icon: '👂',
      title: tx('Hodisalar', 'События', 'Events'),
      text: tx(
        'addEventListener("click", fn) bosishni tinglaydi: har safar bosilganda fn funksiyasi ishlaydi.',
        'addEventListener("click", fn) слушает нажатия: при каждом нажатии запускается функция fn.',
        'addEventListener("click", fn) listens for clicks: every click runs the function fn.',
      ),
      picture: {
        kind: 'parts',
        code: 'btn.addEventListener("click", () => {\n  btn.textContent = "Started!";\n});',
        lang: 'js',
        parts: [
          { text: 'addEventListener', label: tx('tinglashni boshlash', 'начать слушать', 'start listening') },
          { text: '"click"', label: tx('qaysi hodisa', 'какое событие', 'which event') },
          { text: '() => {', label: tx('bosilganda ishlaydigan funksiya', 'функция, которая сработает', 'the function that runs') },
        ],
      },
      example: {
        code: 'const btn = document.querySelector("#play");\nbtn.addEventListener("click", () => {\n  btn.textContent = "Started!";\n});',
        lang: 'js',
        caption: tx('tugma bosilgandan keyin', 'после нажатия кнопки', 'after a click'),
        result: { kind: 'browser', html: '<button id="play">Started!</button>' },
      },
    },
    {
      icon: '⏱️',
      title: tx('setTimeout — keyinroq', 'setTimeout — позже', 'setTimeout — later'),
      text: tx(
        'setTimeout(fn, 0) funksiyani navbatga qoʻyadi: avval qolgan barcha kod ishlaydi, keyin fn. Shuning uchun u oxirida chiqadi.',
        'setTimeout(fn, 0) ставит функцию в очередь: сначала выполняется весь остальной код, потом fn. Поэтому она выводится последней.',
        'setTimeout(fn, 0) queues the function: all the remaining code runs first, then fn. That’s why it prints last.',
      ),
      example: { code: 'console.log("start");\nsetTimeout(() => console.log("timer"), 0);\nconsole.log("end");', lang: 'js', result: { kind: 'terminal', lines: ['start', 'end', 'timer'] } },
    },
    {
      icon: '⏳',
      title: tx('async va Promise', 'async и Promise', 'async & Promise'),
      text: tx(
        'async funksiya Promise (vaʼda) qaytaradi. Haqiqiy qiymatni .then((v) => …) bilan olamiz.',
        'async-функция возвращает Promise (обещание). Настоящее значение получают через .then((v) => …).',
        'An async function returns a Promise. You get the real value with .then((v) => …).',
      ),
      example: { code: 'async function getScore() {\n  return 99;\n}\ngetScore().then((v) => console.log(v));', lang: 'js', result: { kind: 'terminal', lines: ['99'] } },
    },
  ],
};
