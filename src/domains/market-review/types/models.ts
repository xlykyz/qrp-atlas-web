export interface DailyQuoteDto {
  trade_date: string;
  ticker: string;
  name: string | null;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  pct_change: number | null;
  pre_close?: number | null;
  volume: number | null;
  amount: number | null;
  turnover: number | null;
  is_st: boolean | null;
  is_limit_up: boolean | null;
  is_limit_down: boolean | null;
  created_at: string | null;
  board?: string | null;
  pct_5d?: number | null;
  pct_10d?: number | null;
  pct_20d?: number | null;
}

export interface IndexDailyDto {
  trade_date: string;
  index_code: string;
  index_name: string | null;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
  created_at: string | null;
}

export interface LimitUpDto {
  trade_date: string;
  ticker: string;
  name: string | null;
  close: number | null;
  pct_change: number | null;
  amount: number | null;
  float_cap: number | null;
  turnover: number | null;
  first_block_time: string | null;
  last_block_time?: string | null;
  consecutive_boards: number | null;
  blast_count?: number | null;
  block_fund: number | null;
  industry_name: string | null;
  created_at: string | null;
}

export interface LimitDownDto {
  trade_date: string;
  ticker: string;
  name: string | null;
  close: number | null;
  pct_change: number | null;
  amount: number | null;
  float_cap: number | null;
  turnover: number | null;
  consecutive_days: number | null;
  open_count: number | null;
  block_fund: number | null;
  industry_name: string | null;
  created_at: string | null;
}

export interface PhaseDto {
  trade_date: string;
  phase: string | null;
  M1_core: boolean | null;
  M2_front: boolean | null;
  M3_identifiable: boolean | null;
  V_triggered: boolean | null;
  notes: string | null;
  created_at: string | null;
}

export type PhaseWrite = Omit<PhaseDto, 'created_at'>;
export type LimitPoolRow = (LimitUpDto | LimitDownDto) & { direction: 'up' | 'down' };
export interface IndustryStat { name: string; up: number; down: number; net: number; total: number }
export interface MarketBreadth { total: number; traded: number; advancing: number; declining: number; flat: number; suspended: number; totalAmount: number; medianChange: number | null }
export interface IndexSnapshot { code: string; name: string; date: string; close: number | null; changePct: number | null; intradayPct: number | null }
