import type { CourseDraft } from './types';

const fizzbuzz = Array.from({ length: 15 }, (_, i) => {
  const n = i + 1;
  return n % 15 === 0 ? 'FizzBuzz' : n % 3 === 0 ? 'Fizz' : n % 5 === 0 ? 'Buzz' : String(n);
}).join('\n');

export const pythonCourse: CourseDraft = {
  course: {
    id: 'python',
    title: 'Python Center',
    tagline: 'Readable, powerful code for automation, data and beyond.',
    description:
      'Learn Python from first print to classes. Programs run in an isolated Python runtime — CPython compiled to WebAssembly inside a sandboxed worker, or your own isolated execution service.',
    track: 'python',
    objectives: [
      'Print output and format strings with f-strings',
      'Work with numbers, strings and operators',
      'Control flow with if/elif/else, for and while',
      'Organise data with lists, dictionaries and comprehensions',
      'Write functions, use modules and model objects with classes',
    ],
    prerequisites: [],
    requiredLevel: 2,
    buildingId: 'python-center',
    accent: '#a3e635',
    estimatedHours: 4,
    order: 4,
  },
  lessons: [
    {
      lesson: {
        id: 'py-1',
        title: 'Hello, Python',
        summary: 'print(), variables and f-strings.',
        difficulty: 'beginner',
        durationMinutes: 10,
        xp: 20,
        quizXp: 15,
        blocks: [
          {
            type: 'text',
            md: 'Python is famous for readable syntax. There are no semicolons or curly braces — **indentation** defines blocks.',
          },
          { type: 'code', language: 'python', code: 'city = "Code World"\nfloors = 42\nprint(city)\nprint(floors + 1)' },
          { type: 'heading', text: 'f-strings' },
          {
            type: 'text',
            md: 'Prefix a string with `f` to embed expressions inside `{}` — the clearest way to format output.',
          },
          { type: 'code', language: 'python', code: 'name = "Grace"\nlanguages = 3\nprint(f"{name} knows {languages} languages")\nprint(f"Next year: {languages + 1}")' },
          {
            type: 'callout',
            variant: 'tip',
            md: '`len(value)` returns the length of a string, list or other collection.',
          },
        ],
      },
      exercises: [
        {
          id: 'py-1-ex1',
          title: 'A famous programmer',
          instructions:
            '1. Create `name = "Ada"` and `year = 1815`\n2. Print **Ada was born in 1815** using an f-string\n3. Print the length of `name`\n\nExpected output:\n\n```\nAda was born in 1815\n3\n```',
          mode: 'python',
          starter: { py: '# Create the variables and print the results\n\n' },
          solution: { py: 'name = "Ada"\nyear = 1815\nprint(f"{name} was born in {year}")\nprint(len(name))\n' },
          hints: ['`print(f"{name} was born in {year}")`', '`len(name)` counts characters.'],
          xp: 30,
          checks: [
            { id: 'fstring', label: 'Uses an f-string', type: 'source_regex', file: 'py', pattern: '\\bf["\']' },
            { id: 'len', label: 'Uses len()', type: 'source_regex', file: 'py', pattern: '\\blen\\s*\\(' },
            { id: 'out', label: 'Prints the sentence and the length', type: 'output_equals', expected: 'Ada was born in 1815\n3' },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'How does Python mark a block of code (e.g. the body of an if)?',
          options: ['Curly braces', 'Indentation', 'BEGIN/END', 'Semicolons'],
          answer: 1,
          explanation: 'Consistent indentation (4 spaces by convention) defines blocks.',
        },
        {
          prompt: 'What does print(f"{2 + 3}") output?',
          options: ['{2 + 3}', '5', '2 + 3', 'f5'],
          answer: 1,
          explanation: 'Expressions inside f-string braces are evaluated.',
        },
        {
          prompt: 'What does len("code") return?',
          options: ['3', '4', '5', '"code"'],
          answer: 1,
          explanation: 'The string has four characters.',
        },
      ],
    },
    {
      lesson: {
        id: 'py-2',
        title: 'Numbers & Strings',
        summary: 'Arithmetic operators and handy string methods.',
        difficulty: 'beginner',
        durationMinutes: 12,
        xp: 20,
        quizXp: 15,
        blocks: [
          {
            type: 'text',
            md: 'Python has integers (`int`) and decimals (`float`). Beyond `+ - * /` it offers:\n\n- `//` floor division (whole part)\n- `%` remainder (modulo)\n- `**` exponent',
          },
          { type: 'code', language: 'python', code: 'print(17 / 5)   # 3.4\nprint(17 // 5)  # 3\nprint(17 % 5)   # 2\nprint(2 ** 10)  # 1024' },
          { type: 'heading', text: 'String methods' },
          { type: 'code', language: 'python', code: 'title = "  code world  "\nprint(title.strip())         # "code world"\nprint(title.strip().upper()) # "CODE WORLD"\nprint("a,b,c".split(","))    # [\'a\', \'b\', \'c\']' },
        ],
      },
      exercises: [
        {
          id: 'py-2-ex1',
          title: 'Mission timer',
          instructions:
            'A mission lasted `minutes = 135`.\n\n1. Using `//` and `%`, print it as **2h 15m**\n2. Print `"code world"` converted to title case with `.title()`\n\nExpected output:\n\n```\n2h 15m\nCode World\n```',
          mode: 'python',
          starter: { py: 'minutes = 135\nlabel = "code world"\n\n' },
          solution: { py: 'minutes = 135\nlabel = "code world"\n\nhours = minutes // 60\nrest = minutes % 60\nprint(f"{hours}h {rest}m")\nprint(label.title())\n' },
          hints: ['`minutes // 60` gives whole hours; `minutes % 60` gives the remaining minutes.'],
          xp: 30,
          checks: [
            { id: 'floor', label: 'Uses floor division //', type: 'source_regex', file: 'py', pattern: '//' },
            { id: 'mod', label: 'Uses modulo %', type: 'source_regex', file: 'py', pattern: 'minutes\\s*%\\s*60' },
            { id: 'title', label: 'Uses .title()', type: 'source_regex', file: 'py', pattern: '\\.title\\s*\\(' },
            { id: 'out', label: 'Prints 2h 15m and Code World', type: 'output_equals', expected: '2h 15m\nCode World' },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'What is 17 % 5?',
          options: ['3', '2', '3.4', '85'],
          answer: 1,
          explanation: '% returns the remainder: 17 = 3×5 + 2.',
        },
        {
          prompt: 'What is 2 ** 3?',
          options: ['6', '8', '9', '23'],
          answer: 1,
          explanation: '** is exponentiation: 2³ = 8.',
        },
        {
          prompt: 'What does "  hi ".strip() return?',
          options: ['"  hi "', '"hi"', '"HI"', '["hi"]'],
          answer: 1,
          explanation: 'strip() removes leading and trailing whitespace.',
        },
      ],
    },
    {
      lesson: {
        id: 'py-3',
        title: 'Conditions & Loops',
        summary: 'if/elif/else, for loops over ranges, and while.',
        difficulty: 'beginner',
        durationMinutes: 15,
        xp: 20,
        quizXp: 15,
        blocks: [
          {
            type: 'code',
            language: 'python',
            code: 'battery = 35\n\nif battery > 80:\n    print("Fully charged")\nelif battery > 20:\n    print("OK")\nelse:\n    print("Charge soon")',
          },
          {
            type: 'text',
            md: '`for` loops iterate over any sequence. `range(start, stop)` produces numbers from `start` up to, **but not including**, `stop`.',
          },
          { type: 'code', language: 'python', code: 'for floor in range(1, 4):\n    print(f"Floor {floor}")\n\ncount = 3\nwhile count > 0:\n    print(count)\n    count -= 1' },
          {
            type: 'callout',
            variant: 'warning',
            md: 'A `while` loop whose condition never becomes false runs forever. The sandbox stops runaway programs after a few seconds.',
          },
        ],
      },
      exercises: [
        {
          id: 'py-3-ex1',
          title: 'FizzBuzz 15',
          instructions:
            'Print the numbers **1 to 15**, one per line, but:\n\n- print `Fizz` for multiples of 3\n- print `Buzz` for multiples of 5\n- print `FizzBuzz` for multiples of both\n\nUse a `for` loop with `range`.',
          mode: 'python',
          starter: { py: '# Classic FizzBuzz for 1..15\n\n' },
          solution: {
            py: 'for n in range(1, 16):\n    if n % 15 == 0:\n        print("FizzBuzz")\n    elif n % 3 == 0:\n        print("Fizz")\n    elif n % 5 == 0:\n        print("Buzz")\n    else:\n        print(n)\n',
          },
          hints: ['Check the “both” case (divisible by 15) first.', '`range(1, 16)` includes 15.'],
          xp: 30,
          checks: [
            { id: 'for', label: 'Uses a for loop with range()', type: 'source_regex', file: 'py', pattern: 'for\\s+\\w+\\s+in\\s+range\\s*\\(' },
            { id: 'elif', label: 'Uses elif', type: 'source_regex', file: 'py', pattern: '\\belif\\b' },
            { id: 'out', label: 'Prints the correct sequence', type: 'output_equals', expected: fizzbuzz },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'Which numbers does range(2, 5) produce?',
          options: ['2, 3, 4, 5', '2, 3, 4', '3, 4, 5', '2, 5'],
          answer: 1,
          explanation: 'The stop value is excluded.',
        },
        {
          prompt: 'What keyword means “else if” in Python?',
          options: ['elseif', 'elif', 'else if', 'when'],
          answer: 1,
          explanation: 'Python uses elif.',
        },
        {
          prompt: 'When does a while loop stop?',
          options: ['After 10 iterations', 'When its condition becomes False', 'Never', 'When it prints'],
          answer: 1,
          explanation: 'The loop re-checks the condition before each iteration.',
        },
      ],
    },
    {
      lesson: {
        id: 'py-4',
        title: 'Lists & Dictionaries',
        summary: 'Collections, comprehensions and key–value data.',
        difficulty: 'intermediate',
        durationMinutes: 18,
        xp: 25,
        quizXp: 15,
        blocks: [
          {
            type: 'code',
            language: 'python',
            code: 'skills = ["html", "css"]\nskills.append("python")\nprint(skills[0], len(skills))\n\nscores = {"ada": 92, "linus": 78}\nscores["grace"] = 88\nfor name, score in scores.items():\n    print(name, score)',
          },
          { type: 'heading', text: 'Comprehensions' },
          {
            type: 'text',
            md: 'A **list comprehension** builds a list in one readable line: `[expression for item in iterable if condition]`.',
          },
          { type: 'code', language: 'python', code: 'numbers = [1, 2, 3, 4, 5, 6]\nevens = [n for n in numbers if n % 2 == 0]\nsquares = [n ** 2 for n in numbers]\nprint(evens)    # [2, 4, 6]\nprint(squares)  # [1, 4, 9, 16, 25, 36]' },
        ],
      },
      exercises: [
        {
          id: 'py-4-ex1',
          title: 'Honour roll',
          instructions:
            'Using the `scores` dictionary:\n\n1. Build a **list comprehension** of names with a score of **85 or more**, sorted alphabetically, and print them joined by `", "`\n2. Print the average score rounded to one decimal place\n\nExpected output:\n\n```\nada, grace\n86.0\n```',
          mode: 'python',
          starter: { py: 'scores = {"ada": 92, "linus": 78, "grace": 88}\n\n' },
          solution: {
            py: 'scores = {"ada": 92, "linus": 78, "grace": 88}\n\nhonours = sorted([name for name, score in scores.items() if score >= 85])\nprint(", ".join(honours))\n\naverage = sum(scores.values()) / len(scores)\nprint(round(average, 1))\n',
          },
          hints: ['`[name for name, score in scores.items() if score >= 85]`', '`sum(scores.values()) / len(scores)`'],
          xp: 40,
          checks: [
            { id: 'comp', label: 'Uses a list comprehension', type: 'source_regex', file: 'py', pattern: '\\[[^\\]]+\\bfor\\b[^\\]]+\\bin\\b[^\\]]+\\]' },
            { id: 'items', label: 'Iterates with .items() or keys', type: 'source_regex', file: 'py', pattern: '\\.items\\(\\)|in\\s+scores\\b' },
            { id: 'out', label: 'Prints the honour roll and average', type: 'output_equals', expected: 'ada, grace\n86.0' },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'How do you add an item to the end of a list?',
          options: ['list.add(x)', 'list.append(x)', 'list.push(x)', 'list += x'],
          answer: 1,
          explanation: 'append adds a single item to the end.',
        },
        {
          prompt: 'What does d.items() give you when looping over a dict?',
          options: ['Only keys', 'Only values', '(key, value) pairs', 'Indexes'],
          answer: 2,
          explanation: 'items() yields key–value tuples.',
        },
        {
          prompt: 'What does [n * 2 for n in [1, 2, 3]] produce?',
          options: ['[1, 2, 3]', '[2, 4, 6]', '12', '[[2], [4], [6]]'],
          answer: 1,
          explanation: 'The comprehension doubles each element.',
        },
      ],
    },
    {
      lesson: {
        id: 'py-5',
        title: 'Functions & Modules',
        summary: 'def, parameters, return values and the standard library.',
        difficulty: 'intermediate',
        durationMinutes: 18,
        xp: 25,
        quizXp: 15,
        blocks: [
          {
            type: 'code',
            language: 'python',
            code: 'def greet(name, greeting="Hello"):\n    """Return a friendly greeting."""\n    return f"{greeting}, {name}!"\n\nprint(greet("Ada"))\nprint(greet("Linus", greeting="Hi"))',
          },
          {
            type: 'text',
            md: 'Parameters can have **default values**. A `return` statement sends a value back to the caller; without one, a function returns `None`.',
          },
          { type: 'heading', text: 'Modules' },
          {
            type: 'text',
            md: 'Python’s standard library is huge. Import a module to use it: `import math`, `import random`, `from datetime import date`.',
          },
          { type: 'code', language: 'python', code: 'import math\n\nprint(math.sqrt(81))   # 9.0\nprint(round(math.pi, 3))  # 3.142' },
        ],
      },
      exercises: [
        {
          id: 'py-5-ex1',
          title: 'Geometry toolkit',
          instructions:
            '1. Import the `math` module\n2. Write `area_of_circle(radius)` returning the area rounded to 2 decimals (`math.pi * r ** 2`)\n3. Write `greet(name, greeting="Hello")` returning `"<greeting>, <name>!"`\n\nThe starter prints the results. Expected output:\n\n```\n12.57\nHello, Ada!\nHi, Linus!\n```',
          mode: 'python',
          starter: { py: '# import math and define your functions here\n\n\nprint(area_of_circle(2))\nprint(greet("Ada"))\nprint(greet("Linus", "Hi"))\n' },
          solution: {
            py: 'import math\n\n\ndef area_of_circle(radius):\n    return round(math.pi * radius ** 2, 2)\n\n\ndef greet(name, greeting="Hello"):\n    return f"{greeting}, {name}!"\n\n\nprint(area_of_circle(2))\nprint(greet("Ada"))\nprint(greet("Linus", "Hi"))\n',
          },
          hints: ['`round(value, 2)` rounds to two decimals.', 'Default parameter: `def greet(name, greeting="Hello"):`'],
          xp: 40,
          checks: [
            { id: 'import', label: 'Imports math', type: 'source_regex', file: 'py', pattern: '^\\s*(import\\s+math|from\\s+math\\s+import)', flags: 'm' },
            { id: 'def', label: 'Defines area_of_circle', type: 'source_regex', file: 'py', pattern: 'def\\s+area_of_circle\\s*\\(' },
            { id: 'default', label: 'greet has a default greeting', type: 'source_regex', file: 'py', pattern: 'def\\s+greet\\s*\\([^)]*greeting\\s*=' },
            { id: 'out', label: 'Prints the expected results', type: 'output_equals', expected: '12.57\nHello, Ada!\nHi, Linus!' },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'What does a function return if it has no return statement?',
          options: ['0', 'None', 'An empty string', 'It raises an error'],
          answer: 1,
          explanation: 'Functions without return give back None.',
        },
        {
          prompt: 'What is a default parameter?',
          options: ['A required argument', 'A parameter with a value used when the caller omits it', 'The first parameter', 'A global variable'],
          answer: 1,
          explanation: 'Defaults make arguments optional.',
        },
        {
          prompt: 'How do you use the sqrt function from math?',
          options: ['sqrt(9) without imports', 'import math, then math.sqrt(9)', 'math::sqrt(9)', 'require("math")'],
          answer: 1,
          explanation: 'Import the module, then call functions via the module name.',
        },
      ],
    },
    {
      lesson: {
        id: 'py-6',
        title: 'Classes & Objects',
        summary: 'Model real things with classes, methods and __str__.',
        difficulty: 'advanced',
        durationMinutes: 20,
        xp: 30,
        quizXp: 20,
        blocks: [
          {
            type: 'text',
            md: 'A **class** is a blueprint; an **object** is an instance built from it. `__init__` runs when an object is created, and `self` refers to that object.',
          },
          {
            type: 'code',
            language: 'python',
            code: 'class Drone:\n    def __init__(self, name, speed=10):\n        self.name = name\n        self.speed = speed\n\n    def boost(self, amount):\n        self.speed += amount\n\n    def __str__(self):\n        return f"Drone {self.name} @ {self.speed} m/s"\n\nscout = Drone("Scout")\nscout.boost(5)\nprint(scout)  # Drone Scout @ 15 m/s',
          },
          {
            type: 'text',
            md: '`__str__` controls how an object prints. Classes can also **inherit** from others: `class RacingDrone(Drone):` reuses and extends behaviour.',
          },
        ],
      },
      exercises: [
        {
          id: 'py-6-ex1',
          title: 'Build a robot',
          instructions:
            'Create a class `Robot`:\n\n1. `__init__(self, name, battery=100)` stores both values\n2. `work(self, hours)` uses 10% battery per hour, never going below 0\n3. `__str__` returns `"Robot <name> (<battery>%)"`\n\nThe starter code prints the robot three times. Expected output:\n\n```\nRobot Nova (100%)\nRobot Nova (70%)\nRobot Nova (0%)\n```',
          mode: 'python',
          starter: { py: '# Define the Robot class here\n\n\nnova = Robot("Nova")\nprint(nova)\nnova.work(3)\nprint(nova)\nnova.work(20)\nprint(nova)\n' },
          solution: {
            py: 'class Robot:\n    def __init__(self, name, battery=100):\n        self.name = name\n        self.battery = battery\n\n    def work(self, hours):\n        self.battery = max(0, self.battery - 10 * hours)\n\n    def __str__(self):\n        return f"Robot {self.name} ({self.battery}%)"\n\n\nnova = Robot("Nova")\nprint(nova)\nnova.work(3)\nprint(nova)\nnova.work(20)\nprint(nova)\n',
          },
          hints: ['`max(0, value)` keeps a number from dropping below zero.', 'Remember `self` as the first parameter of every method.'],
          xp: 50,
          checks: [
            { id: 'class', label: 'Defines class Robot', type: 'source_regex', file: 'py', pattern: '^class\\s+Robot\\b', flags: 'm' },
            { id: 'init', label: 'Has __init__ with a default battery', type: 'source_regex', file: 'py', pattern: 'def\\s+__init__\\s*\\(\\s*self\\s*,\\s*name\\s*,\\s*battery\\s*=\\s*100' },
            { id: 'str', label: 'Implements __str__', type: 'source_regex', file: 'py', pattern: 'def\\s+__str__\\s*\\(\\s*self\\s*\\)' },
            { id: 'out', label: 'Prints the expected battery levels', type: 'output_equals', expected: 'Robot Nova (100%)\nRobot Nova (70%)\nRobot Nova (0%)' },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'What is self inside a method?',
          options: ['The class itself', 'The instance the method was called on', 'A keyword for globals', 'The parent class'],
          answer: 1,
          explanation: 'self refers to the specific object.',
        },
        {
          prompt: 'When does __init__ run?',
          options: ['When the program starts', 'When a new instance is created', 'When the object is printed', 'Never automatically'],
          answer: 1,
          explanation: 'Calling the class (e.g. Robot("Nova")) runs __init__.',
        },
        {
          prompt: 'What does class RacingDrone(Drone): mean?',
          options: ['RacingDrone contains a Drone', 'RacingDrone inherits from Drone', 'Drone inherits from RacingDrone', 'It is a syntax error'],
          answer: 1,
          explanation: 'The class in parentheses is the parent class.',
        },
      ],
    },
  ],
};
