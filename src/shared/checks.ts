/**
 * Exercise check engine.
 *
 * This module never executes learner code. It only
 *   - inspects source text (comments stripped),
 *   - parses HTML through an injected, script-free parser (DOMParser),
 *   - parses CSS with the small tokenizer below,
 *   - compares program output produced by the sandboxed iframe/worker runners.
 *
 * It is dependency-free and runtime-agnostic, so it can also be reused by a
 * future server-side verifier without changes.
 */

export type FileKey = 'html' | 'css' | 'js' | 'jsx' | 'py';
export type ExerciseFiles = Partial<Record<FileKey, string>>;
export type ExerciseMode = 'web' | 'console' | 'python' | 'react';

export type RuntimeAction =
  | { type: 'click'; selector: string; times?: number }
  | { type: 'input'; selector: string; value: string };

interface BaseCheck {
  id: string;
  label: string;
}

export type CheckSpec = BaseCheck &
  (
    | { type: 'source_includes'; file: FileKey; value: string; caseSensitive?: boolean }
    | { type: 'source_regex'; file: FileKey; pattern: string; flags?: string }
    | { type: 'source_not_regex'; file: FileKey; pattern: string; flags?: string }
    | {
        type: 'html_element';
        selector: string;
        min?: number;
        max?: number;
        textIncludes?: string;
        attribute?: { name: string; valuePattern?: string };
      }
    | { type: 'css_declaration'; selector: string; property: string; valuePattern?: string }
    | { type: 'output_equals'; expected: string }
    | { type: 'output_includes'; value: string; caseSensitive?: boolean }
    | {
        type: 'dom_runtime';
        selector: string;
        min?: number;
        textIncludes?: string;
        textEquals?: string;
        before?: RuntimeAction[];
      }
  );

export type CheckType = CheckSpec['type'];
export type CheckStatus = 'pass' | 'fail' | 'skipped';

export interface CheckResult {
  id: string;
  label: string;
  status: CheckStatus;
  message?: string;
}

export interface HtmlElementLike {
  textContent: string | null;
  getAttribute(name: string): string | null;
}

export interface HtmlDocumentLike {
  querySelectorAll(selector: string): ArrayLike<HtmlElementLike>;
}

export interface RuntimeCheckOutcome {
  pass: boolean;
  message?: string;
}

export interface EvaluationContext {
  files: ExerciseFiles;
  /** Program output. `undefined` means "not available" (e.g. code not run yet). */
  stdout?: string;
  /** Results of `dom_runtime` checks evaluated inside the client preview sandbox. */
  runtime?: Record<string, RuntimeCheckOutcome>;
  /** Script-free HTML parser (browser DOMParser or deno-dom). */
  parseHtml?: (html: string) => HtmlDocumentLike | null;
  environment: 'client' | 'server';
}

export const CHECK_TYPES: readonly CheckType[] = [
  'source_includes',
  'source_regex',
  'source_not_regex',
  'html_element',
  'css_declaration',
  'output_equals',
  'output_includes',
  'dom_runtime',
] as const;

const FILE_KEYS: readonly FileKey[] = ['html', 'css', 'js', 'jsx', 'py'];

/** Checks the server can verify without a browser. */
export function isServerVerifiable(check: CheckSpec): boolean {
  return check.type !== 'dom_runtime';
}

export function requiresOutput(checks: readonly CheckSpec[]): boolean {
  return checks.some((c) => c.type === 'output_equals' || c.type === 'output_includes');
}

export function requiresRuntime(checks: readonly CheckSpec[]): boolean {
  return checks.some((c) => c.type === 'dom_runtime');
}

// ─── Source helpers ─────────────────────────────────────────────────────────

/**
 * Removes comments so that checks cannot be satisfied by commented-out code.
 * String literals are preserved. Regex literals in JS are handled heuristically.
 */
export function stripComments(source: string, file: FileKey): string {
  if (!source) return '';
  if (file === 'html') return source.replace(/<!--[\s\S]*?-->/g, '');
  if (file === 'css') return source.replace(/\/\*[\s\S]*?\*\//g, '');
  if (file === 'py') return stripPythonComments(source);
  return stripCLikeComments(source);
}

function stripCLikeComments(src: string): string {
  let out = '';
  let i = 0;
  let quote: string | null = null;
  while (i < src.length) {
    const ch = src[i];
    const next = src[i + 1];
    if (quote) {
      out += ch;
      if (ch === '\\' && i + 1 < src.length) {
        out += next;
        i += 2;
        continue;
      }
      if (ch === quote) quote = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      out += ch;
      i++;
      continue;
    }
    if (ch === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      const end = src.indexOf('*/', i + 2);
      const chunk = end === -1 ? src.slice(i) : src.slice(i, end + 2);
      out += chunk.replace(/[^\n]/g, ''); // keep line numbers stable
      i = end === -1 ? src.length : end + 2;
      continue;
    }
    // JSX text such as <p>// not a comment</p> is rare enough in exercises to ignore.
    out += ch;
    i++;
  }
  return out;
}

function stripPythonComments(src: string): string {
  let out = '';
  let i = 0;
  let quote: string | null = null;
  while (i < src.length) {
    const ch = src[i];
    if (quote) {
      if (src.startsWith(quote, i) && quote.length === 3) {
        out += quote;
        i += 3;
        quote = null;
        continue;
      }
      out += ch;
      if (ch === '\\' && i + 1 < src.length) {
        out += src[i + 1];
        i += 2;
        continue;
      }
      if (quote.length === 1 && (ch === quote || ch === '\n')) quote = null;
      i++;
      continue;
    }
    if (src.startsWith('"""', i) || src.startsWith("'''", i)) {
      quote = src.slice(i, i + 3);
      out += quote;
      i += 3;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      out += ch;
      i++;
      continue;
    }
    if (ch === '#') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

export function normalizeOutput(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+$/u, ''))
    .join('\n')
    .replace(/\n+$/u, '')
    .replace(/^\n+/u, '');
}

function safeRegExp(pattern: string, flags?: string): RegExp | null {
  try {
    return new RegExp(pattern, flags ?? '');
  } catch {
    return null;
  }
}

// ─── CSS parsing ────────────────────────────────────────────────────────────

export interface CssDeclaration {
  property: string;
  value: string;
}

export interface CssRule {
  selectors: string[];
  declarations: CssDeclaration[];
}

export function normalizeSelector(selector: string): string {
  return selector
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*([>+~,])\s*/g, '$1')
    .replace(/\s*:\s*/g, ':');
}

function findBlockEnd(src: string, openIndex: number): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = openIndex; i < src.length; i++) {
    const ch = src[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return src.length;
}

function parseDeclarations(body: string): CssDeclaration[] {
  // Remove nested blocks (CSS nesting) from the declaration list.
  let flat = '';
  let depth = 0;
  for (const ch of body) {
    if (ch === '{') depth++;
    else if (ch === '}') depth = Math.max(0, depth - 1);
    else if (depth === 0) flat += ch;
  }
  const declarations: CssDeclaration[] = [];
  let current = '';
  let parens = 0;
  for (const ch of flat) {
    if (ch === '(') parens++;
    if (ch === ')') parens = Math.max(0, parens - 1);
    if (ch === ';' && parens === 0) {
      pushDeclaration(current, declarations);
      current = '';
    } else current += ch;
  }
  pushDeclaration(current, declarations);
  return declarations;
}

function pushDeclaration(raw: string, into: CssDeclaration[]) {
  const idx = raw.indexOf(':');
  if (idx <= 0) return;
  const property = raw.slice(0, idx).trim().toLowerCase();
  const value = raw.slice(idx + 1).trim();
  if (property && value && /^[-a-z]+$/.test(property)) into.push({ property, value });
}

export function parseCss(css: string): CssRule[] {
  const src = stripComments(css ?? '', 'css');
  const rules: CssRule[] = [];
  parseCssBlock(src, rules, 0);
  return rules;
}

function parseCssBlock(src: string, rules: CssRule[], depth: number) {
  if (depth > 8) return;
  let prelude = '';
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '{') {
      const end = findBlockEnd(src, i);
      const body = src.slice(i + 1, end);
      const head = prelude.trim();
      if (head.startsWith('@')) {
        const atName = head.slice(1).split(/[\s({]/)[0]?.toLowerCase() ?? '';
        if (['media', 'supports', 'container', 'layer', 'scope'].includes(atName)) {
          parseCssBlock(body, rules, depth + 1);
        }
      } else if (head) {
        rules.push({
          selectors: head.split(',').map(normalizeSelector).filter(Boolean),
          declarations: parseDeclarations(body),
        });
      }
      prelude = '';
      i = end + 1;
      continue;
    }
    if (ch === ';' && prelude.trim().startsWith('@')) {
      prelude = ''; // @import / @charset statements
      i++;
      continue;
    }
    prelude += ch;
    i++;
  }
}

/** CSS from the css file plus any <style> blocks in the HTML file. */
export function collectCss(files: ExerciseFiles): string {
  let css = files.css ?? '';
  const html = files.html ?? '';
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m: RegExpExecArray | null;
  while ((m = styleRe.exec(html))) css += '\n' + m[1];
  return css;
}

// ─── Evaluation ─────────────────────────────────────────────────────────────

const pass = (c: CheckSpec, message?: string): CheckResult => ({ id: c.id, label: c.label, status: 'pass', message });
const fail = (c: CheckSpec, message: string): CheckResult => ({ id: c.id, label: c.label, status: 'fail', message });
const skip = (c: CheckSpec, message: string): CheckResult => ({ id: c.id, label: c.label, status: 'skipped', message });

export function evaluateCheck(check: CheckSpec, ctx: EvaluationContext): CheckResult {
  switch (check.type) {
    case 'source_includes': {
      const src = stripComments(ctx.files[check.file] ?? '', check.file);
      const found = check.caseSensitive
        ? src.includes(check.value)
        : src.toLowerCase().includes(check.value.toLowerCase());
      return found ? pass(check) : fail(check, `Expected your ${fileLabel(check.file)} code to contain “${check.value}”.`);
    }
    case 'source_regex':
    case 'source_not_regex': {
      const re = safeRegExp(check.pattern, check.flags);
      if (!re) return fail(check, 'This check has an invalid pattern. Please report it to an administrator.');
      const src = stripComments(ctx.files[check.file] ?? '', check.file);
      const matched = re.test(src);
      if (check.type === 'source_regex') {
        return matched ? pass(check) : fail(check, `Your ${fileLabel(check.file)} code doesn't meet this requirement yet.`);
      }
      return matched ? fail(check, `Your ${fileLabel(check.file)} code still contains something it shouldn't.`) : pass(check);
    }
    case 'html_element': {
      if (!ctx.parseHtml) return skip(check, 'HTML parser unavailable in this environment.');
      const doc = ctx.parseHtml(ctx.files.html ?? '');
      if (!doc) return fail(check, 'Could not parse the HTML.');
      let elements: HtmlElementLike[];
      try {
        elements = Array.from(doc.querySelectorAll(check.selector));
      } catch {
        return fail(check, `Invalid selector “${check.selector}” in check definition.`);
      }
      const min = check.min ?? 1;
      if (elements.length < min) {
        return fail(
          check,
          min === 1
            ? `No element matches “${check.selector}”.`
            : `Found ${elements.length} element(s) matching “${check.selector}”, expected at least ${min}.`,
        );
      }
      if (check.max !== undefined && elements.length > check.max) {
        return fail(check, `Found ${elements.length} element(s) matching “${check.selector}”, expected at most ${check.max}.`);
      }
      const attrRe = check.attribute?.valuePattern ? safeRegExp(check.attribute.valuePattern, 'i') : null;
      const matching = elements.filter((el) => {
        if (check.textIncludes) {
          const text = (el.textContent ?? '').replace(/\s+/g, ' ').toLowerCase();
          if (!text.includes(check.textIncludes.toLowerCase())) return false;
        }
        if (check.attribute) {
          const value = el.getAttribute(check.attribute.name);
          if (value === null) return false;
          if (attrRe && !attrRe.test(value)) return false;
        }
        return true;
      });
      if (matching.length === 0) {
        if (check.textIncludes) return fail(check, `“${check.selector}” should contain the text “${check.textIncludes}”.`);
        if (check.attribute) return fail(check, `“${check.selector}” needs a valid “${check.attribute.name}” attribute.`);
      }
      return pass(check);
    }
    case 'css_declaration': {
      const rules = parseCss(collectCss(ctx.files));
      const target = normalizeSelector(check.selector);
      const prop = check.property.toLowerCase();
      const candidates = rules
        .filter((r) => r.selectors.includes(target))
        .flatMap((r) => r.declarations.filter((d) => d.property === prop));
      if (candidates.length === 0) return fail(check, `No CSS rule for “${check.selector}” sets “${check.property}”.`);
      if (!check.valuePattern) return pass(check);
      const re = safeRegExp(check.valuePattern, 'i');
      if (!re) return fail(check, 'This check has an invalid pattern. Please report it to an administrator.');
      const ok = candidates.some((d) => re.test(d.value));
      return ok
        ? pass(check)
        : fail(check, `“${check.selector}” sets ${check.property}: ${candidates[candidates.length - 1].value} — that value doesn't match the task.`);
    }
    case 'output_equals': {
      if (ctx.stdout === undefined) return skip(check, 'Run your program to check its output.');
      const actual = normalizeOutput(ctx.stdout);
      const expected = normalizeOutput(check.expected);
      if (actual === expected) return pass(check);
      return fail(check, `Expected output:\n${expected}\n\nYour output:\n${actual || '(nothing printed)'}`);
    }
    case 'output_includes': {
      if (ctx.stdout === undefined) return skip(check, 'Run your program to check its output.');
      const out = check.caseSensitive ? ctx.stdout : ctx.stdout.toLowerCase();
      const needle = check.caseSensitive ? check.value : check.value.toLowerCase();
      return out.includes(needle) ? pass(check) : fail(check, `Your output should include “${check.value}”.`);
    }
    case 'dom_runtime': {
      if (ctx.environment === 'server') return skip(check, 'Verified in the browser preview only.');
      const outcome = ctx.runtime?.[check.id];
      if (!outcome) return skip(check, 'Run the preview to evaluate this check.');
      return outcome.pass ? pass(check) : fail(check, outcome.message ?? 'The live preview does not behave as expected yet.');
    }
    default: {
      const unknown = check as BaseCheck;
      return { id: unknown.id, label: unknown.label, status: 'fail', message: 'Unknown check type.' };
    }
  }
}

export function evaluateChecks(checks: readonly CheckSpec[], ctx: EvaluationContext): CheckResult[] {
  return checks.map((check) => {
    try {
      return evaluateCheck(check, ctx);
    } catch (error) {
      return fail(check, `Check failed to run: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
}

export interface CheckSummary {
  passed: boolean;
  passCount: number;
  failCount: number;
  skippedCount: number;
}

/**
 * Client: every check must pass (skipped = not yet evaluated).
 * Server: no failures and at least one server-verified pass; browser-only checks may be skipped.
 */
export function summarizeResults(results: readonly CheckResult[], mode: 'client' | 'server'): CheckSummary {
  const passCount = results.filter((r) => r.status === 'pass').length;
  const failCount = results.filter((r) => r.status === 'fail').length;
  const skippedCount = results.filter((r) => r.status === 'skipped').length;
  const passed = mode === 'client' ? failCount === 0 && skippedCount === 0 && passCount > 0 : failCount === 0 && passCount > 0;
  return { passed, passCount, failCount, skippedCount };
}

function fileLabel(file: FileKey): string {
  return { html: 'HTML', css: 'CSS', js: 'JavaScript', jsx: 'React (JSX)', py: 'Python' }[file];
}

// ─── Validation (admin input + edge-function payloads) ──────────────────────

export function validateCheckSpecs(value: unknown): { ok: true; checks: CheckSpec[] } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  if (!Array.isArray(value)) return { ok: false, errors: ['Checks must be a JSON array.'] };
  const ids = new Set<string>();
  value.forEach((raw, index) => {
    const where = `Check #${index + 1}`;
    if (!raw || typeof raw !== 'object') {
      errors.push(`${where}: must be an object.`);
      return;
    }
    const c = raw as Record<string, unknown>;
    if (typeof c.id !== 'string' || !c.id) errors.push(`${where}: "id" is required.`);
    else if (ids.has(c.id)) errors.push(`${where}: duplicate id "${c.id}".`);
    else ids.add(c.id);
    if (typeof c.label !== 'string' || !c.label) errors.push(`${where}: "label" is required.`);
    if (typeof c.type !== 'string' || !CHECK_TYPES.includes(c.type as CheckType)) {
      errors.push(`${where}: "type" must be one of ${CHECK_TYPES.join(', ')}.`);
      return;
    }
    const needString = (key: string) => {
      if (typeof c[key] !== 'string' || !(c[key] as string).length) errors.push(`${where}: "${key}" must be a non-empty string.`);
    };
    switch (c.type) {
      case 'source_includes':
        needString('value');
        if (!FILE_KEYS.includes(c.file as FileKey)) errors.push(`${where}: "file" must be one of ${FILE_KEYS.join(', ')}.`);
        break;
      case 'source_regex':
      case 'source_not_regex':
        needString('pattern');
        if (!FILE_KEYS.includes(c.file as FileKey)) errors.push(`${where}: "file" must be one of ${FILE_KEYS.join(', ')}.`);
        if (typeof c.pattern === 'string' && !safeRegExp(c.pattern, typeof c.flags === 'string' ? c.flags : undefined)) {
          errors.push(`${where}: "pattern" is not a valid regular expression.`);
        }
        break;
      case 'html_element':
      case 'dom_runtime':
        needString('selector');
        break;
      case 'css_declaration':
        needString('selector');
        needString('property');
        break;
      case 'output_equals':
        if (typeof c.expected !== 'string') errors.push(`${where}: "expected" must be a string.`);
        break;
      case 'output_includes':
        needString('value');
        break;
    }
  });
  return errors.length ? { ok: false, errors } : { ok: true, checks: value as CheckSpec[] };
}

export function validateFiles(value: unknown, maxBytesPerFile = 60_000): { ok: true; files: ExerciseFiles } | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, error: 'files must be an object.' };
  const files: ExerciseFiles = {};
  for (const [key, content] of Object.entries(value as Record<string, unknown>)) {
    if (!FILE_KEYS.includes(key as FileKey)) return { ok: false, error: `Unsupported file "${key}".` };
    if (typeof content !== 'string') return { ok: false, error: `File "${key}" must be text.` };
    if (content.length > maxBytesPerFile) return { ok: false, error: `File "${key}" exceeds ${maxBytesPerFile} characters.` };
    files[key as FileKey] = content;
  }
  return { ok: true, files };
}
