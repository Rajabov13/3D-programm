import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { ProfileProvider } from '@/features/profile/ProfileProvider';
import { Toaster } from '@/components/Toaster';
import { RewardToaster } from '@/components/RewardToaster';
import { useMotionAttribute } from '@/hooks/useReducedMotion';
import { AppError } from '@/lib/errors';
import { router } from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (count, error) => {
        if (error instanceof AppError && ['NOT_FOUND', 'VALIDATION'].includes(error.code)) return false;
        return count < 2;
      },
    },
    mutations: { retry: false },
  },
});

function GlobalEffects() {
  useMotionAttribute();
  return null;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProfileProvider>
        <GlobalEffects />
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
        <Toaster />
        <RewardToaster />
      </ProfileProvider>
    </QueryClientProvider>
  );
}
