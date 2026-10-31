import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { LogoMark } from '@/components/layout/Logo';
import { useT } from '@/i18n';

export function RouteError() {
  const t = useT();
  const error = useRouteError();
  const message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error instanceof Error ? error.message : '';
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="max-w-md text-center">
        <LogoMark className="mx-auto mb-6 h-12 w-12" />
        <h1 className="text-2xl">{t('common.error')}</h1>
        {message && <p className="mt-3 break-words text-sm text-slate-400">{message}</p>}
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={() => window.location.reload()} className="focus-ring rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-night-950">
            {t('common.reload')}
          </button>
          <Link to="/map" className="focus-ring rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200">
            {t('nav.map')}
          </Link>
        </div>
      </div>
    </div>
  );
}
