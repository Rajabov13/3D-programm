import type { ExerciseFiles, ExerciseMode } from '@shared/checks';

/** Router state accepted by /playground (e.g. from a lesson's "Try it" button). */
export interface PlaygroundLaunchState {
  mode: ExerciseMode;
  files: ExerciseFiles;
}
