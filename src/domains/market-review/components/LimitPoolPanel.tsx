import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button, EmptyState, ErrorState, LoadingState, Panel, PanelBody, PanelHeader, StatusBadge } from '@/shared/ui';
import { formatMoney, formatNumber, formatPercent } from '@/shared/lib/format';
import { combineLimitPools } from '../lib/deriveMarketReview';
import type { LimitDownDto, LimitUpDto } from '../types/models';

type Pool = 'all' | 'up' | 'down';

interface LimitPoolPanelProps {
  date: string;
  limitUps: LimitUpDto[] | undefined;
  limitDowns: LimitDownDto[] | undefined;
  pool: Pool;
  industry: string;
  query: string;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  onFilterChange: (key: 'pool' | 'industry' | 'q', value: string) => void;
}

export function LimitPoolPanel({ date, limitUps, limitDowns, pool, industry, query, isLoading, error, onRetry, onFilterChange }: LimitPoolPanelProps) {
  const all = combineLimitPools(limitUps ?? [], limitDowns ?? []);
  const industries = [...new Set(all.map((row) => row.industry_name?.trim()).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b));
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN');
  const rows = all.filter((row) => (pool === 'all' || row.direction === pool) && (!industry || row.industry_name === industry) && (!normalizedQuery || `${row.ticker} ${row.name ?? ''}`.toLocaleLowerCase('zh-CN').includes(normalizedQuery)));

  return <Panel>
    <PanelHeader title="涨跌停明细" meta={`${date} · 后端权威池口径`} actions={<><StatusBadge tone="danger">涨停 {limitUps?.length ?? 0}</StatusBadge><StatusBadge tone="success">跌停 {limitDowns?.length ?? 0}</StatusBadge></>} />
    <PanelBody className="panel__body--flush">
      {error && all.length ? <div className="market-partial-notice"><span><strong>极端池仅返回部分数据</strong> 当前表格不是完整结果。</span><Button size="sm" onClick={onRetry}>重试</Button></div> : null}
      <div className="market-filterbar">
        <div className="segmented-control" aria-label="涨跌停方向">{(['all', 'up', 'down'] as const).map((value) => <button type="button" key={value} className={pool === value ? 'active' : ''} onClick={() => onFilterChange('pool', value)}>{value === 'all' ? '全部' : value === 'up' ? '涨停' : '跌停'}</button>)}</div>
        <label className="market-search"><Search size={14} /><input value={query} onChange={(event) => onFilterChange('q', event.target.value)} placeholder="代码或名称" aria-label="搜索涨跌停标的" /></label>
        <select className="select market-industry-select" value={industry} onChange={(event) => onFilterChange('industry', event.target.value)} aria-label="筛选行业"><option value="">全部行业</option>{industries.map((value) => <option key={value} value={value}>{value}</option>)}</select>
        <span className="market-filter-result">显示 {rows.length} / {all.length}</span>
      </div>
      {isLoading && !all.length ? <LoadingState label="正在载入涨跌停池..." /> : error && !all.length ? <ErrorState error={error} onRetry={onRetry} /> : !all.length ? <EmptyState title="该日没有涨跌停池数据" description="这是业务空数据，不会以行情阈值在浏览器中重算。" /> : !rows.length ? <EmptyState title="当前筛选没有匹配标的" description="调整方向、行业或搜索条件。" /> : <div className="data-table-wrap market-limit-table"><table className="data-table"><thead><tr><th>方向</th><th>标的</th><th>行业</th><th className="numeric">收盘</th><th className="numeric">涨跌幅</th><th className="numeric">成交额</th><th className="numeric">换手率</th><th className="numeric">连续</th><th>封板时间</th><th className="numeric">开板</th></tr></thead><tbody>{rows.map((row) => <tr key={`${row.direction}-${row.ticker}`}><td><StatusBadge tone={row.direction === 'up' ? 'danger' : 'success'}>{row.direction === 'up' ? '涨停' : '跌停'}</StatusBadge></td><td><Link className="table-link" to={`/research/stocks/${encodeURIComponent(row.ticker)}?date=${date}`}>{row.name ?? row.ticker}</Link><div className="table-subtitle">{row.ticker}</div></td><td>{row.industry_name ?? '—'}</td><td className="numeric">{formatNumber(row.close, 2)}</td><td className={`numeric ${row.direction === 'up' ? 'up' : 'down'}`}>{formatPercent(row.pct_change)}</td><td className="numeric">{formatMoney(row.amount)}</td><td className="numeric">{formatPercent(row.turnover)}</td><td className="numeric">{row.direction === 'up' ? formatNumber('consecutive_boards' in row ? row.consecutive_boards : null, 0) : formatNumber('consecutive_days' in row ? row.consecutive_days : null, 0)}</td><td className="mono">{row.direction === 'up' && 'first_block_time' in row ? row.first_block_time ?? '—' : 'last_block_time' in row ? row.last_block_time ?? '—' : '—'}</td><td className="numeric">{formatNumber(row.direction === 'up' && 'blast_count' in row ? row.blast_count : row.direction === 'down' && 'open_count' in row ? row.open_count : null, 0)}</td></tr>)}</tbody></table></div>}
    </PanelBody>
  </Panel>;
}
