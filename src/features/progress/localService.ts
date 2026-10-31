import type { ExerciseFiles } from '@shared/checks';
import { publishedView } from '@/features/content/published';
import type { ContentRepository } from '@/features/content/repository';
import { detectTimeZone } from '@/lib/dates';
import { readJSON, removeKey, writeJSON } from '@/lib/storage';
import type { LeaderboardEntry, ProgressSnapshot } from '@/types';
import { claimMission, completeLesson, emptySnapshot, recordExercise, submitQuiz, withDerived } from './engine';
import type { AccountSettingsPatch, ClientEvaluation, ProgressService } from './service';

const STORAGE_KEY = 'cw.demo.progress.v1';

/** Clearly-fictional sample rows so the demo leaderboard isn't empty. */
const DEMO_RIVALS: Array<Omit<LeaderboardEntry, 'rank' | 'isMe'>> = [
  { displayName: 'Sample · Nova', avatar: 'nebula', level: 7, xp: 1310 },
  { displayName: 'Sample · Orion', avatar: 'quasar', level: 5, xp: 790 },
  { displayName: 'Sample · Lyra', avatar: 'aurora', level: 4, xp: 520 },
  { displayName: 'Sample · Vega', avatar: 'ember', level: 3, xp: 300 },
  { displayName: 'Sample · Atlas', avatar: 'circuit', level: 2, xp: 140 },
];

export class LocalProgressService implements ProgressService {
  readonly kind = 'local' as const;

  constructor(
    private readonly content: ContentRepository,
    private readonly getProfile: () => { displayName: string; avatar: string; showOnLeaderboard: boolean },
  ) {}

  private load(): ProgressSnapshot {
    const stored = readJSON<ProgressSnapshot | null>(STORAGE_KEY, null);
    return withDerived(stored ?? emptySnapshot(detectTimeZone()));
  }

  private save(snapshot: ProgressSnapshot) {
    writeJSON(STORAGE_KEY, snapshot);
  }

  private async catalog() {
    return publishedView(await this.content.loadCatalog());
  }

  async getSnapshot() {
    return this.load();
  }

  async completeLesson(lessonId: string) {
    const { snapshot, result } = completeLesson(this.load(), await this.catalog(), lessonId);
    this.save(snapshot);
    return result;
  }

  async submitQuiz(lessonId: string, answers: number[]) {
    const keys = (await this.content.loadPrivate()).quizKeys;
    const { snapshot, result } = submitQuiz(this.load(), await this.catalog(), keys, lessonId, answers);
    this.save(snapshot);
    return result;
  }

  async submitExercise(exerciseId: string, _files: ExerciseFiles, evaluation: ClientEvaluation) {
    const { snapshot, result } = recordExercise(this.load(), await this.catalog(), exerciseId, evaluation.passed);
    this.save(snapshot);
    return { passed: evaluation.passed, results: evaluation.results, verifiedBy: 'browser' as const, award: result };
  }

  async claimMission(missionId: string) {
    const { snapshot, result } = claimMission(this.load(), await this.catalog(), missionId);
    this.save(snapshot);
    return result;
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const me = this.load();
    const profile = this.getProfile();
    const rows = DEMO_RIVALS.map((r) => ({ ...r, isMe: false }));
    if (profile.showOnLeaderboard) rows.push({ displayName: profile.displayName, avatar: profile.avatar, level: me.level, xp: me.xp, isMe: true });
    return rows.sort((a, b) => b.xp - a.xp).map((r, i) => ({ ...r, rank: i + 1 }));
  }

  async updateAccountSettings(patch: AccountSettingsPatch) {
    const snapshot = this.load();
    this.save(withDerived({ ...snapshot, ...patch }));
  }

  reset() {
    removeKey(STORAGE_KEY);
  }
}
