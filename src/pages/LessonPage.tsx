import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CircleCheck, CircleDashed, Clock, Code2, Lock, Sparkles } from 'lucide-react';
import { DifficultyBadge, Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState, ErrorState, InlineAlert, PageLoader } from '@/components/ui/Feedback';
import { LessonBlocks } from '@/features/learning/LessonBlocks';
import { Quiz } from '@/features/learning/Quiz';
import { courseLessons, isCourseUnlocked, lessonRequirements, levelForXp } from '@/features/progress/engine';
import { useProgress, useProgressActions } from '@/features/progress/hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate } from '@/lib/dates';
import { errorMessage } from '@/lib/errors';
import { cn } from '@/lib/cn';

export default function LessonPage() {
  const { courseId, lessonId } = useParams();
  const { catalog, snapshot, isLoading, error, refetch } = useProgress();
  const { completeLesson } = useProgressActions();
  const lesson = catalog?.lessons.find((l) => l.id === lessonId && l.courseId === courseId);
  useDocumentTitle(lesson?.title ?? 'Lesson');

  if (isLoading) return <PageLoader label="Loading lesson…" />;
  if (error || !catalog || !snapshot) return <ErrorState error={error} title="Couldn’t load this lesson" onRetry={() => void refetch()} />;
  const course = catalog.courses.find((c) => c.id === courseId);
  if (!lesson || !course) {
    return <EmptyState headingLevel="h1"
        title="Lesson not found" description="It may have been unpublished or moved." action={<ButtonLink to="/courses">All courses</ButtonLink>} />;
  }

  const level = levelForXp(snapshot.xp);
  const unlocked = isCourseUnlocked(course, level);
  const lessons = courseLessons(catalog, course.id);
  const index = lessons.findIndex((l) => l.id === lesson.id);
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const req = lessonRequirements(catalog, snapshot, lesson.id);
  const questions = catalog.quizQuestions.filter((q) => q.lessonId === lesson.id).sort((a, b) => a.order - b.order);

  if (!unlocked) {
    return (
      <EmptyState
        icon={<Lock className="h-8 w-8 text-amber-300" />}
        headingLevel="h1"
        title={`${course.title} unlocks at level ${course.requiredLevel}`}
        description={`You are level ${level}. Keep earning XP in unlocked courses to open this building.`}
        action={<ButtonLink to={`/courses/${course.id}`} variant="secondary">Back to course</ButtonLink>}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
        <Link to="/courses" className="hover:text-slate-300">
          Courses
        </Link>{' '}
        /{' '}
        <Link to={`/courses/${course.id}`} className="hover:text-slate-300">
          {course.title}
        </Link>{' '}
        / <span className="text-slate-300">Lesson {index + 1}</span>
      </nav>

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={lesson.difficulty} />
          <Badge>
            <Clock className="h-3 w-3" aria-hidden /> {lesson.durationMinutes} min
          </Badge>
          {req.completed && (
            <Badge tone="green">
              <CircleCheck className="h-3 w-3" aria-hidden /> Completed {formatDate(snapshot.lessons[lesson.id])}
            </Badge>
          )}
        </div>
        <h1 className="mt-4 text-3xl md:text-4xl">{lesson.title}</h1>
        <p className="mt-3 text-lg text-slate-400">{lesson.summary}</p>
      </header>

      <article aria-label="Lesson content">
        <LessonBlocks blocks={lesson.blocks} />
      </article>

      {req.exercises.length > 0 && (
        <section aria-labelledby="practice-title" className="mt-12">
          <h2 id="practice-title" className="mb-4 text-xl">
            Practice
          </h2>
          <ul className="space-y-3">
            {req.exercises.map(({ exercise, done }) => (
              <li key={exercise.id} className="glass flex flex-wrap items-center gap-4 rounded-xl p-4">
                <Code2 className="h-5 w-5 text-cyan-300" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">{exercise.title}</p>
                  <p className="text-xs text-slate-500">
                    {exercise.checks.length} automated checks · +{exercise.xp} XP
                  </p>
                </div>
                {done && <Badge tone="green">Passed</Badge>}
                <ButtonLink to={`/practice/${exercise.id}`} variant={done ? 'secondary' : 'primary'} size="sm" icon={<ArrowRight className="h-3.5 w-3.5" />}>
                  {done ? 'Open again' : 'Start exercise'}
                </ButtonLink>
              </li>
            ))}
          </ul>
        </section>
      )}

      {questions.length > 0 && (
        <div className="mt-12">
          <Quiz lessonId={lesson.id} lessonTitle={lesson.title} questions={questions} record={snapshot.quizzes[lesson.id]} locked={!unlocked} />
        </div>
      )}

      <section aria-labelledby="complete-title" className="glass-strong mt-12 rounded-2xl p-5 sm:p-6">
        <h2 id="complete-title" className="text-lg">
          {req.completed ? 'Lesson complete' : 'Complete this lesson'}
        </h2>
        <ul className="mt-4 space-y-2 text-sm">
          {req.hasQuiz && (
            <li className="flex items-center gap-2">
              {req.quizPassed ? <CircleCheck className="h-4 w-4 text-emerald-300" aria-hidden /> : <CircleDashed className="h-4 w-4 text-slate-500" aria-hidden />}
              <span className={cn(req.quizPassed ? 'text-slate-300' : 'text-slate-400')}>Pass the knowledge check</span>
            </li>
          )}
          {req.exercises.map(({ exercise, done }) => (
            <li key={exercise.id} className="flex items-center gap-2">
              {done ? <CircleCheck className="h-4 w-4 text-emerald-300" aria-hidden /> : <CircleDashed className="h-4 w-4 text-slate-500" aria-hidden />}
              <span className={cn(done ? 'text-slate-300' : 'text-slate-400')}>Pass “{exercise.title}”</span>
            </li>
          ))}
        </ul>
        {completeLesson.isError && (
          <InlineAlert tone="error" className="mt-4" title="Couldn’t complete the lesson">
            {errorMessage(completeLesson.error)}
          </InlineAlert>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {req.completed ? (
            <span className="inline-flex items-center gap-2 text-sm text-emerald-200">
              <CircleCheck className="h-4 w-4" aria-hidden /> Completed — {lesson.xp} XP earned
            </span>
          ) : (
            <Button
              disabled={!req.ready}
              loading={completeLesson.isPending}
              onClick={() => completeLesson.mutate({ lessonId: lesson.id, title: lesson.title })}
              icon={<Sparkles className="h-4 w-4" />}
            >
              Complete lesson (+{lesson.xp} XP)
            </Button>
          )}
          {!req.ready && !req.completed && <span className="text-xs text-slate-500">Finish the items above to unlock completion.</span>}
        </div>
      </section>

      <nav aria-label="Lesson navigation" className="mt-10 flex flex-wrap justify-between gap-3">
        {prev ? (
          <ButtonLink to={`/courses/${course.id}/lessons/${prev.id}`} variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
            {prev.title}
          </ButtonLink>
        ) : (
          <span />
        )}
        {next ? (
          <ButtonLink to={`/courses/${course.id}/lessons/${next.id}`} variant="secondary">
            Next: {next.title} <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        ) : (
          <ButtonLink to={`/courses/${course.id}`} variant="secondary">
            Back to course overview
          </ButtonLink>
        )}
      </nav>
    </div>
  );
}
