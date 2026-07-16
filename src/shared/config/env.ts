const defaultBaseUrl = 'http://127.0.0.1:8001';

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? defaultBaseUrl).replace(/\/$/, ''),
  apiTimeoutMs: parsePositiveInt(import.meta.env.VITE_API_TIMEOUT_MS, 120_000),
  enableQueryDevtools: import.meta.env.VITE_ENABLE_QUERY_DEVTOOLS === 'true',
} as const;
