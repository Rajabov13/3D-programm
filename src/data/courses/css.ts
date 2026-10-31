import type { CourseDraft } from './types';

const cardHtml = `<div class="card">
  <h2 class="title">Design Studio Pass</h2>
  <p>Access to every floor of the CSS Design Studio.</p>
</div>
`;

export const cssCourse: CourseDraft = {
  course: {
    id: 'css',
    title: 'CSS Design Studio',
    tagline: 'Turn structure into beautiful, responsive interfaces.',
    description:
      'Style real interfaces with selectors, the box model, typography, Flexbox, Grid and media queries. Every exercise renders live so you can see each declaration change the design.',
    track: 'css',
    objectives: [
      'Target elements precisely with selectors',
      'Control spacing with the box model',
      'Set readable, scalable typography',
      'Build one-dimensional layouts with Flexbox',
      'Build two-dimensional layouts with CSS Grid',
      'Make layouts responsive with media queries',
    ],
    prerequisites: ['html'],
    requiredLevel: 2,
    buildingId: 'css-studio',
    accent: '#38bdf8',
    estimatedHours: 3,
    order: 2,
  },
  lessons: [
    {
      lesson: {
        id: 'css-1',
        title: 'Selectors & Colors',
        summary: 'How CSS rules find elements and paint them.',
        difficulty: 'beginner',
        durationMinutes: 12,
        xp: 20,
        quizXp: 15,
        blocks: [
          {
            type: 'text',
            md: 'A CSS **rule** has a selector and a block of declarations. Each declaration is a `property: value;` pair.',
          },
          {
            type: 'code',
            language: 'css',
            code: '/* type selector */\np { color: #cbd5e1; }\n\n/* class selector */\n.highlight { background-color: #0ea5e9; }\n\n/* id selector */\n#hero { color: white; }',
          },
          { type: 'heading', text: 'Color formats' },
          {
            type: 'text',
            md: 'Colors can be written as names (`navy`), hex (`#0f172a`), `rgb(15 23 42)` or `hsl(222 47% 11%)`. Hex and HSL are the most common in design systems.',
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Specificity',
            md: 'When rules conflict, more specific selectors win: id > class > type. Prefer classes — they are reusable and easy to override.',
          },
        ],
      },
      exercises: [
        {
          id: 'css-1-ex1',
          title: 'Paint the pass',
          instructions:
            'Style the card using the **CSS** tab:\n\n1. Give `body` a dark `background-color`\n2. Give the `.title` class a `color`\n3. Give `.card p` a `color` of your choice',
          mode: 'web',
          starter: { html: cardHtml, css: 'body {\n  font-family: system-ui, sans-serif;\n  padding: 2rem;\n}\n\n/* Add your rules below */\n', js: '' },
          solution: {
            html: cardHtml,
            css: 'body {\n  font-family: system-ui, sans-serif;\n  padding: 2rem;\n  background-color: #0b1220;\n}\n\n.title {\n  color: #5ce1ff;\n}\n\n.card p {\n  color: #cbd5e1;\n}\n',
            js: '',
          },
          hints: ['`body { background-color: #0b1220; }`', 'Class selectors start with a dot: `.title { … }`.'],
          xp: 30,
          checks: [
            { id: 'bg', label: 'body has a background-color', type: 'css_declaration', selector: 'body', property: 'background-color' },
            { id: 'title', label: '.title has a color', type: 'css_declaration', selector: '.title', property: 'color' },
            { id: 'p', label: '.card p has a color', type: 'css_declaration', selector: '.card p', property: 'color' },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'Which selector targets elements with class="note"?',
          options: ['#note', '.note', 'note', '*note'],
          answer: 1,
          explanation: 'Class selectors start with a dot.',
        },
        {
          prompt: 'Which selector has the highest specificity?',
          options: ['p', '.intro', '#intro', 'body p'],
          answer: 2,
          explanation: 'Id selectors outrank classes and type selectors.',
        },
        {
          prompt: 'What separates a property from its value?',
          options: ['=', ':', '->', ';'],
          answer: 1,
          explanation: 'Declarations look like property: value; — the semicolon ends the declaration.',
        },
      ],
    },
    {
      lesson: {
        id: 'css-2',
        title: 'The Box Model',
        summary: 'Content, padding, border and margin — the geometry of every element.',
        difficulty: 'beginner',
        durationMinutes: 14,
        xp: 20,
        quizXp: 15,
        blocks: [
          {
            type: 'text',
            md: 'Every element is a rectangle made of four layers: **content**, **padding** (inside space), **border**, and **margin** (outside space).',
          },
          {
            type: 'code',
            language: 'css',
            code: '.panel {\n  padding: 1.5rem;            /* space inside */\n  border: 1px solid #334155; /* the edge */\n  border-radius: 12px;       /* rounded corners */\n  margin-bottom: 1rem;       /* space outside */\n}',
          },
          {
            type: 'text',
            md: 'By default, `width` sets only the content width, so padding and border make the box bigger. Most projects switch to `box-sizing: border-box` so widths include padding and border.',
          },
          { type: 'code', language: 'css', code: '*, *::before, *::after {\n  box-sizing: border-box;\n}' },
        ],
      },
      exercises: [
        {
          id: 'css-2-ex1',
          title: 'Give the card some room',
          instructions:
            '1. Apply `box-sizing: border-box` to every element with the `*` selector\n2. Give `.card` some `padding`\n3. Give `.card` a **solid** `border`\n4. Round the corners with `border-radius`',
          mode: 'web',
          starter: { html: cardHtml, css: 'body {\n  font-family: system-ui, sans-serif;\n  padding: 2rem;\n  background: #0b1220;\n  color: #e2e8f0;\n}\n\n.card {\n  max-width: 320px;\n  /* add padding, border and border-radius */\n}\n', js: '' },
          solution: {
            html: cardHtml,
            css: '*, *::before, *::after {\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: system-ui, sans-serif;\n  padding: 2rem;\n  background: #0b1220;\n  color: #e2e8f0;\n}\n\n.card {\n  max-width: 320px;\n  padding: 1.5rem;\n  border: 1px solid #38bdf8;\n  border-radius: 14px;\n}\n',
            js: '',
          },
          hints: ['`border: 1px solid #38bdf8;` sets width, style and color at once.', 'The universal selector is `*`.'],
          xp: 30,
          checks: [
            { id: 'box', label: '* uses box-sizing: border-box', type: 'css_declaration', selector: '*', property: 'box-sizing', valuePattern: '^border-box$' },
            { id: 'padding', label: '.card has padding', type: 'css_declaration', selector: '.card', property: 'padding' },
            { id: 'border', label: '.card has a solid border', type: 'css_declaration', selector: '.card', property: 'border', valuePattern: 'solid' },
            { id: 'radius', label: '.card has rounded corners', type: 'css_declaration', selector: '.card', property: 'border-radius' },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'Which layer sits between the content and the border?',
          options: ['Margin', 'Padding', 'Outline', 'Gap'],
          answer: 1,
          explanation: 'Padding is the inner space between content and border.',
        },
        {
          prompt: 'What does box-sizing: border-box change?',
          options: [
            'Removes borders',
            'Width includes padding and border',
            'Adds a shadow',
            'Makes the element inline',
          ],
          answer: 1,
          explanation: 'With border-box, the declared width is the full visible width.',
        },
        {
          prompt: 'Which property creates space outside an element’s border?',
          options: ['padding', 'margin', 'gap', 'border-spacing'],
          answer: 1,
          explanation: 'Margin pushes other elements away from the border edge.',
        },
      ],
    },
    {
      lesson: {
        id: 'css-3',
        title: 'Typography',
        summary: 'Fonts, sizes, rhythm and readability.',
        difficulty: 'beginner',
        durationMinutes: 12,
        xp: 20,
        quizXp: 15,
        blocks: [
          {
            type: 'text',
            md: 'Good typography is mostly about **readability**: a comfortable size, generous line height, and a limited line length.',
          },
          {
            type: 'code',
            language: 'css',
            code: 'body {\n  font-family: "Inter", system-ui, sans-serif;\n  line-height: 1.6;\n}\n\nh1 {\n  font-size: 2.5rem;  /* relative to the root font size */\n  font-weight: 700;\n  letter-spacing: -0.02em;\n}\n\np {\n  max-width: 65ch;     /* ~65 characters per line */\n}',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Why rem?',
            md: '`rem` units scale with the user’s browser font-size setting, so text respects accessibility preferences. Avoid fixed `px` for body text.',
          },
        ],
      },
      exercises: [
        {
          id: 'css-3-ex1',
          title: 'Readable article',
          instructions:
            '1. Set a `font-family` on `body`\n2. Give `h1` a `font-size` in **rem**\n3. Give `p` a `line-height` of at least 1.4 (unitless numbers are recommended)',
          mode: 'web',
          starter: {
            html: '<article>\n  <h1>Notes from the Design Studio</h1>\n  <p>Typography sets the tone of an interface long before anyone reads a word. Size, spacing and rhythm guide the eye.</p>\n</article>\n',
            css: 'body {\n  padding: 2rem;\n  background: #f8fafc;\n  color: #0f172a;\n}\n',
            js: '',
          },
          solution: {
            html: '<article>\n  <h1>Notes from the Design Studio</h1>\n  <p>Typography sets the tone of an interface long before anyone reads a word. Size, spacing and rhythm guide the eye.</p>\n</article>\n',
            css: 'body {\n  padding: 2rem;\n  background: #f8fafc;\n  color: #0f172a;\n  font-family: Georgia, serif;\n}\n\nh1 {\n  font-size: 2.25rem;\n}\n\np {\n  line-height: 1.7;\n  max-width: 60ch;\n}\n',
            js: '',
          },
          hints: ['`font-size: 2.25rem;`', '`line-height: 1.6;` — no unit needed.'],
          xp: 30,
          checks: [
            { id: 'family', label: 'body sets a font-family', type: 'css_declaration', selector: 'body', property: 'font-family' },
            { id: 'h1', label: 'h1 font-size uses rem', type: 'css_declaration', selector: 'h1', property: 'font-size', valuePattern: '^\\d*\\.?\\d+rem$' },
            {
              id: 'lh',
              label: 'p line-height is at least 1.4',
              type: 'css_declaration',
              selector: 'p',
              property: 'line-height',
              valuePattern: '^(1\\.[4-9]\\d*|[2-9](\\.\\d+)?)$',
            },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'Why prefer rem over px for font sizes?',
          options: ['rem is faster', 'rem respects the user’s font-size preference', 'px is deprecated', 'rem adds bold'],
          answer: 1,
          explanation: 'rem is relative to the root font size, which users can change.',
        },
        {
          prompt: 'What is a comfortable line length for body text?',
          options: ['20 characters', 'About 45–75 characters', '200 characters', 'As wide as the screen'],
          answer: 1,
          explanation: 'Around 65ch is a widely used guideline for readability.',
        },
        {
          prompt: 'Why list several fonts in font-family?',
          options: ['To mix fonts', 'As fallbacks if earlier fonts are unavailable', 'To make text bold', 'It is required syntax'],
          answer: 1,
          explanation: 'The browser uses the first available font in the list.',
        },
      ],
    },
    {
      lesson: {
        id: 'css-4',
        title: 'Flexbox Layouts',
        summary: 'Align and distribute items along one axis.',
        difficulty: 'intermediate',
        durationMinutes: 15,
        xp: 25,
        quizXp: 15,
        blocks: [
          {
            type: 'text',
            md: '`display: flex` turns an element into a **flex container**. Its children line up along the *main axis* (a row by default).',
          },
          {
            type: 'code',
            language: 'css',
            code: '.toolbar {\n  display: flex;\n  justify-content: space-between; /* main axis */\n  align-items: center;            /* cross axis */\n  gap: 1rem;                      /* space between items */\n}',
          },
          {
            type: 'text',
            md: '- `justify-content` distributes items along the main axis\n- `align-items` aligns them on the cross axis\n- `flex-direction: column` switches the main axis to vertical\n- `flex: 1` lets an item grow to fill free space',
          },
        ],
      },
      exercises: [
        {
          id: 'css-4-ex1',
          title: 'Build the studio toolbar',
          instructions:
            'Make `.toolbar` a flex container that:\n\n1. Uses `display: flex`\n2. Pushes the logo and actions apart with `justify-content: space-between`\n3. Vertically centers items with `align-items: center`\n4. Adds a `gap`',
          mode: 'web',
          starter: {
            html: '<nav class="toolbar">\n  <strong class="logo">Studio</strong>\n  <div class="actions">\n    <button>Preview</button>\n    <button>Publish</button>\n  </div>\n</nav>\n',
            css: 'body { margin: 0; font-family: system-ui, sans-serif; }\n.toolbar {\n  padding: 0.75rem 1rem;\n  background: #0f172a;\n  color: white;\n  /* make me a flex container */\n}\n.actions { display: flex; gap: .5rem; }\n',
            js: '',
          },
          solution: {
            html: '<nav class="toolbar">\n  <strong class="logo">Studio</strong>\n  <div class="actions">\n    <button>Preview</button>\n    <button>Publish</button>\n  </div>\n</nav>\n',
            css: 'body { margin: 0; font-family: system-ui, sans-serif; }\n.toolbar {\n  padding: 0.75rem 1rem;\n  background: #0f172a;\n  color: white;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 1rem;\n}\n.actions { display: flex; gap: .5rem; }\n',
            js: '',
          },
          hints: ['All four declarations go inside the `.toolbar` rule.'],
          xp: 40,
          checks: [
            { id: 'flex', label: '.toolbar uses display: flex', type: 'css_declaration', selector: '.toolbar', property: 'display', valuePattern: '^(inline-)?flex$' },
            { id: 'justify', label: 'Items are spaced apart', type: 'css_declaration', selector: '.toolbar', property: 'justify-content', valuePattern: '^space-between$' },
            { id: 'align', label: 'Items are vertically centered', type: 'css_declaration', selector: '.toolbar', property: 'align-items', valuePattern: '^center$' },
            { id: 'gap', label: '.toolbar has a gap', type: 'css_declaration', selector: '.toolbar', property: 'gap' },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'In a default flex container, what is the main axis?',
          options: ['Vertical', 'Horizontal (row)', 'Diagonal', 'There is none'],
          answer: 1,
          explanation: 'flex-direction defaults to row, so the main axis is horizontal.',
        },
        {
          prompt: 'Which property aligns flex items on the cross axis?',
          options: ['justify-content', 'align-items', 'flex-wrap', 'order'],
          answer: 1,
          explanation: 'align-items controls cross-axis alignment.',
        },
        {
          prompt: 'What does flex: 1 on a child do?',
          options: ['Hides it', 'Lets it grow to fill available space', 'Makes it the first item', 'Sets a 1px border'],
          answer: 1,
          explanation: 'flex: 1 sets flex-grow to 1 so the item absorbs free space.',
        },
      ],
    },
    {
      lesson: {
        id: 'css-5',
        title: 'CSS Grid',
        summary: 'Two-dimensional layouts with rows, columns and fractions.',
        difficulty: 'intermediate',
        durationMinutes: 15,
        xp: 25,
        quizXp: 15,
        blocks: [
          {
            type: 'text',
            md: 'Grid controls **rows and columns at the same time**. Define tracks on the container and items flow into the cells.',
          },
          {
            type: 'code',
            language: 'css',
            code: '.gallery {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr); /* three equal columns */\n  gap: 1rem;\n}\n\n.feature {\n  grid-column: span 2; /* stretch across two columns */\n}',
          },
          {
            type: 'text',
            md: 'The `fr` unit means *a fraction of the free space*. `repeat(auto-fill, minmax(200px, 1fr))` creates as many columns as fit — a responsive grid without media queries.',
          },
        ],
      },
      exercises: [
        {
          id: 'css-5-ex1',
          title: 'Holo-gallery grid',
          instructions:
            'Turn `.gallery` into a grid:\n\n1. `display: grid`\n2. Three equal columns with `grid-template-columns` (use `repeat(3, 1fr)` or `1fr 1fr 1fr`)\n3. A `gap` between tiles',
          mode: 'web',
          starter: {
            html: '<section class="gallery">\n  <div class="tile">1</div><div class="tile">2</div><div class="tile">3</div>\n  <div class="tile">4</div><div class="tile">5</div><div class="tile">6</div>\n</section>\n',
            css: 'body { font-family: system-ui, sans-serif; padding: 1.5rem; background: #020617; }\n.tile {\n  background: linear-gradient(135deg, #0ea5e9, #6366f1);\n  color: white; font-weight: 700;\n  padding: 2rem; border-radius: 12px; text-align: center;\n}\n.gallery {\n  /* grid goes here */\n}\n',
            js: '',
          },
          solution: {
            html: '<section class="gallery">\n  <div class="tile">1</div><div class="tile">2</div><div class="tile">3</div>\n  <div class="tile">4</div><div class="tile">5</div><div class="tile">6</div>\n</section>\n',
            css: 'body { font-family: system-ui, sans-serif; padding: 1.5rem; background: #020617; }\n.tile {\n  background: linear-gradient(135deg, #0ea5e9, #6366f1);\n  color: white; font-weight: 700;\n  padding: 2rem; border-radius: 12px; text-align: center;\n}\n.gallery {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 1rem;\n}\n',
            js: '',
          },
          hints: ['`grid-template-columns: repeat(3, 1fr);`'],
          xp: 40,
          checks: [
            { id: 'grid', label: '.gallery uses display: grid', type: 'css_declaration', selector: '.gallery', property: 'display', valuePattern: '^(inline-)?grid$' },
            {
              id: 'cols',
              label: 'Three equal columns',
              type: 'css_declaration',
              selector: '.gallery',
              property: 'grid-template-columns',
              valuePattern: '^(repeat\\(\\s*3\\s*,\\s*1fr\\s*\\)|1fr\\s+1fr\\s+1fr)$',
            },
            { id: 'gap', label: '.gallery has a gap', type: 'css_declaration', selector: '.gallery', property: 'gap' },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'What does 1fr represent?',
          options: ['1 pixel', 'One fraction of the free space', '1% of the screen', 'One font size'],
          answer: 1,
          explanation: 'fr distributes remaining space proportionally.',
        },
        {
          prompt: 'When is Grid usually a better fit than Flexbox?',
          options: ['One row of buttons', 'Layouts controlled in rows and columns at once', 'Centering one icon', 'Never'],
          answer: 1,
          explanation: 'Grid shines for two-dimensional layouts; Flexbox for one dimension.',
        },
        {
          prompt: 'What does grid-column: span 2 do?',
          options: ['Creates two grids', 'Makes the item cover two columns', 'Adds two gaps', 'Hides two columns'],
          answer: 1,
          explanation: 'span 2 stretches the item across two column tracks.',
        },
      ],
    },
    {
      lesson: {
        id: 'css-6',
        title: 'Responsive Design',
        summary: 'Mobile-first layouts that adapt with media queries.',
        difficulty: 'advanced',
        durationMinutes: 18,
        xp: 30,
        quizXp: 20,
        blocks: [
          {
            type: 'text',
            md: '**Mobile-first** means writing the small-screen layout as the default, then *adding* complexity for larger screens with `min-width` media queries.',
          },
          {
            type: 'code',
            language: 'css',
            code: '.layout {\n  display: grid;\n  grid-template-columns: 1fr;   /* phones: one column */\n  gap: 1rem;\n}\n\n@media (min-width: 768px) {\n  .layout {\n    grid-template-columns: 1fr 1fr; /* tablets and up */\n  }\n}',
          },
          {
            type: 'callout',
            variant: 'tip',
            md: 'Don’t forget `<meta name="viewport" content="width=device-width, initial-scale=1">` in real pages — without it, phones render at desktop width and zoom out.',
          },
          {
            type: 'text',
            md: 'Combine relative units (`rem`, `%`, `fr`), fluid functions such as `clamp(1rem, 2.5vw, 1.5rem)`, and media queries for layouts that work everywhere.',
          },
        ],
      },
      exercises: [
        {
          id: 'css-6-ex1',
          title: 'Responsive mission board',
          instructions:
            '1. Make `.layout` a grid with **one** column by default\n2. Add a `@media (min-width: 768px)` query\n3. Inside it, switch `.layout` to **two** columns\n\nResize the preview panel to watch the layout change.',
          mode: 'web',
          starter: {
            html: '<main class="layout">\n  <section class="panel">Active missions</section>\n  <section class="panel">Rewards</section>\n</main>\n',
            css: 'body { font-family: system-ui, sans-serif; margin: 0; padding: 1rem; background: #0b1220; color: #e2e8f0; }\n.panel { padding: 2rem; border: 1px solid #334155; border-radius: 12px; }\n\n.layout {\n  /* mobile-first grid */\n}\n',
            js: '',
          },
          solution: {
            html: '<main class="layout">\n  <section class="panel">Active missions</section>\n  <section class="panel">Rewards</section>\n</main>\n',
            css: 'body { font-family: system-ui, sans-serif; margin: 0; padding: 1rem; background: #0b1220; color: #e2e8f0; }\n.panel { padding: 2rem; border: 1px solid #334155; border-radius: 12px; }\n\n.layout {\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: 1rem;\n}\n\n@media (min-width: 768px) {\n  .layout {\n    grid-template-columns: 1fr 1fr;\n  }\n}\n',
            js: '',
          },
          hints: ['The media query wraps a whole rule: `@media (min-width: 768px) { .layout { … } }`.'],
          xp: 50,
          checks: [
            { id: 'grid', label: '.layout uses display: grid', type: 'css_declaration', selector: '.layout', property: 'display', valuePattern: '^grid$' },
            { id: 'one', label: 'One column by default', type: 'css_declaration', selector: '.layout', property: 'grid-template-columns', valuePattern: '^(1fr|repeat\\(\\s*1\\s*,\\s*1fr\\s*\\))$' },
            { id: 'mq', label: 'A min-width: 768px media query', type: 'source_regex', file: 'css', pattern: '@media[^{]*\\(\\s*min-width\\s*:\\s*768px\\s*\\)', flags: 'i' },
            {
              id: 'two',
              label: 'Two columns on wider screens',
              type: 'source_regex',
              file: 'css',
              pattern: '@media[^{]*min-width\\s*:\\s*768px[^{]*\\{[^}]*\\.layout\\s*\\{[^}]*grid-template-columns\\s*:\\s*(1fr\\s+1fr|repeat\\(\\s*2\\s*,\\s*1fr\\s*\\))',
              flags: 'i',
            },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'What does “mobile-first” mean?',
          options: ['Only support phones', 'Write small-screen styles first, enhance with min-width queries', 'Use max-width everywhere', 'Design apps before websites'],
          answer: 1,
          explanation: 'Mobile-first starts simple and adds layout for larger viewports.',
        },
        {
          prompt: 'When does @media (min-width: 768px) apply?',
          options: ['Viewports narrower than 768px', 'Viewports 768px wide or wider', 'Only at exactly 768px', 'Only when printing'],
          answer: 1,
          explanation: 'min-width applies at and above the given width.',
        },
        {
          prompt: 'What does the viewport meta tag fix?',
          options: ['Font loading', 'Phones rendering pages at desktop width', 'Image compression', 'Dark mode'],
          answer: 1,
          explanation: 'width=device-width makes mobile browsers use the real screen width.',
        },
      ],
    },
  ],
};
