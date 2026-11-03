import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Check, X } from 'lucide-react';
import { useL, useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { sfx } from '../sound';
import type { StyleOption, Task } from '../types';
import { CodeView, LANG_MAP } from './CodeView';
import { highlight } from '@/lib/highlight';

/** Fisher–Yates shuffle that never returns the identity order (when possible). */
export function shuffledIndices(n: number): number[] {
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let attempt = 0; attempt < 10; attempt++) {
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    if (n < 2 || idx.some((v, i) => v !== i)) break;
  }
  return idx;
}

export type TaskValue = number | number[] | null;
export type Reveal = null | { correct: boolean };

export function isAnswerComplete(task: Task, value: TaskValue): boolean {
  if (task.kind === 'match') return false;
  if (task.kind === 'order') return Array.isArray(value) && value.length === task.lines.length;
  return typeof value === 'number';
}

export function isAnswerCorrect(task: Task, value: TaskValue): boolean {
  switch (task.kind) {
    case 'pick':
    case 'output':
    case 'blank':
    case 'look':
      return value === task.answer;
    case 'bug':
      return value === task.bug;
    case 'order':
      return Array.isArray(value) && value.length === task.lines.length && value.every((v, i) => v === i);
    default:
      return false;
  }
}

export function TaskPrompt({ task }: { task: Task }) {
  const t = useT();
  const l = useL();
  const text = task.kind === 'pick' ? l(task.q) : t(`play.prompt.${task.kind}`);
  return <h2 className="text-center text-xl font-bold leading-snug text-white sm:text-2xl">{text}</h2>;
}

function toStyle(option: StyleOption): CSSProperties {
  return option as CSSProperties;
}

export function LookPreview({ option, kind }: { option: StyleOption; kind: 'text' | 'box' | 'row' | 'grid' }) {
  const style = toStyle(option);
  if (kind === 'text') {
    return (
      <div className="w-full px-2 text-2xl font-semibold text-slate-100" style={style}>
        Aa Code
      </div>
    );
  }
  if (kind === 'box') {
    return <div className="mx-auto h-16 w-16 bg-gradient-to-br from-cyan-300 to-violet-400" style={style} />;
  }
  if (kind === 'row') {
    return (
      <div className="flex h-24 w-full gap-1.5 rounded-lg border border-dashed border-white/15 p-1.5" style={style}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-5 w-5 shrink-0 rounded bg-gradient-to-br from-cyan-300 to-sky-500" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid w-full gap-1 rounded-lg border border-dashed border-white/15 p-1.5" style={style}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="h-4 rounded bg-gradient-to-br from-violet-300 to-indigo-500" />
      ))}
    </div>
  );
}

const optionBase =
  'focus-ring relative flex min-h-[64px] w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all active:scale-[0.98] disabled:active:scale-100';

/** pick / output / blank / look */
export function ChoiceTask({ task, value, onChange, reveal }: { task: Extract<Task, { kind: 'pick' | 'output' | 'blank' | 'look' }>; value: TaskValue; onChange: (v: number) => void; reveal: Reveal }) {
  const t = useT();
  const order = useMemo(() => shuffledIndices(task.options.length), [task]);
  const chosen = typeof value === 'number' ? value : null;

  // Keyboard: 1–4 picks the option shown at that position.
  useEffect(() => {
    if (reveal) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > order.length || e.ctrlKey || e.metaKey || e.altKey) return;
      sfx.tap();
      onChange(order[n - 1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [order, reveal, onChange]);

  const code =
    task.kind === 'look'
      ? { code: task.code, lang: 'css' as const }
      : task.kind === 'pick'
        ? task.code
          ? { code: task.code, lang: task.lang ?? 'html' }
          : null
        : { code: task.code, lang: task.lang };

  return (
    <div className="space-y-5">
      {code &&
        (task.kind === 'blank' ? (
          <CodeView
            code={code.code}
            lang={code.lang}
            fill={
              chosen !== null
                ? { text: task.options[chosen], state: reveal ? (reveal.correct ? 'correct' : 'wrong') : 'chosen' }
                : reveal
                  ? { text: task.options[task.answer], state: 'correct' }
                  : undefined
            }
          />
        ) : (
          <CodeView code={code.code} lang={code.lang} />
        ))}
      <div role="radiogroup" aria-label={t('play.answer')} className={cn('grid gap-3', task.kind === 'look' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2')}>
        {order.map((optIndex, position) => {
          const selected = chosen === optIndex;
          const isAnswer = optIndex === task.answer;
          const state = reveal ? (isAnswer ? 'correct' : selected ? 'wrong' : 'idle') : selected ? 'selected' : 'idle';
          return (
            <button
              key={optIndex}
              data-opt={optIndex}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={Boolean(reveal)}
              onClick={() => {
                sfx.tap();
                onChange(optIndex);
              }}
              className={cn(
                optionBase,
                task.kind === 'look' && 'min-h-[120px] flex-col justify-center',
                state === 'idle' && 'border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07]',
                state === 'selected' && 'border-cyan-300 bg-cyan-300/10 shadow-glow',
                state === 'correct' && 'border-emerald-400 bg-emerald-400/15',
                state === 'wrong' && 'animate-shake border-rose-400 bg-rose-500/15',
                reveal && state === 'idle' && 'opacity-40',
              )}
            >
              <span
                className={cn(
                  'grid h-7 w-7 shrink-0 place-items-center rounded-lg border text-xs font-bold',
                  task.kind === 'look' && 'absolute left-2 top-2',
                  state === 'selected' ? 'border-cyan-300 text-cyan-200' : 'border-white/15 text-slate-400',
                )}
                aria-hidden
              >
                {position + 1}
              </span>
              {task.kind === 'look' ? (
                <LookPreview option={task.options[optIndex]} kind={task.preview} />
              ) : (
                <span className="whitespace-pre-wrap break-words font-mono text-[15px] font-medium text-slate-100">{task.options[optIndex]}</span>
              )}
              {state === 'correct' && <Check className="ml-auto h-5 w-5 shrink-0 text-emerald-300" aria-hidden />}
              {state === 'wrong' && <X className="ml-auto h-5 w-5 shrink-0 text-rose-300" aria-hidden />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Tap the lines in the right order. */
export function OrderTask({ task, value, onChange, reveal }: { task: Extract<Task, { kind: 'order' }>; value: TaskValue; onChange: (v: number[]) => void; reveal: Reveal }) {
  const t = useT();
  const pool = useMemo(() => shuffledIndices(task.lines.length), [task]);
  const chosen = Array.isArray(value) ? value : [];
  const lang = LANG_MAP[task.lang];

  return (
    <div className="space-y-5">
      <div
        className={cn(
          'min-h-[120px] rounded-2xl border-2 border-dashed p-3 font-mono text-[14px] sm:text-[15px]',
          reveal ? (reveal.correct ? 'border-emerald-400/60 bg-emerald-400/[0.06]' : 'border-rose-400/60 bg-rose-500/[0.06]') : 'border-white/15 bg-code',
        )}
        aria-label={t('play.answer')}
      >
        {chosen.length === 0 && <p className="py-8 text-center font-sans text-sm text-slate-500">{t('play.tapToBuild')}</p>}
        <ol className="space-y-1.5">
          {chosen.map((lineIndex, i) => (
            <li key={lineIndex}>
              <button
                type="button"
                disabled={Boolean(reveal)}
                onClick={() => {
                  sfx.tap();
                  onChange(chosen.filter((_, j) => j !== i));
                }}
                aria-label={`${t('play.remove')}: ${task.lines[lineIndex]}`}
                className="focus-ring w-full rounded-lg bg-white/[0.05] px-3 py-1.5 text-left hover:bg-white/[0.1]"
              >
                <code className="whitespace-pre">{highlight(task.lines[lineIndex], lang)}</code>
              </button>
            </li>
          ))}
        </ol>
      </div>
      {reveal && !reveal.correct && <CodeView code={task.lines.join('\n')} lang={task.lang} className="border-emerald-400/40" />}
      {!reveal && (
        <div className="flex flex-wrap justify-center gap-2">
          {pool
            .filter((i) => !chosen.includes(i))
            .map((lineIndex) => (
              <button
                key={lineIndex}
                data-line={lineIndex}
                type="button"
                onClick={() => {
                  sfx.tap();
                  onChange([...chosen, lineIndex]);
                }}
                className="focus-ring rounded-xl border-2 border-white/10 bg-white/[0.05] px-3 py-2 font-mono text-[14px] text-slate-100 shadow-[0_3px_0_rgba(255,255,255,0.06)] transition-all hover:border-cyan-300/50 active:translate-y-0.5"
              >
                <code className="whitespace-pre">{highlight(task.lines[lineIndex].trim(), lang)}</code>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

/** Tap the line that contains the bug. */
export function BugTask({ task, value, onChange, reveal }: { task: Extract<Task, { kind: 'bug' }>; value: TaskValue; onChange: (v: number) => void; reveal: Reveal }) {
  const t = useT();
  const chosen = typeof value === 'number' ? value : null;
  const lang = LANG_MAP[task.lang];
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-code py-2 font-mono text-[14px] sm:text-[15px]">
        {task.lines.map((line, i) => {
          const selected = chosen === i;
          const state = reveal ? (i === task.bug ? 'bug' : selected ? 'wrong' : 'idle') : selected ? 'selected' : 'idle';
          return (
            <button
              key={i}
              data-line={i}
              type="button"
              disabled={Boolean(reveal)}
              onClick={() => {
                sfx.tap();
                onChange(i);
              }}
              aria-pressed={selected}
              className={cn(
                'focus-ring flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
                state === 'idle' && 'hover:bg-white/[0.05]',
                state === 'selected' && 'bg-cyan-300/15 ring-1 ring-inset ring-cyan-300/60',
                state === 'bug' && 'bg-rose-500/20 ring-1 ring-inset ring-rose-400/60',
                state === 'wrong' && 'animate-shake bg-white/[0.06]',
              )}
            >
              <span className="w-5 shrink-0 text-right text-xs text-slate-600" aria-hidden>
                {i + 1}
              </span>
              <code className="whitespace-pre">{highlight(line, lang)}</code>
            </button>
          );
        })}
      </div>
      {reveal && (
        <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/[0.07] p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">{t('play.fix')}</p>
          <code className="whitespace-pre font-mono text-[14px] text-emerald-50">{highlight(task.fix, lang)}</code>
        </div>
      )}
    </div>
  );
}

/** Match left items with right items. Resolves itself when every pair is found. */
export function MatchTask({ task, onDone, done }: { task: Extract<Task, { kind: 'match' }>; onDone: (mistakes: number) => void; done: boolean }) {
  const lefts = useMemo(() => shuffledIndices(task.pairs.length), [task]);
  const rights = useMemo(() => shuffledIndices(task.pairs.length), [task]);
  const [left, setLeft] = useState<number | null>(null);
  const [right, setRight] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [flash, setFlash] = useState<[number, number] | null>(null);
  const [mistakes, setMistakes] = useState(0);

  useEffect(() => {
    if (left === null || right === null) return;
    if (left === right) {
      sfx.correct();
      const next = [...matched, left];
      setMatched(next);
      if (next.length === task.pairs.length) onDone(mistakes);
    } else {
      sfx.wrong();
      setMistakes((m) => m + 1);
      setFlash([left, right]);
      window.setTimeout(() => setFlash(null), 450);
    }
    setLeft(null);
    setRight(null);
  }, [left, right]); // eslint-disable-line react-hooks/exhaustive-deps

  const cell = (side: 'l' | 'r', pairIndex: number) => {
    const isMatched = matched.includes(pairIndex);
    const isSelected = side === 'l' ? left === pairIndex : right === pairIndex;
    const isFlash = flash && (side === 'l' ? flash[0] === pairIndex : flash[1] === pairIndex);
    const text = task.pairs[pairIndex][side === 'l' ? 0 : 1];
    return (
      <button
        key={`${side}${pairIndex}`}
        data-pair={`${side}${pairIndex}`}
        type="button"
        disabled={isMatched || done}
        aria-pressed={isSelected}
        onClick={() => {
          sfx.tap();
          if (side === 'l') setLeft(isSelected ? null : pairIndex);
          else setRight(isSelected ? null : pairIndex);
        }}
        className={cn(
          optionBase,
          'min-h-[56px] justify-center text-center',
          isMatched && 'border-emerald-400/50 bg-emerald-400/10 opacity-70',
          !isMatched && !isSelected && !isFlash && 'border-white/10 bg-white/[0.04] hover:border-white/25',
          isSelected && 'border-cyan-300 bg-cyan-300/10',
          isFlash && 'animate-shake border-rose-400 bg-rose-500/15',
        )}
      >
        <span className={cn('break-words', side === 'l' ? 'font-mono text-[14px]' : 'text-xl')}>{text}</span>
      </button>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-3">{lefts.map((i) => cell('l', i))}</div>
      <div className="space-y-3">{rights.map((i) => cell('r', i))}</div>
    </div>
  );
}
