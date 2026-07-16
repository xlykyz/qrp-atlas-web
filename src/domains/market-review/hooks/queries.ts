import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { marketReviewApi } from '../api/marketReviewApi';
import { addDays, shanghaiToday } from '../lib/deriveMarketReview';
import type { PhaseWrite } from '../types/models';

export const marketReviewKeys = {
  all: ['market-review'] as const,
  dates: (through: string) => [...marketReviewKeys.all, 'dates', through] as const,
  daily: (date: string) => [...marketReviewKeys.all, 'daily', date] as const,
  indexes: (date: string) => [...marketReviewKeys.all, 'indexes', date] as const,
  limitUps: (date: string) => [...marketReviewKeys.all, 'limit-ups', date] as const,
  limitDowns: (date: string) => [...marketReviewKeys.all, 'limit-downs', date] as const,
  phase: (date: string) => [...marketReviewKeys.all, 'phase', date] as const,
};

export function useMarketReviewDates() {
  const through = shanghaiToday();
  return useQuery({ queryKey: marketReviewKeys.dates(through), queryFn: () => marketReviewApi.listDates(through), staleTime: 300_000 });
}

export function useMarketReview(date: string | null) {
  const value = date ?? '';
  const enabled = Boolean(date);
  const daily = useQuery({ queryKey: marketReviewKeys.daily(value), queryFn: () => marketReviewApi.getDaily(value), enabled, staleTime: 60_000 });
  const indexes = useQuery({ queryKey: marketReviewKeys.indexes(value), queryFn: () => marketReviewApi.getIndexes(addDays(value, -14), value), enabled, staleTime: 60_000 });
  const limitUps = useQuery({ queryKey: marketReviewKeys.limitUps(value), queryFn: () => marketReviewApi.getLimitUps(value), enabled, staleTime: 60_000 });
  const limitDowns = useQuery({ queryKey: marketReviewKeys.limitDowns(value), queryFn: () => marketReviewApi.getLimitDowns(value), enabled, staleTime: 60_000 });
  const phase = useQuery({ queryKey: marketReviewKeys.phase(value), queryFn: () => marketReviewApi.getPhase(value), enabled, staleTime: 60_000 });
  return { daily, indexes, limitUps, limitDowns, phase };
}

export function useSavePhase(date: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: PhaseWrite) => marketReviewApi.savePhase(payload),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: marketReviewKeys.phase(date) }),
        client.invalidateQueries({ queryKey: ['today', 'phase', date] }),
      ]);
    },
  });
}
