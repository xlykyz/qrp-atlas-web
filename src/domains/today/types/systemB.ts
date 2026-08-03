/**
 * TypeScript types for System B monitoring endpoints.
 *
 * Field names use snake_case throughout to match the backend JSON exactly
 * (see system-design-v0.1 §8.3: no camelCase conversion).
 *
 * Data conventions:
 *   - episode_return / peak_return are decimals (0.186 = +18.6%).
 *   - drawdown_from_peak is a negative decimal or zero (-0.032 = -3.2%).
 *   - Date fields are ISO 8601 strings ("2026-07-27").
 *   - Datetime fields are ISO 8601 strings ("2026-07-27T18:30:22").
 */

/** P0-1 / P0-2: Aggregated state counts and transition counts for one trade date. */
export interface SystemBSummaryDto {
  trade_date?: string;
  base_count: number;
  candidate_count: number;
  active_count: number;
  new_listing_warmup_count: number;
  null_state_count: number;
  base_to_candidate_count: number;
  candidate_to_active_count: number;
  active_to_base_count: number;
  active_held_count: number;
  calculation_completed_at?: string | null;
  production_run_id?: string | null;
}

/** P0-7: Latest System B production run metadata. */
export interface ProductionRunDto {
  production_run_id: string;
  status: string;
  calculation_version?: string | null;
  asset_count?: number | null;
  completed_at?: string | null;
}

/** P0-3 / P0-4 / P0-5: One row in the ACTIVE strong-stock list. */
export interface ActiveEpisodeDto {
  asset_id: string;
  name: string | null;
  trade_date: string;
  close: number;
  episode_id: string;
  episode_no: number;
  days_since_start: number;
  days_since_confirmed: number;
  episode_return: number;
  peak_return: number;
  drawdown_from_peak: number;
  ma5_reentry_count: number;
  episode_start_date: string | null;
  episode_confirmed_date: string | null;
  trend_state: string;
  previous_trend_state: string | null;
}

/** P0-6: One stock's membership in a pool on a given trade date. */
export interface PoolMemberDto {
  asset_id: string;
  pool_type: string;
  membership_state: string;
  pool_cycle_no: number;
  entry_date: string | null;
  exit_date: string | null;
  episode_id: string | null;
}

/** P0-6: All IN_POOL members for one pool type on a given trade date. */
export interface PoolTypeSnapshot {
  pool_type: string;
  count: number;
  members: PoolMemberDto[];
}

/** P0-6: Three-pool snapshot response. */
export interface PoolSnapshotResponse {
  trade_date: string;
  pools: PoolTypeSnapshot[];
}

/** Pool type constants. */
export const POOL_TYPES = ['HEIGHT', 'CAPACITY', 'RECOGNITION'] as const;
export type PoolType = (typeof POOL_TYPES)[number];

/** Sort key for the ActiveListPanel dual-view. */
export type SortKey = 'episode_return' | 'days_since_start';

/** Display mode for the ActiveListPanel. */
export type DisplayMode = 'top30' | 'all';

/** Default number of rows to show in "top30" mode. */
export const TOP_N = 30;

/** staleTime for TanStack Query (60 seconds, see system-design-v0.1 §8.8). */
export const STALE_TIME = 60_000;
