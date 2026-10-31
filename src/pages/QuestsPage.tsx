import { CircleCheck, Gift, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/Progress';
import { QUESTS } from '@/game/content';
import { questProgress } from '@/game/engine';
import { sfx } from '@/game/sound';
import { useGame } from '@/game/store';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';

export default function QuestsPage() {
  const t = useT();
  const game = useGame((s) => s.game);
  const claim = useGame((s) => s.claimQuest);
  useDocumentTitle(t('quests.title'));
  const all = QUESTS.map((q) => ({ quest: q, p: questProgress(game, q) }));
  const allClaimed = all.every((x) => x.p.claimed);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="flex items-center gap-3 text-3xl">
        <Gift className="h-8 w-8 text-pink-300" aria-hidden /> {t('quests.title')}
      </h1>
      <ul className="mt-6 space-y-3">
        {all.map(({ quest, p }) => {
          const label = t(quest.labelKey, { n: quest.goal.n });
          return (
            <li
              key={quest.id}
              className={cn(
                'flex items-center gap-4 rounded-3xl border-2 p-5 transition-colors',
                p.claimed ? 'border-emerald-300/20 bg-emerald-400/[0.05]' : p.met ? 'border-pink-300/40 bg-pink-400/[0.07]' : 'border-white/10 bg-night-800/60',
              )}
            >
              <span
                className={cn(
                  'grid h-14 w-14 shrink-0 place-items-center rounded-2xl',
                  p.claimed ? 'bg-emerald-400/15 text-emerald-300' : p.met ? 'animate-float bg-pink-400/20 text-pink-200' : 'bg-white/[0.05] text-slate-500',
                )}
              >
                {p.claimed ? <CircleCheck className="h-7 w-7" aria-hidden /> : p.met ? <Gift className="h-7 w-7" aria-hidden /> : <Lock className="h-6 w-6" aria-hidden />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">{label}</p>
                <div className="mt-2 flex items-center gap-3">
                  <ProgressBar className="flex-1" value={p.current} max={p.target} tone={p.met ? 'green' : 'cyan'} label={label} />
                  <span className="text-sm tabular-nums text-slate-400">
                    {p.current}/{p.target}
                  </span>
                </div>
              </div>
              {p.claimed ? (
                <span className="text-sm font-semibold text-emerald-300">{t('quests.claimed')}</span>
              ) : (
                <Button
                  disabled={!p.met}
                  onClick={() => {
                    claim(quest.id);
                    sfx.win();
                  }}
                  icon={<Sparkles className="h-4 w-4" />}
                >
                  +{quest.xp}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      {allClaimed && <p className="mt-6 text-center text-slate-400">✨ {t('quests.tomorrow')}</p>}
    </div>
  );
}
