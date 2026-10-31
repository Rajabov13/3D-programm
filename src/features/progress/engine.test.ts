import { describe, expect, it } from 'vitest';
import { buildBundledContent } from '@/data';
import type { Catalog, ProgressSnapshot } from '@/types';
import {
  claimMission,
  completeLesson,
  computeStats,
  computeStreak,
  DAILY_GOAL_BONUS_XP,
  emptySnapshot,
  levelForXp,
  levelProgress,
  recommendedLesson,
  recordExercise,
  submitQuiz,
  xpForLevel,
} from './engine';

const { catalog, privateContent } = buildBundledContent();
const now = new Date('2026-10-31T12:00:00Z');
const fresh = (): ProgressSnapshot => ({ ...emptySnapshot('UTC', 1000, now) });
const answersFor = (c: Catalog, lessonId: string, wrong = 0) =>
  c.quizQuestions
    .filter((q) => q.lessonId === lessonId)
    .sort((a, b) => a.order - b.order)
    .map((q, i) => {
      const key = privateContent.quizKeys.find((k) => k.questionId === q.id)!.correctIndex;
      return i < wrong ? (key + 1) % q.options.length : key;
    });

describe('levels', () => {
  it('uses the documented curve', () => {
    expect([1, 2, 3, 4, 5, 6].map(xpForLevel)).toEqual([0, 100, 250, 450, 700, 1000]);
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(99)).toBe(1);
    expect(levelForXp(100)).toBe(2);
    expect(levelForXp(700)).toBe(5);
    expect(levelProgress(175)).toMatchObject({ level: 2, current: 75, needed: 150, toNext: 75 });
  });
});

describe('streaks', () => {
  it('counts consecutive days, tolerating an empty today', () => {
    expect(computeStreak({ '2026-10-29': 5, '2026-10-30': 10 }, '2026-10-31')).toBe(2);
    expect(computeStreak({ '2026-10-29': 5, '2026-10-30': 10, '2026-10-31': 1 }, '2026-10-31')).toBe(3);
    expect(computeStreak({ '2026-10-28': 5 }, '2026-10-31')).toBe(0);
  });
});

describe('lesson flow', () => {
  it('requires the quiz and exercises before completing a lesson', () => {
    expect(() => completeLesson(fresh(), catalog, 'html-1', now)).toThrow(/knowledge check/);
    const quiz = submitQuiz(fresh(), catalog, privateContent.quizKeys, 'html-1', answersFor(catalog, 'html-1'), now);
    expect(quiz.result.passed).toBe(true);
    expect(quiz.result.perfect).toBe(true);
    expect(() => completeLesson(quiz.snapshot, catalog, 'html-1', now)).toThrow(/exercises/);
    const ex = recordExercise(quiz.snapshot, catalog, 'html-1-ex1', true, now);
    const done = completeLesson(ex.snapshot, catalog, 'html-1', now);
    expect(done.snapshot.lessons['html-1']).toBeDefined();
    // quiz 15 + exercise 30 + lesson 20 + achievements (perfect 10, first pass 10, hello world 10)
    expect(done.snapshot.xp).toBe(15 + 30 + 20 + 30);
    expect(Object.keys(done.snapshot.achievements).sort()).toEqual(['a-first-pass', 'a-hello-world', 'a-perfect']);
  });

  it('never awards XP twice for the same activity', () => {
    let s = submitQuiz(fresh(), catalog, privateContent.quizKeys, 'html-1', answersFor(catalog, 'html-1'), now).snapshot;
    const xpAfterFirst = s.xp;
    const again = submitQuiz(s, catalog, privateContent.quizKeys, 'html-1', answersFor(catalog, 'html-1'), now);
    expect(again.snapshot.xp).toBe(xpAfterFirst);
    expect(again.result.award.alreadyCompleted).toBe(true);
    s = recordExercise(again.snapshot, catalog, 'html-1-ex1', true, now).snapshot;
    const xp = s.xp;
    s = recordExercise(s, catalog, 'html-1-ex1', true, now).snapshot;
    expect(s.xp).toBe(xp);
    s = completeLesson(s, catalog, 'html-1', now).snapshot;
    const xp2 = s.xp;
    expect(completeLesson(s, catalog, 'html-1', now).result.alreadyCompleted).toBe(true);
    expect(completeLesson(s, catalog, 'html-1', now).snapshot.xp).toBe(xp2);
  });

  it('failing a quiz awards nothing and hides the answers', () => {
    const r = submitQuiz(fresh(), catalog, privateContent.quizKeys, 'html-1', answersFor(catalog, 'html-1', 2), now);
    expect(r.result.passed).toBe(false);
    expect(r.snapshot.xp).toBe(0);
    expect(r.result.results.every((q) => q.correctIndex === undefined)).toBe(true);
  });

  it('a failed exercise attempt awards nothing', () => {
    expect(recordExercise(fresh(), catalog, 'html-1-ex1', false, now).snapshot.xp).toBe(0);
  });

  it('enforces course level locks', () => {
    expect(() => recordExercise(fresh(), catalog, 'react-1-ex1', true, now)).toThrow(/level 5/);
  });
});

describe('missions, goals and recommendations', () => {
  it('only lets you claim completed missions, once', () => {
    expect(() => claimMission(fresh(), catalog, 'm-first-steps', now)).toThrow(/not complete/);
    let s = submitQuiz(fresh(), catalog, privateContent.quizKeys, 'html-1', answersFor(catalog, 'html-1'), now).snapshot;
    s = recordExercise(s, catalog, 'html-1-ex1', true, now).snapshot;
    s = completeLesson(s, catalog, 'html-1', now).snapshot;
    const claimed = claimMission(s, catalog, 'm-first-steps', now);
    expect(claimed.result.xpAwarded).toBe(25);
    expect(claimMission(claimed.snapshot, catalog, 'm-first-steps', now).result.xpAwarded).toBe(0);
  });

  it('awards the daily goal bonus once per day', () => {
    const s = { ...fresh(), dailyGoalXp: 20 };
    const first = recordExercise(s, catalog, 'html-1-ex1', true, now);
    expect(first.result.dailyGoalReached).toBe(true);
    expect(first.snapshot.transactions.filter((t) => t.sourceType === 'daily_goal')).toHaveLength(1);
    const second = recordExercise(first.snapshot, catalog, 'html-2-ex1', true, now);
    expect(second.result.dailyGoalReached).toBe(false);
    expect(second.snapshot.activity['2026-10-31']).toBe(30 + 10 + DAILY_GOAL_BONUS_XP + 30);
  });

  it('recommends the next unfinished lesson in an unlocked course', () => {
    expect(recommendedLesson(catalog, fresh())?.lesson.id).toBe('html-1');
    const stats = computeStats(fresh(), catalog);
    expect(stats.lessonsCompleted).toBe(0);
  });
});
