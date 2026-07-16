import { useMemo } from 'react';
import { X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, EmptyState, ErrorState, LoadingState, PageHeader, Panel, PanelBody, PanelHeader, StatusBadge } from '@/shared/ui';
import { formatNumber, formatPercent } from '@/shared/lib/format';
import { buildCompareSearch, parseCompareRunIds } from '../lib/compare';
import { useRunCompare, useRuns } from '../hooks/queries';
import type { BacktestSummary } from '../types/models';

const metrics: { key: keyof BacktestSummary; label: string; format: (value: number | null) => string }[] = [
 { key: 'total_return_pct', label: '累计收益', format: formatPercent }, { key: 'annual_return_pct', label: '年化收益', format: formatPercent },
 { key: 'max_drawdown_pct', label: '最大回撤', format: formatPercent }, { key: 'sharpe', label: 'Sharpe', format: formatNumber },
 { key: 'sortino', label: 'Sortino', format: formatNumber }, { key: 'calmar', label: 'Calmar', format: formatNumber },
 { key: 'win_rate_pct', label: '胜率', format: formatPercent }, { key: 'profit_loss_ratio', label: '盈亏比', format: formatNumber },
 { key: 'trade_count', label: '交易次数', format: (v) => formatNumber(v, 0) }, { key: 'total_cost', label: '总成本', format: formatNumber },
];
export function ComparePage() { const navigate = useNavigate(); const [search] = useSearchParams(); const selected = useMemo(() => parseCompareRunIds(search.toString()), [search]); const runs = useRuns(); const compare = useRunCompare(selected);
 const setIds = (ids: string[]) => { void navigate(`/backtests/compare?${buildCompareSearch(ids)}`, { replace: true }); }; const toggle = (id: string) => setIds(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id].slice(0, 6));
 return <div className="stack"><PageHeader eyebrow="回测实验室" title="结果比较" description="最多选择 6 个标准结果，在相同指标定义下比较绩效与运行配置。" meta={<span className="inline">已选择 <strong>{selected.length}</strong> / 6{selected.length < 2 ? <StatusBadge tone="warning">至少选择 2 个</StatusBadge> : <StatusBadge tone="success">可比较</StatusBadge>}</span>} />
 <Panel><PanelHeader title="选择结果" meta="选择状态保存在 URL，可直接分享或恢复" /><PanelBody>{runs.isLoading ? <LoadingState /> : runs.isError ? <ErrorState error={runs.error} onRetry={() => void runs.refetch()} /> : !runs.data?.length ? <EmptyState title="没有可比较的结果" /> : <div className="run-picker">{runs.data.map((run) => <label key={run.run_id} className={selected.includes(run.run_id) ? 'selected' : ''}><input type="checkbox" checked={selected.includes(run.run_id)} disabled={!selected.includes(run.run_id) && selected.length >= 6} onChange={() => toggle(run.run_id)} /><span><strong>{run.name}</strong><small>{run.strategy_name} · {run.start_date}—{run.end_date}</small><code>{run.run_id}</code></span></label>)}</div>}</PanelBody></Panel>
 {selected.length < 2 ? <EmptyState title="再选择至少一个结果" description="比较只使用后端 /api/backtest/compare 的标准口径，不在前端重新计算指标。" /> : compare.isLoading ? <LoadingState label="正在读取比较结果…" /> : compare.isError ? <ErrorState error={compare.error} onRetry={() => void compare.refetch()} /> : compare.data ? <><Panel><PanelHeader title="指标横向比较" meta={`${compare.data.runs.length} 个已加载结果`} /><PanelBody className="panel__body--flush"><div className="data-table-wrap"><table className="data-table compare-table"><thead><tr><th>指标</th>{compare.data.runs.map((run) => <th key={run.run_id}><Link className="table-link" to={`/backtests/runs/${run.run_id}`}>{run.name}</Link><div className="table-subtitle">{run.strategy_name}</div></th>)}</tr></thead><tbody>{metrics.map((metric) => <tr key={metric.key}><td>{metric.label}</td>{compare.data.summaries.map((summary) => { const raw = summary[metric.key]; const value = typeof raw === 'number' ? raw : null; return <td className="numeric" key={summary.run_id}>{metric.format(value)}</td>; })}</tr>)}</tbody></table></div></PanelBody></Panel>
 <Panel><PanelHeader title="配置快照" meta="识别策略参数、Universe、成本和执行方式差异" /><PanelBody><div className="config-compare">{compare.data.configs.map((config) => <article key={config.run_id}><header><code>{config.run_id}</code><Button variant="ghost" size="sm" onClick={() => toggle(config.run_id)} aria-label="移出比较"><X size={13} /></Button></header><pre className="code-block">{JSON.stringify(config.config, null, 2)}</pre></article>)}</div>{compare.data.missing.length ? <p className="warning-text">缺失结果：{compare.data.missing.join('、')}</p> : null}</PanelBody></Panel></> : null}
 </div>; }
