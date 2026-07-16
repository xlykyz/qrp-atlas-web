import type { CreateBacktestTaskRequest, ParameterSpec, Strategy } from '../types/models';

export interface BacktestFormModel {
  name: string; strategyCode: string; strategyVersion: string; startDate: string; endDate: string;
  universeMode: string; tickers: string; universePreset: string; indexCode: string; benchmarkId: string;
  initialCash: string; maxPositions: string; maxWeightPerSymbol: string; commissionRate: string; stampTaxRate: string;
  slippageBps: string; entryTiming: string; params: Record<string, string | boolean>;
}
export type FormErrors = Partial<Record<keyof BacktestFormModel | `param.${string}`, string>>;

function inputValue(spec: ParameterSpec): string | boolean {
  const value = spec.has_default ? spec.default : '';
  if (spec.type === 'boolean') return Boolean(value);
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}
export function createBacktestForm(strategy: Strategy): BacktestFormModel {
  return {
    name: `${strategy.name} 实验`, strategyCode: strategy.code, strategyVersion: strategy.version,
    startDate: '2024-01-08', endDate: '2024-03-15', universeMode: strategy.supported_universe_modes[0] ?? 'tickers',
    tickers: '000001.SZ', universePreset: '', indexCode: '000300.SH', benchmarkId: '000300.SH',
    initialCash: '1000000', maxPositions: '5', maxWeightPerSymbol: '0.2', commissionRate: '0.00025',
    stampTaxRate: '0.0005', slippageBps: '5', entryTiming: strategy.supported_entry_timings[0] ?? 'next_open',
    params: Object.fromEntries(Object.entries(strategy.parameter_schema).map(([key, spec]) => [key, inputValue(spec)])),
  };
}
function positive(value: string): boolean { return Number.isFinite(Number(value)) && Number(value) > 0; }
function nonNegative(value: string): boolean { return Number.isFinite(Number(value)) && Number(value) >= 0; }
export function validateBacktestForm(model: BacktestFormModel, strategy: Strategy): FormErrors {
  const errors: FormErrors = {};
  if (!model.strategyCode) errors.strategyCode = '请选择策略';
  if (!model.startDate) errors.startDate = '请选择开始日期';
  if (!model.endDate) errors.endDate = '请选择结束日期';
  if (model.startDate && model.endDate && model.startDate > model.endDate) errors.endDate = '结束日期不能早于开始日期';
  if (model.universeMode === 'tickers' && !parseTickers(model.tickers).length) errors.tickers = '至少输入一个证券代码';
  if (model.universeMode === 'index_components' && !model.indexCode.trim()) errors.indexCode = '请输入指数代码';
  if (model.universeMode === 'preset' && !model.universePreset.trim()) errors.universePreset = '请输入股票池预设';
  if (!positive(model.initialCash)) errors.initialCash = '初始资金必须大于 0';
  if (!positive(model.maxPositions) || !Number.isInteger(Number(model.maxPositions))) errors.maxPositions = '持仓数量必须为正整数';
  if (!positive(model.maxWeightPerSymbol) || Number(model.maxWeightPerSymbol) > 1) errors.maxWeightPerSymbol = '单票权重应在 0 到 1 之间';
  if (!nonNegative(model.commissionRate)) errors.commissionRate = '佣金率不能为负';
  if (!nonNegative(model.stampTaxRate)) errors.stampTaxRate = '印花税率不能为负';
  if (!nonNegative(model.slippageBps)) errors.slippageBps = '滑点不能为负';
  for (const [key, spec] of Object.entries(strategy.parameter_schema)) {
    const value = model.params[key];
    if (spec.required && (value === '' || value === undefined)) errors[`param.${key}`] = '必填参数';
    if (value !== '' && value !== undefined && ['integer', 'number', 'float'].includes(spec.type)) {
      const num = Number(value);
      if (!Number.isFinite(num)) errors[`param.${key}`] = '请输入有效数字';
      else if (spec.type === 'integer' && !Number.isInteger(num)) errors[`param.${key}`] = '请输入整数';
      else if (spec.minimum !== null && num < spec.minimum) errors[`param.${key}`] = `不能小于 ${spec.minimum}`;
      else if (spec.maximum !== null && num > spec.maximum) errors[`param.${key}`] = `不能大于 ${spec.maximum}`;
    }
  }
  return errors;
}
export function parseTickers(value: string): string[] { return [...new Set(value.split(/[\s,，;；]+/).map((v) => v.trim().toUpperCase()).filter(Boolean))]; }
function mapParameter(value: string | boolean, spec: ParameterSpec): unknown {
  if (spec.type === 'boolean') return Boolean(value);
  if (['integer', 'number', 'float'].includes(spec.type)) return Number(value);
  return value;
}
export function toCreateTaskRequest(model: BacktestFormModel, strategy: Strategy): CreateBacktestTaskRequest {
  return {
    name: model.name.trim() || null, strategy_code: model.strategyCode, strategy_version: model.strategyVersion,
    strategy_params: Object.fromEntries(Object.entries(strategy.parameter_schema).map(([key, spec]) => [key, mapParameter(model.params[key] ?? '', spec)])),
    universe_mode: model.universeMode, universe_preset: model.universeMode === 'preset' ? model.universePreset.trim() : null,
    index_code: model.universeMode === 'index_components' ? model.indexCode.trim() : null,
    tickers: model.universeMode === 'tickers' ? parseTickers(model.tickers) : null, start_date: model.startDate, end_date: model.endDate,
    benchmark_id: model.benchmarkId.trim() || null,
    position: { initial_cash: Number(model.initialCash), max_positions: Number(model.maxPositions), max_weight_per_symbol: Number(model.maxWeightPerSymbol) },
    cost: { commission_rate: Number(model.commissionRate), stamp_tax_rate: Number(model.stampTaxRate), slippage_bps: Number(model.slippageBps) },
    execution: { entry_timing: model.entryTiming },
  };
}
