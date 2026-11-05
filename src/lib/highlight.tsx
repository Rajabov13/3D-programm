import type { ReactNode } from 'react';
export type CodeLanguage = 'html' | 'css' | 'javascript' | 'python' | 'jsx' | 'bash' | 'text';

/**
 * Tiny, dependency-free highlighter for read-only lesson snippets.
 * Produces React nodes (never HTML strings), so it cannot inject markup.
 */
const JS_KEYWORDS =
  'const|let|var|function|return|if|else|for|of|in|while|do|break|continue|new|class|extends|import|from|export|default|async|await|try|catch|finally|throw|typeof|instanceof|true|false|null|undefined|this|switch|case';
const PY_KEYWORDS =
  'def|return|if|elif|else|for|in|while|break|continue|class|import|from|as|try|except|finally|raise|with|lambda|True|False|None|and|or|not|is|pass|yield|self|print|len|range';

interface Rule {
  re: RegExp;
  cls: string;
}

function rulesFor(lang: CodeLanguage): Rule[] {
  switch (lang) {
    case 'javascript':
    case 'jsx':
      return [
        { re: /\/\/[^\n]*|\/\*[\s\S]*?\*\//y, cls: 'text-slate-500 italic' },
        { re: /`(?:\\[\s\S]|[^`\\])*`|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"/y, cls: 'text-orange-300' },
        { re: /<\/?[A-Za-z][\w.]*/y, cls: 'text-sky-300' },
        { re: new RegExp(`\\b(?:${JS_KEYWORDS})\\b`, 'y'), cls: 'text-violet-300' },
        { re: /\b\d+(?:\.\d+)?\b/y, cls: 'text-amber-300' },
        { re: /\b[A-Za-z_$][\w$]*(?=\s*\()/y, cls: 'text-cyan-200' },
      ];
    case 'python':
      return [
        { re: /#[^\n]*/y, cls: 'text-slate-500 italic' },
        { re: /[fr]?("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/y, cls: 'text-orange-300' },
        { re: new RegExp(`\\b(?:${PY_KEYWORDS})\\b`, 'y'), cls: 'text-violet-300' },
        { re: /\b\d+(?:\.\d+)?\b/y, cls: 'text-amber-300' },
        { re: /\b[A-Za-z_]\w*(?=\s*\()/y, cls: 'text-cyan-200' },
      ];
    case 'css':
      return [
        { re: /\/\*[\s\S]*?\*\//y, cls: 'text-slate-500 italic' },
        { re: /@[\w-]+/y, cls: 'text-violet-300' },
        { re: /[\w-]+(?=\s*:[^;{}]*;)/y, cls: 'text-sky-300' },
        { re: /#[0-9a-fA-F]{3,8}\b|\b\d*\.?\d+(?:px|rem|em|%|fr|vw|vh|ch|s|ms)?\b/y, cls: 'text-amber-300' },
        { re: /[.#][\w-]+/y, cls: 'text-cyan-200' },
        { re: /"[^"\n]*"|'[^'\n]*'/y, cls: 'text-orange-300' },
      ];
    case 'html':
      return [
        { re: /<!--[\s\S]*?-->/y, cls: 'text-slate-500 italic' },
        { re: /<!DOCTYPE[^>]*>/iy, cls: 'text-slate-400' },
        { re: /<\/?[a-zA-Z][\w-]*/y, cls: 'text-sky-300' },
        { re: /\/?>/y, cls: 'text-sky-300' },
        { re: /\b[a-zA-Z-:]+(?==)/y, cls: 'text-violet-300' },
        { re: /"[^"]*"|'[^']*'/y, cls: 'text-orange-300' },
      ];
    default:
      return [];
  }
}

export function highlight(code: string, lang: CodeLanguage): ReactNode[] {
  const rules = rulesFor(lang);
  if (rules.length === 0) return [code];
  const out: ReactNode[] = [];
  let plain = '';
  let i = 0;
  let key = 0;
  const flush = () => {
    if (plain) {
      out.push(plain);
      plain = '';
    }
  };
  outer: while (i < code.length) {
    // Only start tokens at word boundaries to avoid matching inside identifiers.
    const prev = code[i - 1];
    const atBoundary = i === 0 || !/[\w$]/.test(prev);
    for (const rule of rules) {
      if (!atBoundary && /^\\b/.test(rule.re.source)) continue;
      rule.re.lastIndex = i;
      const m = rule.re.exec(code);
      if (m && m.index === i && m[0].length > 0) {
        flush();
        out.push(
          <span key={key++} className={rule.cls}>
            {m[0]}
          </span>,
        );
        i += m[0].length;
        continue outer;
      }
    }
    plain += code[i];
    i++;
  }
  flush();
  return out;
}
