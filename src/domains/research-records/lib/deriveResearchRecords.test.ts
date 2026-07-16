import { describe, expect, it } from 'vitest';
import { filterRecordItems, toRecordItems } from './deriveResearchRecords';

describe('research record adapters', () => {
  it('normalizes phase and trade records into one dated index', () => {
    const phases = [{ trade_date: '2026-07-15', phase: '震荡', notes: '等待确认' }] as never[];
    const trades = [{ trade_id: 't1', ticker: '000001.SZ', entry_date: '2026-07-16', path_type: '突破', notes: null, exit_date: null }] as never[];
    const items = toRecordItems(phases, trades);
    expect(items.map((item) => item.id)).toEqual(['t1', 'phase:2026-07-15']);
    expect(items[0]).toMatchObject({ kind: 'trade', status: '持仓中', objectLabel: '000001.SZ' });
  });

  it('filters by specialized source and text', () => {
    const items = [{ id: '1', kind: 'phase', title: '震荡', objectLabel: '市场日', summary: '缩量' }, { id: '2', kind: 'trade', title: '银行突破', objectLabel: '000001.SZ', summary: null }] as never[];
    expect(filterRecordItems(items, 'phase', '缩量')).toHaveLength(1);
    expect(filterRecordItems(items, 'trade', '缩量')).toHaveLength(0);
  });
});
