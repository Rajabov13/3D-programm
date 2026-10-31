import { useEffect, useState } from 'react';
import { CircleCheck, CircleX, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { InlineAlert } from '@/components/ui/Feedback';
import { useProgressActions } from '@/features/progress/hooks';
import { errorMessage } from '@/lib/errors';
import { cn } from '@/lib/cn';
import type { QuizQuestion, QuizRecord, QuizSubmissionResult } from '@/types';
import { QUIZ_PASS_RATIO } from '@/features/progress/engine';

export function Quiz({
  lessonId,
  lessonTitle,
  questions,
  record,
  locked,
}: {
  lessonId: string;
  lessonTitle: string;
  questions: QuizQuestion[];
  record?: QuizRecord;
  locked: boolean;
}) {
  const [answers, setAnswers] = useState<Array<number | null>>(() => questions.map(() => null));
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);
  const { submitQuiz } = useProgressActions();

  useEffect(() => {
    setAnswers(questions.map(() => null));
    setResult(null);
  }, [lessonId, questions]);

  const complete = answers.every((a) => a !== null);
  const submit = async () => {
    if (!complete) return;
    try {
      const r = await submitQuiz.mutateAsync({ lessonId, answers: answers as number[], title: lessonTitle });
      setResult(r);
    } catch {
      /* error rendered from mutation state */
    }
  };
  const retry = () => {
    setAnswers(questions.map(() => null));
    setResult(null);
    submitQuiz.reset();
  };

  const needed = Math.ceil(questions.length * QUIZ_PASS_RATIO);

  return (
    <section aria-labelledby="quiz-title" className="glass rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">Knowledge check</p>
          <h2 id="quiz-title" className="text-lg">
            Test your understanding
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Answer {questions.length} questions. Get {needed} or more right to pass.
          </p>
        </div>
        {record && (
          <span className={cn('rounded-full border px-2.5 py-1 text-xs', record.passed ? 'border-emerald-300/30 text-emerald-200' : 'border-white/10 text-slate-400')}>
            Best: {record.bestScore}/{record.total} {record.passed ? '· passed' : ''}
          </span>
        )}
      </div>

      <form
        className="mt-6 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        {questions.map((q, qi) => {
          const graded = result?.results.find((r) => r.questionId === q.id);
          return (
            <fieldset key={q.id} className="space-y-2.5" disabled={Boolean(result) || submitQuiz.isPending}>
              <legend className="mb-1 text-[15px] font-medium text-white">
                <span className="mr-2 font-mono text-xs text-slate-500">{qi + 1}.</span>
                {q.prompt}
              </legend>
              {q.options.map((option, oi) => {
                const selected = answers[qi] === oi;
                const isCorrect = graded?.correctIndex === oi;
                const wrongPick = graded && selected && !graded.correct;
                return (
                  <label
                    key={oi}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-cyan-300/70',
                      selected ? 'border-cyan-300/50 bg-cyan-300/[0.07] text-white' : 'border-white/[0.08] text-slate-300 hover:border-white/20',
                      isCorrect && 'border-emerald-300/50 bg-emerald-400/[0.08]',
                      wrongPick && 'border-rose-300/50 bg-rose-400/[0.08]',
                    )}
                  >
                    <input
                      type="radio"
                      name={`${q.id}`}
                      value={oi}
                      checked={selected}
                      onChange={() => setAnswers((a) => a.map((x, i) => (i === qi ? oi : x)))}
                      className="mt-0.5 h-4 w-4 accent-cyan-400"
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
              {graded && (
                <p className={cn('flex items-start gap-2 text-[13px]', graded.correct ? 'text-emerald-200' : 'text-rose-200')}>
                  {graded.correct ? <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> : <CircleX className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
                  <span>
                    {graded.correct ? 'Correct. ' : 'Not quite. '}
                    {(graded.correct || result?.passed) && graded.explanation}
                  </span>
                </p>
              )}
            </fieldset>
          );
        })}

        {submitQuiz.isError && <InlineAlert tone="error" title="Couldn’t submit your answers">{errorMessage(submitQuiz.error)}</InlineAlert>}

        {result && (
          <InlineAlert tone={result.passed ? 'success' : 'warning'} title={result.passed ? `Passed — ${result.score}/${result.total}` : `${result.score}/${result.total} — not passed yet`}>
            {result.passed
              ? result.award.xpAwarded > 0
                ? `+${result.award.xpAwarded} XP earned.`
                : 'You already earned XP for this knowledge check.'
              : 'Review the lesson and try again. Explanations are shown for questions you answered correctly.'}
          </InlineAlert>
        )}

        {locked ? (
          <InlineAlert tone="warning" title="Course locked">Reach the required level to submit knowledge checks in this course.</InlineAlert>
        ) : result ? (
          <Button type="button" variant="secondary" onClick={retry} icon={<RotateCcw className="h-4 w-4" />}>
            Try again
          </Button>
        ) : (
          <Button type="submit" disabled={!complete} loading={submitQuiz.isPending}>
            Submit answers
          </Button>
        )}
      </form>
    </section>
  );
}
