import type { BacktestSummary, EquityPoint } from '@/domains/backtests/types/models';

export interface SandboxRunRequest {
  code: string;
  start_date: string;
  end_date: string;
  initial_cash: number;
  benchmark_id?: string;
  universe_mode?: 'preset' | 'all';
}

export interface SandboxRunResponse {
  success: boolean;
  summary: BacktestSummary | null;
  equity_points: EquityPoint[];
  logs: string[];
  error_message: string | null;
  duration_ms: number;
}

export interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  code: string;
}
