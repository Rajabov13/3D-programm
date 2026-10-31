import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Code2, Compass, Flag, Lock, Map as MapIcon, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { NamedIcon } from '@/components/ui/Icon';
import { useCatalog } from '@/features/content/hooks';
import { buildingById } from '@/data/buildings';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
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

const STEPS = [
  { icon: Compass, title: 'Explore the city', body: 'Walk or fly between towers. Every building is a learning area — HTML, CSS, JavaScript, Python and React.' },
  { icon: BookOpen, title: 'Learn by doing', body: 'Short lessons with runnable examples, knowledge checks and exercises verified automatically.' },
  { icon: Code2, title: 'Build in a real editor', body: 'A professional workspace with Monaco, live preview, console output and sandboxed execution.' },
  { icon: Trophy, title: 'Level up', body: 'Earn XP for real completions, unlock new districts, claim missions and collect achievements.' },
];

export default function LandingPage() {
  useDocumentTitle('Enter the World of Code');
  const { data: catalog } = useCatalog();
  const startHref = '/dashboard';

  const stats = [
    { label: 'Courses', value: catalog?.courses.length ?? '—' },
    { label: 'Lessons', value: catalog?.lessons.length ?? '—' },
    { label: 'Coding exercises', value: catalog?.exercises.length ?? '—' },
    { label: 'Missions & badges', value: catalog ? catalog.missions.length + catalog.achievements.length : '—' },
  ];

  return (
    <div className="min-h-screen">
      <div className="absolute inset-x-0 top-0 z-40">
        <Navbar transparent />
      </div>

      {/* Hero */}
      <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden" aria-labelledby="hero-title">
        <HeroBackground />
        <div id="main" className="relative mx-auto w-full max-w-7xl px-4 pb-24 pt-32 sm:px-6">
          <div className="max-w-3xl">
            <Badge tone="cyan" className="mb-6 animate-fade-in backdrop-blur">
              <Sparkles className="h-3 w-3" aria-hidden /> Interactive 3D learning platform
            </Badge>
            <h1 id="hero-title" className="animate-rise-in text-[2.6rem] font-bold leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
              ENTER THE
              <br />
              <span className="text-gradient">WORLD OF CODE</span>
            </h1>
            <p className="mt-6 max-w-xl animate-rise-in text-base leading-relaxed text-slate-300 [animation-delay:120ms] sm:text-lg">
              Learn programming by exploring a living technology city. Step into each tower to master HTML, CSS, JavaScript, Python and React —
              writing real code, solving missions and unlocking new districts as you grow.
            </p>
            <div className="mt-9 flex animate-rise-in flex-wrap gap-3 [animation-delay:200ms]">
              <ButtonLink to={startHref} size="lg" icon={<ArrowRight className="h-4 w-4" />}>
                Start Learning
              </ButtonLink>
              <ButtonLink to="/world" size="lg" variant="secondary" className="backdrop-blur" icon={<MapIcon className="h-4 w-4" />}>
                Explore the World
              </ButtonLink>
            </div>
          </div>
          <dl className="mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] backdrop-blur-md sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-night-950/60 px-5 py-4">
                <dt className="text-xs text-slate-400">{s.label}</dt>
                <dd className="mt-1 text-2xl font-semibold text-white">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <main className="relative mx-auto max-w-7xl space-y-28 px-4 sm:px-6">
        {/* Course districts */}
        <section aria-labelledby="courses-title">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="eyebrow mb-2">Districts</p>
              <h2 id="courses-title" className="text-3xl md:text-4xl">
                Five towers. One skill tree.
              </h2>
              <p className="mt-3 max-w-xl text-slate-400">Each course lives in its own building, from beginner fundamentals to advanced techniques.</p>
            </div>
            <ButtonLink to="/courses" variant="ghost" icon={<ArrowRight className="h-4 w-4" />}>
              All courses
            </ButtonLink>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {(catalog?.courses ?? []).map((course) => {
              const building = buildingById(course.buildingId);
              const lessons = catalog?.lessons.filter((l) => l.courseId === course.id).length ?? 0;
              return (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="focus-ring glass group relative flex flex-col overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-30 blur-2xl transition-opacity group-hover:opacity-60" style={{ background: course.accent }} />
                  <span className="grid h-11 w-11 place-items-center rounded-xl border font-mono text-sm font-semibold" style={{ borderColor: `${course.accent}55`, color: course.accent, background: `${course.accent}12` }}>
                    {building?.symbol ?? '</>'}
                  </span>
                  <h3 className="mt-5 text-base">{course.title}</h3>
                  <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-slate-400">{course.tagline}</p>
                  <div className="mt-5 flex items-center justify-between text-[12px] text-slate-500">
                    <span>{lessons} lessons</span>
                    {course.requiredLevel > 1 ? (
                      <span className="inline-flex items-center gap-1">
                        <Lock className="h-3 w-3" aria-hidden /> Lv {course.requiredLevel}
                      </span>
                    ) : (
                      <span className="text-emerald-300/80">Open</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section aria-labelledby="how-title">
          <p className="eyebrow mb-2">How it works</p>
          <h2 id="how-title" className="text-3xl md:text-4xl">
            A game world with a serious workshop inside
          </h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <Icon className="h-6 w-6 text-cyan-300" aria-hidden />
                  <span className="font-mono text-xs text-slate-600">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-base">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Missions & achievements */}
        <section aria-labelledby="missions-title" className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-2">Missions</p>
            <h2 id="missions-title" className="text-3xl md:text-4xl">
              Objectives that reward real progress
            </h2>
            <p className="mt-3 max-w-lg text-slate-400">
              XP is only granted for verified completions — passing checks, finishing lessons and meeting mission goals. No repeat farming.
            </p>
            <ul className="mt-8 space-y-3">
              {(catalog?.missions ?? []).slice(0, 4).map((m) => (
                <li key={m.id} className="glass flex items-center gap-4 rounded-xl p-4">
                  <Flag className="h-5 w-5 shrink-0 text-pink-300" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">{m.title}</p>
                    <p className="truncate text-[13px] text-slate-400">{m.description}</p>
                  </div>
                  <Badge tone="cyan">+{m.xp} XP</Badge>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-2">Achievement Hall</p>
            <h2 className="text-3xl md:text-4xl">Badges worth displaying</h2>
            <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {(catalog?.achievements ?? []).slice(0, 9).map((a) => (
                <li key={a.id} className="glass flex flex-col items-center rounded-xl p-4 text-center">
                  <span
                    className={cn(
                      'grid h-11 w-11 place-items-center rounded-full border',
                      a.tier === 'gold' && 'border-amber-300/40 bg-amber-300/10 text-amber-300',
                      a.tier === 'silver' && 'border-slate-300/40 bg-slate-300/10 text-slate-200',
                      a.tier === 'bronze' && 'border-orange-400/40 bg-orange-400/10 text-orange-300',
                      a.tier === 'platinum' && 'border-cyan-200/40 bg-cyan-200/10 text-cyan-100',
                    )}
                  >
                    <NamedIcon name={a.icon} className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-[13px] font-medium text-white">{a.title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{a.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="glass-strong relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(92,225,255,0.15),transparent_60%)]" />
          <ShieldCheck className="mx-auto h-8 w-8 text-cyan-300" aria-hidden />
          <h2 className="relative mt-4 text-3xl md:text-4xl">Your first tower is open.</h2>
          <p className="relative mx-auto mt-3 max-w-lg text-slate-400">HTML Academy is unlocked for every new explorer. Write your first page in under ten minutes.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink to="/courses/html" size="lg" icon={<ArrowRight className="h-4 w-4" />}>
              Begin HTML Foundations
            </ButtonLink>
            <ButtonLink to="/playground" size="lg" variant="secondary" icon={<Code2 className="h-4 w-4" />}>
              Open the playground
            </ButtonLink>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
