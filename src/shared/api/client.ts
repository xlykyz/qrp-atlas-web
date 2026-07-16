import { env } from '@/shared/config/env';
import { ApiError } from './errors';

export interface RequestOptions extends Omit<RequestInit, 'body'> { body?: unknown; timeoutMs?: number }
let accessToken: string | null = null;
export function setApiAccessToken(token: string | null): void { accessToken = token; }

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const text = await response.text(); if (!text) return undefined;
  try { return JSON.parse(text) as unknown; } catch (cause) {
    const input: ConstructorParameters<typeof ApiError>[0] = { kind: 'parse', message: '服务端返回了无法解析的数据', status: response.status };
    if (cause instanceof Error) input.detail = cause.message;
    throw new ApiError(input);
  }
}
function getDetail(body: unknown): string | undefined { if (!body || typeof body !== 'object') return undefined; const detail: unknown = (body as Record<string, unknown>)['detail']; if (typeof detail === 'string') return detail; if (Array.isArray(detail)) return detail.map((item) => typeof item === 'object' && item ? JSON.stringify(item) : String(item)).join('；'); return undefined; }

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body: requestBody, timeoutMs: requestedTimeout, ...requestInit } = options;
  const controller = new AbortController(); const timeoutMs = requestedTimeout ?? env.apiTimeoutMs;
  const timeout = window.setTimeout(() => controller.abort('timeout'), timeoutMs);
  const headers = new Headers(requestInit.headers); headers.set('Accept', 'application/json');
  if (requestBody !== undefined) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  const init: RequestInit = { ...requestInit, headers, signal: requestInit.signal ?? controller.signal };
  if (requestBody !== undefined) init.body = JSON.stringify(requestBody);
  try {
    const response = await fetch(`${env.apiBaseUrl}${path}`, init); const body = await parseResponseBody(response);
    if (!response.ok) { const input: ConstructorParameters<typeof ApiError>[0] = { kind: 'http', status: response.status, message: `请求失败（${response.status}）` }; const detail = getDetail(body); const requestId = response.headers.get('x-request-id'); if (detail) input.detail = detail; if (requestId) input.requestId = requestId; throw new ApiError(input); }
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') { const timedOut = controller.signal.aborted && !requestInit.signal?.aborted; throw new ApiError({ kind: timedOut ? 'timeout' : 'abort', message: timedOut ? `请求超过 ${Math.round(timeoutMs / 1000)} 秒` : '请求已取消', retryable: timedOut }); }
    const input: ConstructorParameters<typeof ApiError>[0] = { kind: 'network', message: '无法连接 QRP Atlas API', retryable: true }; if (error instanceof Error) input.detail = error.message; throw new ApiError(input);
  } finally { window.clearTimeout(timeout); }
}
