import { apiRequest } from './client';

interface StatsResponse { tables?: Record<string, { latest_date?: string | null }> }
export interface CoveredTradingDates {
  dates: string[];
  marketWatermark: string | null;
  rejectedCalendarDates: string[];
}

export async function listCoveredTradingDates(through: string, limit = 60): Promise<CoveredTradingDates> {
  const params = new URLSearchParams({ end_date: through, limit: String(limit) });
  const [calendarDates, stats] = await Promise.all([
    apiRequest<string[]>(`/api/daily/dates?${params.toString()}`),
    apiRequest<StatsResponse>('/api/stats'),
  ]);
  const marketWatermark = stats.tables?.['daily_market_snapshot']?.latest_date ?? null;
  if (!marketWatermark) return { dates: [], marketWatermark: null, rejectedCalendarDates: calendarDates };
  const dates = calendarDates.filter((date) => date <= through && date <= marketWatermark);
  const rejectedCalendarDates = calendarDates.filter((date) => !dates.includes(date));
  return { dates, marketWatermark, rejectedCalendarDates };
}
