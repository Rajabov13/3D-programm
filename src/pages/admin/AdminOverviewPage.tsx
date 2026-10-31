import { ErrorState, InlineAlert, PageLoader } from '@/components/ui/Feedback';
import { Panel, PanelHeader } from '@/components/ui/Panel';
import { BarChart } from '@/features/admin/BarChart';
import { useActivitySummary } from '@/features/admin/hooks';
import { useFullCatalog } from '@/features/content/hooks';
import { formatRelative } from '@/lib/dates';

export default function AdminOverviewPage() {
  const summary = useActivitySummary(14);
  const catalog = useFullCatalog();
  if (summary.isLoading || catalog.isLoading) return <PageLoader label="Loading platform activity…" />;
  if (summary.error || !summary.data) return <ErrorState error={summary.error} title="Couldn’t load activity" onRetry={() => void summary.refetch()} />;
  const s = summary.data;
  const c = catalog.data;
  const passRate = s.totals.submissions7d ? Math.round((s.totals.passedSubmissions7d / s.totals.submissions7d) * 100) : null;
  const tiles: Array<[string, string | number]> = [
    ['Learners', s.totals.learners],
    ['Active (7 days)', s.totals.activeLearners7d],
    ['Lessons completed (7d)', s.totals.lessonsCompleted7d],
    ['Exercise submissions (7d)', s.totals.submissions7d],
    ['Submission pass rate (7d)', passRate === null ? '—' : `${passRate}%`],
    ['XP awarded (7d)', s.totals.xpAwarded7d.toLocaleString()],
  ];
  const drafts = c ? c.courses.filter((x) => !x.published).length + c.lessons.filter((x) => !x.published).length + c.exercises.filter((x) => !x.published).length : 0;

  return (
    <div className="space-y-6">
      <InlineAlert tone="info">Demo: figures are derived from this browser’s progress only (one learner).</InlineAlert>
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {tiles.map(([label, value]) => (
          <div key={label} className="glass rounded-2xl p-4">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold text-white">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="p-6 lg:col-span-2">
          <PanelHeader eyebrow="Last 14 days" title="XP awarded per day" />
          <div className="mt-4">
            <BarChart data={s.daily.map((d) => ({ key: d.day, value: d.xp }))} label="XP awarded per day over the last 14 days" valueLabel="XP" />
          </div>
        </Panel>
        <Panel className="p-6">
          <PanelHeader eyebrow="Content" title="Catalog" />
          {c && (
            <dl className="mt-4 space-y-2 text-sm">
              {(
                [
                  ['Courses', c.courses.length],
                  ['Lessons', c.lessons.length],
                  ['Exercises', c.exercises.length],
                  ['Quiz questions', c.quizQuestions.length],
                  ['Missions', c.missions.length],
                  ['Achievements', c.achievements.length],
                  ['Unpublished drafts', drafts],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-white/[0.04] pb-2">
                  <dt className="text-slate-400">{k}</dt>
                  <dd className="font-medium text-white">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </Panel>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-6">
          <PanelHeader eyebrow="Last 30 days" title="Most attempted exercises" />
          {s.topExercises.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">Individual submission attempts aren’t tracked in the demo version.</p>
          ) : (
            <table className="mt-4 w-full text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th scope="col" className="py-2 font-medium">Exercise</th>
                  <th scope="col" className="py-2 text-right font-medium">Attempts</th>
                  <th scope="col" className="py-2 text-right font-medium">Pass rate</th>
                </tr>
              </thead>
              <tbody>
                {s.topExercises.map((e) => (
                  <tr key={e.exerciseId} className="border-t border-white/[0.05]">
                    <td className="py-2 text-slate-200">{e.title}</td>
                    <td className="py-2 text-right text-slate-300">{e.attempts}</td>
                    <td className="py-2 text-right text-slate-300">{Math.round((e.passed / Math.max(1, e.attempts)) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
        <Panel className="p-6">
          <PanelHeader eyebrow="Live feed" title="Recent rewards" />
          {s.recent.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No activity yet.</p>
          ) : (
            <ul className="mt-4 max-h-80 space-y-2 overflow-auto text-sm">
              {s.recent.map((r, i) => (
                <li key={i} className="flex justify-between gap-3 border-b border-white/[0.04] pb-2">
                  <span className="min-w-0 truncate text-slate-300">
                    <strong className="font-medium text-white">{r.displayName}</strong> · {r.description}
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">
                    +{r.amount} · {formatRelative(r.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
