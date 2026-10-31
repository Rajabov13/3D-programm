import { describe, expect, it } from 'vitest';
import { bridgeScript } from './bridge';

describe('bridgeScript', () => {
  const source = bridgeScript('run-1');

  it('is valid JavaScript', () => {
    expect(() => new Function(source)).not.toThrow();
  });

  it('extracts script-relative line numbers from stack traces', () => {
    const match = /var m = stack && (\/.*\/)\.exec\(stack\);/.exec(source);
    expect(match).not.toBeNull();
    const re = new Function(`return ${match![1]}`)() as RegExp;
    expect(re.exec('RangeError: x\n    at __cwLoopGuard (about:srcdoc:40:9)\n    at script.js:3:15')?.[1]).toBe('3');
    expect(re.exec('ReferenceError: missing\n    at App (App.jsx:12:40)')?.[1]).toBe('12');
  });

  it('embeds the run id safely', () => {
    expect(bridgeScript('a"b</script>')).toContain(JSON.stringify('a"b</script>'));
  });
});
