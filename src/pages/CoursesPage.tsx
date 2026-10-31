import { Link } from 'react-router-dom';
import { BookOpen, Clock, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, PageLoader } from '@/components/ui/Feedback';
import { PageHeader } from '@/components/ui/Panel';
import { ProgressBar } from '@/components/ui/Progress';
import { buildingById } from '@/data/buildings';
import { courseProgress, isCourseUnlocked, levelForXp } from '@/features/progress/engine';
import { useProgress } from '@/features/progress/hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/cn';

export default function CoursesPage() {
  useDocumentTitle('Courses');
  const { catalog, snapshot, isLoading, error, refetch } = useProgress();
  if (isLoading) return <PageLoader label="Loading courses…" />;
  if (error || !catalog || !snapshot) return <ErrorState error={error} title="Couldn’t load courses" onRetry={() => void refetch()} />;
  const level = levelForXp(snapshot.xp);

  return (
    <>
      <PageHeader
        eyebrow="Learning districts"
        title="Courses"
        description="Structured paths from beginner to advanced. Each course lives in its own building and unlocks as you level up."
      />
      {catalog.courses.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="No published courses yet"
          description="Publish courses in the admin area, or use “Reset demo content” there to restore the bundled courses."
        />
      ) : (
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {catalog.courses.map((course) => {
            const unlocked = isCourseUnlocked(course, level);
            const progress = courseProgress(catalog, snapshot, course.id);
            const lessons = catalog.lessons.filter((l) => l.courseId === course.id);
            const prereqs = course.prerequisites.map((id) => catalog.courses.find((c) => c.id === id)?.title ?? id);
            return (
              <li key={course.id}>
                <Link
                  to={`/courses/${course.id}`}
                  className="focus-ring glass group relative flex h-full flex-col overflow-hidden rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:border-white/20"
                >
                  <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40" style={{ background: course.accent }} />
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-xl border font-mono text-sm font-semibold" style={{ borderColor: `${course.accent}55`, color: course.accent, background: `${course.accent}12` }}>
                      {buildingById(course.buildingId)?.symbol}
                    </span>
                    {unlocked ? (
                      progress.completed === progress.total && progress.total > 0 ? <Badge tone="green">Completed</Badge> : <Badge tone="cyan">Unlocked</Badge>
                    ) : (
                      <Badge tone="amber">
                        <Lock className="h-3 w-3" aria-hidden /> Level {course.requiredLevel}
                      </Badge>
                    )}
                  </div>
                  <h2 className="mt-5 text-lg">{course.title}</h2>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-400">{course.tagline}</p>
                  <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" aria-hidden /> {lessons.length} lessons
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden /> ~{course.estimatedHours} h
                    </span>
                    {prereqs.length > 0 && <span>Recommended: {prereqs.join(', ')}</span>}
                  </div>
                  <div className={cn('mt-4', !unlocked && 'opacity-50')}>
                    <div className="mb-1.5 flex justify-between text-xs text-slate-400">
                      <span>Progress</span>
                      <span>
                        {progress.completed}/{progress.total}
                      </span>
                    </div>
                    <ProgressBar value={progress.completed} max={Math.max(1, progress.total)} label={`${course.title} progress`} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
