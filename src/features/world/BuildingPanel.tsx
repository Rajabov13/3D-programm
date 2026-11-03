import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Play, Swords, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/Progress';
import { isBossUnlocked } from '@/game/engine';
import { useGame } from '@/game/store';
import { useT } from '@/i18n';
import type { BuildingInfo } from './useBuildingStatuses';
import { accentInk } from '@/lib/accent';

export function BuildingPanel({
  info,
  level,
  onClose,
}: {
  info: BuildingInfo;
  level: number;
  onClose: () => void;
}) {
  const t = useT();
  const navigate = useNavigate();
  const game = useGame((s) => s.game);
  const { def, zone, status, name } = info;

  // The quickest way into the game from a tower: the next stage (or the boss).
  const nextStage = zone?.stages.find((s) => !(game.stars[s.id] > 0));
  const bossReady = zone && !nextStage && isBossUnlocked(game, zone) && !game.bosses[zone.id];

  return (
    <section
      aria-labelledby="building-panel-title"
      className="glass-strong pointer-events-auto w-full max-w-sm animate-rise-in rounded-2xl p-5"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border font-mono text-sm font-bold"
            style={{ borderColor: `${def.accent}55`, background: `${def.accent}14`, color: accentInk(def.accent) }}
            aria-hidden
          >
            {def.symbol}
          </span>
          <div>
            <h2 id="building-panel-title" className="text-lg leading-tight">
              {name}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">{t(def.descKey)}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="focus-ring rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white" aria-label={t('common.close')}>
          <X className="h-4 w-4" />
        </button>
      </div>

      {zone && !status.locked && (
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="font-semibold text-amber-200">
              ⭐ {info.stars}/{info.maxStars}
            </span>
            {info.bossDefeated && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-300">
                <Swords className="h-3.5 w-3.5" aria-hidden /> {t('zone.defeated')}
              </span>
            )}
          </div>
          <ProgressBar value={info.stars ?? 0} max={info.maxStars ?? 1} tone="amber" label={`${name} ⭐`} />
        </div>
      )}
      {status.locked && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-amber-300/[0.08] px-3 py-2 text-sm text-amber-100">
          <Lock className="h-4 w-4 text-amber-300" aria-hidden />
          {t('common.unlocksAt', { n: status.requiredLevel ?? 1 })} · {t('common.levelN', { n: level })}
        </p>
      )}
      {!zone && <p className="mt-4 text-sm text-slate-300">{info.summary}</p>}

      <div className="mt-5 flex flex-wrap gap-2">
        {zone && !status.locked && (nextStage || bossReady) ? (
          <Button
            onClick={() => navigate(nextStage ? `/play/${nextStage.id}` : `/boss/${zone.id}`)}
            icon={nextStage ? <Play className="h-4 w-4 fill-current" /> : <Swords className="h-4 w-4" />}
          >
            {nextStage ? t('zone.play') : t('zone.boss')}
          </Button>
        ) : null}
        <Button variant={zone && !status.locked ? 'secondary' : 'primary'} onClick={() => navigate(def.route)} icon={<ArrowRight className="h-4 w-4" />}>
          {t('world.open')}
        </Button>
      </div>
    </section>
  );
}
