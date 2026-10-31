import type { Mission } from '@/types';

export const missions: Mission[] = [
  { id: 'm-first-steps', title: 'First Steps', description: 'Complete your very first lesson anywhere in Code World.', xp: 25, requirement: { type: 'lessons_completed', count: 1 }, order: 1, published: true },
  { id: 'm-markup-apprentice', title: 'Markup Apprentice', description: 'Complete three lessons in the HTML Academy.', xp: 40, requirement: { type: 'lessons_completed', count: 3, courseId: 'html' }, order: 2, published: true },
  { id: 'm-style-starter', title: 'Style Starter', description: 'Pass two exercises in the CSS Design Studio.', xp: 40, requirement: { type: 'exercises_completed', count: 2, courseId: 'css' }, order: 3, published: true },
  { id: 'm-quiz-whiz', title: 'Quiz Whiz', description: 'Score 100% on three knowledge checks.', xp: 50, requirement: { type: 'perfect_quizzes', count: 3 }, order: 4, published: true },
  { id: 'm-pythonista', title: 'Pythonista', description: 'Complete three lessons in the Python Center.', xp: 60, requirement: { type: 'lessons_completed', count: 3, courseId: 'python' }, order: 5, published: true },
  { id: 'm-polyglot', title: 'Polyglot', description: 'Complete at least one lesson in three different courses.', xp: 75, requirement: { type: 'courses_started', count: 3 }, order: 6, published: true },
  { id: 'm-streak-3', title: 'Consistency Protocol', description: 'Learn three days in a row.', xp: 50, requirement: { type: 'streak_days', count: 3 }, order: 7, published: true },
  { id: 'm-html-graduate', title: 'Academy Graduate', description: 'Finish every lesson of HTML Foundations.', xp: 100, requirement: { type: 'course_completed', courseId: 'html' }, order: 8, published: true },
  { id: 'm-bug-hunter', title: 'Bug Hunter', description: 'Pass ten coding exercises.', xp: 100, requirement: { type: 'exercises_completed', count: 10 }, order: 9, published: true },
  { id: 'm-lab-director', title: 'Lab Director', description: 'Finish the JavaScript Laboratory course.', xp: 150, requirement: { type: 'course_completed', courseId: 'javascript' }, order: 10, published: true },
];
