export type ConsoleLevel = 'log' | 'info' | 'warn' | 'error' | 'system';

export interface ConsoleEntry {
  id: number;
  level: ConsoleLevel;
  text: string;
}

export type RunStatus = 'ok' | 'error' | 'timeout' | 'unavailable';

export interface RunResult {
  status: RunStatus;
  /** stdout-equivalent: console.log / print output joined with newlines. */
  stdout: string;
  durationMs: number;
  message?: string;
}

/** Messages posted by sandbox frames. Every message carries `__cw: true` and the run id. */
export type SandboxMessage =
  | { __cw: true; runId: string; type: 'ready' }
  | { __cw: true; runId: string; type: 'console'; level: Exclude<ConsoleLevel, 'system'>; text: string; stream?: 'stdout' | 'stderr' }
  | { __cw: true; runId: string; type: 'error'; message: string; line?: number }
  | { __cw: true; runId: string; type: 'done'; status: RunStatus; message?: string }
  | { __cw: true; runId: string; type: 'runtime-results'; results: Record<string, { pass: boolean; message?: string }> }
  | { __cw: true; runId: string; type: 'status'; status: 'loading' | 'ready' | 'error'; message?: string };

export function isSandboxMessage(data: unknown): data is SandboxMessage {
  return typeof data === 'object' && data !== null && (data as { __cw?: unknown }).__cw === true && typeof (data as { type?: unknown }).type === 'string';
}

let counter = 0;
export function newRunId(): string {
  counter += 1;
  return `${Date.now().toString(36)}-${counter}-${Math.random().toString(36).slice(2, 8)}`;
}
