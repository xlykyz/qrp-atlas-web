import { apiRequest } from '@/shared/api/client';
import type { Adjustment, DailyQuoteDto, ResearchVisitDto, StockDto, StockReportDto, TradeDto, TradeWrite } from '../types/models';

function qs(values: Record<string, string | number | boolean | undefined>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); });
  return params.toString();
}

export const stocksApi = {
  listDates: (through: string, limit = 260) => apiRequest<string[]>(`/api/daily/dates?${qs({ end_date: through, limit })}`),
  listStocks: (filters: { keyword?: string | undefined; exchange?: string | undefined; isActive?: boolean | undefined; limit: number; offset: number }) =>
    apiRequest<StockDto[]>(`/api/stock/list?${qs({ keyword: filters.keyword, exchange: filters.exchange, is_active: filters.isActive, limit: filters.limit, offset: filters.offset })}`),
  getStock: (ticker: string) => apiRequest<StockDto>(`/api/stock/${encodeURIComponent(ticker)}`),
  getDaily: (ticker: string, startDate: string, endDate: string, adjustment: Adjustment) =>
    apiRequest<DailyQuoteDto[]>(`/api/daily?${qs({ ticker, start_date: startDate, end_date: endDate, adjustment, limit: 2000 })}`),
  listReports: (ticker: string, endDate: string) =>
    apiRequest<StockReportDto[]>(`/api/reports/stock?${qs({ ticker: bareTicker(ticker), end_date: endDate, limit: 50 })}`),
  listVisits: (ticker: string, endDate: string) =>
    apiRequest<ResearchVisitDto[]>(`/api/visits?${qs({ secu_code: ticker, end_date: endDate, limit: 50 })}`),
  listTrades: (ticker: string) => apiRequest<TradeDto[]>(`/api/trades?${qs({ ticker, limit: 500 })}`),
  createTrade: (payload: TradeWrite) => apiRequest<TradeDto>('/api/trades', { method: 'POST', body: payload }),
};

export function bareTicker(ticker: string): string {
  return ticker.split('.')[0] ?? ticker;
}
