import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell, WorkspaceShell } from '@/components/layout/AppShell';
import { RouteError } from '@/pages/RouteError';
import LandingPage from '@/pages/LandingPage';

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const WorldPage = lazy(() => import('@/pages/WorldPage'));
const CoursesPage = lazy(() => import('@/pages/CoursesPage'));
const CoursePage = lazy(() => import('@/pages/CoursePage'));
const LessonPage = lazy(() => import('@/pages/LessonPage'));
const ExercisePage = lazy(() => import('@/pages/ExercisePage'));
const PlaygroundPage = lazy(() => import('@/pages/PlaygroundPage'));
const MissionsPage = lazy(() => import('@/pages/MissionsPage'));
const AchievementsPage = lazy(() => import('@/pages/AchievementsPage'));
const ProgressPage = lazy(() => import('@/pages/ProgressPage'));
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverviewPage'));
const AdminCoursesPage = lazy(() => import('@/pages/admin/AdminCoursesPage'));
const AdminCourseEditPage = lazy(() => import('@/pages/admin/AdminCourseEditPage'));
const AdminLessonEditPage = lazy(() => import('@/pages/admin/AdminLessonEditPage'));
const AdminExerciseEditPage = lazy(() => import('@/pages/admin/AdminExerciseEditPage'));
const AdminAchievementsPage = lazy(() => import('@/pages/admin/AdminAchievementsPage'));
const AdminMissionsPage = lazy(() => import('@/pages/admin/AdminMissionsPage'));

export const router = createBrowserRouter(
  [
    { path: '/', element: <LandingPage />, errorElement: <RouteError /> },
    { path: '/world', element: <WorldPage />, errorElement: <RouteError /> },
    {
      element: <WorkspaceShell />,
      errorElement: <RouteError />,
      children: [
        { path: '/practice/:exerciseId', element: <ExercisePage /> },
        { path: '/playground', element: <PlaygroundPage /> },
      ],
    },
    {
      element: <AppShell />,
      errorElement: <RouteError />,
      children: [
        { path: '/dashboard', element: <DashboardPage /> },
        { path: '/courses', element: <CoursesPage /> },
        { path: '/courses/:courseId', element: <CoursePage /> },
        { path: '/courses/:courseId/lessons/:lessonId', element: <LessonPage /> },
        { path: '/missions', element: <MissionsPage /> },
        { path: '/achievements', element: <AchievementsPage /> },
        { path: '/progress', element: <ProgressPage /> },
        { path: '/leaderboard', element: <LeaderboardPage /> },
        { path: '/settings', element: <SettingsPage /> },
        { path: '/profile', element: <ProfilePage /> },
        {
          path: '/admin',
          element: <AdminLayout />,
          children: [
            { index: true, element: <AdminOverviewPage /> },
            { path: 'courses', element: <AdminCoursesPage /> },
            { path: 'courses/:courseId', element: <AdminCourseEditPage /> },
            { path: 'lessons/:lessonId', element: <AdminLessonEditPage /> },
            { path: 'exercises/:exerciseId', element: <AdminExerciseEditPage /> },
            { path: 'achievements', element: <AdminAchievementsPage /> },
            { path: 'missions', element: <AdminMissionsPage /> },
          ],
        },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { future: { v7_relativeSplatPath: true, v7_fetcherPersist: true, v7_normalizeFormMethod: true, v7_partialHydration: true, v7_skipActionErrorRevalidation: true } },
);
