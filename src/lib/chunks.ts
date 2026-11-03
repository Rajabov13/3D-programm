import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

/**
 * After a new version is deployed, a tab that was opened earlier still points at the old
 * file names (e.g. assets/MapPage-<oldhash>.js), which no longer exist on the server. The fix
 * is to reload once so the browser fetches the new index.html with the new file names.
 */
const RELOAD_KEY = 'cw.chunkReloadAt';
const RELOAD_WINDOW_MS = 15_000;

export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? `${error.name} ${error.message}` : String(error ?? '');
  return /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS|ChunkLoadError|Loading chunk \S+ failed/i.test(message);
}

/** Reloads the page unless we already did so a moment ago (prevents reload loops). Returns true if reloading. */
export function reloadForNewVersion(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - last < RELOAD_WINDOW_MS) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // No storage: reload anyway — the window check below still stops a loop within this page.
    if ((window as Window & { __cwReloaded?: boolean }).__cwReloaded) return false;
    (window as Window & { __cwReloaded?: boolean }).__cwReloaded = true;
  }
  window.location.reload();
  return true;
}

/** React.lazy that recovers from stale deployments by reloading once. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- same constraint as React.lazy
export function lazyPage<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>): LazyExoticComponent<T> {
  return lazy<T>(() =>
    factory().catch((error: unknown) => {
      // Never resolve while the page reloads, so no error flashes on screen.
      if (isChunkLoadError(error) && reloadForNewVersion()) return new Promise<{ default: T }>(() => undefined);
      throw error;
    }),
  );
}

/** Vite reports failed preloads of a lazy page's dependencies with this event. */
export function installChunkErrorRecovery(): void {
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadForNewVersion()) event.preventDefault();
  });
}
