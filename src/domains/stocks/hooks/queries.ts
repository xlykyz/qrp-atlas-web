import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stocksApi } from '../api/stocksApi';
import { rangeStart, shanghaiToday } from '../lib/stockResearch';
import type { Adjustment, PriceRange, TradeWrite } from '../types/models';

export const stockKeys = {
  all: ['stocks'] as const,
  dates: (through: string) => [...stockKeys.all, 'dates', through] as const,
  list: (filters: object) => [...stockKeys.all, 'list', filters] as const,
  detail: (ticker: string) => [...stockKeys.all, 'detail', ticker] as const,
  daily: (ticker: string, date: string, range: PriceRange, adjustment: Adjustment) => [...stockKeys.all, 'daily', ticker, date, range, adjustment] as const,
  reports: (ticker: string, date: string) => [...stockKeys.all, 'reports', ticker, date] as const,
  visits: (ticker: string, date: string) => [...stockKeys.all, 'visits', ticker, date] as const,
  trades: (ticker: string) => [...stockKeys.all, 'trades', ticker] as const,
};

export function useStockDates() {
  const through = shanghaiToday();
  return useQuery({ queryKey: stockKeys.dates(through), queryFn: () => stocksApi.listDates(through), staleTime: 300_000 });
}

export function useStockList(filters: { keyword: string; exchange: string; active: string; page: number; limit: number }) {
  return useQuery({
    queryKey: stockKeys.list(filters),
    queryFn: () => stocksApi.listStocks({ keyword: filters.keyword || undefined, exchange: filters.exchange || undefined, isActive: filters.active === 'true' ? true : filters.active === 'false' ? false : undefined, limit: filters.limit, offset: filters.page * filters.limit }),
    staleTime: 300_000,
  });
}

export function useStock(ticker: string) {
  return useQuery({ queryKey: stockKeys.detail(ticker), queryFn: () => stocksApi.getStock(ticker), enabled: Boolean(ticker), staleTime: 300_000 });
}

export function useStockDetailData(ticker: string | undefined, date: string | null, range: PriceRange, adjustment: Adjustment) {
  const canonical = ticker ?? '';
  const stableDate = date ?? '';
  const enabled = Boolean(ticker && date);
  const daily = useQuery({ queryKey: stockKeys.daily(canonical, stableDate, range, adjustment), queryFn: () => stocksApi.getDaily(canonical, rangeStart(stableDate, range), stableDate, adjustment), enabled, staleTime: 60_000 });
  const reports = useQuery({ queryKey: stockKeys.reports(canonical, stableDate), queryFn: () => stocksApi.listReports(canonical, stableDate), enabled, staleTime: 300_000 });
  const visits = useQuery({ queryKey: stockKeys.visits(canonical, stableDate), queryFn: () => stocksApi.listVisits(canonical, stableDate), enabled, staleTime: 300_000 });
  const trades = useQuery({ queryKey: stockKeys.trades(canonical), queryFn: () => stocksApi.listTrades(canonical), enabled: Boolean(ticker), staleTime: 60_000 });
  return { daily, reports, visits, trades };
}

export function useCreateTrade(ticker: string) {
  const client = useQueryClient();
  return useMutation({ mutationFn: (payload: TradeWrite) => stocksApi.createTrade(payload), onSuccess: () => client.invalidateQueries({ queryKey: stockKeys.trades(ticker) }) });
}
