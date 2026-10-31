import { ErrorState, PageLoader } from '@/components/ui/Feedback';
import { PageHeader } from '@/components/ui/Panel';
import { ProgressBar } from '@/components/ui/Progress';
import { AchievementBadge } from '@/features/progress/components';
import { useProgress } from '@/features/progress/hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function AchievementsPage() {
  useDocumentTitle('Achievement Hall');
  const { snapshot, stats, catalog, isLoading, error, refetch } = useProgress();
  if (isLoading) return <PageLoader label="Loading achievements…" />;
  if (error || !snapshot || !stats || !catalog) return <ErrorState error={error} onRetry={() => void refetch()} />;
  const earned = catalog.achievements.filter((a) => snapshot.achievements[a.id]).length;
  const sorted = [...catalog.achievements].sort((a, b) => Number(Boolean(snapshot.achievements[b.id])) - Number(Boolean(snapshot.achievements[a.id])) || a.order - b.order);

  return (
    <>
      <PageHeader
        eyebrow="Achievement Hall"
        title="Achievements"
        description="Badges unlock automatically when you reach a milestone. Each grants bonus XP once."
        actions={
          <div className="w-56">
            <p className="mb-1.5 text-right text-sm text-slate-300">
              {earned}/{catalog.achievements.length} earned
            </p>
            <ProgressBar value={earned} max={Math.max(1, catalog.achievements.length)} tone="amber" label="Achievements earned" />
          </div>
        }
      />
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {sorted.map((a) => (
          <li key={a.id}>
            <AchievementBadge achievement={a} earnedAt={snapshot.achievements[a.id]} stats={stats} />
          </li>
        ))}
      </ul>
    </>
  );
}
