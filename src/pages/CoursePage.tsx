import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, CircleCheck, Clock, Lock, Map as MapIcon, Target } from 'lucide-react';
import { Badge, DifficultyBadge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState, ErrorState, InlineAlert, PageLoader } from '@/components/ui/Feedback';
import { ProgressBar } from '@/components/ui/Progress';
import { buildingById } from '@/data/buildings';
import { courseLessons, courseProgress, isCourseUnlocked, lessonRequirements, levelForXp, xpForLevel } from '@/features/progress/engine';
import { useProgress } from '@/features/progress/hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/cn';

export default function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { catalog, snapshot, isLoading, error, refetch } = useProgress();
  const course = catalog?.courses.find((c) => c.id === courseId);
  useDocumentTitle(course?.title ?? 'Course');

  if (isLoading) return <PageLoader label="Loading course…" />;
  if (error || !catalog || !snapshot) return <ErrorState error={error} title="Couldn’t load this course" onRetry={() => void refetch()} />;
  if (!course) {
    return <EmptyState headingLevel="h1"
        title="Course not found" description="It may have been unpublished or the link is wrong." action={<ButtonLink to="/courses">All courses</ButtonLink>} />;
  }

  const level = levelForXp(snapshot.xp);
  const unlocked = isCourseUnlocked(course, level);
  const lessons = courseLessons(catalog, course.id);
  const progress = courseProgress(catalog, snapshot, course.id);
  const next = lessons.find((l) => !snapshot.lessons[l.id]);
  const building = buildingById(course.buildingId);
  const prereqs = course.prerequisites.map((id) => catalog.courses.find((c) => c.id === id)).filter(Boolean);

  return (
    <div className="space-y-10">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link to="/courses" className="hover:text-slate-300">
          Courses
        </Link>{' '}
        / <span className="text-slate-300">{course.title}</span>
      </nav>

      <header className="glass-strong relative overflow-hidden rounded-3xl p-6 sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full opacity-25 blur-3xl" style={{ background: course.accent }} />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="grid h-11 w-11 place-items-center rounded-xl border font-mono text-sm font-semibold" style={{ borderColor: `${course.accent}55`, color: course.accent }}>
                {building?.symbol}
              </span>
              <Badge>{building?.name}</Badge>
              {unlocked ? <Badge tone="green">Unlocked</Badge> : <Badge tone="amber"><Lock className="h-3 w-3" aria-hidden /> Requires level {course.requiredLevel}</Badge>}
            </div>
            <h1 className="mt-5 text-3xl md:text-4xl">{course.title}</h1>
            <p className="mt-3 max-w-2xl leading-relaxed text-slate-300">{course.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {unlocked && next && (
                <ButtonLink to={`/courses/${course.id}/lessons/${next.id}`} icon={<ArrowRight className="h-4 w-4" />}>
                  {progress.completed ? 'Continue' : 'Start course'}: {next.title}
                </ButtonLink>
              )}
              <Button variant="secondary" onClick={() => navigate('/world', { state: { focus: course.buildingId } })} icon={<MapIcon className="h-4 w-4" />}>
                View in the city
              </Button>
            </div>
          </div>
          <aside className="space-y-4 rounded-2xl border border-white/[0.07] bg-night-950/40 p-5">
            <div>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-slate-400">Progress</span>
                <span className="font-medium text-white">
                  {progress.completed}/{progress.total} lessons
                </span>
              </div>
              <ProgressBar value={progress.completed} max={Math.max(1, progress.total)} label="Course progress" />
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Estimated time</dt>
                <dd className="mt-0.5 flex items-center gap-1 text-slate-200">
                  <Clock className="h-3.5 w-3.5" aria-hidden /> ~{course.estimatedHours} h
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Lessons</dt>
                <dd className="mt-0.5 flex items-center gap-1 text-slate-200">
                  <BookOpen className="h-3.5 w-3.5" aria-hidden /> {lessons.length}
                </dd>
              </div>
            </dl>
            {prereqs.length > 0 && (
              <div>
                <p className="text-xs text-slate-500">Recommended first</p>
                <ul className="mt-1 space-y-1">
                  {prereqs.map((p) => (
                    <li key={p!.id}>
                      <Link to={`/courses/${p!.id}`} className="text-sm text-cyan-300 hover:underline">
                        {p!.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </header>

      {!unlocked && (
        <InlineAlert tone="warning" title={`Unlocks at level ${course.requiredLevel}`}>
          You are level {level}. Earn {Math.max(0, xpForLevel(course.requiredLevel) - snapshot.xp)} more XP by completing lessons, knowledge checks, exercises and
          missions in unlocked courses. You can read the syllabus below in the meantime.
        </InlineAlert>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <section aria-labelledby="lessons-title">
          <h2 id="lessons-title" className="mb-4 text-xl">
            Lessons
          </h2>
          <ol className="space-y-3">
            {lessons.map((lesson, i) => {
              const req = lessonRequirements(catalog, snapshot, lesson.id);
              const started = req.quizPassed && req.hasQuiz ? true : req.exercises.some((e) => e.done);
              const content = (
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      'grid h-9 w-9 shrink-0 place-items-center rounded-full border font-mono text-xs',
                      req.completed ? 'border-emerald-300/40 bg-emerald-400/10 text-emerald-200' : 'border-white/10 text-slate-400',
                    )}
                  >
                    {req.completed ? <CircleCheck className="h-4 w-4" aria-label="Completed" /> : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{lesson.title}</p>
                    <p className="mt-0.5 truncate text-sm text-slate-400">{lesson.summary}</p>
                  </div>
                  <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                    <DifficultyBadge difficulty={lesson.difficulty} />
                    <span className="text-xs text-slate-500">
                      {lesson.durationMinutes} min · {lesson.xp + lesson.quizXp + req.exercises.reduce((s, e) => s + e.exercise.xp, 0)} XP
                    </span>
                  </div>
                  {!unlocked && <Lock className="h-4 w-4 shrink-0 text-amber-300/70" aria-label="Locked" />}
                  {unlocked && !req.completed && started && <Badge tone="cyan">In progress</Badge>}
                </div>
              );
              return (
                <li key={lesson.id}>
                  {unlocked ? (
                    <Link to={`/courses/${course.id}/lessons/${lesson.id}`} className="focus-ring glass block rounded-xl p-4 transition-colors hover:border-white/20">
                      {content}
                    </Link>
                  ) : (
                    <div className="glass rounded-xl p-4 opacity-70" aria-disabled>
                      {content}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
        <aside aria-labelledby="objectives-title" className="glass h-fit rounded-2xl p-5">
          <h2 id="objectives-title" className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-cyan-300" aria-hidden /> Learning objectives
          </h2>
          <ul className="mt-4 space-y-2.5">
            {course.objectives.map((o) => (
              <li key={o} className="flex gap-2 text-sm text-slate-300">
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300/70" aria-hidden />
                {o}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
