import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ErrorState, PageLoader } from '@/components/ui/Feedback';
import { Switch, TextArea, TextField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Panel } from '@/components/ui/Panel';
import { RequirementEditor } from '@/features/admin/RequirementEditor';
import { useAdminMutation } from '@/features/admin/hooks';
import { useFullCatalog } from '@/features/content/hooks';
import { describeRequirement } from '@/features/progress/engine';
import type { Mission } from '@/types';
import { slugify } from './AdminCoursesPage';

export default function AdminMissionsPage() {
  const { data: catalog, isLoading, error, refetch } = useFullCatalog();
  const [editing, setEditing] = useState<{ item: Mission; isNew: boolean } | null>(null);
  const [deleting, setDeleting] = useState<Mission | null>(null);
  const save = useAdminMutation((repo, m: Mission) => repo.saveMission(m), 'Mission saved');
  const remove = useAdminMutation((repo, id: string) => repo.deleteMission(id), 'Mission deleted');
  if (isLoading) return <PageLoader />;
  if (error || !catalog) return <ErrorState error={error} onRetry={() => void refetch()} />;
  const item = editing?.item;
  const set = (patch: Partial<Mission>) => setEditing((e) => (e ? { ...e, item: { ...e.item, ...patch } } : e));
  const idTaken = Boolean(editing?.isNew && catalog.missions.some((m) => m.id === item?.id));

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-3">
        <p className="text-sm text-slate-400">Learners can claim a mission once its requirement is met.</p>
        <Button
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={() =>
            setEditing({ item: { id: '', title: '', description: '', xp: 25, requirement: { type: 'lessons_completed', count: 1 }, order: catalog.missions.length + 1, published: false }, isNew: true })
          }
        >
          New mission
        </Button>
      </div>
      <Panel className="divide-y divide-white/[0.05]">
        {catalog.missions.map((m) => (
          <div key={m.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white">
                {m.title} <span className="text-xs text-slate-500">· +{m.xp} XP</span>
              </p>
              <p className="text-xs text-slate-500">{describeRequirement(m.requirement, catalog)}</p>
            </div>
            <Switch checked={m.published} label={<span className="sr-only">Publish {m.title}</span>} onChange={(published) => save.mutate({ ...m, published })} />
            <Button variant="ghost" size="icon" aria-label={`Edit ${m.title}`} onClick={() => setEditing({ item: m, isNew: false })}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label={`Delete ${m.title}`} onClick={() => setDeleting(m)}>
              <Trash2 className="h-4 w-4 text-rose-300" />
            </Button>
          </div>
        ))}
      </Panel>
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.isNew ? 'New mission' : 'Edit mission'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              loading={save.isPending}
              disabled={!item?.title || !/^[a-z0-9][a-z0-9-]{1,60}$/.test(item?.id ?? '') || idTaken}
              onClick={async () => {
                if (item) await save.mutateAsync(item);
                setEditing(null);
              }}
            >
              Save
            </Button>
          </>
        }
      >
        {item && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Title" value={item.title} onChange={(e) => set({ title: e.target.value, ...(editing?.isNew ? { id: `m-${slugify(e.target.value)}` } : {}) })} />
              <TextField label="ID" value={item.id} disabled={!editing?.isNew} error={idTaken ? 'Already used.' : null} onChange={(e) => set({ id: slugify(e.target.value) })} />
            </div>
            <TextArea label="Description" value={item.description} onChange={(e) => set({ description: e.target.value })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="XP reward" type="number" min={0} max={1000} value={item.xp} onChange={(e) => set({ xp: Number(e.target.value) || 0 })} />
              <TextField label="Order" type="number" value={item.order} onChange={(e) => set({ order: Number(e.target.value) || 0 })} />
            </div>
            <RequirementEditor label="Requirement" value={item.requirement} onChange={(requirement) => set({ requirement })} catalog={catalog} />
            <Switch checked={item.published} onChange={(published) => set({ published })} label="Published" />
          </div>
        )}
      </Modal>
      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title={`Delete “${deleting?.title}”?`}
        size="sm"
        footer={
          <Button
            variant="danger"
            loading={remove.isPending}
            onClick={async () => {
              if (deleting) await remove.mutateAsync(deleting.id);
              setDeleting(null);
            }}
          >
            Delete
          </Button>
        }
      />
    </div>
  );
}
