import { Link } from 'react-router-dom';
import { ErrorState, PageLoader } from '@/components/ui/Feedback';
import { PageHeader, Panel, PanelHeader } from '@/components/ui/Panel';
import { ProgressBar } from '@/components/ui/Progress';
import { ActivityHeatmap, DailyGoal, LevelRing, LevelSummary } from '@/features/progress/components';
import { courseProgress, isCourseUnlocked, levelForXp } from '@/features/progress/engine';
import { useProgress } from '@/features/progress/hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate, formatRelative } from '@/lib/dates';

const SOURCE_LABELS = { lesson: 'Lesson', exercise: 'Exercise', quiz: 'Knowledge check', mission: 'Mission', achievement: 'Achievement', daily_goal: 'Daily goal' } as const;

export default function ProgressPage() {
  useDocumentTitle('Progress Center');
  const { snapshot, stats, catalog, isLoading, error, refetch } = useProgress();
  if (isLoading) return <PageLoader label="Loading your progress…" />;
  if (error || !snapshot || !stats || !catalog) return <ErrorState error={error} onRetry={() => void refetch()} />;
  const level = levelForXp(snapshot.xp);
  const tiles = [
    ['Total XP', snapshot.xp.toLocaleString()],
    ['Lessons completed', stats.lessonsCompleted],
    ['Exercises passed', stats.exercisesCompleted],
    ['Perfect knowledge checks', stats.perfectQuizzes],
    ['Missions completed', stats.missionsCompleted],
    ['Current streak', `${stats.streak} day${stats.streak === 1 ? '' : 's'}`],
  ] as const;
  const lessons = Object.entries(snapshot.lessons).sort((a, b) => b[1].localeCompare(a[1]));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Personal Progress Center" title="Your progress" description="Every number here comes from verified completions." />
      <Panel strong className="flex flex-wrap items-center gap-6 p-6">
        <LevelRing xp={snapshot.xp} size={110} />
        <LevelSummary xp={snapshot.xp} />
        <div className="ml-auto">
          <DailyGoal snapshot={snapshot} stats={stats} />
        </div>
      </Panel>
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {tiles.map(([label, value]) => (
          <div key={label} className="glass rounded-2xl p-4">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold text-white">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-6">
          <PanelHeader title="Courses" eyebrow="Completion" />
          <ul className="mt-5 space-y-4">
            {catalog.courses.map((course) => {
              const p = courseProgress(catalog, snapshot, course.id);
              const unlocked = isCourseUnlocked(course, level);
              return (
                <li key={course.id}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <Link to={`/courses/${course.id}`} className="text-slate-200 hover:text-white">
                      {course.title}
                    </Link>
                    <span className="text-slate-400">{unlocked ? `${p.completed}/${p.total}` : `Unlocks at level ${course.requiredLevel}`}</span>
                  </div>
                  <ProgressBar value={p.completed} max={Math.max(1, p.total)} label={`${course.title} completion`} tone={p.ratio === 1 ? 'green' : 'cyan'} />
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel className="p-6">
          <PanelHeader title="Activity" eyebrow="Last 26 weeks" />
          <div className="mt-5">
            <ActivityHeatmap activity={snapshot.activity} today={snapshot.today} weeks={26} />
          </div>
        </Panel>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-6">
          <PanelHeader title="XP history" eyebrow="Recent rewards" />
          {snapshot.transactions.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No XP earned yet.</p>
          ) : (
            <div className="mt-4 max-h-96 overflow-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Recent XP transactions</caption>
                <thead className="sticky top-0 bg-night-800 text-xs text-slate-500">
                  <tr>
                    <th scope="col" className="py-2 font-medium">Activity</th>
                    <th scope="col" className="py-2 font-medium">Type</th>
                    <th scope="col" className="py-2 text-right font-medium">XP</th>
                    <th scope="col" className="py-2 text-right font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.transactions.map((t) => (
                    <tr key={t.id} className="border-t border-white/[0.05]">
                      <td className="py-2 pr-3 text-slate-200">{t.description}</td>
                      <td className="py-2 pr-3 text-slate-400">{SOURCE_LABELS[t.sourceType]}</td>
                      <td className="py-2 text-right font-medium text-cyan-200">+{t.amount}</td>
                      <td className="py-2 pl-3 text-right text-xs text-slate-500">{formatRelative(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
        <Panel className="p-6">
          <PanelHeader title="Completed lessons" eyebrow={`${lessons.length} total`} />
          {lessons.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No lessons completed yet.</p>
          ) : (
            <ul className="mt-4 max-h-96 space-y-2 overflow-auto">
              {lessons.map(([id, at]) => {
                const lesson = catalog.lessons.find((l) => l.id === id);
                const course = catalog.courses.find((c) => c.id === lesson?.courseId);
                return (
                  <li key={id} className="flex justify-between gap-3 border-b border-white/[0.04] pb-2 text-sm">
                    {lesson ? (
                      <Link to={`/courses/${lesson.courseId}/lessons/${id}`} className="text-slate-200 hover:text-white">
                        {lesson.title} <span className="text-slate-500">· {course?.title}</span>
                      </Link>
                    ) : (
                      <span className="text-slate-500">{id} (no longer published)</span>
                    )}
                    <span className="shrink-0 text-xs text-slate-500">{formatDate(at)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
