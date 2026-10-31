import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ErrorState, PageLoader } from '@/components/ui/Feedback';
import { Select, Switch, TextField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Panel } from '@/components/ui/Panel';
import { buildings } from '@/data/buildings';
import { useAdminMutation } from '@/features/admin/hooks';
import { useFullCatalog } from '@/features/content/hooks';
import type { Course, TrackId } from '@/types';

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

export default function AdminCoursesPage() {
  const { data: catalog, isLoading, error, refetch } = useFullCatalog();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ title: '', id: '', track: 'html' as TrackId, buildingId: 'html-academy' as Course['buildingId'] });
  const [deleting, setDeleting] = useState<Course | null>(null);
  const save = useAdminMutation((repo, c: Course) => repo.saveCourse(c));
  const remove = useAdminMutation((repo, id: string) => repo.deleteCourse(id), 'Course deleted');

  if (isLoading) return <PageLoader />;
  if (error || !catalog) return <ErrorState error={error} onRetry={() => void refetch()} />;

  const create = async () => {
    const course: Course = {
      id: draft.id,
      title: draft.title,
      tagline: '',
      description: '',
      track: draft.track,
      objectives: [],
      prerequisites: [],
      requiredLevel: 1,
      buildingId: draft.buildingId,
      accent: '#5ce1ff',
      estimatedHours: 1,
      order: catalog.courses.length + 1,
      published: false,
    };
    await save.mutateAsync(course);
    setCreating(false);
    navigate(`/admin/courses/${course.id}`);
  };
  const idTaken = catalog.courses.some((c) => c.id === draft.id);

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-3">
        <p className="text-sm text-slate-400">{catalog.courses.length} courses. Unpublished courses are invisible to learners.</p>
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>
          New course
        </Button>
      </div>
      <Panel className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">Courses</caption>
          <thead className="border-b border-white/[0.06] text-xs text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">#</th>
              <th scope="col" className="px-4 py-3 font-medium">Course</th>
              <th scope="col" className="px-4 py-3 font-medium">Lessons</th>
              <th scope="col" className="px-4 py-3 font-medium">Level</th>
              <th scope="col" className="px-4 py-3 font-medium">Published</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {catalog.courses.map((c) => (
              <tr key={c.id} className="border-b border-white/[0.04] last:border-0">
                <td className="px-4 py-3 text-slate-500">{c.order}</td>
                <td className="px-4 py-3">
                  <Link to={`/admin/courses/${c.id}`} className="font-medium text-white hover:text-cyan-200">
                    {c.title}
                  </Link>
                  <p className="font-mono text-[11px] text-slate-500">{c.id}</p>
                </td>
                <td className="px-4 py-3 text-slate-300">{catalog.lessons.filter((l) => l.courseId === c.id).length}</td>
                <td className="px-4 py-3 text-slate-300">{c.requiredLevel}</td>
                <td className="px-4 py-3">
                  <Switch checked={c.published} label={<span className="sr-only">Publish {c.title}</span>} onChange={(published) => save.mutate({ ...c, published })} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" aria-label={`Edit ${c.title}`} onClick={() => navigate(`/admin/courses/${c.id}`)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label={`Delete ${c.title}`} onClick={() => setDeleting(c)}>
                      <Trash2 className="h-4 w-4 text-rose-300" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New course"
        description="It starts unpublished, so you can prepare lessons before learners see it."
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button onClick={() => void create()} loading={save.isPending} disabled={!draft.title || !/^[a-z0-9][a-z0-9-]{1,40}$/.test(draft.id) || idTaken}>
              Create course
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <TextField label="Title" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value, id: slugify(e.target.value) }))} />
          <TextField label="ID (URL slug)" value={draft.id} error={idTaken ? 'This id is already used.' : null} onChange={(e) => setDraft((d) => ({ ...d, id: slugify(e.target.value) }))} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Track" value={draft.track} onChange={(e) => setDraft((d) => ({ ...d, track: e.target.value as TrackId }))}>
              {['html', 'css', 'javascript', 'python', 'react'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
            <Select label="Building" value={draft.buildingId} onChange={(e) => setDraft((d) => ({ ...d, buildingId: e.target.value as Course['buildingId'] }))}>
              {buildings
                .filter((b) => b.kind === 'course')
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
            </Select>
          </div>
        </div>
      </Modal>
      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title={`Delete “${deleting?.title}”?`}
        description="Its lessons, exercises and knowledge checks are deleted too, along with learners’ completion records for them. XP already awarded is kept. Consider unpublishing instead."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={remove.isPending}
              onClick={async () => {
                if (deleting) await remove.mutateAsync(deleting.id);
                setDeleting(null);
              }}
            >
              Delete course
            </Button>
          </>
        }
      />
    </div>
  );
}
