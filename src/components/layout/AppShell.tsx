import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageLoader } from '@/components/ui/Feedback';
import { useLocation } from 'react-router-dom';
import { Footer } from './Footer';
import { ModeBanner } from './ModeBanner';
import { Navbar } from './Navbar';

export function AppShell() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <ModeBanner />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 outline-none sm:px-6 md:py-10">
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

/** Full-bleed layout (editor workspace): navbar but no footer or max-width container. */
export function WorkspaceShell() {
  const location = useLocation();
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <Navbar />
      <ModeBanner />
      <main id="main" tabIndex={-1} className="min-h-0 flex-1 outline-none">
        <ErrorBoundary resetKey={location.pathname}>
          <Suspense fallback={<PageLoader label="Loading workspace…" />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
