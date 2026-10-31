import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Check, RotateCcw } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Switch, TextField } from '@/components/ui/Field';
import { InlineAlert } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';
import { PageHeader, Panel } from '@/components/ui/Panel';
import { toast } from '@/components/ui/toast';
import { AVATAR_PRESETS } from '@/features/profile/avatars';
import { useProfile, validateDisplayName } from '@/features/profile/ProfileProvider';
import { levelForXp, levelTitle } from '@/features/progress/engine';
import { getProgressService, useProgress } from '@/features/progress/hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/cn';
import { errorMessage } from '@/lib/errors';

export default function ProfilePage() {
  useDocumentTitle('Profile');
  const { profile, updateProfile } = useProfile();
  const { snapshot, stats } = useProgress();
  const queryClient = useQueryClient();
  const [name, setName] = useState(profile?.displayName ?? '');
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => setName(profile?.displayName ?? ''), [profile?.displayName]);
  const nameError = name !== profile.displayName ? validateDisplayName(name) : null;
  const level = snapshot ? levelForXp(snapshot.xp) : 1;

  const save = async (patch: Parameters<typeof updateProfile>[0], message = 'Profile updated') => {
    setSaving(true);
    try {
      await updateProfile(patch);
      await queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast.success(message);
    } catch (e) {
      toast.error('Couldn’t save your profile', errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Profile" title="Your profile" description="How you appear in Code World. Stored only in this browser." />
      <div className="space-y-6">
        <Panel className="flex flex-wrap items-center gap-5 p-6">
          <Avatar preset={profile.avatar} size={72} label={`${profile.displayName}'s avatar`} />
          <div className="min-w-0 flex-1">
            <p className="text-xl font-semibold text-white">{profile.displayName}</p>
            <p className="text-sm text-slate-400">
              Level {level} · {levelTitle(level)} · {snapshot?.xp.toLocaleString() ?? 0} XP
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Demo profile
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-4 text-center">
            <div>
              <dt className="text-[11px] text-slate-500">Lessons</dt>
              <dd className="text-lg font-semibold text-white">{stats?.lessonsCompleted ?? 0}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-slate-500">Exercises</dt>
              <dd className="text-lg font-semibold text-white">{stats?.exercisesCompleted ?? 0}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-slate-500">Badges</dt>
              <dd className="text-lg font-semibold text-white">{Object.keys(snapshot?.achievements ?? {}).length}</dd>
            </div>
          </dl>
        </Panel>

        <Panel className="p-6">
          <h2 className="text-base">Display name</h2>
          <form
            className="mt-4 flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!nameError && name.trim() !== profile.displayName) void save({ displayName: name });
            }}
          >
            <TextField wrapperClassName="min-w-[220px] flex-1" label="Display name" maxLength={32} value={name} error={nameError} onChange={(e) => setName(e.target.value)} />
            <Button type="submit" loading={saving} disabled={!!nameError || name.trim() === profile.displayName}>
              Save
            </Button>
          </form>
        </Panel>

        <Panel className="p-6">
          <h2 className="text-base">Avatar</h2>
          <div role="radiogroup" aria-label="Choose an avatar" className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-8">
            {AVATAR_PRESETS.map((a) => (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={profile.avatar === a.id}
                aria-label={a.label}
                onClick={() => void save({ avatar: a.id }, 'Avatar updated')}
                className={cn('focus-ring relative grid place-items-center rounded-2xl p-2 transition-colors', profile.avatar === a.id ? 'bg-white/10 ring-1 ring-cyan-300/60' : 'hover:bg-white/5')}
              >
                <Avatar preset={a.id} size={44} />
                {profile.avatar === a.id && <Check className="absolute right-1 top-1 h-3.5 w-3.5 text-cyan-300" aria-hidden />}
              </button>
            ))}
          </div>
        </Panel>

        <Panel className="p-6">
          <h2 className="text-base">Privacy</h2>
          <div className="mt-4">
            <Switch
              checked={profile.showOnLeaderboard}
              onChange={(v) => void save({ showOnLeaderboard: v }, v ? 'You’re on the leaderboard' : 'Removed from the leaderboard')}
              label="Show me on the public leaderboard"
              description="Only your display name, avatar, level and XP are shown."
              disabled={saving}
            />
          </div>
        </Panel>

        <Panel className="p-6">
          <h2 className="text-base">Demo data</h2>
          <div className="mt-4 space-y-3">
            <InlineAlert tone="info">Your progress lives in this browser’s storage. Resetting cannot be undone.</InlineAlert>
            <Button variant="danger" onClick={() => setConfirmReset(true)} icon={<RotateCcw className="h-4 w-4" />}>
              Reset demo progress
            </Button>
          </div>
        </Panel>
      </div>
      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset all demo progress?"
        description="XP, completed lessons, exercises, missions and achievements stored in this browser will be deleted."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                getProgressService().reset();
                await queryClient.invalidateQueries({ queryKey: ['progress'] });
                setConfirmReset(false);
                toast.info('Demo progress reset');
              }}
            >
              Reset
            </Button>
          </>
        }
      />
    </div>
  );
}
