import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ErrorState, PageLoader } from '@/components/ui/Feedback';
import { Select, Switch, TextField } from '@/components/ui/Field';
import { ICON_NAMES, NamedIcon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { Panel } from '@/components/ui/Panel';
import { RequirementEditor } from '@/features/admin/RequirementEditor';
import { useAdminMutation } from '@/features/admin/hooks';
import { useFullCatalog } from '@/features/content/hooks';
import { describeRequirement } from '@/features/progress/engine';
import type { Achievement, AchievementTier } from '@/types';
import { slugify } from './AdminCoursesPage';

const blank = (order: number): Achievement => ({
  id: '',
  title: '',
  description: '',
  icon: 'Award',
  tier: 'bronze',
  xp: 10,
  criteria: { type: 'lessons_completed', count: 1 },
  order,
  published: false,
});

export default function AdminAchievementsPage() {
  const { data: catalog, isLoading, error, refetch } = useFullCatalog();
  const [editing, setEditing] = useState<{ item: Achievement; isNew: boolean } | null>(null);
  const [deleting, setDeleting] = useState<Achievement | null>(null);
  const save = useAdminMutation((repo, a: Achievement) => repo.saveAchievement(a), 'Achievement saved');
  const remove = useAdminMutation((repo, id: string) => repo.deleteAchievement(id), 'Achievement deleted');
  if (isLoading) return <PageLoader />;
  if (error || !catalog) return <ErrorState error={error} onRetry={() => void refetch()} />;
  const item = editing?.item;
  const set = (patch: Partial<Achievement>) => setEditing((e) => (e ? { ...e, item: { ...e.item, ...patch } } : e));
  const idTaken = Boolean(editing?.isNew && catalog.achievements.some((a) => a.id === item?.id));

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-3">
        <p className="text-sm text-slate-400">Achievements are awarded automatically when their criteria are met.</p>
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setEditing({ item: blank(catalog.achievements.length + 1), isNew: true })}>
          New achievement
        </Button>
      </div>
      <Panel className="divide-y divide-white/[0.05]">
        {catalog.achievements.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
            <NamedIcon name={a.icon} className="h-5 w-5 text-amber-300" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white">
                {a.title} <span className="text-xs capitalize text-slate-500">· {a.tier} · +{a.xp} XP</span>
              </p>
              <p className="text-xs text-slate-500">{describeRequirement(a.criteria, catalog)}</p>
            </div>
            <Switch checked={a.published} label={<span className="sr-only">Publish {a.title}</span>} onChange={(published) => save.mutate({ ...a, published })} />
            <Button variant="ghost" size="icon" aria-label={`Edit ${a.title}`} onClick={() => setEditing({ item: a, isNew: false })}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label={`Delete ${a.title}`} onClick={() => setDeleting(a)}>
              <Trash2 className="h-4 w-4 text-rose-300" />
            </Button>
          </div>
        ))}
      </Panel>
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.isNew ? 'New achievement' : 'Edit achievement'}
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
              <TextField label="Title" value={item.title} onChange={(e) => set({ title: e.target.value, ...(editing?.isNew ? { id: `a-${slugify(e.target.value)}` } : {}) })} />
              <TextField label="ID" value={item.id} disabled={!editing?.isNew} error={idTaken ? 'Already used.' : null} onChange={(e) => set({ id: slugify(e.target.value) })} />
            </div>
            <TextField label="Description" value={item.description} onChange={(e) => set({ description: e.target.value })} />
            <div className="grid gap-3 sm:grid-cols-4">
              <Select label="Icon" value={item.icon} onChange={(e) => set({ icon: e.target.value })}>
                {ICON_NAMES.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </Select>
              <Select label="Tier" value={item.tier} onChange={(e) => set({ tier: e.target.value as AchievementTier })}>
                {['bronze', 'silver', 'gold', 'platinum'].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
              <TextField label="XP reward" type="number" min={0} max={1000} value={item.xp} onChange={(e) => set({ xp: Number(e.target.value) || 0 })} />
              <TextField label="Order" type="number" value={item.order} onChange={(e) => set({ order: Number(e.target.value) || 0 })} />
            </div>
            <RequirementEditor label="Criteria" value={item.criteria} onChange={(criteria) => set({ criteria })} catalog={catalog} />
            <Switch checked={item.published} onChange={(published) => set({ published })} label="Published" />
          </div>
        )}
      </Modal>
      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title={`Delete “${deleting?.title}”?`}
        description="Learners who earned it lose the badge (XP already awarded is kept)."
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
