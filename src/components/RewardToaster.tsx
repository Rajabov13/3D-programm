import { useEffect } from 'react';
import { Flame, Sparkles, TrendingUp, X } from 'lucide-react';
import { useCatalog } from '@/features/content/hooks';
import { useRewards, type RewardEvent } from '@/features/progress/rewards';
import { NamedIcon } from './ui/Icon';

function RewardCard({ event }: { event: RewardEvent }) {
  const dismiss = useRewards((s) => s.dismiss);
  const { data: catalog } = useCatalog();
  useEffect(() => {
    const t = window.setTimeout(() => dismiss(event.id), event.levelUp || event.achievements.length ? 7000 : 4500);
    return () => window.clearTimeout(t);
  }, [event, dismiss]);
  const achievements = event.achievements.map((id) => catalog?.achievements.find((a) => a.id === id)).filter(Boolean);
  return (
    <div role="status" className="glass-strong pointer-events-auto relative w-full animate-rise-in overflow-hidden rounded-2xl p-4">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/20 blur-2xl" />
      <button type="button" onClick={() => dismiss(event.id)} className="focus-ring absolute right-2 top-2 rounded-md p-1 text-slate-500 hover:text-white" aria-label="Dismiss reward">
        <X className="h-3.5 w-3.5" />
      </button>
      <p className="pr-6 text-[13px] text-slate-300">{event.title}</p>
      {event.xp > 0 && (
        <p className="mt-1 flex items-center gap-2 text-xl font-semibold text-white">
          <Sparkles className="h-5 w-5 text-cyan-300" aria-hidden /> +{event.xp} XP
        </p>
      )}
      {event.levelUp && (
        <p className="mt-2 flex items-center gap-2 text-sm font-medium text-violet-200">
          <TrendingUp className="h-4 w-4" aria-hidden /> Level up! You reached level {event.levelUp}
        </p>
      )}
      {event.dailyGoal && (
        <p className="mt-2 flex items-center gap-2 text-sm text-amber-200">
          <Flame className="h-4 w-4" aria-hidden /> Daily goal reached
        </p>
      )}
      {achievements.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {achievements.map((a) => (
            <li key={a!.id} className="flex items-center gap-2 rounded-lg border border-amber-300/20 bg-amber-300/[0.07] px-2.5 py-1.5 text-[13px] text-amber-100">
              <NamedIcon name={a!.icon} className="h-4 w-4 text-amber-300" /> Achievement unlocked: <strong className="font-semibold">{a!.title}</strong>
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
    <div aria-live="polite" className="pointer-events-none fixed left-1/2 top-20 z-[95] flex w-[min(400px,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-2">
      {queue.map((event) => (
        <RewardCard key={event.id} event={event} />
      ))}
    </div>
  );
}
