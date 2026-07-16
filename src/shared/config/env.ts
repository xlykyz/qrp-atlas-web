function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function requireApiBaseUrl(value: string | undefined): string {
  const normalized = value?.trim().replace(/\/$/, '');
  if (!normalized) throw new Error('缺少 VITE_API_BASE_URL。请复制 .env.example 为 .env.local，并显式配置 QRP Atlas API 地址。');
  try { return new URL(normalized).toString().replace(/\/$/, ''); }
  catch { throw new Error(`VITE_API_BASE_URL 不是有效绝对 URL：${normalized}`); }
}

export const env = {
  apiBaseUrl: requireApiBaseUrl(import.meta.env.VITE_API_BASE_URL),
  apiTimeoutMs: parsePositiveInt(import.meta.env.VITE_API_TIMEOUT_MS, 120_000),
  enableQueryDevtools: import.meta.env.VITE_ENABLE_QUERY_DEVTOOLS === 'true',
} as const;
