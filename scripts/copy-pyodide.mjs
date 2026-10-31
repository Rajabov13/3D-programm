// Copies the Pyodide runtime from node_modules into public/ so Python runs from
// your own origin (no third-party CDN at runtime). Runs on postinstall/prebuild.
import { cpSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'node_modules', 'pyodide');
if (!existsSync(source)) {
  console.warn('[copy-pyodide] pyodide package not installed — skipping (Python will need VITE_PYODIDE_BASE_URL).');
  process.exit(0);
}
const { version } = JSON.parse(readFileSync(join(source, 'package.json'), 'utf8'));
const target = join(root, 'public', 'pyodide', `v${version}`);
const files = ['pyodide.js', 'pyodide.asm.js', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json'];
mkdirSync(target, { recursive: true });
for (const file of files) {
  if (!existsSync(join(source, file))) {
    console.warn(`[copy-pyodide] missing ${file} in the pyodide package`);
    continue;
  }
  cpSync(join(source, file), join(target, file));
}
console.log(`[copy-pyodide] Pyodide ${version} copied to public/pyodide/v${version}/`);
