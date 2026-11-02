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
  tasks: Task[];
}

// ─── Learning cards (info → picture → example, shown before the test) ───────

/** A table cell: language-neutral text (code, emoji) or translated text. */
export type Cell = string | L10n;

/** A rendered web page (sandboxed: no scripts, no navigation, images become placeholders). */
export interface BrowserView {
  kind: 'browser';
  /** Page HTML. In an example it defaults to the example code when that code is HTML. */
  html?: string;
  /** Page CSS. In an example it defaults to the example code when that code is CSS. */
  css?: string;
  /** Text for the mock browser tab (e.g. to show document.title). */
  title?: string;
}

export type Picture =
  /** Code with highlighted parts and a legend explaining each part. */
  | { kind: 'parts'; code: string; lang: CodeLang; parts: Array<{ text: string; label: L10n }> }
  /** Variables / fields drawn as labelled boxes. */
  | { kind: 'boxes'; items: Array<{ name: string; value: string }> }
  /** An array / list with its indexes. */
  | { kind: 'list'; name: string; items: string[]; negative?: boolean }
  /** A two-column cheat sheet (optionally verified by running the left column). */
  | { kind: 'table'; head?: [Cell, Cell]; rows: Array<[string, Cell]>; verify?: 'js-expr' | 'py-expr' }
  /** CSS declarations rendered side by side. */
  | { kind: 'compare'; preview: 'text' | 'box' | 'row' | 'grid'; items: Array<{ code: string; style: StyleOption }> }
  /** The CSS box model diagram. */
  | { kind: 'boxmodel' }
  | (BrowserView & { html: string });

export type ExampleResult = BrowserView | { kind: 'terminal'; lines: string[] };

export interface LearnCard {
  /** A big emoji illustration. */
  icon: string;
  title: L10n;
  /** One or two short sentences. */
  text: L10n;
  picture?: Picture;
  example: { code: string; lang: CodeLang; result: ExampleResult; caption?: L10n };
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
