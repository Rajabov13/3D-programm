import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState, PageLoader } from '@/components/ui/Feedback';
import { Select, Switch, TextArea, TextField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Panel } from '@/components/ui/Panel';
import { buildings } from '@/data/buildings';
import { useAdminMutation } from '@/features/admin/hooks';
import { useFullCatalog } from '@/features/content/hooks';
import type { Course, Lesson, TrackId } from '@/types';
import { slugify } from './AdminCoursesPage';

export default function AdminCourseEditPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { data: catalog, isLoading } = useFullCatalog();
  const original = catalog?.courses.find((c) => c.id === courseId);
  const [course, setCourse] = useState<Course | null>(null);
  const [newLesson, setNewLesson] = useState<{ title: string; id: string } | null>(null);
  const save = useAdminMutation((repo, c: Course) => repo.saveCourse(c), 'Course saved');
  const saveLesson = useAdminMutation((repo, l: Lesson) => repo.saveLesson(l));

  useEffect(() => {
    if (original) setCourse(original);
  }, [original]);

  if (isLoading) return <PageLoader />;
  if (!catalog || !original || !course) return <EmptyState title="Course not found" action={<Link to="/admin/courses" className="text-cyan-300">Back</Link>} />;
  const lessons = catalog.lessons.filter((l) => l.courseId === course.id).sort((a, b) => a.order - b.order);
  const set = (patch: Partial<Course>) => setCourse((c) => (c ? { ...c, ...patch } : c));
  const dirty = JSON.stringify(course) !== JSON.stringify(original);

  return (
    <div className="space-y-6">
      <Link to="/admin/courses" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All courses
      </Link>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(course);
        }}
      >
        <Panel className="space-y-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl">
              {course.title} <span className="font-mono text-xs text-slate-500">{course.id}</span>
            </h2>
            <div className="flex items-center gap-4">
              <Switch checked={course.published} onChange={(published) => set({ published })} label="Published" />
              <Button type="submit" loading={save.isPending} disabled={!dirty}>
                Save course
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Title" value={course.title} onChange={(e) => set({ title: e.target.value })} />
            <TextField label="Tagline" value={course.tagline} onChange={(e) => set({ tagline: e.target.value })} />
          </div>
          <TextArea label="Description" value={course.description} onChange={(e) => set({ description: e.target.value })} />
          <TextArea
            label="Learning objectives"
            hint="One per line."
            value={course.objectives.join('\n')}
            onChange={(e) => set({ objectives: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select label="Track" value={course.track} onChange={(e) => set({ track: e.target.value as TrackId })}>
              {['html', 'css', 'javascript', 'python', 'react'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
            <Select label="Building" value={course.buildingId} onChange={(e) => set({ buildingId: e.target.value as Course['buildingId'] })}>
              {buildings
                .filter((b) => b.kind === 'course')
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
            </Select>
            <TextField label="Required level" type="number" min={1} max={100} value={course.requiredLevel} onChange={(e) => set({ requiredLevel: Number(e.target.value) || 1 })} />
            <TextField label="Display order" type="number" value={course.order} onChange={(e) => set({ order: Number(e.target.value) || 0 })} />
            <TextField label="Estimated hours" type="number" min={0.5} step={0.5} value={course.estimatedHours} onChange={(e) => set({ estimatedHours: Number(e.target.value) || 1 })} />
            <div>
              <label htmlFor="accent" className="mb-1.5 block text-[13px] font-medium text-slate-200">
                Accent colour
              </label>
              <input id="accent" type="color" value={course.accent} onChange={(e) => set({ accent: e.target.value })} className="h-10 w-full cursor-pointer rounded-xl border border-white/10 bg-night-900" />
            </div>
          </div>
          <fieldset>
            <legend className="mb-2 text-[13px] font-medium text-slate-200">Recommended prerequisites</legend>
            <div className="flex flex-wrap gap-3">
              {catalog.courses
                .filter((c) => c.id !== course.id)
                .map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      className="accent-cyan-400"
                      checked={course.prerequisites.includes(c.id)}
                      onChange={(e) => set({ prerequisites: e.target.checked ? [...course.prerequisites, c.id] : course.prerequisites.filter((p) => p !== c.id) })}
                    />
                    {c.title}
                  </label>
                ))}
            </div>
          </fieldset>
        </Panel>
      </form>

      <Panel className="p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg">Lessons</h2>
          <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setNewLesson({ title: '', id: '' })}>
            Add lesson
          </Button>
        </div>
        <ol className="mt-4 space-y-2">
          {lessons.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.06] px-4 py-3">
              <span className="font-mono text-xs text-slate-500">{l.order}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">{l.title}</p>
                <p className="text-xs text-slate-500">
                  {catalog.exercises.filter((e) => e.lessonId === l.id).length} exercise(s) · {catalog.quizQuestions.filter((q) => q.lessonId === l.id).length} question(s) · {l.difficulty}
                </p>
              </div>
              <Switch checked={l.published} label={<span className="sr-only">Publish {l.title}</span>} onChange={(published) => saveLesson.mutate({ ...l, published })} />
              <Button variant="ghost" size="icon" aria-label={`Edit ${l.title}`} onClick={() => navigate(`/admin/lessons/${l.id}`)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </li>
          ))}
          {lessons.length === 0 && <p className="text-sm text-slate-400">No lessons yet.</p>}
        </ol>
      </Panel>

      <Modal
        open={Boolean(newLesson)}
        onClose={() => setNewLesson(null)}
        title="Add lesson"
        footer={
          <Button
            disabled={!newLesson?.title || !newLesson.id || catalog.lessons.some((l) => l.id === newLesson.id)}
            loading={saveLesson.isPending}
            onClick={async () => {
              if (!newLesson) return;
              const lesson: Lesson = {
                id: newLesson.id,
                courseId: course.id,
                order: lessons.length + 1,
                title: newLesson.title,
                summary: '',
                difficulty: 'beginner',
                durationMinutes: 10,
                xp: 20,
                quizXp: 15,
                blocks: [{ type: 'text', md: 'Write the lesson here.' }],
                published: false,
              };
              await saveLesson.mutateAsync(lesson);
              navigate(`/admin/lessons/${lesson.id}`);
            }}
          >
            Create lesson
          </Button>
        }
      >
        <div className="space-y-4">
          <TextField label="Title" value={newLesson?.title ?? ''} onChange={(e) => setNewLesson({ title: e.target.value, id: `${course.id}-${slugify(e.target.value)}`.slice(0, 60) })} />
          <TextField label="ID" value={newLesson?.id ?? ''} onChange={(e) => setNewLesson((n) => (n ? { ...n, id: slugify(e.target.value) } : n))} />
        </div>
      </Modal>
    </div>
  );
}
