import { describe, expect, it } from 'vitest';
import { databaseLabel, deriveContractStatuses, deriveDatasetStatuses } from './deriveOperations';

describe('operations diagnostics', () => {
  it('classifies dataset freshness against the market reference date', () => {
    const stats = { database: '/secret/quant.db', size_bytes: 1, tables: { daily_market_snapshot: { rows: 10, earliest_date: '2026-01-01', latest_date: '2026-07-16' }, index_daily: { rows: 5, earliest_date: '2026-01-01', latest_date: '2026-07-15' }, earnings_forecast_event: { rows: 0, earliest_date: null, latest_date: null } } };
    const result = deriveDatasetStatuses(stats);
    expect(result.referenceDate).toBe('2026-07-16');
    expect(result.rows.find((row) => row.key === 'index_daily')?.state).toBe('lagging');
    expect(result.rows.find((row) => row.key === 'earnings_forecast_event')?.state).toBe('empty');
  });

  it('reports deployed and missing app contracts', () => {
    const statuses = deriveContractStatuses(['/api/health', '/api/daily']);
    expect(statuses.find((item) => item.path === '/api/health')?.deployed).toBe(true);
    expect(statuses.find((item) => item.path === '/api/backtest/tasks')?.deployed).toBe(false);
  });

  it('does not expose an absolute database path', () => {
    expect(databaseLabel('/home/user/data/quant.db')).toBe('quant.db');
    expect(databaseLabel('E:\\data\\quant.db')).toBe('quant.db');
  });
});
