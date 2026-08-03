import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatCalculationTime } from './systemBFormat';

describe('formatCalculationTime', () => {
  afterEach(() => vi.unstubAllEnvs());

  it.each(['Asia/Tokyo', 'Asia/Shanghai'])('is independent of a %s system timezone', (systemTimezone) => {
    vi.stubEnv('TZ', systemTimezone);
    expect(formatCalculationTime('2026-08-03T10:00:00Z')).toBe('08/03 18:00');
  });

  it('parses an explicit Z timestamp in Asia/Shanghai', () => {
    expect(formatCalculationTime('2026-08-03T10:00:00Z')).toBe('08/03 18:00');
  });

  it('parses an explicit +00:00 timestamp in Asia/Shanghai', () => {
    expect(formatCalculationTime('2026-08-03T10:00:00+00:00')).toBe('08/03 18:00');
  });

  it('treats an old offset-less datetime as UTC naive', () => {
    expect(formatCalculationTime('2026-08-03T10:00:00')).toBe('08/03 18:00');
  });

  it('does not timezone-convert a date-only field', () => {
    expect(formatCalculationTime('2026-08-03')).toBe('2026-08-03');
  });

  it('returns invalid input unchanged', () => {
    expect(formatCalculationTime('not-a-datetime')).toBe('not-a-datetime');
  });
});
