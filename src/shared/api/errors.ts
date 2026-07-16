export type ApiErrorKind = 'network' | 'timeout' | 'abort' | 'http' | 'parse' | 'contract';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly detail?: string;
  readonly requestId?: string;
  readonly retryable: boolean;

  constructor(input: { kind: ApiErrorKind; message: string; status?: number; detail?: string; requestId?: string; retryable?: boolean }) {
    super(input.message);
    this.name = 'ApiError'; this.kind = input.kind;
    if (input.status !== undefined) this.status = input.status;
    if (input.detail !== undefined) this.detail = input.detail;
    if (input.requestId !== undefined) this.requestId = input.requestId;
    this.retryable = input.retryable ?? (input.kind === 'network' || input.kind === 'timeout' || (input.status !== undefined && input.status >= 500));
  }
}
export function getErrorMessage(error: unknown): string { if (error instanceof ApiError) return error.detail || error.message; if (error instanceof Error) return error.message; return '发生未知错误'; }
