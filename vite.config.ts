import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/**
 * The code sandboxes run in opaque-origin iframes, so their requests for the
 * self-hosted Python runtime are cross-origin (Origin: null). Allow CORS for
 * /pyodide/* only — never for application source files.
 */
function pyodideCors(): Plugin {
  const middleware = (req: { url?: string }, res: { setHeader(name: string, value: string): void }, next: () => void) => {
    if (req.url?.includes('/pyodide/')) res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  };
  return {
    name: 'pyodide-cors',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  // Sub-path for hosting in a folder, e.g. BASE_PATH=/3D-programm/ for GitHub Pages.
  base: process.env.BASE_PATH || '/',
  plugins: [react(), pyodideCors()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Dependency-free exercise-check engine (src/shared).
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      // React 18 UMD builds, inlined into the sandboxed React preview iframe (not part of the app bundle).
      'react-umd': fileURLToPath(new URL('./node_modules/react/umd', import.meta.url)),
      'react-dom-umd': fileURLToPath(new URL('./node_modules/react-dom/umd', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
  },
  worker: {
    format: 'es',
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 4000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('monaco-editor')) return 'monaco';
            if (id.includes('three/') || id.includes('three-stdlib') || id.includes('troika')) return 'three-core';
            if (id.includes('@react-three')) return 'r3f';
          }
          return undefined;
        },
      },
    },
  },
});
