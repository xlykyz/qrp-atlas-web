import { describe, expect, it } from 'vitest';
import { buildCompareSearch, parseCompareRunIds } from './compare';
describe('compare URL context', () => { it('accepts repeated and legacy comma-separated parameters without duplicates', () => { expect(parseCompareRunIds('run=a&run=b&run_ids=b,c')).toEqual(['a','b','c']); }); it('round trips selected run ids', () => { const ids=['run_a','run_b']; expect(parseCompareRunIds(buildCompareSearch(ids))).toEqual(ids); }); });
