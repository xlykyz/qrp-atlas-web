import { AlertTriangle, CheckCircle2, Database, Server } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState, Metric, MetricStrip, Panel, PanelBody, PanelHeader, StatusBadge } from '@/shared/ui';
import { formatBytes, formatNumber } from '@/shared/lib/format';
import { databaseLabel, deriveContractStatuses, deriveDatasetStatuses } from '../lib/deriveOperations';
import type { HealthResponse, OpenApiDocument, StatsResponse } from '../types/models';

export function OperationsOverview({ health, stats, openapi, isLoading, error, onRetry }: { health: HealthResponse | undefined; stats: StatsResponse | undefined; openapi: OpenApiDocument | undefined; isLoading: boolean; error: unknown; onRetry: () => void }) {
  if (isLoading && !health && !stats) return <LoadingState label="正在检查服务与数据覆盖..." />;
  if (error && !health && !stats) return <ErrorState error={error} onRetry={onRetry} title="无法读取系统状态" />;
  if (!health || !stats) return <EmptyState title="系统状态响应不完整" description="健康或统计接口没有返回可用数据。" />;
  const datasets = deriveDatasetStatuses(stats);
  const contracts = deriveContractStatuses(Object.keys(openapi?.paths ?? {}));
  const missingRequired = contracts.filter((item) => item.priority === 'required' && !item.deployed);
  const lagging = datasets.rows.filter((row) => row.state === 'lagging');
  const empty = datasets.rows.filter((row) => row.state === 'empty');
  const critical = datasets.rows.filter((row) => ['daily_market_snapshot', 'index_daily', 'zt_pool', 'dt_pool', 'research_report_stock', 'cninfo_research_visits'].includes(row.key));
  return <div className="stack">
    {error ? <div className="inline-notice inline-notice--warning"><div><strong>系统状态仅部分可用</strong><span>页面保留成功响应，失败来源不会被解释为正常。</span></div></div> : null}
    <MetricStrip><Metric label="API 状态" value={health.status.toUpperCase()} tone={health.status === 'ok' ? 'default' : 'warning'} meta={`${health.tables.length} 张已连接表`} /><Metric label="数据库" value={formatBytes(stats.size_bytes)} meta={databaseLabel(stats.database)} /><Metric label="数据参考日" value={datasets.referenceDate ?? '—'} meta="全市场日行情 watermark" /><Metric label="数据集" value={formatNumber(datasets.rows.length, 0)} meta={`${lagging.length} 超出临时阈值 · ${empty.length} 空表`} /><Metric label="运行契约" value={`${contracts.filter((item) => item.deployed).length}/${contracts.length}`} tone={missingRequired.length ? 'warning' : 'default'} meta={`${missingRequired.length} 个必需契约未部署`} /><Metric label="OpenAPI" value={openapi?.info.version ?? '未知'} meta={`${Object.keys(openapi?.paths ?? {}).length} 个 runtime paths`} /></MetricStrip>
    <div className="grid grid--main-aside"><Panel><PanelHeader title="关键数据就绪度" meta={`相对参考日 ${datasets.referenceDate ?? '未知'} · 前端临时诊断阈值`} /><PanelBody><div className="readiness-list">{critical.map((item) => <div key={item.key}><span className={`readiness-icon readiness-icon--${item.state}`}>{item.state === 'current' || item.state === 'ahead' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}</span><span><strong>{item.label}</strong><small>{item.key}</small></span><code>{item.latestDate ?? '无日期'}</code><StatusBadge tone={item.state === 'current' || item.state === 'ahead' ? 'success' : item.state === 'empty' ? 'neutral' : 'warning'}>{item.state === 'current' ? '当前' : item.state === 'ahead' ? '前瞻' : item.state === 'empty' ? '空表' : '滞后'}</StatusBadge></div>)}</div></PanelBody></Panel><Panel><PanelHeader title="诊断结论" meta="面向研究可信度" /><PanelBody><div className="diagnostic-summary"><div><Server size={16} /><span><strong>服务与数据库连通</strong><small>health={health.status}</small></span></div><div><Database size={16} /><span><strong>{lagging.length ? `${lagging.length} 个数据集超过临时阈值` : '临时阈值下未发现时效超限'}</strong><small>{empty.length} 个空表需结合业务预期判断；正式 SLA 待后端契约</small></span></div><div><AlertTriangle size={16} /><span><strong>{missingRequired.length} 个正式页面必需契约未部署</strong><small>{missingRequired.map((item) => item.label).join('、') || '无'}</small></span></div></div></PanelBody></Panel></div>
  </div>;
}
