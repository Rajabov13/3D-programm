import type { Course, Exercise, ExerciseFiles, Lesson } from '@/types';

export interface QuizDraft {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface ExerciseDraft extends Omit<Exercise, 'lessonId' | 'order' | 'published'> {
  solution: ExerciseFiles;
}

export interface LessonDraft {
  lesson: Omit<Lesson, 'courseId' | 'order' | 'published'>;
  exercises: ExerciseDraft[];
  quiz: QuizDraft[];
}

export interface CourseDraft {
  course: Omit<Course, 'published'>;
  lessons: LessonDraft[];
}
