import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { levelProgress, streak } from '@/game/engine';
import { useGame } from '@/game/store';
import { useT } from '@/i18n';

/** Level, XP bar and day streak in the navbar. */
export function XpChip() {
  const t = useT();
  const game = useGame((s) => s.game);
  const lp = levelProgress(game.xp);
  const days = streak(game);
  return (
    <Link
      to="/profile"
      className="focus-ring group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-3 hover:border-cyan-300/30"
      aria-label={`${t('common.levelN', { n: lp.level })} · ${game.xp} XP · ${t('common.xpToNext', { n: lp.toNext })} · ${t('profile.streak')}: ${days}`}
    >
      <span className="grid h-7 min-w-7 place-items-center rounded-full bg-primary px-1.5 text-[12px] font-black text-primary-fg">{lp.level}</span>
      <span className="hidden flex-col sm:flex">
        <span className="text-[12px] font-bold leading-none text-white">{game.xp} XP</span>
        <span className="mt-1 h-1 w-14 overflow-hidden rounded-full bg-white/10">
          <span className="block h-full rounded-full bg-cyan-300" style={{ width: `${lp.ratio * 100}%` }} />
        </span>
      </span>
      <span className="flex items-center gap-0.5 text-[13px] font-bold text-amber-300">
        <Flame className="h-4 w-4" aria-hidden />
        {days}
      </span>
    </Link>
  );
}
