import { useEffect, useMemo } from 'react';
import { CalendarDays, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, ErrorState, LoadingState, PageHeader, StatusBadge } from '@/shared/ui';
import { LimitPoolPanel } from '../components/LimitPoolPanel';
import { MarketPulsePanel } from '../components/MarketPulsePanel';
import { MarketStructurePanel } from '../components/MarketStructurePanel';
import { PhaseEditorPanel } from '../components/PhaseEditorPanel';
import { marketReviewKeys, useMarketReview, useMarketReviewDates } from '../hooks/queries';

type Pool = 'all' | 'up' | 'down';

export function MarketReviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dates = useMarketReviewDates();
  const requestedDate = searchParams.get('date');
  const selectedDate = requestedDate || dates.data?.[0] || null;
  const review = useMarketReview(selectedDate);
  const queryClient = useQueryClient();
  const poolValue = searchParams.get('pool');
  const pool: Pool = poolValue === 'up' || poolValue === 'down' ? poolValue : 'all';
  const industry = searchParams.get('industry') ?? '';
  const query = searchParams.get('q') ?? '';

  useEffect(() => {
    if (!requestedDate && dates.data?.[0]) setSearchParams((current) => { const next = new URLSearchParams(current); next.set('date', dates.data?.[0] ?? ''); return next; }, { replace: true });
  }, [dates.data, requestedDate, setSearchParams]);

  const lastUpdated = useMemo(() => {
    const values = [review.daily.dataUpdatedAt, review.indexes.dataUpdatedAt, review.limitUps.dataUpdatedAt, review.limitDowns.dataUpdatedAt].filter((value) => value > 0);
    return values.length ? new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date(Math.max(...values))) : null;
  }, [review.daily.dataUpdatedAt, review.indexes.dataUpdatedAt, review.limitDowns.dataUpdatedAt, review.limitUps.dataUpdatedAt]);

  if (dates.isLoading && !selectedDate) return <LoadingState label="正在确认复盘交易日..." />;
  if (dates.isError && !selectedDate) return <ErrorState error={dates.error} onRetry={() => void dates.refetch()} title="无法确认交易日" />;
  if (!selectedDate) return <ErrorState error={new Error('后端没有返回可用交易日')} onRetry={() => void dates.refetch()} title="没有可用交易日" />;

  const updateFilter = (key: 'date' | 'pool' | 'industry' | 'q', value: string) => setSearchParams((current) => { const next = new URLSearchParams(current); if (value && !(key === 'pool' && value === 'all')) next.set(key, value); else next.delete(key); return next; });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: marketReviewKeys.all });
  const marketError = review.daily.error ?? review.indexes.error ?? review.limitUps.error ?? review.limitDowns.error;

  return <div className="stack market-review-page">
    <PageHeader eyebrow="盘后工作流" title="市场复盘" description="在固定交易日中核对市场广度、指数、强弱结构与极端池，并保存明确标识的人工阶段判断。" meta={<><StatusBadge tone="success">真实 API</StatusBadge><span>交易日 {selectedDate}</span><span>最后刷新 {lastUpdated ?? '尚未完成'}</span></>} actions={<>
      <label className="date-control"><CalendarDays size={14} /><span>交易日</span><select className="select" value={selectedDate} onChange={(event) => updateFilter('date', event.target.value)} aria-label="选择复盘交易日">{(dates.data ?? [selectedDate]).map((date) => <option key={date} value={date}>{date}</option>)}</select></label>
      <Button onClick={refresh}><RefreshCw size={14} />刷新</Button>
      <Link className="button button--primary button--md" to={`/research/stocks?date=${selectedDate}`}>进入个股研究</Link>
    </>} />
    <div className="today-context-line"><strong>{selectedDate === dates.data?.[0] ? '最新有效交易日' : '历史复盘'}</strong><span>市场事实、人工判断与所有个股下钻均锁定到 {selectedDate}。</span><span className="toolbar__spacer">筛选条件由 URL 保存</span></div>
    <MarketPulsePanel date={selectedDate} daily={review.daily.data} indexes={review.indexes.data} limitUpCount={review.limitUps.data?.length} limitDownCount={review.limitDowns.data?.length} isLoading={review.daily.isLoading || review.indexes.isLoading || review.limitUps.isLoading || review.limitDowns.isLoading} error={marketError} onRetry={() => { void review.daily.refetch(); void review.indexes.refetch(); void review.limitUps.refetch(); void review.limitDowns.refetch(); }} />
    <div className="grid grid--main-aside market-review-workspace"><div className="stack">
      <MarketStructurePanel date={selectedDate} daily={review.daily.data} limitUps={review.limitUps.data} limitDowns={review.limitDowns.data} isLoading={review.daily.isLoading || review.limitUps.isLoading || review.limitDowns.isLoading} error={review.daily.error ?? review.limitUps.error ?? review.limitDowns.error} onRetry={() => { void review.daily.refetch(); void review.limitUps.refetch(); void review.limitDowns.refetch(); }} onIndustrySelect={(value) => updateFilter('industry', value)} />
    </div><aside className="stack"><PhaseEditorPanel date={selectedDate} value={review.phase.data?.[0]} isLoading={review.phase.isLoading} error={review.phase.error} onRetry={() => void review.phase.refetch()} /></aside></div>
    <LimitPoolPanel date={selectedDate} limitUps={review.limitUps.data} limitDowns={review.limitDowns.data} pool={pool} industry={industry} query={query} isLoading={review.limitUps.isLoading || review.limitDowns.isLoading} error={review.limitUps.error ?? review.limitDowns.error} onRetry={() => { void review.limitUps.refetch(); void review.limitDowns.refetch(); }} onFilterChange={updateFilter} />
  </div>;
}
