import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FlaskConical, Trash2 } from 'lucide-react';
import { evaluateChecks, requiresOutput, summarizeResults, validateCheckSpecs, type CheckResult, type ExerciseFiles, type ExerciseMode, type FileKey } from '@shared/checks';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/Button';
import { EmptyState, InlineAlert, PageLoader } from '@/components/ui/Feedback';
import { Select, Switch, TextArea, TextField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Panel } from '@/components/ui/Panel';
import { CodeEditor, FallbackEditor } from '@/editor/CodeEditor';
import { ConsolePanel } from '@/editor/ConsolePanel';
import { filesForMode, MODE_FILES } from '@/editor/files';
import { PreviewFrame } from '@/editor/PreviewFrame';
import { useRunner } from '@/editor/useRunner';
import { JsonField } from '@/features/admin/JsonField';
import { useAdminMutation, usePrivateContent } from '@/features/admin/hooks';
import { useFullCatalog } from '@/features/content/hooks';
import { ChecksList } from '@/features/learning/ChecksList';
import { cn } from '@/lib/cn';
import type { Exercise, ExerciseSolution } from '@/types';

const parseHtml = (html: string) => new DOMParser().parseFromString(html, 'text/html');

function FilesEditor({ mode, files, onChange, label, id }: { mode: ExerciseMode; files: ExerciseFiles; onChange: (f: ExerciseFiles) => void; label: string; id: string }) {
  const tabs = MODE_FILES[mode];
  const [active, setActive] = useState<FileKey>(tabs[0].key);
  const current = tabs.find((t) => t.key === active) ?? tabs[0];
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-medium text-slate-200">{label}</p>
      <div className="overflow-hidden rounded-xl border border-white/10">
        <div role="tablist" aria-label={`${label} files`} className="flex gap-1 border-b border-white/[0.06] bg-night-900 px-1.5">
          {tabs.map((t) => (
            <button key={t.key} role="tab" type="button" aria-selected={t.key === current.key} onClick={() => setActive(t.key)} className={cn('focus-ring my-1 rounded-md px-3 py-1 font-mono text-xs', t.key === current.key ? 'bg-white/10 text-white' : 'text-slate-500')}>
              {t.name}
            </button>
          ))}
        </div>
        <div className="h-64">
          <ErrorBoundary fallback={() => <FallbackEditor value={files[current.key] ?? ''} onChange={(v) => onChange({ ...files, [current.key]: v })} ariaLabel={`${label} ${current.name}`} />}>
            <CodeEditor
              key={`${id}-${current.key}`}
              path={`file:///admin/${id}/${current.name}`}
              language={current.language}
              value={files[current.key] ?? ''}
              onChange={(v) => onChange({ ...files, [current.key]: v })}
              ariaLabel={`${label} — ${current.name}`}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

export default function AdminExerciseEditPage() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const { data: catalog, isLoading } = useFullCatalog();
  const priv = usePrivateContent();
  const original = catalog?.exercises.find((e) => e.id === exerciseId);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [solution, setSolution] = useState<ExerciseFiles>({});
  const [validation, setValidation] = useState<{ solution: CheckResult[]; solutionPassed: boolean; starterFails: boolean; runProblem?: string } | null>(null);
  const [validating, setValidating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const save = useAdminMutation((repo, input: { exercise: Exercise; solution: ExerciseSolution }) => repo.saveExercise(input.exercise, input.solution), 'Exercise saved');
  const remove = useAdminMutation((repo, id: string) => repo.deleteExercise(id), 'Exercise deleted');
  const runner = useRunner(exercise?.mode ?? 'web');

  useEffect(() => {
    if (!original) return;
    setExercise(original);
    setSolution(priv.data?.solutions.find((s) => s.exerciseId === original.id)?.files ?? original.starter);
  }, [original, priv.data]);

  if (isLoading || priv.isLoading) return <PageLoader />;
  if (!catalog || !original || !exercise) return <EmptyState title="Exercise not found" action={<Link to="/admin/courses" className="text-cyan-300">Back</Link>} />;
  const set = (patch: Partial<Exercise>) => setExercise((e) => (e ? { ...e, ...patch } : e));
  const checksValid = validateCheckSpecs(exercise.checks);

  const evaluate = async (files: ExerciseFiles) => {
    const outcome = await runner.run(files, { runtimeChecks: exercise.checks.filter((c) => c.type === 'dom_runtime') });
    const stdout = requiresOutput(exercise.checks) && outcome.status !== 'unavailable' ? (outcome.stdout ?? '') : undefined;
    const results = evaluateChecks(exercise.checks, { files, stdout, runtime: outcome.runtime, parseHtml, environment: 'client' });
    return { results, passed: summarizeResults(results, 'client').passed, problem: outcome.status === 'unavailable' ? outcome.message : undefined };
  };

  const validate = async () => {
    setValidating(true);
    try {
      const starter = await evaluate(filesForMode(exercise.mode, exercise.starter));
      const sol = await evaluate(filesForMode(exercise.mode, solution));
      setValidation({ solution: sol.results, solutionPassed: sol.passed, starterFails: !starter.passed, runProblem: sol.problem ?? starter.problem });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link to={`/admin/lessons/${exercise.lessonId}`} className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to lesson
      </Link>
      <Panel className="space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl">
            {exercise.title} <span className="font-mono text-xs text-slate-500">{exercise.id}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Switch checked={exercise.published} onChange={(published) => set({ published })} label="Published" />
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} icon={<Trash2 className="h-3.5 w-3.5" />}>
              Delete
            </Button>
            <Button
              loading={save.isPending}
              disabled={!checksValid.ok}
              onClick={() => save.mutate({ exercise: { ...exercise, starter: filesForMode(exercise.mode, exercise.starter) }, solution: { exerciseId: exercise.id, files: filesForMode(exercise.mode, solution) } })}
            >
              Save exercise
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <TextField wrapperClassName="md:col-span-2" label="Title" value={exercise.title} onChange={(e) => set({ title: e.target.value })} />
          <Select label="Mode" value={exercise.mode} onChange={(e) => set({ mode: e.target.value as ExerciseMode })}>
            <option value="web">Web preview</option>
            <option value="console">JavaScript console</option>
            <option value="python">Python</option>
            <option value="react">React</option>
          </Select>
          <TextField label="XP" type="number" min={0} max={500} value={exercise.xp} onChange={(e) => set({ xp: Number(e.target.value) || 0 })} />
        </div>
        <TextArea label="Instructions (Markdown)" className="min-h-[140px] font-mono text-[13px]" value={exercise.instructions} onChange={(e) => set({ instructions: e.target.value })} />
        <TextArea label="Hints" hint="One per line; revealed one at a time." value={exercise.hints.join('\n')} onChange={(e) => set({ hints: e.target.value.split('\n').filter((h) => h.trim()) })} />
        <div className="grid gap-5 xl:grid-cols-2">
          <FilesEditor mode={exercise.mode} files={exercise.starter} onChange={(starter) => set({ starter })} label="Starter code (shown to learners)" id={`${exercise.id}-starter`} />
          <FilesEditor mode={exercise.mode} files={solution} onChange={setSolution} label="Reference solution (admins only)" id={`${exercise.id}-solution`} />
        </div>
        <JsonField
          label="Checks"
          description="Types: source_includes, source_regex, source_not_regex, html_element, css_declaration, output_equals, output_includes, dom_runtime. See docs/ARCHITECTURE.md."
          value={exercise.checks}
          onChange={(checks) => set({ checks })}
          validate={(v) => {
            const r = validateCheckSpecs(v);
            return r.ok ? [] : r.errors;
          }}
          path={`file:///admin/${exercise.id}/checks.json`}
          height={300}
        />
      </Panel>

      <Panel className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg">Validate</h2>
            <p className="text-sm text-slate-400">Runs the starter and the solution through the same sandbox learners use.</p>
          </div>
          <Button onClick={() => void validate()} loading={validating} disabled={!checksValid.ok} icon={<FlaskConical className="h-4 w-4" />}>
            Validate solution
          </Button>
        </div>
        {validation && (
          <div className="space-y-3">
            {validation.runProblem && <InlineAlert tone="error">{validation.runProblem}</InlineAlert>}
            <InlineAlert tone={validation.solutionPassed ? 'success' : 'error'} title={validation.solutionPassed ? 'The solution passes every check' : 'The solution fails some checks'} />
            <InlineAlert tone={validation.starterFails ? 'success' : 'warning'} title={validation.starterFails ? 'The starter code does not pass (good)' : 'The starter code already passes — tighten the checks'} />
            <ChecksList checks={exercise.checks} results={validation.solution} />
          </div>
        )}
        <div className="grid h-72 gap-3 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-white/10">
            {exercise.mode === 'web' || exercise.mode === 'react' ? (
              <PreviewFrame ref={runner.previewRef} doc={runner.preview?.doc ?? null} runId={runner.preview?.runId ?? null} onConsole={runner.push} title="Validation preview" />
            ) : (
              <p className="p-4 text-sm text-slate-500">No preview for {exercise.mode} exercises.</p>
            )}
          </div>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <ConsolePanel entries={runner.entries} onClear={runner.clear} emptyHint="Output from validation runs appears here." />
          </div>
        </div>
      </Panel>
      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this exercise?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={remove.isPending}
              onClick={async () => {
                await remove.mutateAsync(exercise.id);
                navigate(`/admin/lessons/${exercise.lessonId}`);
              }}
            >
              Delete
            </Button>
          </>
        }
      />
    </div>
  );
}
