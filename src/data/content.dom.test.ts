/**
 * Content integrity: every exercise must be solvable and verifiable.
 *  - check specs are valid and include at least one server-verifiable check
 *  - the reference solution passes every check that can run outside a browser
 *    (JS solutions run in a Node child process, Python in python3 if available)
 *  - the starter code does NOT already pass
 *  - every quiz question has a valid answer key
 */
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { evaluateChecks, isServerVerifiable, requiresOutput, validateCheckSpecs, type ExerciseFiles } from '@shared/checks';
import { buildBundledContent } from './index';
import { buildings } from './buildings';

const { catalog, privateContent } = buildBundledContent();
const hasPython = spawnSync('python3', ['--version']).status === 0;

function run(mode: string, files: ExerciseFiles): string | undefined {
  if (mode === 'console') {
    const r = spawnSync(process.execPath, ['-e', files.js ?? ''], { encoding: 'utf8', timeout: 10_000 });
    if (r.status !== 0) throw new Error(r.stderr);
    return r.stdout;
  }
  if (mode === 'python') {
    if (!hasPython) return undefined;
    const r = spawnSync('python3', ['-c', files.py ?? ''], { encoding: 'utf8', timeout: 10_000 });
    if (r.status !== 0) throw new Error(r.stderr);
    return r.stdout;
  }
  return undefined;
}

const parseHtml = (html: string) => new DOMParser().parseFromString(html, 'text/html');

describe('catalog structure', () => {
  it('has unique ids', () => {
    for (const list of [catalog.courses, catalog.lessons, catalog.exercises, catalog.quizQuestions, catalog.missions, catalog.achievements]) {
      const ids = list.map((x) => x.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it('links every course to a building and every lesson to a course', () => {
    for (const course of catalog.courses) expect(buildings.some((b) => b.id === course.buildingId)).toBe(true);
    for (const lesson of catalog.lessons) expect(catalog.courses.some((c) => c.id === lesson.courseId)).toBe(true);
    for (const ex of catalog.exercises) expect(catalog.lessons.some((l) => l.id === ex.lessonId)).toBe(true);
  });
  it('has at least five lessons per course, each with a quiz and an exercise', () => {
    for (const course of catalog.courses) {
      const lessons = catalog.lessons.filter((l) => l.courseId === course.id);
      expect(lessons.length).toBeGreaterThanOrEqual(5);
      for (const lesson of lessons) {
        expect(catalog.quizQuestions.filter((q) => q.lessonId === lesson.id).length).toBeGreaterThanOrEqual(3);
        expect(catalog.exercises.filter((e) => e.lessonId === lesson.id).length).toBeGreaterThanOrEqual(1);
      }
    }
  });
  it('has a valid answer key for every quiz question', () => {
    for (const q of catalog.quizQuestions) {
      const key = privateContent.quizKeys.find((k) => k.questionId === q.id);
      expect(key, q.id).toBeDefined();
      expect(key!.correctIndex).toBeGreaterThanOrEqual(0);
      expect(key!.correctIndex).toBeLessThan(q.options.length);
    }
  });
  it('references existing courses in requirements and prerequisites', () => {
    const ids = new Set(catalog.courses.map((c) => c.id));
    for (const c of catalog.courses) for (const p of c.prerequisites) expect(ids.has(p)).toBe(true);
    for (const r of [...catalog.missions.map((m) => m.requirement), ...catalog.achievements.map((a) => a.criteria)]) {
      if ('courseId' in r && r.courseId) expect(ids.has(r.courseId)).toBe(true);
    }
  });
});

describe.each(catalog.exercises.map((e) => [e.id, e] as const))('exercise %s', (_id, exercise) => {
  const solution = privateContent.solutions.find((s) => s.exerciseId === exercise.id)!.files;

  it('has valid checks, including a server-verifiable one', () => {
    expect(validateCheckSpecs(exercise.checks).ok).toBe(true);
    expect(exercise.checks.some(isServerVerifiable)).toBe(true);
  });

  it('reference solution passes all non-browser checks', () => {
    const stdout = requiresOutput(exercise.checks) ? run(exercise.mode, solution) : undefined;
    const results = evaluateChecks(exercise.checks, { files: solution, stdout, parseHtml, environment: 'server' });
    const failures = results.filter((r) => r.status === 'fail');
    expect(failures, JSON.stringify(failures, null, 2)).toHaveLength(0);
  });

  it('starter code does not already pass', () => {
    let stdout: string | undefined;
    try {
      stdout = requiresOutput(exercise.checks) ? run(exercise.mode, exercise.starter) : undefined;
    } catch {
      stdout = '';
    }
    const results = evaluateChecks(exercise.checks, { files: exercise.starter, stdout: stdout ?? '', parseHtml, environment: 'server' });
    expect(results.some((r) => r.status === 'fail')).toBe(true);
  });
});

describe('3D text glyph coverage', () => {
  it('uses only Latin-1 characters in building names/symbols (bundled fonts; avoids CDN font fallback)', () => {
    for (const b of buildings) {
      for (const ch of b.name + b.symbol) expect(ch.charCodeAt(0), `${b.id}: ${ch}`).toBeLessThan(0x100);
    }
  });
});
