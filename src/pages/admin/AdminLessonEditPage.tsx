import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState, PageLoader } from '@/components/ui/Feedback';
import { Select, Switch, TextArea, TextField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Panel } from '@/components/ui/Panel';
import { JsonField, validateBlocks } from '@/features/admin/JsonField';
import { useAdminMutation, usePrivateContent } from '@/features/admin/hooks';
import { useFullCatalog } from '@/features/content/hooks';
import { LessonBlocks } from '@/features/learning/LessonBlocks';
import type { Difficulty, Exercise, Lesson, QuizKey, QuizQuestion } from '@/types';
import type { ExerciseMode } from '@shared/checks';
import { slugify } from './AdminCoursesPage';

interface QuizDraft {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export default function AdminLessonEditPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { data: catalog, isLoading } = useFullCatalog();
  const priv = usePrivateContent();
  const original = catalog?.lessons.find((l) => l.id === lessonId);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<QuizDraft[]>([]);
  const [preview, setPreview] = useState(false);
  const [newExercise, setNewExercise] = useState<{ title: string; id: string; mode: ExerciseMode } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const save = useAdminMutation((repo, input: { lesson: Lesson; questions: QuizQuestion[]; keys: QuizKey[] }) => repo.saveLesson(input.lesson, { questions: input.questions, keys: input.keys }), 'Lesson saved');
  const remove = useAdminMutation((repo, id: string) => repo.deleteLesson(id), 'Lesson deleted');
  const createExercise = useAdminMutation((repo, e: Exercise) => repo.saveExercise(e, { exerciseId: e.id, files: e.starter }));

  useEffect(() => {
    if (!original || !catalog || !priv.data) return;
    setLesson(original);
    setQuiz(
      catalog.quizQuestions
        .filter((q) => q.lessonId === original.id)
        .sort((a, b) => a.order - b.order)
        .map((q) => ({ id: q.id, prompt: q.prompt, options: q.options, explanation: q.explanation, correctIndex: priv.data!.quizKeys.find((k) => k.questionId === q.id)?.correctIndex ?? 0 })),
    );
  }, [original, catalog, priv.data]);

  if (isLoading || priv.isLoading) return <PageLoader />;
  if (!catalog || !original || !lesson) return <EmptyState title="Lesson not found" action={<Link to="/admin/courses" className="text-cyan-300">Back</Link>} />;
  const set = (patch: Partial<Lesson>) => setLesson((l) => (l ? { ...l, ...patch } : l));
  const exercises = catalog.exercises.filter((e) => e.lessonId === lesson.id).sort((a, b) => a.order - b.order);
  const quizValid = quiz.every((q) => q.prompt.trim() && q.options.length >= 2 && q.correctIndex < q.options.length);

  const submit = () => {
    const questions: QuizQuestion[] = quiz.map((q, i) => ({ id: q.id, lessonId: lesson.id, order: i + 1, prompt: q.prompt, options: q.options, explanation: q.explanation }));
    const keys: QuizKey[] = quiz.map((q) => ({ questionId: q.id, correctIndex: q.correctIndex }));
    save.mutate({ lesson, questions, keys });
  };

  return (
    <div className="space-y-6">
      <Link to={`/admin/courses/${lesson.courseId}`} className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to course
      </Link>
      <Panel className="space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl">
            {lesson.title} <span className="font-mono text-xs text-slate-500">{lesson.id}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Switch checked={lesson.published} onChange={(published) => set({ published })} label="Published" />
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} icon={<Trash2 className="h-3.5 w-3.5" />}>
              Delete
            </Button>
            <Button onClick={submit} loading={save.isPending} disabled={!quizValid}>
              Save lesson & quiz
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Title" value={lesson.title} onChange={(e) => set({ title: e.target.value })} />
          <TextField label="Summary" value={lesson.summary} onChange={(e) => set({ summary: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Select label="Difficulty" value={lesson.difficulty} onChange={(e) => set({ difficulty: e.target.value as Difficulty })}>
            {['beginner', 'intermediate', 'advanced'].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Select>
          <TextField label="Minutes" type="number" min={1} value={lesson.durationMinutes} onChange={(e) => set({ durationMinutes: Number(e.target.value) || 1 })} />
          <TextField label="Lesson XP" type="number" min={0} max={500} value={lesson.xp} onChange={(e) => set({ xp: Number(e.target.value) || 0 })} />
          <TextField label="Quiz XP" type="number" min={0} max={500} value={lesson.quizXp} onChange={(e) => set({ quizXp: Number(e.target.value) || 0 })} />
          <TextField label="Order" type="number" value={lesson.order} onChange={(e) => set({ order: Number(e.target.value) || 0 })} />
        </div>
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" icon={<Eye className="h-4 w-4" />} onClick={() => setPreview((p) => !p)}>
            {preview ? 'Edit content' : 'Preview content'}
          </Button>
        </div>
        {preview ? (
          <div className="rounded-xl border border-white/[0.08] p-5">
            <LessonBlocks blocks={lesson.blocks} />
          </div>
        ) : (
          <JsonField
            label="Content blocks"
            description='Array of blocks: {"type":"text","md":"…"}, {"type":"heading","text":"…"}, {"type":"code","language":"html","code":"…"}, {"type":"callout","variant":"tip","md":"…"}'
            value={lesson.blocks}
            onChange={(blocks) => set({ blocks })}
            validate={validateBlocks}
            path={`file:///admin/${lesson.id}/blocks.json`}
          />
        )}
      </Panel>

      <Panel className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg">Knowledge check</h2>
          <Button
            size="sm"
            variant="secondary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setQuiz((q) => [...q, { id: `${lesson.id}-q${Date.now().toString(36)}`, prompt: '', options: ['', ''], correctIndex: 0, explanation: '' }])}
          >
            Add question
          </Button>
        </div>
        <p className="text-xs text-slate-500">Answer keys are stored separately and are never sent to learners. Learners pass with ≥ 60% correct.</p>
        {quiz.map((q, i) => (
          <fieldset key={q.id} className="space-y-3 rounded-xl border border-white/[0.08] p-4">
            <legend className="px-1 text-sm font-medium text-slate-200">Question {i + 1}</legend>
            <TextField label="Prompt" value={q.prompt} onChange={(e) => setQuiz((all) => all.map((x) => (x.id === q.id ? { ...x, prompt: e.target.value } : x)))} />
            <TextArea
              label="Options"
              hint="One per line (2–8)."
              value={q.options.join('\n')}
              onChange={(e) => setQuiz((all) => all.map((x) => (x.id === q.id ? { ...x, options: e.target.value.split('\n').slice(0, 8) } : x)))}
            />
            <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
              <Select label="Correct option" value={q.correctIndex} onChange={(e) => setQuiz((all) => all.map((x) => (x.id === q.id ? { ...x, correctIndex: Number(e.target.value) } : x)))}>
                {q.options.map((o, oi) => (
                  <option key={oi} value={oi}>
                    {oi + 1}. {o.slice(0, 40) || '(empty)'}
                  </option>
                ))}
              </Select>
              <TextField label="Explanation" value={q.explanation} onChange={(e) => setQuiz((all) => all.map((x) => (x.id === q.id ? { ...x, explanation: e.target.value } : x)))} />
            </div>
            <Button variant="ghost" size="sm" onClick={() => setQuiz((all) => all.filter((x) => x.id !== q.id))} icon={<Trash2 className="h-3.5 w-3.5" />}>
              Remove question
            </Button>
          </fieldset>
        ))}
      </Panel>

      <Panel className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg">Exercises</h2>
          <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setNewExercise({ title: '', id: '', mode: 'web' })}>
            Add exercise
          </Button>
        </div>
        <ul className="mt-4 space-y-2">
          {exercises.map((e) => (
            <li key={e.id} className="flex items-center gap-3 rounded-xl border border-white/[0.06] px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">{e.title}</p>
                <p className="text-xs text-slate-500">
                  {e.mode} · {e.checks.length} checks · {e.xp} XP · {e.published ? 'published' : 'draft'}
                </p>
              </div>
              <Button variant="ghost" size="icon" aria-label={`Edit ${e.title}`} onClick={() => navigate(`/admin/exercises/${e.id}`)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </li>
          ))}
          {exercises.length === 0 && <p className="text-sm text-slate-400">No exercises yet.</p>}
        </ul>
      </Panel>

      <Modal
        open={Boolean(newExercise)}
        onClose={() => setNewExercise(null)}
        title="Add exercise"
        footer={
          <Button
            loading={createExercise.isPending}
            disabled={!newExercise?.title || !newExercise.id || catalog.exercises.some((x) => x.id === newExercise.id)}
            onClick={async () => {
              if (!newExercise) return;
              const starter = { web: { html: '<h1>Hello</h1>\n', css: '', js: '' }, console: { js: '' }, python: { py: '' }, react: { jsx: '', css: '' } }[newExercise.mode];
              const exercise: Exercise = {
                id: newExercise.id,
                lessonId: lesson.id,
                order: exercises.length + 1,
                title: newExercise.title,
                instructions: 'Describe the task here.',
                mode: newExercise.mode,
                starter,
                hints: [],
                xp: 30,
                checks: [],
                published: false,
              };
              await createExercise.mutateAsync(exercise);
              navigate(`/admin/exercises/${exercise.id}`);
            }}
          >
            Create exercise
          </Button>
        }
      >
        <div className="space-y-4">
          <TextField label="Title" value={newExercise?.title ?? ''} onChange={(e) => setNewExercise((n) => (n ? { ...n, title: e.target.value, id: `${lesson.id}-${slugify(e.target.value)}`.slice(0, 60) } : n))} />
          <TextField label="ID" value={newExercise?.id ?? ''} onChange={(e) => setNewExercise((n) => (n ? { ...n, id: slugify(e.target.value) } : n))} />
          <Select label="Mode" value={newExercise?.mode ?? 'web'} onChange={(e) => setNewExercise((n) => (n ? { ...n, mode: e.target.value as ExerciseMode } : n))}>
            <option value="web">HTML/CSS/JS with live preview</option>
            <option value="console">JavaScript console</option>
            <option value="python">Python</option>
            <option value="react">React (JSX)</option>
          </Select>
        </div>
      </Modal>
      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this lesson?"
        description="Its exercises and knowledge check are deleted too. Consider unpublishing instead."
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
                await remove.mutateAsync(lesson.id);
                navigate(`/admin/courses/${lesson.courseId}`);
              }}
            >
              Delete lesson
            </Button>
          </>
        }
      />
    </div>
  );
}
