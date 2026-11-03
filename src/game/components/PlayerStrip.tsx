import { Flame, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/Progress';
import { useProfile } from '@/features/profile/ProfileProvider';
import { useT } from '@/i18n';
import { gameStats, levelProgress } from '../engine';
import { useGame } from '../store';
import { TOTAL_STARS } from '../content';

/** Level, XP, streak and stars — the player's "HUD" at the top of hub pages. */
export function PlayerStrip() {
  const t = useT();
  const { profile } = useProfile();
  const game = useGame((s) => s.game);
  const stats = gameStats(game);
  const lp = levelProgress(game.xp);
  return (
    <Link to="/profile" className="focus-ring glass-strong flex flex-wrap items-center gap-4 rounded-3xl p-4 transition-colors hover:border-white/20 sm:p-5">
      <div className="relative">
        <Avatar preset={profile.avatar} size={56} />
        <span className="absolute -bottom-1 -right-1 grid h-7 min-w-7 place-items-center rounded-full border-2 border-night-900 bg-gradient-to-br from-cyan-300 to-violet-400 px-1 text-xs font-black text-night-950">
          {lp.level}
        </span>
      </div>
      <div className="min-w-[160px] flex-1">
        <p className="font-semibold text-white">{profile.displayName}</p>
        <ProgressBar className="mt-2" value={lp.current} max={lp.needed} label={t('common.xpToNext', { n: lp.toNext })} />
        <p className="mt-1 text-xs text-slate-500">
          {game.xp} XP · {t('common.xpToNext', { n: lp.toNext })}
        </p>
      </div>
      <div className="flex gap-2">
        <span className="flex items-center gap-1.5 rounded-2xl border border-amber-300/20 bg-amber-300/[0.07] px-3 py-2 text-lg font-bold text-amber-200" title={t('profile.streak')}>
          <Flame className="h-5 w-5" aria-hidden />
          {stats.streak}
          <span className="sr-only">{t('profile.streak')}</span>
        </span>
        <span className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-lg font-bold text-white" title={t('profile.stars')}>
          <Star className="h-5 w-5 fill-[#fbbf24] text-[#f59e0b]" aria-hidden />
          {stats.stars}
          <span className="text-sm font-medium text-slate-500">/{TOTAL_STARS}</span>
        </span>
      </div>
    </Link>
  );
}
