// Writes the reference solutions and quiz keys as JSON for the browser test scripts.
import { writeFileSync } from 'node:fs';
import { buildBundledContent } from '../src/data/index';

const { catalog, privateContent } = buildBundledContent();
const target = process.argv[2] ?? 'test-results/fixtures.json';
writeFileSync(
  target,
  JSON.stringify({
    exercises: catalog.exercises.map((e) => ({ id: e.id, mode: e.mode, lessonId: e.lessonId, solution: privateContent.solutions.find((s) => s.exerciseId === e.id)!.files })),
    quizzes: Object.fromEntries(
      catalog.lessons.map((l) => [
        l.id,
        catalog.quizQuestions
          .filter((q) => q.lessonId === l.id)
          .sort((a, b) => a.order - b.order)
          .map((q) => q.options[privateContent.quizKeys.find((k) => k.questionId === q.id)!.correctIndex]),
      ]),
    ),
  }),
);
