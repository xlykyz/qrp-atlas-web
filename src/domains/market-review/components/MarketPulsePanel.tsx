import { Button, EmptyState, ErrorState, LoadingState, Metric, MetricStrip, Panel, PanelBody, PanelHeader, StatusBadge } from '@/shared/ui';
import { formatMoney, formatNumber, formatPercent, signedTone } from '@/shared/lib/format';
import { deriveBreadth, deriveIndexes } from '../lib/deriveMarketReview';
import type { DailyQuoteDto, IndexDailyDto } from '../types/models';

interface MarketPulsePanelProps {
  date: string;
  daily: DailyQuoteDto[] | undefined;
  indexes: IndexDailyDto[] | undefined;
  limitUpCount: number | undefined;
  limitDownCount: number | undefined;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

export function MarketPulsePanel({ date, daily, indexes, limitUpCount, limitDownCount, isLoading, error, onRetry }: MarketPulsePanelProps) {
  if (isLoading && !daily) return <Panel><PanelHeader title="市场脉搏" meta={date} /><PanelBody><LoadingState label="正在载入市场全景..." /></PanelBody></Panel>;
  if (error && !daily) return <Panel><PanelHeader title="市场脉搏" meta={date} /><PanelBody><ErrorState error={error} onRetry={onRetry} /></PanelBody></Panel>;
  if (!daily?.length) return <Panel><PanelHeader title="市场脉搏" meta={date} /><PanelBody><EmptyState title="没有市场行情" description="该交易日没有返回全市场日行情。" /></PanelBody></Panel>;

  const breadth = deriveBreadth(daily);
  const indexSnapshots = deriveIndexes(indexes ?? []);
  const advanceShare = breadth.traded ? (breadth.advancing / breadth.traded) * 100 : 0;
  const flatShare = breadth.traded ? (breadth.flat / breadth.traded) * 100 : 0;

  return <Panel>
    <PanelHeader title="市场脉搏" meta={`${date} · 全市场日行情与相邻指数收盘展示转换`} actions={isLoading ? <StatusBadge tone="info">更新中</StatusBadge> : error ? <StatusBadge tone="warning">部分数据缺失</StatusBadge> : <StatusBadge tone="success">已更新</StatusBadge>} />
    <PanelBody className="stack">
      {error ? <div className="inline-notice inline-notice--warning"><div><strong>部分市场数据加载失败</strong><span>已保留可用事实；缺失指标不会由浏览器猜测或补零。</span></div><Button size="sm" onClick={onRetry}>重试缺失数据</Button></div> : null}
      <MetricStrip>
        <Metric label="上涨" value={formatNumber(breadth.advancing, 0)} tone="up" meta={`占有效样本 ${formatPercent(advanceShare)}`} />
        <Metric label="下跌" value={formatNumber(breadth.declining, 0)} tone="down" meta={`平盘 ${formatNumber(breadth.flat, 0)}`} />
        <Metric label="涨停池" value={formatNumber(limitUpCount, 0)} tone="up" meta="后端权威池口径" />
        <Metric label="跌停池" value={formatNumber(limitDownCount, 0)} tone="down" meta="后端权威池口径" />
        <Metric label="成交额" value={formatMoney(breadth.totalAmount)} meta={`${formatNumber(breadth.traded, 0)} 个有效样本`} />
        <Metric label="涨跌中位数" value={formatPercent(breadth.medianChange)} tone={signedTone(breadth.medianChange) === 'up' ? 'up' : signedTone(breadth.medianChange) === 'down' ? 'down' : 'default'} meta={`${formatNumber(breadth.suspended, 0)} 个无涨跌样本`} />
      </MetricStrip>
      <div className="breadth-summary">
        <div className="breadth-bar" aria-label={`上涨 ${breadth.advancing}，平盘 ${breadth.flat}，下跌 ${breadth.declining}`}><span className="breadth-bar__up" style={{ width: `${advanceShare}%` }} /><span className="breadth-bar__flat" style={{ width: `${flatShare}%` }} /></div>
        <div className="breadth-legend"><span className="up">上涨 {breadth.advancing}</span><span>平盘 {breadth.flat}</span><span className="down">下跌 {breadth.declining}</span></div>
      </div>
      {indexSnapshots.length ? <div className="index-tape market-review-indexes">{indexSnapshots.map((index) => <article key={index.code} className="index-tape__item">
        <div><strong>{index.name}</strong><code>{index.code}</code></div>
        <div className="index-tape__quote"><strong>{formatNumber(index.close, 2)}</strong><span className={signedTone(index.changePct)}>{formatPercent(index.changePct)}</span></div>
        <div className="index-tape__meta"><span>{index.date}</span><span>日内 {formatPercent(index.intradayPct)}</span></div>
      </article>)}</div> : <div className="inline-notice"><div><strong>指数数据暂缺</strong><span>市场广度仍可使用，指数区域为局部缺失。</span></div></div>}
    </PanelBody>
  </Panel>;
}
