/**
 * End-to-end smoke test against a running build.
 *   npm run build && npm run preview   (in another terminal)
 *   npm run smoke                      (BASE_URL defaults to http://localhost:4173)
 * Screenshots are written to test-results/screens/.
 */
const { mkdirSync } = require('node:fs');
const path = require('node:path');
const { loadPlaywright, loadFixtures, BASE } = require('./browser-helpers.cjs');
const { playStage } = require('./game-helpers.cjs');

const SCREENS = path.join(__dirname, '..', 'test-results', 'screens');
mkdirSync(SCREENS, { recursive: true });
let failures = 0;
/** Waits for a locator to become visible (Playwright's isVisible() does not wait). */
const visible = (locator, timeout = 15000) => locator.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
const ok = (cond, msg) => {
  console.log(`${cond ? '  ✓' : '  ✗'} ${msg}`);
  if (!cond) failures++;
};

const ROUTES = [
  '/', '/map', '/zone/html', '/zone/react', '/play/html-1', '/play/css-1', '/boss/html', '/quests', '/badges', '/leaderboard', '/settings', '/profile', '/lab',
  '/world', '/dashboard', '/does-not-exist',
];
const SHOTS = ['/', '/map', '/zone/html', '/play/html-1', '/lab', '/world', '/quests', '/badges', '/profile'];

async function unlabeledButtons(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('button, [role="button"], a[href]'))
      .filter((el) => el.getClientRects().length > 0)
      .filter((el) => !(el.labels && el.labels.length))
      .filter((el) => !(el.textContent || '').trim() && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby') && !el.getAttribute('title'))
      .map((el) => el.outerHTML.slice(0, 120)),
  );
}

async function newPage(browser, viewport, { settings = {}, lang = 'en' } = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, hasTouch: viewport.width < 600, isMobile: viewport.width < 600, locale: 'en-US' });
  await context.addInitScript(
    ([s, l]) => {
      try {
        if (!localStorage.getItem('cw.settings.v1')) localStorage.setItem('cw.settings.v1', JSON.stringify({ state: { graphicsQuality: '2d', hasSeenWorldIntro: true, sound: false, ...s }, version: 1 }));
        if (l && !localStorage.getItem('cw.lang.v1')) localStorage.setItem('cw.lang.v1', JSON.stringify({ state: { lang: l }, version: 1 }));
      } catch {
        /* sandboxed frame */
      }
    },
    [settings, lang],
  );
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text()) && errors.push(m.text()));
  return { context, page, errors };
}

const xpOf = async (page) => {
  await page.goto(`${BASE}/profile`);
  const label = await page.getByRole('link', { name: /XP/ }).first().getAttribute('aria-label');
  return Number(/(\d+) XP/.exec(label || '')?.[1] ?? NaN);
};

(async () => {
  const { chromium } = loadPlaywright();
  const fixtures = loadFixtures();
  const stage = (id) => fixtures.stages.find((s) => s.id === id);
  const browser = await chromium.launch();

  for (const [label, viewport, lang] of [
    ['desktop', { width: 1440, height: 900 }, 'uz'],
    ['mobile', { width: 390, height: 844 }, 'uz'],
    ['desktop-ru', { width: 1280, height: 800 }, 'ru'],
  ]) {
    console.log(`\nRoute sweep (${label})`);
    const { context, page, errors } = await newPage(browser, viewport, { lang });
    for (const route of ROUTES) {
      errors.length = 0;
      await page.goto(`${BASE}${route}`);
      const heading = page.locator('h1').first();
      const seen = await heading.waitFor({ timeout: 20000 }).then(() => true).catch(() => false);
      await page.waitForTimeout(400);
      const unlabeled = await unlabeledButtons(page);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const htmlLang = await page.evaluate(() => document.documentElement.lang);
      ok(
        seen && errors.length === 0 && unlabeled.length === 0 && overflow <= 1 && htmlLang === lang,
        `${route} ${seen ? '' : '(no h1) '}${errors.length ? `errors: ${errors.join(' | ').slice(0, 200)} ` : ''}${unlabeled.length ? `unlabeled: ${unlabeled.join(' ')} ` : ''}${overflow > 1 ? `horizontal overflow ${overflow}px ` : ''}${htmlLang !== lang ? `lang=${htmlLang}` : ''}`,
      );
      if (SHOTS.includes(route) && label !== 'desktop-ru') await page.screenshot({ path: path.join(SCREENS, `${label}${route.replace(/\//g, '_') || '_home'}.png`) });
      if (label === 'desktop-ru' && ['/', '/map', '/play/html-1'].includes(route)) await page.screenshot({ path: path.join(SCREENS, `${label}${route.replace(/\//g, '_') || '_home'}.png`) });
    }
    await page.goto(`${BASE}/dashboard`);
    ok(await page.waitForURL(/\/map$/, { timeout: 10000 }).then(() => true).catch(() => false), 'old /dashboard link redirects to the map');
    if (label === 'mobile') {
      await page.goto(`${BASE}/settings`);
      await page.getByRole('switch').first().waitFor();
      const knobs = async () =>
        page.$$eval('[role="switch"]', (els) =>
          els.map((el) => {
            const t = el.getBoundingClientRect();
            const k = el.firstElementChild.getBoundingClientRect();
            const on = el.getAttribute('aria-checked') === 'true';
            return k.left >= t.left && k.right <= t.right && (on ? k.left > t.left + t.width / 2 - k.width / 2 : k.right < t.left + t.width / 2 + k.width / 2);
          }),
        );
      const before = await knobs();
      await page.getByRole('switch').first().click();
      await page.waitForTimeout(400); // let the slide animation finish
      const after = await knobs();
      await page.getByRole('switch').first().click();
      ok([...before, ...after].every(Boolean), `switch knobs stay inside their tracks, left when off and right when on (${JSON.stringify([before, after])})`);
      await page.goto(`${BASE}/map`);
      await page.getByRole('button', { name: 'Menyuni ochish' }).click();
      ok(await visible(page.locator('#mobile-nav')), 'mobile navigation menu opens');
      await page.screenshot({ path: path.join(SCREENS, 'mobile_menu.png') });
      await page.goto(`${BASE}/lab`);
      await page.getByRole('tab', { name: 'Kod' }).click();
      ok(await visible(page.locator('.monaco-editor').first(), 15000), 'mobile lab shows the editor tab');
      await page.getByRole('tab', { name: 'Natija' }).click();
      ok(await visible(page.getByRole('button', { name: /Ishga tushirish/ })), 'mobile lab keeps the Run button reachable');
    }
    await context.close();
  }

  console.log('\nLanguage switching');
  {
    const { context, page, errors } = await newPage(browser, { width: 1280, height: 800 }, { lang: 'uz' });
    await page.goto(`${BASE}/map`);
    ok(await visible(page.getByRole('heading', { name: 'Olamlar', level: 1 })), 'Uzbek is the default');
    await page.getByRole('radio', { name: 'Русский' }).first().click();
    ok(await visible(page.getByRole('heading', { name: 'Миры', level: 1 })), 'switches to Russian instantly');
    ok((await page.evaluate(() => document.documentElement.lang)) === 'ru', '<html lang> follows the language');
    await page.getByRole('radio', { name: 'English' }).first().click();
    ok(await visible(page.getByRole('heading', { name: 'Worlds', level: 1 })), 'switches to English');
    await page.reload();
    ok(await visible(page.getByRole('heading', { name: 'Worlds', level: 1 })), 'the choice is remembered');
    ok(errors.length === 0, `no runtime errors ${errors.join(' | ')}`);
    await context.close();
  }
  {
    const context = await browser.newContext({ locale: 'ru-RU' });
    const page = await context.newPage();
    await page.goto(`${BASE}/map`);
    ok(await visible(page.getByRole('heading', { name: 'Миры', level: 1 })), 'a Russian browser starts in Russian');
    await context.close();
  }

  console.log('\nLearning cards (info → example → test)');
  {
    const { context, page, errors } = await newPage(browser, { width: 1280, height: 860 }, { lang: 'uz' });
    await page.goto(`${BASE}/play/html-3`);
    ok(await visible(page.getByText('Bu bosqich hali yopiq')), 'a locked stage shows no cards');
    await page.goto(`${BASE}/play/html-1`);
    ok(await visible(page.getByRole('heading', { name: 'Teg nima?' })), 'a stage opens with its first learning card, not the test');
    ok((await page.getByRole('button', { name: 'Testni boshlash' }).count()) === 0, 'the test can’t start before the cards are read');
    ok((await page.getByText('Maʼlumot', { exact: true }).count()) > 0 && (await page.getByText('Namuna', { exact: true }).count()) > 0, 'cards are labelled “Maʼlumot” and “Namuna”');
    ok((await page.locator('mark').count()) >= 3, 'the picture highlights the parts of the code');
    await page.getByRole('button', { name: 'Natijani koʻrish' }).click();
    const rendered = await page.waitForFunction(() => Array.from(document.querySelectorAll('div')).some((d) => d.shadowRoot?.textContent?.includes('Hello, world!')), null, { timeout: 5000 }).then(() => true).catch(() => false);
    ok(rendered, 'the example result is rendered like a real page');
    await page.screenshot({ path: path.join(SCREENS, 'learn_card_1.png'), fullPage: true });
    for (let i = 1; i < stage('html-1').cards; i++) await page.getByRole('button', { name: 'Keyingi', exact: true }).click();
    ok(await visible(page.getByRole('button', { name: 'Testni boshlash' })), 'the last card offers to start the test');
    await page.screenshot({ path: path.join(SCREENS, 'learn_card_last.png'), fullPage: true });
    await page.keyboard.press('ArrowLeft');
    ok(await visible(page.getByRole('heading', { name: 'Sahifa skeleti' })), '← goes back one card');
    await page.getByRole('button', { name: 'Keyingi', exact: true }).click();
    await page.getByRole('button', { name: 'Testni boshlash' }).click();
    ok(await visible(page.getByRole('radiogroup')), 'the test starts after the cards');
    await page.getByRole('button', { name: 'Eslatma' }).click();
    ok(await visible(page.getByRole('dialog').getByRole('heading', { name: 'Teg nima?' })), 'the notes sheet shows the cards during the test');
    await page.screenshot({ path: path.join(SCREENS, 'learn_notes.png') });
    await page.keyboard.press('Escape');

    await page.goto(`${BASE}/play/py-1`);
    const pyLocked = await visible(page.getByText('Bu bosqich hali yopiq'), 3000);
    ok(pyLocked, 'other worlds stay locked at level 1');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/play/html-2`);
    ok(await visible(page.getByText('Bu bosqich hali yopiq'), 3000), 'stage 2 is locked until stage 1 is cleared');
    ok(errors.length === 0, `no runtime errors on the cards ${errors.join(' | ')}`);
    await context.close();
  }
  {
    // Every stage’s cards render (all picture kinds) in every language without errors.
    const { context, page, errors } = await newPage(browser, { width: 390, height: 844 }, { lang: 'ru' });
    const save = { state: { game: { version: 1, xp: 2000, stars: Object.fromEntries(fixtures.stages.map((s) => [s.id, 1])), bosses: {}, badges: {}, quests: {}, ledger: {}, history: [], days: {} } }, version: 1 };
    await page.addInitScript((s) => localStorage.setItem('cw.game.v1', JSON.stringify(s)), save);
    let shown = 0;
    for (const s of fixtures.stages) {
      await page.goto(`${BASE}/play/${s.id}`);
      for (let i = 0; i < s.cards; i++) {
        await page.getByRole('button', { name: 'Показать результат' }).click();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        if (overflow <= 1) shown++;
        else console.log(`    overflow ${overflow}px on ${s.id} card ${i + 1}`);
        if (i < s.cards - 1) await page.getByRole('button', { name: 'Дальше', exact: true }).click();
      }
      if (['css-4', 'js-3', 'py-3', 'react-1'].includes(s.id)) await page.screenshot({ path: path.join(SCREENS, `learn_mobile_ru_${s.id}.png`), fullPage: true });
    }
    const total = fixtures.stages.reduce((n, s) => n + s.cards, 0);
    ok(shown === total, `all ${total} cards open on a phone with their results and no sideways scrolling (${shown}/${total})`);
    ok(errors.length === 0, `no runtime errors on any card ${errors.join(' | ')}`);
    await context.close();
  }

  console.log('\nGame journey');
  {
    const { context, page, errors } = await newPage(browser, { width: 1440, height: 900 }, { lang: 'en' });
    ok((await playStage(page, BASE, stage('html-1'))) === 'done', 'stage html-1 played with perfect answers');
    ok(await visible(page.getByText('Stage cleared!')), 'result screen appears');
    ok((await page.getByRole('img', { name: '3/3 ⭐' }).count()) > 0, 'a perfect run earns 3 stars');
    await page.screenshot({ path: path.join(SCREENS, 'journey_result.png') });
    ok((await xpOf(page)) === 60, 'first clear: 10 + 3×10 XP, plus the “first step” and “flawless” badges (+20)');

    ok((await playStage(page, BASE, stage('html-1'), { wrong: [0] })) === 'done', 'replay with one mistake (task is repeated at the end)');
    ok((await page.getByRole('img', { name: '2/3 ⭐' }).count()) > 0, 'one mistake gives 2 stars');
    ok(await visible(page.getByText(/XP for these stars was already/i)), 'replays award no XP');
    ok((await xpOf(page)) === 60, 'XP unchanged after the replay');

    ok((await playStage(page, BASE, stage('html-2'), { wrong: [0, 1, 2] })) === 'failed', 'three mistakes end the run');
    ok(await visible(page.getByText('Out of hearts')), 'failure screen appears');
    await page.screenshot({ path: path.join(SCREENS, 'journey_failed.png') });

    await page.goto(`${BASE}/play/html-3`);
    ok(await visible(page.getByText('This stage is still locked')), 'stages unlock in order');

    for (const id of ['html-2', 'html-3', 'html-4', 'html-5']) ok((await playStage(page, BASE, stage(id))) === 'done', `stage ${id} cleared`);
    ok(await visible(page.getByRole('button', { name: 'Fight the boss!' })), 'clearing the world offers the boss');

    const boss = fixtures.bosses.find((b) => b.zoneId === 'html');
    await page.evaluate((files) => localStorage.setItem('cw.draft.boss.html', JSON.stringify(files)), boss.starter);
    await page.goto(`${BASE}/boss/html`);
    await page.getByRole('button', { name: 'Check', exact: true }).first().click();
    ok(await visible(page.getByText(/\d\/\d requirements met/).first(), 20000), 'the starter code does not beat the boss');
    await page.evaluate((files) => localStorage.setItem('cw.draft.boss.html', JSON.stringify(files)), boss.solution);
    await page.reload();
    await page.getByRole('button', { name: 'Check', exact: true }).first().click();
    ok(await visible(page.getByText('Boss defeated!'), 20000), 'a correct solution beats the boss');
    await page.screenshot({ path: path.join(SCREENS, 'journey_boss.png') });

    await page.goto(`${BASE}/quests`);
    const claim = page.getByRole('button', { name: /^\+\d+$/ }).first();
    await claim.click();
    ok(await visible(page.getByText('Claimed').first()), 'a finished daily quest can be claimed');
    await page.goto(`${BASE}/map`);
    ok((await page.getByRole('link', { name: /CSS Studio/ }).getByText(/Unlocks at level/).count()) === 0, 'levelling up unlocks the CSS world');
    await page.screenshot({ path: path.join(SCREENS, 'journey_map.png') });
    ok(errors.length === 0, `no runtime errors during the journey ${errors.join(' | ')}`);
    await context.close();
  }

  console.log('\nNew version deployed while a tab was open');
  {
    // The old tab asks for a page file that no longer exists: it must reload itself once and recover.
    const { context, page, errors } = await newPage(browser, { width: 1280, height: 800 }, { lang: 'en' });
    await page.goto(`${BASE}/map`);
    await page.getByRole('heading', { name: 'Worlds', level: 1 }).waitFor();
    let missing = 1;
    await page.route('**/assets/QuestsPage-*.js', (route) => (missing-- > 0 ? route.fulfill({ status: 404, body: 'gone' }) : route.continue()));
    await page.getByRole('link', { name: 'Quests' }).first().click();
    ok(await visible(page.getByRole('heading', { name: /Today’s quests/, level: 1 }), 20000), 'a missing page file triggers one reload and the page opens');
    ok((await page.getByText('The site was updated').count()) === 0, 'no error is shown when the reload fixes it');
    await page.unroute('**/assets/QuestsPage-*.js');

    // If the file is still missing after the reload, a clear message with a working Reload button appears.
    await page.goto(`${BASE}/map`);
    await page.getByRole('heading', { name: 'Worlds', level: 1 }).waitFor();
    await page.route('**/assets/BadgesPage-*.js', (route) => route.fulfill({ status: 404, body: 'gone' }));
    await page.evaluate(() => sessionStorage.removeItem('cw.chunkReloadAt'));
    await page.goto(`${BASE}/badges`);
    ok(await visible(page.getByText('The site was updated'), 20000), 'a lasting failure shows “The site was updated”, not a broken retry loop');
    ok(await visible(page.getByRole('button', { name: 'Reload' })), 'and offers a Reload button');
    await page.screenshot({ path: path.join(SCREENS, 'stale_version.png') });
    ok(errors.filter((e) => !/QuestsPage|BadgesPage|dynamically imported module|The above error/i.test(e)).length === 0, `no other errors ${errors.join(' | ').slice(0, 300)}`);
    await context.close();
  }

  console.log('\nLight / dark theme');
  {
    const { context, page, errors } = await newPage(browser, { width: 1280, height: 860 }, { lang: 'uz' });
    await page.goto(`${BASE}/map`);
    await page.getByRole('heading', { name: 'Olamlar', level: 1 }).waitFor();
    const themeOf = () => page.evaluate(() => document.documentElement.dataset.theme);
    const bodyBg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    ok((await themeOf()) === 'light' && (await bodyBg()) === 'rgb(242, 244, 245)', 'the site opens in the light theme by default');
    await page.getByRole('button', { name: /Mavzuni almashtirish/ }).click();
    ok((await themeOf()) === 'dark' && (await bodyBg()) === 'rgb(35, 37, 39)', 'the navbar button switches to the dark theme');
    await page.reload();
    await page.getByRole('heading', { name: 'Olamlar', level: 1 }).waitFor();
    ok((await themeOf()) === 'dark', 'the theme is remembered after a reload (no flash: set before React starts)');
    await page.goto(`${BASE}/settings`);
    await page.getByRole('radio', { name: /Yorugʻ/ }).click();
    ok((await themeOf()) === 'light', 'Settings → Koʻrinish → Yorugʻ switches back');
    await page.goto(`${BASE}/world`);
    ok((await page.locator('[data-theme="dark"]').count()) === 0 && (await themeOf()) === 'light', 'the 3D city follows the theme (day scene in the light theme)');

    // Every visible text must be readable (WCAG AA: 4.5:1, or 3:1 for large text) in both themes.
    const audit = () => {
      const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
      const over = (t, b) => ({ r: t.r * t.a + b.r * (1 - t.a), g: t.g * t.a + b.g * (1 - t.a), b: t.b * t.a + b.b * (1 - t.a), a: 1 });
      const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
      const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
      const bgOf = (el) => {
        const chain = [];
        for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.backgroundImage !== 'none') return null; const c = parse(cs.backgroundColor); if (c && c.a > 0) chain.push(c); }
        let bg = { r: 255, g: 255, b: 255, a: 1 };
        for (let i = chain.length - 1; i >= 0; i--) bg = over(chain[i], bg);
        return bg;
      };
      const bad = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const el = n.parentElement; const text = n.textContent.trim();
        if (!el || !text || el.closest('svg,canvas,[aria-hidden="true"],button:disabled,.monaco-editor,.text-gradient,option,select')) continue;
        const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
        const cs = getComputedStyle(el); if (cs.visibility === 'hidden') continue;
        let op = 1; for (let e = el; e; e = e.parentElement) op *= +getComputedStyle(e).opacity; if (op < 0.5) continue;
        const bg = bgOf(el); const fg = parse(cs.color); if (!bg || !fg) continue;
        const c = ratio(over(fg, bg), bg);
        const big = parseFloat(cs.fontSize) >= 18.5 || (parseFloat(cs.fontSize) >= 14 && +cs.fontWeight >= 700);
        if (c < (big ? 3 : 4.5)) bad.push(`${c.toFixed(2)} “${text.slice(0, 24)}”`);
      }
      return bad;
    };
    for (const theme of ['light', 'dark']) {
      await page.evaluate((t) => {
        const s = JSON.parse(localStorage.getItem('cw.settings.v1') || '{"state":{},"version":1}');
        s.state.theme = t;
        localStorage.setItem('cw.settings.v1', JSON.stringify(s));
      }, theme);
      const low = [];
      for (const route of ['/map', '/zone/html', '/play/html-1', '/quests', '/badges', '/profile', '/settings', '/leaderboard']) {
        await page.goto(`${BASE}${route}`);
        await page.locator('h1').first().waitFor();
        await page.waitForTimeout(300);
        low.push(...(await page.evaluate(audit)).map((x) => `${route} ${x}`));
      }
      ok(low.length === 0, `all text is readable in the ${theme} theme ${low.slice(0, 6).join(' | ')}`);
      await page.screenshot({ path: path.join(SCREENS, `theme_${theme}_settings.png`) });
    }
    ok(errors.length === 0, `no runtime errors while switching themes ${errors.join(' | ')}`);
    await context.close();
  }

  console.log('\n3D world (WebGL)');
  {
    // Software WebGL so the 3D path (not the 2D fallback) is exercised in headless CI.
    const gpu = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
    const { context, page, errors } = await newPage(gpu, { width: 1440, height: 900 }, { settings: { graphicsQuality: 'low' }, lang: 'uz' });
    await page.goto(`${BASE}/world`);
    await page.locator('canvas').waitFor({ timeout: 30000 }).catch(() => undefined);
    const loaded = await page.getByText('Shahar qurilmoqda…').waitFor({ state: 'detached', timeout: 90000 }).then(() => true).catch(() => false);
    ok(loaded && (await page.locator('canvas').count()) > 0, 'city scene renders');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENS, 'world_3d_uz.png') });
    await page.keyboard.press('2');
    ok(await visible(page.getByRole('heading', { name: 'CSS Studiyasi' }), 8000), 'keyboard shortcut travels to a location and opens its (translated) panel');
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(SCREENS, 'world_3d_panel.png') });
    await page.getByRole('radio', { name: 'Русский' }).click();
    ok(await visible(page.getByRole('heading', { name: 'Студия CSS' }), 5000), 'the world switches language live');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENS, 'world_3d_ru.png') });
    await page.getByRole('button', { name: 'Открыть', exact: true }).click();
    ok(/\/zone\/css$/.test(page.url()), 'building panel opens the world');
    ok(errors.filter((e) => !/GPU stall|GL Driver/.test(e)).length === 0, `no runtime errors in the world ${errors.join(' | ')}`);
    await context.close();
    await gpu.close();
  }

  await browser.close();
  console.log(failures ? `\n${failures} check(s) failed` : '\nSmoke test passed');
  process.exit(failures ? 1 : 0);
})();
