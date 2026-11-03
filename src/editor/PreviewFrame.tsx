import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { tNow } from '@/i18n';
import type { CheckSpec, RuntimeCheckOutcome } from '@shared/checks';
import { isSandboxMessage, type ConsoleEntry } from './sandbox/types';

export interface PreviewHandle {
  whenReady(runId: string, timeoutMs?: number): Promise<boolean>;
  runChecks(runId: string, checks: CheckSpec[], timeoutMs?: number): Promise<Record<string, RuntimeCheckOutcome>>;
}

/**
 * Live preview. sandbox="allow-scripts" without allow-same-origin gives the
 * document an opaque origin: it cannot read the app's cookies, storage or DOM,
 * and a strict CSP inside the document blocks all network access.
 */
export const PreviewFrame = forwardRef<PreviewHandle, { doc: string | null; runId: string | null; onConsole: (e: Omit<ConsoleEntry, 'id'>) => void; title: string }>(
  function PreviewFrame({ doc, runId, onConsole, title }, ref) {
    const iframe = useRef<HTMLIFrameElement>(null);
    const readyRuns = useRef(new Set<string>());
    const readyWaiters = useRef(new Map<string, () => void>());
    const resultWaiters = useRef(new Map<string, (r: Record<string, RuntimeCheckOutcome>) => void>());
    const consoleRef = useRef(onConsole);
    consoleRef.current = onConsole;
    const currentRun = useRef(runId);
    currentRun.current = runId;

    useEffect(() => {
      const onMessage = (event: MessageEvent) => {
        if (event.source !== iframe.current?.contentWindow || !isSandboxMessage(event.data)) return;
        const msg = event.data;
        if (msg.runId !== currentRun.current) return;
        switch (msg.type) {
          case 'ready':
            readyRuns.current.add(msg.runId);
            readyWaiters.current.get(msg.runId)?.();
            break;
          case 'console':
            consoleRef.current({ level: msg.level, text: msg.text });
            break;
          case 'error':
            consoleRef.current({ level: 'error', text: msg.line ? `${msg.message} (line ${msg.line})` : msg.message });
            break;
          case 'runtime-results':
            resultWaiters.current.get(msg.runId)?.(msg.results);
            break;
        }
      };
      window.addEventListener('message', onMessage);
      return () => window.removeEventListener('message', onMessage);
    }, []);

    useImperativeHandle(ref, () => ({
      whenReady(id, timeoutMs = 6000) {
        if (readyRuns.current.has(id)) return Promise.resolve(true);
        return new Promise((resolve) => {
          const timer = window.setTimeout(() => {
            readyWaiters.current.delete(id);
            resolve(false);
          }, timeoutMs);
          readyWaiters.current.set(id, () => {
            window.clearTimeout(timer);
            readyWaiters.current.delete(id);
            resolve(true);
          });
        });
      },
      runChecks(id, checks, timeoutMs = 6000) {
        return new Promise((resolve) => {
          const timer = window.setTimeout(() => {
            resultWaiters.current.delete(id);
            resolve(
              Object.fromEntries(checks.map((c) => [c.id, { pass: false, message: tNow('console.previewStuck') }])),
            );
          }, timeoutMs);
          resultWaiters.current.set(id, (results) => {
            window.clearTimeout(timer);
            resultWaiters.current.delete(id);
            resolve(results);
          });
          iframe.current?.contentWindow?.postMessage({ __cw: true, type: 'run-checks', checks }, '*');
        });
      },
    }));

    return (
      <iframe
        ref={iframe}
        title={title}
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
        allow=""
        srcDoc={doc ?? `<!DOCTYPE html><html><body style="margin:0;display:grid;place-items:center;height:100vh;font:15px system-ui;color:#64748b;background:#fff">${tNow('editor.emptyPreviewDoc')}</body></html>`}
        className="h-full w-full border-0 bg-[#fff]"
      />
    );
  },
);
