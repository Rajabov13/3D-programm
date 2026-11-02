import { tx } from '@/i18n';
import type { Zone } from '../types';

export const htmlZone: Zone = {
  id: 'html',
  nameKey: 'b.html',
  buildingId: 'html-academy',
  symbol: '</>',
  accent: '#fb923c',
  requiredLevel: 1,
  stages: [
    {
      id: 'html-1',
      zoneId: 'html',
      title: tx('Teglar', 'Теги', 'Tags'),
      tasks: [
        { kind: 'pick', q: tx('Eng katta sarlavha', 'Самый крупный заголовок', 'The biggest heading'), options: ['<h1>', '<h6>', '<p>', '<head>'], answer: 0 },
        { kind: 'pick', q: tx('Yopuvchi teg', 'Закрывающий тег', 'A closing tag'), options: ['</p>', '<p>', '<p/>', '<\\p>'], answer: 0 },
        { kind: 'blank', code: '<h1>Code World</___>', lang: 'html', options: ['h1', 'p', 'h2', '/h1'], answer: 0 },
        { kind: 'order', lines: ['<!DOCTYPE html>', '<html>', '<body>', '<h1>Hi</h1>', '</body>', '</html>'], lang: 'html' },
        { kind: 'bug', lines: ['<h1>Code World</h1>', '<p>Hello!</h1>', '<p>Bye!</p>'], bug: 1, fix: '<p>Hello!</p>', lang: 'html' },
        { kind: 'match', pairs: [['<img>', '🖼️'], ['<a>', '🔗'], ['<p>', '¶'], ['<button>', '🔘']] },
      ],
    },
    {
      id: 'html-2',
      zoneId: 'html',
      title: tx('Matn va roʻyxatlar', 'Текст и списки', 'Text & lists'),
      tasks: [
        { kind: 'pick', q: tx('Raqamli roʻyxat', 'Нумерованный список', 'A numbered list'), options: ['<ol>', '<ul>', '<li>', '<dl>'], answer: 0 },
        { kind: 'pick', q: tx('Roʻyxat bandi', 'Пункт списка', 'A list item'), options: ['<li>', '<ul>', '<item>', '<list>'], answer: 0 },
        { kind: 'blank', code: '<ul>\n  <___>HTML</li>\n</ul>', lang: 'html', options: ['li', 'ul', 'ol', 'p'], answer: 0 },
        { kind: 'order', lines: ['<ol>', '  <li>One</li>', '  <li>Two</li>', '  <li>Three</li>', '</ol>'], lang: 'html' },
        { kind: 'bug', lines: ['<ul>', '  <li>HTML</li>', '  <li>CSS</ul>', '</ul>'], bug: 2, fix: '  <li>CSS</li>', lang: 'html' },
        { kind: 'match', pairs: [['<strong>', '𝐁'], ['<em>', '𝘐'], ['<br>', '↵'], ['<hr>', '―']] },
      ],
    },
    {
      id: 'html-3',
      zoneId: 'html',
      title: tx('Havolalar va rasmlar', 'Ссылки и картинки', 'Links & images'),
      tasks: [
        { kind: 'pick', q: tx('Havola manzili atributi', 'Атрибут адреса ссылки', 'The link address attribute'), options: ['href', 'src', 'alt', 'link'], answer: 0 },
        { kind: 'pick', q: tx('Rasmning matnli tavsifi', 'Текстовое описание картинки', 'An image’s text description'), options: ['alt', 'title', 'src', 'href'], answer: 0 },
        { kind: 'blank', code: '<img ___="cat.png" alt="A cat">', lang: 'html', options: ['src', 'href', 'link', 'url'], answer: 0 },
        { kind: 'order', lines: ['<p>', '  <a href="/about">About</a>', '</p>'], lang: 'html' },
        { kind: 'bug', lines: ['<a href="/home">Home</a>', '<img src="logo.png">', '<a href="/blog">Blog</a>'], bug: 1, fix: '<img src="logo.png" alt="Logo">', lang: 'html' },
        { kind: 'match', pairs: [['<a>', '🔗'], ['<img>', '🖼️'], ['<video>', '🎬'], ['<audio>', '🔊']] },
      ],
    },
    {
      id: 'html-4',
      zoneId: 'html',
      title: tx('Sahifa tuzilishi', 'Структура страницы', 'Page structure'),
      tasks: [
        { kind: 'pick', q: tx('Sayt menyusi uchun teg', 'Тег для меню сайта', 'The tag for site navigation'), options: ['<nav>', '<menu>', '<header>', '<main>'], answer: 0 },
        { kind: 'pick', q: tx('Sahifaning asosiy qismi', 'Главная часть страницы', 'The main content of a page'), options: ['<main>', '<body>', '<section>', '<div>'], answer: 0 },
        { kind: 'order', lines: ['<header>', '  <nav>Menu</nav>', '</header>', '<main>Content</main>', '<footer>©</footer>'], lang: 'html' },
        { kind: 'blank', code: '<___>© 2026 Code World</footer>', lang: 'html', options: ['footer', 'bottom', 'end', 'div'], answer: 0 },
        { kind: 'bug', lines: ['<header>', '  <nav>Menu</nav>', '</footer>'], bug: 2, fix: '</header>', lang: 'html' },
        { kind: 'match', pairs: [['<header>', '⬆️'], ['<main>', '▣'], ['<footer>', '⬇️'], ['<nav>', '☰']] },
      ],
    },
    {
      id: 'html-5',
      zoneId: 'html',
      title: tx('Formalar', 'Формы', 'Forms'),
      tasks: [
        { kind: 'pick', q: tx('Email kiritish maydoni', 'Поле для email', 'An email field'), options: ['<input type="email">', '<input type="text">', '<email>', '<input mail>'], answer: 0 },
        { kind: 'pick', q: tx('Maydonni majburiy qilish', 'Сделать поле обязательным', 'Make a field required'), options: ['required', 'needed', 'must', 'important'], answer: 0 },
        { kind: 'blank', code: '<label ___="email">Email</label>\n<input id="email">', lang: 'html', options: ['for', 'id', 'name', 'to'], answer: 0 },
        { kind: 'order', lines: ['<form>', '  <label for="name">Name</label>', '  <input id="name">', '  <button>Send</button>', '</form>'], lang: 'html' },
        { kind: 'bug', lines: ['<form>', '  <input type="email" required>', '  <button>Send</button>', '</fom>'], bug: 3, fix: '</form>', lang: 'html' },
        { kind: 'match', pairs: [['type="email"', '@'], ['type="password"', '•••'], ['type="checkbox"', '☑'], ['type="number"', '123']] },
      ],
    },
  ],
  boss: {
    zoneId: 'html',
    name: tx('Vizitka', 'Визитка', 'Business card'),
    task: tx(
      'Vizitka sahifasini yarating: <h1> ichida ismingiz, <p> da oʻzingiz haqingizda, kamida 3 ta <li> boʻlgan roʻyxat va bitta havola <a href>.',
      'Сделай страницу-визитку: имя в <h1>, пару слов о себе в <p>, список минимум из 3 <li> и одна ссылка <a href>.',
      'Build a business card page: your name in an <h1>, a sentence about you in a <p>, a list with at least 3 <li> items and one <a href> link.',
    ),
    mode: 'web',
    starter: { html: '<!-- 👇 -->\n\n', css: 'body {\n  font-family: system-ui, sans-serif;\n  padding: 24px;\n}\n', js: '' },
    solution: {
      html: '<h1>Nova</h1>\n<p>I build websites.</p>\n<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n  <li>JavaScript</li>\n</ul>\n<a href="https://example.com">My site</a>\n',
      css: 'body {\n  font-family: system-ui, sans-serif;\n  padding: 24px;\n}\n',
      js: '',
    },
    checks: [
      { label: tx('<h1> sarlavha', 'Заголовок <h1>', 'An <h1> heading'), spec: { id: 'h1', label: '', type: 'html_element', selector: 'h1' } },
      { label: tx('<p> paragraf', 'Абзац <p>', 'A <p> paragraph'), spec: { id: 'p', label: '', type: 'html_element', selector: 'p' } },
      { label: tx('Kamida 3 ta <li>', 'Минимум 3 пункта <li>', 'At least 3 <li> items'), spec: { id: 'li', label: '', type: 'html_element', selector: 'ul > li, ol > li', min: 3 } },
      {
        label: tx('Havola <a href>', 'Ссылка <a href>', 'A link <a href>'),
        spec: { id: 'a', label: '', type: 'html_element', selector: 'a', attribute: { name: 'href', valuePattern: '\\S' } },
      },
    ],
    xp: 50,
  },
};
