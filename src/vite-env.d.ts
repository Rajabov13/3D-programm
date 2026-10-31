/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PYTHON_RUNNER?: string;
  readonly VITE_PYODIDE_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
