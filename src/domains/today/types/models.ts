export interface HealthResponse {
  status: string;
  tables: string[];
}

export interface TableCoverage {
  rows: number;
  earliest_date: string | null;
  latest_date: string | null;
}

export interface StatsResponse {
  database: string;
  size_bytes: number;
  tables: Record<string, TableCoverage>;
}

export interface DailyQuoteDto {
  trade_date: string;
  ticker: string;
  name: string | null;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  pre_close?: number | null;
  pct_change: number | null;
  volume: number | null;
  amount: number | null;
  turnover: number | null;
  market_cap: number | null;
  float_cap: number | null;
  is_st: boolean | null;
  is_limit_up: boolean | null;
  is_limit_down: boolean | null;
  created_at: string | null;
  board?: string | null;
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

export interface StockReportDto {
  info_code: string;
  title: string | null;
  stock_code: string | null;
  stock_name: string | null;
  publish_date: string | null;
  em_rating_name: string | null;
  rating_change: number | null;
  org_sname: string | null;
  researcher: string | null;
  notice_content: string | null;
  created_at: string | null;
}

export interface ResearchVisitDto {
  secu_code: string;
  sec_name: string | null;
  notice_date: string | null;
  receive_date: string | null;
  receive_way: string | null;
  org_count: number | null;
  content: string | null;
  source: string | null;
  created_at: string | null;
}

export interface MarketBreadth {
  total: number;
  traded: number;
  advancing: number;
  declining: number;
  flat: number;
  suspended: number;
  advanceShare: number | null;
  totalAmount: number;
  medianChange: number | null;
}

export interface IndexSnapshot {
  code: string;
  name: string;
  tradeDate: string;
  close: number | null;
  changePct: number | null;
  updatedAt: string | null;
}

export interface FreshnessItem {
  key: string;
  label: string;
  latestDate: string | null;
  rows: number | null;
  lagDays: number | null;
  state: 'current' | 'lagging' | 'missing' | 'future';
}
