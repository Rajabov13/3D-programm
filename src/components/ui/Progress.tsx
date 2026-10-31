import { cn } from '@/lib/cn';

export function ProgressBar({
  value,
  max = 1,
  label,
  className,
  tone = 'cyan',
  size = 'md',
}: {
  value: number;
  max?: number;
  label: string;
  className?: string;
  tone?: 'cyan' | 'violet' | 'green' | 'amber';
  size?: 'sm' | 'md';
}) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const fill = {
    cyan: 'from-cyan-300 to-sky-500',
    violet: 'from-violet-300 to-indigo-500',
    green: 'from-emerald-300 to-teal-500',
    amber: 'from-amber-200 to-orange-400',
  }[tone];
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value * 100) / 100}
      className={cn('w-full overflow-hidden rounded-full bg-white/[0.07]', size === 'sm' ? 'h-1.5' : 'h-2', className)}
    >
      <div
        className={cn('h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out', fill)}
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}

export function ProgressRing({
  value,
  max = 1,
  size = 72,
  stroke = 6,
  label,
  children,
  color = '#5ce1ff',
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  label: string;
  children?: React.ReactNode;
  color?: string;
}) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - ratio)}
          style={{ transition: 'stroke-dashoffset 800ms cubic-bezier(.2,.8,.2,1)', filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
