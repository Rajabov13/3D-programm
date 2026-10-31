import type { CheckSpec, ExerciseFiles, ExerciseMode } from '@shared/checks';

export type { CheckSpec, ExerciseFiles, ExerciseMode };

export type TrackId = 'html' | 'css' | 'javascript' | 'python' | 'react';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type BuildingId =
  | 'html-academy'
  | 'css-studio'
  | 'js-lab'
  | 'python-center'
  | 'react-tower'
  | 'mission-center'
  | 'achievement-hall'
  | 'progress-center';

export interface Course {
  id: string;
  title: string;
  tagline: string;
  description: string;
  track: TrackId;
  objectives: string[];
  /** Recommended courses to finish first (course ids). */
  prerequisites: string[];
  /** Player level required to unlock the course and its building. */
  requiredLevel: number;
  buildingId: BuildingId;
  accent: string;
  estimatedHours: number;
  order: number;
  published: boolean;
}

export type CodeLanguage = 'html' | 'css' | 'javascript' | 'python' | 'jsx' | 'bash' | 'text';

export type ContentBlock =
  | { type: 'text'; md: string }
  | { type: 'heading'; text: string }
  | { type: 'code'; language: CodeLanguage; code: string; caption?: string }
  | { type: 'callout'; variant: 'tip' | 'info' | 'warning'; title?: string; md: string };

export interface Lesson {
  id: string;
  courseId: string;
  order: number;
  title: string;
  summary: string;
  difficulty: Difficulty;
  durationMinutes: number;
  /** XP for completing the lesson (after its quiz and exercises). */
  xp: number;
  /** XP for the first passing knowledge check. */
  quizXp: number;
  blocks: ContentBlock[];
  published: boolean;
}

export interface Exercise {
  id: string;
  lessonId: string;
  order: number;
  title: string;
  /** Markdown task description. */
  instructions: string;
  mode: ExerciseMode;
  starter: ExerciseFiles;
  hints: string[];
  xp: number;
  checks: CheckSpec[];
  published: boolean;
}

export interface QuizQuestion {
  id: string;
  lessonId: string;
  order: number;
  prompt: string;
  options: string[];
  explanation: string;
}

/** Private: never sent to learners when a backend is configured. */
export interface QuizKey {
  questionId: string;
  correctIndex: number;
}

/** Private: reference solution, visible to administrators only. */
export interface ExerciseSolution {
  exerciseId: string;
  files: ExerciseFiles;
}

export type Requirement =
  | { type: 'lessons_completed'; count: number; courseId?: string }
  | { type: 'exercises_completed'; count: number; courseId?: string }
  | { type: 'course_completed'; courseId: string }
  | { type: 'perfect_quizzes'; count: number }
  | { type: 'courses_started'; count: number }
  | { type: 'streak_days'; count: number }
  | { type: 'level'; count: number }
  | { type: 'xp_total'; count: number }
  | { type: 'missions_completed'; count: number };

export interface Mission {
  id: string;
  title: string;
  description: string;
  xp: number;
  requirement: Requirement;
  order: number;
  published: boolean;
}

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: AchievementTier;
  xp: number;
  criteria: Requirement;
  order: number;
  published: boolean;
}

export interface Catalog {
  courses: Course[];
  lessons: Lesson[];
  exercises: Exercise[];
  quizQuestions: QuizQuestion[];
  missions: Mission[];
  achievements: Achievement[];
}

export interface PrivateContent {
  quizKeys: QuizKey[];
  solutions: ExerciseSolution[];
}
