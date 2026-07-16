import { describe, expect, it } from 'vitest';
import { formatNumber, formatPercent, signedTone } from './format';
describe('formatters', () => { it('renders missing values consistently', () => { expect(formatPercent(null)).toBe('—'); expect(formatNumber(undefined)).toBe('—'); }); it('keeps A-share semantic tone', () => { expect(signedTone(1)).toBe('up'); expect(signedTone(-1)).toBe('down'); expect(signedTone(0)).toBe('flat'); }); });
