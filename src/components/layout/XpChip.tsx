import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useProgress } from '@/features/progress/hooks';
import { levelProgress } from '@/features/progress/engine';

export function XpChip() {
  const { snapshot } = useProgress();
  if (!snapshot) return null;
  const lp = levelProgress(snapshot.xp);
  return (
    <Link
      to="/progress"
      className="focus-ring group hidden items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1.5 pr-3 hover:border-cyan-300/30 sm:flex"
      aria-label={`Level ${lp.level}, ${snapshot.xp} XP. ${lp.toNext} XP to next level. Open progress center.`}
    >
      <span className="grid h-6 min-w-6 place-items-center rounded-full bg-gradient-to-br from-cyan-300 to-violet-400 px-1.5 text-[11px] font-bold text-night-950">
        {lp.level}
      </span>
      <span className="flex flex-col">
        <span className="flex items-center gap-1 text-[12px] font-semibold leading-none text-white">
          <Sparkles className="h-3 w-3 text-cyan-300" aria-hidden />
          {snapshot.xp.toLocaleString()} XP
        </span>
        <span className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-white/10">
          <span className="block h-full rounded-full bg-cyan-300" style={{ width: `${lp.ratio * 100}%` }} />
        </span>
      </span>
    </Link>
  );
}
