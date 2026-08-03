/**
 * Format utilities for System B monitoring components.
 *
 * These helpers convert backend decimal values (episode_return = 0.186) into
 * human-readable display strings (+18.60%).  They complement the generic
 * formatters in @/shared/lib/format and are specific to System B semantics.
 */

import { formatPercent } from '@/shared/lib/format';

/**
 * Format an episode_return decimal as a signed percentage.
 * Backend stores 0.186 → display "+18.60%".
 */
export function formatEpisodeReturn(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  const pct = value * 100;
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

/**
 * Format a drawdown_from_peak decimal as a percentage.
 * Backend stores -0.032 → display "-3.20%".
 */
export function formatDrawdown(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return formatPercent(value * 100, 2);
}

/**
 * Format a peak_return decimal as a signed percentage.
 * Backend stores 0.254 → display "+25.40%".
 */
export function formatPeakReturn(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  const pct = value * 100;
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

/** Format days as a simple integer string. */
export function formatDays(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return String(Math.round(value));
}

/** Format close price with 2 decimal places. */
export function formatClose(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return value.toFixed(2);
}

/** Human-readable label for a pool type. */
export function poolLabel(poolType: string): string {
  switch (poolType) {
    case 'HEIGHT':
      return '高度池';
    case 'CAPACITY':
      return '容量池';
    case 'RECOGNITION':
      return '辨识度池';
    default:
      return poolType;
  }
}

/** Short label for a pool type (for compact display in table cells). */
export function poolShortLabel(poolType: string): string {
  switch (poolType) {
    case 'HEIGHT':
      return '高度';
    case 'CAPACITY':
      return '容量';
    case 'RECOGNITION':
      return '辨识度';
    default:
      return poolType;
  }
}

/** Status badge tone for a pool type. */
export function poolTone(poolType: string): 'special' | 'info' | 'warning' {
  switch (poolType) {
    case 'HEIGHT':
      return 'special';
    case 'CAPACITY':
      return 'info';
    case 'RECOGNITION':
      return 'warning';
    default:
      return 'info';
  }
}

/** Format a datetime string for display (e.g., "2026-07-27T18:30:22" → "07/27 18:30"). */
export function formatCalculationTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}
