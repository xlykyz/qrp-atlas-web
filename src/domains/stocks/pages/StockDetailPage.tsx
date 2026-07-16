import { useEffect, useMemo } from 'react';
import { ArrowLeft, CalendarDays, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Button, CapabilityUnavailable, EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '@/shared/ui';
import { ResearchEvidencePanel } from '../components/ResearchEvidencePanel';
import { StockMetrics, StockOverviewPanel } from '../components/StockOverviewPanel';
import { TradeJournalPanel } from '../components/TradeJournalPanel';
import { stockKeys, useStock, useStockDates, useStockDetailData } from '../hooks/queries';
import type { Adjustment, PriceRange, StockTab } from '../types/models';

const tabs: Array<{ id: StockTab; label: string }> = [{ id: 'overview', label: '概览与价格' }, { id: 'research', label: '研报与调研' }, { id: 'trades', label: '交易记录' }, { id: 'notes', label: '研究记录' }];
const adjustments: Array<{ id: Adjustment; label: string }> = [{ id: 'raw', label: '不复权' }, { id: 'qfq', label: '前复权' }, { id: 'hfq', label: '后复权' }];
const ranges: Array<{ id: PriceRange; label: string }> = [{ id: '3m', label: '3 月' }, { id: '6m', label: '6 月' }, { id: '1y', label: '1 年' }, { id: '3y', label: '3 年' }];

export function StockDetailPage() {
  const { ticker = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const stock = useStock(ticker);
  const dates = useStockDates();
  const requestedDate = searchParams.get('date');
  const selectedDate = requestedDate || dates.data?.[0] || null;
  const adjustmentValue = searchParams.get('adjustment');
  const adjustment: Adjustment = adjustmentValue === 'raw' || adjustmentValue === 'hfq' ? adjustmentValue : 'qfq';
  const rangeValue = searchParams.get('range');
  const range: PriceRange = rangeValue === '3m' || rangeValue === '6m' || rangeValue === '3y' ? rangeValue : '1y';
  const tabValue = searchParams.get('tab');
  const tab: StockTab = tabValue === 'research' || tabValue === 'trades' || tabValue === 'notes' ? tabValue : 'overview';
  const data = useStockDetailData(stock.data?.ticker, selectedDate, range, adjustment);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!requestedDate && dates.data?.[0]) setSearchParams((current) => { const next = new URLSearchParams(current); next.set('date', dates.data?.[0] ?? ''); return next; }, { replace: true });
  }, [dates.data, requestedDate, setSearchParams]);

  const lastUpdated = useMemo(() => {
    const values = [data.daily.dataUpdatedAt, data.reports.dataUpdatedAt, data.visits.dataUpdatedAt, data.trades.dataUpdatedAt].filter((value) => value > 0);
    return values.length ? new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date(Math.max(...values))) : null;
  }, [data.daily.dataUpdatedAt, data.reports.dataUpdatedAt, data.trades.dataUpdatedAt, data.visits.dataUpdatedAt]);

  if (stock.isLoading) return <LoadingState label="正在读取证券主数据..." />;
  if (stock.isError) return <ErrorState error={stock.error} onRetry={() => void stock.refetch()} title="无法打开股票" />;
  if (!stock.data) return <EmptyState title="股票不存在" description="后端未返回该证券主数据。" />;
  if (dates.isLoading && !selectedDate) return <LoadingState label="正在确认研究交易日..." />;
  if (!selectedDate) return <ErrorState error={dates.error ?? new Error('没有可用交易日')} onRetry={() => void dates.refetch()} title="无法确认研究日期" />;

  const update = (key: 'date' | 'adjustment' | 'range' | 'tab', value: string) => setSearchParams((current) => { const next = new URLSearchParams(current); next.set(key, value); return next; });
  const tabHref = (value: StockTab) => { const next = new URLSearchParams(searchParams); next.set('date', selectedDate); next.set('adjustment', adjustment); next.set('range', range); next.set('tab', value); return `?${next.toString()}`; };
  const refresh = () => void queryClient.invalidateQueries({ queryKey: stockKeys.all });

  return <div className="stack stock-detail-page">
    <PageHeader eyebrow="个股研究对象" title={stock.data.name ?? stock.data.ticker} description={`${stock.data.ticker} · ${stock.data.exchange ?? '交易所未知'} · ${stock.data.market ?? '市场未知'}`} meta={<><StatusBadge tone={stock.data.is_active ? 'success' : 'neutral'}>{stock.data.is_active ? '在市' : '非在市'}</StatusBadge><span>as-of {selectedDate}</span><span>最后刷新 {lastUpdated ?? '尚未完成'}</span></>} actions={<><Link className="button button--secondary button--md" to={`/research/stocks?date=${selectedDate}`}><ArrowLeft size={14} />返回股票列表</Link><Button onClick={refresh}><RefreshCw size={14} />刷新</Button></>} />
    <div className="stock-context-toolbar"><label className="date-control"><CalendarDays size={14} /><span>as-of</span><select className="select" value={selectedDate} onChange={(event) => update('date', event.target.value)} aria-label="选择个股研究交易日">{(dates.data ?? [selectedDate]).map((date) => <option key={date} value={date}>{date}</option>)}</select></label><div className="stock-context-group"><span>复权</span><div className="segmented-control">{adjustments.map((item) => <button type="button" key={item.id} className={adjustment === item.id ? 'active' : ''} onClick={() => update('adjustment', item.id)}>{item.label}</button>)}</div></div><div className="stock-context-group"><span>窗口</span><div className="segmented-control">{ranges.map((item) => <button type="button" key={item.id} className={range === item.id ? 'active' : ''} onClick={() => update('range', item.id)}>{item.label}</button>)}</div></div><span className="stock-context-note">价格口径与窗口均由 URL 恢复；研报、调研只读取不晚于 as-of 的记录。</span></div>
    {data.daily.isLoading && !data.daily.data ? <LoadingState label="正在读取行情摘要..." /> : data.daily.isError && !data.daily.data ? <ErrorState error={data.daily.error} onRetry={() => void data.daily.refetch()} title="无法读取价格行情" /> : data.daily.data?.length ? <StockMetrics rows={data.daily.data} range={range} /> : <EmptyState title="当前窗口没有有效行情" description="对象主数据仍可查看，尝试切换日期、窗口或复权口径。" />}
    <nav className="tabs" aria-label="个股研究内容">{tabs.map((item) => <Link key={item.id} to={tabHref(item.id)} className={tab === item.id ? 'active' : ''}>{item.label}{item.id === 'research' ? <small>{(data.reports.data?.length ?? 0) + (data.visits.data?.length ?? 0)}</small> : item.id === 'trades' ? <small>{data.trades.data?.length ?? 0}</small> : null}</Link>)}</nav>
    {tab === 'overview' ? <StockOverviewPanel stock={stock.data} rows={data.daily.data} range={range} adjustment={adjustment} isLoading={data.daily.isLoading} error={data.daily.error} onRetry={() => void data.daily.refetch()} /> : null}
    {tab === 'research' ? <ResearchEvidencePanel reports={data.reports.data} visits={data.visits.data} isLoading={data.reports.isLoading || data.visits.isLoading} error={data.reports.error ?? data.visits.error} onRetry={() => { void data.reports.refetch(); void data.visits.refetch(); }} /> : null}
    {tab === 'trades' ? <TradeJournalPanel ticker={stock.data.ticker} date={selectedDate} rows={data.trades.data} isLoading={data.trades.isLoading} error={data.trades.error} onRetry={() => void data.trades.refetch()} /> : null}
    {tab === 'notes' ? <CapabilityUnavailable title="通用研究记录尚未接入" contract="GET/POST /api/research/notes?object_type=stock&object_id={ticker}" /> : null}
  </div>;
}
