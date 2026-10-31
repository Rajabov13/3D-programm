import { Flame, Lock, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { NamedIcon } from '@/components/ui/Icon';
import { ProgressBar, ProgressRing } from '@/components/ui/Progress';
import { addDays, formatDate } from '@/lib/dates';
import { cn } from '@/lib/cn';
import type { Achievement, Catalog, Mission, ProgressSnapshot } from '@/types';
import { describeRequirement, levelProgress, levelTitle, requirementProgress, type ProgressStats } from './engine';

export function LevelRing({ xp, size = 96 }: { xp: number; size?: number }) {
  const lp = levelProgress(xp);
  return (
    <ProgressRing value={lp.current} max={lp.needed} size={size} stroke={7} label={`Level ${lp.level}, ${Math.round(lp.ratio * 100)}% to level ${lp.level + 1}`}>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-slate-500">Level</p>
        <p className="text-2xl font-bold leading-none text-white">{lp.level}</p>
      </div>
    </ProgressRing>
  );
}

export function LevelSummary({ xp }: { xp: number }) {
  const lp = levelProgress(xp);
  return (
    <div className="min-w-0">
      <p className="text-sm font-medium text-cyan-200">{levelTitle(lp.level)}</p>
      <p className="mt-0.5 text-2xl font-semibold text-white">{xp.toLocaleString()} XP</p>
      <div className="mt-2 w-56 max-w-full">
        <ProgressBar value={lp.current} max={lp.needed} label="Progress to next level" />
      </div>
      <p className="mt-1.5 text-xs text-slate-500">
        {lp.toNext} XP to level {lp.level + 1}
      </p>
    </div>
  );
}

export function DailyGoal({ snapshot, stats }: { snapshot: ProgressSnapshot; stats: ProgressStats }) {
  const met = stats.todayXp >= snapshot.dailyGoalXp;
  return (
    <div className="flex items-center gap-4">
      <ProgressRing value={stats.todayXp} max={snapshot.dailyGoalXp} size={64} stroke={6} color={met ? '#34d399' : '#fbbf24'} label={`Daily goal: ${stats.todayXp} of ${snapshot.dailyGoalXp} XP`}>
        <Flame className={cn('h-5 w-5', met ? 'text-emerald-300' : 'text-amber-300')} aria-hidden />
      </ProgressRing>
      <div>
        <p className="text-sm font-medium text-white">{met ? 'Daily goal reached' : 'Daily goal'}</p>
        <p className="text-xs text-slate-400">
          {Math.min(stats.todayXp, snapshot.dailyGoalXp)}/{snapshot.dailyGoalXp} XP today
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          Streak: <strong className="text-amber-200">{stats.streak} day{stats.streak === 1 ? '' : 's'}</strong>
        </p>
      </div>
    </div>
  );
}

export function ActivityHeatmap({ activity, today, weeks = 12 }: { activity: Record<string, number>; today: string; weeks?: number }) {
  const days = useMemo(() => {
    const total = weeks * 7;
    return Array.from({ length: total }, (_, i) => {
      const key = addDays(today, i - total + 1);
      return { key, xp: activity[key] ?? 0 };
    });
  }, [activity, today, weeks]);
  const level = (xp: number) => (xp === 0 ? 0 : xp < 30 ? 1 : xp < 70 ? 2 : xp < 120 ? 3 : 4);
  const colors = ['bg-white/[0.05]', 'bg-cyan-900', 'bg-cyan-700', 'bg-cyan-500', 'bg-cyan-300'];
  const total = days.reduce((s, d) => s + d.xp, 0);
  const activeDays = days.filter((d) => d.xp > 0).length;
  return (
    <div>
      <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto" role="img" aria-label={`${activeDays} active days and ${total} XP in the last ${weeks} weeks`}>
        {days.map((d) => (
          <span key={d.key} title={`${d.key}: ${d.xp} XP`} className={cn('h-3 w-3 rounded-[3px]', colors[level(d.xp)])} />
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {activeDays} active day{activeDays === 1 ? '' : 's'} · {total.toLocaleString()} XP in the last {weeks} weeks
      </p>
    </div>
  );
}

export function MissionRow({
  mission,
  stats,
  claimedAt,
  catalog,
  onClaim,
  claiming,
  canClaim,
}: {
  mission: Mission;
  stats: ProgressStats;
  claimedAt?: string;
  catalog: Catalog;
  onClaim?: () => void;
  claiming?: boolean;
  canClaim: boolean;
}) {
  const progress = requirementProgress(mission.requirement, stats);
  return (
    <div className={cn('glass flex flex-wrap items-center gap-4 rounded-xl p-4', claimedAt && 'opacity-70')}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-white">{mission.title}</p>
          <span className="rounded-full bg-cyan-300/10 px-2 py-0.5 text-[11px] font-medium text-cyan-200">+{mission.xp} XP</span>
        </div>
        <p className="mt-0.5 text-sm text-slate-400">{mission.description}</p>
        <div className="mt-3 flex items-center gap-3">
          <ProgressBar value={progress.current} max={progress.target} size="sm" className="max-w-xs" tone={progress.met ? 'green' : 'cyan'} label={describeRequirement(mission.requirement, catalog)} />
          <span className="shrink-0 text-xs text-slate-500">
            {progress.current}/{progress.target}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">{describeRequirement(mission.requirement, catalog)}</p>
      </div>
      {claimedAt ? (
        <span className="text-xs text-emerald-300">Completed {formatDate(claimedAt)}</span>
      ) : progress.met ? (
        <Button size="sm" onClick={onClaim} loading={claiming} disabled={!canClaim} icon={<Sparkles className="h-3.5 w-3.5" />}>
          Claim reward
        </Button>
      ) : (
        <span className="text-xs text-slate-500">In progress</span>
      )}
    </div>
  );
}

const TIER_STYLES = {
  bronze: 'border-orange-400/40 bg-orange-400/10 text-orange-300',
  silver: 'border-slate-300/40 bg-slate-300/10 text-slate-100',
  gold: 'border-amber-300/50 bg-amber-300/10 text-amber-300',
  platinum: 'border-cyan-200/50 bg-cyan-200/10 text-cyan-100',
} as const;

export function AchievementBadge({ achievement, earnedAt, stats, compact }: { achievement: Achievement; earnedAt?: string; stats?: ProgressStats; compact?: boolean }) {
  const progress = stats ? requirementProgress(achievement.criteria, stats) : null;
  return (
    <div className={cn('glass flex flex-col items-center rounded-2xl text-center', compact ? 'p-3' : 'p-5', !earnedAt && 'opacity-60')}>
      <span className={cn('relative grid place-items-center rounded-full border', compact ? 'h-11 w-11' : 'h-14 w-14', earnedAt ? TIER_STYLES[achievement.tier] : 'border-white/10 bg-white/[0.04] text-slate-500')}>
        <NamedIcon name={achievement.icon} className={compact ? 'h-5 w-5' : 'h-6 w-6'} />
        {!earnedAt && <Lock className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-night-900 p-0.5 text-slate-400" aria-hidden />}
      </span>
      <p className={cn('font-medium text-white', compact ? 'mt-2 text-[13px]' : 'mt-3 text-sm')}>{achievement.title}</p>
      {!compact && <p className="mt-1 text-xs leading-snug text-slate-400">{achievement.description}</p>}
      <p className="mt-2 text-[11px] capitalize text-slate-500">
        {earnedAt ? `${achievement.tier} · ${formatDate(earnedAt)}` : progress ? `${progress.current}/${progress.target}` : achievement.tier}
      </p>
      <span className="sr-only">{earnedAt ? 'Earned' : 'Not earned yet'}</span>
    </div>
  );
}
