import { Crown, Medal } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useProfile } from '@/features/profile/ProfileProvider';
import { levelForXp } from '@/game/engine';
import { useGame } from '@/game/store';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';

/** Illustrative players — the demo has no server, so only "you" is real. */
const SAMPLE = [
  { name: 'Aziza', avatar: 'aurora', xp: 1240 },
  { name: 'Timur', avatar: 'ember', xp: 980 },
  { name: 'Mila', avatar: 'pulse', xp: 760 },
  { name: 'Jasur', avatar: 'circuit', xp: 610 },
  { name: 'Alex', avatar: 'glacier', xp: 455 },
  { name: 'Nodira', avatar: 'quasar', xp: 330 },
  { name: 'Sardor', avatar: 'terminal', xp: 210 },
  { name: 'Lena', avatar: 'nebula', xp: 120 },
  { name: 'Bek', avatar: 'aurora', xp: 60 },
];

const PODIUM = ['text-amber-300', 'text-slate-200', 'text-orange-300'];

export default function LeaderboardPage() {
  const t = useT();
  const { profile } = useProfile();
  const xp = useGame((s) => s.game.xp);
  useDocumentTitle(t('lb.title'));

  const rows = [
    ...SAMPLE.map((r) => ({ ...r, you: false })),
    ...(profile.showOnLeaderboard ? [{ name: profile.displayName, avatar: profile.avatar, xp, you: true }] : []),
  ].sort((a, b) => b.xp - a.xp || Number(b.you) - Number(a.you));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="flex items-center gap-3 text-3xl">
        <Crown className="h-8 w-8 text-amber-300" aria-hidden /> {t('lb.title')}
      </h1>
      <p className="mt-2 text-sm text-slate-500">{t('lb.sample')}</p>
      {!profile.showOnLeaderboard && <p className="mt-2 text-sm text-amber-200/80">{t('lb.hidden')}</p>}
      <ol className="mt-6 space-y-2">
        {rows.map((r, i) => (
          <li
            key={`${r.name}-${i}`}
            className={cn(
              'flex items-center gap-4 rounded-2xl border px-4 py-3',
              r.you ? 'border-cyan-300/40 bg-cyan-300/[0.08]' : 'border-white/[0.06] bg-night-800/50',
            )}
            aria-current={r.you ? 'true' : undefined}
          >
            <span className="w-8 text-center text-lg font-black tabular-nums text-slate-400">
              {i < 3 ? <Medal className={cn('mx-auto h-6 w-6', PODIUM[i])} aria-label={String(i + 1)} /> : i + 1}
            </span>
            <Avatar preset={r.avatar} size={40} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-white">
                {r.name} {r.you && <span className="ml-1 rounded-full bg-cyan-300 px-2 py-0.5 text-[11px] font-bold text-night-950">{t('lb.you')}</span>}
              </span>
              <span className="text-xs text-slate-500">{t('common.levelN', { n: levelForXp(r.xp) })}</span>
            </span>
            <span className="text-lg font-bold tabular-nums text-cyan-200">{r.xp}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
