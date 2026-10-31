import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Lock, Map as MapIcon, Play, Swords } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { zoneById } from '@/game/content';
import { Stars } from '@/game/components/Hud';
import { isBossUnlocked, isStageUnlocked, isZoneUnlocked, zoneStars } from '@/game/engine';
import { useGame } from '@/game/store';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useL, useT } from '@/i18n';
import { cn } from '@/lib/cn';

const OFFSETS = [0, 56, 84, 56, 0, -56, -84, -56];

export default function ZonePage() {
  const { zoneId } = useParams();
  const t = useT();
  const l = useL();
  const navigate = useNavigate();
  const zone = zoneById(zoneId);
  const game = useGame((s) => s.game);
  useDocumentTitle(zone ? t(zone.nameKey) : t('common.notFound'));

  if (!zone) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl">{t('common.notFound')}</h1>
        <ButtonLink to="/map" className="mt-6">
          {t('play.toMap')}
        </ButtonLink>
      </div>
    );
  }
  const unlocked = isZoneUnlocked(zone, game.xp);
  const stars = zoneStars(game, zone);
  const current = zone.stages.findIndex((s, i) => isStageUnlocked(game, zone, i) && !(game.stars[s.id] > 0));
  const bossOpen = isBossUnlocked(game, zone);
  const defeated = Boolean(game.bosses[zone.id]);

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-8 flex items-center justify-between gap-3">
        <Link to="/map" className="focus-ring flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden /> {t('nav.map')}
        </Link>
        <button type="button" onClick={() => navigate('/world', { state: { focus: zone.buildingId } })} className="focus-ring flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-slate-400 hover:text-white">
          <MapIcon className="h-4 w-4" aria-hidden /> 3D
        </button>
      </div>

      <header className="mb-10 text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl font-mono text-2xl font-black" style={{ background: `${zone.accent}22`, color: zone.accent, boxShadow: `inset 0 0 0 2px ${zone.accent}66, 0 0 40px ${zone.accent}33` }}>
          {zone.symbol}
        </span>
        <h1 className="mt-4 text-3xl font-bold">{t(zone.nameKey)}</h1>
        <p className="mt-2 text-lg font-semibold text-amber-200">⭐ {stars}/{zone.stages.length * 3}</p>
        {!unlocked && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-300/10 px-3 py-1 text-sm text-amber-200">
            <Lock className="h-4 w-4" aria-hidden /> {t('zone.locked', { n: zone.requiredLevel })}
          </p>
        )}
      </header>

      <ol className="flex flex-col items-center gap-3" aria-label={t(zone.nameKey)}>
        {zone.stages.map((stage, i) => {
          const open = isStageUnlocked(game, zone, i);
          const best = game.stars[stage.id] ?? 0;
          const isCurrent = i === current;
          return (
            <li key={stage.id} className="flex flex-col items-center" style={{ transform: `translateX(${OFFSETS[i % OFFSETS.length]}px)` }}>
              {i > 0 && <span className="mb-3 h-6 w-1 rounded-full bg-white/10" aria-hidden />}
              <button
                type="button"
                disabled={!open}
                onClick={() => navigate(`/play/${stage.id}`)}
                aria-label={`${t('zone.stage', { n: i + 1 })}: ${l(stage.title)}${open ? '' : ` — ${t('common.locked')}`}`}
                className={cn(
                  'focus-ring relative grid h-20 w-20 place-items-center rounded-full border-4 text-2xl font-black transition-transform active:scale-95 disabled:cursor-not-allowed',
                  !open && 'border-white/10 bg-night-800 text-slate-600',
                  open && best > 0 && 'text-night-950 shadow-[0_6px_0_rgba(0,0,0,0.35)] hover:scale-105',
                  isCurrent && 'animate-float text-night-950 shadow-[0_6px_0_rgba(0,0,0,0.35)] hover:scale-105',
                )}
                style={open ? { background: zone.accent, borderColor: isCurrent ? '#ffffff' : `${zone.accent}` } : undefined}
              >
                {!open ? <Lock className="h-7 w-7" aria-hidden /> : best > 0 ? <Check className="h-9 w-9" strokeWidth={3} aria-hidden /> : <Play className="h-8 w-8 fill-current" aria-hidden />}
                {isCurrent && <span className="absolute -inset-2 animate-ping rounded-full border-2 border-white/40" aria-hidden />}
              </button>
              <Stars value={best} size={16} className="mt-2" />
              <p className={cn('mt-1 max-w-[180px] text-center text-sm font-medium', open ? 'text-slate-200' : 'text-slate-600')}>{l(stage.title)}</p>
            </li>
          );
        })}
        <li className="mt-4 flex flex-col items-center">
          <span className="mb-3 h-6 w-1 rounded-full bg-white/10" aria-hidden />
          <button
            type="button"
            disabled={!bossOpen}
            onClick={() => navigate(`/boss/${zone.id}`)}
            aria-label={`${t('zone.boss')}: ${l(zone.boss.name)}`}
            className={cn(
              'focus-ring grid h-28 w-28 place-items-center rounded-[2rem] border-4 transition-transform active:scale-95 disabled:cursor-not-allowed',
              bossOpen ? 'border-rose-300 bg-gradient-to-br from-rose-500 to-violet-600 text-white shadow-[0_8px_0_rgba(0,0,0,0.4)] hover:scale-105' : 'border-white/10 bg-night-800 text-slate-600',
              bossOpen && !defeated && 'animate-float',
            )}
          >
            {bossOpen ? <Swords className="h-12 w-12" aria-hidden /> : <Lock className="h-10 w-10" aria-hidden />}
          </button>
          <p className="mt-2 text-lg font-bold text-white">{t('zone.boss')}</p>
          <p className="text-sm text-slate-400">{l(zone.boss.name)}</p>
          {defeated && <p className="mt-1 text-sm font-semibold text-emerald-300">✓ {t('zone.defeated')}</p>}
          {!bossOpen && unlocked && <p className="mt-1 max-w-[220px] text-center text-xs text-slate-500">{t('zone.bossLocked')}</p>}
        </li>
      </ol>
    </div>
  );
}
