/**
 * API layer for System B monitoring endpoints.
 *
 * Wraps all System B API calls using the shared apiRequest helper.
 * Endpoint paths match the FastAPI routes in system_b.py and system_b_pools.py.
 */

import { apiRequest } from '@/shared/api/client';
import type {
  ActiveEpisodeDto,
  PoolSnapshotResponse,
  ProductionRunDto,
  SystemBSummaryDto,
} from '../types/systemB';

function queryString(values: Record<string, string | number | null | undefined>): string {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') params.set(key, String(value));
  });
  return params.toString();
}

export const systemBApi = {
  /** P0-1 / P0-2: State summary (counts + transitions) for one trade date. */
  getSummary: (date: string) =>
    apiRequest<SystemBSummaryDto>(
      `/api/v1/system-b/summary?${queryString({ trade_date: date })}`,
    ),

  /** P0-3 / P0-4 / P0-5: ACTIVE episodes with episode metrics (灵魂清单). */
  getActiveEpisodes: (date: string, limit = 10000) =>
    apiRequest<ActiveEpisodeDto[]>(
      `/api/v1/system-b/active-episodes?${queryString({ trade_date: date, limit })}`,
    ),

  /** P0-6: Three-pool snapshot for a specific trade date. */
  getPoolSnapshot: (date: string) =>
    apiRequest<PoolSnapshotResponse>(
      `/api/v1/system-b/pools/snapshot?${queryString({ trade_date: date })}`,
    ),

  /** P0-6: Latest completed three-pool snapshot (for default loading). */
  getLatestPoolSnapshot: () =>
    apiRequest<PoolSnapshotResponse>('/api/v1/system-b/pools/snapshot/latest'),

  /** P0-7: Latest production run metadata (data freshness). */
  getLatestProductionRun: () =>
    apiRequest<ProductionRunDto | null>('/api/v1/system-b/production-runs/latest'),
};
