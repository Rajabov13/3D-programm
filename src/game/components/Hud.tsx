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
          <Heart key={i} className="h-6 w-6 fill-[#f43f5e] text-[#e11d48]" aria-hidden />
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
            n <= value ? 'fill-[#fbbf24] text-[#f59e0b]' : 'fill-white/[0.06] text-white/20',
            animate && n <= value && 'animate-star-pop',
          )}
        />
      ))}
    </span>
  );
}
