import type { Catalog } from '@/types';

/** Learner view of a catalog: published items whose parents are also published. */
export function publishedView(c: Catalog): Catalog {
  const courses = c.courses.filter((x) => x.published);
  const courseIds = new Set(courses.map((x) => x.id));
  const lessons = c.lessons.filter((l) => l.published && courseIds.has(l.courseId));
  const lessonIds = new Set(lessons.map((l) => l.id));
  return {
    courses,
    lessons,
    exercises: c.exercises.filter((e) => e.published && lessonIds.has(e.lessonId)),
    quizQuestions: c.quizQuestions.filter((q) => lessonIds.has(q.lessonId)),
    missions: c.missions.filter((m) => m.published),
    achievements: c.achievements.filter((a) => a.published),
  };
}
