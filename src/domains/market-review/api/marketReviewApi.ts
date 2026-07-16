import { apiRequest } from '@/shared/api/client';
import type { DailyQuoteDto, IndexDailyDto, LimitDownDto, LimitUpDto, PhaseDto, PhaseWrite } from '../types/models';

function qs(values: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); });
  return params.toString();
}

export const marketReviewApi = {
  listDates: (through: string, limit = 60) => apiRequest<string[]>(`/api/daily/dates?${qs({ end_date: through, limit })}`),
  getDaily: (date: string) => apiRequest<DailyQuoteDto[]>(`/api/daily?${qs({ date, limit: 10000 })}`),
  getIndexes: (startDate: string, endDate: string) => apiRequest<IndexDailyDto[]>(`/api/index-daily?${qs({ start_date: startDate, end_date: endDate, limit: 500 })}`),
  getLimitUps: (date: string) => apiRequest<LimitUpDto[]>(`/api/zt-pool?${qs({ date, limit: 5000 })}`),
  getLimitDowns: (date: string) => apiRequest<LimitDownDto[]>(`/api/dt-pool?${qs({ date, limit: 5000 })}`),
  getPhase: (date: string) => apiRequest<PhaseDto[]>(`/api/phase?${qs({ date })}`),
  savePhase: (payload: PhaseWrite) => apiRequest<PhaseDto>('/api/phase', { method: 'POST', body: payload }),
};
