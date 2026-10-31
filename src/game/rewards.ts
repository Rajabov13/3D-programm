import { create } from 'zustand';
import type { Award } from './engine';

export interface RewardEvent {
  id: number;
  xp: number;
  levelUp?: number;
  badges: string[];
}

interface RewardState {
  queue: RewardEvent[];
  push: (award: Award) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

/** Pop-up celebrations for confirmed awards (level-ups and new badges). */
export const useRewards = create<RewardState>((set) => ({
  queue: [],
  push: (award) => {
    const levelUp = award.levelAfter > award.levelBefore ? award.levelAfter : undefined;
    if (!levelUp && award.badges.length === 0) return;
    set((s) => ({ queue: [...s.queue, { id: ++counter, xp: award.xp, levelUp, badges: award.badges }].slice(-3) }));
  },
  dismiss: (id) => set((s) => ({ queue: s.queue.filter((e) => e.id !== id) })),
}));
