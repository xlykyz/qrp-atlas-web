/**
 * TanStack Query hooks for System B monitoring.
 *
 * Query keys use a ['system-b', ...] namespace to avoid collisions with the
 * existing ['today', ...] keys.  All date-dependent queries are enabled only
 * when a date is provided.
 */

import { useQuery } from '@tanstack/react-query';
import { systemBApi } from '../api/systemBApi';
import { STALE_TIME } from '../types/systemB';

/** Query key factory for System B endpoints. */
export const systemBKeys = {
  all: ['system-b'] as const,
  summary: (date: string) => [...systemBKeys.all, 'summary', date] as const,
  activeEpisodes: (date: string) => [...systemBKeys.all, 'active-episodes', date] as const,
  poolSnapshot: (date: string) => [...systemBKeys.all, 'pool-snapshot', date] as const,
  latestPoolSnapshot: () => [...systemBKeys.all, 'pool-snapshot', 'latest'] as const,
  latestProductionRun: () => [...systemBKeys.all, 'production-run', 'latest'] as const,
};

/** P0-1 / P0-2: State summary for one trade date. */
export function useSystemBSummary(date: string | null) {
  const stableDate = date ?? '';
  return useQuery({
    queryKey: systemBKeys.summary(stableDate),
    queryFn: () => systemBApi.getSummary(stableDate),
    enabled: Boolean(date),
    staleTime: STALE_TIME,
  });
}

/** P0-3 / P0-4 / P0-5: ACTIVE episodes (灵魂清单) for one trade date. */
export function useActiveEpisodes(date: string | null) {
  const stableDate = date ?? '';
  return useQuery({
    queryKey: systemBKeys.activeEpisodes(stableDate),
    queryFn: () => systemBApi.getActiveEpisodes(stableDate),
    enabled: Boolean(date),
    staleTime: STALE_TIME,
  });
}

/** P0-6: Three-pool snapshot for one trade date. */
export function usePoolSnapshot(date: string | null) {
  const stableDate = date ?? '';
  return useQuery({
    queryKey: systemBKeys.poolSnapshot(stableDate),
    queryFn: () => systemBApi.getPoolSnapshot(stableDate),
    enabled: Boolean(date),
    staleTime: STALE_TIME,
  });
}

/** P0-6: Latest completed three-pool snapshot (for default loading before date is selected). */
export function useLatestPoolSnapshot() {
  return useQuery({
    queryKey: systemBKeys.latestPoolSnapshot(),
    queryFn: systemBApi.getLatestPoolSnapshot,
    staleTime: STALE_TIME,
  });
}

/** P0-7: Latest production run metadata (data freshness). */
export function useLatestProductionRun() {
  return useQuery({
    queryKey: systemBKeys.latestProductionRun(),
    queryFn: systemBApi.getLatestProductionRun,
    staleTime: STALE_TIME,
  });
}
