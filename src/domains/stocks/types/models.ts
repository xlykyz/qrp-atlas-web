export interface StockDto {
  ticker: string;
  name: string | null;
  exchange: string | null;
  market: string | null;
  list_date: string | null;
  delist_date: string | null;
  is_active: boolean | null;
  updated_at?: string | null;
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
  attach_url?: string | null;
  predict_this_year_eps?: string | number | null;
  predict_this_year_pe?: string | number | null;
  predict_next_year_eps?: string | number | null;
  predict_next_year_pe?: string | number | null;
  created_at: string | null;
}

export interface ResearchVisitDto {
  secu_code: string;
  sec_name: string | null;
  notice_date: string | null;
  receive_date: string | null;
  receive_way: string | null;
  receive_place?: string | null;
  receptionist?: string | null;
  org_count: number | null;
  content: string | null;
  announcement_title?: string | null;
  source: string | null;
  created_at: string | null;
}

export interface TradeDto {
  trade_id: string;
  ticker: string | null;
  entry_date: string | null;
  entry_price: number | null;
  path_type: string | null;
  half_sell_trigger: number | null;
  half_sell_date: string | null;
  half_sell_price: number | null;
  exit_date: string | null;
  exit_price: number | null;
  position_pct: number | null;
  notes: string | null;
}

export type TradeWrite = Omit<TradeDto, 'trade_id'>;
export type Adjustment = 'raw' | 'qfq' | 'hfq';
export type PriceRange = '3m' | '6m' | '1y' | '3y';
export type StockTab = 'overview' | 'research' | 'trades' | 'notes';

export interface StockSnapshot {
  latest: DailyQuoteDto | null;
  first: DailyQuoteDto | null;
  rangeReturn: number | null;
  rangeHigh: number | null;
  rangeLow: number | null;
  totalAmount: number;
}
