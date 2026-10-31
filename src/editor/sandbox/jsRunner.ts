import { tNow } from '@/i18n';
import { HostFrame } from './hostFrame';
import { newRunId, type ConsoleEntry, type RunResult } from './types';

const HOST_CSP = "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none'; base-uri 'none'";

/** Runs inside the worker. Captures console output, tracks timers, and reports completion. */
const WORKER_SOURCE = `
'use strict';
const send = (m) => postMessage(m);
const fmt = (v, d = 0) => {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  const t = typeof v;
  if (t === 'string') return d ? JSON.stringify(v) : v;
  if (t === 'number' || t === 'boolean' || t === 'bigint') return String(v);
  if (t === 'symbol') return v.toString();
  if (t === 'function') return '[Function ' + (v.name || 'anonymous') + ']';
  if (v instanceof Error) return v.name + ': ' + v.message;
  if (d > 2) return Array.isArray(v) ? '[…]' : '{…}';
  try {
    if (Array.isArray(v)) return '[' + v.slice(0, 100).map((x) => fmt(x, d + 1)).join(', ') + (v.length > 100 ? ', …' : '') + ']';
    if (v instanceof Map) return 'Map(' + v.size + ') {' + [...v].slice(0, 20).map(([k, x]) => fmt(k, d + 1) + ' => ' + fmt(x, d + 1)).join(', ') + '}';
    if (v instanceof Set) return 'Set(' + v.size + ') {' + [...v].slice(0, 20).map((x) => fmt(x, d + 1)).join(', ') + '}';
    if (v instanceof Promise) return 'Promise { <pending> }';
    const keys = Object.keys(v).slice(0, 30);
    return '{ ' + keys.map((k) => k + ': ' + fmt(v[k], d + 1)).join(', ') + (keys.length ? ' ' : '') + '}';
  } catch { return String(v); }
};
let outputBytes = 0;
const out = (level, args) => {
  const text = args.map((a) => fmt(a)).join(' ');
  outputBytes += text.length;
  if (outputBytes > 200000) {
    send({ type: 'console', level: 'warn', text: 'Output limit reached (200 KB). Further output is discarded.' });
    send({ type: 'done', status: 'error', message: 'Output limit exceeded' });
    close();
  }
  send({ type: 'console', level, text });
};
const lineOf = (err) => {
  const m = /<anonymous>:(\\d+):(\\d+)/.exec((err && err.stack) || '');
  return m ? Number(m[1]) - 2 : undefined;
};
const report = (err) => {
  const line = lineOf(err);
  send({ type: 'error', message: (err && err.name ? err.name + ': ' + err.message : String(err)) + (line ? ' (line ' + line + ')' : ''), line });
};
self.console = {
  log: (...a) => out('log', a), info: (...a) => out('info', a), debug: (...a) => out('log', a),
  warn: (...a) => out('warn', a), error: (...a) => out('error', a), table: (...a) => out('log', a),
};
const nativeSetTimeout = setTimeout, nativeClearTimeout = clearTimeout, nativeSetInterval = setInterval, nativeClearInterval = clearInterval;
const timeouts = new Set(), intervals = new Set();
let mainDone = false;
const maybeDone = () => {
  if (!mainDone) return;
  nativeSetTimeout(() => { if (timeouts.size === 0 && intervals.size === 0) send({ type: 'done', status: 'ok' }); }, 0);
};
self.setTimeout = (fn, ms, ...args) => {
  const id = nativeSetTimeout(() => {
    timeouts.delete(id);
    try { if (typeof fn === 'function') fn(...args); } catch (e) { report(e); }
    maybeDone();
  }, ms);
  timeouts.add(id);
  return id;
};
self.clearTimeout = (id) => { timeouts.delete(id); nativeClearTimeout(id); maybeDone(); };
self.setInterval = (fn, ms, ...args) => {
  const id = nativeSetInterval(() => { try { fn(...args); } catch (e) { report(e); } }, ms);
  intervals.add(id);
  return id;
};
self.clearInterval = (id) => { intervals.delete(id); nativeClearInterval(id); maybeDone(); };
const blocked = (name) => () => { throw new Error(name + ' is disabled in the sandbox (no network access).'); };
self.fetch = () => Promise.reject(new TypeError('fetch is disabled in the sandbox (no network access).'));
self.XMLHttpRequest = blocked('XMLHttpRequest');
self.WebSocket = blocked('WebSocket');
self.importScripts = blocked('importScripts');
self.addEventListener('unhandledrejection', (e) => { e.preventDefault(); report(e.reason); });
self.onmessage = async (event) => {
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  let fn;
  try { fn = new AsyncFunction(event.data.code); }
  catch (e) { send({ type: 'error', message: e.name + ': ' + e.message }); send({ type: 'done', status: 'error' }); return; }
  try { await fn(); } catch (e) { report(e); }
  mainDone = true;
  maybeDone();
};
`;

function hostDocument(): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${HOST_CSP}"></head><body><script>
(function () {
  var source = ${JSON.stringify(WORKER_SOURCE)};
  function send(m) { m.__cw = true; window.parent.postMessage(m, '*'); }
  var current = null;
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || d.__cw !== true || d.type !== 'run-js' || e.source !== window.parent) return;
    if (current) { current.terminate(); current = null; }
    var runId = d.runId, worker;
    try {
      var url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
      worker = new Worker(url);
      URL.revokeObjectURL(url);
    } catch (err) {
      send({ runId: runId, type: 'error', message: 'Could not start the JavaScript sandbox: ' + (err && err.message) });
      send({ runId: runId, type: 'done', status: 'unavailable' });
      return;
    }
    current = worker;
    var timer = setTimeout(function () {
      worker.terminate(); current = null;
      send({ runId: runId, type: 'done', status: 'timeout' });
    }, d.timeoutMs);
    worker.onmessage = function (ev) {
      var m = ev.data; m.runId = runId; send(m);
      if (m.type === 'done') { clearTimeout(timer); worker.terminate(); if (current === worker) current = null; }
    };
    worker.onerror = function (ev) {
      ev.preventDefault();
      send({ runId: runId, type: 'error', message: ev.message || 'Worker error' });
    };
    worker.postMessage({ code: d.code });
  });
  send({ runId: 'host', type: 'ready' });
})();
</script></body></html>`;
}

let host: HostFrame | null = null;

export interface RunOptions {
  timeoutMs?: number;
  onConsole?: (entry: Omit<ConsoleEntry, 'id'>) => void;
}

/** Executes plain JavaScript (console exercises) in an isolated worker with a hard timeout. */
export async function runJavaScript(code: string, { timeoutMs = 4000, onConsole }: RunOptions = {}): Promise<RunResult> {
  if (!host) host = new HostFrame('JavaScript sandbox', hostDocument);
  const started = performance.now();
  try {
    await host.start();
  } catch (error) {
    host = null;
    return { status: 'unavailable', stdout: '', durationMs: 0, message: error instanceof Error ? error.message : String(error) };
  }
  const runId = newRunId();
  const stdout: string[] = [];
  return new Promise<RunResult>((resolve) => {
    const unsubscribe = host!.subscribe((msg) => {
      if (msg.runId !== runId) return;
      if (msg.type === 'console') {
        if (msg.level === 'log' || msg.level === 'info') stdout.push(msg.text);
        onConsole?.({ level: msg.level, text: msg.text });
      } else if (msg.type === 'error') {
        onConsole?.({ level: 'error', text: msg.message });
      } else if (msg.type === 'done') {
        unsubscribe();
        const durationMs = Math.round(performance.now() - started);
        if (msg.status === 'timeout') {
          onConsole?.({
            level: 'system',
            text: tNow('console.timeout', { s: timeoutMs / 1000 }),
          });
        }
        resolve({ status: msg.status, stdout: stdout.join('\n'), durationMs, message: msg.message });
      }
    });
    host!.post({ type: 'run-js', runId, code, timeoutMs });
  });
}
