import { useMemo } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, PageHeader, StatusBadge } from '@/shared/ui';
import { ContractDiagnosticsPanel } from '../components/ContractDiagnosticsPanel';
import { DataCoveragePanel } from '../components/DataCoveragePanel';
import { OperationsJobsPanel } from '../components/OperationsJobsPanel';
import { OperationsOverview } from '../components/OperationsOverview';
import { operationsKeys, useOperationsData } from '../hooks/queries';

type OperationsTab = 'overview' | 'data' | 'jobs' | 'diagnostics';
const tabs: Array<{ id: OperationsTab; label: string }> = [{ id: 'overview', label: '系统概览' }, { id: 'data', label: '数据覆盖' }, { id: 'jobs', label: '运行任务' }, { id: 'diagnostics', label: '契约诊断' }];

export function OperationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabValue = searchParams.get('tab');
  const tab: OperationsTab = tabValue === 'data' || tabValue === 'jobs' || tabValue === 'diagnostics' ? tabValue : 'overview';
  const query = searchParams.get('query') ?? '';
  const state = searchParams.get('state') ?? '';
  const operations = useOperationsData();
  const queryClient = useQueryClient();
  const error = operations.health.error ?? operations.stats.error ?? operations.openapi.error;
  const lastUpdated = useMemo(() => {
    const values = [operations.health.dataUpdatedAt, operations.stats.dataUpdatedAt, operations.openapi.dataUpdatedAt].filter((value) => value > 0);
    return values.length ? new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date(Math.max(...values))) : null;
  }, [operations.health.dataUpdatedAt, operations.openapi.dataUpdatedAt, operations.stats.dataUpdatedAt]);

  const update = (key: 'tab' | 'query' | 'state', value: string) => setSearchParams((current) => { const next = new URLSearchParams(current); if (value && !(key === 'tab' && value === 'overview')) next.set(key, value); else next.delete(key); return next; });
  const tabHref = (value: OperationsTab) => { const next = new URLSearchParams(searchParams); if (value === 'overview') next.delete('tab'); else next.set('tab', value); if (value !== 'data') { next.delete('query'); next.delete('state'); } return `?${next.toString()}`; };
  const refresh = () => void queryClient.invalidateQueries({ queryKey: operationsKeys.all });

  return <div className="stack operations-page">
    <PageHeader eyebrow="研究可信度" title="系统运行与诊断" description="判断研究异常来自市场事实、数据覆盖、后端契约还是任务运行，而不是把原始数据库工具当作主产品。" meta={<><StatusBadge tone={operations.health.data?.status === 'ok' ? 'success' : operations.health.isError ? 'danger' : 'info'}>{operations.health.isError ? 'API 异常' : operations.health.data?.status === 'ok' ? 'API 正常' : '检查中'}</StatusBadge><span>运行时 OpenAPI {operations.openapi.data?.info.version ?? '未知'}</span><span>最后刷新 {lastUpdated ?? '尚未完成'}</span></>} actions={<Button onClick={refresh}><RefreshCw size={14} />刷新全部</Button>} />
    <nav className="tabs" aria-label="系统诊断内容">{tabs.map((item) => <Link key={item.id} to={tabHref(item.id)} className={tab === item.id ? 'active' : ''}>{item.label}</Link>)}</nav>
    {tab === 'data' ? <div className="operations-filterbar"><label className="market-search"><Search size={14} /><input value={query} onChange={(event) => update('query', event.target.value)} placeholder="搜索数据集" aria-label="搜索数据集" /></label><select className="select" value={state} onChange={(event) => update('state', event.target.value)} aria-label="筛选新鲜度"><option value="">全部状态</option><option value="current">当前</option><option value="lagging">滞后</option><option value="empty">空表</option><option value="ahead">前瞻</option><option value="unknown">未知</option></select><span>过滤条件由 URL 保存</span></div> : null}
    {tab === 'overview' ? <OperationsOverview health={operations.health.data} stats={operations.stats.data} openapi={operations.openapi.data} isLoading={operations.health.isLoading || operations.stats.isLoading || operations.openapi.isLoading} error={error} onRetry={() => { void operations.health.refetch(); void operations.stats.refetch(); void operations.openapi.refetch(); }} /> : null}
    {tab === 'data' ? <DataCoveragePanel stats={operations.stats.data} query={query} state={state} isLoading={operations.stats.isLoading} error={operations.stats.error} onRetry={() => void operations.stats.refetch()} /> : null}
    {tab === 'jobs' ? <OperationsJobsPanel openapi={operations.openapi.data} /> : null}
    {tab === 'diagnostics' ? <ContractDiagnosticsPanel openapi={operations.openapi.data} isLoading={operations.openapi.isLoading} error={operations.openapi.error} onRetry={() => void operations.openapi.refetch()} /> : null}
  </div>;
}
