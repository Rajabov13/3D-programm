import { useEffect, useRef } from 'react';

export interface ShortcutOptions {
  /** Require Ctrl (Windows/Linux) or Cmd (macOS). */
  mod?: boolean;
  shift?: boolean;
  alt?: boolean;
  enabled?: boolean;
  /** Fire even when focus is inside inputs/editors. */
  allowInInputs?: boolean;
}

export function useKeyboardShortcut(key: string, handler: (event: KeyboardEvent) => void, options: ShortcutOptions = {}) {
  const ref = useRef(handler);
  ref.current = handler;
  const { mod = false, shift = false, alt = false, enabled = true, allowInInputs = false } = options;
  useEffect(() => {
    if (!enabled) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key.toLowerCase()) return;
      const modPressed = event.ctrlKey || event.metaKey;
      if (mod !== modPressed || shift !== event.shiftKey || alt !== event.altKey) return;
      if (!allowInInputs) {
        const target = event.target as HTMLElement | null;
        if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
      }
      event.preventDefault();
      ref.current(event);
    };
    window.addEventListener('keydown', onKey, { capture: true });
    return () => window.removeEventListener('keydown', onKey, { capture: true });
  }, [key, mod, shift, alt, enabled, allowInInputs]);
}
