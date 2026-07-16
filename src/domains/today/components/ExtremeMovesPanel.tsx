import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState, Panel, PanelBody, PanelHeader, StatusBadge } from '@/shared/ui';
import { formatMoney, formatPercent } from '@/shared/lib/format';
import type { LimitDownDto, LimitUpDto } from '../types/models';

export function ExtremeMovesPanel({ date, limitUps, limitDowns, isLoading, error, onRetry }: { date: string; limitUps: LimitUpDto[] | undefined; limitDowns: LimitDownDto[] | undefined; isLoading: boolean; error: unknown; onRetry: () => void }) {
  const ups = [...(limitUps ?? [])].sort((a, b) => (b.consecutive_boards ?? 0) - (a.consecutive_boards ?? 0)).slice(0, 5);
  const downs = [...(limitDowns ?? [])].sort((a, b) => (b.consecutive_days ?? 0) - (a.consecutive_days ?? 0)).slice(0, 5);
  return (
    <Panel>
      <PanelHeader title="极端状态" meta={`${date} · 连板与连续跌停优先`} actions={<Link className="text-link" to={`/review/market?date=${date}&focus=limits`}>查看全部</Link>} />
      <PanelBody className="panel__body--flush">
        {isLoading ? <LoadingState /> : error ? <ErrorState error={error} onRetry={onRetry} /> : ups.length + downs.length === 0 ? <EmptyState title="没有涨跌停池数据" /> : <div className="extreme-columns">
          <section>
            <header><span className="up">涨停池</span><StatusBadge tone="danger">{limitUps?.length ?? 0}</StatusBadge></header>
            <div className="data-table-wrap"><table className="data-table compact-table"><thead><tr><th>标的</th><th>行业</th><th className="numeric">连板</th><th className="numeric">成交额</th></tr></thead><tbody>{ups.map((row) => <tr key={row.ticker}><td><Link className="table-link" to={`/research/stocks/${normalizeTicker(row.ticker)}?date=${date}`}>{row.name || row.ticker}</Link><div className="table-subtitle">{row.ticker} · {formatPercent(row.pct_change)}</div></td><td>{row.industry_name || '—'}</td><td className="numeric up">{row.consecutive_boards ?? '—'}</td><td className="numeric">{formatMoney(row.amount)}</td></tr>)}</tbody></table></div>
          </section>
          <section>
            <header><span className="down">跌停池</span><StatusBadge tone="success">{limitDowns?.length ?? 0}</StatusBadge></header>
            <div className="data-table-wrap"><table className="data-table compact-table"><thead><tr><th>标的</th><th>行业</th><th className="numeric">连续</th><th className="numeric">成交额</th></tr></thead><tbody>{downs.map((row) => <tr key={row.ticker}><td><Link className="table-link" to={`/research/stocks/${normalizeTicker(row.ticker)}?date=${date}`}>{row.name || row.ticker}</Link><div className="table-subtitle">{row.ticker} · {formatPercent(row.pct_change)}</div></td><td>{row.industry_name || '—'}</td><td className="numeric down">{row.consecutive_days ?? '—'}</td><td className="numeric">{formatMoney(row.amount)}</td></tr>)}</tbody></table></div>
          </section>
        </div>}
      </PanelBody>
    </Panel>
  );
}

function normalizeTicker(value: string): string {
  if (value.includes('.')) return value;
  return value.startsWith('6') || value.startsWith('9') ? `${value}.SH` : `${value}.SZ`;
}
