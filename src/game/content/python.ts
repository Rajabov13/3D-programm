import { tx } from '@/i18n';
import type { Zone } from '../types';

export const pythonZone: Zone = {
  id: 'python',
  nameKey: 'b.python',
  buildingId: 'python-center',
  symbol: 'py',
  accent: '#a3e635',
  requiredLevel: 2,
  stages: [
    {
      id: 'py-1',
      zoneId: 'python',
      title: tx('print va oʻzgaruvchilar', 'print и переменные', 'print & variables'),
      tip: {
        text: tx(
          'print() natijani chiqaradi; f-satrda oʻzgaruvchi {} ichiga yoziladi.',
          'print() выводит результат; в f-строке переменные пишутся внутри {}.',
          'print() shows output; in an f-string you put variables inside {}.',
        ),
        code: 'name = "Ada"\nprint(f"Hi, {name}!")',
        lang: 'py',
      },
      tasks: [
        { kind: 'output', code: 'x = 3\nx = x * 2\nprint(x)', lang: 'py', options: ['6', '3', 'x * 2', '9'], answer: 0 },
        { kind: 'output', code: 'name = "Ada"\nprint(f"Hi, {name}!")', lang: 'py', options: ['Hi, Ada!', 'Hi, {name}!', 'Hi, name!', 'Ada'], answer: 0 },
        { kind: 'output', code: 'print(len("code"))', lang: 'py', options: ['4', '5', 'code', '3'], answer: 0 },
        { kind: 'blank', code: '___("Hello")', lang: 'py', options: ['print', 'echo', 'console.log', 'say'], answer: 0 },
        { kind: 'bug', lines: ['score = 10', 'print(Score)'], bug: 1, fix: 'print(score)', lang: 'py' },
        { kind: 'match', pairs: [['2 ** 3', '8'], ['7 // 2', '3'], ['7 % 2', '1'], ['"ab" * 2', 'abab']], verify: 'py-expr' },
      ],
    },
    {
      id: 'py-2',
      zoneId: 'python',
      title: tx('Shartlar va sikllar', 'Условия и циклы', 'Conditions & loops'),
      tip: {
        text: tx(
          'if / elif / else qaror qabul qiladi; for i in range(3) — 0, 1, 2. Ichki qatorlar 4 ta probel bilan surilgan.',
          'if / elif / else принимают решения; for i in range(3) — это 0, 1, 2. Тело пишется с отступом в 4 пробела.',
          'if / elif / else make decisions; for i in range(3) gives 0, 1, 2. Indent the body by 4 spaces.',
        ),
        code: 'for i in range(3):\n    if i == 1:\n        print("one")',
        lang: 'py',
      },
      tasks: [
        { kind: 'output', code: 'for i in range(3):\n    print(i)', lang: 'py', options: ['0\n1\n2', '1\n2\n3', '0\n1\n2\n3', '3'], answer: 0 },
        { kind: 'output', code: 'n = 7\nif n % 2 == 0:\n    print("even")\nelse:\n    print("odd")', lang: 'py', options: ['odd', 'even', '7', '1'], answer: 0 },
        { kind: 'pick', q: tx('“Aks holda, agar …” kalit soʻzi', 'Ключевое слово «иначе, если …»', 'The “else if” keyword'), options: ['elif', 'else if', 'elseif', 'when'], answer: 0 },
        { kind: 'order', lines: ['for n in range(1, 4):', '    if n == 2:', '        print("two")'], lang: 'py' },
        { kind: 'bug', lines: ['for i in range(3)', '    print(i)'], bug: 0, fix: 'for i in range(3):', lang: 'py' },
        { kind: 'blank', code: 'while lives ___ 0:\n    lives -= 1', lang: 'py', options: ['>', '=>', '=', '!'], answer: 0 },
      ],
    },
    {
      id: 'py-3',
      zoneId: 'python',
      title: tx('Roʻyxatlar va lugʻatlar', 'Списки и словари', 'Lists & dictionaries'),
      tip: {
        text: tx(
          'Roʻyxat — [1, 2, 3], lugʻat — {"kalit": qiymat}. [-1] — oxirgi element.',
          'Список — [1, 2, 3], словарь — {"ключ": значение}. [-1] — последний элемент.',
          'A list is [1, 2, 3], a dict is {"key": value}. [-1] is the last item.',
        ),
        code: 'hero = {"name": "Nova", "items": ["sword"]}\nhero["items"].append("shield")\nprint(hero["items"][-1])',
        lang: 'py',
      },
      tasks: [
        { kind: 'output', code: 'nums = [4, 8, 15]\nprint(nums[-1])', lang: 'py', options: ['15', '4', '8', '-1'], answer: 0 },
        { kind: 'output', code: 'hero = {"name": "Nova", "hp": 3}\nprint(hero["name"])', lang: 'py', options: ['Nova', 'name', '3', 'hero'], answer: 0 },
        { kind: 'output', code: 'print([n * 2 for n in [1, 2, 3]])', lang: 'py', options: ['[2, 4, 6]', '[1, 2, 3]', '6', '[2]'], answer: 0 },
        { kind: 'blank', code: 'items = ["sword"]\nitems.___("shield")', lang: 'py', options: ['append', 'push', 'add', 'put'], answer: 0 },
        {
          kind: 'match',
          pairs: [['len([1, 2, 3])', '3'], ['sorted([3, 1, 2])', '[1, 2, 3]'], ['max([4, 9, 2])', '9'], ['"a,b".split(",")', "['a', 'b']"]],
          verify: 'py-expr',
        },
        { kind: 'bug', lines: ['colors = ["red", "green"]', 'print(colors[2])'], bug: 1, fix: 'print(colors[1])', lang: 'py' },
      ],
    },
    {
      id: 'py-4',
      zoneId: 'python',
      title: tx('Funksiyalar', 'Функции', 'Functions'),
      tip: {
        text: tx(
          'def bilan funksiya yaratiladi; return natijani qaytaradi, aks holda None qaytadi.',
          'Функция создаётся через def; return возвращает результат, иначе возвращается None.',
          'def creates a function; return gives back a result, otherwise it returns None.',
        ),
        code: 'def square(n):\n    return n * n\n\nprint(square(4))',
        lang: 'py',
      },
      tasks: [
        { kind: 'output', code: 'def add(a, b):\n    return a + b\n\nprint(add(2, 5))', lang: 'py', options: ['7', '25', 'None', 'add'], answer: 0 },
        { kind: 'output', code: 'def greet(name="friend"):\n    return "Hi " + name\n\nprint(greet())', lang: 'py', options: ['Hi friend', 'Hi', 'Hi name', 'None'], answer: 0 },
        { kind: 'output', code: 'def f():\n    print("x")\n\nprint(f())', lang: 'py', options: ['x\nNone', 'x', 'None', 'f'], answer: 0 },
        { kind: 'blank', code: '___ square(n):\n    return n * n', lang: 'py', options: ['def', 'function', 'fn', 'func'], answer: 0 },
        { kind: 'order', lines: ['def area(w, h):', '    return w * h', 'print(area(2, 3))'], lang: 'py' },
        { kind: 'bug', lines: ['def double(n):', '    n * 2', 'print(double(4))'], bug: 1, fix: '    return n * 2', lang: 'py' },
      ],
    },
    {
      id: 'py-5',
      zoneId: 'python',
      title: tx('Klasslar', 'Классы', 'Classes'),
      tip: {
        text: tx(
          'class — obyekt chizmasi. __init__ boshlangʻich qiymatlarni beradi, self — obyektning oʻzi.',
          'class — чертёж объекта. __init__ задаёт начальные значения, self — сам объект.',
          'A class is a blueprint. __init__ sets starting values; self is the object itself.',
        ),
        code: 'class Hero:\n    def __init__(self, name):\n        self.name = name\n\nprint(Hero("Nova").name)',
        lang: 'py',
      },
      tasks: [
        {
          kind: 'output',
          code: 'class Robot:\n    def __init__(self, name):\n        self.name = name\n\nr = Robot("Nova")\nprint(r.name)',
          lang: 'py',
          options: ['Nova', 'Robot', 'name', 'self'],
          answer: 0,
        },
        { kind: 'pick', q: tx('Boshlangʻich qiymatlarni beruvchi metod', 'Метод, задающий начальные значения', 'The method that sets starting values'), options: ['__init__', '__start__', 'constructor', 'setup'], answer: 0 },
        { kind: 'blank', code: 'class Cat:\n    def meow(___):\n        print("Meow")', lang: 'py', options: ['self', 'this', 'cat', 'me'], answer: 0 },
        {
          kind: 'output',
          code: 'class Counter:\n    def __init__(self):\n        self.n = 0\n\n    def add(self):\n        self.n += 1\n\nc = Counter()\nc.add()\nc.add()\nprint(c.n)',
          lang: 'py',
          options: ['2', '0', '1', 'None'],
          answer: 0,
        },
        { kind: 'bug', lines: ['class Hero:', '    def heal(self):', '        hp += 1'], bug: 2, fix: '        self.hp += 1', lang: 'py' },
        { kind: 'match', pairs: [['str(5)', '5'], ['int("7")', '7'], ['float(2)', '2.0'], ['bool(0)', 'False']], verify: 'py-expr' },
      ],
    },
  ],
  boss: {
    zoneId: 'python',
    name: tx('Kvadratlar ustasi', 'Мастер квадратов', 'Square Master'),
    task: tx(
      'for va range() yordamida 1 dan 5 gacha sonlarning kvadratlarini chiqaring (har biri yangi qatorda).',
      'С помощью for и range() выведи квадраты чисел от 1 до 5 (каждый с новой строки).',
      'Using for and range(), print the squares of the numbers 1 to 5, each on its own line.',
    ),
    mode: 'python',
    starter: { py: '# 👇\n\n' },
    solution: { py: 'for n in range(1, 6):\n    print(n * n)\n' },
    checks: [
      {
        label: tx('for … in range() sikli', 'Цикл for … in range()', 'A for … in range() loop'),
        spec: { id: 'loop', label: '', type: 'source_regex', file: 'py', pattern: 'for\\s+\\w+\\s+in\\s+range\\s*\\(' },
      },
      { label: tx('Natija: 1 4 9 16 25', 'Вывод: 1 4 9 16 25', 'Prints 1 4 9 16 25'), spec: { id: 'out', label: '', type: 'output_equals', expected: '1\n4\n9\n16\n25' } },
    ],
    xp: 50,
  },
};
