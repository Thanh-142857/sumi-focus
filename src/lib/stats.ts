import { dateKey, daysAgo } from './date';
import type { Session } from '../store/useAppStore';

const JA_DAYS = ['日', '月', '火', '水', '木', '金', '土'];
const JA_FULL_DAYS = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];

const EN_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const EN_FULL_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface DayStat {
  key: string;
  label: string;
  fullLabel: string;
  minutes: number;
  isToday: boolean;
}

export interface StatsSummary {
  todayMinutes: number;
  weekMinutes: number;
  totalMinutes: number;
  totalSessions: number;
  last7: DayStat[];
  accessibilitySummary: string;
}

export function getLast7Days(sessions: Session[], language: string = 'en'): DayStat[] {
  const isJa = language.startsWith('ja');
  const today = dateKey();

  const minutesByDate = new Map<string, number>();
  for (const s of sessions) {
    const k = dateKey(s.endedAt);
    minutesByDate.set(k, (minutesByDate.get(k) ?? 0) + s.minutes);
  }

  const result: DayStat[] = [];
  // 7 days ending today (from 6 days ago up to today)
  for (let offset = 6; offset >= 0; offset--) {
    const key = daysAgo(offset);
    const dateObj = new Date(key + 'T12:00:00');
    const dayOfWeek = dateObj.getDay();

    result.push({
      key,
      label: isJa ? JA_DAYS[dayOfWeek] : EN_DAYS[dayOfWeek],
      fullLabel: isJa ? JA_FULL_DAYS[dayOfWeek] : EN_FULL_DAYS[dayOfWeek],
      minutes: minutesByDate.get(key) ?? 0,
      isToday: key === today,
    });
  }

  return result;
}

export function computeStats(sessions: Session[], language: string = 'en'): StatsSummary {
  const today = dateKey();
  const last7 = getLast7Days(sessions, language);
  const last7KeySet = new Set(last7.map((d) => d.key));

  let todayMinutes = 0;
  let weekMinutes = 0;
  let totalMinutes = 0;

  for (const s of sessions) {
    const k = dateKey(s.endedAt);
    totalMinutes += s.minutes;
    if (k === today) {
      todayMinutes += s.minutes;
    }
    if (last7KeySet.has(k)) {
      weekMinutes += s.minutes;
    }
  }

  const isJa = language.startsWith('ja');
  const accessibilitySummary = last7
    .map((d) => (isJa ? `${d.fullLabel} ${d.minutes}分` : `${d.fullLabel} ${d.minutes}m`))
    .join(isJa ? '、' : ', ');

  return {
    todayMinutes,
    weekMinutes,
    totalMinutes,
    totalSessions: sessions.length,
    last7,
    accessibilitySummary,
  };
}
