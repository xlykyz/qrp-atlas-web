import { useEffect } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, ContractDriftState, ErrorState, LoadingState, PageHeader, Panel, PanelBody, PanelHeader, StatusBadge } from '@/shared/ui';
import { StockListTable } from '../components/StockListTable';
import { useStockDates, useStockList } from '../hooks/queries';

const PAGE_SIZE = 100;

export function StocksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dates = useStockDates();
  const requestedDate = searchParams.get('date');
  const selectedDate = requestedDate || dates.data?.dates[0] || null;
  const keyword = searchParams.get('query') ?? '';
  const exchange = searchParams.get('exchange') ?? '';
  const active = searchParams.get('active') ?? 'true';
  const rawPage = Number(searchParams.get('page') ?? '0');
  const page = Number.isInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
  const stocks = useStockList({ keyword, exchange, active, page, limit: PAGE_SIZE });

  useEffect(() => {
    if (!requestedDate && dates.data?.dates[0]) setSearchParams((current) => { const next = new URLSearchParams(current); next.set('date', dates.data?.dates[0] ?? ''); return next; }, { replace: true });
  }, [dates.data, requestedDate, setSearchParams]);

  if (dates.isLoading && !selectedDate) return <LoadingState label="正在确认研究交易日..." />;
  if (dates.isError && !selectedDate) return <ErrorState error={dates.error} onRetry={() => void dates.refetch()} title="无法确认交易日" />;
  if (!selectedDate) return <ErrorState error={new Error('后端没有返回可用交易日')} title="没有可用交易日" />;

  const update = (key: 'date' | 'query' | 'exchange' | 'active' | 'page', value: string) => setSearchParams((current) => {
    const next = new URLSearchParams(current);
    if (value && !(key === 'active' && value === 'true') && !(key === 'page' && value === '0')) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    return next;
  });

  return <div className="stack stock-list-page">
    <PageHeader eyebrow="对象发现" title="个股研究" description="从股票主数据定位研究对象，并将交易日上下文带入价格、证据、交易和研究记录。" meta={<><StatusBadge tone="success">真实 API</StatusBadge><span>研究日 {selectedDate}</span><span>第 {page + 1} 页</span></>} actions={<><Link className="button button--secondary button--md" to="/research/notes">研究记录</Link><Link className="button button--secondary button--md" to={`/review/market?date=${selectedDate}`}>返回市场复盘</Link></>} />
    {dates.data?.rejectedCalendarDates.length ? <ContractDriftState title="交易日契约已校正" detail={<>后端日历返回了没有市场快照覆盖的日期 <code>{dates.data.rejectedCalendarDates.join('、')}</code>；页面已按 <code>daily_market_snapshot</code> 水位 {dates.data.marketWatermark ?? '未知'} 排除，并保留此告警。</>} /> : null}
    <Panel><PanelHeader title="股票筛选" meta="代码、名称、交易所与在市状态由后端过滤" /><PanelBody><div className="stock-filterbar">
      <label className="market-search stock-search"><Search size={14} /><input value={keyword} onChange={(event) => update('query', event.target.value)} placeholder="输入代码或名称" aria-label="搜索股票" /></label>
      <select className="select" value={exchange} onChange={(event) => update('exchange', event.target.value)} aria-label="筛选交易所"><option value="">全部交易所</option><option value="SH">上海</option><option value="SZ">深圳</option><option value="BJ">北京</option></select>
      <select className="select" value={active} onChange={(event) => update('active', event.target.value)} aria-label="筛选在市状态"><option value="true">仅在市</option><option value="false">仅非在市</option><option value="all">全部状态</option></select>
      <label className="date-control"><CalendarDays size={14} /><span>研究日</span><select className="select" value={selectedDate} onChange={(event) => update('date', event.target.value)} aria-label="选择研究交易日">{(dates.data?.dates ?? [selectedDate]).map((date) => <option key={date} value={date}>{date}</option>)}</select></label>
    </div></PanelBody></Panel>
    <Panel><PanelHeader title="股票主数据" meta={stocks.isFetching ? '更新中...' : `本页返回 ${stocks.data?.length ?? 0} 个对象`} actions={<StatusBadge tone={stocks.isError ? 'danger' : 'success'}>{stocks.isError ? '查询失败' : '后端筛选'}</StatusBadge>} /><PanelBody className="panel__body--flush"><StockListTable rows={stocks.data} date={selectedDate} isLoading={stocks.isLoading} error={stocks.error} onRetry={() => void stocks.refetch()} /></PanelBody></Panel>
    <div className="stock-pagination"><Button disabled={page === 0 || stocks.isFetching} onClick={() => update('page', String(page - 1))}><ChevronLeft size={14} />上一页</Button><span>第 {page + 1} 页 · 每页最多 {PAGE_SIZE} 条</span><Button disabled={(stocks.data?.length ?? 0) < PAGE_SIZE || stocks.isFetching} onClick={() => update('page', String(page + 1))}>下一页<ChevronRight size={14} /></Button></div>
  </div>;
}
