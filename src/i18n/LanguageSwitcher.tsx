import { cn } from '@/lib/cn';
import { LANGS, useLangStore, useT } from './index';

/** Compact UZ · RU · EN switcher. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useLangStore();
  const t = useT();
  return (
    <div role="radiogroup" aria-label={t('common.language')} className={cn('inline-flex rounded-full border border-white/10 bg-night-900/70 p-0.5', className)}>
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          role="radio"
          aria-checked={lang === l.id}
          aria-label={l.label}
          title={l.label}
          lang={l.id}
          onClick={() => setLang(l.id)}
          className={cn(
            'focus-ring rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide transition-colors',
            lang === l.id ? 'bg-primary text-primary-fg' : 'text-slate-400 hover:text-white',
          )}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}
