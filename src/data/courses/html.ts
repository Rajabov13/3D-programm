import type { CourseDraft } from './types';

const page = (body: string) => body.trim() + '\n';

export const htmlCourse: CourseDraft = {
  course: {
    id: 'html',
    title: 'HTML Foundations',
    tagline: 'Structure the web, one element at a time.',
    description:
      'Learn how every web page is built. You will write real documents with headings, text, links, images, semantic layout, accessible forms and data tables — the foundation every other course in Code World builds on.',
    track: 'html',
    objectives: [
      'Explain how browsers turn HTML into a page',
      'Structure content with headings, paragraphs and lists',
      'Link pages together and embed accessible images',
      'Use semantic landmarks (header, nav, main, footer)',
      'Build labelled, accessible forms and data tables',
    ],
    prerequisites: [],
    requiredLevel: 1,
    buildingId: 'html-academy',
    accent: '#fb923c',
    estimatedHours: 3,
    order: 1,
  },
  lessons: [
    {
      lesson: {
        id: 'html-1',
        title: 'Your First Web Page',
        summary: 'Elements, tags and the skeleton of every HTML document.',
        difficulty: 'beginner',
        durationMinutes: 10,
        xp: 20,
        quizXp: 15,
        blocks: [
          {
            type: 'text',
            md: 'HTML (HyperText Markup Language) describes the **structure** of a web page. A browser reads your HTML, builds a tree of elements called the DOM, and paints it on screen.',
          },
          { type: 'heading', text: 'Elements and tags' },
          {
            type: 'text',
            md: 'An element usually has an opening tag, content, and a closing tag. The closing tag has a forward slash:\n\n- `<h1>` starts a top-level heading\n- `</h1>` ends it\n- Everything in between is the element\'s **content**',
          },
          {
            type: 'code',
            language: 'html',
            caption: 'A heading and a paragraph',
            code: '<h1>Welcome to Code World</h1>\n<p>This paragraph explains what the page is about.</p>',
          },
          { type: 'heading', text: 'The document skeleton' },
          {
            type: 'text',
            md: 'Complete pages start with a doctype and an `<html>` root. Metadata such as the title lives in `<head>`; visible content lives in `<body>`.',
          },
          {
            type: 'code',
            language: 'html',
            code: '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <title>My first page</title>\n  </head>\n  <body>\n    <h1>Hello!</h1>\n  </body>\n</html>',
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Indentation',
            md: 'Browsers ignore extra whitespace, but indenting nested elements makes your structure easy to read.',
          },
        ],
      },
      exercises: [
        {
          id: 'html-1-ex1',
          title: 'Say hello to the city',
          instructions:
            'Create your first page content inside the editor:\n\n1. Add an `<h1>` heading with the exact text **Hello, Code World**\n2. Below it, add a `<p>` paragraph introducing yourself in one sentence\n\nPress **Run** to see the live preview, then **Check** to verify.',
          mode: 'web',
          starter: { html: page('<!-- Write your heading and paragraph below -->\n\n'), css: 'body {\n  font-family: system-ui, sans-serif;\n  padding: 1.5rem;\n}\n', js: '' },
          solution: {
            html: page('<h1>Hello, Code World</h1>\n<p>I am learning to build websites one element at a time.</p>'),
            css: 'body {\n  font-family: system-ui, sans-serif;\n  padding: 1.5rem;\n}\n',
            js: '',
          },
          hints: ['Headings use `<h1>…</h1>`.', 'Paragraphs use `<p>…</p>`. Make sure each tag is closed.'],
          xp: 30,
          checks: [
            { id: 'h1', label: 'An <h1> says “Hello, Code World”', type: 'html_element', selector: 'h1', textIncludes: 'Hello, Code World' },
            { id: 'p', label: 'A <p> paragraph introduces you', type: 'html_element', selector: 'p' },
            { id: 'one-h1', label: 'The page has exactly one <h1>', type: 'html_element', selector: 'h1', min: 1, max: 1 },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'Which part of an element marks where it ends?',
          options: ['The opening tag', 'The closing tag, such as </p>', 'The doctype', 'An attribute'],
          answer: 1,
          explanation: 'Closing tags repeat the element name with a forward slash, e.g. </p>.',
        },
        {
          prompt: 'Where does the page title shown in the browser tab belong?',
          options: ['Inside <body>', 'Inside <title> in the <head>', 'In an <h1>', 'In the doctype'],
          answer: 1,
          explanation: 'Metadata such as <title> lives in <head>; it is not rendered in the page body.',
        },
        {
          prompt: 'What does the browser build from your HTML before painting it?',
          options: ['A spreadsheet', 'The DOM tree', 'A CSS file', 'A database'],
          answer: 1,
          explanation: 'The Document Object Model (DOM) is the tree of elements the browser creates.',
        },
      ],
    },
    {
      lesson: {
        id: 'html-2',
        title: 'Text, Headings & Lists',
        summary: 'Give content hierarchy with headings, emphasis and lists.',
        difficulty: 'beginner',
        durationMinutes: 12,
        xp: 20,
        quizXp: 15,
        blocks: [
          {
            type: 'text',
            md: 'Headings `<h1>` to `<h6>` form an outline of your page. Screen readers let users jump between headings, so use them in order and never pick a heading just for its size.',
          },
          {
            type: 'code',
            language: 'html',
            code: '<h1>Code World Guide</h1>\n<h2>Getting started</h2>\n<p>Learning is <strong>important</strong> and <em>fun</em>.</p>',
          },
          { type: 'heading', text: 'Lists' },
          {
            type: 'text',
            md: 'Use `<ul>` for unordered lists (order does not matter) and `<ol>` for ordered steps. Each item is an `<li>`.',
          },
          {
            type: 'code',
            language: 'html',
            code: '<ol>\n  <li>Open the editor</li>\n  <li>Write some HTML</li>\n  <li>Press Run</li>\n</ol>',
          },
          {
            type: 'callout',
            variant: 'info',
            md: '`<strong>` means *strong importance* and `<em>` means *stress emphasis*. They carry meaning — styling alone (bold/italic) is a CSS job.',
          },
        ],
      },
      exercises: [
        {
          id: 'html-2-ex1',
          title: 'Write a learning plan',
          instructions:
            'Build a short learning plan:\n\n1. An `<h2>` with the text **My Learning Plan**\n2. An unordered list (`<ul>`) with **at least three** `<li>` items\n3. Mark one important word with `<strong>`',
          mode: 'web',
          starter: { html: page('<h1>Code World Journal</h1>\n<!-- Add your plan here -->\n'), css: 'body { font-family: system-ui, sans-serif; padding: 1.5rem; line-height: 1.6; }\n', js: '' },
          solution: {
            html: page(
              '<h1>Code World Journal</h1>\n<h2>My Learning Plan</h2>\n<ul>\n  <li>Finish <strong>HTML</strong> Foundations</li>\n  <li>Style pages in the CSS Studio</li>\n  <li>Experiment in the JavaScript Lab</li>\n</ul>',
            ),
            css: 'body { font-family: system-ui, sans-serif; padding: 1.5rem; line-height: 1.6; }\n',
            js: '',
          },
          hints: ['Lists need a `<ul>` wrapper with `<li>` children.', '`<strong>` can be placed inside a list item.'],
          xp: 30,
          checks: [
            { id: 'h2', label: '<h2> reads “My Learning Plan”', type: 'html_element', selector: 'h2', textIncludes: 'My Learning Plan' },
            { id: 'items', label: 'A <ul> contains at least 3 <li> items', type: 'html_element', selector: 'ul > li', min: 3 },
            { id: 'strong', label: 'One word is marked with <strong>', type: 'html_element', selector: 'strong' },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'Which list element should you use for step-by-step instructions?',
          options: ['<ul>', '<ol>', '<dl>', '<li>'],
          answer: 1,
          explanation: 'Ordered lists (<ol>) communicate that the sequence matters.',
        },
        {
          prompt: 'Why should headings follow a logical order (h1 → h2 → h3)?',
          options: [
            'It makes text larger',
            'Assistive technology uses them as a page outline',
            'Browsers require it to render',
            'It improves download speed',
          ],
          answer: 1,
          explanation: 'Heading levels create the outline that screen-reader users navigate by.',
        },
        {
          prompt: 'What does <em> communicate?',
          options: ['Italic styling only', 'Stress emphasis', 'An error message', 'An email address'],
          answer: 1,
          explanation: '<em> conveys stress emphasis; the italic look is just the default style.',
        },
      ],
    },
    {
      lesson: {
        id: 'html-3',
        title: 'Links & Images',
        summary: 'Connect pages with anchors and describe images with alt text.',
        difficulty: 'beginner',
        durationMinutes: 12,
        xp: 20,
        quizXp: 15,
        blocks: [
          {
            type: 'text',
            md: 'Links are created with the anchor element `<a>`. Its `href` **attribute** holds the destination. Attributes live inside the opening tag as `name="value"` pairs.',
          },
          {
            type: 'code',
            language: 'html',
            code: '<a href="https://developer.mozilla.org">Read the MDN docs</a>\n<a href="/about.html">About (relative link)</a>',
          },
          { type: 'heading', text: 'Images and alternative text' },
          {
            type: 'text',
            md: '`<img>` is a *void element* — it has no closing tag. `src` points to the file and `alt` describes the image for people who cannot see it, and for when it fails to load.',
          },
          {
            type: 'code',
            language: 'html',
            code: '<img src="skyline.png" alt="Glass towers lit in blue at night" width="320" />',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Meaningful link text',
            md: 'Avoid “click here”. Link text should make sense on its own, because screen readers can list all links on a page.',
          },
        ],
      },
      exercises: [
        {
          id: 'html-3-ex1',
          title: 'Link the docs, describe the skyline',
          instructions:
            '1. Add a link whose `href` starts with **https://developer.mozilla.org** and whose text describes the destination\n2. Add an `<img>` with any `src` and a **descriptive, non-empty** `alt` attribute\n\nNote: the preview sandbox blocks network requests, so external images will show as broken — that is expected. The `alt` text is what matters here.',
          mode: 'web',
          starter: { html: page('<h1>Resources</h1>\n<!-- 1. Add the MDN link -->\n\n<!-- 2. Add an image with alt text -->\n'), css: 'body { font-family: system-ui, sans-serif; padding: 1.5rem; }\nimg { display: block; margin-top: 1rem; max-width: 100%; }\n', js: '' },
          solution: {
            html: page(
              '<h1>Resources</h1>\n<p><a href="https://developer.mozilla.org/en-US/docs/Web/HTML">MDN HTML reference</a></p>\n<img src="skyline.png" alt="Night skyline of Code World with glowing glass towers" />',
            ),
            css: 'body { font-family: system-ui, sans-serif; padding: 1.5rem; }\nimg { display: block; margin-top: 1rem; max-width: 100%; }\n',
            js: '',
          },
          hints: ['`<a href="https://developer.mozilla.org">…</a>`', 'Images need both `src` and `alt`: `<img src="…" alt="…" />`.'],
          xp: 30,
          checks: [
            {
              id: 'link',
              label: 'A link points to developer.mozilla.org',
              type: 'html_element',
              selector: 'a',
              attribute: { name: 'href', valuePattern: '^https://developer\\.mozilla\\.org' },
            },
            { id: 'link-text', label: 'The link has descriptive text', type: 'source_regex', file: 'html', pattern: '<a\\b[^>]*>\\s*\\S[\\s\\S]*?</a>', flags: 'i' },
            { id: 'img-alt', label: 'An <img> has non-empty alt text', type: 'html_element', selector: 'img', attribute: { name: 'alt', valuePattern: '\\S{2,}' } },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'Which attribute sets a link’s destination?',
          options: ['src', 'href', 'alt', 'link'],
          answer: 1,
          explanation: 'href (hypertext reference) holds the URL.',
        },
        {
          prompt: 'What is the purpose of an image’s alt attribute?',
          options: ['Sets the image width', 'Provides a text alternative', 'Adds a tooltip', 'Makes the image load faster'],
          answer: 1,
          explanation: 'alt text is read by screen readers and shown when the image can’t load.',
        },
        {
          prompt: 'Why is <img> called a void element?',
          options: ['It is invisible', 'It cannot have content or a closing tag', 'It is deprecated', 'It only works in forms'],
          answer: 1,
          explanation: 'Void elements such as <img>, <br> and <input> have no content and no end tag.',
        },
      ],
    },
    {
      lesson: {
        id: 'html-4',
        title: 'Semantic Page Structure',
        summary: 'Landmarks that describe what each region of a page is for.',
        difficulty: 'intermediate',
        durationMinutes: 15,
        xp: 25,
        quizXp: 15,
        blocks: [
          {
            type: 'text',
            md: 'A `<div>` says nothing about its content. **Semantic elements** do: they tell browsers, search engines and assistive tech what a region *means*.',
          },
          {
            type: 'text',
            md: '- `<header>` — introductory content or site branding\n- `<nav>` — major navigation links\n- `<main>` — the unique main content (one per page)\n- `<article>` — a self-contained piece such as a post\n- `<section>` — a thematic group, usually with a heading\n- `<footer>` — closing information',
          },
          {
            type: 'code',
            language: 'html',
            code: '<header>\n  <nav>\n    <a href="/">Home</a>\n    <a href="/courses">Courses</a>\n  </nav>\n</header>\n<main>\n  <article>\n    <h2>Building the HTML Academy</h2>\n    <p>Every tower starts with a solid structure.</p>\n  </article>\n</main>\n<footer>© Code World</footer>',
          },
          {
            type: 'callout',
            variant: 'tip',
            md: 'Screen-reader users can jump straight to landmarks such as `<main>` and `<nav>`. Good structure is an accessibility feature.',
          },
        ],
      },
      exercises: [
        {
          id: 'html-4-ex1',
          title: 'Blueprint a news page',
          instructions:
            'Replace the generic `<div>`s with semantic structure:\n\n1. A `<header>` that contains a `<nav>` with at least two links\n2. A `<main>` that contains an `<article>` with a heading\n3. A `<footer>` at the bottom\n\nYou can remove the starter `<div>` elements.',
          mode: 'web',
          starter: {
            html: page('<div class="top">Code World News</div>\n<div class="content">\n  <h2>New tower opens</h2>\n  <p>The React Development Tower welcomes its first engineers.</p>\n</div>\n<div class="bottom">Contact us</div>'),
            css: 'body { font-family: system-ui, sans-serif; margin: 0; }\nheader, footer { background: #0f172a; color: #e2e8f0; padding: 1rem; }\nnav a { color: #7dd3fc; margin-right: 1rem; }\nmain { padding: 1rem; }\n',
            js: '',
          },
          solution: {
            html: page(
              '<header>\n  <nav>\n    <a href="/">Home</a>\n    <a href="/news">News</a>\n  </nav>\n</header>\n<main>\n  <article>\n    <h2>New tower opens</h2>\n    <p>The React Development Tower welcomes its first engineers.</p>\n  </article>\n</main>\n<footer>Contact us</footer>',
            ),
            css: 'body { font-family: system-ui, sans-serif; margin: 0; }\nheader, footer { background: #0f172a; color: #e2e8f0; padding: 1rem; }\nnav a { color: #7dd3fc; margin-right: 1rem; }\nmain { padding: 1rem; }\n',
            js: '',
          },
          hints: ['Nest the nav inside the header: `<header><nav>…</nav></header>`.', 'The article goes inside `<main>`.'],
          xp: 40,
          checks: [
            { id: 'nav', label: '<header> contains a <nav> with 2+ links', type: 'html_element', selector: 'header nav a', min: 2 },
            { id: 'article', label: '<main> contains an <article>', type: 'html_element', selector: 'main article' },
            { id: 'article-heading', label: 'The article has a heading', type: 'html_element', selector: 'article h2, article h3' },
            { id: 'footer', label: 'The page ends with a <footer>', type: 'html_element', selector: 'footer' },
            { id: 'one-main', label: 'Exactly one <main>', type: 'html_element', selector: 'main', min: 1, max: 1 },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'How many <main> elements should a page have?',
          options: ['As many as needed', 'Exactly one visible <main>', 'None — use <div>', 'One per section'],
          answer: 1,
          explanation: 'There should be one main landmark containing the page’s unique content.',
        },
        {
          prompt: 'Which element best fits a self-contained blog post?',
          options: ['<section>', '<article>', '<aside>', '<span>'],
          answer: 1,
          explanation: '<article> represents content that makes sense on its own.',
        },
        {
          prompt: 'Who benefits from semantic landmarks?',
          options: ['Only search engines', 'Only designers', 'Screen-reader users, search engines and developers', 'Nobody — they are decorative'],
          answer: 2,
          explanation: 'Semantics improve accessibility, SEO and maintainability.',
        },
      ],
    },
    {
      lesson: {
        id: 'html-5',
        title: 'Forms & Inputs',
        summary: 'Collect information with labelled, accessible form controls.',
        difficulty: 'intermediate',
        durationMinutes: 15,
        xp: 25,
        quizXp: 15,
        blocks: [
          {
            type: 'text',
            md: 'Forms gather input. Every control needs a **label** — connect them by giving the input an `id` and the label a matching `for` attribute. Clicking the label then focuses the input.',
          },
          {
            type: 'code',
            language: 'html',
            code: '<form>\n  <label for="username">Username</label>\n  <input id="username" name="username" type="text" required />\n\n  <label for="email">Email</label>\n  <input id="email" name="email" type="email" required />\n\n  <button type="submit">Create account</button>\n</form>',
          },
          {
            type: 'text',
            md: 'Input `type`s give you free validation and better mobile keyboards: `email`, `number`, `password`, `date`, `checkbox` and more. The `required` attribute prevents submitting an empty field.',
          },
          {
            type: 'callout',
            variant: 'warning',
            md: 'Placeholder text is **not** a label. It disappears while typing and often has poor contrast.',
          },
        ],
      },
      exercises: [
        {
          id: 'html-5-ex1',
          title: 'Newsletter sign-up',
          instructions:
            'Build a sign-up form:\n\n1. A `<form>` element\n2. A `<label>` with `for="email"`\n3. An `<input>` with `id="email"`, `type="email"` and the `required` attribute\n4. A `<button type="submit">`',
          mode: 'web',
          starter: { html: page('<h2>Join the Code World newsletter</h2>\n<!-- Build your form here -->\n'), css: 'body { font-family: system-ui, sans-serif; padding: 1.5rem; }\nform { display: grid; gap: .5rem; max-width: 320px; }\n', js: '' },
          solution: {
            html: page(
              '<h2>Join the Code World newsletter</h2>\n<form>\n  <label for="email">Email address</label>\n  <input id="email" name="email" type="email" required />\n  <button type="submit">Subscribe</button>\n</form>',
            ),
            css: 'body { font-family: system-ui, sans-serif; padding: 1.5rem; }\nform { display: grid; gap: .5rem; max-width: 320px; }\n',
            js: '',
          },
          hints: ['`<label for="email">` must match `<input id="email">`.', 'Boolean attributes like `required` need no value.'],
          xp: 40,
          checks: [
            { id: 'form', label: 'A <form> element exists', type: 'html_element', selector: 'form' },
            { id: 'label', label: 'A label points to the email input (for="email")', type: 'html_element', selector: 'form label[for="email"]' },
            { id: 'input', label: 'input#email is type="email" and required', type: 'html_element', selector: 'form input#email[type="email"][required]' },
            { id: 'button', label: 'A submit button', type: 'html_element', selector: 'form button[type="submit"]' },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'How do you associate a <label> with an input?',
          options: ['Same class name', 'label for="x" + input id="x"', 'Put them on the same line', 'Use a placeholder'],
          answer: 1,
          explanation: 'The for attribute must match the input’s id (or wrap the input inside the label).',
        },
        {
          prompt: 'What does type="email" add?',
          options: ['Nothing', 'Built-in format validation and an email keyboard on mobile', 'Sends an email', 'Encrypts the value'],
          answer: 1,
          explanation: 'Browsers validate the format and mobile devices show an email-optimised keyboard.',
        },
        {
          prompt: 'Why is a placeholder not a substitute for a label?',
          options: ['It is too long', 'It disappears while typing and is often low-contrast', 'Browsers ignore it', 'It breaks validation'],
          answer: 1,
          explanation: 'Labels stay visible and are announced reliably by assistive technology.',
        },
      ],
    },
    {
      lesson: {
        id: 'html-6',
        title: 'Tables & Accessible Data',
        summary: 'Present tabular data with captions, headers and scopes.',
        difficulty: 'advanced',
        durationMinutes: 15,
        xp: 30,
        quizXp: 20,
        blocks: [
          {
            type: 'text',
            md: 'Use tables for **data**, never for layout. A well-built table has a `<caption>`, a header row in `<thead>`, and data rows in `<tbody>`.',
          },
          {
            type: 'code',
            language: 'html',
            code: '<table>\n  <caption>Weekly XP</caption>\n  <thead>\n    <tr>\n      <th scope="col">Learner</th>\n      <th scope="col">Course</th>\n      <th scope="col">XP</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr><td>Ada</td><td>HTML</td><td>320</td></tr>\n  </tbody>\n</table>',
          },
          {
            type: 'text',
            md: '`scope="col"` tells assistive technology that a header labels its **column**; `scope="row"` labels a row. The caption acts as the table’s accessible name.',
          },
        ],
      },
      exercises: [
        {
          id: 'html-6-ex1',
          title: 'Leaderboard table',
          instructions:
            'Create an accessible table:\n\n1. A `<caption>`\n2. A `<thead>` row with **three** `<th scope="col">` headers\n3. A `<tbody>` with **at least two** data rows',
          mode: 'web',
          starter: { html: page('<!-- Build the leaderboard table -->\n'), css: 'body { font-family: system-ui, sans-serif; padding: 1.5rem; }\ntable { border-collapse: collapse; }\nth, td { border: 1px solid #94a3b8; padding: .4rem .8rem; text-align: left; }\n', js: '' },
          solution: {
            html: page(
              '<table>\n  <caption>Top learners</caption>\n  <thead>\n    <tr>\n      <th scope="col">Name</th>\n      <th scope="col">Level</th>\n      <th scope="col">XP</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr><td>Nova</td><td>6</td><td>1040</td></tr>\n    <tr><td>Orion</td><td>5</td><td>760</td></tr>\n  </tbody>\n</table>',
            ),
            css: 'body { font-family: system-ui, sans-serif; padding: 1.5rem; }\ntable { border-collapse: collapse; }\nth, td { border: 1px solid #94a3b8; padding: .4rem .8rem; text-align: left; }\n',
            js: '',
          },
          hints: ['The caption goes directly after `<table>`.', 'Header cells: `<th scope="col">Name</th>`.'],
          xp: 50,
          checks: [
            { id: 'caption', label: 'The table has a <caption>', type: 'html_element', selector: 'table > caption' },
            { id: 'headers', label: '3+ column headers with scope="col"', type: 'html_element', selector: 'thead th[scope="col"]', min: 3 },
            { id: 'rows', label: '<tbody> has 2+ rows', type: 'html_element', selector: 'tbody tr', min: 2 },
          ],
        },
      ],
      quiz: [
        {
          prompt: 'When should you use an HTML table?',
          options: ['For page layout', 'For tabular data', 'For navigation menus', 'For images'],
          answer: 1,
          explanation: 'Tables are for data with rows and columns; CSS handles layout.',
        },
        {
          prompt: 'What does scope="col" on a <th> mean?',
          options: ['The header spans two columns', 'The header labels its column', 'The column is sortable', 'The column is hidden'],
          answer: 1,
          explanation: 'scope tells assistive tech which cells a header describes.',
        },
        {
          prompt: 'What gives a table its accessible name?',
          options: ['<caption>', '<thead>', 'The first <td>', 'The id attribute'],
          answer: 0,
          explanation: 'The caption names and describes the table.',
        },
      ],
    },
  ],
};
