import { describe, expect, it } from 'vitest';
import {
  evaluateChecks,
  normalizeOutput,
  parseCss,
  stripComments,
  summarizeResults,
  validateCheckSpecs,
  validateFiles,
  type CheckSpec,
} from './checks';

describe('stripComments', () => {
  it('removes JS comments but keeps strings', () => {
    const src = "const a = '// not a comment'; // real comment\n/* block */ let b = 1;";
    const out = stripComments(src, 'js');
    expect(out).toContain("'// not a comment'");
    expect(out).not.toContain('real comment');
    expect(out).not.toContain('block');
    expect(out).toContain('let b = 1;');
  });
  it('removes Python comments but keeps # inside strings', () => {
    const out = stripComments('x = "#tag"  # comment\nprint(x)', 'py');
    expect(out).toContain('"#tag"');
    expect(out).not.toContain('comment');
  });
  it('removes HTML and CSS comments', () => {
    expect(stripComments('<!-- <h1>x</h1> --><p>y</p>', 'html')).toBe('<p>y</p>');
    expect(stripComments('/* a{color:red} */ b{color:blue}', 'css')).toBe(' b{color:blue}');
  });
});

describe('parseCss', () => {
  it('parses rules, selector lists and media queries', () => {
    const rules = parseCss(`
      *, *::before { box-sizing: border-box; }
      .card { padding: 1rem; border: 1px solid red }
      @media (min-width: 768px) { .layout { grid-template-columns: 1fr 1fr; } }
      @keyframes spin { from { opacity: 0 } }
    `);
    expect(rules.find((r) => r.selectors.includes('*'))?.declarations[0]).toEqual({ property: 'box-sizing', value: 'border-box' });
    expect(rules.find((r) => r.selectors.includes('.card'))?.declarations).toHaveLength(2);
    expect(rules.find((r) => r.selectors.includes('.layout'))?.declarations[0].value).toBe('1fr 1fr');
    expect(rules.some((r) => r.selectors.includes('from'))).toBe(false);
  });
  it('handles semicolons inside url()', () => {
    const rules = parseCss('.x { background: url(data:image/png;base64,AAA); color: red; }');
    expect(rules[0].declarations.map((d) => d.property)).toEqual(['background', 'color']);
  });
});

describe('evaluateChecks', () => {
  const checks: CheckSpec[] = [
    { id: 'a', label: 'uses const', type: 'source_regex', file: 'js', pattern: '\\bconst\\b' },
    { id: 'b', label: 'output', type: 'output_equals', expected: 'hi\nthere' },
    { id: 'c', label: 'css', type: 'css_declaration', selector: '.card', property: 'padding' },
    { id: 'd', label: 'runtime', type: 'dom_runtime', selector: '#x' },
  ];

  it('commented-out code does not satisfy checks', () => {
    const [r] = evaluateChecks([checks[0]], { files: { js: '// const x = 1' }, environment: 'client' });
    expect(r.status).toBe('fail');
  });

  it('normalizes output line endings and trailing whitespace', () => {
    expect(normalizeOutput('hi  \r\nthere\n\n')).toBe('hi\nthere');
    const [r] = evaluateChecks([checks[1]], { files: {}, stdout: 'hi \nthere\n', environment: 'server' });
    expect(r.status).toBe('pass');
  });

  it('skips output checks until code has run', () => {
    const [r] = evaluateChecks([checks[1]], { files: {}, environment: 'client' });
    expect(r.status).toBe('skipped');
  });

  it('reads CSS from <style> tags too', () => {
    const [r] = evaluateChecks([checks[2]], { files: { html: '<style>.card{padding:2px}</style>' }, environment: 'server' });
    expect(r.status).toBe('pass');
  });

  it('runtime checks are skipped on the server and required on the client', () => {
    const files = { js: 'const x = 1' };
    const server = evaluateChecks(checks, { files, stdout: 'hi\nthere', environment: 'server' });
    expect(server.find((r) => r.id === 'd')?.status).toBe('skipped');
    const client = evaluateChecks(checks, { files: { ...files, css: '.card{padding:1px}' }, stdout: 'hi\nthere', environment: 'client' });
    expect(summarizeResults(client, 'client').passed).toBe(false);
    const withRuntime = evaluateChecks(checks, {
      files: { ...files, css: '.card{padding:1px}' },
      stdout: 'hi\nthere',
      runtime: { d: { pass: true } },
      environment: 'client',
    });
    expect(summarizeResults(withRuntime, 'client').passed).toBe(true);
  });

  it('server summary requires at least one verified pass', () => {
    expect(summarizeResults([{ id: 'x', label: 'x', status: 'skipped' }], 'server').passed).toBe(false);
  });

  it('invalid regex fails safely', () => {
    const [r] = evaluateChecks([{ id: 'x', label: 'x', type: 'source_regex', file: 'js', pattern: '(' }], { files: { js: '' }, environment: 'server' });
    expect(r.status).toBe('fail');
  });
});

describe('validation', () => {
  it('rejects malformed checks', () => {
    const result = validateCheckSpecs([{ id: 'a', label: 'x', type: 'source_regex', file: 'js', pattern: '(' }, { id: 'a' }]);
    expect(result.ok).toBe(false);
  });
  it('accepts valid checks', () => {
    expect(validateCheckSpecs([{ id: 'a', label: 'x', type: 'output_equals', expected: '' }]).ok).toBe(true);
  });
  it('validates submitted files', () => {
    expect(validateFiles({ js: 'x' }).ok).toBe(true);
    expect(validateFiles({ exe: 'x' }).ok).toBe(false);
    expect(validateFiles({ js: 'x'.repeat(70_000) }).ok).toBe(false);
    expect(validateFiles({ js: 5 }).ok).toBe(false);
  });
});
