import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState, StatusBadge } from '@/shared/ui';
import type { StockDto } from '../types/models';

export function StockListTable({ rows, date, isLoading, error, onRetry }: { rows: StockDto[] | undefined; date: string; isLoading: boolean; error: unknown; onRetry: () => void }) {
  if (isLoading && !rows) return <LoadingState label="正在查询股票主数据..." />;
  if (error && !rows) return <ErrorState error={error} onRetry={onRetry} />;
  if (!rows?.length) return <EmptyState title="没有匹配股票" description="调整代码、名称、交易所或在市状态筛选。" />;
  return <div className="data-table-wrap"><table className="data-table stock-list-table"><thead><tr><th>代码</th><th>名称</th><th>交易所</th><th>市场</th><th>上市日期</th><th>状态</th><th>退市日期</th></tr></thead><tbody>{rows.map((stock) => <tr key={stock.ticker}><td><Link className="table-link mono" to={`/research/stocks/${encodeURIComponent(stock.ticker)}?date=${date}&adjustment=qfq&range=1y&tab=overview`}>{stock.ticker}</Link></td><td><strong>{stock.name ?? '—'}</strong></td><td>{stock.exchange ?? '—'}</td><td>{stock.market ?? '—'}</td><td>{stock.list_date ?? '—'}</td><td><StatusBadge tone={stock.is_active ? 'success' : 'neutral'}>{stock.is_active ? '在市' : '非在市'}</StatusBadge></td><td>{stock.delist_date ?? '—'}</td></tr>)}</tbody></table></div>;
}
