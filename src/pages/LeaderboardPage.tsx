import { Crown, ShieldCheck } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Switch } from '@/components/ui/Field';
import { EmptyState, ErrorState, InlineAlert, PageLoader } from '@/components/ui/Feedback';
import { PageHeader, Panel } from '@/components/ui/Panel';
import { toast } from '@/components/ui/toast';
import { useProfile } from '@/features/profile/ProfileProvider';
import { useLeaderboard } from '@/features/progress/hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/cn';
import { errorMessage } from '@/lib/errors';

export default function LeaderboardPage() {
  useDocumentTitle('Leaderboard');
  const { profile, updateProfile } = useProfile();
  const board = useLeaderboard();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Community" title="Leaderboard" description="Top explorers by XP. Participation is opt-in and shows only a display name, avatar, level and XP." />
      <InlineAlert tone="warning" className="mb-6" title="Demo data">
        Rows labelled “Sample” are illustrative placeholders; only your own profile is real.
      </InlineAlert>
      <Panel className="mb-6 p-5">
          <Switch
            checked={profile.showOnLeaderboard}
            onChange={async (v) => {
              try {
                await updateProfile({ showOnLeaderboard: v });
                await board.refetch();
              } catch (e) {
                toast.error('Couldn’t update visibility', errorMessage(e));
              }
            }}
            label="Show me on the leaderboard"
            description="Only your display name, avatar, level and XP are shown."
          />
      </Panel>
      {board.isLoading ? (
        <PageLoader label="Loading leaderboard…" />
      ) : board.error ? (
        <ErrorState error={board.error} onRetry={() => void board.refetch()} />
      ) : !board.data?.length ? (
        <EmptyState icon={<Crown className="h-8 w-8" />} title="No one on the board yet" description="Be the first: opt in above and earn some XP." />
      ) : (
        <Panel className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Leaderboard ranked by total XP</caption>
            <thead className="border-b border-white/[0.06] text-xs text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">Rank</th>
                <th scope="col" className="px-5 py-3 font-medium">Explorer</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">Level</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">XP</th>
              </tr>
            </thead>
            <tbody>
              {board.data.map((row) => (
                <tr key={`${row.rank}-${row.displayName}`} className={cn('border-b border-white/[0.04] last:border-0', row.isMe && 'bg-cyan-300/[0.06]')}>
                  <td className="px-5 py-3">
                    <span className={cn('font-mono font-semibold', row.rank === 1 ? 'text-amber-300' : row.rank <= 3 ? 'text-slate-200' : 'text-slate-500')}>#{row.rank}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-3">
                      <Avatar preset={row.avatar} size={30} />
                      <span className="font-medium text-white">{row.displayName}</span>
                      {row.isMe && <span className="rounded-full bg-cyan-300/15 px-2 py-0.5 text-[11px] text-cyan-200">You</span>}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-300">{row.level}</td>
                  <td className="px-5 py-3 text-right font-semibold text-cyan-200">{row.xp.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
      <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> XP is only awarded for passed checks and completed activities — never twice for the same one.
      </p>
    </div>
  );
}
