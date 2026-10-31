// Shared helpers for the Playwright-based verification scripts (CommonJS so a globally
// installed Playwright is found via NODE_PATH as well as a local devDependency).
const { spawnSync } = require('node:child_process');
const { mkdirSync, readFileSync } = require('node:fs');
const path = require('node:path');

function loadPlaywright() {
  try {
    return require('playwright');
  } catch {
    console.error('Playwright is required: npm i -D playwright && npx playwright install chromium');
    process.exit(2);
  }
}

function loadFixtures() {
  const root = path.join(__dirname, '..');
  mkdirSync(path.join(root, 'test-results'), { recursive: true });
  const file = path.join(root, 'test-results', 'fixtures.json');
  const r = spawnSync('npx', ['tsx', '--tsconfig', 'tsconfig.app.json', 'scripts/dump-fixtures.ts', file], { cwd: root, stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
  return JSON.parse(readFileSync(file, 'utf8'));
}

const BASE = (process.env.BASE_URL || 'http://localhost:4173').replace(/\/$/, '');

module.exports = { loadPlaywright, loadFixtures, BASE };
