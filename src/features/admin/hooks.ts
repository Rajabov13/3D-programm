import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getContentRepository } from '@/features/content';
import type { ContentRepository } from '@/features/content/repository';
import { readProfile } from '@/features/profile/ProfileProvider';
import { getProgressService } from '@/features/progress/hooks';
import { toast } from '@/components/ui/toast';
import { addDays } from '@/lib/dates';
import { errorMessage } from '@/lib/errors';

export function usePrivateContent() {
  return useQuery({
    queryKey: ['private-content'],
    queryFn: () => getContentRepository().loadPrivate(),
    staleTime: 60_000,
  });
}

/** Admin write wrapped with cache invalidation + feedback (demo: saved in this browser). */
export function useAdminMutation<T>(action: (repo: ContentRepository, input: T) => Promise<void>, successMessage?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: T) => action(getContentRepository(), input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['catalog'] }),
        queryClient.invalidateQueries({ queryKey: ['private-content'] }),
        queryClient.invalidateQueries({ queryKey: ['progress'] }),
      ]);
      if (successMessage) toast.success(successMessage);
    },
    onError: (error) => toast.error('Save failed', errorMessage(error)),
  });
}

export interface ActivitySummary {
  totals: {
    learners: number;
    activeLearners7d: number;
    submissions7d: number;
    passedSubmissions7d: number;
    lessonsCompleted7d: number;
    xpAwarded7d: number;
    quizAttempts7d: number;
  };
  daily: Array<{ day: string; xp: number; activeLearners: number; submissions: number }>;
  topExercises: Array<{ exerciseId: string; title: string; attempts: number; passed: number }>;
  recent: Array<{ displayName: string; description: string; amount: number; sourceType: string; createdAt: string }>;
  source: 'demo';
}

async function activitySummary(days: number): Promise<ActivitySummary> {
  const snapshot = await getProgressService().getSnapshot();
  const name = readProfile().displayName;
  const since = Date.now() - 7 * 86_400_000;
  const recentTx = snapshot.transactions.filter((t) => new Date(t.createdAt).getTime() >= since);
  const daily = Array.from({ length: days }, (_, i) => {
    const day = addDays(snapshot.today, i - days + 1);
    const xp = snapshot.activity[day] ?? 0;
    return { day, xp, activeLearners: xp > 0 ? 1 : 0, submissions: snapshot.transactions.filter((t) => t.sourceType === 'exercise' && t.createdAt.startsWith(day)).length };
  });
  return {
    source: 'demo',
    totals: {
      learners: 1,
      activeLearners7d: daily.slice(-7).some((d) => d.xp > 0) ? 1 : 0,
      submissions7d: recentTx.filter((t) => t.sourceType === 'exercise').length,
      passedSubmissions7d: recentTx.filter((t) => t.sourceType === 'exercise').length,
      lessonsCompleted7d: recentTx.filter((t) => t.sourceType === 'lesson').length,
      xpAwarded7d: recentTx.reduce((s, t) => s + t.amount, 0),
      quizAttempts7d: Object.values(snapshot.quizzes).reduce((s, q) => s + q.attempts, 0),
    },
    daily,
    topExercises: [],
    recent: snapshot.transactions.slice(0, 25).map((t) => ({ displayName: name, description: t.description, amount: t.amount, sourceType: t.sourceType, createdAt: t.createdAt })),
  };
}

export function useActivitySummary(days = 14) {
  return useQuery({
    queryKey: ['admin-activity', days],
    queryFn: () => activitySummary(days),
  });
}
