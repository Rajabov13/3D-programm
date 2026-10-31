/**
 * Game rules — pure functions over a serialisable state (saved in localStorage).
 *  - Stars: 0 mistakes → 3, 1 → 2, 2 → 1 (three hearts: the third mistake ends the run).
 *  - XP: +10 for the first clear of a stage, +10 for every new best star. Replays never
 *    re-award XP; every reward goes through an idempotency ledger.
 *  - Stages unlock in order; the boss unlocks when every stage of its world is cleared;
 *    worlds unlock by player level.
 */
import { addDays, dateKey } from '@/lib/dates';
import { BADGES, QUESTS, ZONES, stageById, zoneById, zoneOfStage } from './content';
import type { Badge, BadgeGoal, Quest, QuestGoal, Zone } from './types';

export const MAX_HEARTS = 3;
export const STAGE_CLEAR_XP = 10;
export const STAR_XP = 10;
export const MAX_LEVEL = 100;
const HISTORY_LIMIT = 50;

export interface DayStats {
  /** XP from stages, bosses and badges (quest rewards excluded). */
  xp: number;
  stages: number;
  perfect: number;
  bosses: number;
}

export type XpKind = 'stage' | 'boss' | 'badge' | 'quest';

export interface XpEvent {
  at: string;
  amount: number;
  kind: XpKind;
  ref: string;
}

export interface GameState {
  version: 1;
  xp: number;
  /** stageId → best stars (1–3) */
  stars: Record<string, number>;
  /** zoneId → defeated at */
  bosses: Record<string, string>;
  /** badgeId → earned at */
  badges: Record<string, string>;
  /** `${day}:${questId}` → claimed at */
  quests: Record<string, string>;
  /** reward key → XP granted (idempotency ledger) */
  ledger: Record<string, number>;
  history: XpEvent[];
  days: Record<string, DayStats>;
}

export interface Award {
  xp: number;
  levelBefore: number;
  levelAfter: number;
  badges: string[];
}

export class GameError extends Error {
  constructor(
    readonly code: 'LOCKED' | 'NOT_FOUND' | 'NOT_READY',
    message: string,
  ) {
    super(message);
  }
}

export function emptyState(): GameState {
  return { version: 1, xp: 0, stars: {}, bosses: {}, badges: {}, quests: {}, ledger: {}, history: [], days: {} };
}

// ─── Levels ─────────────────────────────────────────────────────────────────

/** Total XP needed to reach `level`: 0, 100, 250, 450, 700, 1000 … */
export function xpForLevel(level: number): number {
  const l = Math.max(1, Math.floor(level));
  return 25 * (l - 1) * (l + 2);
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (level < MAX_LEVEL && xpForLevel(level + 1) <= xp) level++;
  return level;
}

export function levelProgress(xp: number) {
  const level = levelForXp(xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, current: xp - base, needed: next - base, toNext: next - xp, ratio: (xp - base) / (next - base) };
}

export function starsForMistakes(mistakes: number): number {
  if (mistakes <= 0) return 3;
  if (mistakes === 1) return 2;
  return 1;
}

// ─── Derived stats ──────────────────────────────────────────────────────────

export function today(now = new Date()): string {
  return dateKey(now);
}

export function streak(state: GameState, now = new Date()): number {
  let day = today(now);
  const active = (d: string) => (state.days[d]?.stages ?? 0) > 0;
  if (!active(day)) day = addDays(day, -1);
  let n = 0;
  while (active(day) && n < 3650) {
    n++;
    day = addDays(day, -1);
  }
  return n;
}

export interface GameStats {
  level: number;
  stagesCleared: number;
  perfectStages: number;
  stars: number;
  bosses: number;
  zonesStarted: number;
  perfectZones: number;
  streak: number;
}

export function gameStats(state: GameState, now = new Date()): GameStats {
  const starValues = Object.values(state.stars);
  return {
    level: levelForXp(state.xp),
    stagesCleared: starValues.filter((s) => s > 0).length,
    perfectStages: starValues.filter((s) => s >= 3).length,
    stars: starValues.reduce((a, b) => a + b, 0),
    bosses: Object.keys(state.bosses).length,
    zonesStarted: ZONES.filter((z) => z.stages.some((s) => (state.stars[s.id] ?? 0) > 0)).length,
    perfectZones: ZONES.filter((z) => z.stages.every((s) => (state.stars[s.id] ?? 0) >= 3)).length,
    streak: streak(state, now),
  };
}

export function zoneStars(state: GameState, zone: Zone): number {
  return zone.stages.reduce((sum, s) => sum + (state.stars[s.id] ?? 0), 0);
}

export function badgeProgress(goal: BadgeGoal, stats: GameStats, xp: number): { current: number; target: number; met: boolean } {
  const current = {
    stages: stats.stagesCleared,
    perfect: stats.perfectStages,
    stars: stats.stars,
    bosses: stats.bosses,
    zones: stats.zonesStarted,
    zonePerfect: stats.perfectZones,
    streak: stats.streak,
    xp,
  }[goal.type];
  return { current: Math.min(current, goal.n), target: goal.n, met: current >= goal.n };
}

export function questProgress(state: GameState, quest: Quest, now = new Date()) {
  const day = today(now);
  const stats = state.days[day] ?? { xp: 0, stages: 0, perfect: 0, bosses: 0 };
  const current = ({ stages: stats.stages, perfect: stats.perfect, xp: stats.xp, bosses: stats.bosses } as Record<QuestGoal['type'], number>)[quest.goal.type];
  return {
    current: Math.min(current, quest.goal.n),
    target: quest.goal.n,
    met: current >= quest.goal.n,
    claimed: Boolean(state.quests[`${day}:${quest.id}`]),
  };
}

// ─── Unlocks ────────────────────────────────────────────────────────────────

export function isZoneUnlocked(zone: Zone, xp: number): boolean {
  return levelForXp(xp) >= zone.requiredLevel;
}

export function isStageUnlocked(state: GameState, zone: Zone, index: number): boolean {
  if (!isZoneUnlocked(zone, state.xp)) return false;
  return index === 0 || (state.stars[zone.stages[index - 1].id] ?? 0) > 0;
}

export function isBossUnlocked(state: GameState, zone: Zone): boolean {
  return isZoneUnlocked(zone, state.xp) && zone.stages.every((s) => (state.stars[s.id] ?? 0) > 0);
}

/** The next thing to play: first uncleared stage (or undefeated boss) in an unlocked world. */
export function nextGoal(state: GameState): { zone: Zone; stageId?: string; boss?: boolean } | null {
  for (const zone of ZONES) {
    if (!isZoneUnlocked(zone, state.xp)) continue;
    const stage = zone.stages.find((s) => !(state.stars[s.id] > 0));
    if (stage) return { zone, stageId: stage.id };
    if (!state.bosses[zone.id]) return { zone, boss: true };
  }
  return null;
}

// ─── Transitions ────────────────────────────────────────────────────────────

function clone(state: GameState): GameState {
  return structuredClone(state);
}

function bumpDay(state: GameState, day: string, patch: Partial<DayStats>) {
  const cur = state.days[day] ?? { xp: 0, stages: 0, perfect: 0, bosses: 0 };
  state.days[day] = {
    xp: cur.xp + (patch.xp ?? 0),
    stages: cur.stages + (patch.stages ?? 0),
    perfect: cur.perfect + (patch.perfect ?? 0),
    bosses: cur.bosses + (patch.bosses ?? 0),
  };
}

/** Grants XP once per key. Returns the XP actually granted. */
function grant(state: GameState, key: string, amount: number, kind: XpKind, ref: string, now: Date): number {
  if (amount <= 0 || key in state.ledger) return 0;
  state.ledger[key] = amount;
  state.xp += amount;
  state.history = [{ at: now.toISOString(), amount, kind, ref }, ...state.history].slice(0, HISTORY_LIMIT);
  if (kind !== 'quest') bumpDay(state, today(now), { xp: amount });
  return amount;
}

function evaluateBadges(state: GameState, now: Date): string[] {
  const earned: string[] = [];
  for (let pass = 0; pass < 5; pass++) {
    const stats = gameStats(state, now);
    const ready = BADGES.filter((b: Badge) => !state.badges[b.id] && badgeProgress(b.goal, stats, state.xp).met);
    if (ready.length === 0) break;
    for (const b of ready) {
      state.badges[b.id] = now.toISOString();
      earned.push(b.id);
      grant(state, `badge:${b.id}`, b.xp, 'badge', b.id, now);
    }
  }
  return earned;
}

function finalize(state: GameState, xpBefore: number, now: Date): Award {
  const badges = evaluateBadges(state, now);
  return { xp: state.xp - xpBefore, levelBefore: levelForXp(xpBefore), levelAfter: levelForXp(state.xp), badges };
}

export interface StageResult {
  state: GameState;
  award: Award;
  stars: number;
  previousBest: number;
  newBest: boolean;
}

export function finishStage(input: GameState, stageId: string, mistakes: number, now = new Date()): StageResult {
  const stage = stageById(stageId);
  const zone = zoneOfStage(stageId);
  if (!stage || !zone) throw new GameError('NOT_FOUND', `Unknown stage ${stageId}`);
  const index = zone.stages.indexOf(stage);
  if (!isStageUnlocked(input, zone, index)) throw new GameError('LOCKED', `Stage ${stageId} is locked`);
  if (mistakes >= MAX_HEARTS) throw new GameError('NOT_READY', 'A run with no hearts left is not a clear');

  const state = clone(input);
  const xpBefore = state.xp;
  const stars = starsForMistakes(mistakes);
  const previousBest = state.stars[stageId] ?? 0;
  const best = Math.max(previousBest, stars);
  state.stars[stageId] = best;
  grant(state, `stage:${stageId}`, STAGE_CLEAR_XP, 'stage', stageId, now);
  for (let s = previousBest + 1; s <= best; s++) grant(state, `stage:${stageId}:star${s}`, STAR_XP, 'stage', stageId, now);
  bumpDay(state, today(now), { stages: 1, perfect: stars === 3 ? 1 : 0 });
  return { state, award: finalize(state, xpBefore, now), stars, previousBest, newBest: best > previousBest };
}

export function defeatBoss(input: GameState, zoneId: string, now = new Date()): { state: GameState; award: Award; already: boolean } {
  const zone = zoneById(zoneId);
  if (!zone) throw new GameError('NOT_FOUND', `Unknown world ${zoneId}`);
  if (!isBossUnlocked(input, zone)) throw new GameError('LOCKED', `The ${zoneId} boss is locked`);
  const state = clone(input);
  const xpBefore = state.xp;
  const already = Boolean(state.bosses[zoneId]);
  if (!already) {
    state.bosses[zoneId] = now.toISOString();
    bumpDay(state, today(now), { bosses: 1, stages: 1 });
  }
  grant(state, `boss:${zoneId}`, zone.boss.xp, 'boss', zoneId, now);
  return { state, award: finalize(state, xpBefore, now), already };
}

export function claimQuest(input: GameState, questId: string, now = new Date()): { state: GameState; award: Award } {
  const quest = QUESTS.find((q) => q.id === questId);
  if (!quest) throw new GameError('NOT_FOUND', `Unknown quest ${questId}`);
  const progress = questProgress(input, quest, now);
  if (!progress.met) throw new GameError('NOT_READY', 'Quest not complete yet');
  const state = clone(input);
  const xpBefore = state.xp;
  const day = today(now);
  if (!state.quests[`${day}:${quest.id}`]) state.quests[`${day}:${quest.id}`] = now.toISOString();
  grant(state, `quest:${day}:${quest.id}`, quest.xp, 'quest', quest.id, now);
  return { state, award: finalize(state, xpBefore, now) };
}
