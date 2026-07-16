export interface ParameterSpec {
  type: string;
  required: boolean;
  default: unknown;
  has_default: boolean;
  minimum: number | null;
  maximum: number | null;
  description: string | null;
  label: string | null;
  enum: unknown[] | null;
}

export interface Strategy {
  code: string; name: string; version: string; family: string; description: string;
  scope: string; strategy_type: string; required_fields: string[]; required_indicators: string[];
  parameter_schema: Record<string, ParameterSpec>; indicator_requests: Record<string, unknown>[];
  product_supported: boolean; requires_historical_universe: boolean;
  supported_universe_modes: string[]; supported_entry_timings: string[]; requires_portfolio_config: boolean;
}

export interface PositionConfig { initial_cash: number; max_positions: number; max_weight_per_symbol: number }
export interface CostConfig { commission_rate: number; stamp_tax_rate: number; slippage_bps: number }
export interface ExecutionConfig { entry_timing: string }

export interface CreateBacktestTaskRequest {
  name: string | null; strategy_code: string; strategy_version: string; strategy_params: Record<string, unknown>;
  universe_mode: string; universe_preset: string | null; index_code: string | null; tickers: string[] | null;
  start_date: string; end_date: string; benchmark_id: string | null;
  position: PositionConfig; cost: CostConfig; execution: ExecutionConfig;
}

export interface BacktestTask {
  task_id: string; owner_user_id: string; run_id: string | null; name: string; strategy_code: string; strategy_version: string;
  strategy_params: Record<string, unknown>; universe_mode: string; universe_preset: string | null; index_code: string | null;
  tickers: string[]; start_date: string; end_date: string; benchmark_id: string | null; position: PositionConfig; cost: CostConfig;
  execution: ExecutionConfig; status: string; error_message: string | null; created_at: string; updated_at: string;
  is_mock: boolean; request_snapshot: Record<string, unknown>;
}
export interface CreateTaskResponse { task: BacktestTask }

export interface BacktestRun {
  run_id: string; owner_user_id: string | null; name: string; strategy_name: string; universe: string;
  start_date: string; end_date: string; created_at: string; status: string;
}
export interface BacktestSummary {
  run_id: string; total_return_pct: number | null; annual_return_pct: number | null; max_drawdown_pct: number | null;
  sharpe: number | null; sortino: number | null; calmar: number | null; win_rate_pct: number | null;
  profit_loss_ratio: number | null; trade_count: number; avg_holding_days: number | null; max_trade_loss_pct: number | null;
  max_trade_profit_pct: number | null; skipped_count: number; turnover: number | null; commission: number | null;
  stamp_tax: number | null; slippage_cost: number | null; total_cost: number | null; final_equity: number | null;
  benchmark_id: string | null; benchmark_total_return_pct: number | null; portfolio_total_return_pct: number | null;
  excess_percentage_point_pct: number | null; relative_return_pct: number | null; excess_total_return_pct: number | null;
  full_range_excess_available: boolean | null; benchmark_sharpe: number | null; excess_sharpe: number | null; daily_active_sharpe: number | null;
}
export interface EquityPoint { date: string; equity: number; drawdown_pct: number }
export interface BacktestTrade {
  trade_id: string; asset_id: string; signal_date: string; entry_date: string; entry_price: number; exit_date: string | null;
  exit_price: number | null; holding_days: number | null; return_pct: number | null; mae_pct: number | null;
  mfe_pct: number | null; exit_reason: string | null; status: string;
}
export interface SkippedTrade { asset_id: string | null; signal_date: string | null; reason: string; detail: string | null }
export interface BacktestConfigSnapshot { run_id: string; config: Record<string, unknown> }
export interface CostBreakdown { commission: number | null; stamp_tax: number | null; slippage_cost: number | null; total_cost: number | null; turnover: number | null; final_equity: number | null; total_return_pct: number | null }
export interface RunDiagnostics {
  result_package_version: string | null; artifact_set: string[]; has_orders: boolean; has_fills: boolean; has_snapshots: boolean;
  has_rolling_performance: boolean; has_daily_returns: boolean; has_benchmark: boolean; has_exposures: boolean;
  benchmark_diagnostics: string[]; full_loss: boolean; snapshot_count: number; order_count: number; fill_count: number; trade_count: number; skipped_count: number;
}
export interface RunCompareResponse { runs: BacktestRun[]; summaries: BacktestSummary[]; configs: BacktestConfigSnapshot[]; missing: string[] }
export type UntypedArtifact = Record<string, unknown> | Record<string, unknown>[] | null;
