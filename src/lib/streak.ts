import { dateKey, daysAgo } from './date';

/**
 * Computes the consecutive active days streak.
 * Streak = consecutive days ending today, or ending yesterday if not yet done today.
 *
 * @param doneDates Array of ISO date strings formatted as YYYY-MM-DD.
 * @returns The number of consecutive days.
 */
export function computeStreak(doneDates: string[]): number {
  if (!doneDates || doneDates.length === 0) {
    return 0;
  }

  const dateSet = new Set(doneDates);
  const today = dateKey();
  const doneToday = dateSet.has(today);

  let streak = 0;
  let dayOffset = doneToday ? 0 : 1;

  while (dateSet.has(daysAgo(dayOffset))) {
    streak += 1;
    dayOffset += 1;
  }

  return streak;
}

/*
 * Sample Test Cases:
 *
 * 1. Completed today and yesterday:
 *    computeStreak([daysAgo(0), daysAgo(1)]) === 2
 *
 * 2. Completed yesterday, not yet done today (streak is preserved):
 *    computeStreak([daysAgo(1), daysAgo(2), daysAgo(3)]) === 3
 *
 * 3. Broken streak (done 2 days ago, but missed yesterday and today):
 *    computeStreak([daysAgo(2), daysAgo(3)]) === 0
 *
 * 4. Empty completion history:
 *    computeStreak([]) === 0
 */
