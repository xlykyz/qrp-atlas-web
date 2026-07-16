import { apiRequest } from '@/shared/api/client';
import type { PhaseDto, TradeDto } from '../types/models';

function qs(values: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); });
  return params.toString();
}

export const researchRecordsApi = {
  listPhases: (from: string, to: string) => apiRequest<PhaseDto[]>(`/api/phase?${qs({ start_date: from, end_date: to })}`),
  listTrades: (from: string, to: string) => apiRequest<TradeDto[]>(`/api/trades?${qs({ start_date: from, end_date: to, limit: 10000 })}`),
};
