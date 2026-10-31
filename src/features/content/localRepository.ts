import { buildBundledContent } from '@/data';
import { readJSON, removeKey, writeJSON } from '@/lib/storage';
import type { Catalog, PrivateContent } from '@/types';
import type { ContentRepository } from './repository';

const STORAGE_KEY = 'cw.demo.content.v1';

interface StoredContent {
  version: 1;
  catalog: Catalog;
  privateContent: PrivateContent;
}

/**
 * Content for the demo version: the bundled courses, plus any edits made in the
 * admin area (stored only in this browser). There is no server, so there is no
 * security boundary here — a production deployment needs server-side authorization.
 */
export class LocalContentRepository implements ContentRepository {
  readonly kind = 'local' as const;
  private state: StoredContent;

  constructor() {
    const stored = readJSON<StoredContent | null>(STORAGE_KEY, null);
    if (stored?.version === 1 && stored.catalog?.courses) {
      this.state = stored;
    } else {
      const bundled = buildBundledContent();
      this.state = { version: 1, ...bundled };
    }
  }

  get hasLocalEdits(): boolean {
    return readJSON<StoredContent | null>(STORAGE_KEY, null) !== null;
  }

  resetToBundled(): void {
    removeKey(STORAGE_KEY);
    this.state = { version: 1, ...buildBundledContent() };
  }

  private persist() {
    writeJSON(STORAGE_KEY, this.state);
  }

  private mutate(fn: (catalog: Catalog, priv: PrivateContent) => void) {
    const next = structuredClone(this.state);
    fn(next.catalog, next.privateContent);
    this.state = next;
    this.persist();
  }

  async loadCatalog(): Promise<Catalog> {
    return structuredClone(this.state.catalog);
  }

  async loadPrivate(): Promise<PrivateContent> {
    return structuredClone(this.state.privateContent);
  }

  async saveCourse(course: Catalog['courses'][number]) {
    this.mutate((c) => upsert(c.courses, course));
  }

  async deleteCourse(id: string) {
    this.mutate((c, p) => {
      const lessonIds = c.lessons.filter((l) => l.courseId === id).map((l) => l.id);
      const exerciseIds = c.exercises.filter((e) => lessonIds.includes(e.lessonId)).map((e) => e.id);
      const questionIds = c.quizQuestions.filter((q) => lessonIds.includes(q.lessonId)).map((q) => q.id);
      c.courses = c.courses.filter((x) => x.id !== id);
      c.lessons = c.lessons.filter((l) => l.courseId !== id);
      c.exercises = c.exercises.filter((e) => !exerciseIds.includes(e.id));
      c.quizQuestions = c.quizQuestions.filter((q) => !questionIds.includes(q.id));
      p.solutions = p.solutions.filter((s) => !exerciseIds.includes(s.exerciseId));
      p.quizKeys = p.quizKeys.filter((k) => !questionIds.includes(k.questionId));
    });
  }

  async saveLesson(lesson: Catalog['lessons'][number], quiz?: { questions: Catalog['quizQuestions']; keys: PrivateContent['quizKeys'] }) {
    this.mutate((c, p) => {
      upsert(c.lessons, lesson);
      if (quiz) {
        const oldIds = c.quizQuestions.filter((q) => q.lessonId === lesson.id).map((q) => q.id);
        c.quizQuestions = [...c.quizQuestions.filter((q) => q.lessonId !== lesson.id), ...quiz.questions];
        p.quizKeys = [...p.quizKeys.filter((k) => !oldIds.includes(k.questionId)), ...quiz.keys];
      }
    });
  }

  async deleteLesson(id: string) {
    this.mutate((c, p) => {
      const exerciseIds = c.exercises.filter((e) => e.lessonId === id).map((e) => e.id);
      const questionIds = c.quizQuestions.filter((q) => q.lessonId === id).map((q) => q.id);
      c.lessons = c.lessons.filter((l) => l.id !== id);
      c.exercises = c.exercises.filter((e) => e.lessonId !== id);
      c.quizQuestions = c.quizQuestions.filter((q) => q.lessonId !== id);
      p.solutions = p.solutions.filter((s) => !exerciseIds.includes(s.exerciseId));
      p.quizKeys = p.quizKeys.filter((k) => !questionIds.includes(k.questionId));
    });
  }

  async saveExercise(exercise: Catalog['exercises'][number], solution?: PrivateContent['solutions'][number]) {
    this.mutate((c, p) => {
      upsert(c.exercises, exercise);
      if (solution) {
        p.solutions = [...p.solutions.filter((s) => s.exerciseId !== exercise.id), solution];
      }
    });
  }

  async deleteExercise(id: string) {
    this.mutate((c, p) => {
      c.exercises = c.exercises.filter((e) => e.id !== id);
      p.solutions = p.solutions.filter((s) => s.exerciseId !== id);
    });
  }

  async saveAchievement(achievement: Catalog['achievements'][number]) {
    this.mutate((c) => upsert(c.achievements, achievement));
  }

  async deleteAchievement(id: string) {
    this.mutate((c) => {
      c.achievements = c.achievements.filter((a) => a.id !== id);
    });
  }

  async saveMission(mission: Catalog['missions'][number]) {
    this.mutate((c) => upsert(c.missions, mission));
  }

  async deleteMission(id: string) {
    this.mutate((c) => {
      c.missions = c.missions.filter((m) => m.id !== id);
    });
  }
}

function upsert<T extends { id: string }>(list: T[], item: T) {
  const index = list.findIndex((x) => x.id === item.id);
  if (index === -1) list.push(item);
  else list[index] = item;
}
