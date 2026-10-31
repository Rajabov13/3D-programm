import type { CheckResult, ExerciseFiles } from '@shared/checks';
import type {
  AwardSummary,
  ExerciseSubmissionResult,
  LeaderboardEntry,
  ProgressSnapshot,
  QuizSubmissionResult,
} from '@/types';

export interface ClientEvaluation {
  passed: boolean;
  results: CheckResult[];
}

export interface AccountSettingsPatch {
  dailyGoalXp?: number;
  timezone?: string;
}

/** Progress persistence. The demo version stores progress in this browser only. */
export interface ProgressService {
  readonly kind: 'local';
  getSnapshot(): Promise<ProgressSnapshot>;
  completeLesson(lessonId: string): Promise<AwardSummary>;
  submitQuiz(lessonId: string, answers: number[]): Promise<QuizSubmissionResult>;
  submitExercise(exerciseId: string, files: ExerciseFiles, clientEvaluation: ClientEvaluation): Promise<ExerciseSubmissionResult>;
  claimMission(missionId: string): Promise<AwardSummary>;
  getLeaderboard(): Promise<LeaderboardEntry[]>;
  updateAccountSettings(patch: AccountSettingsPatch): Promise<void>;
}
