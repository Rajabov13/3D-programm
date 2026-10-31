import type { CheckSpec, ExerciseFiles, ExerciseMode } from '@shared/checks';
import type { DictKey, L10n } from '@/i18n';
import type { BuildingId } from '@/data/buildings';

export type CodeLang = 'html' | 'css' | 'js' | 'py' | 'jsx';
export type ZoneId = 'html' | 'css' | 'js' | 'python' | 'react';

/** CSS properties (camelCase) used to render the options of a "look" task. */
export type StyleOption = Record<string, string>;

/**
 * Mini-game task kinds. Code and options are language-neutral; only `pick`
 * questions carry translated text — every other kind uses a generic prompt.
 */
export type Task =
  | { kind: 'pick'; q: L10n; code?: string; lang?: CodeLang; options: string[]; answer: number }
  | { kind: 'output'; code: string; lang: CodeLang; options: string[]; answer: number }
  | { kind: 'blank'; code: string; lang: CodeLang; options: string[]; answer: number }
  | { kind: 'order'; lines: string[]; lang: CodeLang }
  | { kind: 'bug'; lines: string[]; bug: number; fix: string; lang: CodeLang }
  | { kind: 'match'; pairs: Array<[string, string]>; verify?: 'js-expr' | 'py-expr' }
  | { kind: 'look'; code: string; preview: 'text' | 'box' | 'row' | 'grid'; options: StyleOption[]; answer: number };

export type TaskKind = Task['kind'];

export interface Stage {
  id: string;
  zoneId: ZoneId;
  title: L10n;
  tip: { text: L10n; code: string; lang: CodeLang };
  tasks: Task[];
}

export interface BossCheck {
  label: L10n;
  /** The `label` inside `spec` is replaced with the localized label at runtime. */
  spec: CheckSpec;
}

export interface Boss {
  zoneId: ZoneId;
  name: L10n;
  task: L10n;
  mode: ExerciseMode;
  starter: ExerciseFiles;
  solution: ExerciseFiles;
  checks: BossCheck[];
  xp: number;
}

export interface Zone {
  id: ZoneId;
  nameKey: DictKey;
  buildingId: BuildingId;
  symbol: string;
  accent: string;
  requiredLevel: number;
  stages: Stage[];
  boss: Boss;
}

export type BadgeGoal =
  | { type: 'stages'; n: number }
  | { type: 'perfect'; n: number }
  | { type: 'stars'; n: number }
  | { type: 'bosses'; n: number }
  | { type: 'zones'; n: number }
  | { type: 'zonePerfect'; n: number }
  | { type: 'streak'; n: number }
  | { type: 'xp'; n: number };

export interface Badge {
  id: string;
  title: L10n;
  desc: L10n;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  xp: number;
  goal: BadgeGoal;
}

export type QuestGoal = { type: 'stages'; n: number } | { type: 'perfect'; n: number } | { type: 'xp'; n: number } | { type: 'bosses'; n: number };

export interface Quest {
  id: string;
  labelKey: DictKey;
  goal: QuestGoal;
  xp: number;
}
