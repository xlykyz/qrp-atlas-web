import { apiRequest } from '@/shared/api/client';
import type {
  DailyQuoteDto,
  HealthResponse,
  IndexDailyDto,
  LimitDownDto,
  LimitUpDto,
  PhaseDto,
  ResearchVisitDto,
  StatsResponse,
  StockReportDto,
} from '../types/models';

function queryString(values: Record<string, string | number | null | undefined>): string {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') params.set(key, String(value));
  });
  return params.toString();
}

export const todayApi = {
  getHealth: () => apiRequest<HealthResponse>('/api/health'),
  getStats: () => apiRequest<StatsResponse>('/api/stats'),
  listTradingDates: (through: string, limit = 30) =>
    apiRequest<string[]>(`/api/daily/dates?${queryString({ end_date: through, limit })}`),
  getDailySnapshot: (date: string) =>
    apiRequest<DailyQuoteDto[]>(`/api/daily?${queryString({ date, limit: 10000 })}`),
  getIndexSeries: (startDate: string, endDate: string) =>
    apiRequest<IndexDailyDto[]>(`/api/index-daily?${queryString({ start_date: startDate, end_date: endDate, limit: 500 })}`),
  getLimitUps: (date: string) =>
    apiRequest<LimitUpDto[]>(`/api/zt-pool?${queryString({ date, limit: 5000 })}`),
  getLimitDowns: (date: string) =>
    apiRequest<LimitDownDto[]>(`/api/dt-pool?${queryString({ date, limit: 5000 })}`),
  getPhase: (date: string) =>
    apiRequest<PhaseDto[]>(`/api/phase?${queryString({ date })}`),
  listRecentReports: () => apiRequest<StockReportDto[]>('/api/reports/stock?limit=6'),
  listRecentVisits: () => apiRequest<ResearchVisitDto[]>('/api/visits?limit=6'),
};
