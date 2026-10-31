import { useCallback, useEffect, useRef, useState } from 'react';
import type { ExerciseFiles, FileKey } from '@shared/checks';
import { readJSON, removeKey, writeJSON } from '@/lib/storage';

/** Code files persisted per exercise/playground in localStorage (debounced). */
export function useDraft(key: string, initial: ExerciseFiles) {
  const storageKey = `cw.draft.${key}`;
  const [files, setFiles] = useState<ExerciseFiles>(() => ({ ...initial, ...readJSON<ExerciseFiles>(storageKey, {}) }));
  const initialRef = useRef(initial);
  initialRef.current = initial;
  const dirty = useRef(false);

  // Re-initialise when the key changes (navigating between exercises).
  useEffect(() => {
    setFiles({ ...initialRef.current, ...readJSON<ExerciseFiles>(storageKey, {}) });
    dirty.current = false;
  }, [storageKey]);

  useEffect(() => {
    if (!dirty.current) return;
    const t = window.setTimeout(() => writeJSON(storageKey, files), 400);
    return () => window.clearTimeout(t);
  }, [files, storageKey]);

  const setFile = useCallback((file: FileKey, value: string) => {
    dirty.current = true;
    setFiles((f) => ({ ...f, [file]: value }));
  }, []);

  const replace = useCallback((next: ExerciseFiles) => {
    dirty.current = true;
    setFiles(next);
  }, []);

  const reset = useCallback(() => {
    removeKey(storageKey);
    dirty.current = false;
    setFiles({ ...initialRef.current });
  }, [storageKey]);

  return { files, setFile, replace, reset };
}
