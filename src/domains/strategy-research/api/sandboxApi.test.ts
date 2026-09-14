import { describe, expect, it } from 'vitest';
import { simulateSandboxRun } from './sandboxApi';

describe('simulateSandboxRun', () => {
  it('generates deterministic simulation points, summary, and logs', () => {
    const res = simulateSandboxRun({
      code: 'print("hello world")',
      start_date: '2025-01-02',
      end_date: '2025-03-31',
      initial_cash: 500000,
      benchmark_id: '000300.SH',
    });

    expect(res.success).toBe(true);
    expect(res.error_message).toBeNull();
    expect(res.equity_points.length).toBeGreaterThan(10);
    expect(res.logs.length).toBeGreaterThan(0);
    expect(res.summary).not.toBeNull();
    expect(res.summary?.final_equity).toBeGreaterThan(0);
    expect(res.summary?.benchmark_id).toBe('000300.SH');
    expect(res.logs[0]).toContain('沙盒引擎');
  });

  it('handles custom capital and preserves bounds', () => {
    const res = simulateSandboxRun({
      code: 'def run(): pass',
      start_date: '2025-05-01',
      end_date: '2025-05-30',
      initial_cash: 2000000,
    });

    expect(res.success).toBe(true);
    expect(res.equity_points[0]?.equity).toBeGreaterThan(0);
    expect(res.summary?.trade_count).toBeGreaterThanOrEqual(0);
  });
});
