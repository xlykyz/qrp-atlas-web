import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BacktestForm } from '../components/BacktestForm';
import { useCreateTask, useStrategies, useStrategy } from '../hooks/queries';
import { ErrorState, LoadingState, PageHeader, Panel, PanelBody, PanelHeader, Select } from '@/shared/ui';

export function NewBacktestPage() { const navigate = useNavigate(); const [search, setSearch] = useSearchParams(); const catalog = useStrategies(); const requestedCode = search.get('strategy') ?? ''; const requestedVersion = search.get('version') ?? undefined;
  useEffect(() => { const first = catalog.data?.[0]; if (!requestedCode && first) setSearch({ strategy: first.code, version: first.version }, { replace: true }); }, [catalog.data, requestedCode, setSearch]);
  const strategy = useStrategy(requestedCode, requestedVersion); const create = useCreateTask();
  if (catalog.isLoading) return <LoadingState label="正在准备策略目录…" />; if (catalog.isError) return <ErrorState error={catalog.error} onRetry={() => void catalog.refetch()} />;
  return <div className="stack"><PageHeader eyebrow="回测实验室 / 新建" title="创建回测任务" description="配置来自后端策略契约；提交后由后端同步校验、执行并写入标准结果包。" />
    <Panel><PanelHeader title="策略选择" meta="切换策略会重置策略参数" /><PanelBody><div className="strategy-select-row"><Select aria-label="策略" value={requestedCode} onChange={(e) => { const item = catalog.data?.find((s) => s.code === e.target.value); if (item) setSearch({ strategy: item.code, version: item.version }); }}>{catalog.data?.map((item) => <option key={`${item.code}:${item.version}`} value={item.code}>{item.name} · {item.version}</option>)}</Select>{requestedCode ? <Link className="text-link" to={`/strategies/${requestedCode}?version=${requestedVersion ?? ''}`}>查看策略定义</Link> : null}</div></PanelBody></Panel>
    {strategy.isLoading ? <LoadingState label="正在读取策略参数契约…" /> : strategy.isError ? <ErrorState error={strategy.error} onRetry={() => void strategy.refetch()} /> : strategy.data ? <><BacktestForm key={`${strategy.data.code}:${strategy.data.version}`} strategy={strategy.data} pending={create.isPending} onSubmit={(request) => create.mutate(request, { onSuccess: ({ task }) => { void navigate(`/backtests/tasks/${task.task_id}`); } })} />{create.isError ? <ErrorState title="任务创建失败" error={create.error} /> : null}</> : null}
  </div>; }
