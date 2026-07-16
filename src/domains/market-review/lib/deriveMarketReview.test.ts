import { describe, expect, it } from 'vitest';
import { deriveBreadth, deriveIndustryStats } from './deriveMarketReview';

describe('market review derivations', () => {
  it('derives breadth without treating missing quotes as flat', () => {
    const rows = [{ pct_change: 1, amount: 10 }, { pct_change: -2, amount: 20 }, { pct_change: 0, amount: 5 }, { pct_change: null, amount: 0 }] as never[];
    expect(deriveBreadth(rows)).toMatchObject({ total: 4, traded: 3, advancing: 1, declining: 1, flat: 1, suspended: 1, totalAmount: 35, medianChange: 0 });
  });
  it('aggregates both limit pools by industry', () => {
    const ups = [{ industry_name: '半导体' }, { industry_name: '半导体' }, { industry_name: '医药' }] as never[];
    const downs = [{ industry_name: '半导体' }, { industry_name: '消费' }] as never[];
    expect(deriveIndustryStats(ups, downs)[0]).toEqual({ name: '半导体', up: 2, down: 1, net: 1, total: 3 });
  });
});
