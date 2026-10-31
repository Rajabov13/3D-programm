import { create } from 'zustand';
import type { AwardSummary } from '@/types';

export interface RewardEvent {
  id: number;
  title: string;
  xp: number;
  levelUp?: number;
  achievements: string[];
  dailyGoal: boolean;
}

interface RewardState {
  queue: RewardEvent[];
  push: (title: string, award: AwardSummary) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

/** Celebrations shown only after real, confirmed awards. */
export const useRewards = create<RewardState>((set) => ({
  queue: [],
  push: (title, award) => {
    if (award.xpAwarded <= 0 && award.newAchievements.length === 0) return;
    const event: RewardEvent = {
      id: ++counter,
      title,
      xp: award.xpAwarded,
      levelUp: award.levelAfter > award.levelBefore ? award.levelAfter : undefined,
      achievements: award.newAchievements,
      dailyGoal: award.dailyGoalReached,
    };
    set((s) => ({ queue: [...s.queue, event].slice(-4) }));
  },
  dismiss: (id) => set((s) => ({ queue: s.queue.filter((e) => e.id !== id) })),
}));
