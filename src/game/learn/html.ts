import { tx } from '@/i18n';
import type { LearnCard } from '../types';

const blocks =
  'header,nav,main,footer{display:block;border:2px dashed #94a3b8;border-radius:10px;padding:8px 12px;margin:6px 0}header{background:#fff7ed}nav{background:#ecfeff}main{background:#f0fdf4;min-height:60px}footer{background:#f5f3ff}';

export const htmlLearn: Record<string, LearnCard[]> = {
  'html-1': [
    {
      icon: '🏷️',
      title: tx('Teg nima?', 'Что такое тег?', 'What is a tag?'),
      text: tx(
        'HTML sahifa teglardan quriladi. Ochuvchi teg <p> elementni boshlaydi, yopuvchi teg </p> tugatadi — yopuvchida / belgisi bor.',
        'HTML-страница строится из тегов. Открывающий тег <p> начинает элемент, закрывающий </p> — заканчивает: в нём есть знак /.',
        'An HTML page is built from tags. The opening tag <p> starts an element and the closing tag </p> ends it — it has a / sign.',
      ),
      picture: {
        kind: 'parts',
        code: '<p>Hello!</p>',
        lang: 'html',
        parts: [
          { text: '<p>', label: tx('ochuvchi teg', 'открывающий тег', 'opening tag') },
          { text: 'Hello!', label: tx('ichidagi matn', 'содержимое', 'content') },
          { text: '</p>', label: tx('yopuvchi teg', 'закрывающий тег', 'closing tag') },
        ],
      },
      example: { code: '<p>Hello, world!</p>\n<p>I am learning HTML.</p>', lang: 'html', result: { kind: 'browser' } },
    },
    {
      icon: '📰',
      title: tx('Sarlavhalar <h1>–<h6>', 'Заголовки <h1>–<h6>', 'Headings <h1>–<h6>'),
      text: tx(
        '<h1> — eng katta va eng muhim sarlavha, <h6> — eng kichigi. Oddiy matn <p> (paragraf) ichiga yoziladi.',
        '<h1> — самый крупный и важный заголовок, <h6> — самый маленький. Обычный текст пишут в <p> (абзац).',
        '<h1> is the biggest, most important heading and <h6> the smallest. Plain text goes in a <p> (paragraph).',
      ),
      example: { code: '<h1>Code World</h1>\n<h2>Level 1</h2>\n<h3>Tags</h3>\n<p>Hello!</p>', lang: 'html', result: { kind: 'browser' } },
    },
    {
      icon: '🦴',
      title: tx('Sahifa skeleti', 'Скелет страницы', 'The page skeleton'),
      text: tx(
        'Har bir sahifa <!DOCTYPE html> bilan boshlanadi. Hammasi <html> ichida, ekranda koʻrinadigan qism esa <body> ichida turadi.',
        'Каждая страница начинается с <!DOCTYPE html>. Всё лежит внутри <html>, а видимая часть — внутри <body>.',
        'Every page starts with <!DOCTYPE html>. Everything sits inside <html>, and the visible part goes inside <body>.',
      ),
      picture: {
        kind: 'parts',
        code: '<!DOCTYPE html>\n<html>\n  <body>\n    <h1>Hi</h1>\n  </body>\n</html>',
        lang: 'html',
        parts: [
          { text: '<!DOCTYPE html>', label: tx('bu HTML sahifa', 'это HTML-страница', 'this is an HTML page') },
          { text: '<html>', label: tx('butun sahifa', 'вся страница', 'the whole page') },
          { text: '<body>', label: tx('koʻrinadigan qism', 'видимая часть', 'the visible part') },
          { text: '</html>', label: tx('oxirida hammasi yopiladi', 'в конце всё закрывается', 'everything closes at the end') },
        ],
      },
      example: { code: '<!DOCTYPE html>\n<html>\n  <body>\n    <h1>My page</h1>\n    <p>Welcome!</p>\n  </body>\n</html>', lang: 'html', result: { kind: 'browser' } },
    },
    {
      icon: '🧩',
      title: tx('Foydali teglar', 'Полезные теги', 'Useful tags'),
      text: tx(
        'Har bir teg oʻz ishini qiladi: <img> — rasm, <a> — havola, <p> — paragraf, <button> — tugma.',
        'У каждого тега своя работа: <img> — картинка, <a> — ссылка, <p> — абзац, <button> — кнопка.',
        'Each tag has a job: <img> is an image, <a> a link, <p> a paragraph and <button> a button.',
      ),
      picture: {
        kind: 'table',
        rows: [
          ['<img>', tx('🖼️ rasm', '🖼️ картинка', '🖼️ image')],
          ['<a>', tx('🔗 havola', '🔗 ссылка', '🔗 link')],
          ['<p>', tx('¶ paragraf', '¶ абзац', '¶ paragraph')],
          ['<button>', tx('🔘 tugma', '🔘 кнопка', '🔘 button')],
        ],
      },
      example: { code: '<p>Ready?</p>\n<button>Play</button>\n<a href="#">Help</a>', lang: 'html', result: { kind: 'browser' } },
    },
  ],
  'html-2': [
    {
      icon: '•',
      title: tx('Belgili roʻyxat <ul>', 'Маркированный список <ul>', 'Bulleted list <ul>'),
      text: tx(
        '<ul> — nuqtali (belgili) roʻyxat. Uning har bir bandi <li> … </li> ichida yoziladi.',
        '<ul> — маркированный список. Каждый пункт пишется внутри <li> … </li>.',
        '<ul> is a bulleted list. Each item goes inside <li> … </li>.',
      ),
      picture: {
        kind: 'parts',
        code: '<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n</ul>',
        lang: 'html',
        parts: [
          { text: '<ul>', label: tx('roʻyxat boshlanadi', 'начало списка', 'the list starts') },
          { text: '<li>', label: tx('band (list item)', 'пункт (list item)', 'an item (list item)') },
          { text: '</ul>', label: tx('roʻyxat tugaydi', 'конец списка', 'the list ends') },
        ],
      },
      example: { code: '<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n  <li>JavaScript</li>\n</ul>', lang: 'html', result: { kind: 'browser' } },
    },
    {
      icon: '🔢',
      title: tx('Raqamli roʻyxat <ol>', 'Нумерованный список <ol>', 'Numbered list <ol>'),
      text: tx(
        '<ol> bandlarni oʻzi raqamlaydi: 1, 2, 3… Bandlar yana <li> boʻladi.',
        '<ol> сам нумерует пункты: 1, 2, 3… Пункты — снова <li>.',
        '<ol> numbers the items for you: 1, 2, 3… The items are <li> again.',
      ),
      picture: {
        kind: 'table',
        rows: [
          ['<ul>', '• • •'],
          ['<ol>', '1. 2. 3.'],
          ['<li>', tx('roʻyxat bandi', 'пункт списка', 'a list item')],
        ],
      },
      example: { code: '<ol>\n  <li>Wake up</li>\n  <li>Code</li>\n  <li>Win</li>\n</ol>', lang: 'html', result: { kind: 'browser' } },
    },
    {
      icon: '✍️',
      title: tx('Matnni bezash', 'Оформление текста', 'Styling text'),
      text: tx(
        '<strong> — qalin (muhim), <em> — qiya (urgʻu). <br> — yangi qator, <hr> — chiziq. <br> va <hr> yopilmaydi.',
        '<strong> — жирный (важное), <em> — курсив (акцент). <br> — новая строка, <hr> — линия. <br> и <hr> не закрываются.',
        '<strong> is bold (important), <em> is italic (emphasis). <br> is a new line and <hr> a line. <br> and <hr> are never closed.',
      ),
      picture: {
        kind: 'table',
        rows: [
          ['<strong>', tx('𝐁 qalin', '𝐁 жирный', '𝐁 bold')],
          ['<em>', tx('𝘐 qiya', '𝘐 курсив', '𝘐 italic')],
          ['<br>', tx('↵ yangi qator', '↵ новая строка', '↵ new line')],
          ['<hr>', tx('― gorizontal chiziq', '― горизонтальная линия', '― horizontal line')],
        ],
      },
      example: { code: '<p><strong>Bold</strong> and <em>italic</em></p>\n<p>Line 1<br>Line 2</p>\n<hr>', lang: 'html', result: { kind: 'browser' } },
    },
  ],
  'html-3': [
    {
      icon: '🔗',
      title: tx('Havola <a>', 'Ссылка <a>', 'Link <a>'),
      text: tx(
        '<a> boshqa sahifaga olib boradi. Manzil href atributiga yoziladi, teglar orasidagi matn — bosiladigan yozuv.',
        '<a> ведёт на другую страницу. Адрес пишут в атрибуте href, а текст между тегами — то, на что нажимают.',
        '<a> takes you to another page. The address goes in the href attribute; the text between the tags is what you click.',
      ),
      picture: {
        kind: 'parts',
        code: '<a href="https://mdn.dev">MDN</a>',
        lang: 'html',
        parts: [
          { text: 'href="https://mdn.dev"', label: tx('href — qayerga borish', 'href — куда вести', 'href — where to go') },
          { text: 'MDN', label: tx('bosiladigan matn', 'текст ссылки', 'the clickable text') },
        ],
      },
      example: { code: '<p>Read more on <a href="https://mdn.dev">MDN</a>.</p>\n<a href="/about">About us</a>', lang: 'html', result: { kind: 'browser' } },
    },
    {
      icon: '🖼️',
      title: tx('Rasm <img>', 'Картинка <img>', 'Image <img>'),
      text: tx(
        '<img> rasm qoʻyadi: src — fayl manzili, alt — rasmning matnli tavsifi (rasm yuklanmasa yoki koʻzi ojiz foydalanuvchi uchun). <img> yopilmaydi.',
        '<img> вставляет картинку: src — адрес файла, alt — текстовое описание (если картинка не загрузится, и для незрячих). <img> не закрывается.',
        '<img> shows an image: src is the file address, alt is a text description (for when it doesn’t load, and for blind users). <img> is never closed.',
      ),
      picture: {
        kind: 'parts',
        code: '<img src="cat.png" alt="A cat">',
        lang: 'html',
        parts: [
          { text: 'src="cat.png"', label: tx('src — rasm fayli', 'src — файл картинки', 'src — the image file') },
          { text: 'alt="A cat"', label: tx('alt — rasm tavsifi', 'alt — описание картинки', 'alt — the description') },
        ],
      },
      example: { code: '<img src="cat.png" alt="A cat">\n<img src="logo.png" alt="Logo">', lang: 'html', result: { kind: 'browser' } },
    },
    {
      icon: '🎬',
      title: tx('Video va audio', 'Видео и аудио', 'Video & audio'),
      text: tx(
        '<video> — video, <audio> — ovoz. Ular ham src bilan ishlaydi, controls esa ijro tugmalarini chiqaradi.',
        '<video> — видео, <audio> — звук. Они тоже работают с src, а controls добавляет кнопки плеера.',
        '<video> plays video and <audio> plays sound. They use src too, and controls adds the player buttons.',
      ),
      picture: {
        kind: 'table',
        rows: [
          ['<a>', tx('🔗 havola', '🔗 ссылка', '🔗 link')],
          ['<img>', tx('🖼️ rasm', '🖼️ картинка', '🖼️ image')],
          ['<video>', tx('🎬 video', '🎬 видео', '🎬 video')],
          ['<audio>', tx('🔊 ovoz', '🔊 звук', '🔊 sound')],
        ],
      },
      example: { code: '<video src="intro.mp4" controls></video>\n<audio src="song.mp3" controls></audio>', lang: 'html', result: { kind: 'browser' } },
    },
  ],
  'html-4': [
    {
      icon: '🗺️',
      title: tx('Sahifa qismlari', 'Части страницы', 'Parts of a page'),
      text: tx(
        '<header> — tepa qism (logo, menyu), <main> — sahifaning asosiy mazmuni, <footer> — pastki qism (©, kontaktlar).',
        '<header> — верхняя часть (логотип, меню), <main> — главное содержимое, <footer> — нижняя часть (©, контакты).',
        '<header> is the top (logo, menu), <main> is the main content, and <footer> is the bottom (©, contacts).',
      ),
      picture: { kind: 'browser', html: '<header>header</header>\n<main>main</main>\n<footer>footer</footer>', css: blocks },
      example: {
        code: '<header>Code World</header>\n<main>Welcome to the game!</main>\n<footer>© 2026 Code World</footer>',
        lang: 'html',
        result: { kind: 'browser', css: blocks },
      },
    },
    {
      icon: '☰',
      title: tx('Menyu <nav>', 'Меню <nav>', 'Menu <nav>'),
      text: tx(
        '<nav> — sayt menyusi, yaʼni boshqa sahifalarga havolalar. Odatda u <header> ichida turadi.',
        '<nav> — меню сайта, то есть ссылки на другие страницы. Обычно он стоит внутри <header>.',
        '<nav> is the site menu — links to other pages. It usually sits inside the <header>.',
      ),
      example: {
        code: '<header>\n  <nav>\n    <a href="/">Home</a>\n    <a href="/map">Map</a>\n  </nav>\n</header>',
        lang: 'html',
        result: { kind: 'browser', css: blocks + 'nav a{margin-right:12px}' },
      },
    },
    {
      icon: '📐',
      title: tx('Eslab qoling', 'Запомни', 'Remember'),
      text: tx(
        'Toʻliq tartib: tepada <header> (ichida <nav>), oʻrtada <main>, pastda <footer>. Har bir ochilgan teg oʻz nomi bilan yopiladi.',
        'Полный порядок: сверху <header> (внутри <nav>), в середине <main>, внизу <footer>. Каждый тег закрывается своим именем.',
        'The full order: <header> on top (with <nav> inside), <main> in the middle, <footer> at the bottom. Each tag closes with its own name.',
      ),
      picture: {
        kind: 'table',
        rows: [
          ['<header>', tx('⬆️ tepa qism', '⬆️ верх', '⬆️ top')],
          ['<nav>', tx('☰ menyu', '☰ меню', '☰ menu')],
          ['<main>', tx('▣ asosiy qism', '▣ главное', '▣ main part')],
          ['<footer>', tx('⬇️ pastki qism', '⬇️ низ', '⬇️ bottom')],
        ],
      },
      example: {
        code: '<header>\n  <nav>Menu</nav>\n</header>\n<main>Content</main>\n<footer>©</footer>',
        lang: 'html',
        result: { kind: 'browser', css: blocks },
      },
    },
  ],
  'html-5': [
    {
      icon: '📝',
      title: tx('Forma <form>', 'Форма <form>', 'Form <form>'),
      text: tx(
        '<form> foydalanuvchidan maʼlumot yigʻadi. Ichida kiritish maydonlari <input> va yuborish tugmasi <button> boʻladi.',
        '<form> собирает данные от пользователя. Внутри — поля ввода <input> и кнопка отправки <button>.',
        '<form> collects data from the user. Inside are input fields <input> and a send <button>.',
      ),
      example: { code: '<form>\n  <input placeholder="Your name">\n  <button>Send</button>\n</form>', lang: 'html', result: { kind: 'browser' } },
    },
    {
      icon: '🏷️',
      title: tx('label va input', 'label и input', 'label & input'),
      text: tx(
        '<label> maydon nomini yozadi. label dagi for va input dagi id bir xil boʻlsa, ular bogʻlanadi. required — maydonni majburiy qiladi.',
        '<label> подписывает поле. Если for у label совпадает с id у input, они связаны. required делает поле обязательным.',
        '<label> names a field. When the label’s for matches the input’s id, they are linked. required makes the field mandatory.',
      ),
      picture: {
        kind: 'parts',
        code: '<label for="mail">Email</label>\n<input id="mail" type="email" required>',
        lang: 'html',
        parts: [
          { text: 'for="mail"', label: tx('qaysi maydonga tegishli', 'к какому полю относится', 'which field it belongs to') },
          { text: 'id="mail"', label: tx('maydon nomi — for bilan bir xil', 'имя поля — как в for', 'the field’s id — same as for') },
          { text: 'required', label: tx('majburiy maydon', 'обязательное поле', 'a required field') },
        ],
      },
      example: {
        code: '<form>\n  <label for="name">Name</label>\n  <input id="name" required>\n  <button>Send</button>\n</form>',
        lang: 'html',
        result: { kind: 'browser', css: 'label{display:block;font-weight:600;margin-bottom:4px}' },
      },
    },
    {
      icon: '🔤',
      title: tx('input turlari', 'Типы input', 'Input types'),
      text: tx(
        'type atributi maydon turini tanlaydi: email, password, checkbox, number… Brauzer har biriga mos maydon chizadi.',
        'Атрибут type выбирает вид поля: email, password, checkbox, number… Браузер рисует подходящее поле.',
        'The type attribute picks the kind of field: email, password, checkbox, number… The browser draws the right one.',
      ),
      picture: {
        kind: 'table',
        rows: [
          ['type="email"', tx('@ email manzil', '@ адрес email', '@ email address')],
          ['type="password"', tx('••• parol (yashirin)', '••• пароль (скрыт)', '••• password (hidden)')],
          ['type="checkbox"', tx('☑ belgilash', '☑ галочка', '☑ checkbox')],
          ['type="number"', tx('123 faqat son', '123 только число', '123 numbers only')],
        ],
      },
      example: {
        code: '<input type="email">\n<input type="password" value="secret">\n<input type="checkbox" checked>\n<input type="number" value="7">',
        lang: 'html',
        result: { kind: 'browser', css: 'input{display:block;margin:6px 0}' },
      },
    },
  ],
};
