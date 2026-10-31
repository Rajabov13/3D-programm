import type { CheckResult } from '@shared/checks';

export type XpSource = 'lesson' | 'exercise' | 'quiz' | 'mission' | 'achievement' | 'daily_goal';

export interface XpTransaction {
  id: string;
  amount: number;
  sourceType: XpSource;
  sourceId: string;
  description: string;
  createdAt: string;
}

export interface QuizRecord {
  bestScore: number;
  total: number;
  passed: boolean;
  perfect: boolean;
  attempts: number;
  passedAt?: string;
}

export interface ProgressSnapshot {
  xp: number;
  level: number;
  /** lessonId → completedAt (ISO) */
  lessons: Record<string, string>;
  /** exerciseId → completedAt (ISO) */
  exercises: Record<string, string>;
  /** lessonId → best quiz result */
  quizzes: Record<string, QuizRecord>;
  /** missionId → claimedAt */
  missions: Record<string, string>;
  /** achievementId → earnedAt */
  achievements: Record<string, string>;
  /** Most recent first, capped. */
  transactions: XpTransaction[];
  /** YYYY-MM-DD (in the learner's time zone) → XP earned that day */
  activity: Record<string, number>;
  dailyGoalXp: number;
  timezone: string;
  /** Today's date key in the learner's time zone. */
  today: string;
}

export interface AwardSummary {
  xpAwarded: number;
  levelBefore: number;
  levelAfter: number;
  newAchievements: string[];
  alreadyCompleted: boolean;
  dailyGoalReached: boolean;
}

export interface QuizQuestionResult {
  questionId: string;
  correct: boolean;
  /** Revealed only once the quiz is passed. */
  correctIndex?: number;
  explanation?: string;
}

export interface QuizSubmissionResult {
  score: number;
  total: number;
  passed: boolean;
  perfect: boolean;
  results: QuizQuestionResult[];
  award: AwardSummary;
}

export interface ExerciseSubmissionResult {
  passed: boolean;
  results: CheckResult[];
  verifiedBy: 'browser';
  award: AwardSummary;
}

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  avatar: string;
  level: number;
  xp: number;
  isMe: boolean;
}
