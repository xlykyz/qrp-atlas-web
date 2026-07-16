import { EmptyState, ErrorState, LoadingState, Metric, MetricStrip, Panel, PanelBody, PanelHeader, StatusBadge } from '@/shared/ui';
import { formatMoney, formatNumber, formatPercent, signedTone } from '@/shared/lib/format';
import { deriveStockSnapshot } from '../lib/stockResearch';
import { StockPriceChart } from './StockPriceChart';
import type { Adjustment, DailyQuoteDto, PriceRange, StockDto } from '../types/models';

const rangeNames: Record<PriceRange, string> = { '3m': '近 3 个月', '6m': '近 6 个月', '1y': '近 1 年', '3y': '近 3 年' };
const adjustmentNames: Record<Adjustment, string> = { raw: '不复权', qfq: '前复权', hfq: '后复权' };

export function StockMetrics({ rows, range }: { rows: DailyQuoteDto[]; range: PriceRange }) {
  const snapshot = deriveStockSnapshot(rows);
  const tone = signedTone(snapshot.latest?.pct_change);
  return <MetricStrip>
    <Metric label="收盘" value={formatNumber(snapshot.latest?.close, 2)} tone={tone === 'up' ? 'up' : tone === 'down' ? 'down' : 'default'} meta={snapshot.latest?.trade_date ?? '无有效收盘'} />
    <Metric label="当日涨跌" value={formatPercent(snapshot.latest?.pct_change)} tone={tone === 'up' ? 'up' : tone === 'down' ? 'down' : 'default'} meta={`成交额 ${formatMoney(snapshot.latest?.amount)}`} />
    <Metric label={`${rangeNames[range]}涨跌`} value={formatPercent(snapshot.rangeReturn)} tone={(snapshot.rangeReturn ?? 0) > 0 ? 'up' : (snapshot.rangeReturn ?? 0) < 0 ? 'down' : 'default'} meta={`${snapshot.first?.trade_date ?? '—'} 至 ${snapshot.latest?.trade_date ?? '—'}`} />
    <Metric label="区间最高" value={formatNumber(snapshot.rangeHigh, 2)} meta={`最低 ${formatNumber(snapshot.rangeLow, 2)}`} />
    <Metric label="成交量" value={formatNumber(snapshot.latest?.volume, 0)} meta={`${rows.length} 个行情记录`} />
    <Metric label="当日状态" value={snapshot.latest?.is_limit_up ? '涨停' : snapshot.latest?.is_limit_down ? '跌停' : snapshot.latest?.is_st ? 'ST' : '正常'} tone={snapshot.latest?.is_limit_up ? 'up' : snapshot.latest?.is_limit_down ? 'down' : 'default'} meta={snapshot.latest?.board ?? '板块未知'} />
  </MetricStrip>;
}

export function StockOverviewPanel({ stock, rows, range, adjustment, isLoading, error, onRetry }: { stock: StockDto; rows: DailyQuoteDto[] | undefined; range: PriceRange; adjustment: Adjustment; isLoading: boolean; error: unknown; onRetry: () => void }) {
  return <div className="grid grid--main-aside stock-overview-grid">
    <Panel><PanelHeader title="价格行为" meta={`${rangeNames[range]} · ${adjustmentNames[adjustment]} · 红涨绿跌`} actions={rows?.length ? <StatusBadge tone={error ? 'warning' : 'success'}>{error ? '刷新失败' : `${rows.length} 个交易日`}</StatusBadge> : null} /><PanelBody className="stack">{error && rows?.length ? <div className="inline-notice inline-notice--warning"><div><strong>行情刷新失败</strong><span>图表保留上次成功数据，重试前可能已经过期。</span></div><button className="button button--secondary button--sm" type="button" onClick={onRetry}>重试</button></div> : null}{isLoading && !rows ? <LoadingState label="正在读取价格序列..." /> : error && !rows ? <ErrorState error={error} onRetry={onRetry} /> : !rows?.length ? <EmptyState title="当前窗口没有价格数据" description="切换日期、区间或复权口径后重试。" /> : <StockPriceChart rows={rows} label={stock.name ?? stock.ticker} />}</PanelBody></Panel>
    <Panel><PanelHeader title="证券主数据" meta="QRP Atlas stock master" /><PanelBody><dl className="definition-list"><dt>证券代码</dt><dd className="mono">{stock.ticker}</dd><dt>证券名称</dt><dd>{stock.name ?? '—'}</dd><dt>交易所</dt><dd>{stock.exchange ?? '—'}</dd><dt>市场</dt><dd>{stock.market ?? '—'}</dd><dt>上市日期</dt><dd>{stock.list_date ?? '—'}</dd><dt>在市状态</dt><dd>{stock.is_active ? '在市' : '非在市'}</dd><dt>退市日期</dt><dd>{stock.delist_date ?? '—'}</dd></dl></PanelBody></Panel>
  </div>;
}
