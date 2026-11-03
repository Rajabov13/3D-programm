import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CircleHelp, Crosshair, DoorOpen, Layers, List, LogOut, Map as MapIcon, MousePointerClick, RotateCcw, Box } from 'lucide-react';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LogoMark } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/Field';
import { InlineAlert } from '@/components/ui/Feedback';
import { useSettings } from '@/features/settings/settingsStore';
import { BuildingPanel } from '@/features/world/BuildingPanel';
import { LocationMenu } from '@/features/world/LocationMenu';
import { TouchJoystick } from '@/features/world/TouchJoystick';
import { useBuildingInfo } from '@/features/world/useBuildingStatuses';
import { WorldHelp } from '@/features/world/WorldHelp';
import { WorldMap2D } from '@/features/world/WorldMap2D';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useIsCoarsePointer, useIsDesktop } from '@/hooks/useMediaQuery';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useT } from '@/i18n';
import { lazyPage } from '@/lib/chunks';
import { cn } from '@/lib/cn';
import { useQuality } from '@/three/quality';
import { isWebGLAvailable } from '@/three/webgl';
import { useWorld, type CameraMode } from '@/three/worldStore';
import type { BuildingId } from '@/data/buildings';

const World3D = lazyPage(() => import('@/three/World3D'));

const LOCATION_ORDER: BuildingId[] = [
  'html-academy',
  'css-studio',
  'js-lab',
  'python-center',
  'react-tower',
  'mission-center',
  'achievement-hall',
  'progress-center',
];

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));
}

export default function WorldPage() {
  const t = useT();
  useDocumentTitle(t('world.title'));
  const navigate = useNavigate();
  const { level: quality, preset } = useQuality();
  const reducedMotion = useReducedMotion();
  const { hasSeenWorldIntro, update: updateSettings, lookSensitivity, invertLookY } = useSettings();
  const coarse = useIsCoarsePointer();
  const desktop = useIsDesktop();
  const { infos, statusById, level } = useBuildingInfo();

  const mode = useWorld((s) => s.mode);
  const selectedId = useWorld((s) => s.selectedId);
  const nearbyId = useWorld((s) => s.nearbyId);
  const targetedId = useWorld((s) => s.targetedId);
  const pointerLocked = useWorld((s) => s.pointerLocked);
  const { setMode, select, resetView } = useWorld.getState();

  const [webgl] = useState(isWebGLAvailable);
  const [forced2D, setForced2D] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [failure, setFailure] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(!hasSeenWorldIntro);
  const containerRef = useRef<HTMLDivElement>(null);

  const use2D = !webgl || quality === '2d' || forced2D || failure !== null;
  const selectedInfo = selectedId ? infos[selectedId] : undefined;

  useEffect(() => setMenuOpen(desktop), [desktop]);

  // Reset transient world state when leaving the page.
  useEffect(
    () => () =>
      useWorld.setState({ selectedId: null, hoveredId: null, nearbyId: null, targetedId: null, travelId: null, pointerLocked: false, mode: 'overview' }),
    [],
  );

  useEffect(() => {
    if (use2D || ready) return;
    const t = window.setTimeout(() => setSlow(true), 15000);
    return () => window.clearTimeout(t);
  }, [use2D, ready, canvasKey]);

  const onReady = useCallback(() => setReady(true), []);

  // Arriving from a world page ("3D" button): focus that building once the scene is ready.
  const location = useLocation();
  const focusId = (location.state as { focus?: BuildingId } | null)?.focus;
  useEffect(() => {
    if (!focusId || (!use2D && !ready)) return;
    select(focusId, { travel: !use2D });
    navigate('.', { replace: true, state: null });
  }, [focusId, ready, use2D, select, navigate]);
  const onContextLost = useCallback(() => setFailure('WebGL context lost'), []);

  const canvas = () => containerRef.current?.querySelector('canvas') ?? null;
  const requestLook = () => {
    const el = canvas();
    if (!el) return;
    try {
      const result = el.requestPointerLock() as unknown as Promise<void> | undefined;
      result?.catch?.(() => undefined);
    } catch {
      /* pointer lock unsupported — drag-to-look still works */
    }
  };

  const goTo = useCallback(
    (id: BuildingId) => {
      select(id, { travel: !use2D });
      if (!desktop) setMenuOpen(false);
    },
    [select, use2D, desktop],
  );

  const changeMode = (next: CameraMode) => {
    if (next === mode) return;
    if (document.pointerLockElement) document.exitPointerLock();
    setMode(next);
  };

  const enter = useCallback(
    (id: BuildingId) => {
      const info = infos[id];
      if (!info) return;
      if (info.status.locked) {
        if (document.pointerLockElement) document.exitPointerLock();
        select(id);
      } else navigate(info.def.route);
    },
    [infos, navigate, select],
  );

  // Close the panel from pointer-lock clicks; open the targeted building's panel.
  useEffect(() => {
    if (!pointerLocked) return;
    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const id = useWorld.getState().targetedId;
      if (id) {
        document.exitPointerLock();
        select(id);
      }
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [pointerLocked, select]);

  // Opening a panel releases the cursor so its buttons are clickable.
  useEffect(() => {
    if (selectedId && document.pointerLockElement) document.exitPointerLock();
  }, [selectedId]);

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey || helpOpen) return;
      const key = e.key.toLowerCase();
      if (key === 'escape' && useWorld.getState().selectedId) select(null);
      else if (key === 'e' && mode === 'walk') {
        const id = useWorld.getState().targetedId ?? useWorld.getState().nearbyId;
        if (id) enter(id);
      } else if (key === 'v' && !use2D) changeMode(mode === 'walk' ? 'overview' : 'walk');
      else if (key === 'm') setForced2D((v) => !v);
      else if (key === 'r') resetView();
      else if (key === 'h' || key === '?') setHelpOpen(true);
      else if (/^[1-8]$/.test(key)) goTo(LOCATION_ORDER[Number(key) - 1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const closeHelp = () => {
    setHelpOpen(false);
    if (!hasSeenWorldIntro) updateSettings({ hasSeenWorldIntro: true });
  };

  const promptId = mode === 'walk' && !use2D ? (targetedId ?? nearbyId) : null;
  const promptInfo = promptId ? infos[promptId] : undefined;
  const statusKey = useMemo(() => JSON.stringify(statusById), [statusById]);

  return (
    <div ref={containerRef} data-theme="dark" className="fixed inset-0 overflow-hidden bg-night-950" id="main">
      <h1 className="sr-only">{t('world.title')}</h1>

      {/* Scene */}
      {use2D ? (
        <div className="absolute inset-0 overflow-auto px-4 pb-28 pt-24">
          {!webgl && (
            <InlineAlert tone="warning" className="mx-auto mb-4 max-w-2xl">
              {t('world.noWebgl')}
            </InlineAlert>
          )}
          {failure && (
            <InlineAlert tone="error" className="mx-auto mb-4 max-w-2xl" title={t('world.lost')}>
              {failure}{' '}
              <button
                type="button"
                className="font-medium underline underline-offset-2"
                onClick={() => {
                  setFailure(null);
                  setReady(false);
                  setCanvasKey((k) => k + 1);
                }}
              >
                {t('world.retry3d')}
              </button>
            </InlineAlert>
          )}
          <WorldMap2D infos={infos} selectedId={selectedId} onSelect={(id) => select(id)} />
        </div>
      ) : (
        <ErrorBoundary
          resetKey={canvasKey}
          onError={(error) => setFailure(error.message)}
          fallback={() => null}
        >
          <Suspense fallback={null}>
            <World3D
              key={canvasKey}
              preset={preset}
              reducedMotion={reducedMotion}
              statusById={statusById}
              statusKey={statusKey}
              mode={mode}
              sensitivity={lookSensitivity}
              invertY={invertLookY}
              onReady={onReady}
              onContextLost={onContextLost}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Loading overlay */}
      {!use2D && !ready && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-night-950" role="status" aria-live="polite">
          <div className="flex flex-col items-center gap-5 px-6 text-center">
            <LogoMark className="h-14 w-14 animate-pulse" />
            <div>
              <p className="text-sm font-medium text-white">{t('world.loading')}</p>
            </div>
            <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/3 animate-[shimmer_1.2s_ease-in-out_infinite] rounded-full bg-cyan-300" style={{ transform: 'translateX(-100%)' }} />
            </div>
            {slow && (
              <div className="text-xs text-slate-400">
                {t('world.slow')}{' '}
                <button type="button" className="font-medium text-cyan-300 underline" onClick={() => setForced2D(true)}>
                  {t('world.use2d')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HUD */}
      <div className="pointer-events-none absolute inset-0 z-30">
        <header className="flex items-start justify-between gap-2 p-3 sm:p-4">
          <div className="pointer-events-auto flex items-center gap-2">
            <Link to="/" className="focus-ring glass grid h-10 w-10 place-items-center rounded-xl" aria-label={t('common.home')}>
              <LogoMark className="h-6 w-6" />
            </Link>
            <Button variant="secondary" size="md" className="glass h-10" onClick={() => navigate('/map')} icon={<LogOut className="h-4 w-4 rotate-180" />}>
              <span className="hidden sm:inline">{t('nav.map')}</span>
            </Button>
            <LanguageSwitcher className="glass hidden md:inline-flex" />
          </div>
          <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
            {!use2D && (
              <div className="glass rounded-xl p-0.5">
                <SegmentedControl<CameraMode>
                  label={t('world.title')}
                  size="sm"
                  value={mode}
                  onChange={changeMode}
                  options={[
                    { value: 'overview', label: t('world.overview'), title: `${t('world.overview')} (V)` },
                    { value: 'walk', label: t('world.explore'), title: `${t('world.explore')} (V)` },
                  ]}
                />
              </div>
            )}
            {webgl && quality !== '2d' && (
              <Button
                variant="secondary"
                size="icon"
                className="glass h-10 w-10"
                aria-label={use2D ? t('world.view3d') : t('world.map2d')}
                title={`${use2D ? t('world.view3d') : t('world.map2d')} (M)`}
                onClick={() => {
                  setFailure(null);
                  setForced2D((v) => !v);
                }}
              >
                {use2D ? <Box className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
              </Button>
            )}
            {!use2D && (
              <Button variant="secondary" size="icon" className="glass h-10 w-10" aria-label={t('world.resetCamera')} title={`${t('world.resetCamera')} (R)`} onClick={resetView}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
            <Button variant="secondary" size="icon" className="glass h-10 w-10" aria-label={t('world.help')} title={`${t('world.help')} (H)`} onClick={() => setHelpOpen(true)}>
              <CircleHelp className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="glass h-10"
              aria-expanded={menuOpen}
              aria-controls="locations-panel"
              onClick={() => setMenuOpen((o) => !o)}
              icon={<List className="h-4 w-4" />}
            >
              <span className="hidden sm:inline">{t('world.places')}</span>
            </Button>
          </div>
        </header>

        {/* Locations */}
        {menuOpen && (
          <div
            id="locations-panel"
            className="glass-strong pointer-events-auto absolute bottom-3 left-3 right-3 max-h-[46vh] overflow-y-auto rounded-2xl p-2 sm:bottom-auto sm:right-auto sm:top-20 sm:w-72 sm:max-h-[calc(100vh-7rem)]"
          >
            <div className="flex items-center justify-between px-2 pb-1 pt-1.5">
              <p className="eyebrow flex items-center gap-1.5">
                <Layers className="h-3 w-3" aria-hidden /> {t('world.places')}
              </p>
              <span className="text-[11px] text-slate-500">{t('common.levelN', { n: level })}</span>
            </div>
            <LocationMenu infos={infos} order={LOCATION_ORDER} selectedId={selectedId} onSelect={goTo} />
          </div>
        )}

        {/* Selected building */}
        {selectedInfo && (
          <div className="absolute inset-x-3 bottom-3 flex justify-center sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-20">
            <BuildingPanel
              info={selectedInfo}
              level={level}
              onClose={() => select(null)}
            />
          </div>
        )}

        {/* Explore-mode affordances */}
        {!use2D && mode === 'walk' && ready && (
          <>
            {pointerLocked && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden>
                <Crosshair className={cn('h-6 w-6 transition-colors', targetedId ? 'text-cyan-300' : 'text-white/60')} strokeWidth={1.5} />
              </div>
            )}
            {!pointerLocked && !coarse && !selectedId && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="glass-strong pointer-events-auto max-w-xs rounded-2xl p-5 text-center">
                  <MousePointerClick className="mx-auto h-7 w-7 text-cyan-300" aria-hidden />
                  <p className="mt-2 text-sm font-medium text-white">{t('world.explore')}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{t('world.walkHint')}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{t('world.releaseHint')}</p>
                  <Button className="mt-4 w-full" onClick={requestLook}>
                    {t('world.mouseLook')}
                  </Button>
                </div>
              </div>
            )}
            {promptInfo && !selectedId && (
              <div className="absolute bottom-28 left-1/2 -translate-x-1/2 sm:bottom-10">
                <div className="glass-strong pointer-events-auto flex items-center gap-3 rounded-full py-1.5 pl-4 pr-1.5">
                  <span className="text-sm text-slate-200">
                    {promptInfo.status.locked ? '🔒 ' : ''}
                    <strong className="font-medium text-white">{promptInfo.name}</strong>
                  </span>
                  <Button size="sm" onClick={() => enter(promptInfo.def.id)} icon={<DoorOpen className="h-3.5 w-3.5" />}>
                    {t('world.enter')}
                    {!coarse && <kbd className="kbd ml-1 border-night-950/20 bg-night-950/10 text-night-950">E</kbd>}
                  </Button>
                </div>
              </div>
            )}
            {coarse && (
              <div className="absolute bottom-6 left-6">
                <TouchJoystick />
              </div>
            )}
            {pointerLocked && (
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-night-950/60 px-3 py-1 text-[11px] text-slate-400">
                {t('world.releaseHint')}
              </p>
            )}
          </>
        )}

        {!use2D && mode === 'overview' && ready && !selectedId && !menuOpen && (
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-night-950/60 px-3 py-1 text-[11px] text-slate-400">
            {t('world.hint')}
          </p>
        )}
      </div>

      <WorldHelp open={helpOpen} onClose={closeHelp} />
    </div>
  );
}
