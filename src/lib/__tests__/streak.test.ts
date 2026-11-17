import { computeStreak } from '../streak';
import { daysAgo } from '../date';

describe('computeStreak', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 10, 16, 12, 0, 0)); // Nov 16, 2026
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns 0 for empty array', () => {
    expect(computeStreak([])).toBe(0);
  });

  it('returns 1 for today only', () => {
    expect(computeStreak([daysAgo(0)])).toBe(1);
  });

  it('returns 1 for yesterday only (streak preserved)', () => {
    expect(computeStreak([daysAgo(1)])).toBe(1);
  });

  it('computes consecutive streak when done today', () => {
    const dates = [daysAgo(0), daysAgo(1), daysAgo(2), daysAgo(3)];
    expect(computeStreak(dates)).toBe(4);
  });

  it('computes consecutive streak when not yet done today', () => {
    const dates = [daysAgo(1), daysAgo(2), daysAgo(3)];
    expect(computeStreak(dates)).toBe(3);
  });

  it('breaks streak on gap', () => {
    // Done today, but missed yesterday
    const dates = [daysAgo(0), daysAgo(2), daysAgo(3)];
    expect(computeStreak(dates)).toBe(1);
  });

  it('returns 0 for two-days-ago (missed yesterday and today)', () => {
    const dates = [daysAgo(2), daysAgo(3), daysAgo(4)];
    expect(computeStreak(dates)).toBe(0);
  });

  it('handles duplicates and unordered date arrays', () => {
    const dates = [
      daysAgo(2),
      daysAgo(0),
      daysAgo(1),
      daysAgo(0),
      daysAgo(2),
      daysAgo(1),
    ];
    expect(computeStreak(dates)).toBe(3);
  });

  it('computes consecutive streak across a month boundary', () => {
    // Set system time to Nov 2, 2026
    jest.setSystemTime(new Date(2026, 10, 2, 12, 0, 0));
    // Nov 2, Nov 1, Oct 31, Oct 30 -> 4 days
    const dates = [
      daysAgo(0), // 2026-11-02
      daysAgo(1), // 2026-11-01
      daysAgo(2), // 2026-10-31
      daysAgo(3), // 2026-10-30
    ];
    expect(computeStreak(dates)).toBe(4);
  });
});
