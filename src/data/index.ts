import type { Catalog, PrivateContent } from '@/types';
import { achievements } from './achievements';
import { cssCourse } from './courses/css';
import { htmlCourse } from './courses/html';
import { javascriptCourse } from './courses/javascript';
import { pythonCourse } from './courses/python';
import { reactCourse } from './courses/react';
import type { CourseDraft } from './courses/types';
import { missions } from './missions';

export const courseDrafts: CourseDraft[] = [htmlCourse, cssCourse, javascriptCourse, pythonCourse, reactCourse];

/** Flattens the authored course drafts into the normalized catalog + private answer data. */
export function buildBundledContent(): { catalog: Catalog; privateContent: PrivateContent } {
  const catalog: Catalog = { courses: [], lessons: [], exercises: [], quizQuestions: [], missions: [], achievements: [] };
  const privateContent: PrivateContent = { quizKeys: [], solutions: [] };

  for (const draft of courseDrafts) {
    catalog.courses.push({ ...draft.course, published: true });
    draft.lessons.forEach((lessonDraft, lessonIndex) => {
      const lessonId = lessonDraft.lesson.id;
      catalog.lessons.push({ ...lessonDraft.lesson, courseId: draft.course.id, order: lessonIndex + 1, published: true });
      lessonDraft.exercises.forEach(({ solution, ...exercise }, exerciseIndex) => {
        catalog.exercises.push({ ...exercise, lessonId, order: exerciseIndex + 1, published: true });
        privateContent.solutions.push({ exerciseId: exercise.id, files: solution });
      });
      lessonDraft.quiz.forEach((q, i) => {
        const id = `${lessonId}-q${i + 1}`;
        catalog.quizQuestions.push({ id, lessonId, order: i + 1, prompt: q.prompt, options: q.options, explanation: q.explanation });
        privateContent.quizKeys.push({ questionId: id, correctIndex: q.answer });
      });
    });
  }
  catalog.missions = missions.map((m) => ({ ...m }));
  catalog.achievements = achievements.map((a) => ({ ...a }));
  return { catalog, privateContent };
}
