import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { Logo } from './Logo';
import { NAV_ITEMS } from './nav';
import { UserMenu } from './UserMenu';
import { XpChip } from './XpChip';

export function Navbar({ transparent = false }: { transparent?: boolean }) {
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
        Skip to content
      </a>
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <Badge tone="amber" className="hidden md:inline-flex" title="Demo version — progress is stored in this browser">
          Demo
        </Badge>
        <ul className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'focus-ring rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
                    isActive ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:text-white',
                  )
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2">
          <XpChip />
          <UserMenu />
          <button
            type="button"
            className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:bg-white/10 lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      {open && (
        <div id="mobile-nav" className="fixed inset-x-0 top-16 z-40 h-[calc(100dvh-4rem)] animate-fade-in bg-night-950/95 backdrop-blur-xl lg:hidden">
          <ul className="mx-auto max-w-md space-y-1 p-4">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn('focus-ring flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium', isActive ? 'bg-white/[0.08] text-white' : 'text-slate-300')
                  }
                >
                  <Icon className="h-5 w-5 text-cyan-300/80" aria-hidden /> {label}
                </NavLink>
              </li>
            ))}
            <li className="pt-2">
              <NavLink to="/progress" className="focus-ring flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400">
                Progress Center
              </NavLink>
              <NavLink to="/achievements" className="focus-ring flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400">
                Achievement Hall
              </NavLink>
              <NavLink to="/settings" className="focus-ring flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400">
                Settings
              </NavLink>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
