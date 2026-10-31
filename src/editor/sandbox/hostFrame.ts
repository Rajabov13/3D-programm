import { isSandboxMessage, type SandboxMessage } from './types';

/**
 * A hidden, sandboxed (opaque-origin) iframe that hosts Web Workers for code
 * execution. The iframe itself never runs learner code; it supervises workers and
 * terminates them on timeout, so even a tight infinite loop cannot block the app.
 */
export class HostFrame {
  private iframe: HTMLIFrameElement | null = null;
  private ready: Promise<void> | null = null;
  private listeners = new Set<(msg: SandboxMessage) => void>();
  private readonly onMessage = (event: MessageEvent) => {
    if (!this.iframe || event.source !== this.iframe.contentWindow || !isSandboxMessage(event.data)) return;
    this.listeners.forEach((l) => l(event.data as SandboxMessage));
  };

  constructor(
    private readonly title: string,
    private readonly buildDocument: () => string,
  ) {}

  start(): Promise<void> {
    if (this.ready) return this.ready;
    this.ready = new Promise<void>((resolve, reject) => {
      const iframe = document.createElement('iframe');
      iframe.setAttribute('sandbox', 'allow-scripts');
      iframe.setAttribute('aria-hidden', 'true');
      iframe.setAttribute('tabindex', '-1');
      iframe.setAttribute('referrerpolicy', 'no-referrer');
      iframe.title = this.title;
      iframe.style.cssText = 'position:fixed;width:1px;height:1px;left:-10px;top:-10px;border:0;opacity:0;pointer-events:none;';
      const timer = window.setTimeout(() => reject(new Error('The code sandbox did not start.')), 10_000);
      const unsubscribe = this.subscribe((msg) => {
        if (msg.type === 'ready') {
          window.clearTimeout(timer);
          unsubscribe();
          resolve();
        }
      });
      window.addEventListener('message', this.onMessage);
      iframe.srcdoc = this.buildDocument();
      document.body.appendChild(iframe);
      this.iframe = iframe;
    });
    this.ready.catch(() => this.dispose());
    return this.ready;
  }

  subscribe(listener: (msg: SandboxMessage) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  post(message: Record<string, unknown>) {
    // The frame has an opaque origin, so '*' is the only possible target; the payload
    // (the learner's own code) is not sensitive.
    this.iframe?.contentWindow?.postMessage({ __cw: true, ...message }, '*');
  }

  dispose() {
    window.removeEventListener('message', this.onMessage);
    this.iframe?.remove();
    this.iframe = null;
    this.ready = null;
  }
}
