import { tNow } from '@/i18n';
import { config } from '@/services/config';
import { HostFrame } from './hostFrame';
import { newRunId, type ConsoleEntry, type RunResult } from './types';

export type PythonRuntimeState = 'idle' | 'loading' | 'ready' | 'error';

function pyodideBase(): string {
  return new URL(config.pyodideBaseUrl, window.location.href).href;
}

/** Worker: loads Pyodide once, then runs each program in a fresh global namespace. */
const WORKER_SOURCE = `
'use strict';
let py = null;
let loading = null;
const send = (m) => postMessage(m);
async function init(indexURL) {
  importScripts(indexURL + 'pyodide.js');
  py = await loadPyodide({ indexURL });
}
function cleanTraceback(message) {
  const out = [];
  let skip = false;
  for (const line of String(message).split('\\n')) {
    if (/^\\s{2}File "/.test(line)) {
      skip = !/File "(<exec>|main\\.py)"/.test(line);
      if (!skip) out.push(line.replace('<exec>', 'main.py'));
      continue;
    }
    if (skip && /^\\s{4}/.test(line)) continue;
    skip = false;
    out.push(line);
  }
  return out.join('\\n').trim();
}
self.onmessage = async (event) => {
  const d = event.data;
  if (d.type === 'init') {
    try {
      loading = loading || init(d.indexURL);
      await loading;
      send({ type: 'status', status: 'ready' });
    } catch (e) {
      loading = null;
      send({ type: 'status', status: 'error', message: String((e && e.message) || e) });
    }
    return;
  }
  if (d.type === 'run') {
    if (!py) { send({ type: 'error', message: 'Python runtime is not loaded.' }); send({ type: 'done', status: 'unavailable' }); return; }
    let written = 0;
    const emit = (level) => (text) => {
      written += text.length;
      if (written > 200000) return;
      send({ type: 'console', level, text, stream: level === 'error' ? 'stderr' : 'stdout' });
    };
    py.setStdout({ batched: emit('log') });
    py.setStderr({ batched: emit('error') });
    const input = (d.stdin || '').split('\\n');
    let index = 0;
    py.setStdin({ stdin: () => (index < input.length && (d.stdin || '').length ? input[index++] : undefined), autoEOF: true });
    const globals = py.globals.get('dict')();
    try {
      await py.runPythonAsync(d.code, { globals, filename: 'main.py' });
      send({ type: 'done', status: 'ok' });
    } catch (e) {
      let message = cleanTraceback((e && e.message) || e);
      if (/EOFError/.test(message)) message += '\\n(input() reads from the "Program input" box — add a line there for each input() call.)';
      send({ type: 'error', message });
      send({ type: 'done', status: 'error' });
    } finally {
      globals.destroy();
    }
  }
};
`;

function hostDocument(): string {
  // Scope network access to the Pyodide distribution directory only.
  const runtime = pyodideBase();
  const csp = [
    "default-src 'none'",
    `script-src 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: ${runtime}`,
    'worker-src blob:',
    `connect-src ${runtime}`,
    "base-uri 'none'",
  ].join('; ');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${csp}"></head><body><script>
(function () {
  var source = ${JSON.stringify(WORKER_SOURCE)};
  var indexURL = ${JSON.stringify(pyodideBase())};
  function send(m) { m.__cw = true; window.parent.postMessage(m, '*'); }
  var worker = null, state = 'idle', runTimer = null, activeRun = null;
  function spawn() {
    var url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
    worker = new Worker(url);
    URL.revokeObjectURL(url);
    worker.onmessage = function (ev) {
      var m = ev.data;
      if (m.type === 'status') { state = m.status; send({ runId: 'python', type: 'status', status: m.status, message: m.message }); return; }
      m.runId = activeRun; send(m);
      if (m.type === 'done') { clearTimeout(runTimer); activeRun = null; }
    };
    worker.onerror = function (ev) { ev.preventDefault(); state = 'error'; send({ runId: 'python', type: 'status', status: 'error', message: ev.message || 'Python worker crashed' }); };
    state = 'loading';
    send({ runId: 'python', type: 'status', status: 'loading' });
    worker.postMessage({ type: 'init', indexURL: indexURL });
  }
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || d.__cw !== true || e.source !== window.parent) return;
    if (d.type === 'init') { if (!worker || state === 'error') { if (worker) worker.terminate(); spawn(); } else send({ runId: 'python', type: 'status', status: state }); }
    if (d.type === 'run') {
      activeRun = d.runId;
      runTimer = setTimeout(function () {
        worker.terminate(); worker = null; state = 'idle';
        send({ runId: d.runId, type: 'done', status: 'timeout' });
        send({ runId: 'python', type: 'status', status: 'idle' });
        activeRun = null;
      }, d.timeoutMs);
      worker.postMessage({ type: 'run', code: d.code, stdin: d.stdin });
    }
  });
  send({ runId: 'host', type: 'ready' });
})();
</script></body></html>`;
}

type StateListener = (state: PythonRuntimeState, message?: string) => void;

class PyodideRunner {
  private host: HostFrame | null = null;
  state: PythonRuntimeState = 'idle';
  private message?: string;
  private listeners = new Set<StateListener>();
  private readyPromise: Promise<void> | null = null;

  onState(listener: StateListener) {
    this.listeners.add(listener);
    listener(this.state, this.message);
    return () => this.listeners.delete(listener);
  }

  private setState(state: PythonRuntimeState, message?: string) {
    this.state = state;
    this.message = message;
    this.listeners.forEach((l) => l(state, message));
  }

  async ensureReady(): Promise<void> {
    if (this.state === 'ready' && this.readyPromise) return this.readyPromise;
    if (!this.host) {
      this.host = new HostFrame('Python sandbox', hostDocument);
      this.host.subscribe((msg) => {
        if (msg.type === 'status' && msg.runId === 'python') {
          this.setState(msg.status === 'ready' ? 'ready' : msg.status === 'error' ? 'error' : msg.status === 'loading' ? 'loading' : 'idle', msg.message);
        }
      });
    }
    if (this.state === 'loading' && this.readyPromise) return this.readyPromise;
    this.readyPromise = (async () => {
      await this.host!.start();
      await new Promise<void>((resolve, reject) => {
        const timer = window.setTimeout(() => {
          unsubscribe();
          reject(new Error('Loading the Python runtime timed out. Check your connection and try again.'));
        }, 120_000);
        const unsubscribe = this.onState((state, message) => {
          if (state === 'ready') {
            window.clearTimeout(timer);
            queueMicrotask(() => unsubscribe());
            resolve();
          } else if (state === 'error') {
            window.clearTimeout(timer);
            queueMicrotask(() => unsubscribe());
            reject(new Error(`The Python runtime could not be loaded from ${config.pyodideBaseUrl}: ${message ?? 'unknown error'}`));
          }
        });
        this.host!.post({ type: 'init' });
      });
    })();
    this.readyPromise.catch(() => {
      this.readyPromise = null;
    });
    return this.readyPromise;
  }

  async run(code: string, stdin: string, timeoutMs: number, onConsole?: (e: Omit<ConsoleEntry, 'id'>) => void): Promise<RunResult> {
    const started = performance.now();
    try {
      await this.ensureReady();
    } catch (error) {
      return { status: 'unavailable', stdout: '', durationMs: 0, message: error instanceof Error ? error.message : String(error) };
    }
    const runId = newRunId();
    const stdout: string[] = [];
    return new Promise((resolve) => {
      const unsubscribe = this.host!.subscribe((msg) => {
        if (msg.runId !== runId) return;
        if (msg.type === 'console') {
          if (msg.stream !== 'stderr') stdout.push(msg.text);
          onConsole?.({ level: msg.level, text: msg.text });
        } else if (msg.type === 'error') onConsole?.({ level: 'error', text: msg.message });
        else if (msg.type === 'done') {
          unsubscribe();
          if (msg.status === 'timeout') {
            this.readyPromise = null;
            onConsole?.({ level: 'system', text: `${tNow('console.timeout', { s: timeoutMs / 1000 })} ${tNow('console.pyRestart')}` });
          }
          resolve({ status: msg.status, stdout: stdout.join('\n'), durationMs: Math.round(performance.now() - started) });
        }
      });
      this.host!.post({ type: 'run', runId, code, stdin, timeoutMs });
    });
  }
}

export const pyodideRunner = new PyodideRunner();

export async function runPython(code: string, { stdin = '', timeoutMs = 10_000, onConsole }: { stdin?: string; timeoutMs?: number; onConsole?: (e: Omit<ConsoleEntry, 'id'>) => void } = {}): Promise<RunResult> {
  if (config.pythonRunner === 'disabled') {
    return { status: 'unavailable', stdout: '', durationMs: 0, message: 'Python execution is disabled on this deployment (VITE_PYTHON_RUNNER=disabled).' };
  }
  return pyodideRunner.run(code, stdin, timeoutMs, onConsole);
}
