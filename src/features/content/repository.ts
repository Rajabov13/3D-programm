import type {
  Achievement,
  Catalog,
  Course,
  Exercise,
  ExerciseSolution,
  Lesson,
  Mission,
  PrivateContent,
  QuizKey,
  QuizQuestion,
} from '@/types';

export interface LessonQuizInput {
  questions: QuizQuestion[];
  keys: QuizKey[];
}

/** Content access for learners and the admin area. */
export interface ContentRepository {
  readonly kind: 'local';
  loadCatalog(): Promise<Catalog>;
  /** Quiz answer keys and reference solutions — administrators only. */
  loadPrivate(): Promise<PrivateContent>;
  saveCourse(course: Course): Promise<void>;
  deleteCourse(id: string): Promise<void>;
  saveLesson(lesson: Lesson, quiz?: LessonQuizInput): Promise<void>;
  deleteLesson(id: string): Promise<void>;
  saveExercise(exercise: Exercise, solution?: ExerciseSolution): Promise<void>;
  deleteExercise(id: string): Promise<void>;
  saveAchievement(achievement: Achievement): Promise<void>;
  deleteAchievement(id: string): Promise<void>;
  saveMission(mission: Mission): Promise<void>;
  deleteMission(id: string): Promise<void>;
}
