import type { Achievement } from '@/types';

export const achievements: Achievement[] = [
  { id: 'a-hello-world', title: 'Hello, World', description: 'Completed your first lesson.', icon: 'Sparkles', tier: 'bronze', xp: 10, criteria: { type: 'lessons_completed', count: 1 }, order: 1, published: true },
  { id: 'a-first-pass', title: 'Green Checkmark', description: 'Passed your first coding exercise.', icon: 'CircleCheck', tier: 'bronze', xp: 10, criteria: { type: 'exercises_completed', count: 1 }, order: 2, published: true },
  { id: 'a-perfect', title: 'Flawless', description: 'Scored 100% on a knowledge check.', icon: 'Target', tier: 'bronze', xp: 10, criteria: { type: 'perfect_quizzes', count: 1 }, order: 3, published: true },
  { id: 'a-explorer', title: 'City Explorer', description: 'Started lessons in two different buildings.', icon: 'Compass', tier: 'silver', xp: 20, criteria: { type: 'courses_started', count: 2 }, order: 4, published: true },
  { id: 'a-level-3', title: 'Rising Coder', description: 'Reached level 3.', icon: 'TrendingUp', tier: 'silver', xp: 20, criteria: { type: 'level', count: 3 }, order: 5, published: true },
  { id: 'a-mission-runner', title: 'Mission Runner', description: 'Completed three missions.', icon: 'Flag', tier: 'silver', xp: 25, criteria: { type: 'missions_completed', count: 3 }, order: 6, published: true },
  { id: 'a-level-5', title: 'Tower Access', description: 'Reached level 5 and unlocked the React Development Tower.', icon: 'Rocket', tier: 'gold', xp: 40, criteria: { type: 'level', count: 5 }, order: 7, published: true },
  { id: 'a-streak-7', title: 'Week of Code', description: 'Learned seven days in a row.', icon: 'Flame', tier: 'gold', xp: 50, criteria: { type: 'streak_days', count: 7 }, order: 8, published: true },
  { id: 'a-html-master', title: 'Markup Master', description: 'Completed HTML Foundations.', icon: 'FileCode2', tier: 'gold', xp: 50, criteria: { type: 'course_completed', courseId: 'html' }, order: 9, published: true },
  { id: 'a-css-master', title: 'Style Architect', description: 'Completed the CSS Design Studio.', icon: 'Palette', tier: 'gold', xp: 50, criteria: { type: 'course_completed', courseId: 'css' }, order: 10, published: true },
  { id: 'a-js-master', title: 'Lab Scientist', description: 'Completed the JavaScript Laboratory.', icon: 'Braces', tier: 'gold', xp: 50, criteria: { type: 'course_completed', courseId: 'javascript' }, order: 11, published: true },
  { id: 'a-python-master', title: 'Serpent Tamer', description: 'Completed the Python Center course.', icon: 'Terminal', tier: 'gold', xp: 50, criteria: { type: 'course_completed', courseId: 'python' }, order: 12, published: true },
  { id: 'a-react-master', title: 'Tower Architect', description: 'Completed the React Development Tower.', icon: 'Atom', tier: 'platinum', xp: 75, criteria: { type: 'course_completed', courseId: 'react' }, order: 13, published: true },
  { id: 'a-xp-1000', title: 'Kilobyte', description: 'Earned 1,000 XP in total.', icon: 'Gem', tier: 'platinum', xp: 50, criteria: { type: 'xp_total', count: 1000 }, order: 14, published: true },
];
