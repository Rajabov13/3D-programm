import { Fragment } from 'react';
import { highlight, type CodeLanguage } from '@/lib/highlight';
import { cn } from '@/lib/cn';
import type { CodeLang } from '../types';

export const LANG_MAP: Record<CodeLang, CodeLanguage> = { html: 'html', css: 'css', js: 'javascript', py: 'python', jsx: 'jsx' };

/** Read-only highlighted code. `___` renders as a glowing blank (or the chosen answer). */
export function CodeView({ code, lang, fill, className }: { code: string; lang: CodeLang; fill?: { text: string; state?: 'chosen' | 'correct' | 'wrong' }; className?: string }) {
  const parts = code.split('___');
  return (
    <pre className={cn('overflow-x-auto rounded-2xl border border-white/[0.08] bg-code p-4 font-mono text-[14px] leading-7 text-slate-200 sm:text-[15px]', className)}>
      <code>
        {parts.map((part, i) => (
          <Fragment key={i}>
            {highlight(part, LANG_MAP[lang])}
            {i < parts.length - 1 && (
              <span
                className={cn(
                  'mx-0.5 inline-block min-w-[3.5ch] rounded-md border-b-2 px-1.5 text-center font-semibold transition-colors',
                  !fill && 'animate-pulse border-cyan-300 bg-cyan-300/10 text-transparent',
                  fill?.state === 'chosen' && 'border-cyan-300 bg-cyan-300/15 text-cyan-100',
                  fill?.state === 'correct' && 'border-emerald-300 bg-emerald-400/20 text-emerald-100',
                  fill?.state === 'wrong' && 'border-rose-300 bg-rose-400/20 text-rose-100',
                )}
              >
                {fill?.text ?? '___'}
              </span>
            )}
          </Fragment>
        ))}
      </code>
    </pre>
  );
}
