import { lazy, Suspense, useEffect, useState } from 'react';
import { Building2, Gamepad2, Play, Swords, Trophy } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { ButtonLink } from '@/components/ui/Button';
import { ZONES } from '@/game/content';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useT } from '@/i18n';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';
import { useQuality } from '@/three/quality';
import { isWebGLAvailable } from '@/three/webgl';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const HeroScene = lazy(() => import('@/three/HeroScene'));

function SkylinePoster() {
  // Static fallback / poster shown before (or instead of) the WebGL hero.
  const towers = [
    [4, 38], [10, 54], [16, 30], [21, 66], [27, 44], [33, 72], [40, 50], [46, 84], [52, 58], [58, 76], [64, 40], [70, 62], [76, 48], [82, 70], [88, 36], [94, 52],
  ];
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(56,189,248,0.18),transparent_60%)]" />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute bottom-0 h-[55%] w-full opacity-70">
        <defs>
          <linearGradient id="tower" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#1e3a5f" />
            <stop offset="1" stopColor="#060b16" />
          </linearGradient>
        </defs>
        {towers.map(([x, h]) => (
          <g key={x}>
            <rect x={x - 2.4} y={100 - h} width={4.8} height={h} fill="url(#tower)" />
            <rect x={x - 2.4} y={100 - h} width={4.8} height={0.4} fill="#5ce1ff" opacity="0.6" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function HeroBackground() {
  const reduced = useReducedMotion();
  const { level } = useQuality();
  const [mount, setMount] = useState(false);
  const [ready, setReady] = useState(false);
  const enabled = level !== '2d' && isWebGLAvailable();

  useEffect(() => {
    if (!enabled) return;
    // Defer the 3D bundle until the page is interactive.
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const handle = idle ? idle(() => setMount(true)) : window.setTimeout(() => setMount(true), 300);
    return () => {
      if (!idle) window.clearTimeout(handle);
    };
  }, [enabled]);

  return (
    <div className="pointer-events-none absolute inset-0">
      <SkylinePoster />
      {mount && (
        <ErrorBoundary fallback={() => null}>
          <Suspense fallback={null}>
            <div className={cn('absolute inset-0 transition-opacity duration-1000', ready ? 'opacity-100' : 'opacity-0')}>
              <HeroScene animate={!reduced} onReady={() => setReady(true)} />
            </div>
          </Suspense>
        </ErrorBoundary>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-night-950/70 via-night-950/20 to-night-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(3,6,13,0.75)_100%)]" />
    </div>
  );
}

export default function LandingPage() {
  const t = useT();
  useDocumentTitle(`${t('landing.title1')} ${t('landing.title2')}`);
  const features = [
    { icon: Gamepad2, title: t('landing.f1'), body: t('landing.f1d'), color: 'text-cyan-300' },
    { icon: Swords, title: t('landing.f2'), body: t('landing.f2d'), color: 'text-rose-300' },
    { icon: Trophy, title: t('landing.f3'), body: t('landing.f3d'), color: 'text-amber-300' },
  ];

  return (
    <div className="min-h-screen">
      <div className="absolute inset-x-0 top-0 z-40">
        <Navbar transparent />
      </div>

      <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden" aria-labelledby="hero-title">
        <HeroBackground />
        <div id="main" className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-28 sm:px-6">
          <div className="max-w-2xl">
            <h1 id="hero-title" className="animate-rise-in text-[2.6rem] font-black leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
              {t('landing.title1')}
              <br />
              <span className="text-gradient">{t('landing.title2')}</span>
            </h1>
            <p className="mt-6 max-w-lg animate-rise-in text-lg leading-relaxed text-slate-300 [animation-delay:120ms]">{t('landing.subtitle')}</p>
            <div className="mt-9 flex animate-rise-in flex-wrap gap-3 [animation-delay:200ms]">
              <ButtonLink to="/map" size="lg" className="px-8 text-lg" icon={<Play className="h-5 w-5 fill-current" />}>
                {t('landing.play')}
              </ButtonLink>
              <ButtonLink to="/world" size="lg" variant="secondary" className="backdrop-blur" icon={<Building2 className="h-5 w-5" />}>
                {t('landing.explore')}
              </ButtonLink>
            </div>
            <ul className="mt-12 flex animate-fade-in flex-wrap gap-2 [animation-delay:300ms]" aria-label={t('map.title')}>
              {ZONES.map((z) => (
                <li
                  key={z.id}
                  className="rounded-xl border px-3 py-1.5 font-mono text-sm font-bold backdrop-blur"
                  style={{ borderColor: `${z.accent}55`, color: z.accent, background: `${z.accent}14` }}
                  title={t(z.nameKey)}
                >
                  {z.symbol}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <main className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <ul className="grid gap-4 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, body, color }) => (
            <li key={title} className="glass rounded-3xl p-6">
              <Icon className={`h-9 w-9 ${color}`} aria-hidden />
              <h2 className="mt-4 text-xl">{title}</h2>
              <p className="mt-1 text-slate-400">{body}</p>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
}
