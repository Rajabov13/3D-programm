import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BookOpen, ChevronLeft, ChevronRight, Flame, FlaskConical, HeartCrack, Lock, Map as MapIcon, Play, RotateCcw, SkipForward, Swords, Target, X } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { stageById, zoneOfStage } from '@/game/content';
import { Confetti } from '@/game/components/Confetti';
import { Hearts, Stars } from '@/game/components/Hud';
import { LearnCardView } from '@/game/components/Learn';
import { BugTask, ChoiceTask, isAnswerComplete, isAnswerCorrect, MatchTask, OrderTask, TaskPrompt, type Reveal, type TaskValue } from '@/game/components/Tasks';
import { isBossUnlocked, isStageUnlocked, MAX_HEARTS, type StageResult } from '@/game/engine';
import { learnFor } from '@/game/learn';
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
  return (
    <StageRun
      key={`${stage.id}:${run}`}
      stage={stage}
      zone={zone}
      index={index}
      canSkipLearning={run > 0 || (game.stars[stage.id] ?? 0) > 0}
      onRestart={() => setRun((r) => r + 1)}
    />
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="grid min-h-[100dvh] place-items-center px-6 text-center">
      <div>{children}</div>
    </main>
  );
}

/** learn (info → picture → example cards) → play (the test) → result / failed */
type Phase = 'learn' | 'play' | 'result' | 'failed';

function StageRun({ stage, zone, index, canSkipLearning, onRestart }: { stage: Stage; zone: Zone; index: number; canSkipLearning: boolean; onRestart: () => void }) {
  const t = useT();
  const l = useL();
  const navigate = useNavigate();
  const finishStage = useGame((s) => s.finishStage);
  const game = useGame((s) => s.game);

  const cards = useMemo(() => learnFor(stage.id), [stage.id]);
  const [phase, setPhase] = useState<Phase>(cards.length ? 'learn' : 'play');
  const [card, setCard] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
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

  const startTest = useCallback(() => {
    sfx.tap();
    setPhase('play');
    window.scrollTo(0, 0);
  }, []);
  const goCard = useCallback(
    (next: number) => {
      if (next < 0) return;
      if (next >= cards.length) {
        startTest();
        return;
      }
      setCard(next);
      window.scrollTo(0, 0);
    },
    [cards.length, startTest],
  );

  // Keyboard: ← → move between cards; Enter continues / checks; digits are handled by the choice task.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (confirmQuit || reviewOpen || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (phase === 'learn') {
        if (e.key === 'ArrowRight' || (e.key === 'Enter' && target.tagName !== 'BUTTON' && target.tagName !== 'A')) {
          e.preventDefault();
          goCard(card + 1);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goCard(card - 1);
        }
        return;
      }
      if (e.key !== 'Enter' || phase !== 'play') return;
      e.preventDefault();
      if (reveal) proceed();
      else check();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, reveal, proceed, check, confirmQuit, reviewOpen, card, goCard]);

  const nextStage = zone.stages[index + 1];
  const quit = () => navigate(`/zone/${zone.id}`);

  if (phase === 'learn') {
    const current = cards[card];
    const last = card === cards.length - 1;
    return (
      <div className="flex min-h-[100dvh] flex-col">
        <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-night-950/90 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
            <Link to={`/zone/${zone.id}`} className="focus-ring rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label={t('common.back')}>
              <X className="h-5 w-5" />
            </Link>
            <ol className="flex flex-1 items-center gap-1.5" aria-label={t('learn.progress', { n: card + 1, total: cards.length })}>
              {cards.map((c, i) => (
                <li key={i} className="flex-1">
                  <button
                    type="button"
                    onClick={() => goCard(i)}
                    aria-label={l(c.title)}
                    aria-current={i === card ? 'step' : undefined}
                    className={cn('focus-ring block h-2.5 w-full rounded-full transition-colors', i < card ? 'bg-sky-400' : i === card ? 'bg-sky-300' : 'bg-white/10 hover:bg-white/20')}
                  />
                </li>
              ))}
              <li className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.06] text-slate-400" title={t('learn.test')}>
                <Target className="h-4 w-4" aria-hidden />
              </li>
            </ol>
            {canSkipLearning && (
              <button type="button" onClick={startTest} className="focus-ring hidden items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-400 hover:bg-white/10 hover:text-white sm:flex">
                <SkipForward className="h-4 w-4" aria-hidden /> {t('learn.skip')}
              </button>
            )}
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 pb-40 pt-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: zone.accent }}>
                {t('zone.stage', { n: index + 1 })} · {t('learn.progress', { n: card + 1, total: cards.length })}
              </p>
              <h1 className="mt-0.5 text-lg font-bold text-slate-300">{l(stage.title)}</h1>
            </div>
            <ol className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider" aria-hidden>
              <li className="flex items-center gap-1 rounded-full bg-sky-400/15 px-2.5 py-1 text-sky-200">
                <BookOpen className="h-3.5 w-3.5" /> {t('learn.info')}
              </li>
              <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
              <li className="flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-amber-200">
                <FlaskConical className="h-3.5 w-3.5" /> {t('learn.example')}
              </li>
              <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
              <li className="flex items-center gap-1 rounded-full bg-white/[0.05] px-2.5 py-1 text-slate-500">
                <Target className="h-3.5 w-3.5" /> {t('learn.test')}
              </li>
            </ol>
          </div>
          <div key={card} className="animate-rise-in">
            <LearnCardView card={current} accent={zone.accent} />
          </div>
        </main>

        <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-white/[0.06] bg-night-950/95 px-4 py-4 safe-bottom">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <Button variant="secondary" size="lg" onClick={() => goCard(card - 1)} disabled={card === 0} icon={<ChevronLeft className="h-5 w-5" />}>
              <span className="hidden sm:inline">{t('common.back')}</span>
            </Button>
            {last ? (
              <div className="flex items-center gap-3">
                <span className="hidden text-sm text-slate-400 sm:inline">{t('learn.ready', { n: stage.tasks.length })}</span>
                <Button size="lg" onClick={startTest} icon={<Target className="h-5 w-5" />} className="min-w-[180px]">
                  {t('learn.start')}
                </Button>
              </div>
            ) : (
              <Button size="lg" onClick={() => goCard(card + 1)} className="min-w-[160px]">
                {t('learn.next')} <ChevronRight className="h-5 w-5" aria-hidden />
              </Button>
            )}
          </div>
        </footer>
      </div>
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
          {cards.length > 0 && (
            <button
              type="button"
              onClick={() => setReviewOpen(true)}
              className="focus-ring flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-sky-300 hover:bg-white/10"
              aria-label={t('learn.review')}
              title={t('learn.review')}
            >
              <BookOpen className="h-5 w-5" aria-hidden />
              <span className="hidden sm:inline">{t('learn.review')}</span>
            </button>
          )}
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

      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title={`📖 ${t('learn.review')}: ${l(stage.title)}`} size="lg">
        <div className="space-y-10">
          {cards.map((c, i) => (
            <LearnCardView key={i} card={c} accent={zone.accent} compact />
          ))}
        </div>
      </Modal>

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
