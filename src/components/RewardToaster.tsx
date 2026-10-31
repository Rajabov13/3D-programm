import { useEffect } from 'react';
import { Sparkles, TrendingUp, X } from 'lucide-react';
import { BADGES } from '@/game/content';
import { useRewards, type RewardEvent } from '@/game/rewards';
import { useL, useT } from '@/i18n';
import { NamedIcon } from './ui/Icon';

function RewardCard({ event }: { event: RewardEvent }) {
  const t = useT();
  const l = useL();
  const dismiss = useRewards((s) => s.dismiss);
  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(event.id), 6000);
    return () => window.clearTimeout(timer);
  }, [event, dismiss]);
  const badges = event.badges.map((id) => BADGES.find((b) => b.id === id)).filter((b) => b !== undefined);
  return (
    <div role="status" className="glass-strong pointer-events-auto relative w-full animate-pop-in overflow-hidden rounded-2xl p-4">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-400/25 blur-2xl" />
      <button type="button" onClick={() => dismiss(event.id)} className="focus-ring absolute right-2 top-2 rounded-md p-1 text-slate-500 hover:text-white" aria-label={t('common.dismiss')}>
        <X className="h-3.5 w-3.5" />
      </button>
      {event.levelUp && (
        <p className="flex items-center gap-2 pr-6 text-lg font-bold text-white">
          <TrendingUp className="h-5 w-5 text-violet-300" aria-hidden /> {t('reward.levelUp', { n: event.levelUp })}
        </p>
      )}
      {event.xp > 0 && (
        <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-cyan-200">
          <Sparkles className="h-4 w-4" aria-hidden /> +{event.xp} XP
        </p>
      )}
      {badges.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {badges.map((b) => (
            <li key={b.id} className="flex items-center gap-2 rounded-lg border border-amber-300/20 bg-amber-300/[0.08] px-2.5 py-1.5 text-[13px] text-amber-100">
              <NamedIcon name={b.icon} className="h-4 w-4 shrink-0 text-amber-300" />
              <span>
                {t('reward.badge')}: <strong className="font-semibold">{l(b.title)}</strong>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function RewardToaster() {
  const queue = useRewards((s) => s.queue);
  return (
    <div aria-live="polite" className="pointer-events-none fixed left-1/2 top-4 z-[95] flex w-[min(380px,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-2">
      {queue.map((event) => (
        <RewardCard key={event.id} event={event} />
      ))}
    </div>
  );
}
