import { useEffect, useMemo } from 'react';
import { CalendarDays, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, ErrorState, LoadingState, PageHeader, StatusBadge } from '@/shared/ui';
import { todayKeys, useTodayWorkspace, useTradingDates } from '../hooks/queries';
import { ExtremeMovesPanel } from '../components/ExtremeMovesPanel';
import { FreshnessPanel } from '../components/FreshnessPanel';
import { IndexTapePanel } from '../components/IndexTapePanel';
import { MarketOverviewPanel } from '../components/MarketOverviewPanel';
import { ResearchFeedPanel } from '../components/ResearchFeedPanel';
import { WorkQueuePanel } from '../components/WorkQueuePanel';

export function TodayPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dates = useTradingDates();
  const requestedDate = searchParams.get('date');
  const selectedDate = requestedDate || dates.data?.[0] || null;
  const workspace = useTodayWorkspace(selectedDate);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!requestedDate && dates.data?.[0]) {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set('date', dates.data?.[0] ?? '');
        return next;
      }, { replace: true });
    }
  }, [dates.data, requestedDate, setSearchParams]);

  const marketError = workspace.daily.error ?? workspace.limitUps.error ?? workspace.limitDowns.error ?? workspace.phase.error;
  const evidenceError = workspace.reports.error ?? workspace.visits.error;
  const systemError = workspace.health.error ?? workspace.stats.error;
  const phase = workspace.phase.data?.[0];
  const lastUpdated = useMemo(() => {
    const values = [workspace.daily.dataUpdatedAt, workspace.indexes.dataUpdatedAt, workspace.stats.dataUpdatedAt].filter((value) => value > 0);
    if (values.length === 0) return null;
    return new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date(Math.max(...values)));
  }, [workspace.daily.dataUpdatedAt, workspace.indexes.dataUpdatedAt, workspace.stats.dataUpdatedAt]);

  if (dates.isLoading && !selectedDate) return <LoadingState label="正在确认最新有效交易日…" />;
  if (dates.isError && !selectedDate) return <ErrorState error={dates.error} onRetry={() => void dates.refetch()} title="无法确认交易日" />;
  if (!selectedDate) return <ErrorState error={new Error('后端没有返回可用交易日')} onRetry={() => void dates.refetch()} title="没有可用交易日" />;

  const setDate = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('date', value);
    setSearchParams(next);
  };
  const refresh = () => void queryClient.invalidateQueries({ queryKey: todayKeys.all });

  return <div className="stack today-page">
    <PageHeader eyebrow="每日启动" title="今日工作台" description="先确认市场事实、数据新鲜度与待处理任务，再带着交易日上下文进入复盘和研究。" meta={<><StatusBadge tone="success">真实 API</StatusBadge><span>研究日 {selectedDate}</span><span>最后刷新 {lastUpdated ?? '尚未完成'}</span></>} actions={<>
      <label className="date-control"><CalendarDays size={14} /><span>交易日</span><select className="select" value={selectedDate} onChange={(event) => setDate(event.target.value)} aria-label="选择交易日">{(dates.data ?? [selectedDate]).map((date) => <option key={date} value={date}>{date}</option>)}</select></label>
      <Button onClick={refresh}><RefreshCw size={14} />刷新</Button>
      <Link className="button button--primary button--md" to={`/review/market?date=${selectedDate}`}>开始复盘</Link>
    </>} />
    <div className="today-context-line"><strong>{selectedDate === dates.data?.[0] ? '最新有效交易日' : '历史研究日'}</strong><span>页面中的市场、极端状态与下钻链接均固定到该日期。</span><span className="toolbar__spacer">URL 已保留 <code>?date={selectedDate}</code></span></div>
    <MarketOverviewPanel date={selectedDate} rows={workspace.daily.data} phase={phase} limitUpCount={workspace.limitUps.data?.length} limitDownCount={workspace.limitDowns.data?.length} isLoading={workspace.daily.isLoading || workspace.limitUps.isLoading || workspace.limitDowns.isLoading || workspace.phase.isLoading} error={marketError} onRetry={() => { void workspace.daily.refetch(); void workspace.limitUps.refetch(); void workspace.limitDowns.refetch(); void workspace.phase.refetch(); }} />
    <div className="grid grid--main-aside today-primary-grid">
      <div className="stack">
        <IndexTapePanel rows={workspace.indexes.data} selectedDate={selectedDate} isLoading={workspace.indexes.isLoading} error={workspace.indexes.error} onRetry={() => void workspace.indexes.refetch()} />
        <ExtremeMovesPanel date={selectedDate} limitUps={workspace.limitUps.data} limitDowns={workspace.limitDowns.data} isLoading={workspace.limitUps.isLoading || workspace.limitDowns.isLoading} error={workspace.limitUps.error ?? workspace.limitDowns.error} onRetry={() => { void workspace.limitUps.refetch(); void workspace.limitDowns.refetch(); }} />
        <ResearchFeedPanel reports={workspace.reports.data} visits={workspace.visits.data} isLoading={workspace.reports.isLoading || workspace.visits.isLoading} error={evidenceError} onRetry={() => { void workspace.reports.refetch(); void workspace.visits.refetch(); }} />
      </div>
      <aside className="stack">
        <WorkQueuePanel date={selectedDate} tasks={workspace.tasks.data} isLoading={workspace.tasks.isLoading} error={workspace.tasks.error} onRetry={() => void workspace.tasks.refetch()} />
        <FreshnessPanel date={selectedDate} health={workspace.health.data} stats={workspace.stats.data} isLoading={workspace.health.isLoading || workspace.stats.isLoading} error={systemError} onRetry={() => { void workspace.health.refetch(); void workspace.stats.refetch(); }} />
      </aside>
    </div>
  </div>;
}
