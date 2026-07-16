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

export type RecordKind = 'all' | 'phase' | 'trade';
export interface ResearchRecordItem {
  id: string;
  kind: Exclude<RecordKind, 'all'>;
  date: string | null;
  title: string;
  objectLabel: string;
  summary: string | null;
  status: string;
  href: string;
  source: string;
}
