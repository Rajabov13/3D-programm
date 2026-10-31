import { Link, useNavigate } from 'react-router-dom';
import { CircleCheck, Gift, Lock, Map as MapIcon, Play, Swords } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/Progress';
import { QUESTS, ZONES } from '@/game/content';
import { PlayerStrip } from '@/game/components/PlayerStrip';
import { isZoneUnlocked, nextGoal, questProgress, zoneStars } from '@/game/engine';
import { useGame } from '@/game/store';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';

export default function MapPage() {
  const t = useT();
  const navigate = useNavigate();
  const game = useGame((s) => s.game);
  useDocumentTitle(t('map.title'));
  const goal = nextGoal(game);

  return (
    <div className="space-y-8">
      <PlayerStrip />

      {goal && (
        <button
          type="button"
          onClick={() => navigate(goal.boss ? `/boss/${goal.zone.id}` : `/play/${goal.stageId}`)}
          className="focus-ring group relative flex w-full items-center gap-4 overflow-hidden rounded-3xl border-2 p-5 text-left transition-transform active:scale-[0.99]"
          style={{ borderColor: `${goal.zone.accent}88`, background: `linear-gradient(120deg, ${goal.zone.accent}22, transparent 70%)` }}
        >
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-night-950 shadow-lg" style={{ background: goal.zone.accent }}>
            {goal.boss ? <Swords className="h-8 w-8" aria-hidden /> : <Play className="h-8 w-8 fill-current" aria-hidden />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold uppercase tracking-widest text-slate-400">{t('map.continue')}</span>
            <span className="mt-1 block truncate text-2xl font-bold text-white">
              {t(goal.zone.nameKey)} · {goal.boss ? t('zone.boss') : t('zone.stage', { n: goal.zone.stages.findIndex((s) => s.id === goal.stageId) + 1 })}
            </span>
          </span>
        </button>
      )}

      <section aria-labelledby="quests-title">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="quests-title" className="flex items-center gap-2 text-lg">
            <Gift className="h-5 w-5 text-pink-300" aria-hidden /> {t('map.todayQuests')}
          </h2>
          <Link to="/quests" className="text-sm text-cyan-300 hover:underline">
            {t('map.allQuests')}
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {QUESTS.map((q) => {
            const p = questProgress(game, q);
            return (
              <Link key={q.id} to="/quests" className={cn('focus-ring glass flex items-center gap-3 rounded-2xl p-4', p.met && !p.claimed && 'border-pink-300/40')}>
                {p.claimed ? <CircleCheck className="h-6 w-6 shrink-0 text-emerald-300" aria-hidden /> : <Gift className={cn('h-6 w-6 shrink-0', p.met ? 'animate-float text-pink-300' : 'text-slate-500')} aria-hidden />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-slate-200">{t(q.labelKey, { n: q.goal.n })}</span>
                  <ProgressBar className="mt-2" size="sm" value={p.current} max={p.target} tone={p.met ? 'green' : 'cyan'} label={t(q.labelKey, { n: q.goal.n })} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="worlds-title">
        <div className="mb-3 flex items-center justify-between">
          <h1 id="worlds-title" className="text-2xl">
            {t('map.title')}
          </h1>
          <ButtonLink to="/world" variant="ghost" size="sm" icon={<MapIcon className="h-4 w-4" />}>
            {t('map.viewCity')}
          </ButtonLink>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ZONES.map((zone) => {
            const unlocked = isZoneUnlocked(zone, game.xp);
            const stars = zoneStars(game, zone);
            const defeated = Boolean(game.bosses[zone.id]);
            return (
              <li key={zone.id}>
                <Link
                  to={`/zone/${zone.id}`}
                  className={cn(
                    'focus-ring group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 p-5 transition-all hover:-translate-y-1',
                    unlocked ? 'border-white/10 bg-night-800/60 hover:border-white/25' : 'border-white/5 bg-night-900/60',
                  )}
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-3xl transition-opacity group-hover:opacity-60" style={{ background: zone.accent }} />
                  <div className="flex items-start justify-between">
                    <span
                      className={cn('grid h-16 w-16 place-items-center rounded-2xl font-mono text-lg font-black', !unlocked && 'grayscale')}
                      style={{ background: `${zone.accent}22`, color: zone.accent, boxShadow: `inset 0 0 0 2px ${zone.accent}66` }}
                    >
                      {zone.symbol}
                    </span>
                    {defeated && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                        <Swords className="h-3.5 w-3.5" aria-hidden /> {t('zone.defeated')}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-4 text-xl">{t(zone.nameKey)}</h2>
                  {unlocked ? (
                    <>
                      <p className="mt-1 text-sm text-slate-400">⭐ {stars}/{zone.stages.length * 3}</p>
                      <ProgressBar className="mt-3" value={stars} max={zone.stages.length * 3} tone="amber" label={`${t(zone.nameKey)} ⭐`} />
                    </>
                  ) : (
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-amber-200/80">
                      <Lock className="h-4 w-4" aria-hidden /> {t('common.unlocksAt', { n: zone.requiredLevel })}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      {!goal && (
        <div className="text-center">
          <Button onClick={() => navigate('/badges')}>🏆 {t('badges.title')}</Button>
        </div>
      )}
    </div>
  );
}
