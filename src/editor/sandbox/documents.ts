import { bridgeScript } from './bridge';
import { loopProtect, protectInlineScripts } from './loopProtect';

/**
 * Content-Security-Policy for learner previews: no network of any kind, no nested
 * frames or workers, inline code only. Combined with sandbox="allow-scripts"
 * (no allow-same-origin) the document runs in an opaque origin with no access to
 * the app's cookies, storage or DOM.
 */
export const PREVIEW_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline' 'unsafe-eval'",
  "style-src 'unsafe-inline'",
  'img-src data: blob:',
  'font-src data:',
  'media-src data: blob:',
  "connect-src 'none'",
  "frame-src 'none'",
  "worker-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
].join('; ');

const escapeScript = (js: string) => js.replace(/<\/script/gi, '<\\/script');
const escapeStyle = (css: string) => css.replace(/<\/style/gi, '<\\/style');

function head(runId: string, extra = ''): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>${bridgeScript(runId)}</script>${extra}`;
}

/** HTML + CSS + JS exercise preview. */
export function buildWebDocument({ html = '', css = '', js = '', runId }: { html?: string; css?: string; js?: string; runId: string }): string {
  const prefix = `${head(runId)}<style>${escapeStyle(css)}</style></head><body>
${protectInlineScripts(html)}
`;
  if (!js.trim()) return `${prefix}</body></html>`;
  // The learner's code starts on this document line; the bridge uses it to report script-relative line numbers.
  const startLine = prefix.split('\n').length;
  return `${prefix}<script>window.__cwScriptLine=${startLine};</script><script>${escapeScript(loopProtect(js))}
//# sourceURL=script.js</script>
</body></html>`;
}

let reactAssets: Promise<{ react: string; reactDom: string; transform: (code: string) => string }> | null = null;

/** Lazily loads React 18 UMD builds (as text) and the Sucrase JSX transform — only for React exercises. */
export function loadReactAssets() {
  if (!reactAssets) {
    reactAssets = Promise.all([
      import('react-umd/react.development.js?raw'),
      import('react-dom-umd/react-dom.development.js?raw'),
      import('sucrase'),
    ]).then(([react, reactDom, sucrase]) => ({
      react: react.default,
      reactDom: reactDom.default,
      transform: (code: string) =>
        sucrase.transform(code, { transforms: ['jsx', 'imports'], jsxRuntime: 'classic', production: false, filePath: 'App.jsx' }).code,
    }));
    reactAssets.catch(() => {
      reactAssets = null;
    });
  }
  return reactAssets;
}

export class TransformError extends Error {}

/** React (JSX) exercise preview: Sucrase transform in the parent, execution in the sandbox. */
export async function buildReactDocument({ jsx = '', css = '', runId }: { jsx?: string; css?: string; runId: string }): Promise<string> {
  const assets = await loadReactAssets();
  let compiled: string;
  try {
    compiled = assets.transform(jsx);
  } catch (error) {
    throw new TransformError(error instanceof Error ? error.message : String(error));
  }
  const modules = `
var __cwModules = {
  'react': window.React,
  'react-dom': window.ReactDOM,
  'react-dom/client': {
    createRoot: function (c, o) { var i = ReactDOM.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED; if (i) i.usingClientEntryPoint = true; try { return ReactDOM.createRoot(c, o); } finally { if (i) i.usingClientEntryPoint = false; } },
    hydrateRoot: function (c, e, o) { var i = ReactDOM.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED; if (i) i.usingClientEntryPoint = true; try { return ReactDOM.hydrateRoot(c, e, o); } finally { if (i) i.usingClientEntryPoint = false; } }
  }
};
function require(name) {
  if (Object.prototype.hasOwnProperty.call(__cwModules, name)) return __cwModules[name];
  throw new Error('Module "' + name + '" is not available in the sandbox (available: react, react-dom/client).');
}`;
  return `${head(runId)}<script>${escapeScript(assets.react)}</script><script>${escapeScript(assets.reactDom)}</script>
<style>${escapeStyle(css)}</style></head><body><div id="root"></div>
<script>${escapeScript(modules)}</script>
<script>(function () { var exports = {}; var module = { exports: exports };${escapeScript(loopProtect(compiled))}
})();
//# sourceURL=App.jsx</script>
</body></html>`;
}
