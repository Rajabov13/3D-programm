/**
 * Runs every boss's reference solution through the real browser sandboxes
 * (web preview, JS worker, Pyodide, React) and asserts that all checks pass —
 * and that the starter code does NOT pass.
 *   npm run build && npm run preview   (in another terminal)
 *   npm run verify:bosses              (BASE_URL defaults to http://localhost:4173)
 */
const { loadPlaywright, loadFixtures, BASE } = require('./browser-helpers.cjs');

/** A save where every stage is cleared, so every boss is open. */
function unlockedSave(fixtures) {
  const stars = Object.fromEntries(fixtures.stages.map((s) => [s.id, 3]));
  return { state: { game: { version: 1, xp: 2000, stars, bosses: {}, badges: {}, quests: {}, ledger: {}, history: [], days: {} } }, version: 1 };
}

(async () => {
  const { chromium } = loadPlaywright();
  const fixtures = loadFixtures();
  const only = process.argv.slice(2);
  const browser = await chromium.launch();
  let failed = 0;
  for (const boss of fixtures.bosses.filter((b) => only.length === 0 || only.includes(b.zoneId))) {
    for (const variant of ['solution', 'starter']) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US' });
      await context.addInitScript(
        ([zoneId, files, save]) => {
          try {
            localStorage.setItem('cw.game.v1', JSON.stringify(save));
            localStorage.setItem('cw.lang.v1', JSON.stringify({ state: { lang: 'en' }, version: 1 }));
            if (!sessionStorage.getItem('seeded')) {
              localStorage.setItem('cw.draft.boss.' + zoneId, JSON.stringify(files));
              sessionStorage.setItem('seeded', '1');
            }
          } catch {
            /* sandboxed frames have no storage */
          }
        },
        [boss.zoneId, boss[variant], unlockedSave(fixtures)],
      );
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(`${BASE}/boss/${boss.zoneId}`);
      const check = page.getByRole('button', { name: 'Check', exact: true }).first();
      await check.waitFor({ timeout: 30000 });
      const started = Date.now();
      await check.click();
      const outcome = await Promise.race([
        page.getByText('Boss defeated!').waitFor({ timeout: 150000 }).then(() => 'PASS'),
        page.getByText(/\d+\/\d+ requirements met/).first().waitFor({ timeout: 150000 }).then(() => 'FAIL'),
      ]).catch(() => 'TIMEOUT');
      const expected = variant === 'solution' ? 'PASS' : 'FAIL';
      if (outcome !== expected) failed++;
      console.log(`${outcome === expected ? 'ok  ' : 'BAD '} ${boss.zoneId.padEnd(7)} ${variant.padEnd(8)} → ${outcome.padEnd(7)} ${Date.now() - started}ms ${errors.join('; ')}`);
      await context.close();
    }
  }
  await browser.close();
  console.log(failed ? `\n${failed} boss check(s) failed` : '\nAll bosses verified');
  process.exit(failed ? 1 : 0);
})();
