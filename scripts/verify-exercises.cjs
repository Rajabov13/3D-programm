/**
 * Runs every exercise's reference solution through the real browser sandboxes
 * (web preview, JS worker, Pyodide, React) and asserts that all checks pass.
 *   npm run build && npm run preview   (in another terminal)
 *   npm run verify:exercises           (BASE_URL defaults to http://localhost:4173)
 */
const { loadPlaywright, loadFixtures, BASE } = require('./browser-helpers.cjs');

(async () => {
  const { chromium } = loadPlaywright();
  const { exercises } = loadFixtures();
  const only = process.argv.slice(2);
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  let failed = 0;
  for (const ex of exercises.filter((e) => only.length === 0 || only.includes(e.id))) {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(([id, files]) => {
      try {
        localStorage.setItem('cw.draft.exercise.' + id, JSON.stringify(files));
      } catch {
        /* sandboxed frames have no storage */
      }
    }, [ex.id, ex.solution]);
    await page.goto(`${BASE}/practice/${ex.id}`);
    const check = page.getByRole('button', { name: /^Check$/ });
    await check.waitFor({ timeout: 30000 });
    const started = Date.now();
    await check.click();
    const outcome = await Promise.race([
      page.getByText('All checks passed in your browser').waitFor({ timeout: 150000 }).then(() => 'PASS'),
      page.getByText(/checks passing/).waitFor({ timeout: 150000 }).then(() => 'FAIL'),
    ]).catch(() => 'TIMEOUT');
    if (outcome !== 'PASS') failed++;
    console.log(`${outcome.padEnd(7)} ${ex.id.padEnd(14)} ${ex.mode.padEnd(8)} ${Date.now() - started}ms ${errors.join('; ')}`);
    await page.close();
  }
  await browser.close();
  console.log(failed ? `\n${failed} exercise(s) failed` : '\nAll exercises verified');
  process.exit(failed ? 1 : 0);
})();
