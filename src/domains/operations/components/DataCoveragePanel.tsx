import { EmptyState, ErrorState, LoadingState, Panel, PanelBody, PanelHeader, StatusBadge } from '@/shared/ui';
import { formatNumber } from '@/shared/lib/format';
import { deriveDatasetStatuses } from '../lib/deriveOperations';
import type { FreshnessState, StatsResponse } from '../types/models';

const groupNames = { market: '市场', research: '研究', fundamental: '财务', reference: '参考', user: '用户记录' } as const;
const stateNames: Record<FreshnessState, string> = { current: '当前', lagging: '滞后', empty: '空表', ahead: '前瞻', unknown: '未知' };
const stateTones = { current: 'success', lagging: 'warning', empty: 'neutral', ahead: 'info', unknown: 'neutral' } as const;

export function DataCoveragePanel({ stats, query, state, isLoading, error, onRetry }: { stats: StatsResponse | undefined; query: string; state: string; isLoading: boolean; error: unknown; onRetry: () => void }) {
  if (isLoading && !stats) return <LoadingState label="正在读取数据集覆盖..." />;
  if (error && !stats) return <ErrorState error={error} onRetry={onRetry} />;
  if (!stats) return <EmptyState title="没有数据集统计" />;
  const result = deriveDatasetStatuses(stats);
  const normalized = query.trim().toLocaleLowerCase('zh-CN');
  const rows = result.rows.filter((item) => (!state || item.state === state) && (!normalized || `${item.label} ${item.key}`.toLocaleLowerCase('zh-CN').includes(normalized)));
  return <Panel><PanelHeader title="数据覆盖与新鲜度" meta={`参考日 ${result.referenceDate ?? '未知'} · 显示 ${rows.length}/${result.rows.length} · 容忍值为前端临时诊断口径`} /><PanelBody className="panel__body--flush">{error ? <div className="market-partial-notice"><span><strong>刷新失败</strong> 当前表格保留上次成功统计。</span></div> : null}{rows.length === 0 ? <EmptyState title="当前筛选没有数据集" /> : <div className="data-table-wrap operations-data-table"><table className="data-table"><thead><tr><th>数据集</th><th>域</th><th className="numeric">行数</th><th>最早日期</th><th>最近日期</th><th className="numeric">相对参考日</th><th>临时容忍</th><th>状态</th></tr></thead><tbody>{rows.map((item) => <tr key={item.key}><td><strong>{item.label}</strong><div className="table-subtitle">{item.key}</div></td><td>{groupNames[item.group]}</td><td className="numeric">{formatNumber(item.rows, 0)}</td><td>{item.earliestDate ?? '—'}</td><td>{item.latestDate ?? '—'}</td><td className="numeric">{item.lagDays === null ? '—' : item.lagDays < 0 ? `领先 ${Math.abs(item.lagDays)} 天` : `${item.lagDays} 天`}</td><td>{item.expectedLagDays === null ? '不适用' : `≤ ${item.expectedLagDays} 天`}</td><td><StatusBadge tone={stateTones[item.state]}>{stateNames[item.state]}</StatusBadge></td></tr>)}</tbody></table></div>}</PanelBody></Panel>;
}
