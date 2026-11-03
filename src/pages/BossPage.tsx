import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Check, CircleDashed, Lock, Map as MapIcon, Swords, Trophy, X } from 'lucide-react';
import { evaluateChecks, type CheckResult, type CheckSpec } from '@shared/checks';
import { Button, ButtonLink } from '@/components/ui/Button';
import { toast } from '@/components/ui/toast';
import { Workspace } from '@/editor/Workspace';
import { useRunner } from '@/editor/useRunner';
import { ZONES, zoneById } from '@/game/content';
import { Confetti } from '@/game/components/Confetti';
import { isBossUnlocked, isZoneUnlocked, type Award } from '@/game/engine';
import { sfx } from '@/game/sound';
import { useGame } from '@/game/store';
import type { Zone } from '@/game/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useDraft } from '@/hooks/useDraft';
import { useL, useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { accentInk, ON_ACCENT } from '@/lib/accent';

const parseHtml = (html: string) => new DOMParser().parseFromString(html, 'text/html');

export default function BossPage() {
  const { zoneId } = useParams();
  const t = useT();
  const l = useL();
  const zone = zoneById(zoneId);
  const game = useGame((s) => s.game);
  useDocumentTitle(zone ? t('boss.title', { name: l(zone.boss.name) }) : t('common.notFound'));

  if (!zone) {
    return (
      <Centered>
        <h1 className="text-2xl">{t('common.notFound')}</h1>
        <ButtonLink to="/map" className="mt-6" icon={<MapIcon className="h-4 w-4" />}>
          {t('play.toMap')}
        </ButtonLink>
      </Centered>
    );
  }
  if (!isBossUnlocked(game, zone)) {
    return (
      <Centered>
        <Lock className="mx-auto h-12 w-12 text-amber-300" aria-hidden />
        <h1 className="mt-4 text-2xl">{l(zone.boss.name)}</h1>
        <p className="mt-2 text-slate-400">{isZoneUnlocked(zone, game.xp) ? t('zone.bossLocked') : t('zone.locked', { n: zone.requiredLevel })}</p>
        <ButtonLink to={`/zone/${zone.id}`} className="mt-6" icon={<MapIcon className="h-4 w-4" />}>
          {t('common.back')}
        </ButtonLink>
      </Centered>
    );
  }
  return <BossFight key={zone.id} zone={zone} />;
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="grid min-h-[100dvh] place-items-center px-6 text-center">
      <div>{children}</div>
    </main>
  );
}

function BossFight({ zone }: { zone: Zone }) {
  const t = useT();
  const l = useL();
  const navigate = useNavigate();
  const boss = zone.boss;
  const defeated = useGame((s) => Boolean(s.game.bosses[zone.id]));
  const defeatBoss = useGame((s) => s.defeatBoss);
  const draft = useDraft(`boss.${zone.id}`, boss.starter);
  const runner = useRunner(boss.mode);
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<CheckResult[] | null>(null);
  const [stdout, setStdout] = useState<string | undefined>(undefined);
  const [signal, setSignal] = useState(0);
  const [shake, setShake] = useState(0);
  const [win, setWin] = useState<{ award: Award; already: boolean } | null>(null);
  const [confetti, setConfetti] = useState(0);

  // Check labels are shown in the player's language.
  const specs: CheckSpec[] = useMemo(() => boss.checks.map((c) => ({ ...c.spec, label: l(c.label) })), [boss, l]);
  const expected = specs.find((s) => s.type === 'output_equals');

  const check = useCallback(async () => {
    if (checking) return;
    setChecking(true);
    try {
      const outcome = await runner.run(draft.files, { runtimeChecks: specs.filter((s) => s.type === 'dom_runtime') });
      if (outcome.status === 'unavailable') {
        toast.error(t('boss.runProblem'), outcome.message);
        return;
      }
      const res = evaluateChecks(specs, { files: draft.files, stdout: outcome.stdout, runtime: outcome.runtime, parseHtml, environment: 'client' });
      setResults(res);
      setStdout(outcome.stdout);
      setSignal((n) => n + 1);
      if (res.every((r) => r.status === 'pass')) {
        try {
          const r = defeatBoss(zone.id);
          setWin({ award: r.award, already: r.already });
          sfx.win();
          window.setTimeout(() => setConfetti((c) => c + 1), 120);
        } catch {
          toast.error(t('boss.saveError'));
        }
      } else {
        sfx.wrong();
        setShake((n) => n + 1);
      }
    } finally {
      setChecking(false);
    }
  }, [checking, runner, draft.files, specs, defeatBoss, zone.id, t]);

  const passed = results?.filter((r) => r.status === 'pass').length ?? 0;
  const statusOf = (id: string) => results?.find((r) => r.id === id)?.status;

  const requirements = (
    <ul className="space-y-2">
      {specs.map((spec) => {
        const status = statusOf(spec.id);
        return (
          <li
            key={spec.id}
            className={cn(
              'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-[14px] transition-colors',
              status === 'pass' && 'border-emerald-300/30 bg-emerald-400/[0.08] text-emerald-50',
              status === 'fail' && 'border-rose-300/30 bg-rose-500/[0.08] text-rose-50',
              !status && 'border-white/10 bg-white/[0.03] text-slate-300',
            )}
          >
            <span
              className={cn(
                'grid h-6 w-6 shrink-0 place-items-center rounded-full',
                status === 'pass' && 'bg-emerald-500 text-[#fff]',
                status === 'fail' && 'bg-rose-500 text-[#fff]',
                !status && 'text-slate-500',
              )}
              aria-hidden
            >
              {status === 'pass' ? <Check className="h-4 w-4" strokeWidth={3} /> : status === 'fail' ? <X className="h-4 w-4" strokeWidth={3} /> : <CircleDashed className="h-5 w-5" />}
            </span>
            <span>{spec.label}</span>
            <span className="sr-only">{status === 'pass' ? '✓' : status === 'fail' ? '✗' : ''}</span>
          </li>
        );
      })}
    </ul>
  );

  const outputDiff = expected && expected.type === 'output_equals' && results && statusOf(expected.id) === 'fail' && (
    <div className="grid gap-2 sm:grid-cols-2">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{t('boss.expected')}</p>
        <pre className="rounded-xl border border-emerald-300/20 bg-night-950 p-3 font-mono text-[13px] text-emerald-200">{expected.expected}</pre>
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{t('boss.yours')}</p>
        <pre className="rounded-xl border border-rose-300/20 bg-night-950 p-3 font-mono text-[13px] text-rose-200">{stdout?.trim() ? stdout.trimEnd() : t('boss.nothing')}</pre>
      </div>
    </div>
  );

  const summary = results && (
    <p className={cn('text-sm font-bold', passed === specs.length ? 'text-emerald-300' : 'text-amber-200')} role="status">
      {passed === specs.length ? t('boss.all') : t('boss.notYet', { done: passed, total: specs.length })}
    </p>
  );

  const sidebar = (
    <div className="h-full space-y-5 overflow-auto p-5">
      <div className="flex items-center gap-3">
        <span className={cn('grid h-14 w-14 shrink-0 animate-float place-items-center rounded-2xl shadow-lg', ON_ACCENT)} style={{ background: zone.accent }}>
          <Swords className="h-7 w-7" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accentInk(zone.accent) }}>
            {t(zone.nameKey)} · {t('zone.boss')}
          </p>
          <h1 className="truncate text-2xl font-bold">{l(boss.name)}</h1>
        </div>
      </div>
      {defeated && (
        <p className="flex items-center gap-2 rounded-xl bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-200">
          <Trophy className="h-4 w-4" aria-hidden /> {t('boss.already')}
        </p>
      )}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">{t('boss.task')}</h2>
        <p className="text-[15px] leading-relaxed text-slate-100">{l(boss.task)}</p>
      </section>
      <section key={shake} className={cn(shake > 0 && 'animate-shake')}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">{t('boss.requirements')}</h2>
          {summary}
        </div>
        {requirements}
      </section>
      {outputDiff}
      <p className="text-xs text-slate-500">{t('boss.hint')}</p>
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <span className="text-sm text-slate-400">{t('boss.reward')}</span>
        <span className="text-lg font-bold text-cyan-200">+{boss.xp} XP</span>
      </div>
      <Button className="w-full" size="lg" onClick={() => void check()} loading={checking} icon={<Swords className="h-5 w-5" />}>
        {t('common.check')}
      </Button>
    </div>
  );

  const checksPanel = (
    <div className="space-y-4 p-4">
      {summary}
      {requirements}
      {outputDiff}
    </div>
  );

  const nextZone = ZONES[ZONES.indexOf(zone) + 1];

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <header className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] bg-night-950/90 px-3 py-2">
        <Link to={`/zone/${zone.id}`} className="focus-ring rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label={t('common.back')}>
          <X className="h-5 w-5" />
        </Link>
        <p className="flex min-w-0 items-center gap-2 font-semibold">
          <Swords className="h-4 w-4 shrink-0" style={{ color: accentInk(zone.accent) }} aria-hidden />
          <span className="truncate">{t('boss.title', { name: l(boss.name) })}</span>
        </p>
      </header>
      <main id="main" className="min-h-0 flex-1">
        <Workspace
          mode={boss.mode}
          files={draft.files}
          onFileChange={draft.setFile}
          runner={runner}
          onRun={() => void runner.run(draft.files)}
          onReset={() => {
            draft.reset();
            setResults(null);
          }}
          onCheck={() => void check()}
          checking={checking}
          checksPanel={checksPanel}
          checksSignal={signal}
          sidebar={sidebar}
          storageKey={`boss-${zone.id}`}
        />
      </main>

      <Confetti fire={confetti} />
      {win && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-night-950/80 p-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="boss-win">
          <div className="glass-strong w-full max-w-md animate-pop-in rounded-3xl p-8 text-center">
            <Trophy className="mx-auto h-16 w-16 animate-star-pop text-[#f59e0b]" aria-hidden />
            <h2 id="boss-win" className="mt-4 text-3xl font-bold">
              {t('boss.win')}
            </h2>
            <p className="mt-1 text-slate-400">{l(boss.name)}</p>
            <p className="mt-5 text-4xl font-black text-cyan-200">{win.award.xp > 0 ? `+${win.award.xp} XP` : '✓'}</p>
            {win.already && <p className="mt-2 text-sm text-slate-500">{t('play.noXp')}</p>}
            <div className="mt-7 flex flex-col gap-2">
              {nextZone ? (
                <Button size="lg" onClick={() => navigate(`/zone/${nextZone.id}`)} autoFocus>
                  {t('boss.nextWorld')}: {t(nextZone.nameKey)}
                </Button>
              ) : (
                <Button size="lg" onClick={() => navigate('/badges')} autoFocus>
                  🏆 {t('badges.title')}
                </Button>
              )}
              <Button size="lg" variant="secondary" onClick={() => navigate('/map')} icon={<MapIcon className="h-5 w-5" />}>
                {t('play.toMap')}
              </Button>
              <Button variant="ghost" onClick={() => setWin(null)}>
                {t('boss.keep')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
