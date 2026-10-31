import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageLoader } from '@/components/ui/Feedback';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

export function AppShell() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 outline-none sm:px-6 md:py-10">
        <ErrorBoundary resetKey={location.pathname}>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

/** Full-bleed layout (code editor): navbar but no footer or max-width container. */
export function WorkspaceShell() {
  const location = useLocation();
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <Navbar />
      <main id="main" tabIndex={-1} className="min-h-0 flex-1 outline-none">
        <ErrorBoundary resetKey={location.pathname}>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

/** Full-screen layout (mini-game): no navigation at all. */
export function GameShell() {
  const location = useLocation();
  return (
    <ErrorBoundary resetKey={location.pathname}>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </ErrorBoundary>
  );
}
