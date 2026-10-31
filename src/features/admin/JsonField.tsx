import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { CodeEditor, FallbackEditor } from '@/editor/CodeEditor';

/** JSON editor (Monaco) that reports parse/validation errors and only emits valid values. */
export function JsonField<T>({
  label,
  value,
  onChange,
  validate,
  path,
  height = 320,
  description,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  validate?: (value: unknown) => string[];
  path: string;
  height?: number;
  description?: string;
}) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    // Sync when the value is replaced externally (e.g. after loading).
    setText((current) => {
      try {
        return JSON.stringify(JSON.parse(current)) === JSON.stringify(value) ? current : JSON.stringify(value, null, 2);
      } catch {
        return current;
      }
    });
  }, [value]);

  const update = (next: string) => {
    setText(next);
    try {
      const parsed = JSON.parse(next) as unknown;
      const problems = validate?.(parsed) ?? [];
      setErrors(problems);
      if (problems.length === 0) onChange(parsed as T);
    } catch (e) {
      setErrors([`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`]);
    }
  };

  return (
    <div>
      <p className="mb-1.5 text-[13px] font-medium text-slate-200">{label}</p>
      {description && <p className="mb-2 text-xs text-slate-500">{description}</p>}
      <div className="overflow-hidden rounded-xl border border-white/10" style={{ height }}>
        <ErrorBoundary fallback={() => <FallbackEditor value={text} onChange={update} ariaLabel={label} />}>
          <CodeEditor value={text} onChange={update} language="json" path={path} ariaLabel={label} />
        </ErrorBoundary>
      </div>
      {errors.length > 0 && (
        <ul role="alert" className="mt-2 space-y-1 text-xs text-rose-300">
          {errors.slice(0, 6).map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function validateBlocks(value: unknown): string[] {
  if (!Array.isArray(value)) return ['Blocks must be a JSON array.'];
  const errors: string[] = [];
  value.forEach((b, i) => {
    const where = `Block #${i + 1}`;
    if (!b || typeof b !== 'object') return errors.push(`${where}: must be an object.`);
    const block = b as Record<string, unknown>;
    switch (block.type) {
      case 'text':
        if (typeof block.md !== 'string') errors.push(`${where}: "md" must be a string.`);
        break;
      case 'heading':
        if (typeof block.text !== 'string') errors.push(`${where}: "text" must be a string.`);
        break;
      case 'code':
        if (typeof block.code !== 'string') errors.push(`${where}: "code" must be a string.`);
        if (!['html', 'css', 'javascript', 'python', 'jsx', 'bash', 'text'].includes(String(block.language))) errors.push(`${where}: unsupported "language".`);
        break;
      case 'callout':
        if (typeof block.md !== 'string') errors.push(`${where}: "md" must be a string.`);
        if (!['tip', 'info', 'warning'].includes(String(block.variant))) errors.push(`${where}: "variant" must be tip, info or warning.`);
        break;
      default:
        errors.push(`${where}: "type" must be text, heading, code or callout.`);
    }
    return undefined;
  });
  return errors;
}
