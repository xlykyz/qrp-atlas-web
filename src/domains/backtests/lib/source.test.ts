import { describe, expect, it } from 'vitest';
import { backtestHref, parseBacktestSource } from './source';

describe('parseBacktestSource', () => {
  it('缺失或未知取值一律回落到生产', () => {
    expect(parseBacktestSource('')).toBe('product');
    expect(parseBacktestSource('?tab=overview')).toBe('product');
    expect(parseBacktestSource('?source=other')).toBe('product');
  });

  it('识别研究区数据源', () => {
    expect(parseBacktestSource('?source=research')).toBe('research');
    expect(parseBacktestSource('?tab=trades&source=research')).toBe('research');
  });
});

describe('backtestHref', () => {
  it('生产是默认值，不写入 URL', () => {
    expect(backtestHref('/backtests/runs', 'product')).toBe('/backtests/runs');
    expect(backtestHref('/backtests/runs', 'product', 'source=research')).toBe('/backtests/runs');
  });

  it('研究区写入 source', () => {
    expect(backtestHref('/backtests/runs', 'research')).toBe('/backtests/runs?source=research');
    expect(backtestHref('/backtests/runs/run_1', 'research')).toBe('/backtests/runs/run_1?source=research');
  });

  it('保留既有查询参数', () => {
    expect(backtestHref('/backtests/compare', 'research', 'run=a&run=b')).toBe('/backtests/compare?run=a&run=b&source=research');
    expect(backtestHref('', 'research', 'tab=trades')).toBe('?tab=trades&source=research');
    expect(backtestHref('', 'product', 'tab=trades')).toBe('?tab=trades');
  });
});