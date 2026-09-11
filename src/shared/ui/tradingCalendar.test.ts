import { describe, expect, it } from 'vitest';
import { buildMonthGrid, monthOf, shiftMonth } from './tradingCalendar';

describe('buildMonthGrid', () => {
  it('builds a 42-cell grid starting on Sunday for 2026-09', () => {
    const cells = buildMonthGrid('2026-09');
    expect(cells).toHaveLength(42);
    expect(cells[0]?.date).toBe('2026-08-30'); // 周日
    expect(cells[2]?.date).toBe('2026-09-01'); // 9 月 1 日是周二，落在第三列
    expect(cells[2]?.inMonth).toBe(true);
    expect(cells.at(-1)?.date).toBe('2026-10-10');
  });

  it('marks out-of-month cells and keeps every cell in week alignment', () => {
    const cells = buildMonthGrid('2026-09');
    const outside = cells.filter((cell) => !cell.inMonth);
    expect(outside.map((cell) => cell.date)).toEqual([
      '2026-08-30',
      '2026-08-31',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
    ]);
  });

  it('handles a month whose first day is Sunday', () => {
    // 2026-11-01 是周日
    const cells = buildMonthGrid('2026-11');
    expect(cells[0]?.date).toBe('2026-11-01');
    expect(cells[0]?.inMonth).toBe(true);
  });
});

describe('shiftMonth', () => {
  it('shifts within the same year', () => {
    expect(shiftMonth('2026-09', 1)).toBe('2026-10');
    expect(shiftMonth('2026-09', -1)).toBe('2026-08');
  });

  it('shifts across year boundaries', () => {
    expect(shiftMonth('2025-12', 1)).toBe('2026-01');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2026-01', 11)).toBe('2026-12');
  });
});

describe('monthOf', () => {
  it('extracts the YYYY-MM prefix', () => {
    expect(monthOf('2026-09-11')).toBe('2026-09');
  });
});
