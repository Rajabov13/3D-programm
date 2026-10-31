import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CircleCheck, Lightbulb, Lock, TriangleAlert } from 'lucide-react';
import { evaluateChecks, requiresOutput, summarizeResults, type CheckResult } from '@shared/checks';
import { Markdown } from '@/components/Markdown';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState, ErrorState, InlineAlert, PageLoader } from '@/components/ui/Feedback';
import { Workspace } from '@/editor/Workspace';
import { filesForMode, MODE_LABELS } from '@/editor/files';
import { useRunner } from '@/editor/useRunner';
import { ChecksList } from '@/features/learning/ChecksList';
import { isCourseUnlocked, lessonExercises, levelForXp } from '@/features/progress/engine';
import { useProgress, useProgressActions } from '@/features/progress/hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useDraft } from '@/hooks/useDraft';
import { errorMessage } from '@/lib/errors';
import type { Exercise, ExerciseSubmissionResult } from '@/types';

const parseHtml = (html: string) => new DOMParser().parseFromString(html, 'text/html');

interface CheckState {
  client: CheckResult[];
  passed: boolean;
  runProblem?: string;
  saved?: ExerciseSubmissionResult;
  saveError?: string;
  submitting?: boolean;
}

export default function ExercisePage() {
  const { exerciseId } = useParams();
  const { catalog, snapshot, isLoading, error, refetch } = useProgress();
  const exercise = catalog?.exercises.find((e) => e.id === exerciseId);
  useDocumentTitle(exercise?.title ?? 'Exercise');

  if (isLoading) return <PageLoader label="Preparing your workspace…" />;
  if (error || !catalog || !snapshot) return <ErrorState className="m-6" error={error} title="Couldn’t load this exercise" onRetry={() => void refetch()} />;
  if (!exercise) {
    return <EmptyState className="m-6" headingLevel="h1"
        title="Exercise not found" description="It may have been unpublished or moved." action={<ButtonLink to="/courses">All courses</ButtonLink>} />;
  }
  return <ExerciseWorkspace key={exercise.id} exercise={exercise} />;
}

function ExerciseWorkspace({ exercise }: { exercise: Exercise }) {
  const { catalog, snapshot } = useProgress();
  const { submitExercise } = useProgressActions();
  const lesson = catalog!.lessons.find((l) => l.id === exercise.lessonId)!;
  const course = catalog!.courses.find((c) => c.id === lesson.courseId)!;
  const unlocked = isCourseUnlocked(course, levelForXp(snapshot!.xp));
  const done = Boolean(snapshot!.exercises[exercise.id]);
  const siblings = lessonExercises(catalog!, lesson.id);
  const nextExercise = siblings[siblings.findIndex((e) => e.id === exercise.id) + 1];

  const draft = useDraft(`exercise.${exercise.id}`, filesForMode(exercise.mode, exercise.starter));
  const runner = useRunner(exercise.mode);
  const [stdin, setStdin] = useState('');
  const [hintsShown, setHintsShown] = useState(0);
  const [checkState, setCheckState] = useState<CheckState | null>(null);
  const [checking, setChecking] = useState(false);
  const [checksSignal, setChecksSignal] = useState(0);

  const run = useCallback(() => {
    void runner.run(draft.files, { stdin });
  }, [runner, draft.files, stdin]);

  const check = useCallback(async () => {
    if (checking) return;
    setChecking(true);
    try {
      const runtimeChecks = exercise.checks.filter((c) => c.type === 'dom_runtime');
      const needsOutput = requiresOutput(exercise.checks);
      const outcome = await runner.run(draft.files, { runtimeChecks, stdin });
      const stdout = needsOutput && outcome.status !== 'unavailable' ? (outcome.stdout ?? '') : undefined;
      const client = evaluateChecks(exercise.checks, { files: draft.files, stdout, runtime: outcome.runtime, parseHtml, environment: 'client' });
      const { passed } = summarizeResults(client, 'client');
      const runProblem =
        outcome.status === 'unavailable'
          ? (outcome.message ?? 'Your code could not be executed.')
          : outcome.status === 'timeout'
            ? 'Your program was stopped because it ran too long.'
            : undefined;
      setCheckState({ client, passed, runProblem, submitting: passed && unlocked });
      setChecksSignal((n) => n + 1);
      if (passed && unlocked) {
        try {
          const saved = await submitExercise.mutateAsync({ exerciseId: exercise.id, files: draft.files, evaluation: { passed, results: client }, title: exercise.title });
          setCheckState((s) => (s ? { ...s, saved, submitting: false } : s));
        } catch (e) {
          setCheckState((s) => (s ? { ...s, submitting: false, saveError: errorMessage(e) } : s));
        }
      }
    } finally {
      setChecking(false);
    }
  }, [checking, exercise, runner, draft.files, stdin, unlocked, submitExercise]);

  const results = checkState?.client;

  const checksPanel = (
    <div className="space-y-4 p-4">
      {!checkState ? (
        <p className="text-sm text-slate-400">Press <strong className="text-slate-200">Check</strong> to run the automated checks for this task.</p>
      ) : (
        <>
          {checkState.runProblem && (
            <InlineAlert tone="error" title="Your code couldn’t be fully checked" icon={<TriangleAlert className="h-4 w-4" />}>
              {checkState.runProblem}
            </InlineAlert>
          )}
          {checkState.passed ? (
            <InlineAlert tone="success" title="All checks passed in your browser" icon={<CircleCheck className="h-4 w-4" />}>
              {checkState.submitting && 'Saving…'}
              {checkState.saved &&
                (checkState.saved.award.alreadyCompleted
                  ? 'Saved in this browser. Already completed — no additional XP.'
                  : `Saved in this browser · +${checkState.saved.award.xpAwarded} XP`)}
              {!unlocked && ' This course is locked for your level, so the result was not saved.'}
            </InlineAlert>
          ) : (
            <InlineAlert tone="warning" title={`${checkState.client.filter((r) => r.status === 'pass').length} of ${checkState.client.length} checks passing`}>
              Keep going — fix the items marked below and press Check again.
            </InlineAlert>
          )}
          {checkState.saveError && (
            <InlineAlert tone="error" title="Couldn’t save your result">
              {checkState.saveError}
            </InlineAlert>
          )}
          <ChecksList checks={exercise.checks} results={results} />
          {checkState.saved?.passed && (
            <div className="flex flex-wrap gap-2 pt-2">
              {nextExercise ? (
                <ButtonLink to={`/practice/${nextExercise.id}`} size="sm" icon={<ArrowRight className="h-3.5 w-3.5" />}>
                  Next exercise
                </ButtonLink>
              ) : (
                <ButtonLink to={`/courses/${course.id}/lessons/${lesson.id}`} size="sm" icon={<ArrowRight className="h-3.5 w-3.5" />}>
                  Back to the lesson
                </ButtonLink>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );

  const sidebar = (
    <div className="h-full overflow-y-auto bg-night-900/60 p-5">
      <Link to={`/courses/${course.id}/lessons/${lesson.id}`} className="focus-ring inline-flex items-center gap-1.5 rounded text-xs text-slate-400 hover:text-white">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> {course.title} · {lesson.title}
      </Link>
      <h1 className="mt-4 text-xl">{exercise.title}</h1>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Badge tone="cyan">{MODE_LABELS[exercise.mode]}</Badge>
        <Badge>+{exercise.xp} XP</Badge>
        {done && (
          <Badge tone="green">
            <CircleCheck className="h-3 w-3" aria-hidden /> Completed
          </Badge>
        )}
        {!unlocked && (
          <Badge tone="amber">
            <Lock className="h-3 w-3" aria-hidden /> Locked
          </Badge>
        )}
      </div>
      <Markdown source={exercise.instructions} className="mt-4 text-sm" />
      <section className="mt-6" aria-labelledby="requirements-title">
        <h2 id="requirements-title" className="mb-3 text-sm text-white">
          Requirements
        </h2>
        <ChecksList checks={exercise.checks} results={results} />
      </section>
      {exercise.hints.length > 0 && (
        <section className="mt-6" aria-labelledby="hints-title">
          <h2 id="hints-title" className="mb-2 text-sm text-white">
            Hints
          </h2>
          <ol className="space-y-2">
            {exercise.hints.slice(0, hintsShown).map((hint, i) => (
              <li key={i} className="flex gap-2 rounded-lg border border-amber-300/15 bg-amber-300/[0.05] p-3 text-sm">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />
                <Markdown source={hint} className="text-sm [&_p]:my-0" />
              </li>
            ))}
          </ol>
          {hintsShown < exercise.hints.length && (
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setHintsShown((n) => n + 1)} icon={<Lightbulb className="h-3.5 w-3.5" />}>
              {hintsShown === 0 ? 'Show a hint' : 'Show another hint'}
            </Button>
          )}
        </section>
      )}
    </div>
  );

  return (
    <Workspace
      mode={exercise.mode}
      files={draft.files}
      onFileChange={draft.setFile}
      runner={runner}
      onRun={run}
      onReset={() => {
        draft.reset();
        setCheckState(null);
        runner.clear();
      }}
      onCheck={() => void check()}
      checking={checking}
      checksPanel={checksPanel}
      checksSignal={checksSignal}
      sidebar={sidebar}
      stdin={stdin}
      onStdinChange={setStdin}
      storageKey={`exercise-${exercise.id}`}
      toolbarStart={
        <span className="hidden truncate text-sm font-medium text-slate-300 lg:inline">
          {exercise.title}
        </span>
      }
    />
  );
}
