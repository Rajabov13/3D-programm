import { RouterProvider } from 'react-router-dom';
import { ProfileProvider } from '@/features/profile/ProfileProvider';
import { Toaster } from '@/components/Toaster';
import { RewardToaster } from '@/components/RewardToaster';
import { useMotionAttribute } from '@/hooks/useReducedMotion';
import { useThemeAttribute } from '@/hooks/useTheme';
import { useHtmlLang } from '@/i18n';
import { router } from './router';

function GlobalEffects() {
  useMotionAttribute();
  useHtmlLang();
  useThemeAttribute();
  return null;
}

export function App() {
  return (
    <ProfileProvider>
      <GlobalEffects />
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
      <Toaster />
      <RewardToaster />
    </ProfileProvider>
  );
}
