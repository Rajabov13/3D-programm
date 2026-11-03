import { Moon, Sun } from 'lucide-react';
import { useSettings } from '@/features/settings/settingsStore';
import { useResolvedTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';

/** Sun / moon button: switches between the light and the dark theme. */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useT();
  const theme = useResolvedTheme();
  const update = useSettings((s) => s.update);
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      onClick={() => update({ theme: next })}
      aria-label={`${t('nav.theme')}: ${t(next === 'dark' ? 'settings.t.dark' : 'settings.t.light')}`}
      title={t('nav.theme')}
      className={cn('focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-slate-300 transition-colors hover:border-white/25 hover:text-white', className)}
    >
      {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" aria-hidden /> : <Moon className="h-[18px] w-[18px]" aria-hidden />}
    </button>
  );
}
