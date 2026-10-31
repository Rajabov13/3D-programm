import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { Catalog } from '@/types';
import { getContentRepository } from './index';
import { publishedView } from './published';

export const catalogQueryKey = ['catalog'] as const;

function sortCatalog(c: Catalog): Catalog {
  const byOrder = <T extends { order: number }>(list: T[]) => [...list].sort((a, b) => a.order - b.order);
  return {
    courses: byOrder(c.courses),
    lessons: byOrder(c.lessons),
    exercises: byOrder(c.exercises),
    quizQuestions: byOrder(c.quizQuestions),
    missions: byOrder(c.missions),
    achievements: byOrder(c.achievements),
  };
}

/** Everything the current user may read (admins also receive unpublished drafts). */
export function useFullCatalog() {
  return useQuery({
    queryKey: catalogQueryKey,
    queryFn: async () => sortCatalog(await getContentRepository().loadCatalog()),
    staleTime: 5 * 60_000,
  });
}

/** Learner-facing view: only published content whose parents are published too. */
export function useCatalog() {
  const query = useFullCatalog();
  const catalog = useMemo<Catalog | undefined>(() => (query.data ? publishedView(query.data) : undefined), [query.data]);
  return { ...query, data: catalog };
}
