import { describe, expect, it } from 'vitest';
import { loopProtect } from './loopProtect';

function runProtected(code: string, limitMs = 50) {
  const guard = (start: number) => {
    if (Date.now() - start > limitMs) throw new RangeError('Potential infinite loop');
  };
  return new Function('__cwLoopGuard', loopProtect(code))(guard);
}

describe('loopProtect', () => {
  it('stops infinite loops of every kind', () => {
    expect(() => runProtected('while (true) {}')).toThrow(/infinite loop/);
    expect(() => runProtected('for (;;) ;')).toThrow(/infinite loop/);
    expect(() => runProtected('do {} while (true)')).toThrow(/infinite loop/);
    expect(() => runProtected('if (true) while (true) x = 1; var x;')).toThrow(/infinite loop/);
  });

  it('keeps normal loops working, including labels and nesting', () => {
    const code = `
      let out = [];
      outer: for (let i = 0; i < 3; i++) {
        for (const j of [0, 1, 2]) {
          if (j === 1) continue outer;
          out.push(i + '' + j);
        }
      }
      let k = 0;
      while (k < 5) k++;
      for (const key in { a: 1, b: 2 }) out.push(key);
      for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) out.push(a * b);
      return out.join(',') + '|' + k;
    `;
    expect(runProtected(code)).toBe('00,10,20,a,b,0,0,0,1|5');
  });

  it('returns unparsable code unchanged', () => {
    expect(loopProtect('while (')).toBe('while (');
  });

  it('leaves loop-free code untouched', () => {
    expect(loopProtect('const a = 1;')).toBe('const a = 1;');
  });
});
