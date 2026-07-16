import { describe, expect, it } from 'vitest';
import { deriveStockSnapshot, rangeStart, toCandles } from './stockResearch';

describe('stock research transforms', () => {
  it('derives a range snapshot from sorted valid closes', () => {
    const rows = [
      { trade_date: '2026-01-03', close: 12, high: 13, low: 11, amount: 30 },
      { trade_date: '2026-01-01', close: 10, high: 11, low: 9, amount: 10 },
      { trade_date: '2026-01-02', close: null, high: null, low: null, amount: 0 },
    ] as never[];
    const snapshot = deriveStockSnapshot(rows);
    expect(snapshot).toMatchObject({ rangeHigh: 13, rangeLow: 9, totalAmount: 40 });
    expect(snapshot.rangeReturn).toBeCloseTo(20);
  });

  it('converts only complete OHLC rows into ascending candles', () => {
    const rows = [
      { trade_date: '2026-01-02', open: 2, high: 3, low: 1, close: 2.5 },
      { trade_date: '2026-01-01', open: 1, high: 2, low: null, close: 1.5 },
    ] as never[];
    expect(toCandles(rows)).toEqual([{ time: '2026-01-02', open: 2, high: 3, low: 1, close: 2.5 }]);
  });

  it('uses calendar ranges without assuming trading days', () => {
    expect(rangeStart('2026-07-16', '6m')).toBe('2026-01-16');
  });
});
