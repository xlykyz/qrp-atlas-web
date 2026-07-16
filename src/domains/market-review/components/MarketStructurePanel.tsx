import { Link } from 'react-router-dom';
import { Button, EmptyState, ErrorState, LoadingState, Panel, PanelBody, PanelHeader } from '@/shared/ui';
import { formatMoney, formatPercent } from '@/shared/lib/format';
import { deriveIndustryStats, strongest } from '../lib/deriveMarketReview';
import type { DailyQuoteDto, LimitDownDto, LimitUpDto } from '../types/models';

interface MarketStructurePanelProps {
  date: string;
  daily: DailyQuoteDto[] | undefined;
  limitUps: LimitUpDto[] | undefined;
  limitDowns: LimitDownDto[] | undefined;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  onIndustrySelect: (industry: string) => void;
}

function MoveTable({ title, rows, date }: { title: string; rows: DailyQuoteDto[]; date: string }) {
  return <section><header>{title}</header><div className="data-table-wrap"><table className="data-table compact-table"><thead><tr><th>标的</th><th className="numeric">涨跌幅</th><th className="numeric">成交额</th></tr></thead><tbody>{rows.map((row) => <tr key={row.ticker}><td><Link className="table-link" to={`/research/stocks/${encodeURIComponent(row.ticker)}?date=${date}`}>{row.name ?? row.ticker}</Link><div className="table-subtitle">{row.ticker}</div></td><td className={`numeric ${(row.pct_change ?? 0) > 0 ? 'up' : 'down'}`}>{formatPercent(row.pct_change)}</td><td className="numeric">{formatMoney(row.amount)}</td></tr>)}</tbody></table></div></section>;
}

export function MarketStructurePanel({ date, daily, limitUps, limitDowns, isLoading, error, onRetry, onIndustrySelect }: MarketStructurePanelProps) {
  if (isLoading && !daily) return <Panel><PanelHeader title="强弱与行业结构" /><PanelBody><LoadingState /></PanelBody></Panel>;
  if (error && !daily) return <Panel><PanelHeader title="强弱与行业结构" /><PanelBody><ErrorState error={error} onRetry={onRetry} /></PanelBody></Panel>;
  if (!daily?.length) return <Panel><PanelHeader title="强弱与行业结构" /><PanelBody><EmptyState title="没有可分析的日行情" /></PanelBody></Panel>;
  const industries = deriveIndustryStats(limitUps ?? [], limitDowns ?? []).slice(0, 10);
  return <Panel>
    <PanelHeader title="强弱与行业结构" meta="强弱来自当日日行情排序；行业结构仅统计后端涨跌停池" />
    <PanelBody className="panel__body--flush">
      {error ? <div className="market-partial-notice"><span><strong>极端池结构不完整</strong> 已保留可用的日行情强弱排序。</span><Button size="sm" onClick={onRetry}>重试</Button></div> : null}
      <div className="market-structure-grid">
        <div className="extreme-columns market-move-columns"><MoveTable title="当日强势" rows={strongest(daily, 'up')} date={date} /><MoveTable title="当日弱势" rows={strongest(daily, 'down')} date={date} /></div>
        <section className="industry-ranking"><header>极端池行业分布</header>{industries.length ? <div>{industries.map((item) => <button type="button" key={item.name} onClick={() => onIndustrySelect(item.name)}><span><strong>{item.name}</strong><small>共 {item.total}</small></span><span className="up">+{item.up}</span><span className="down">-{item.down}</span><b className={item.net > 0 ? 'up' : item.net < 0 ? 'down' : ''}>{item.net > 0 ? '+' : ''}{item.net}</b></button>)}</div> : <EmptyState title="没有行业分布" description="该日涨跌停池没有行业字段。" />}</section>
      </div>
    </PanelBody>
  </Panel>;
}
