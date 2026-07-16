import { useState, type FormEvent } from 'react';
import { Play } from 'lucide-react';
import { Button, Field, Input, Panel, PanelBody, PanelHeader, Select } from '@/shared/ui';
import { createBacktestForm, toCreateTaskRequest, validateBacktestForm, type BacktestFormModel } from '../lib/form';
import type { CreateBacktestTaskRequest, ParameterSpec, Strategy } from '../types/models';

function ParameterInput({ name, spec, value, error, onChange }: { name: string; spec: ParameterSpec; value: string | boolean; error?: string | undefined; onChange: (value: string | boolean) => void }) {
  const label = spec.label ?? name;
  if (spec.type === 'boolean') return <Field label={label} description={spec.description ?? undefined} error={error}><span className="checkbox-field"><input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />启用</span></Field>;
  if (spec.enum?.length) return <Field label={label} description={spec.description ?? undefined} error={error}><Select value={String(value)} onChange={(event) => onChange(event.target.value)}>{spec.enum.map((item) => <option key={String(item)} value={String(item)}>{String(item)}</option>)}</Select></Field>;
  return <Field label={label} description={spec.description ?? undefined} error={error}><Input type={['integer', 'number', 'float'].includes(spec.type) ? 'number' : 'text'} min={spec.minimum ?? undefined} max={spec.maximum ?? undefined} step={spec.type === 'integer' ? 1 : 'any'} value={String(value)} onChange={(event) => onChange(event.target.value)} /></Field>;
}

export function BacktestForm({ strategy, pending, onSubmit }: { strategy: Strategy; pending: boolean; onSubmit: (request: CreateBacktestTaskRequest) => void }) {
  const [model, setModel] = useState<BacktestFormModel>(() => createBacktestForm(strategy)); const [submitted, setSubmitted] = useState(false);
  const errors = submitted ? validateBacktestForm(model, strategy) : {};
  const patch = <K extends keyof BacktestFormModel>(key: K, value: BacktestFormModel[K]) => setModel((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => { event.preventDefault(); setSubmitted(true); const next = validateBacktestForm(model, strategy); if (Object.keys(next).length === 0) onSubmit(toCreateTaskRequest(model, strategy)); };
  return <form className="stack" onSubmit={submit} noValidate>
    <Panel><PanelHeader title="实验定义" meta={`${strategy.code} · ${strategy.version}`} /><PanelBody className="form-grid">
      <Field label="任务名称"><Input value={model.name} onChange={(e) => patch('name', e.target.value)} /></Field>
      <Field label="策略版本"><Input value={model.strategyVersion} readOnly /></Field>
      <Field label="开始日期" error={errors.startDate}><Input type="date" value={model.startDate} onChange={(e) => patch('startDate', e.target.value)} /></Field>
      <Field label="结束日期" error={errors.endDate}><Input type="date" value={model.endDate} onChange={(e) => patch('endDate', e.target.value)} /></Field>
      <Field label="基准"><Input value={model.benchmarkId} onChange={(e) => patch('benchmarkId', e.target.value)} placeholder="000300.SH" /></Field>
      <Field label="执行时点"><Select value={model.entryTiming} onChange={(e) => patch('entryTiming', e.target.value)}>{strategy.supported_entry_timings.map((value) => <option key={value}>{value}</option>)}</Select></Field>
    </PanelBody></Panel>
    <Panel><PanelHeader title="研究范围" meta="Universe 会进入结果可复现快照" /><PanelBody className="form-grid">
      <Field label="股票池方式"><Select value={model.universeMode} onChange={(e) => patch('universeMode', e.target.value)}>{strategy.supported_universe_modes.map((value) => <option key={value} value={value}>{value}</option>)}</Select></Field>
      {model.universeMode === 'tickers' ? <Field label="证券代码" description="逗号、空格或换行分隔" error={errors.tickers}><Input value={model.tickers} onChange={(e) => patch('tickers', e.target.value)} /></Field> : null}
      {model.universeMode === 'index_components' ? <Field label="指数代码" error={errors.indexCode}><Input value={model.indexCode} onChange={(e) => patch('indexCode', e.target.value)} /></Field> : null}
      {model.universeMode === 'preset' ? <Field label="股票池预设" error={errors.universePreset}><Input value={model.universePreset} onChange={(e) => patch('universePreset', e.target.value)} /></Field> : null}
    </PanelBody></Panel>
    {Object.keys(strategy.parameter_schema).length ? <Panel><PanelHeader title="策略参数" meta="参数来自后端策略契约" /><PanelBody className="form-grid">{Object.entries(strategy.parameter_schema).map(([name, spec]) => <ParameterInput key={name} name={name} spec={spec} value={model.params[name] ?? ''} error={errors[`param.${name}`]} onChange={(value) => patch('params', { ...model.params, [name]: value })} />)}</PanelBody></Panel> : null}
    <Panel><PanelHeader title="组合与交易成本" /><PanelBody className="form-grid">
      <Field label="初始资金" error={errors.initialCash}><Input type="number" value={model.initialCash} onChange={(e) => patch('initialCash', e.target.value)} /></Field>
      <Field label="最大持仓数" error={errors.maxPositions}><Input type="number" value={model.maxPositions} onChange={(e) => patch('maxPositions', e.target.value)} /></Field>
      <Field label="单票最大权重" error={errors.maxWeightPerSymbol}><Input type="number" step="0.01" value={model.maxWeightPerSymbol} onChange={(e) => patch('maxWeightPerSymbol', e.target.value)} /></Field>
      <Field label="佣金率" error={errors.commissionRate}><Input type="number" step="0.00001" value={model.commissionRate} onChange={(e) => patch('commissionRate', e.target.value)} /></Field>
      <Field label="印花税率" error={errors.stampTaxRate}><Input type="number" step="0.00001" value={model.stampTaxRate} onChange={(e) => patch('stampTaxRate', e.target.value)} /></Field>
      <Field label="滑点（bps）" error={errors.slippageBps}><Input type="number" value={model.slippageBps} onChange={(e) => patch('slippageBps', e.target.value)} /></Field>
    </PanelBody></Panel>
    <div className="form-submit"><div><strong>创建后由 QRP Atlas 后端执行真实回测</strong><span>不使用浏览器计算，也不会在失败时回退 Mock。</span></div><Button type="submit" variant="primary" size="lg" disabled={pending}><Play size={15} />{pending ? '正在创建并运行…' : '创建回测任务'}</Button></div>
  </form>;
}
