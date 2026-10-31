import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Award, Menu, Settings, User, X } from 'lucide-react';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { Logo } from './Logo';
import { NAV_ITEMS } from './nav';
import { UserMenu } from './UserMenu';
import { XpChip } from './XpChip';

export function Navbar({ transparent = false }: { transparent?: boolean }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full',
        transparent ? 'bg-gradient-to-b from-night-950/80 to-transparent' : 'border-b border-white/[0.06] bg-night-950/75 backdrop-blur-xl',
      )}
    >
      <a href="#main" className="focus-ring sr-only z-50 rounded-md bg-cyan-300 px-3 py-2 text-night-950 focus:not-sr-only focus:absolute focus:left-3 focus:top-3">
        {t('nav.skip')}
      </a>
      <nav aria-label={t('nav.primary')} className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Logo to="/map" />
        <ul className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map(({ to, labelKey, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'focus-ring flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold transition-colors',
                    isActive ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:text-white',
                  )
                }
              >
                <Icon className="h-4 w-4" aria-hidden />
                {t(labelKey)}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <XpChip />
          <UserMenu />
          <button
            type="button"
            className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:bg-white/10 lg:hidden"
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      {open && (
        <div id="mobile-nav" className="fixed inset-x-0 top-16 z-40 h-[calc(100dvh-4rem)] animate-fade-in overflow-y-auto bg-night-950/95 backdrop-blur-xl lg:hidden">
          <div className="mx-auto max-w-md p-4">
            <LanguageSwitcher className="mb-4 sm:hidden" />
            <ul className="grid grid-cols-2 gap-2">
              {[
                ...NAV_ITEMS,
                { to: '/badges', labelKey: 'nav.badges' as const, icon: Award },
                { to: '/profile', labelKey: 'nav.profile' as const, icon: User },
                { to: '/settings', labelKey: 'nav.settings' as const, icon: Settings },
              ].map(({ to, labelKey, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      cn(
                        'focus-ring flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-sm font-semibold',
                        isActive ? 'border-cyan-300/40 bg-cyan-300/10 text-white' : 'border-white/10 bg-white/[0.03] text-slate-300',
                      )
                    }
                  >
                    <Icon className="h-6 w-6 text-cyan-300/90" aria-hidden /> {t(labelKey)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
