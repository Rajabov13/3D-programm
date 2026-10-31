import { parse, type Node } from 'acorn';
import { ancestor } from 'acorn-walk';

interface Insert {
  pos: number;
  text: string;
  kind: 'open' | 'close';
  depth: number;
}

type LoopNode = Node & { body: Node };

/**
 * Instruments every loop with a time guard so runaway loops in the live preview
 * throw instead of freezing the page:
 *
 *   while (x) y();   →   {let __cwLoop0=Date.now(); while (x) {__cwLoopGuard(__cwLoop0); y();}}
 *
 * `__cwLoopGuard` is defined by the sandbox bridge. If the code doesn't parse, it is
 * returned unchanged so the browser reports the syntax error with accurate positions.
 */
export function loopProtect(code: string): string {
  let ast: Node;
  try {
    ast = parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'script',
      allowAwaitOutsideFunction: true,
      allowReturnOutsideFunction: true,
      allowHashBang: true,
    });
  } catch {
    return code;
  }
  const inserts: Insert[] = [];
  let id = 0;
  const visit = (node: Node, _state: unknown, ancestors: Node[]) => {
    const loop = node as LoopNode;
    const name = `__cwLoop${id++}`;
    let target: Node = loop;
    let index = ancestors.length - 2;
    while (index >= 0 && ancestors[index].type === 'LabeledStatement') {
      target = ancestors[index];
      index--;
    }
    const depth = ancestors.length;
    inserts.push({ pos: target.start, text: `{let ${name}=Date.now();`, kind: 'open', depth });
    inserts.push({ pos: target.end, text: '}', kind: 'close', depth });
    const body = loop.body;
    if (body.type === 'BlockStatement') {
      inserts.push({ pos: body.start + 1, text: `__cwLoopGuard(${name});`, kind: 'open', depth: depth + 1 });
    } else {
      inserts.push({ pos: body.start, text: `{__cwLoopGuard(${name});`, kind: 'open', depth: depth + 1 });
      inserts.push({ pos: body.end, text: '}', kind: 'close', depth: depth + 1 });
    }
  };
  ancestor(ast, {
    ForStatement: visit,
    ForInStatement: visit,
    ForOfStatement: visit,
    WhileStatement: visit,
    DoWhileStatement: visit,
  });
  if (inserts.length === 0) return code;
  // Same position: closings before openings; closings inner→outer; openings outer→inner.
  inserts.sort((a, b) => {
    if (a.pos !== b.pos) return a.pos - b.pos;
    if (a.kind !== b.kind) return a.kind === 'close' ? -1 : 1;
    return a.kind === 'close' ? b.depth - a.depth : a.depth - b.depth;
  });
  let out = '';
  let last = 0;
  for (const ins of inserts) {
    out += code.slice(last, ins.pos) + ins.text;
    last = ins.pos;
  }
  return out + code.slice(last);
}

/** Applies loop protection to inline <script> blocks inside learner HTML. */
export function protectInlineScripts(html: string): string {
  return html.replace(/(<script\b(?![^>]*\bsrc\s*=)[^>]*>)([\s\S]*?)(<\/script>)/gi, (_m, open: string, body: string, close: string) => {
    if (/type\s*=\s*["']?(?!text\/javascript|module|application\/javascript)[^"'\s>]+/i.test(open)) return open + body + close;
    return open + loopProtect(body) + close;
  });
}
