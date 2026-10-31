import type { CourseDraft } from './types';

export const javascriptCourse: CourseDraft = {
  course: {
    id: 'javascript',
    title: 'JavaScript Laboratory',
    tagline: 'Bring pages to life with logic and interactivity.',
    description:
      'Experiment with the language of the web: values, conditions, loops, functions, objects, the DOM and asynchronous code. Console exercises run in an isolated Web Worker; DOM exercises run in a sandboxed live preview.',
    track: 'javascript',
    objectives: [
      'Store and transform data with variables and operators',
      'Control program flow with conditions and loops',
      'Write reusable functions and model data with objects',
      'Manipulate the DOM and respond to events',
      'Handle asynchronous work with promises and async/await',
    ],
    prerequisites: ['html'],
    requiredLevel: 3,
    buildingId: 'js-lab',
    accent: '#facc15',
    estimatedHours: 4,
    order: 3,
  },
  lessons: [
    {
      lesson: {
        id: 'js-1',
        title: 'Values, Variables & Output',
        summary: 'let, const, strings, numbers and template literals.',
        difficulty: 'beginner',
        durationMinutes: 12,
        xp: 20,
        quizXp: 15,
        blocks: [
          {
            type: 'text',
            md: 'Variables are named boxes for values. Use `const` for values that never get reassigned and `let` for values that change. (Avoid the older `var`.)',
          },
          {
            type: 'code',
            language: 'javascript',
            code: `const city = 'Code World';\nlet visitors = 41;\nvisitors = visitors + 1;\n\nconsole.log(city);       // Code World\nconsole.log(visitors);   // 42`,
          },
          { type: 'heading', text: 'Template literals' },
          {
            type: 'text',
            md: 'Backtick strings can embed expressions with `${…}` — far easier than gluing strings together with `+`.',
          },
          {
            type: 'code',
            language: 'javascript',
            code: `const name = 'Nova';\nconst level = 3;\nconsole.log(\`\${name} reached level \${level}!\`);`,
          },
          {
            type: 'callout',
            variant: 'info',
            md: '`console.log` prints to the **Console** panel. It is your main tool for seeing what a program is doing.',
          },
        ],
      },
      exercises: [
        {
          id: 'js-1-ex1',
          title: 'Level up Ada',
          instructions:
            '1. Declare a constant `name` with the value `"Ada"`\n2. Declare a variable `level` starting at `1`\n3. Increase `level` by one\n4. Print exactly: **Ada is level 2** using a template literal',
          mode: 'console',
          starter: { js: '// Declare name and level, then print the message\n\n' },
          solution: { js: "const name = 'Ada';\nlet level = 1;\nlevel += 1;\nconsole.log(`${name} is level ${level}`);\n" },
          hints: ['`level += 1` or `level++` both increase the value.', 'Template literal: `` `${name} is level ${level}` ``'],
          xp: 30,
          checks: [
            { id: 'const', label: 'Uses const for name', type: 'source_regex', file: 'js', pattern: '\\bconst\\s+name\\b' },
            { id: 'let', label: 'Uses let for level', type: 'source_regex', file: 'js', pattern: '\\blet\\s+level\\b' },
            { id: 'template', label: 'Uses a template literal', type: 'source_regex', file: 'js', pattern: '`[^`]*\\$\\{[^`]*`' },
            { id: 'out', label: 'Prints “Ada is level 2”', type: 'output_equals', expected: 'Ada is level 2' },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'Which keyword declares a variable that will be reassigned?',
          options: ['const', 'let', 'static', 'final'],
          answer: 1,
          explanation: 'let allows reassignment; const does not.',
        },
        {
          prompt: 'What does `${score}` do inside a backtick string?',
          options: ['Prints a dollar sign', 'Inserts the value of score', 'Creates an object', 'Nothing'],
          answer: 1,
          explanation: 'Template literals interpolate expressions inside ${ }.',
        },
        {
          prompt: 'What happens if you reassign a const variable?',
          options: ['It works silently', 'A TypeError is thrown', 'It becomes let', 'The page reloads'],
          answer: 1,
          explanation: 'Assigning to a constant throws “Assignment to constant variable.”',
        },
      ],
    },
    {
      lesson: {
        id: 'js-2',
        title: 'Conditions & Comparisons',
        summary: 'Make decisions with if/else and logical operators.',
        difficulty: 'beginner',
        durationMinutes: 14,
        xp: 20,
        quizXp: 15,
        blocks: [
          {
            type: 'text',
            md: 'Programs make decisions with `if`, `else if` and `else`. Conditions evaluate to `true` or `false`.',
          },
          {
            type: 'code',
            language: 'javascript',
            code: `const energy = 65;\n\nif (energy >= 80) {\n  console.log('Full power');\n} else if (energy >= 40) {\n  console.log('Running normally');\n} else {\n  console.log('Recharge needed');\n}`,
          },
          {
            type: 'text',
            md: 'Always compare with **strict equality** `===` and `!==`. The loose `==` converts types first, so `0 == ""` is `true` — a classic bug.\n\nCombine conditions with `&&` (and), `||` (or) and `!` (not).',
          },
        ],
      },
      exercises: [
        {
          id: 'js-2-ex1',
          title: 'Grade calculator',
          instructions:
            'Write a function `grade(score)` that returns:\n\n- `"A"` for 90 and above\n- `"B"` for 75–89\n- `"C"` for 50–74\n- `"F"` below 50\n\nThe starter code already prints the results for 95, 80, 60 and 10.',
          mode: 'console',
          starter: { js: '// Write the grade function here\n\n\nconsole.log(grade(95));\nconsole.log(grade(80));\nconsole.log(grade(60));\nconsole.log(grade(10));\n' },
          solution: {
            js: "function grade(score) {\n  if (score >= 90) return 'A';\n  if (score >= 75) return 'B';\n  if (score >= 50) return 'C';\n  return 'F';\n}\n\nconsole.log(grade(95));\nconsole.log(grade(80));\nconsole.log(grade(60));\nconsole.log(grade(10));\n",
          },
          hints: ['Check the highest threshold first, then work down.', 'A `return` exits the function immediately.'],
          xp: 30,
          checks: [
            { id: 'fn', label: 'Defines grade()', type: 'source_regex', file: 'js', pattern: '(function\\s+grade\\s*\\(|(const|let)\\s+grade\\s*=)' },
            { id: 'if', label: 'Uses if statements', type: 'source_regex', file: 'js', pattern: '\\bif\\s*\\(' },
            { id: 'out', label: 'Prints A, B, C, F', type: 'output_equals', expected: 'A\nB\nC\nF' },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'What is the value of 5 === "5"?',
          options: ['true', 'false', 'undefined', 'It throws an error'],
          answer: 1,
          explanation: 'Strict equality compares type too: number vs string is false.',
        },
        {
          prompt: 'Which operator means “and”?',
          options: ['||', '&&', '!', '??'],
          answer: 1,
          explanation: '&& is logical AND.',
        },
        {
          prompt: 'In an if / else if chain, how many branches run?',
          options: ['All that match', 'At most one — the first that matches', 'Always the else', 'The last that matches'],
          answer: 1,
          explanation: 'Evaluation stops at the first true condition.',
        },
      ],
    },
    {
      lesson: {
        id: 'js-3',
        title: 'Loops & Arrays',
        summary: 'Store collections and process them with loops and array methods.',
        difficulty: 'beginner',
        durationMinutes: 16,
        xp: 20,
        quizXp: 15,
        blocks: [
          {
            type: 'text',
            md: 'Arrays hold ordered lists. Indexes start at **0**, and `.length` tells you how many items there are.',
          },
          {
            type: 'code',
            language: 'javascript',
            code: `const towers = ['HTML', 'CSS', 'JS'];\n\nfor (const tower of towers) {\n  console.log(tower);\n}\n\nconsole.log(towers[0]);      // HTML\nconsole.log(towers.length);  // 3`,
          },
          { type: 'heading', text: 'Array methods' },
          {
            type: 'text',
            md: '- `map` transforms every item into a new array\n- `filter` keeps items that pass a test\n- `reduce` combines items into a single value',
          },
          {
            type: 'code',
            language: 'javascript',
            code: `const xp = [10, 25, 40];\nconst doubled = xp.map((n) => n * 2);         // [20, 50, 80]\nconst big = xp.filter((n) => n > 20);         // [25, 40]\nconst total = xp.reduce((sum, n) => sum + n, 0); // 75`,
          },
        ],
      },
      exercises: [
        {
          id: 'js-3-ex1',
          title: 'Analyze the scores',
          instructions:
            'Given `scores`:\n\n1. Compute the `total` of all scores and print it\n2. Use **`filter`** to keep scores greater than 15, then print them joined with `", "`\n\nExpected output:\n\n```\n112\n45, 30, 18\n```',
          mode: 'console',
          starter: { js: 'const scores = [12, 45, 7, 30, 18];\n\n// 1. total\n\n// 2. high scores with filter\n' },
          solution: {
            js: "const scores = [12, 45, 7, 30, 18];\n\nconst total = scores.reduce((sum, n) => sum + n, 0);\nconsole.log(total);\n\nconst highs = scores.filter((n) => n > 15);\nconsole.log(highs.join(', '));\n",
          },
          hints: ['`scores.reduce((sum, n) => sum + n, 0)`', "`array.join(', ')` turns an array into a string."],
          xp: 30,
          checks: [
            { id: 'filter', label: 'Uses .filter()', type: 'source_regex', file: 'js', pattern: '\\.filter\\s*\\(' },
            { id: 'no-hardcode', label: 'Does not hard-code the total', type: 'source_not_regex', file: 'js', pattern: 'console\\.log\\(\\s*112\\s*\\)' },
            { id: 'out', label: 'Prints the total and the high scores', type: 'output_equals', expected: '112\n45, 30, 18' },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'What is the index of the first item in an array?',
          options: ['1', '0', '-1', 'It depends'],
          answer: 1,
          explanation: 'JavaScript arrays are zero-indexed.',
        },
        {
          prompt: 'Which method returns a new array with only matching items?',
          options: ['map', 'filter', 'forEach', 'push'],
          answer: 1,
          explanation: 'filter keeps items for which the callback returns true.',
        },
        {
          prompt: 'What does [1, 2, 3].map((n) => n * 10) return?',
          options: ['60', '[10, 20, 30]', '[1, 2, 3]', 'undefined'],
          answer: 1,
          explanation: 'map transforms each element and returns a new array.',
        },
      ],
    },
    {
      lesson: {
        id: 'js-4',
        title: 'Functions & Objects',
        summary: 'Reusable logic and structured data with destructuring.',
        difficulty: 'intermediate',
        durationMinutes: 18,
        xp: 25,
        quizXp: 15,
        blocks: [
          {
            type: 'text',
            md: 'Objects group related data as **key–value pairs**. Access values with dot notation (`player.name`) or brackets (`player["name"]`).',
          },
          {
            type: 'code',
            language: 'javascript',
            code: `const player = {\n  name: 'Orion',\n  xp: 340,\n  skills: ['html', 'css'],\n};\n\nplayer.skills.push('js');\nconsole.log(player.skills.length); // 3`,
          },
          { type: 'heading', text: 'Arrow functions and destructuring' },
          {
            type: 'text',
            md: 'Destructuring unpacks properties into variables — very handy in function parameters.',
          },
          {
            type: 'code',
            language: 'javascript',
            code: `const summary = ({ name, xp }) => \`\${name}: \${xp} XP\`;\nconsole.log(summary(player)); // Orion: 340 XP`,
          },
        ],
      },
      exercises: [
        {
          id: 'js-4-ex1',
          title: 'Player profile',
          instructions:
            '1. Write a function `describe` that **destructures** `{ name, xp, skills }` from its parameter and returns `"<name> (<xp> XP) knows <skills joined by \', \'>"`\n2. Print `describe(player)`\n3. Add `"js"` to `player.skills` and print the new number of skills\n\nExpected output:\n\n```\nNova (120 XP) knows html, css\n3\n```',
          mode: 'console',
          starter: { js: "const player = { name: 'Nova', xp: 120, skills: ['html', 'css'] };\n\n// write describe() here\n\n" },
          solution: {
            js: "const player = { name: 'Nova', xp: 120, skills: ['html', 'css'] };\n\nfunction describe({ name, xp, skills }) {\n  return `${name} (${xp} XP) knows ${skills.join(', ')}`;\n}\n\nconsole.log(describe(player));\nplayer.skills.push('js');\nconsole.log(player.skills.length);\n",
          },
          hints: ['Destructuring parameter: `function describe({ name, xp, skills }) { … }`', '`array.push(value)` adds to the end.'],
          xp: 40,
          checks: [
            { id: 'destructure', label: 'Destructures the parameter', type: 'source_regex', file: 'js', pattern: '\\(\\s*\\{\\s*[\\w\\s,]*name[\\w\\s,]*\\}\\s*\\)' },
            { id: 'push', label: 'Adds a skill with push()', type: 'source_regex', file: 'js', pattern: '\\.push\\s*\\(' },
            { id: 'out', label: 'Prints the profile and the skill count', type: 'output_equals', expected: 'Nova (120 XP) knows html, css\n3' },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'How do you read the name property of an object called user?',
          options: ['user->name', 'user.name', 'user::name', 'name(user)'],
          answer: 1,
          explanation: 'Dot notation is the common way to access properties.',
        },
        {
          prompt: 'What does const { xp } = player; do?',
          options: ['Copies the whole object', 'Creates a variable xp from player.xp', 'Deletes xp', 'Creates an array'],
          answer: 1,
          explanation: 'Object destructuring extracts properties into variables.',
        },
        {
          prompt: 'Can you push into an array declared with const?',
          options: ['No, const arrays are frozen', 'Yes — const prevents reassignment, not mutation', 'Only once', 'Only with let'],
          answer: 1,
          explanation: 'const stops the binding from being reassigned; the array itself can still change.',
        },
      ],
    },
    {
      lesson: {
        id: 'js-5',
        title: 'The DOM & Events',
        summary: 'Select elements, change content and react to clicks.',
        difficulty: 'intermediate',
        durationMinutes: 18,
        xp: 25,
        quizXp: 15,
        blocks: [
          {
            type: 'text',
            md: 'The DOM is a live tree of objects representing the page. JavaScript can read and change it.',
          },
          {
            type: 'code',
            language: 'javascript',
            code: `const button = document.querySelector('#launch');\nconst status = document.querySelector('.status');\n\nbutton.addEventListener('click', () => {\n  status.textContent = 'Launched!';\n  status.classList.add('active');\n});`,
          },
          {
            type: 'text',
            md: '- `querySelector` finds the first element matching a CSS selector\n- `textContent` reads or replaces text safely\n- `addEventListener` runs a function when an event happens\n- `classList` adds, removes and toggles classes',
          },
          {
            type: 'callout',
            variant: 'warning',
            md: 'Prefer `textContent` over `innerHTML` for user-provided text — `innerHTML` parses HTML and can introduce cross-site scripting (XSS) vulnerabilities.',
          },
        ],
      },
      exercises: [
        {
          id: 'js-5-ex1',
          title: 'Like button',
          instructions:
            'Make the like button work:\n\n1. Select the `#like` button and the `#count` element\n2. When the button is **clicked**, increase a counter by one\n3. Show the new number in `#count` using `textContent`\n\nThe checker will click your button three times and expect `#count` to show **3**.',
          mode: 'web',
          starter: {
            html: '<button id="like">❤ Like</button>\n<p>Likes: <span id="count">0</span></p>\n',
            css: 'body { font-family: system-ui, sans-serif; padding: 2rem; }\nbutton { font-size: 1rem; padding: .5rem 1rem; border-radius: 999px; border: 1px solid #f43f5e; background: #fff1f2; cursor: pointer; }\n',
            js: '// Select the elements and add a click listener\n\n',
          },
          solution: {
            html: '<button id="like">❤ Like</button>\n<p>Likes: <span id="count">0</span></p>\n',
            css: 'body { font-family: system-ui, sans-serif; padding: 2rem; }\nbutton { font-size: 1rem; padding: .5rem 1rem; border-radius: 999px; border: 1px solid #f43f5e; background: #fff1f2; cursor: pointer; }\n',
            js: "const button = document.querySelector('#like');\nconst count = document.querySelector('#count');\nlet likes = 0;\n\nbutton.addEventListener('click', () => {\n  likes += 1;\n  count.textContent = likes;\n});\n",
          },
          hints: ['Keep the counter in a `let` variable outside the listener.', "`button.addEventListener('click', () => { … })`"],
          xp: 40,
          checks: [
            { id: 'listener', label: 'Adds a click event listener', type: 'source_regex', file: 'js', pattern: "addEventListener\\s*\\(\\s*['\"`]click['\"`]" },
            { id: 'text', label: 'Updates text with textContent', type: 'source_regex', file: 'js', pattern: '\\.textContent\\s*=' },
            {
              id: 'runtime',
              label: 'Clicking three times shows 3',
              type: 'dom_runtime',
              selector: '#count',
              textEquals: '3',
              before: [{ type: 'click', selector: '#like', times: 3 }],
            },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'What does document.querySelector(".card") return?',
          options: ['All .card elements', 'The first element with class card', 'A CSS rule', 'A string'],
          answer: 1,
          explanation: 'querySelector returns the first match (querySelectorAll returns all).',
        },
        {
          prompt: 'Why prefer textContent over innerHTML for user input?',
          options: ['It is shorter', 'It does not parse HTML, preventing XSS', 'It is the only one that works', 'It adds styling'],
          answer: 1,
          explanation: 'innerHTML parses markup; untrusted input could inject scripts.',
        },
        {
          prompt: 'Which method runs code when a button is clicked?',
          options: ['onClick()', 'addEventListener("click", fn)', 'listen("click")', 'button.run(fn)'],
          answer: 1,
          explanation: 'addEventListener registers a handler for an event type.',
        },
      ],
    },
    {
      lesson: {
        id: 'js-6',
        title: 'Async JavaScript',
        summary: 'Promises, async/await and handling errors.',
        difficulty: 'advanced',
        durationMinutes: 20,
        xp: 30,
        quizXp: 20,
        blocks: [
          {
            type: 'text',
            md: 'Some work takes time — network requests, timers, file reads. JavaScript doesn’t wait; it returns a **Promise**, an object representing a future value.',
          },
          {
            type: 'code',
            language: 'javascript',
            code: `const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));\n\nasync function boot() {\n  console.log('Booting…');\n  await wait(100);       // pause this function, not the program\n  console.log('Online');\n}\n\nboot();`,
          },
          {
            type: 'text',
            md: '`await` can only be used inside `async` functions (or at the top level of modules). Wrap awaited code in `try/catch` to handle rejected promises.',
          },
          {
            type: 'code',
            language: 'javascript',
            code: `async function load() {\n  try {\n    const response = await fetch('/api/missions');\n    if (!response.ok) throw new Error('HTTP ' + response.status);\n    return await response.json();\n  } catch (error) {\n    console.error('Could not load missions:', error.message);\n  }\n}`,
          },
          {
            type: 'callout',
            variant: 'info',
            md: 'The exercise sandbox blocks network access, so `fetch` is shown here as an example only.',
          },
        ],
      },
      exercises: [
        {
          id: 'js-6-ex1',
          title: 'Launch countdown',
          instructions:
            '1. Write `wait(ms)` that returns a Promise resolving after `ms` milliseconds\n2. Write an **async** function `launch()` that prints 3, 2, 1 — waiting ~10ms between numbers with `await wait(10)` — then prints **Liftoff!**\n3. Call `launch()`\n\nExpected output:\n\n```\n3\n2\n1\nLiftoff!\n```',
          mode: 'console',
          starter: { js: '// 1. wait(ms)\n\n// 2. async launch()\n\n// 3. call it\n' },
          solution: {
            js: "const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));\n\nasync function launch() {\n  for (let i = 3; i > 0; i--) {\n    console.log(i);\n    await wait(10);\n  }\n  console.log('Liftoff!');\n}\n\nlaunch();\n",
          },
          hints: ['`new Promise((resolve) => setTimeout(resolve, ms))`', 'A `for` loop counting down from 3 works well with `await` inside.'],
          xp: 50,
          checks: [
            { id: 'promise', label: 'Creates a Promise', type: 'source_regex', file: 'js', pattern: 'new\\s+Promise\\s*\\(' },
            { id: 'async', label: 'Uses an async function', type: 'source_regex', file: 'js', pattern: 'async\\s+(function\\b|\\(|\\w+\\s*=>)' },
            { id: 'await', label: 'Uses await', type: 'source_regex', file: 'js', pattern: '\\bawait\\s+' },
            { id: 'out', label: 'Counts down and prints Liftoff!', type: 'output_equals', expected: '3\n2\n1\nLiftoff!' },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'What does an async function always return?',
          options: ['undefined', 'A Promise', 'A string', 'An array'],
          answer: 1,
          explanation: 'async functions wrap their return value in a Promise.',
        },
        {
          prompt: 'What does await do?',
          options: ['Blocks the whole browser', 'Pauses the async function until the promise settles', 'Cancels a promise', 'Creates a thread'],
          answer: 1,
          explanation: 'Only the async function is paused; the rest of the program keeps running.',
        },
        {
          prompt: 'How do you handle a rejected promise with await?',
          options: ['if/else', 'try/catch', 'switch', 'You can’t'],
          answer: 1,
          explanation: 'A rejected awaited promise throws, so try/catch handles it.',
        },
      ],
    },
  ],
};
