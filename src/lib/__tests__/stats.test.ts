import { computeStats, getLast7Days } from '../stats';
import { daysAgo, dateKey } from '../date';
import type { Session } from '../../store/useAppStore';

describe('stats utils', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 10, 16, 12, 0, 0)); // Nov 16, 2026
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('produces exactly 7 entries ending today', () => {
    const list = getLast7Days([], 'en');
    expect(list).toHaveLength(7);
    expect(list[6].key).toBe(daysAgo(0)); // today
    expect(list[0].key).toBe(daysAgo(6)); // 6 days ago
    expect(list[6].isToday).toBe(true);
    expect(list[5].isToday).toBe(false);
  });

  it('correctly sums minutes on the same day', () => {
    const sessions: Session[] = [
      { id: '1', endedAt: `${daysAgo(0)}T09:00:00Z`, minutes: 25 },
      { id: '2', endedAt: `${daysAgo(0)}T14:30:00Z`, minutes: 25 },
      { id: '3', endedAt: `${daysAgo(1)}T10:00:00Z`, minutes: 50 },
    ];

    const stats = computeStats(sessions, 'en');
    expect(stats.todayMinutes).toBe(50);
    expect(stats.weekMinutes).toBe(100);
    expect(stats.totalMinutes).toBe(100);
    expect(stats.totalSessions).toBe(3);

    const todayEntry = stats.last7.find((d) => d.key === daysAgo(0));
    expect(todayEntry?.minutes).toBe(50);

    const yesterdayEntry = stats.last7.find((d) => d.key === daysAgo(1));
    expect(yesterdayEntry?.minutes).toBe(50);
  });

  it('excludes sessions older than 7 days from weekMinutes and last7', () => {
    const sessions: Session[] = [
      { id: 'recent', endedAt: `${daysAgo(2)}T10:00:00Z`, minutes: 30 },
      { id: 'old1', endedAt: `${daysAgo(7)}T10:00:00Z`, minutes: 25 }, // 7 days ago (8th day back)
      { id: 'old2', endedAt: `${daysAgo(30)}T10:00:00Z`, minutes: 60 },
    ];

    const stats = computeStats(sessions, 'en');
    expect(stats.todayMinutes).toBe(0);
    expect(stats.weekMinutes).toBe(30);
    expect(stats.totalMinutes).toBe(115);
    expect(stats.totalSessions).toBe(3);

    // Sum of last7 should equal weekMinutes
    const last7Sum = stats.last7.reduce((acc, d) => acc + d.minutes, 0);
    expect(last7Sum).toBe(30);
  });

  it('generates localized weekday labels and accessibility summary', () => {
    const sessions: Session[] = [
      { id: '1', endedAt: `${daysAgo(0)}T10:00:00Z`, minutes: 25 },
    ];

    const statsEn = computeStats(sessions, 'en');
    expect(statsEn.accessibilitySummary).toContain('25m');

    const statsJa = computeStats(sessions, 'ja');
    expect(statsJa.accessibilitySummary).toContain('25分');
    expect(['月', '火', '水', '木', '金', '土', '日']).toContain(statsJa.last7[6].label);
  });
});
