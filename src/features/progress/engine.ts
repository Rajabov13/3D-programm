/**
 * Progression rules: levels, idempotent XP awards, lesson requirements, quizzes,
 * missions, achievements, daily goals and streaks. Pure functions — the demo
 * progress store applies them to state saved in the browser.
 */
import type {
  AwardSummary,
  Catalog,
  Course,
  Exercise,
  Lesson,
  ProgressSnapshot,
  QuizKey,
  QuizSubmissionResult,
  Requirement,
  XpSource,
  XpTransaction,
} from '@/types';
import { addDays, dateKey } from '@/lib/dates';
import { AppError } from '@/lib/errors';

export const QUIZ_PASS_RATIO = 0.6;
export const DAILY_GOAL_BONUS_XP = 10;
export const MAX_TRANSACTIONS = 100;
export const MAX_LEVEL = 100;
export const DEFAULT_DAILY_GOAL = 50;

// ─── Levels ─────────────────────────────────────────────────────────────────

/** Total XP needed to reach `level` (level 1 = 0 XP, 2 = 100, 3 = 250, 4 = 450, 5 = 700 …). */
export function xpForLevel(level: number): number {
  const l = Math.max(1, Math.floor(level));
  return 25 * (l - 1) * (l + 2);
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (level < MAX_LEVEL && xpForLevel(level + 1) <= xp) level++;
  return level;
}

export function levelProgress(xp: number) {
  const level = levelForXp(xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return {
    level,
    current: xp - base,
    needed: next - base,
    toNext: next - xp,
    ratio: next === base ? 1 : (xp - base) / (next - base),
  };
}

const LEVEL_TITLES: Array<[number, string]> = [
  [1, 'Novice Coder'],
  [3, 'Apprentice Developer'],
  [5, 'Developer'],
  [8, 'Software Engineer'],
  [12, 'Senior Engineer'],
  [16, 'Code Architect'],
  [22, 'Legend of the Grid'],
];

export function levelTitle(level: number): string {
  let title = LEVEL_TITLES[0][1];
  for (const [min, name] of LEVEL_TITLES) if (level >= min) title = name;
  return title;
}

export function isCourseUnlocked(course: Pick<Course, 'requiredLevel'>, level: number): boolean {
  return level >= course.requiredLevel;
}

// ─── Snapshot helpers ───────────────────────────────────────────────────────

export function emptySnapshot(timezone: string, dailyGoalXp = DEFAULT_DAILY_GOAL, now = new Date()): ProgressSnapshot {
  return {
    xp: 0,
    level: 1,
    lessons: {},
    exercises: {},
    quizzes: {},
    missions: {},
    achievements: {},
    transactions: [],
    activity: {},
    dailyGoalXp,
    timezone,
    today: dateKey(now, timezone),
  };
}

export function withDerived(snapshot: ProgressSnapshot, now = new Date()): ProgressSnapshot {
  return { ...snapshot, level: levelForXp(snapshot.xp), today: dateKey(now, snapshot.timezone) };
}

export function computeStreak(activity: Record<string, number>, today: string): number {
  let day = today;
  if (!(activity[day] > 0)) day = addDays(today, -1);
  let streak = 0;
  while (activity[day] > 0 && streak < 3650) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

// ─── Stats & requirements ───────────────────────────────────────────────────

export interface ProgressStats {
  totalXp: number;
  level: number;
  lessonsCompleted: number;
  exercisesCompleted: number;
  perfectQuizzes: number;
  missionsCompleted: number;
  coursesStarted: number;
  completedCourseIds: string[];
  lessonsByCourse: Record<string, number>;
  exercisesByCourse: Record<string, number>;
  streak: number;
  todayXp: number;
}

export function computeStats(snapshot: ProgressSnapshot, catalog: Catalog): ProgressStats {
  const lessonCourse = new Map(catalog.lessons.map((l) => [l.id, l.courseId]));
  const exerciseLesson = new Map(catalog.exercises.map((e) => [e.id, e.lessonId]));
  const lessonsByCourse: Record<string, number> = {};
  for (const id of Object.keys(snapshot.lessons)) {
    const courseId = lessonCourse.get(id);
    if (courseId) lessonsByCourse[courseId] = (lessonsByCourse[courseId] ?? 0) + 1;
  }
  const exercisesByCourse: Record<string, number> = {};
  for (const id of Object.keys(snapshot.exercises)) {
    const lessonId = exerciseLesson.get(id);
    const courseId = lessonId ? lessonCourse.get(lessonId) : undefined;
    if (courseId) exercisesByCourse[courseId] = (exercisesByCourse[courseId] ?? 0) + 1;
  }
  const completedCourseIds = catalog.courses
    .filter((course) => {
      const lessons = catalog.lessons.filter((l) => l.courseId === course.id && l.published);
      return lessons.length > 0 && lessons.every((l) => snapshot.lessons[l.id]);
    })
    .map((c) => c.id);

  return {
    totalXp: snapshot.xp,
    level: levelForXp(snapshot.xp),
    lessonsCompleted: Object.keys(snapshot.lessons).length,
    exercisesCompleted: Object.keys(snapshot.exercises).length,
    perfectQuizzes: Object.values(snapshot.quizzes).filter((q) => q.perfect).length,
    missionsCompleted: Object.keys(snapshot.missions).length,
    coursesStarted: Object.keys(lessonsByCourse).length,
    completedCourseIds,
    lessonsByCourse,
    exercisesByCourse,
    streak: computeStreak(snapshot.activity, snapshot.today),
    todayXp: snapshot.activity[snapshot.today] ?? 0,
  };
}

export interface RequirementProgress {
  current: number;
  target: number;
  met: boolean;
}

export function requirementProgress(req: Requirement, stats: ProgressStats): RequirementProgress {
  const make = (current: number, target: number): RequirementProgress => ({
    current: Math.min(current, target),
    target,
    met: current >= target,
  });
  switch (req.type) {
    case 'lessons_completed':
      return make(req.courseId ? (stats.lessonsByCourse[req.courseId] ?? 0) : stats.lessonsCompleted, req.count);
    case 'exercises_completed':
      return make(req.courseId ? (stats.exercisesByCourse[req.courseId] ?? 0) : stats.exercisesCompleted, req.count);
    case 'course_completed':
      return make(stats.completedCourseIds.includes(req.courseId) ? 1 : 0, 1);
    case 'perfect_quizzes':
      return make(stats.perfectQuizzes, req.count);
    case 'courses_started':
      return make(stats.coursesStarted, req.count);
    case 'streak_days':
      return make(stats.streak, req.count);
    case 'level':
      return make(stats.level, req.count);
    case 'xp_total':
      return make(stats.totalXp, req.count);
    case 'missions_completed':
      return make(stats.missionsCompleted, req.count);
    default:
      return { current: 0, target: 1, met: false };
  }
}

export function describeRequirement(req: Requirement, catalog?: Catalog): string {
  const courseName = (id?: string) => (id ? (catalog?.courses.find((c) => c.id === id)?.title ?? id) : '');
  switch (req.type) {
    case 'lessons_completed':
      return req.courseId ? `Complete ${req.count} lesson(s) in ${courseName(req.courseId)}` : `Complete ${req.count} lesson(s)`;
    case 'exercises_completed':
      return req.courseId ? `Pass ${req.count} exercise(s) in ${courseName(req.courseId)}` : `Pass ${req.count} exercise(s)`;
    case 'course_completed':
      return `Finish the ${courseName(req.courseId)} course`;
    case 'perfect_quizzes':
      return `Score 100% on ${req.count} knowledge check(s)`;
    case 'courses_started':
      return `Complete a lesson in ${req.count} different course(s)`;
    case 'streak_days':
      return `Learn ${req.count} day(s) in a row`;
    case 'level':
      return `Reach level ${req.count}`;
    case 'xp_total':
      return `Earn ${req.count} XP in total`;
    case 'missions_completed':
      return `Complete ${req.count} mission(s)`;
    default:
      return 'Unknown requirement';
  }
}

// ─── Lesson helpers ─────────────────────────────────────────────────────────

export function lessonExercises(catalog: Catalog, lessonId: string): Exercise[] {
  return catalog.exercises.filter((e) => e.lessonId === lessonId && e.published).sort((a, b) => a.order - b.order);
}

export function courseLessons(catalog: Catalog, courseId: string): Lesson[] {
  return catalog.lessons.filter((l) => l.courseId === courseId && l.published).sort((a, b) => a.order - b.order);
}

export function lessonHasQuiz(catalog: Catalog, lessonId: string): boolean {
  return catalog.quizQuestions.some((q) => q.lessonId === lessonId);
}

export interface LessonRequirementState {
  hasQuiz: boolean;
  quizPassed: boolean;
  exercises: Array<{ exercise: Exercise; done: boolean }>;
  ready: boolean;
  completed: boolean;
}

export function lessonRequirements(catalog: Catalog, snapshot: ProgressSnapshot, lessonId: string): LessonRequirementState {
  const hasQuiz = lessonHasQuiz(catalog, lessonId);
  const quizPassed = !hasQuiz || Boolean(snapshot.quizzes[lessonId]?.passed);
  const exercises = lessonExercises(catalog, lessonId).map((exercise) => ({ exercise, done: Boolean(snapshot.exercises[exercise.id]) }));
  return {
    hasQuiz,
    quizPassed,
    exercises,
    ready: quizPassed && exercises.every((e) => e.done),
    completed: Boolean(snapshot.lessons[lessonId]),
  };
}

export function courseProgress(catalog: Catalog, snapshot: ProgressSnapshot, courseId: string) {
  const lessons = courseLessons(catalog, courseId);
  const completed = lessons.filter((l) => snapshot.lessons[l.id]).length;
  return { completed, total: lessons.length, ratio: lessons.length ? completed / lessons.length : 0 };
}

/** Next lesson to study: continue the most recently active unlocked course, else the first unlocked one. */
export function recommendedLesson(catalog: Catalog, snapshot: ProgressSnapshot): { course: Course; lesson: Lesson } | null {
  const level = levelForXp(snapshot.xp);
  const courses = catalog.courses.filter((c) => c.published).sort((a, b) => a.order - b.order);
  const lastLessonTxn = snapshot.transactions.find((t) => t.sourceType === 'lesson' || t.sourceType === 'exercise' || t.sourceType === 'quiz');
  let recentCourseId: string | undefined;
  if (lastLessonTxn) {
    const lessonId =
      lastLessonTxn.sourceType === 'exercise'
        ? catalog.exercises.find((e) => e.id === lastLessonTxn.sourceId)?.lessonId
        : lastLessonTxn.sourceId;
    recentCourseId = catalog.lessons.find((l) => l.id === lessonId)?.courseId;
  }
  const ordered = recentCourseId
    ? [...courses.filter((c) => c.id === recentCourseId), ...courses.filter((c) => c.id !== recentCourseId)]
    : courses;
  for (const course of ordered) {
    if (!isCourseUnlocked(course, level)) continue;
    const next = courseLessons(catalog, course.id).find((l) => !snapshot.lessons[l.id]);
    if (next) return { course, lesson: next };
  }
  return null;
}

// ─── Local state transitions (demo mode) ────────────────────────────────────

interface AwardInput {
  sourceType: XpSource;
  sourceId: string;
  amount: number;
  description: string;
}

function hasTransaction(state: ProgressSnapshot, sourceType: XpSource, sourceId: string) {
  return state.transactions.some((t) => t.sourceType === sourceType && t.sourceId === sourceId);
}

function makeId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

/** Adds an XP transaction unless one already exists for the same source (idempotent). */
function awardXp(state: ProgressSnapshot, input: AwardInput, now: Date): number {
  if (input.amount <= 0 || hasTransaction(state, input.sourceType, input.sourceId)) return 0;
  const txn: XpTransaction = {
    id: makeId(),
    amount: input.amount,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    description: input.description,
    createdAt: now.toISOString(),
  };
  state.transactions = [txn, ...state.transactions].slice(0, MAX_TRANSACTIONS);
  state.xp += input.amount;
  state.activity = { ...state.activity, [state.today]: (state.activity[state.today] ?? 0) + input.amount };
  return input.amount;
}

/** Applies daily-goal bonus and achievement unlocks after an award; builds the summary. */
function finalize(
  state: ProgressSnapshot,
  catalog: Catalog,
  levelBefore: number,
  xpBefore: number,
  alreadyCompleted: boolean,
  now: Date,
): AwardSummary {
  let dailyGoalReached = false;
  if (
    state.xp > xpBefore &&
    (state.activity[state.today] ?? 0) >= state.dailyGoalXp &&
    !hasTransaction(state, 'daily_goal', state.today)
  ) {
    awardXp(state, { sourceType: 'daily_goal', sourceId: state.today, amount: DAILY_GOAL_BONUS_XP, description: 'Daily goal reached' }, now);
    dailyGoalReached = true;
  }

  const newAchievements: string[] = [];
  for (let pass = 0; pass < 5; pass++) {
    const stats = computeStats(state, catalog);
    const unlocked = catalog.achievements.filter(
      (a) => a.published && !state.achievements[a.id] && requirementProgress(a.criteria, stats).met,
    );
    if (unlocked.length === 0) break;
    for (const achievement of unlocked) {
      state.achievements = { ...state.achievements, [achievement.id]: now.toISOString() };
      newAchievements.push(achievement.id);
      awardXp(state, { sourceType: 'achievement', sourceId: achievement.id, amount: achievement.xp, description: `Achievement: ${achievement.title}` }, now);
    }
  }
  state.level = levelForXp(state.xp);
  return {
    xpAwarded: state.xp - xpBefore,
    levelBefore,
    levelAfter: state.level,
    newAchievements,
    alreadyCompleted,
    dailyGoalReached,
  };
}

function prepare(snapshot: ProgressSnapshot, now: Date) {
  const state = structuredClone(withDerived(snapshot, now));
  return { state, levelBefore: state.level, xpBefore: state.xp };
}

function requireLesson(catalog: Catalog, lessonId: string, level: number) {
  const lesson = catalog.lessons.find((l) => l.id === lessonId && l.published);
  if (!lesson) throw new AppError('NOT_FOUND', 'Lesson not found.');
  const course = catalog.courses.find((c) => c.id === lesson.courseId && c.published);
  if (!course) throw new AppError('NOT_FOUND', 'Course not found.');
  if (!isCourseUnlocked(course, level)) {
    throw new AppError('LOCKED', `${course.title} unlocks at level ${course.requiredLevel}.`);
  }
  return { lesson, course };
}

export interface TransitionResult<T = AwardSummary> {
  snapshot: ProgressSnapshot;
  result: T;
}

export function completeLesson(snapshot: ProgressSnapshot, catalog: Catalog, lessonId: string, now = new Date()): TransitionResult {
  const { state, levelBefore, xpBefore } = prepare(snapshot, now);
  const { lesson } = requireLesson(catalog, lessonId, levelBefore);
  if (state.lessons[lessonId]) {
    return { snapshot: state, result: finalize(state, catalog, levelBefore, xpBefore, true, now) };
  }
  const req = lessonRequirements(catalog, state, lessonId);
  if (!req.quizPassed) throw new AppError('REQUIREMENTS_NOT_MET', 'Pass the knowledge check first.');
  if (!req.exercises.every((e) => e.done)) throw new AppError('REQUIREMENTS_NOT_MET', 'Pass all exercises in this lesson first.');
  state.lessons = { ...state.lessons, [lessonId]: now.toISOString() };
  awardXp(state, { sourceType: 'lesson', sourceId: lessonId, amount: lesson.xp, description: `Lesson: ${lesson.title}` }, now);
  return { snapshot: state, result: finalize(state, catalog, levelBefore, xpBefore, false, now) };
}

export function gradeQuiz(catalog: Catalog, keys: QuizKey[], lessonId: string, answers: number[]) {
  const questions = catalog.quizQuestions.filter((q) => q.lessonId === lessonId).sort((a, b) => a.order - b.order);
  if (questions.length === 0) throw new AppError('NOT_FOUND', 'This lesson has no knowledge check.');
  if (answers.length !== questions.length) throw new AppError('VALIDATION', 'Answer every question before submitting.');
  const keyMap = new Map(keys.map((k) => [k.questionId, k.correctIndex]));
  const graded = questions.map((q, i) => ({ question: q, correctIndex: keyMap.get(q.id) ?? -1, correct: keyMap.get(q.id) === answers[i] }));
  const score = graded.filter((g) => g.correct).length;
  const total = questions.length;
  const passed = score / total >= QUIZ_PASS_RATIO;
  return { graded, score, total, passed, perfect: score === total };
}

export function submitQuiz(
  snapshot: ProgressSnapshot,
  catalog: Catalog,
  keys: QuizKey[],
  lessonId: string,
  answers: number[],
  now = new Date(),
): TransitionResult<QuizSubmissionResult> {
  const { state, levelBefore, xpBefore } = prepare(snapshot, now);
  const { lesson } = requireLesson(catalog, lessonId, levelBefore);
  const { graded, score, total, passed, perfect } = gradeQuiz(catalog, keys, lessonId, answers);
  const previous = state.quizzes[lessonId];
  state.quizzes = {
    ...state.quizzes,
    [lessonId]: {
      bestScore: Math.max(previous?.bestScore ?? 0, score),
      total,
      passed: Boolean(previous?.passed) || passed,
      perfect: Boolean(previous?.perfect) || perfect,
      attempts: (previous?.attempts ?? 0) + 1,
      passedAt: previous?.passedAt ?? (passed ? now.toISOString() : undefined),
    },
  };
  if (passed) {
    awardXp(state, { sourceType: 'quiz', sourceId: lessonId, amount: lesson.quizXp, description: `Knowledge check: ${lesson.title}` }, now);
  }
  const award = finalize(state, catalog, levelBefore, xpBefore, Boolean(previous?.passed), now);
  return {
    snapshot: state,
    result: {
      score,
      total,
      passed,
      perfect,
      award,
      results: graded.map((g) => ({
        questionId: g.question.id,
        correct: g.correct,
        correctIndex: passed ? g.correctIndex : undefined,
        // Explanations only for correct answers until the check is passed (no answer leaks).
        explanation: passed || g.correct ? g.question.explanation : undefined,
      })),
    },
  };
}

export function recordExercise(
  snapshot: ProgressSnapshot,
  catalog: Catalog,
  exerciseId: string,
  passed: boolean,
  now = new Date(),
): TransitionResult {
  const { state, levelBefore, xpBefore } = prepare(snapshot, now);
  const exercise = catalog.exercises.find((e) => e.id === exerciseId && e.published);
  if (!exercise) throw new AppError('NOT_FOUND', 'Exercise not found.');
  requireLesson(catalog, exercise.lessonId, levelBefore);
  const already = Boolean(state.exercises[exerciseId]);
  if (passed && !already) {
    state.exercises = { ...state.exercises, [exerciseId]: now.toISOString() };
    awardXp(state, { sourceType: 'exercise', sourceId: exerciseId, amount: exercise.xp, description: `Exercise: ${exercise.title}` }, now);
  }
  return { snapshot: state, result: finalize(state, catalog, levelBefore, xpBefore, already, now) };
}

export function claimMission(snapshot: ProgressSnapshot, catalog: Catalog, missionId: string, now = new Date()): TransitionResult {
  const { state, levelBefore, xpBefore } = prepare(snapshot, now);
  const mission = catalog.missions.find((m) => m.id === missionId && m.published);
  if (!mission) throw new AppError('NOT_FOUND', 'Mission not found.');
  if (state.missions[missionId]) {
    return { snapshot: state, result: finalize(state, catalog, levelBefore, xpBefore, true, now) };
  }
  const progress = requirementProgress(mission.requirement, computeStats(state, catalog));
  if (!progress.met) throw new AppError('REQUIREMENTS_NOT_MET', 'This mission is not complete yet.');
  state.missions = { ...state.missions, [missionId]: now.toISOString() };
  awardXp(state, { sourceType: 'mission', sourceId: missionId, amount: mission.xp, description: `Mission: ${mission.title}` }, now);
  return { snapshot: state, result: finalize(state, catalog, levelBefore, xpBefore, false, now) };
}
