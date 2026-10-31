import { Heart, HeartCrack, Star } from 'lucide-react';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { MAX_HEARTS } from '../engine';

export function Hearts({ hearts, className }: { hearts: number; className?: string }) {
  const t = useT();
  return (
    <div className={cn('flex items-center gap-1', className)} role="img" aria-label={t('play.hearts', { n: hearts })}>
      {Array.from({ length: MAX_HEARTS }, (_, i) =>
        i < hearts ? (
          <Heart key={i} className="h-6 w-6 fill-rose-500 text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]" aria-hidden />
        ) : (
          <HeartCrack key={i} className="h-6 w-6 text-slate-600" aria-hidden />
        ),
      )}
    </div>
  );
}

export function Stars({ value, size = 20, className, animate = false }: { value: number; size?: number; className?: string; animate?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} role="img" aria-label={`${value}/3 ⭐`}>
      {[1, 2, 3].map((n) => (
        <Star
          key={n}
          size={size}
          aria-hidden
          style={animate ? { animationDelay: `${n * 220}ms` } : undefined}
          className={cn(
            n <= value ? 'fill-amber-300 text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.55)]' : 'fill-white/5 text-white/15',
            animate && n <= value && 'animate-star-pop',
          )}
        />
      ))}
    </span>
  );
}
