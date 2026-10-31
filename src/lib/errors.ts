export type AppErrorCode = 'NOT_FOUND' | 'LOCKED' | 'REQUIREMENTS_NOT_MET' | 'VALIDATION' | 'UNKNOWN';

export class AppError extends Error {
  readonly code: AppErrorCode;
  constructor(code: AppErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'AppError';
  }
}

export function errorMessage(error: unknown): string {
  if (!error) return 'Unknown error';
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error && 'message' in error) return String((error as { message: unknown }).message);
  return String(error);
}
