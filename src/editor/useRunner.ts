import { useCallback, useEffect, useRef, useState } from 'react';
import type { CheckSpec, ExerciseFiles, ExerciseMode, RuntimeCheckOutcome } from '@shared/checks';
import type { PreviewHandle } from './PreviewFrame';
import { buildReactDocument, buildWebDocument, TransformError } from './sandbox/documents';
import { runJavaScript } from './sandbox/jsRunner';
import { pyodideRunner, runPython, type PythonRuntimeState } from './sandbox/pythonRunner';
import { newRunId, type ConsoleEntry, type RunStatus } from './sandbox/types';
import { tNow } from '@/i18n';
import { config } from '@/services/config';

export interface RunOutcome {
  status: RunStatus;
  /** Program output for console/Python modes (undefined for previews). */
  stdout?: string;
  /** dom_runtime check results evaluated inside the preview sandbox. */
  runtime?: Record<string, RuntimeCheckOutcome>;
  message?: string;
}

export interface RunOptions {
  runtimeChecks?: CheckSpec[];
  stdin?: string;
  clear?: boolean;
}

export function usePythonRuntimeState(enabled: boolean): { state: PythonRuntimeState; message?: string } {
  const [state, setState] = useState<{ state: PythonRuntimeState; message?: string }>({ state: pyodideRunner.state });
  useEffect(() => {
    if (!enabled || config.pythonRunner !== 'pyodide') return;
    const unsubscribe = pyodideRunner.onState((s, message) => setState({ state: s, message }));
    return () => {
      unsubscribe();
    };
  }, [enabled]);
  return state;
}

/** Runs learner code in the right sandbox for the exercise mode and collects output. */
export function useRunner(mode: ExerciseMode) {
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [preview, setPreview] = useState<{ doc: string; runId: string } | null>(null);
  const [lastRun, setLastRun] = useState<{ status: RunStatus; durationMs?: number } | null>(null);
  const previewRef = useRef<PreviewHandle>(null);
  const idRef = useRef(0);

  const push = useCallback((entry: Omit<ConsoleEntry, 'id'>) => {
    setEntries((list) => [...list.slice(-499), { ...entry, id: ++idRef.current }]);
  }, []);
  const clear = useCallback(() => setEntries([]), []);

  // Switching modes (playground) resets output.
  useEffect(() => {
    setPreview(null);
    setEntries([]);
    setLastRun(null);
  }, [mode]);

  const run = useCallback(
    async (files: ExerciseFiles, options: RunOptions = {}): Promise<RunOutcome> => {
      if (options.clear !== false) setEntries([]);
      setRunning(true);
      const started = performance.now();
      const finish = (outcome: RunOutcome): RunOutcome => {
        setLastRun({ status: outcome.status, durationMs: Math.round(performance.now() - started) });
        return outcome;
      };
      try {
        if (mode === 'web' || mode === 'react') {
          const runId = newRunId();
          let doc: string;
          if (mode === 'web') doc = buildWebDocument({ html: files.html, css: files.css, js: files.js, runId });
          else {
            try {
              doc = await buildReactDocument({ jsx: files.jsx, css: files.css, runId });
            } catch (error) {
              push({
                level: 'error',
                text: error instanceof TransformError ? tNow('console.syntax', { msg: error.message }) : tNow('console.reactFail', { msg: String(error) }),
              });
              return finish({ status: 'error' });
            }
          }
          setPreview({ doc, runId });
          const handle = await new Promise<PreviewHandle | null>((resolve) => requestAnimationFrame(() => resolve(previewRef.current)));
          if (!handle) return finish({ status: 'unavailable', message: tNow('editor.s.unavailable') });
          const ready = await handle.whenReady(runId);
          if (!ready) {
            push({ level: 'system', text: tNow('console.previewSlow') });
            const runtime = options.runtimeChecks?.length
              ? Object.fromEntries(options.runtimeChecks.map((c) => [c.id, { pass: false, message: tNow('console.previewSlow') }]))
              : undefined;
            return finish({ status: 'timeout', runtime });
          }
          const runtime = options.runtimeChecks?.length ? await handle.runChecks(runId, options.runtimeChecks) : undefined;
          return finish({ status: 'ok', runtime });
        }
        if (mode === 'console') {
          const result = await runJavaScript(files.js ?? '', { onConsole: push });
          if (result.status === 'unavailable') push({ level: 'error', text: tNow('console.unavailable', { msg: result.message ?? 'JavaScript' }) });
          return finish({ status: result.status, stdout: result.stdout, message: result.message });
        }
        const result = await runPython(files.py ?? '', { stdin: options.stdin, onConsole: push });
        if (result.status === 'unavailable') push({ level: 'error', text: tNow('console.unavailable', { msg: result.message ?? 'Python' }) });
        return finish({ status: result.status, stdout: result.stdout, message: result.message });
      } finally {
        setRunning(false);
      }
    },
    [mode, push],
  );

  return { entries, push, clear, run, running, preview, previewRef, lastRun };
}

export type Runner = ReturnType<typeof useRunner>;
