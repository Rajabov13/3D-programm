import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell, GameShell, WorkspaceShell } from '@/components/layout/AppShell';
import { RouteError } from '@/pages/RouteError';
import LandingPage from '@/pages/LandingPage';

const MapPage = lazy(() => import('@/pages/MapPage'));
const ZonePage = lazy(() => import('@/pages/ZonePage'));
const PlayPage = lazy(() => import('@/pages/PlayPage'));
const BossPage = lazy(() => import('@/pages/BossPage'));
const QuestsPage = lazy(() => import('@/pages/QuestsPage'));
const BadgesPage = lazy(() => import('@/pages/BadgesPage'));
const WorldPage = lazy(() => import('@/pages/WorldPage'));
const PlaygroundPage = lazy(() => import('@/pages/PlaygroundPage'));
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

/** Old links (previous course-based version) lead somewhere sensible. */
const redirects = ['/dashboard', '/courses/*', '/courses', '/missions', '/progress', '/practice/*', '/admin/*'].map((path) => ({
  path,
  element: <Navigate to={path.startsWith('/missions') ? '/quests' : '/map'} replace />,
}));

export const router = createBrowserRouter(
  [
    { path: '/', element: <LandingPage />, errorElement: <RouteError /> },
    { path: '/world', element: <WorldPage />, errorElement: <RouteError /> },
    {
      element: <GameShell />,
      errorElement: <RouteError />,
      children: [
        { path: '/play/:stageId', element: <PlayPage /> },
        { path: '/boss/:zoneId', element: <BossPage /> },
      ],
    },
    {
      element: <WorkspaceShell />,
      errorElement: <RouteError />,
      children: [{ path: '/lab', element: <PlaygroundPage /> }],
    },
    {
      element: <AppShell />,
      errorElement: <RouteError />,
      children: [
        { path: '/map', element: <MapPage /> },
        { path: '/zone/:zoneId', element: <ZonePage /> },
        { path: '/quests', element: <QuestsPage /> },
        { path: '/badges', element: <BadgesPage /> },
        { path: '/leaderboard', element: <LeaderboardPage /> },
        { path: '/settings', element: <SettingsPage /> },
        { path: '/profile', element: <ProfilePage /> },
        { path: '/playground', element: <Navigate to="/lab" replace /> },
        { path: '/achievements', element: <Navigate to="/badges" replace /> },
        ...redirects,
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  {
    // Works both at the domain root and in a sub-folder (GitHub Pages: /3D-programm/).
    basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
    future: { v7_relativeSplatPath: true, v7_fetcherPersist: true, v7_normalizeFormMethod: true, v7_partialHydration: true, v7_skipActionErrorRevalidation: true } },
);
