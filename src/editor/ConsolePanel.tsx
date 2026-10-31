import { useEffect, useRef } from 'react';
import { CircleAlert, CircleX, Info, Terminal, TriangleAlert, Trash2 } from 'lucide-react';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import type { ConsoleEntry } from './sandbox/types';

const STYLES = {
  log: { icon: Terminal, cls: 'text-slate-200' },
  info: { icon: Info, cls: 'text-sky-200' },
  warn: { icon: TriangleAlert, cls: 'text-amber-200 bg-amber-400/[0.06]' },
  error: { icon: CircleX, cls: 'text-rose-200 bg-rose-500/[0.07]' },
  system: { icon: CircleAlert, cls: 'text-violet-200 bg-violet-400/[0.06]' },
} as const;

export function ConsolePanel({ entries, onClear, emptyHint }: { entries: ConsoleEntry[]; onClear: () => void; emptyHint: string }) {
  const t = useT();
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' });
  }, [entries.length]);
  return (
    <div className="flex h-full flex-col bg-[#060a14]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-1.5">
        <span className="text-[11px] text-slate-500">{entries.length ? t('console.messages', { n: entries.length }) : t('editor.console')}</span>
        <button type="button" onClick={onClear} className="focus-ring inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-slate-400 hover:bg-white/10 hover:text-white" aria-label={t('editor.clear')}>
          <Trash2 className="h-3 w-3" aria-hidden /> {t('editor.clear')}
        </button>
      </div>
      <div role="log" aria-live="polite" aria-label={t('editor.output')} className="min-h-0 flex-1 overflow-auto py-1 font-mono text-[12.5px] leading-5">
        {entries.length === 0 ? (
          <p className="px-4 py-3 text-slate-500">{emptyHint}</p>
        ) : (
          entries.map((e) => {
            const { icon: Icon, cls } = STYLES[e.level];
            return (
              <div key={e.id} className={cn('flex gap-2 border-b border-white/[0.03] px-3 py-1', cls)}>
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                <pre className="min-w-0 flex-1 whitespace-pre-wrap break-words">{e.text}</pre>
              </div>
            );
          })
        )}
        <div ref={end} />
      </div>
    </div>
  );
}
