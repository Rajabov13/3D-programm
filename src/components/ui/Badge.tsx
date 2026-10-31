import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'cyan' | 'violet' | 'green' | 'amber' | 'rose';

const tones: Record<Tone, string> = {
  neutral: 'border-white/10 bg-white/[0.05] text-slate-300',
  cyan: 'border-cyan-300/25 bg-cyan-300/[0.08] text-cyan-200',
  violet: 'border-violet-300/25 bg-violet-400/[0.1] text-violet-200',
  green: 'border-emerald-300/25 bg-emerald-400/[0.1] text-emerald-200',
  amber: 'border-amber-300/25 bg-amber-400/[0.1] text-amber-200',
  rose: 'border-rose-300/25 bg-rose-400/[0.1] text-rose-200',
};

export function Badge({ tone = 'neutral', className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-5', tones[tone], className)}
      {...rest}
    />
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: 'beginner' | 'intermediate' | 'advanced' }) {
  const tone: Record<typeof difficulty, Tone> = { beginner: 'green', intermediate: 'cyan', advanced: 'violet' };
  return <Badge tone={tone[difficulty]} className="capitalize">{difficulty}</Badge>;
}
