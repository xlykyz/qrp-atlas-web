import type { ContractRequirement, ContractStatus, DatasetGroup, DatasetStatus, FreshnessState, StatsResponse } from '../types/models';

const catalog: Record<string, { label: string; group: DatasetGroup; expectedLagDays: number | null }> = {
  daily_market_snapshot: { label: '全市场日行情', group: 'market', expectedLagDays: 0 },
  index_daily: { label: '指数日行情', group: 'market', expectedLagDays: 0 },
  zt_pool: { label: '涨停池', group: 'market', expectedLagDays: 0 },
  dt_pool: { label: '跌停池', group: 'market', expectedLagDays: 0 },
  daily_basic: { label: '日频基础指标', group: 'market', expectedLagDays: 2 },
  adj_factor_changes: { label: '复权因子变化', group: 'market', expectedLagDays: 2 },
  suspend_d: { label: '停复牌记录', group: 'market', expectedLagDays: 3 },
  trading_calendar: { label: '交易日历', group: 'reference', expectedLagDays: null },
  research_report_stock: { label: '个股研报', group: 'research', expectedLagDays: 7 },
  research_report_industry: { label: '行业研报', group: 'research', expectedLagDays: 7 },
  cninfo_research_visits: { label: '机构调研', group: 'research', expectedLagDays: 7 },
  irm_interaction_qa: { label: '互动问答', group: 'research', expectedLagDays: 7 },
  balance_sheet: { label: '资产负债表', group: 'fundamental', expectedLagDays: 120 },
  cashflow_statement: { label: '现金流量表', group: 'fundamental', expectedLagDays: 120 },
  income_statement: { label: '利润表', group: 'fundamental', expectedLagDays: 120 },
  financial_indicator: { label: '财务指标', group: 'fundamental', expectedLagDays: 120 },
  earnings_forecast_event: { label: '业绩预告事件', group: 'fundamental', expectedLagDays: 120 },
  stock_info: { label: '股票主数据', group: 'reference', expectedLagDays: 120 },
  index_component_history: { label: '指数成分历史', group: 'reference', expectedLagDays: 60 },
  industry_membership_history: { label: '行业归属历史', group: 'reference', expectedLagDays: 120 },
  market_phase: { label: '市场阶段判断', group: 'user', expectedLagDays: null },
  trade_execution: { label: '交易记录', group: 'user', expectedLagDays: null },
};

export const contractRequirements: ContractRequirement[] = [
  { group: '基础', label: '健康状态', path: '/api/health', priority: 'required' },
  { group: '基础', label: '数据统计', path: '/api/stats', priority: 'required' },
  { group: '市场', label: '日行情', path: '/api/daily', priority: 'required' },
  { group: '市场', label: '交易日', path: '/api/daily/dates', priority: 'required' },
  { group: '市场', label: '指数', path: '/api/index-daily', priority: 'required' },
  { group: '市场', label: '涨停池', path: '/api/zt-pool', priority: 'required' },
  { group: '市场', label: '跌停池', path: '/api/dt-pool', priority: 'required' },
  { group: '研究', label: '股票主数据', path: '/api/stock/{ticker}', priority: 'required' },
  { group: '研究', label: '个股研报', path: '/api/reports/stock', priority: 'required' },
  { group: '研究', label: '机构调研', path: '/api/visits', priority: 'required' },
  { group: '研究', label: '通用研究记录', path: '/api/research-notes', priority: 'planned' },
  { group: '回测', label: '策略目录', path: '/api/strategies', priority: 'required' },
  { group: '回测', label: '任务队列', path: '/api/backtest/tasks', priority: 'required' },
  { group: '回测', label: '运行结果', path: '/api/backtest/runs', priority: 'required' },
  { group: '回测', label: '结果诊断', path: '/api/backtest/runs/{run_id}/diagnostics', priority: 'required' },
  { group: '回测', label: '运行比较', path: '/api/backtest/compare', priority: 'required' },
  { group: '运行', label: '数据任务', path: '/api/operations/runs', priority: 'planned' },
  { group: '运行', label: '数据集状态', path: '/api/operations/datasets', priority: 'planned' },
];

function daysBetween(from: string, to: string): number | null {
  const left = Date.parse(`${from}T12:00:00Z`);
  const right = Date.parse(`${to}T12:00:00Z`);
  return Number.isFinite(left) && Number.isFinite(right) ? Math.round((right - left) / 86_400_000) : null;
}

export function deriveDatasetStatuses(stats: StatsResponse): { referenceDate: string | null; rows: DatasetStatus[] } {
  const referenceDate = stats.tables['daily_market_snapshot']?.latest_date ?? Object.values(stats.tables).map((item) => item.latest_date).filter((value): value is string => Boolean(value)).sort().at(-1) ?? null;
  const rows = Object.entries(stats.tables).map(([key, value]): DatasetStatus => {
    const spec = catalog[key] ?? { label: key, group: 'reference' as const, expectedLagDays: 30 };
    const lagDays = referenceDate && value.latest_date ? daysBetween(value.latest_date, referenceDate) : null;
    let state: FreshnessState = 'unknown';
    if (value.rows === 0 || !value.latest_date) state = 'empty';
    else if (lagDays !== null && lagDays < 0) state = 'ahead';
    else if (spec.expectedLagDays === null || (lagDays !== null && lagDays <= spec.expectedLagDays)) state = 'current';
    else if (lagDays !== null) state = 'lagging';
    return { key, label: spec.label, group: spec.group, rows: value.rows, earliestDate: value.earliest_date, latestDate: value.latest_date, lagDays, expectedLagDays: spec.expectedLagDays, state };
  }).sort((a, b) => stateOrder(a.state) - stateOrder(b.state) || a.group.localeCompare(b.group) || a.label.localeCompare(b.label));
  return { referenceDate, rows };
}

function stateOrder(state: FreshnessState): number {
  return { lagging: 0, empty: 1, unknown: 2, ahead: 3, current: 4 }[state];
}

export function deriveContractStatuses(paths: string[]): ContractStatus[] {
  const deployed = new Set(paths);
  return contractRequirements.map((item) => ({ ...item, deployed: deployed.has(item.path) }));
}

export function databaseLabel(path: string): string {
  const parts = path.split(/[\\/]/).filter(Boolean);
  return parts.at(-1) ?? 'unknown';
}
