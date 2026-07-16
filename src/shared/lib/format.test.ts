import { describe, expect, it } from 'vitest';
import { formatBytes, formatNumber, formatPercent, signedTone } from './format';

describe('formatters', () => {
  it('renders missing values consistently', () => {
    expect(formatPercent(null)).toBe('—');
    expect(formatNumber(undefined)).toBe('—');
    expect(formatBytes(null)).toBe('—');
  });

  it('keeps A-share semantic tone', () => {
    expect(signedTone(1)).toBe('up');
    expect(signedTone(-1)).toBe('down');
    expect(signedTone(0)).toBe('flat');
  });

  it('formats database sizes with binary units', () => {
    expect(formatBytes(5_015_351_296)).toBe('4.67 GB');
  });
});
