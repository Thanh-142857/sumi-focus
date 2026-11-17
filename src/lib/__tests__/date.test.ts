import { formatClock, dateKey, daysAgo } from '../date';

describe('date utils', () => {
  describe('formatClock', () => {
    const table = [
      { seconds: 0, expected: '00:00' },
      { seconds: 5, expected: '00:05' },
      { seconds: 59, expected: '00:59' },
      { seconds: 60, expected: '01:00' },
      { seconds: 65, expected: '01:05' },
      { seconds: 599, expected: '09:59' },
      { seconds: 600, expected: '10:00' },
      { seconds: 1500, expected: '25:00' },
      { seconds: 3600, expected: '60:00' },
      { seconds: -10, expected: '00:00' },
    ];

    table.forEach(({ seconds, expected }) => {
      it(`formats ${seconds}s as ${expected}`, () => {
        expect(formatClock(seconds)).toBe(expected);
      });
    });
  });

  describe('dateKey', () => {
    it('pads single-digit months and days correctly', () => {
      const d = new Date(2026, 4, 9, 10, 0, 0); // May 9, 2026
      expect(dateKey(d)).toBe('2026-05-09');
    });

    it('handles two-digit months and days', () => {
      const d = new Date(2026, 10, 16, 12, 0, 0); // Nov 16, 2026
      expect(dateKey(d)).toBe('2026-11-16');
    });

    it('returns local date for current time when no arg is provided', () => {
      const now = new Date();
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      expect(dateKey()).toBe(expected);
    });

    it('handles numeric timestamps and ISO strings', () => {
      const d = new Date(2026, 0, 5, 8, 30, 0); // Jan 5, 2026
      expect(dateKey(d.getTime())).toBe('2026-01-05');
      expect(dateKey(d.toISOString())).toBe(dateKey(d));
    });
  });

  describe('daysAgo across month boundary', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      // Set system time to 2026-11-16 12:00:00 local time
      jest.setSystemTime(new Date(2026, 10, 16, 12, 0, 0));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('computes same-month days', () => {
      expect(daysAgo(0)).toBe('2026-11-16');
      expect(daysAgo(1)).toBe('2026-11-15');
      expect(daysAgo(15)).toBe('2026-11-01');
    });

    it('correctly crosses into previous month (October)', () => {
      expect(daysAgo(16)).toBe('2026-10-31');
      expect(daysAgo(17)).toBe('2026-10-30');
      expect(daysAgo(47)).toBe('2026-09-30');
    });
  });
});
