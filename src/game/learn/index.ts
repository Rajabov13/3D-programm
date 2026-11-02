import type { LearnCard } from '../types';
import { cssLearn } from './css';
import { htmlLearn } from './html';
import { jsLearn } from './js';
import { pythonLearn } from './python';
import { reactLearn } from './react';

/** Learning cards (info → picture → example) shown before each stage's test. */
export const LEARN: Record<string, LearnCard[]> = { ...htmlLearn, ...cssLearn, ...jsLearn, ...pythonLearn, ...reactLearn };

export const learnFor = (stageId: string): LearnCard[] => LEARN[stageId] ?? [];
