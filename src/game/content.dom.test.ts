/**
 * Content integrity for the game:
 *  - structure of every task (answers in range, unique options, valid bug lines…)
 *  - every translatable string exists in uz / ru / en
 *  - JS and Python "output" answers and expression pairs are verified by really running them
 *  - each boss's reference solution passes its checks and its starter code does not
 */
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { evaluateChecks, normalizeOutput, requiresOutput, validateCheckSpecs, type ExerciseFiles } from '@shared/checks';
import { buildings } from '@/data/buildings';
import { DICTS, type L10n } from '@/i18n';
import { BADGES, QUESTS, STAGES, ZONES } from './content';
import type { Boss } from './types';

const hasPython = spawnSync('python3', ['--version']).status === 0;
const runNode = (code: string) => {
  const r = spawnSync(process.execPath, ['-e', code], { encoding: 'utf8', timeout: 10_000 });
  if (r.status !== 0) throw new Error(r.stderr);
  return r.stdout;
};
const runPy = (code: string) => {
  const r = spawnSync('python3', ['-c', code], { encoding: 'utf8', timeout: 10_000 });
  if (r.status !== 0) throw new Error(r.stderr);
  return r.stdout;
};
const filled = (t: L10n, where: string) => {
  for (const lang of ['uz', 'ru', 'en'] as const) expect(t[lang]?.trim(), `${where} [${lang}]`).toBeTruthy();
};

describe('game structure', () => {
  it('has 5 worlds with 5 stages each and unique ids', () => {
    expect(ZONES).toHaveLength(5);
    for (const z of ZONES) expect(z.stages).toHaveLength(5);
    const ids = STAGES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('links every world to a building', () => {
    for (const z of ZONES) expect(buildings.find((b) => b.id === z.buildingId)?.zoneId).toBe(z.id);
  });

  it('has complete translations for all content', () => {
    for (const s of STAGES) {
      filled(s.title, `${s.id} title`);
      filled(s.tip.text, `${s.id} tip`);
      s.tasks.forEach((t, i) => {
        if (t.kind === 'pick') filled(t.q, `${s.id} task ${i + 1}`);
      });
    }
    for (const z of ZONES) {
      filled(z.boss.name, `${z.id} boss name`);
      filled(z.boss.task, `${z.id} boss task`);
      z.boss.checks.forEach((c) => filled(c.label, `${z.id} boss check ${c.spec.id}`));
    }
    for (const b of BADGES) {
      filled(b.title, `badge ${b.id}`);
      filled(b.desc, `badge ${b.id} desc`);
    }
  });

  it('has every UI string in every language', () => {
    for (const lang of ['uz', 'ru', 'en'] as const) {
      for (const [key, value] of Object.entries(DICTS[lang])) expect(value.trim(), `${lang}:${key}`).toBeTruthy();
    }
    for (const q of QUESTS) expect(DICTS.uz[q.labelKey]).toBeTruthy();
  });

  it('only uses glyphs covered by the bundled 3D font in building names', () => {
    const allowed = (c: number) =>
      c < 0x250 || (c >= 0x2bb && c <= 0x2bc) || (c >= 0x2018 && c <= 0x201d) || (c >= 0x400 && c <= 0x45f) || [0x40e, 0x45e, 0x49a, 0x49b, 0x492, 0x493, 0x4b2, 0x4b3].includes(c);
    for (const b of buildings) {
      for (const lang of ['uz', 'ru', 'en'] as const) {
        for (const ch of DICTS[lang][b.nameKey] + b.symbol) expect(allowed(ch.codePointAt(0)!), `${b.id} ${lang}: ${ch}`).toBe(true);
      }
    }
  });
});

describe.each(STAGES.map((s) => [s.id, s] as const))('stage %s', (_id, stage) => {
  it('has 5–7 well-formed tasks', () => {
    expect(stage.tasks.length).toBeGreaterThanOrEqual(5);
    expect(stage.tasks.length).toBeLessThanOrEqual(7);
    expect(new Set(stage.tasks.map((t) => t.kind)).size).toBeGreaterThanOrEqual(3);
    for (const t of stage.tasks) {
      if (t.kind === 'pick' || t.kind === 'output' || t.kind === 'blank') {
        expect(t.options.length).toBeGreaterThanOrEqual(3);
        expect(new Set(t.options).size).toBe(t.options.length);
        expect(t.answer).toBeGreaterThanOrEqual(0);
        expect(t.answer).toBeLessThan(t.options.length);
      }
      if (t.kind === 'blank') expect(t.code.split('___').length).toBe(2);
      if (t.kind === 'order') {
        expect(t.lines.length).toBeGreaterThanOrEqual(3);
        expect(new Set(t.lines).size).toBe(t.lines.length);
      }
      if (t.kind === 'bug') {
        expect(t.bug).toBeGreaterThanOrEqual(0);
        expect(t.bug).toBeLessThan(t.lines.length);
        expect(t.fix).not.toBe(t.lines[t.bug]);
      }
      if (t.kind === 'match') {
        expect(t.pairs.length).toBeGreaterThanOrEqual(3);
        expect(new Set(t.pairs.map((p) => p[0])).size).toBe(t.pairs.length);
        expect(new Set(t.pairs.map((p) => p[1])).size).toBe(t.pairs.length);
      }
      if (t.kind === 'look') {
        expect(new Set(t.options.map((o) => JSON.stringify(o))).size).toBe(t.options.length);
        expect(t.answer).toBeLessThan(t.options.length);
      }
    }
  });

  it('has correct answers for runnable code', () => {
    for (const t of stage.tasks) {
      if (t.kind === 'output' && t.lang === 'js') expect(normalizeOutput(runNode(t.code))).toBe(normalizeOutput(t.options[t.answer]));
      if (t.kind === 'output' && t.lang === 'py' && hasPython) expect(normalizeOutput(runPy(t.code))).toBe(normalizeOutput(t.options[t.answer]));
      if (t.kind === 'match' && t.verify === 'js-expr') {
        for (const [left, right] of t.pairs) expect(runNode(`console.log(JSON.stringify(${left}))`).trim(), left).toBe(right);
      }
      if (t.kind === 'match' && t.verify === 'py-expr' && hasPython) {
        for (const [left, right] of t.pairs) expect(runPy(`print(${left})`).trim(), left).toBe(right);
      }
    }
  });
});

const parseHtml = (html: string) => new DOMParser().parseFromString(html, 'text/html');
function runBoss(boss: Boss, files: ExerciseFiles) {
  const checks = boss.checks.map((c) => ({ ...c.spec, label: c.label.en }));
  let stdout: string | undefined;
  if (requiresOutput(checks)) {
    try {
      stdout = boss.mode === 'python' ? (hasPython ? runPy(files.py ?? '') : undefined) : runNode(files.js ?? '');
    } catch {
      stdout = '';
    }
  }
  return evaluateChecks(checks, { files, stdout, parseHtml, environment: 'server' });
}

describe.each(ZONES.map((z) => [z.id, z.boss] as const))('boss %s', (_id, boss) => {
  it('has valid checks', () => {
    expect(validateCheckSpecs(boss.checks.map((c) => ({ ...c.spec, label: c.label.en }))).ok).toBe(true);
  });
  it('reference solution passes every check that can run outside a browser', () => {
    const failures = runBoss(boss, boss.solution).filter((r) => r.status === 'fail');
    expect(failures, JSON.stringify(failures)).toHaveLength(0);
  });
  it('starter code does not pass', () => {
    expect(runBoss(boss, boss.starter).some((r) => r.status === 'fail')).toBe(true);
  });
});
