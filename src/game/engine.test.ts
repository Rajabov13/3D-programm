import { describe, expect, it } from 'vitest';
import { QUESTS, ZONES } from './content';
import {
  claimQuest,
  defeatBoss,
  emptyState,
  finishStage,
  gameStats,
  isBossUnlocked,
  levelForXp,
  nextGoal,
  questProgress,
  starsForMistakes,
  streak,
  xpForLevel,
  type GameState,
} from './engine';

const day1 = new Date('2026-10-29T10:00:00');
const day2 = new Date('2026-10-30T10:00:00');
const day3 = new Date('2026-10-31T10:00:00');
const html = ZONES.find((z) => z.id === 'html')!;

function clearZone(state: GameState, zoneId: string, now = day1): GameState {
  let s = state;
  for (const stage of ZONES.find((z) => z.id === zoneId)!.stages) s = finishStage(s, stage.id, 0, now).state;
  return s;
}

describe('levels and stars', () => {
  it('uses the documented curve', () => {
    expect([1, 2, 3, 4, 5].map(xpForLevel)).toEqual([0, 100, 250, 450, 700]);
    expect(levelForXp(99)).toBe(1);
    expect(levelForXp(250)).toBe(3);
  });
  it('maps mistakes to stars', () => {
    expect([0, 1, 2].map(starsForMistakes)).toEqual([3, 2, 1]);
  });
});

describe('stages', () => {
  it('awards clear + star XP and first badges', () => {
    const r = finishStage(emptyState(), 'html-1', 0, day1);
    expect(r.stars).toBe(3);
    // 10 clear + 30 stars + badges "first" (10) and "flawless" (10)
    expect(r.state.xp).toBe(60);
    expect(r.award.badges.sort()).toEqual(['first', 'flawless']);
  });

  it('never re-awards XP on replays, and only pays for new stars', () => {
    let s = finishStage(emptyState(), 'html-1', 2, day1).state; // 1 star: 10 + 10 + badge 10
    expect(s.xp).toBe(30);
    const replay = finishStage(s, 'html-1', 2, day1);
    expect(replay.award.xp).toBe(0);
    s = finishStage(replay.state, 'html-1', 0, day1).state; // +2 stars (20) + flawless badge (10)
    expect(s.xp).toBe(60);
    expect(finishStage(s, 'html-1', 0, day1).award.xp).toBe(0);
  });

  it('keeps stages, worlds and bosses locked until earned', () => {
    expect(() => finishStage(emptyState(), 'html-2', 0, day1)).toThrow(/locked/);
    expect(() => finishStage(emptyState(), 'css-1', 0, day1)).toThrow(/locked/);
    expect(() => finishStage(emptyState(), 'html-1', 3, day1)).toThrow();
    const s = finishStage(emptyState(), 'html-1', 0, day1).state;
    expect(isBossUnlocked(s, html)).toBe(false);
    expect(() => defeatBoss(s, 'html', day1)).toThrow(/locked/);
  });

  it('unlocks the boss and new worlds as you progress', () => {
    const s = clearZone(emptyState(), 'html');
    expect(isBossUnlocked(s, html)).toBe(true);
    expect(nextGoal(s)).toMatchObject({ zone: { id: 'html' }, boss: true });
    const won = defeatBoss(s, 'html', day1);
    expect(won.award.xp).toBeGreaterThanOrEqual(50);
    expect(defeatBoss(won.state, 'html', day1)).toMatchObject({ already: true, award: { xp: 0 } });
    expect(levelForXp(won.state.xp)).toBeGreaterThanOrEqual(3);
    // CSS and Python unlock at level 2, so the next goal moves on.
    expect(nextGoal(won.state)?.zone.id).toBe('css');
  });
});

describe('quests and streaks', () => {
  it('quests are claimable once per day after the goal is met', () => {
    const quest = QUESTS.find((q) => q.id === 'stages')!;
    let s = finishStage(emptyState(), 'html-1', 0, day1).state;
    expect(() => claimQuest(s, 'stages', day1)).toThrow();
    s = finishStage(s, 'html-1', 1, day1).state; // replays count for quests
    expect(questProgress(s, quest, day1).met).toBe(true);
    const claimed = claimQuest(s, 'stages', day1);
    expect(claimed.award.xp).toBe(15);
    expect(claimQuest(claimed.state, 'stages', day1).award.xp).toBe(0);
    expect(questProgress(claimed.state, quest, day2)).toMatchObject({ current: 0, claimed: false });
  });

  it('counts consecutive active days and awards the streak badge', () => {
    let s = finishStage(emptyState(), 'html-1', 0, day1).state;
    s = finishStage(s, 'html-1', 0, day2).state;
    const r = finishStage(s, 'html-1', 0, day3);
    expect(streak(r.state, day3)).toBe(3);
    expect(r.award.badges).toContain('streak-3');
    expect(gameStats(r.state, day3).stars).toBe(3);
  });
});
