/**
 * Runtime configuration derived from Vite env variables (all optional).
 * This is the demo version: there is no backend, so progress lives in the browser.
 */
export type PythonRunnerKind = 'pyodide' | 'disabled';

const env = import.meta.env;
const runner = (env.VITE_PYTHON_RUNNER ?? 'pyodide').trim();

export const config = {
  pythonRunner: (runner === 'disabled' ? 'disabled' : 'pyodide') as PythonRunnerKind,
  /** Absolute or root-relative URL of the Pyodide distribution (trailing slash). */
  pyodideBaseUrl: ((env.VITE_PYODIDE_BASE_URL ?? '').trim() || '/pyodide/v0.26.4/').replace(/\/?$/, '/'),
} as const;
