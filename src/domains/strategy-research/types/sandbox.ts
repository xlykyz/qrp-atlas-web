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
  /** 基准对齐序列（顶层，与 sandbox-benchmark 同口径）。后端尚未提供时为 undefined。 */
  series?: SandboxBenchmarkSeriesPoint[];
  /** 是否为前端本地模拟回退结果（后端不可用时）。真实后端结果不携带此标记。 */
  is_simulated?: boolean;
}

/** 基准重算请求：只做后处理，不重跑策略。 */
export interface SandboxBenchmarkRequest {
  equity_points: EquityPoint[];
  benchmark_id: string;
}

/** 基准重算响应：字段与 BacktestSummary 的基准字段同名同义，可直接覆盖。 */
export interface SandboxBenchmarkResponse {
  benchmark_id: string;
  benchmark_total_return_pct: number | null;
  portfolio_total_return_pct: number | null;
  excess_percentage_point_pct: number | null;
  relative_return_pct: number | null;
  excess_total_return_pct: number | null;
  full_range_excess_available: boolean | null;
  benchmark_sharpe: number | null;
  excess_sharpe: number | null;
  daily_active_sharpe: number | null;
  logs: string[];
  /** 基准对齐序列（与请求的 equity_points 日期一一对应）。后端尚未提供时为 undefined。 */
  series?: SandboxBenchmarkSeriesPoint[];
}

/** 基准对齐序列单点。基准缺口日各收益字段为 null（不做填充）。 */
export interface SandboxBenchmarkSeriesPoint {
  date: string;
  benchmark_cumulative_return_pct: number | null;
  portfolio_cumulative_return_pct: number | null;
  excess_percentage_point_pct: number | null;
}

export interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  code: string;
}
