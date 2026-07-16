import { describe, expect, it } from 'vitest';
import { isTaskActive, normalizeTaskStatus } from './status';
describe('task status', () => { it('normalizes backend success vocabulary', () => { expect(normalizeTaskStatus('succeeded')).toEqual({ label: '已完成', tone: 'success' }); }); it('polls only active states', () => { expect(isTaskActive('running')).toBe(true); expect(isTaskActive('failed')).toBe(false); }); });
