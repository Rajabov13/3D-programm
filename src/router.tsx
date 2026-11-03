import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell, GameShell, WorkspaceShell } from '@/components/layout/AppShell';
import { lazyPage } from '@/lib/chunks';
import { RouteError } from '@/pages/RouteError';
import LandingPage from '@/pages/LandingPage';

const MapPage = lazyPage(() => import('@/pages/MapPage'));
const ZonePage = lazyPage(() => import('@/pages/ZonePage'));
const PlayPage = lazyPage(() => import('@/pages/PlayPage'));
const BossPage = lazyPage(() => import('@/pages/BossPage'));
const QuestsPage = lazyPage(() => import('@/pages/QuestsPage'));
const BadgesPage = lazyPage(() => import('@/pages/BadgesPage'));
const WorldPage = lazyPage(() => import('@/pages/WorldPage'));
const PlaygroundPage = lazyPage(() => import('@/pages/PlaygroundPage'));
const LeaderboardPage = lazyPage(() => import('@/pages/LeaderboardPage'));
const ProfilePage = lazyPage(() => import('@/pages/ProfilePage'));
const SettingsPage = lazyPage(() => import('@/pages/SettingsPage'));
const NotFoundPage = lazyPage(() => import('@/pages/NotFoundPage'));

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
