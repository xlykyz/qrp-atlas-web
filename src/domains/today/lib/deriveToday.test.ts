import { describe, expect, it } from 'vitest';
import { calendarDayDelta, deriveBreadth, deriveFreshness, deriveIndexSnapshots, shanghaiToday } from './deriveToday';
import type { DailyQuoteDto, IndexDailyDto, StatsResponse } from '../types/models';

const quote = (ticker: string, change: number | null, amount = 100): DailyQuoteDto => ({
  trade_date: '2026-07-16', ticker, name: ticker, open: 1, high: 1, low: 1, close: 1,
  pct_change: change, volume: 1, amount, turnover: null, market_cap: null, float_cap: null,
  is_st: false, is_limit_up: false, is_limit_down: false, created_at: '2026-07-16T16:00:00',
});

describe('today workspace adapters', () => {
  it('uses Shanghai calendar date rather than host timezone', () => {
    expect(shanghaiToday(new Date('2026-07-15T16:30:00Z'))).toBe('2026-07-16');
  });

  it('derives breadth without treating missing changes as flat', () => {
    const value = deriveBreadth([quote('A', 2, 20), quote('B', -1, 30), quote('C', 0, 40), quote('D', null, 10)]);
    expect(value).toMatchObject({ total: 4, traded: 3, advancing: 1, declining: 1, flat: 1, suspended: 1, totalAmount: 100, medianChange: 0 });
    expect(value.advanceShare).toBeCloseTo(1 / 3);
  });

  it('calculates index movement from adjacent available closes', () => {
    const rows: IndexDailyDto[] = [
      { trade_date: '2026-07-16', index_code: 'sh000001', index_name: '上证综指', open: 100, high: 102, low: 99, close: 102, volume: 1, created_at: null },
      { trade_date: '2026-07-15', index_code: 'sh000001', index_name: '上证综指', open: 100, high: 101, low: 99, close: 100, volume: 1, created_at: null },
    ];
    expect(deriveIndexSnapshots(rows)[0]?.changePct).toBeCloseTo(2);
  });

  it('marks coverage relative to the selected research date', () => {
    const stats: StatsResponse = { database: 'quant.db', size_bytes: 1, tables: { daily_market_snapshot: { rows: 10, earliest_date: '2026-01-01', latest_date: '2026-07-16' }, index_daily: { rows: 10, earliest_date: '2026-01-01', latest_date: '2026-07-15' } } };
    const items = deriveFreshness(stats, '2026-07-16');
    expect(items.find((item) => item.key === 'daily_market_snapshot')?.state).toBe('current');
    expect(items.find((item) => item.key === 'index_daily')?.state).toBe('lagging');
    expect(calendarDayDelta('2026-07-15', '2026-07-16')).toBe(1);
  });
});
