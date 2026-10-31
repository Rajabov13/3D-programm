import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { ExerciseFiles } from '@shared/checks';
import { getContentRepository } from '@/features/content';
import { useCatalog } from '@/features/content/hooks';
import { readProfile, useProfile } from '@/features/profile/ProfileProvider';
import { computeStats } from './engine';
import { LocalProgressService } from './localService';
import { useRewards } from './rewards';
import type { AccountSettingsPatch, ClientEvaluation } from './service';

let service: LocalProgressService | null = null;

/** Progress stored in this browser (demo version — no backend). */
export function getProgressService(): LocalProgressService {
  if (!service) service = new LocalProgressService(getContentRepository(), readProfile);
  return service;
}

export const progressQueryKey = ['progress'] as const;

export function useProgress() {
  const catalogQuery = useCatalog();
  const query = useQuery({
    queryKey: progressQueryKey,
    queryFn: () => getProgressService().getSnapshot(),
    staleTime: 30_000,
  });
  const snapshot = query.data;
  const catalog = catalogQuery.data;
  const stats = useMemo(() => (snapshot && catalog ? computeStats(snapshot, catalog) : undefined), [snapshot, catalog]);
  return {
    snapshot,
    stats,
    catalog,
    isLoading: query.isLoading || catalogQuery.isLoading,
    error: query.error ?? catalogQuery.error,
    refetch: () => Promise.all([query.refetch(), catalogQuery.refetch()]),
  };
}

export function useProgressActions() {
  const queryClient = useQueryClient();
  const push = useRewards((s) => s.push);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: progressQueryKey });

  const completeLesson = useMutation({
    mutationFn: ({ lessonId }: { lessonId: string; title: string }) => getProgressService().completeLesson(lessonId),
    onSuccess: (award, vars) => {
      push(`Lesson complete: ${vars.title}`, award);
      return invalidate();
    },
  });

  const submitQuiz = useMutation({
    mutationFn: ({ lessonId, answers }: { lessonId: string; answers: number[]; title: string }) => getProgressService().submitQuiz(lessonId, answers),
    onSuccess: (result, vars) => {
      if (result.passed) push(`Knowledge check passed: ${vars.title}`, result.award);
      return invalidate();
    },
  });

  const submitExercise = useMutation({
    mutationFn: ({ exerciseId, files, evaluation }: { exerciseId: string; files: ExerciseFiles; evaluation: ClientEvaluation; title: string }) =>
      getProgressService().submitExercise(exerciseId, files, evaluation),
    onSuccess: (result, vars) => {
      if (result.passed) push(`Exercise passed: ${vars.title}`, result.award);
      return invalidate();
    },
  });

  const claimMission = useMutation({
    mutationFn: ({ missionId }: { missionId: string; title: string }) => getProgressService().claimMission(missionId),
    onSuccess: (award, vars) => {
      push(`Mission complete: ${vars.title}`, award);
      return invalidate();
    },
  });

  const updateAccountSettings = useMutation({
    mutationFn: (patch: AccountSettingsPatch) => getProgressService().updateAccountSettings(patch),
    onSuccess: () => invalidate(),
  });

  return { completeLesson, submitQuiz, submitExercise, claimMission, updateAccountSettings };
}

export function useLeaderboard() {
  const { profile } = useProfile();
  return useQuery({
    queryKey: ['leaderboard', profile.showOnLeaderboard, profile.displayName, profile.avatar],
    queryFn: () => getProgressService().getLeaderboard(),
    staleTime: 60_000,
  });
}
