import { tx } from '@/i18n';
import type { LearnCard } from '../types';

export const pythonLearn: Record<string, LearnCard[]> = {
  'py-1': [
    {
      icon: '🖨️',
      title: tx('print()', 'print()', 'print()'),
      text: tx(
        'print() ekranga chiqaradi. Matn qoʻshtirnoq ichida yoziladi, sonlar va hisob-kitob — qoʻshtirnoqsiz.',
        'print() выводит на экран. Текст пишут в кавычках, числа и вычисления — без кавычек.',
        'print() shows things on the screen. Text goes in quotes; numbers and maths go without quotes.',
      ),
      picture: {
        kind: 'parts',
        code: 'print("Hello")',
        lang: 'py',
        parts: [
          { text: 'print', label: tx('chiqarish buyrugʻi', 'команда вывода', 'the output command') },
          { text: '"Hello"', label: tx('matn qoʻshtirnoqda', 'текст в кавычках', 'text in quotes') },
        ],
      },
      example: { code: 'print("Hello")\nprint(2 + 3)', lang: 'py', result: { kind: 'terminal', lines: ['Hello', '5'] } },
    },
    {
      icon: '📦',
      title: tx('Oʻzgaruvchilar', 'Переменные', 'Variables'),
      text: tx(
        'nom = qiymat — qutiga qiymat qoʻyamiz. Python katta-kichik harfni farqlaydi: score va Score — ikki xil nom.',
        'имя = значение — кладём значение в коробку. Python различает регистр: score и Score — разные имена.',
        'name = value puts a value in a box. Python is case-sensitive: score and Score are different names.',
      ),
      picture: {
        kind: 'boxes',
        items: [
          { name: 'coins', value: '8' },
          { name: 'hero', value: '"Nova"' },
        ],
      },
      example: { code: 'coins = 5\ncoins = coins + 3\nhero = "Nova"\nprint(coins)\nprint(hero)', lang: 'py', result: { kind: 'terminal', lines: ['8', 'Nova'] } },
    },
    {
      icon: '💬',
      title: tx('f-satr va len()', 'f-строка и len()', 'f-strings & len()'),
      text: tx(
        'f"…{nom}…" — qavs ichidagi qiymat matnga qoʻyiladi. len() — matn yoki roʻyxat uzunligi.',
        'f"…{имя}…" — значение в фигурных скобках вставляется в текст. len() — длина строки или списка.',
        'f"…{name}…" puts the value in braces into the text. len() gives the length of a string or list.',
      ),
      example: { code: 'hero = "Nova"\nprint(f"Hello, {hero}!")\nprint(len(hero))', lang: 'py', result: { kind: 'terminal', lines: ['Hello, Nova!', '4'] } },
    },
    {
      icon: '➗',
      title: tx('Arifmetika', 'Арифметика', 'Arithmetic'),
      text: tx(
        '** — daraja, // — butun boʻlish, % — qoldiq. Matnni songa koʻpaytirsa, u takrorlanadi.',
        '** — степень, // — целочисленное деление, % — остаток. Строка, умноженная на число, повторяется.',
        '** is power, // is whole-number division, % is the remainder. A string times a number repeats.',
      ),
      picture: {
        kind: 'table',
        head: [tx('Ifoda', 'Выражение', 'Expression'), tx('Natija', 'Результат', 'Result')],
        rows: [
          ['2 ** 3', '8'],
          ['7 // 2', '3'],
          ['7 % 2', '1'],
          ['"ab" * 2', 'abab'],
        ],
        verify: 'py-expr',
      },
      example: { code: 'print(10 // 3)\nprint(10 % 3)\nprint("ha" * 3)', lang: 'py', result: { kind: 'terminal', lines: ['3', '1', 'hahaha'] } },
    },
  ],
  'py-2': [
    {
      icon: '🔀',
      title: tx('if / elif / else', 'if / elif / else', 'if / elif / else'),
      text: tx(
        'if — agar, elif — aks holda agar, else — aks holda. Shart oxirida : qoʻyiladi, ichki qatorlar 4 ta boʻsh joy bilan suriladi.',
        'if — если, elif — иначе если, else — иначе. После условия ставят :, а вложенные строки сдвигают на 4 пробела.',
        'if means “if”, elif “else if”, else “otherwise”. A condition ends with :, and the lines inside are indented by 4 spaces.',
      ),
      picture: {
        kind: 'parts',
        code: 'if n > 20:\n    print("big")\nelif n > 10:\n    print("medium")\nelse:\n    print("small")',
        lang: 'py',
        parts: [
          { text: ':', label: tx('har bir shart : bilan tugaydi', 'каждое условие кончается на :', 'every condition ends with :') },
          { text: '    print("big")', label: tx('4 boʻsh joy — shart ichida', '4 пробела — внутри условия', '4 spaces — inside the condition') },
          { text: 'elif', label: tx('aks holda, agar…', 'иначе, если…', 'else, if…') },
          { text: 'else', label: tx('qolgan barcha holatlar', 'все остальные случаи', 'every other case') },
        ],
      },
      example: { code: 'n = 15\nif n > 20:\n    print("big")\nelif n > 10:\n    print("medium")\nelse:\n    print("small")', lang: 'py', result: { kind: 'terminal', lines: ['medium'] } },
    },
    {
      icon: '🔁',
      title: tx('for va range()', 'for и range()', 'for & range()'),
      text: tx(
        'for i in range(3): — i ketma-ket 0, 1, 2 boʻladi (3 ning oʻzi kirmaydi). range(1, 4) — 1, 2, 3.',
        'for i in range(3): — i по очереди 0, 1, 2 (само 3 не входит). range(1, 4) — это 1, 2, 3.',
        'for i in range(3): makes i 0, 1, 2 in turn (3 itself is not included). range(1, 4) is 1, 2, 3.',
      ),
      picture: {
        kind: 'table',
        head: ['range', tx('Sonlar', 'Числа', 'Numbers')],
        rows: [
          ['range(3)', '0, 1, 2'],
          ['range(1, 4)', '1, 2, 3'],
          ['range(2, 5)', '2, 3, 4'],
        ],
      },
      example: { code: 'for i in range(1, 4):\n    print(i * 10)', lang: 'py', result: { kind: 'terminal', lines: ['10', '20', '30'] } },
    },
    {
      icon: '🔄',
      title: tx('while va juft/toq', 'while и чётность', 'while & even/odd'),
      text: tx(
        'while shart toʻgʻri boʻlguncha takrorlaydi: while lives > 0. n % 2 == 0 — son juft, aks holda toq.',
        'while повторяет, пока условие истинно: while lives > 0. n % 2 == 0 — число чётное, иначе нечётное.',
        'while repeats as long as the condition is true: while lives > 0. n % 2 == 0 means the number is even, otherwise odd.',
      ),
      example: { code: 'lives = 3\nwhile lives > 0:\n    print(lives)\n    lives -= 1\nprint(8 % 2 == 0)', lang: 'py', result: { kind: 'terminal', lines: ['3', '2', '1', 'True'] } },
    },
  ],
  'py-3': [
    {
      icon: '📚',
      title: tx('Roʻyxat', 'Список', 'List'),
      text: tx(
        'Roʻyxat [ ] ichida yoziladi. Indeks 0 dan boshlanadi, -1 — oxirgi element. Mavjud boʻlmagan indeks xato beradi (IndexError).',
        'Список пишут в [ ]. Индексы начинаются с 0, -1 — последний элемент. Несуществующий индекс даёт ошибку (IndexError).',
        'A list goes in [ ]. Indexes start at 0, and -1 is the last item. An index that doesn’t exist is an error (IndexError).',
      ),
      picture: { kind: 'list', name: 'colors', items: ['"red"', '"green"', '"blue"'], negative: true },
      example: { code: 'colors = ["red", "green", "blue"]\nprint(colors[0])\nprint(colors[-1])', lang: 'py', result: { kind: 'terminal', lines: ['red', 'blue'] } },
    },
    {
      icon: '➕',
      title: tx('append va yordamchilar', 'append и помощники', 'append & helpers'),
      text: tx(
        'append() roʻyxat oxiriga qoʻshadi. len, sorted, max, split — tayyor yordamchi funksiyalar.',
        'append() добавляет в конец списка. len, sorted, max, split — готовые функции-помощники.',
        'append() adds to the end of a list. len, sorted, max and split are ready-made helpers.',
      ),
      picture: {
        kind: 'table',
        head: [tx('Ifoda', 'Выражение', 'Expression'), tx('Natija', 'Результат', 'Result')],
        rows: [
          ['len([1, 2, 3])', '3'],
          ['sorted([3, 1, 2])', '[1, 2, 3]'],
          ['max([4, 9, 2])', '9'],
          ['"a,b".split(",")', "['a', 'b']"],
        ],
        verify: 'py-expr',
      },
      example: { code: 'items = ["sword"]\nitems.append("shield")\nprint(items)\nprint(len(items))', lang: 'py', result: { kind: 'terminal', lines: ["['sword', 'shield']", '2'] } },
    },
    {
      icon: '📖',
      title: tx('Lugʻat (dict)', 'Словарь (dict)', 'Dictionary (dict)'),
      text: tx(
        'Lugʻat — kalit: qiymat juftliklari { }. Qiymatni kalit orqali olamiz: hero["hp"].',
        'Словарь — пары ключ: значение в { }. Значение берут по ключу: hero["hp"].',
        'A dictionary holds key: value pairs in { }. Read a value by its key: hero["hp"].',
      ),
      picture: {
        kind: 'boxes',
        items: [
          { name: 'hero["name"]', value: '"Nova"' },
          { name: 'hero["hp"]', value: '3' },
        ],
      },
      example: { code: 'hero = {"name": "Nova", "hp": 3}\nprint(hero["hp"])\nprint(hero["name"])', lang: 'py', result: { kind: 'terminal', lines: ['3', 'Nova'] } },
    },
    {
      icon: '✨',
      title: tx('Roʻyxat yigʻuvchi', 'Генератор списка', 'List comprehension'),
      text: tx(
        '[n * 2 for n in nums] — har bir elementdan yangi roʻyxat yasaydi.',
        '[n * 2 for n in nums] создаёт новый список из каждого элемента.',
        '[n * 2 for n in nums] builds a new list from every item.',
      ),
      example: { code: 'print([n + 1 for n in [1, 2, 3]])', lang: 'py', result: { kind: 'terminal', lines: ['[2, 3, 4]'] } },
    },
  ],
  'py-4': [
    {
      icon: '⚙️',
      title: tx('def — funksiya', 'def — функция', 'def — a function'),
      text: tx(
        'Funksiya def bilan yaratiladi. Parametrlar qavsda, oxirida : qoʻyiladi. return natijani qaytaradi.',
        'Функцию создают через def. Параметры в скобках, в конце :. return возвращает результат.',
        'Make a function with def. Parameters go in parentheses, then a :. return gives back the result.',
      ),
      picture: {
        kind: 'parts',
        code: 'def add(a, b):\n    return a + b',
        lang: 'py',
        parts: [
          { text: 'def', label: tx('funksiya yaratish', 'создать функцию', 'define a function') },
          { text: 'add', label: tx('nomi', 'имя', 'its name') },
          { text: '(a, b)', label: tx('parametrlar', 'параметры', 'parameters') },
          { text: 'return', label: tx('natijani qaytaradi', 'возвращает результат', 'gives back the result') },
        ],
      },
      example: { code: 'def square(n):\n    return n * n\n\nprint(square(5))', lang: 'py', result: { kind: 'terminal', lines: ['25'] } },
    },
    {
      icon: '🎁',
      title: tx('Standart qiymat', 'Значение по умолчанию', 'Default value'),
      text: tx(
        'Parametrga standart qiymat berish mumkin: name="friend". Argument berilmasa, shu qiymat ishlatiladi.',
        'Параметру можно дать значение по умолчанию: name="friend". Если аргумент не передан, берётся оно.',
        'A parameter can have a default: name="friend". If no argument is passed, the default is used.',
      ),
      example: { code: 'def hello(name="friend"):\n    return "Hello " + name\n\nprint(hello())\nprint(hello("Ada"))', lang: 'py', result: { kind: 'terminal', lines: ['Hello friend', 'Hello Ada'] } },
    },
    {
      icon: '🚫',
      title: tx('return yoʻq — None', 'Нет return — None', 'No return — None'),
      text: tx(
        'return boʻlmasa, funksiya None qaytaradi. print() faqat chiqaradi, natija qaytarmaydi.',
        'Без return функция возвращает None. print() только выводит, но ничего не возвращает.',
        'Without return, a function gives back None. print() only shows text; it returns nothing.',
      ),
      example: { code: 'def shout():\n    print("Hey!")\n\nresult = shout()\nprint(result)', lang: 'py', result: { kind: 'terminal', lines: ['Hey!', 'None'] } },
    },
  ],
  'py-5': [
    {
      icon: '🏭',
      title: tx('Klass va obyekt', 'Класс и объект', 'Class & object'),
      text: tx(
        'Klass — obyektlar chizmasi. __init__ obyekt yaratilganda ishlaydi va boshlangʻich qiymatlarni beradi.',
        'Класс — чертёж для объектов. __init__ срабатывает при создании объекта и задаёт начальные значения.',
        'A class is a blueprint for objects. __init__ runs when an object is created and sets its starting values.',
      ),
      picture: {
        kind: 'parts',
        code: 'class Hero:\n    def __init__(self, name):\n        self.name = name',
        lang: 'py',
        parts: [
          { text: 'class Hero', label: tx('klass nomi', 'имя класса', 'the class name') },
          { text: '__init__', label: tx('yaratilganda ishlaydi', 'запускается при создании', 'runs on creation') },
          { text: 'self.name', label: tx('obyektning maydoni', 'поле объекта', 'the object’s field') },
        ],
      },
      example: { code: 'class Pet:\n    def __init__(self, name):\n        self.name = name\n\np = Pet("Rex")\nprint(p.name)', lang: 'py', result: { kind: 'terminal', lines: ['Rex'] } },
    },
    {
      icon: '🪞',
      title: tx('self', 'self', 'self'),
      text: tx(
        'self — obyektning oʻzi. Har bir metod birinchi parametr sifatida self oladi va maydonlarga self. orqali murojaat qiladi.',
        'self — сам объект. Каждый метод получает self первым параметром и обращается к полям через self.',
        'self is the object itself. Every method takes self as its first parameter and uses self. to reach fields.',
      ),
      example: {
        code: 'class Counter:\n    def __init__(self):\n        self.n = 10\n\n    def add(self):\n        self.n += 5\n\nc = Counter()\nc.add()\nprint(c.n)',
        lang: 'py',
        result: { kind: 'terminal', lines: ['15'] },
      },
    },
    {
      icon: '🔄',
      title: tx('Turni oʻzgartirish', 'Преобразование типов', 'Converting types'),
      text: tx(
        'str() — matnga, int() — butun songa, float() — kasr songa, bool() — True/False ga aylantiradi. 0 — False.',
        'str() — в строку, int() — в целое, float() — в дробное, bool() — в True/False. 0 — это False.',
        'str() makes text, int() a whole number, float() a decimal and bool() True/False. 0 is False.',
      ),
      picture: {
        kind: 'table',
        head: [tx('Ifoda', 'Выражение', 'Expression'), tx('Natija', 'Результат', 'Result')],
        rows: [
          ['str(5)', '5'],
          ['int("7")', '7'],
          ['float(2)', '2.0'],
          ['bool(0)', 'False'],
        ],
        verify: 'py-expr',
      },
      example: { code: 'age = int("12")\nprint(age + 1)', lang: 'py', result: { kind: 'terminal', lines: ['13'] } },
    },
  ],
};
