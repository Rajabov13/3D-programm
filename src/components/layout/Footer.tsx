import { Link } from 'react-router-dom';
import { useT } from '@/i18n';
import { LogoMark } from './Logo';
import { NAV_ITEMS } from './nav';

export function Footer() {
  const t = useT();
  return (
    <footer className="mt-16 border-t border-white/[0.06]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-6 w-6 opacity-80" />
          <span>3D Code World · Demo</span>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          {NAV_ITEMS.map((item) => (
            <Link key={item.to} className="hover:text-slate-300" to={item.to}>
              {t(item.labelKey)}
            </Link>
          ))}
          <Link className="hover:text-slate-300" to="/settings">
            {t('nav.settings')}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
