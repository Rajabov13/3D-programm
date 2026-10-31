/**
 * End-to-end smoke test (demo mode) against a running build.
 *   npm run build && npm run preview   (in another terminal)
 *   npm run smoke                      (BASE_URL defaults to http://localhost:4173)
 * Screenshots are written to test-results/screens/.
 */
const { mkdirSync } = require('node:fs');
const path = require('node:path');
const { loadPlaywright, loadFixtures, BASE } = require('./browser-helpers.cjs');

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
  '/', '/dashboard', '/courses', '/courses/html', '/courses/html/lessons/html-1', '/courses/react', '/missions', '/achievements', '/progress',
  '/leaderboard', '/settings', '/profile', '/playground', '/practice/html-1-ex1', '/practice/py-1-ex1', '/admin', '/admin/courses', '/admin/courses/html',
  '/admin/lessons/html-1', '/admin/exercises/html-1-ex1', '/admin/achievements', '/admin/missions', '/world', '/does-not-exist',
];

async function unlabeledButtons(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('button, [role="button"], a[href]'))
      .filter((el) => el.getClientRects().length > 0)
      .filter((el) => !(el.labels && el.labels.length))
      .filter((el) => !(el.textContent || '').trim() && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby') && !el.getAttribute('title'))
      .map((el) => el.outerHTML.slice(0, 120)),
  );
}

async function newPage(browser, viewport, settings = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, hasTouch: viewport.width < 600, isMobile: viewport.width < 600 });
  await context.addInitScript((s) => {
    try {
      if (!localStorage.getItem('cw.settings.v1')) localStorage.setItem('cw.settings.v1', JSON.stringify({ state: { graphicsQuality: '2d', hasSeenWorldIntro: true, ...s }, version: 1 }));
    } catch {
      /* sandboxed frame */
    }
  }, settings);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text()) && errors.push(m.text()));
  return { context, page, errors };
}

(async () => {
  const { chromium } = loadPlaywright();
  const fixtures = loadFixtures();
  const browser = await chromium.launch();

  for (const [label, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    console.log(`\nRoute sweep (${label})`);
    const { context, page, errors } = await newPage(browser, viewport);
    for (const route of ROUTES) {
      errors.length = 0;
      await page.goto(`${BASE}${route}`);
      const heading = page.locator('h1').first();
      const visible = await heading.waitFor({ timeout: 20000 }).then(() => true).catch(() => false);
      await page.waitForTimeout(400);
      const unlabeled = await unlabeledButtons(page);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      ok(visible && errors.length === 0 && unlabeled.length === 0 && overflow <= 1, `${route} ${visible ? '' : '(no h1) '}${errors.length ? `errors: ${errors.join(' | ').slice(0, 200)} ` : ''}${unlabeled.length ? `unlabeled: ${unlabeled.join(' ')} ` : ''}${overflow > 1 ? `horizontal overflow ${overflow}px` : ''}`);
      if (['/', '/dashboard', '/courses/html/lessons/html-1', '/practice/html-1-ex1', '/world', '/admin'].includes(route)) {
        await page.screenshot({ path: path.join(SCREENS, `${label}${route.replace(/\//g, '_') || '_home'}.png`) });
      }
    }
    if (label === 'mobile') {
      await page.goto(`${BASE}/dashboard`);
      await page.getByRole('button', { name: 'Open menu' }).click();
      ok(await visible(page.locator('#mobile-nav')), 'mobile navigation menu opens');
      await page.screenshot({ path: path.join(SCREENS, 'mobile_menu.png') });
      await page.goto(`${BASE}/practice/html-1-ex1`);
      await page.getByRole('tab', { name: 'Code' }).click();
      ok(await visible(page.locator('.monaco-editor').first(), 15000), 'mobile workspace shows the editor tab');
      await page.getByRole('tab', { name: 'Output' }).click();
      ok(await visible(page.getByRole('button', { name: /^Run$/ })), 'mobile workspace keeps the Run button reachable');
    }
    await context.close();
  }

  console.log('\nLearning journey (demo mode)');
  {
    const { context, page, errors } = await newPage(browser, { width: 1440, height: 900 });
    await page.goto(`${BASE}/courses/html/lessons/html-1`);
    for (const answer of fixtures.quizzes['html-1']) await page.getByLabel(answer, { exact: true }).check();
    await page.getByRole('button', { name: 'Submit answers' }).click();
    ok(await visible(page.getByText(/Passed — 3\/3/), 10000), 'knowledge check passes with correct answers');
    ok(await visible(page.getByText(/\+\d+ XP/).first(), 5000), 'reward notification shows XP');

    const ex = fixtures.exercises.find((e) => e.id === 'html-1-ex1');
    await page.evaluate(([id, files]) => localStorage.setItem('cw.draft.exercise.' + id, JSON.stringify(files)), [ex.id, ex.solution]);
    await page.goto(`${BASE}/practice/html-1-ex1`);
    await page.getByRole('button', { name: /^Check$/ }).click();
    ok(await visible(page.getByText(/Saved in this browser · \+\d+ XP/), 20000), 'exercise passes and awards XP once');
    await page.getByRole('button', { name: /^Check$/ }).click();
    ok(await visible(page.getByText(/Already completed — no additional XP/), 20000), 'repeating the exercise awards no XP');

    await page.goto(`${BASE}/courses/html/lessons/html-1`);
    await page.getByRole('button', { name: /Complete lesson/ }).click();
    ok(await visible(page.getByText(/Completed — 20 XP earned/), 10000), 'lesson completes after quiz + exercise');

    await page.goto(`${BASE}/missions`);
    await page.getByRole('button', { name: 'Claim reward' }).first().click();
    ok(await visible(page.getByText(/Completed .*20\d\d/).first(), 10000), 'mission reward claimed');

    await page.goto(`${BASE}/dashboard`);
    const chip = await page.getByRole('link', { name: /^Level \d+, \d+ XP/ }).getAttribute('aria-label');
    ok(/^Level 2, 130 XP/.test(chip || ''), `XP and level match the rules (${chip})`);
    await page.goto(`${BASE}/courses`);
    const css = page.getByRole('link', { name: /CSS Design Studio/ });
    ok(await visible(css.getByText('Unlocked')), 'reaching level 2 unlocks the CSS Design Studio');
    await page.screenshot({ path: path.join(SCREENS, 'journey_courses.png') });
    ok(errors.length === 0, `no runtime errors during the journey ${errors.join(' | ')}`);
    await context.close();
  }

  console.log('\nAdministration (demo)');
  {
    const { context, page, errors } = await newPage(browser, { width: 1440, height: 900 });
    await page.goto(`${BASE}/admin/exercises/react-3-ex1`);
    await page.getByRole('button', { name: 'Validate solution' }).click();
    ok(await visible(page.getByText('The solution passes every check'), 30000), 'admin validation: reference solution passes');
    ok(await visible(page.getByText('The starter code does not pass (good)')), 'admin validation: starter code fails');
    await page.screenshot({ path: path.join(SCREENS, 'admin_validate.png'), fullPage: false });
    await page.goto(`${BASE}/admin/courses`);
    await page.getByRole('switch', { name: 'Publish React Development Tower' }).click();
    await page.waitForTimeout(500);
    await page.goto(`${BASE}/courses`);
    await page.getByRole('heading', { name: 'Courses', level: 1 }).waitFor();
    ok((await page.locator('main ul > li > a[href^="/courses/"]').count()) === 4, 'unpublishing hides the course from learners');
    await page.goto(`${BASE}/admin/courses`);
    await page.getByRole('switch', { name: 'Publish React Development Tower' }).click();
    ok(errors.length === 0, `no runtime errors in admin ${errors.join(' | ')}`);
    await context.close();
  }

  console.log('\n3D world (WebGL)');
  {
    // Software WebGL so the 3D path (not the 2D fallback) is exercised in headless CI.
    const gpu = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
    const { context, page, errors } = await newPage(gpu, { width: 1440, height: 900 }, { graphicsQuality: 'low' });
    await page.goto(`${BASE}/world`);
    await page.locator('canvas').waitFor({ timeout: 30000 }).catch(() => undefined);
    const loaded = await page.getByText('Initializing city grid…').waitFor({ state: 'detached', timeout: 90000 }).then(() => true).catch(() => false);
    ok(loaded && (await page.locator('canvas').count()) > 0, 'city scene renders');
    await page.keyboard.press('2');
    ok(await visible(page.getByRole('heading', { name: 'CSS Design Studio' }), 8000), 'keyboard shortcut travels to a location and opens its panel');
    await page.getByRole('button', { name: /Preview course|Enter CSS/ }).click();
    ok(/\/courses\/css$/.test(page.url()), 'building panel opens the learning area');
    ok(errors.filter((e) => !/GPU stall|GL Driver/.test(e)).length === 0, `no runtime errors in the world ${errors.join(' | ')}`);
    await context.close();
    await gpu.close();
  }

  await browser.close();
  console.log(failures ? `\n${failures} check(s) failed` : '\nSmoke test passed');
  process.exit(failures ? 1 : 0);
})();
