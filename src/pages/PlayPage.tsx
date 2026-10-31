import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Flame, HeartCrack, Lightbulb, Lock, Map as MapIcon, Play, RotateCcw, Swords, X } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { stageById, zoneOfStage } from '@/game/content';
import { CodeView } from '@/game/components/CodeView';
import { Confetti } from '@/game/components/Confetti';
import { Hearts, Stars } from '@/game/components/Hud';
import { BugTask, ChoiceTask, isAnswerComplete, isAnswerCorrect, MatchTask, OrderTask, TaskPrompt, type Reveal, type TaskValue } from '@/game/components/Tasks';
import { isBossUnlocked, isStageUnlocked, MAX_HEARTS, type StageResult } from '@/game/engine';
import { sfx } from '@/game/sound';
import { useGame } from '@/game/store';
import type { Stage, Zone } from '@/game/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useL, useT } from '@/i18n';
import { cn } from '@/lib/cn';

export default function PlayPage() {
  const { stageId } = useParams();
  const t = useT();
  const l = useL();
  const stage = stageById(stageId);
  const zone = stage ? zoneOfStage(stage.id) : undefined;
  const game = useGame((s) => s.game);
  const [run, setRun] = useState(0);
  useDocumentTitle(stage ? l(stage.title) : t('common.notFound'));

  if (!stage || !zone) {
    return (
      <Centered>
        <h1 className="text-2xl">{t('common.notFound')}</h1>
        <ButtonLink to="/map" className="mt-6" icon={<MapIcon className="h-4 w-4" />}>
          {t('play.toMap')}
        </ButtonLink>
      </Centered>
    );
  }
  const index = zone.stages.indexOf(stage);
  if (!isStageUnlocked(game, zone, index)) {
    return (
      <Centered>
        <Lock className="mx-auto h-12 w-12 text-amber-300" aria-hidden />
        <h1 className="mt-4 text-2xl">{t('play.locked')}</h1>
        <ButtonLink to={`/zone/${zone.id}`} className="mt-6" icon={<MapIcon className="h-4 w-4" />}>
          {t('common.back')}
        </ButtonLink>
      </Centered>
    );
  }
  return <StageRun key={`${stage.id}:${run}`} stage={stage} zone={zone} index={index} onRestart={() => setRun((r) => r + 1)} />;
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="grid min-h-[100dvh] place-items-center px-6 text-center">
      <div>{children}</div>
    </main>
  );
}

type Phase = 'tip' | 'play' | 'result' | 'failed';

function StageRun({ stage, zone, index, onRestart }: { stage: Stage; zone: Zone; index: number; onRestart: () => void }) {
  const t = useT();
  const l = useL();
  const navigate = useNavigate();
  const finishStage = useGame((s) => s.finishStage);
  const game = useGame((s) => s.game);

  const [phase, setPhase] = useState<Phase>('tip');
  const [queue, setQueue] = useState<number[]>(() => stage.tasks.map((_, i) => i));
  const [requeued, setRequeued] = useState<number[]>([]);
  const [pos, setPos] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [value, setValue] = useState<TaskValue>(null);
  const [reveal, setReveal] = useState<Reveal>(null);
  const [result, setResult] = useState<StageResult | null>(null);
  const [confetti, setConfetti] = useState(0);
  const [confirmQuit, setConfirmQuit] = useState(false);

  const taskIndex = queue[pos];
  const task = stage.tasks[taskIndex];
  const hearts = MAX_HEARTS - mistakes;

  const apply = useCallback(
    (correct: boolean, withSound = true) => {
      setAnswered((n) => n + 1);
      if (correct) {
        setCorrectCount((n) => n + 1);
        setCombo((c) => {
          const next = c + 1;
          setBestCombo((b) => Math.max(b, next));
          return next;
        });
        if (withSound) sfx.correct();
      } else {
        setMistakes((m) => m + 1);
        setCombo(0);
        if (withSound) sfx.wrong();
        // Practise it again at the end of the stage (once).
        if (!requeued.includes(taskIndex)) {
          setQueue((q) => [...q, taskIndex]);
          setRequeued((r) => [...r, taskIndex]);
        }
      }
      setReveal({ correct });
    },
    [requeued, taskIndex],
  );

  const check = useCallback(() => {
    if (!task || reveal || !isAnswerComplete(task, value)) return;
    apply(isAnswerCorrect(task, value));
  }, [task, reveal, value, apply]);

  const proceed = useCallback(() => {
    if (!reveal) return;
    if (mistakes >= MAX_HEARTS) {
      sfx.lose();
      setPhase('failed');
      return;
    }
    if (pos + 1 >= queue.length) {
      const r = finishStage(stage.id, mistakes);
      setResult(r);
      setPhase('result');
      sfx.win();
      window.setTimeout(() => setConfetti((c) => c + 1), 150);
      return;
    }
    setPos((p) => p + 1);
    setValue(null);
    setReveal(null);
  }, [reveal, mistakes, pos, queue.length, finishStage, stage.id]);

  // Keyboard: Enter checks / continues; digits are handled by the choice task.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || confirmQuit) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' && phase !== 'play') return;
      if (phase === 'tip') {
        e.preventDefault();
        setPhase('play');
      } else if (phase === 'play') {
        e.preventDefault();
        if (reveal) proceed();
        else check();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, reveal, proceed, check, confirmQuit]);

  const nextStage = zone.stages[index + 1];
  const quit = () => navigate(`/zone/${zone.id}`);

  if (phase === 'tip') {
    return (
      <main id="main" className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col justify-center px-4 py-10">
        <div className="glass-strong animate-pop-in rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl border-2 font-mono text-sm font-bold" style={{ borderColor: zone.accent, color: zone.accent }}>
              {zone.symbol}
            </span>
            <Link to={`/zone/${zone.id}`} className="focus-ring rounded-lg p-2 text-slate-400 hover:text-white" aria-label={t('common.back')}>
              <X className="h-5 w-5" />
            </Link>
          </div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-widest" style={{ color: zone.accent }}>
            {t('zone.stage', { n: index + 1 })}
          </p>
          <h1 className="mt-1 text-3xl font-bold">{l(stage.title)}</h1>
          <div className="mt-5 flex gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden />
            <p className="text-[15px] leading-relaxed text-amber-50">{l(stage.tip.text)}</p>
          </div>
          <CodeView code={stage.tip.code} lang={stage.tip.lang} className="mt-4" />
          <div className="mt-6 flex items-center justify-between gap-3">
            <Hearts hearts={MAX_HEARTS} />
            <Button size="lg" onClick={() => setPhase('play')} icon={<Play className="h-5 w-5" />} autoFocus>
              {t('common.start')}
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (phase === 'failed') {
    return (
      <Centered>
        <HeartCrack className="mx-auto h-16 w-16 animate-pop-in text-rose-400" aria-hidden />
        <h1 className="mt-4 text-3xl font-bold">{t('play.failed')}</h1>
        <p className="mt-2 text-slate-400">{t('play.failedHint')}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={onRestart} icon={<RotateCcw className="h-5 w-5" />} autoFocus>
            {t('common.retry')}
          </Button>
          <ButtonLink to={`/zone/${zone.id}`} size="lg" variant="secondary" icon={<MapIcon className="h-5 w-5" />}>
            {t('play.toMap')}
          </ButtonLink>
        </div>
      </Centered>
    );
  }

  if (phase === 'result' && result) {
    const accuracy = answered ? Math.round((correctCount / answered) * 100) : 100;
    const bossReady = !nextStage && isBossUnlocked(game, zone) && !game.bosses[zone.id];
    return (
      <Centered>
        <Confetti fire={confetti} />
        <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: zone.accent }}>
          {t('zone.stage', { n: index + 1 })} · {l(stage.title)}
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t('play.complete')}</h1>
        <Stars value={result.stars} size={56} animate className="mt-6" />
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Stat label="XP" value={result.award.xp > 0 ? `+${result.award.xp}` : '0'} accent="text-cyan-200" />
          <Stat label={t('play.accuracy')} value={`${accuracy}%`} accent="text-emerald-200" />
          <Stat label="🔥" value={`${bestCombo}x`} accent="text-amber-200" />
        </div>
        {result.newBest && result.previousBest > 0 && <p className="mt-4 font-semibold text-amber-200">{t('play.newBest')}</p>}
        {result.award.xp === 0 && <p className="mt-4 text-sm text-slate-500">{t('play.noXp')}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {nextStage ? (
            <Button size="lg" onClick={() => navigate(`/play/${nextStage.id}`)} icon={<Play className="h-5 w-5" />} autoFocus>
              {t('play.next')}
            </Button>
          ) : bossReady ? (
            <Button size="lg" onClick={() => navigate(`/boss/${zone.id}`)} icon={<Swords className="h-5 w-5" />} autoFocus>
              {t('play.toBoss')}
            </Button>
          ) : null}
          <Button size="lg" variant="secondary" onClick={onRestart} icon={<RotateCcw className="h-5 w-5" />}>
            {t('play.again')}
          </Button>
          <ButtonLink to={`/zone/${zone.id}`} size="lg" variant="ghost" icon={<MapIcon className="h-5 w-5" />}>
            {t('play.toMap')}
          </ButtonLink>
        </div>
      </Centered>
    );
  }

  const progress = pos / queue.length;
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-night-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button type="button" onClick={() => setConfirmQuit(true)} className="focus-ring rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label={t('play.quit')}>
            <X className="h-5 w-5" />
          </button>
          <div
            className="h-3 flex-1 overflow-hidden rounded-full bg-white/[0.08]"
            role="progressbar"
            aria-label={t('play.progress', { n: pos + 1, total: queue.length })}
            aria-valuemin={0}
            aria-valuemax={queue.length}
            aria-valuenow={pos}
          >
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 transition-[width] duration-500" style={{ width: `${Math.max(4, progress * 100)}%` }} />
          </div>
          <Hearts hearts={hearts} />
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 pb-44 pt-6 sm:pt-10">
        <div className="mb-6 flex items-center justify-center gap-3">
          <TaskPrompt task={task} />
        </div>
        {combo >= 2 && (
          <p className="mb-4 flex animate-pop-in items-center justify-center gap-1.5 text-sm font-bold text-amber-300" aria-live="polite">
            <Flame className="h-4 w-4" aria-hidden /> {t('play.combo', { n: combo })}
          </p>
        )}
        <div key={`${pos}`} className="animate-rise-in">
          {task.kind === 'pick' || task.kind === 'output' || task.kind === 'blank' || task.kind === 'look' ? (
            <ChoiceTask task={task} value={value} onChange={setValue} reveal={reveal} />
          ) : task.kind === 'order' ? (
            <OrderTask task={task} value={value} onChange={setValue} reveal={reveal} />
          ) : task.kind === 'bug' ? (
            <BugTask task={task} value={value} onChange={setValue} reveal={reveal} />
          ) : (
            <MatchTask task={task} done={Boolean(reveal)} onDone={(m) => apply(m === 0, false)} />
          )}
        </div>
        <p className="mt-6 hidden text-center text-xs text-slate-600 md:block">{t('play.keys')}</p>
      </main>

      <footer
        className={cn(
          'fixed inset-x-0 bottom-0 z-20 border-t px-4 py-4 transition-colors safe-bottom',
          !reveal && 'border-white/[0.06] bg-night-950/95',
          reveal?.correct && 'border-emerald-400/30 bg-emerald-950/95',
          reveal && !reveal.correct && 'border-rose-400/30 bg-rose-950/95',
        )}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div aria-live="assertive" className="min-w-0">
            {reveal && (
              <p className={cn('animate-pop-in text-xl font-bold', reveal.correct ? 'text-emerald-300' : 'text-rose-300')}>
                {reveal.correct ? `✓ ${t('play.correct')}` : `✗ ${t('play.wrong')}`}
              </p>
            )}
          </div>
          {reveal ? (
            <Button size="lg" onClick={proceed} className={cn('min-w-[160px]', !reveal.correct && 'from-rose-300 to-rose-500')} autoFocus>
              {t('common.continue')}
            </Button>
          ) : task.kind === 'match' ? (
            <span />
          ) : (
            <Button size="lg" onClick={check} disabled={!isAnswerComplete(task, value)} className="min-w-[160px]">
              {t('common.check')}
            </Button>
          )}
        </div>
      </footer>

      <Modal
        open={confirmQuit}
        onClose={() => setConfirmQuit(false)}
        title={t('play.quitTitle')}
        description={t('play.quitBody')}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmQuit(false)}>
              {t('play.stay')}
            </Button>
            <Button variant="danger" onClick={quit}>
              {t('play.quit')}
            </Button>
          </>
        }
      />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="glass min-w-[110px] rounded-2xl px-5 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={cn('mt-0.5 text-2xl font-bold', accent)}>{value}</p>
    </div>
  );
}
