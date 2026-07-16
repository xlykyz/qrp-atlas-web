import { Database, Server } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState, Panel, PanelBody, PanelHeader, StatusBadge } from '@/shared/ui';
import { formatBytes } from '@/shared/lib/format';
import { deriveFreshness } from '../lib/deriveToday';
import type { HealthResponse, StatsResponse } from '../types/models';

const stateLabel = {
  current: { label: '同日', tone: 'success' as const },
  lagging: { label: '滞后', tone: 'warning' as const },
  missing: { label: '缺失', tone: 'danger' as const },
  future: { label: '晚于所选日', tone: 'info' as const },
};

export function FreshnessPanel({ date, health, stats, isLoading, error, onRetry }: { date: string; health: HealthResponse | undefined; stats: StatsResponse | undefined; isLoading: boolean; error: unknown; onRetry: () => void }) {
  const items = deriveFreshness(stats, date);
  return (
    <Panel>
      <PanelHeader title="数据新鲜度" meta={`相对研究日 ${date}`} actions={<Link className="text-link" to="/operations?tab=data">打开系统诊断</Link>} />
      <PanelBody>
        {isLoading ? <LoadingState label="正在检查数据覆盖…" /> : error ? <ErrorState error={error} onRetry={onRetry} /> : !stats ? <EmptyState title="没有数据覆盖信息" /> : <div className="stack">
          <div className="system-summary">
            <span><Server size={15} /><strong>API {health?.status === 'ok' ? '正常' : health?.status || '未知'}</strong><StatusBadge tone={health?.status === 'ok' ? 'success' : 'warning'}>{health?.tables.length ?? 0} 张可见表</StatusBadge></span>
            <span><Database size={15} /><strong>{formatBytes(stats.size_bytes)} 数据库</strong><code title={stats.database}>{stats.database.split(/[\\/]/).pop()}</code></span>
          </div>
          <div className="freshness-list">{items.map((item) => {
            const state = stateLabel[item.state];
            return <div key={item.key}><span><strong>{item.label}</strong><code>{item.key}</code></span><span>{item.latestDate ?? '—'}<small>{item.rows === null ? '未部署' : `${item.rows.toLocaleString('zh-CN')} 行`}</small></span><StatusBadge tone={state.tone}>{item.state === 'lagging' && item.lagDays !== null ? `${item.lagDays} 天` : state.label}</StatusBadge></div>;
          })}</div>
        </div>}
      </PanelBody>
    </Panel>
  );
}

