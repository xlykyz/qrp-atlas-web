import { ArrowRight, FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState, PageHeader, Panel, PanelBody, PanelHeader, StatusBadge } from '@/shared/ui';
import { useStrategies } from '../hooks/queries';

export function StrategiesPage() {
  const query = useStrategies();
  return <div className="stack"><PageHeader eyebrow="策略研究" title="策略目录" description="从后端实时策略注册表选择可进入产品回测路径的策略。" actions={<Link className="button button--primary button--md" to="/backtests/new"><FlaskConical size={15} />创建实验</Link>} />
    <Panel><PanelHeader title="可用策略" meta={query.data ? `${query.data.length} 个正式产品策略` : '读取实时契约'} /><PanelBody className="panel__body--flush">
      {query.isLoading ? <LoadingState label="正在读取策略目录…" /> : query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> : !query.data?.length ? <EmptyState title="没有可用策略" description="后端策略注册表当前没有 product_supported 策略。" /> : <div className="data-table-wrap"><table className="data-table"><thead><tr><th>策略</th><th>家族</th><th>类型</th><th>版本</th><th>Universe</th><th>状态</th><th /></tr></thead><tbody>{query.data.map((strategy) => <tr key={`${strategy.code}:${strategy.version}`}><td><Link className="table-link" to={`/strategies/${encodeURIComponent(strategy.code)}?version=${encodeURIComponent(strategy.version)}`}>{strategy.name}</Link><div className="table-subtitle">{strategy.code}</div></td><td>{strategy.family}</td><td>{strategy.strategy_type}</td><td>{strategy.version}</td><td>{strategy.supported_universe_modes.join(' / ')}</td><td><StatusBadge tone={strategy.product_supported ? 'success' : 'warning'}>{strategy.product_supported ? '产品可用' : '研究限定'}</StatusBadge></td><td><Link className="icon-link" to={`/backtests/new?strategy=${encodeURIComponent(strategy.code)}&version=${encodeURIComponent(strategy.version)}`} aria-label={`使用${strategy.name}创建回测`}><ArrowRight size={15} /></Link></td></tr>)}</tbody></table></div>}
    </PanelBody></Panel></div>;
}
