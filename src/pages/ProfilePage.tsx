import { useEffect, useState } from 'react';
import { Award, Flame, Gift, RotateCcw, Sparkles, Star, Swords, Trophy, type LucideIcon } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Switch, TextField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/Progress';
import { toast } from '@/components/ui/toast';
import { AVATAR_PRESETS } from '@/features/profile/avatars';
import { useProfile, validateDisplayName } from '@/features/profile/ProfileProvider';
import { BADGES, QUESTS, ZONES, stageById, zoneById } from '@/game/content';
import { gameStats, levelProgress, zoneStars, type XpEvent } from '@/game/engine';
import { useGame } from '@/game/store';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useL, useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { accentInk } from '@/lib/accent';

const KIND_ICON: Record<XpEvent['kind'], LucideIcon> = { stage: Star, boss: Swords, badge: Award, quest: Gift };

export default function ProfilePage() {
  const t = useT();
  const l = useL();
  const { profile, updateProfile } = useProfile();
  const game = useGame((s) => s.game);
  const resetGame = useGame((s) => s.reset);
  useDocumentTitle(t('profile.title'));
  const [name, setName] = useState(profile.displayName);
  const [confirmReset, setConfirmReset] = useState(false);
  useEffect(() => setName(profile.displayName), [profile.displayName]);

  const stats = gameStats(game);
  const lp = levelProgress(game.xp);
  const nameInvalid = name !== profile.displayName && validateDisplayName(name) !== null;

  const save = async (patch: Parameters<typeof updateProfile>[0]) => {
    try {
      await updateProfile(patch);
      toast.success(t('profile.saved'));
    } catch {
      toast.error(t('profile.nameError'));
    }
  };

  const describe = (e: XpEvent): string => {
    if (e.kind === 'stage') {
      const s = stageById(e.ref);
      return s ? l(s.title) : e.ref;
    }
    if (e.kind === 'boss') {
      const z = zoneById(e.ref);
      return z ? `${t('zone.boss')}: ${l(z.boss.name)}` : e.ref;
    }
    if (e.kind === 'badge') {
      const b = BADGES.find((x) => x.id === e.ref);
      return b ? l(b.title) : e.ref;
    }
    const q = QUESTS.find((x) => x.id === e.ref);
    return q ? t(q.labelKey, { n: q.goal.n }) : e.ref;
  };

  const tiles: Array<{ icon: LucideIcon; value: number | string; label: string; cls: string }> = [
    { icon: Sparkles, value: game.xp, label: 'XP', cls: 'text-cyan-200' },
    { icon: Flame, value: stats.streak, label: t('profile.streak'), cls: 'text-amber-300' },
    { icon: Star, value: stats.stars, label: t('profile.stars'), cls: 'text-amber-200' },
    { icon: Trophy, value: stats.stagesCleared, label: t('profile.stages'), cls: 'text-emerald-200' },
    { icon: Swords, value: stats.bosses, label: t('profile.bosses'), cls: 'text-rose-200' },
    { icon: Award, value: Object.keys(game.badges).length, label: t('nav.badges'), cls: 'text-violet-200' },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="glass-strong flex flex-wrap items-center gap-5 rounded-3xl p-6">
        <div className="relative">
          <Avatar preset={profile.avatar} size={88} label={profile.displayName} />
          <span className="absolute -bottom-1 -right-1 grid h-9 min-w-9 place-items-center rounded-full border-[3px] border-night-900 bg-primary px-1 text-sm font-black text-primary-fg">
            {lp.level}
          </span>
        </div>
        <div className="min-w-[200px] flex-1">
          <h1 className="text-2xl">{profile.displayName}</h1>
          <p className="text-sm text-slate-400">{t('common.levelN', { n: lp.level })}</p>
          <ProgressBar className="mt-3" value={lp.current} max={lp.needed} label={t('common.xpToNext', { n: lp.toNext })} />
          <p className="mt-1 text-xs text-slate-500">{t('common.xpToNext', { n: lp.toNext })}</p>
        </div>
      </section>

      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {tiles.map(({ icon: Icon, value, label, cls }) => (
          <li key={label} className="glass flex flex-col items-center rounded-2xl px-2 py-4 text-center">
            <Icon className={cn('h-5 w-5', cls)} aria-hidden />
            <span className="mt-1 text-xl font-bold text-white">{value}</span>
            <span className="text-[11px] text-slate-500">{label}</span>
          </li>
        ))}
      </ul>

      <section className="glass rounded-3xl p-5">
        <h2 className="mb-4 text-lg">🌍 {t('map.title')}</h2>
        <ul className="space-y-3">
          {ZONES.map((z) => {
            const s = zoneStars(game, z);
            return (
              <li key={z.id} className="flex items-center gap-3">
                <span className="grid h-9 w-12 shrink-0 place-items-center rounded-lg font-mono text-xs font-bold" style={{ background: `${z.accent}22`, color: accentInk(z.accent) }}>
                  {z.symbol}
                </span>
                <span className="w-40 shrink-0 truncate text-sm text-slate-300">{t(z.nameKey)}</span>
                <ProgressBar className="flex-1" value={s} max={z.stages.length * 3} tone="amber" label={t(z.nameKey)} size="sm" />
                <span className="w-14 text-right text-xs tabular-nums text-slate-400">⭐ {s}</span>
                {game.bosses[z.id] && <Swords className="h-4 w-4 text-emerald-300" aria-label={t('zone.defeated')} />}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="glass space-y-5 rounded-3xl p-5">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!nameInvalid && name.trim() !== profile.displayName) void save({ displayName: name });
          }}
        >
          <TextField
            label={t('profile.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={32}
            error={nameInvalid ? t('profile.nameError') : null}
            wrapperClassName="min-w-[200px] flex-1"
          />
          <Button type="submit" disabled={nameInvalid || name.trim() === profile.displayName}>
            {t('profile.save')}
          </Button>
        </form>
        <div>
          <p className="mb-2 text-[13px] font-medium text-slate-200">{t('profile.avatar')}</p>
          <div role="radiogroup" aria-label={t('profile.avatar')} className="flex flex-wrap gap-2">
            {AVATAR_PRESETS.map((a) => (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={profile.avatar === a.id}
                aria-label={a.label}
                onClick={() => void save({ avatar: a.id })}
                className={cn('focus-ring rounded-full p-0.5 transition-transform hover:scale-110', profile.avatar === a.id ? 'ring-2 ring-cyan-300' : 'opacity-70')}
              >
                <Avatar preset={a.id} size={44} />
              </button>
            ))}
          </div>
        </div>
        <Switch checked={profile.showOnLeaderboard} onChange={(v) => void save({ showOnLeaderboard: v })} label={t('profile.leaderboard')} />
      </section>

      {game.history.length > 0 && (
        <section className="glass rounded-3xl p-5">
          <h2 className="mb-3 text-lg">{t('profile.history')}</h2>
          <ul className="divide-y divide-white/[0.05]">
            {game.history.slice(0, 8).map((e, i) => {
              const Icon = KIND_ICON[e.kind];
              return (
                <li key={`${e.at}-${i}`} className="flex items-center gap-3 py-2.5 text-sm">
                  <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-slate-300">{describe(e)}</span>
                  <span className="font-semibold text-cyan-200">+{e.amount} XP</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <p className="text-xs text-slate-500">{t('profile.local')}</p>
        <Button variant="ghost" size="sm" onClick={() => setConfirmReset(true)} icon={<RotateCcw className="h-4 w-4" />}>
          {t('profile.reset')}
        </Button>
      </div>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title={t('profile.resetTitle')}
        description={t('profile.resetBody')}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                resetGame();
                setConfirmReset(false);
                toast.success(t('profile.resetDone'));
              }}
            >
              {t('profile.reset')}
            </Button>
          </>
        }
      />
    </div>
  );
}
