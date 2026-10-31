import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CircleCheck, Code2, Map as MapIcon, Trophy } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState, ErrorState, PageLoader } from '@/components/ui/Feedback';
import { Panel, PanelHeader } from '@/components/ui/Panel';
import { ProgressBar } from '@/components/ui/Progress';
import { Badge, DifficultyBadge } from '@/components/ui/Badge';
import { buildingById } from '@/data/buildings';
import { useProfile } from '@/features/profile/ProfileProvider';
import { AchievementBadge, ActivityHeatmap, DailyGoal, LevelRing, LevelSummary, MissionRow } from '@/features/progress/components';
import { courseProgress, isCourseUnlocked, levelForXp, recommendedLesson, requirementProgress } from '@/features/progress/engine';
import { useProgress, useProgressActions } from '@/features/progress/hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatRelative } from '@/lib/dates';

export default function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { profile } = useProfile();
  const { snapshot, stats, catalog, isLoading, error, refetch } = useProgress();
  const { claimMission } = useProgressActions();

  if (isLoading) return <PageLoader label="Loading your dashboard…" />;
  if (error || !snapshot || !stats || !catalog) return <ErrorState error={error} title="Couldn’t load your dashboard" onRetry={() => void refetch()} />;
  if (catalog.courses.length === 0) {
    return <EmptyState icon={<BookOpen className="h-8 w-8" />} title="No courses are published yet" description="Publish courses in the admin area, or reset the demo content there." />;
  }

  const level = levelForXp(snapshot.xp);
  const next = recommendedLesson(catalog, snapshot);
  const current = catalog.courses
    .filter((c) => isCourseUnlocked(c, level))
    .map((c) => ({ course: c, progress: courseProgress(catalog, snapshot, c.id) }))
    .sort((a, b) => Number(b.progress.completed > 0) - Number(a.progress.completed > 0) || a.course.order - b.course.order)
    .slice(0, 4);
  const missions = catalog.missions
    .filter((m) => !snapshot.missions[m.id])
    .map((m) => ({ m, p: requirementProgress(m.requirement, stats) }))
    .sort((a, b) => Number(b.p.met) - Number(a.p.met) || b.p.current / b.p.target - a.p.current / a.p.target)
    .slice(0, 3);
  const earned = catalog.achievements.filter((a) => snapshot.achievements[a.id]).sort((a, b) => snapshot.achievements[b.id].localeCompare(snapshot.achievements[a.id]));
  const completedLessons = Object.entries(snapshot.lessons)
    .sort((a, b) => b[1].localeCompare(a[1]))
    .slice(0, 5)
    .map(([id, at]) => ({ lesson: catalog.lessons.find((l) => l.id === id), at }))
    .filter((x) => x.lesson);

  return (
    <div className="space-y-6">
      <section className="glass-strong relative overflow-hidden rounded-3xl p-6 sm:p-8" aria-labelledby="welcome">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-6">
          <LevelRing xp={snapshot.xp} />
          <div className="min-w-0 flex-1">
            <p className="eyebrow">Welcome back</p>
            <h1 id="welcome" className="mt-1 text-2xl md:text-3xl">
              {profile.displayName}
            </h1>
            <div className="mt-3">
              <LevelSummary xp={snapshot.xp} />
            </div>
          </div>
          <DailyGoal snapshot={snapshot} stats={stats} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="relative overflow-hidden p-6 lg:col-span-2">
          <PanelHeader eyebrow="Continue learning" title={next ? next.lesson.title : 'Everything unlocked is complete'} />
          {next ? (
            <>
              <p className="mt-2 text-sm text-slate-400">
                {next.course.title} · Lesson {next.lesson.order} — {next.lesson.summary}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <DifficultyBadge difficulty={next.lesson.difficulty} />
                <Badge>{next.lesson.durationMinutes} min</Badge>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <ButtonLink to={`/courses/${next.course.id}/lessons/${next.lesson.id}`} icon={<ArrowRight className="h-4 w-4" />}>
                  Continue
                </ButtonLink>
                <ButtonLink to="/world" variant="secondary" icon={<MapIcon className="h-4 w-4" />}>
                  Enter the world
                </ButtonLink>
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-400">Earn XP from missions to unlock the next building, or revisit lessons to practise.</p>
          )}
        </Panel>
        <Panel className="p-6">
          <PanelHeader eyebrow="Quick actions" title="Jump in" />
          <div className="mt-4 grid gap-2">
            <ButtonLink to="/world" variant="secondary" className="justify-start" icon={<MapIcon className="h-4 w-4 text-cyan-300" />}>
              Explore the 3D city
            </ButtonLink>
            <ButtonLink to="/playground" variant="secondary" className="justify-start" icon={<Code2 className="h-4 w-4 text-cyan-300" />}>
              Open the playground
            </ButtonLink>
            <ButtonLink to="/leaderboard" variant="secondary" className="justify-start" icon={<Trophy className="h-4 w-4 text-cyan-300" />}>
              View the leaderboard
            </ButtonLink>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="p-6 lg:col-span-2">
          <PanelHeader eyebrow="Current courses" title="Your tracks" action={<Link to="/courses" className="text-xs text-cyan-300 hover:underline">All courses</Link>} />
          <ul className="mt-5 space-y-4">
            {current.map(({ course, progress }) => (
              <li key={course.id}>
                <Link to={`/courses/${course.id}`} className="focus-ring group flex items-center gap-4 rounded-xl p-2 -m-2 hover:bg-white/[0.03]">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border font-mono text-xs font-semibold" style={{ borderColor: `${course.accent}55`, color: course.accent }}>
                    {buildingById(course.buildingId)?.symbol}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="truncate font-medium text-white">{course.title}</span>
                      <span className="shrink-0 text-slate-400">
                        {progress.completed}/{progress.total}
                      </span>
                    </div>
                    <ProgressBar className="mt-2" size="sm" value={progress.completed} max={Math.max(1, progress.total)} label={`${course.title} progress`} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel className="p-6">
          <PanelHeader eyebrow="Learning activity" title="Last 12 weeks" />
          <div className="mt-4">
            <ActivityHeatmap activity={snapshot.activity} today={snapshot.today} />
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-6">
          <PanelHeader eyebrow="Mission Center" title="Available missions" action={<Link to="/missions" className="text-xs text-cyan-300 hover:underline">All missions</Link>} />
          <div className="mt-4 space-y-3">
            {missions.length === 0 ? (
              <p className="text-sm text-slate-400">All missions complete. Impressive!</p>
            ) : (
              missions.map(({ m }) => (
                <MissionRow
                  key={m.id}
                  mission={m}
                  stats={stats}
                  catalog={catalog}
                  canClaim
                  claiming={claimMission.isPending && claimMission.variables?.missionId === m.id}
                  onClaim={() => claimMission.mutate({ missionId: m.id, title: m.title })}
                />
              ))
            )}
          </div>
        </Panel>
        <div className="space-y-6">
          <Panel className="p-6">
            <PanelHeader eyebrow="Achievement Hall" title="Recently earned" action={<Link to="/achievements" className="text-xs text-cyan-300 hover:underline">All badges</Link>} />
            {earned.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">Complete your first lesson to earn a badge.</p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {earned.slice(0, 4).map((a) => (
                  <AchievementBadge key={a.id} achievement={a} earnedAt={snapshot.achievements[a.id]} compact />
                ))}
              </div>
            )}
          </Panel>
          <Panel className="p-6">
            <PanelHeader eyebrow="Completed" title="Recent lessons" action={<Link to="/progress" className="text-xs text-cyan-300 hover:underline">Progress Center</Link>} />
            {completedLessons.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">No completed lessons yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {completedLessons.map(({ lesson, at }) => (
                  <li key={lesson!.id} className="flex items-center gap-2 text-sm">
                    <CircleCheck className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
                    <Link to={`/courses/${lesson!.courseId}/lessons/${lesson!.id}`} className="min-w-0 flex-1 truncate text-slate-200 hover:text-white">
                      {lesson!.title}
                    </Link>
                    <span className="shrink-0 text-xs text-slate-500">{formatRelative(at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
