// Writes the game's answer keys and boss solutions as JSON for the browser test scripts.
import { writeFileSync } from 'node:fs';
import { STAGES, ZONES } from '../src/game/content';
import { learnFor } from '../src/game/learn';
import type { Task } from '../src/game/types';

/** How a test clicks the correct answer for each task. */
function answerOf(task: Task) {
  switch (task.kind) {
    case 'pick':
    case 'output':
    case 'blank':
    case 'look':
      return { kind: 'choice', answer: task.answer, wrong: task.answer === 0 ? 1 : 0 };
    case 'order':
      return { kind: 'order', count: task.lines.length };
    case 'bug':
      return { kind: 'bug', answer: task.bug, wrong: task.bug === 0 ? 1 : 0 };
    case 'match':
      return { kind: 'match', count: task.pairs.length };
  }
}

const target = process.argv[2] ?? 'test-results/fixtures.json';
writeFileSync(
  target,
  JSON.stringify({
    stages: STAGES.map((s) => ({ id: s.id, zoneId: s.zoneId, cards: learnFor(s.id).length, tasks: s.tasks.map(answerOf) })),
    bosses: ZONES.map((z) => ({
      zoneId: z.id,
      mode: z.boss.mode,
      requiredLevel: z.requiredLevel,
      stageIds: z.stages.map((s) => s.id),
      solution: z.boss.solution,
      starter: z.boss.starter,
    })),
  }),
);
