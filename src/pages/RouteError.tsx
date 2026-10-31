import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { LogoMark } from '@/components/layout/Logo';

export function RouteError() {
  const error = useRouteError();
  const isChunkError = error instanceof Error && /dynamically imported module|Loading chunk|Failed to fetch/i.test(error.message);
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : isChunkError
      ? 'A new version of 3D Code World may have been deployed, or your connection dropped while loading this page.'
      : error instanceof Error
        ? error.message
        : 'Unknown error';
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="max-w-md text-center">
        <LogoMark className="mx-auto mb-6 h-12 w-12" />
        <h1 className="text-2xl">This route hit a glitch in the grid</h1>
        <p className="mt-3 text-sm text-slate-400">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={() => window.location.reload()} className="focus-ring rounded-xl bg-cyan-300 px-4 py-2 text-sm font-medium text-night-950">
            Reload
          </button>
          <Link to="/dashboard" className="focus-ring rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
