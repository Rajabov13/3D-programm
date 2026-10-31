import { Lock } from 'lucide-react';
import { NamedIcon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/Progress';
import { BADGES } from '@/game/content';
import { badgeProgress, gameStats } from '@/game/engine';
import { useGame } from '@/game/store';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useL, useT } from '@/i18n';
import { cn } from '@/lib/cn';

const TIERS = {
  bronze: 'from-orange-300 to-amber-700',
  silver: 'from-slate-100 to-slate-400',
  gold: 'from-yellow-200 to-amber-500',
  platinum: 'from-cyan-200 to-violet-400',
} as const;

export default function BadgesPage() {
  const t = useT();
  const l = useL();
  const game = useGame((s) => s.game);
  useDocumentTitle(t('badges.title'));
  const stats = gameStats(game);
  const earned = BADGES.filter((b) => game.badges[b.id]).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl">🏅 {t('badges.title')}</h1>
        <p className="text-lg font-bold text-amber-200">
          {earned}/{BADGES.length}
        </p>
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {BADGES.map((b) => {
          const has = Boolean(game.badges[b.id]);
          const p = badgeProgress(b.goal, stats, game.xp);
          return (
            <li key={b.id} className={cn('flex flex-col items-center rounded-3xl border p-5 text-center', has ? 'border-amber-300/25 bg-amber-300/[0.05]' : 'border-white/10 bg-night-800/50')}>
              <span className={cn('relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br p-[3px]', has ? TIERS[b.tier] : 'from-slate-700 to-slate-800')}>
                <span className="grid h-full w-full place-items-center rounded-full bg-night-900">
                  <NamedIcon name={b.icon} className={cn('h-9 w-9', has ? 'text-amber-200' : 'text-slate-600')} />
                </span>
                {!has && (
                  <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-night-900 bg-slate-700">
                    <Lock className="h-3.5 w-3.5 text-slate-300" aria-hidden />
                  </span>
                )}
              </span>
              <h2 className={cn('mt-3 text-base', !has && 'text-slate-300')}>{l(b.title)}</h2>
              <p className="mt-1 text-xs leading-snug text-slate-400">{l(b.desc)}</p>
              {has ? (
                <p className="mt-3 text-xs font-semibold text-amber-200">+{b.xp} XP ✓</p>
              ) : (
                <div className="mt-3 w-full">
                  <ProgressBar size="sm" value={p.current} max={p.target} tone="amber" label={l(b.title)} />
                  <p className="mt-1 text-[11px] tabular-nums text-slate-500">
                    {p.current}/{p.target}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
