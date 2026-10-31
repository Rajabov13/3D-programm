import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { claimQuest, defeatBoss, emptyState, finishStage, type GameState, type StageResult } from './engine';
import { useRewards } from './rewards';

interface GameStore {
  game: GameState;
  finishStage: (stageId: string, mistakes: number) => StageResult;
  defeatBoss: (zoneId: string) => ReturnType<typeof defeatBoss>;
  claimQuest: (questId: string) => ReturnType<typeof claimQuest>;
  reset: () => void;
}

/** Player progress, saved in this browser (demo version — no backend). */
export const useGame = create<GameStore>()(
  persist(
    (set, get) => ({
      game: emptyState(),
      finishStage: (stageId, mistakes) => {
        const result = finishStage(get().game, stageId, mistakes);
        set({ game: result.state });
        useRewards.getState().push(result.award);
        return result;
      },
      defeatBoss: (zoneId) => {
        const result = defeatBoss(get().game, zoneId);
        set({ game: result.state });
        useRewards.getState().push(result.award);
        return result;
      },
      claimQuest: (questId) => {
        const result = claimQuest(get().game, questId);
        set({ game: result.state });
        useRewards.getState().push(result.award);
        return result;
      },
      reset: () => set({ game: emptyState() }),
    }),
    { name: 'cw.game.v1', version: 1 },
  ),
);
