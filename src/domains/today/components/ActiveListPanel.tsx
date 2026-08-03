/**
 * ActiveListPanel — ★灵魂清单★ (P0-3 / P0-4 / P0-5 / P0-6 联动)
 *
 * Features:
 *   - Dual-view sorting: episode_return (区间涨幅, default) / days_since_start (持续天数)
 *   - Top30 / 全量 toggle (default: top30)
 *   - Search by code or name
 *   - Pool cross-filter: when a pool is selected, only show ACTIVE stocks
 *     that are also in that pool's member set
 *
 * Cross-filter logic (system-design-v0.1 §8.6):
 *   filtered = (Pool members asset_id set) ∩ (ACTIVE episodes asset_id set)
 *   Since HEIGHT/RECOGNITION members may not be ACTIVE, the result count
 *   may be less than the pool's total member count.
 */

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
} from '@/shared/ui';
import {
  formatClose,
  formatDays,
  formatDrawdown,
  formatEpisodeReturn,
  poolShortLabel,
  poolTone,
} from '../lib/systemBFormat';
import { TOP_N } from '../types/systemB';
import type {
  ActiveEpisodeDto,
  DisplayMode,
  PoolMemberDto,
  SortKey,
} from '../types/systemB';

interface ActiveListPanelProps {
  episodes: ActiveEpisodeDto[] | undefined;
  poolMembers: PoolMemberDto[];
  selectedPool: string | null;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

export function ActiveListPanel({
  episodes,
  poolMembers,
  selectedPool,
  isLoading,
  error,
  onRetry,
}: ActiveListPanelProps) {
  const [sortKey, setSortKey] = useState<SortKey>('episode_return');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('top30');
  const [searchQuery, setSearchQuery] = useState('');

  // Build a map: asset_id -> pool_types[] for badge display and cross-filter.
  const { poolAssetIdsByType, poolTypesByAsset } = useMemo(() => {
    const byType = new Map<string, Set<string>>();
    const byAsset = new Map<string, string[]>();
    for (const member of poolMembers) {
      // Cross-filter: collect asset_ids per pool type
      const set = byType.get(member.pool_type);
      if (set) {
        set.add(member.asset_id);
      } else {
        byType.set(member.pool_type, new Set([member.asset_id]));
      }
      // Badge display: collect pool types per asset
      const types = byAsset.get(member.asset_id);
      if (types) {
        if (!types.includes(member.pool_type)) types.push(member.pool_type);
      } else {
        byAsset.set(member.asset_id, [member.pool_type]);
      }
    }
    return { poolAssetIdsByType: byType, poolTypesByAsset: byAsset };
  }, [poolMembers]);

  // Filter, sort, and slice.
  const filteredAndSorted = useMemo(() => {
    if (!episodes) return [];

    let result = episodes;

    // Pool cross-filter: (Pool members) ∩ (ACTIVE episodes)
    if (selectedPool) {
      const poolAssetIds = poolAssetIdsByType.get(selectedPool);
      if (poolAssetIds) {
        result = result.filter((e) => poolAssetIds.has(e.asset_id));
      } else {
        result = [];
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (e) =>
          e.asset_id.toLowerCase().includes(query) ||
          (e.name?.toLowerCase().includes(query) ?? false),
      );
    }

    // Sort (descending by sortKey)
    const sorted = [...result].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      return bv - av;
    });

    // Slice for top30 mode
    if (displayMode === 'top30') {
      return sorted.slice(0, TOP_N);
    }
    return sorted;
  }, [episodes, selectedPool, searchQuery, sortKey, displayMode, poolAssetIdsByType]);

  const totalCount = episodes?.length ?? 0;
  const filteredCount = filteredAndSorted.length;

  return (
    <Panel>
      <PanelHeader
        title="ACTIVE 强势清单 ★灵魂★"
        meta={
          selectedPool
            ? `筛选: ${selectedPool} ∩ ACTIVE · 显示 ${filteredCount} / ${totalCount} 只 ACTIVE`
            : `显示 ${filteredCount} / ${totalCount} 只 ACTIVE`
        }
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Sort toggle (P0-5) */}
            <div className="segmented-control">
              <button
                className={sortKey === 'episode_return' ? 'active' : ''}
                onClick={() => setSortKey('episode_return')}
                title="按区间涨幅降序"
              >
                区间涨幅
              </button>
              <button
                className={sortKey === 'days_since_start' ? 'active' : ''}
                onClick={() => setSortKey('days_since_start')}
                title="按持续天数降序"
              >
                持续天数
              </button>
            </div>
            {/* Display mode toggle (P0-5) */}
            <div className="segmented-control">
              <button
                className={displayMode === 'top30' ? 'active' : ''}
                onClick={() => setDisplayMode('top30')}
                title={`前 ${TOP_N} 名`}
              >
                前{TOP_N}
              </button>
              <button
                className={displayMode === 'all' ? 'active' : ''}
                onClick={() => setDisplayMode('all')}
                title="显示全部 ACTIVE"
              >
                全量
              </button>
            </div>
          </div>
        }
      />
      <PanelBody>
        {isLoading ? (
          <LoadingState label="正在加载 ACTIVE 强势清单…" />
        ) : error ? (
          <ErrorState error={error} onRetry={onRetry} title="ACTIVE 清单加载失败" />
        ) : !episodes || episodes.length === 0 ? (
          <EmptyState
            title="该交易日没有 ACTIVE 股票"
            description="请确认 episode pipeline 已运行，或配置 QRP_EPISODE_DB_PATH。"
          />
        ) : (
          <div className="stack">
            {/* Search bar */}
            <div className="toolbar">
              <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: '320px' }}>
                <Search
                  size={14}
                  style={{
                    position: 'absolute',
                    left: '9px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="搜索代码或名称…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '28px' }}
                />
              </div>
              <span className="toolbar__spacer" />
              <span style={{ color: 'var(--muted)', fontSize: '11px' }}>
                {selectedPool
                  ? `${selectedPool} ∩ ACTIVE: ${filteredCount} 只`
                  : `共 ${totalCount} 只 ACTIVE`}
              </span>
            </div>

            {/* Active list table */}
            <div className="data-table-wrap" style={{ maxHeight: '560px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>代码</th>
                    <th>名称</th>
                    <th className="numeric">close</th>
                    <th className="numeric">ep#</th>
                    <th className="numeric">天数</th>
                    <th className="numeric">
                      {sortKey === 'episode_return' ? '区间涨幅 ▼' : '区间涨幅'}
                    </th>
                    <th className="numeric">回撤</th>
                    <th>池</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSorted.map((episode) => {
                    const pools = poolTypesByAsset.get(episode.asset_id) ?? [];
                    return (
                      <tr key={episode.asset_id}>
                        <td>
                          <span className="table-link">{episode.asset_id}</span>
                        </td>
                        <td>{episode.name ?? '—'}</td>
                        <td className="numeric">{formatClose(episode.close)}</td>
                        <td className="numeric">#{episode.episode_no}</td>
                        <td className="numeric">{formatDays(episode.days_since_start)}</td>
                        <td
                          className="numeric"
                          style={{
                            color:
                              episode.episode_return > 0
                                ? 'var(--market-up)'
                                : episode.episode_return < 0
                                  ? 'var(--market-down)'
                                  : 'inherit',
                            fontWeight: 650,
                          }}
                        >
                          {formatEpisodeReturn(episode.episode_return)}
                        </td>
                        <td
                          className="numeric"
                          style={{
                            color:
                              episode.drawdown_from_peak < 0
                                ? 'var(--market-down)'
                                : 'inherit',
                          }}
                        >
                          {formatDrawdown(episode.drawdown_from_peak)}
                        </td>
                        <td>
                          {pools.length > 0 ? (
                            <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                              {pools.map((pool) => (
                                <StatusBadge key={pool} tone={poolTone(pool)}>
                                  {poolShortLabel(pool)}
                                </StatusBadge>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--muted)', fontSize: '11px' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAndSorted.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                        {selectedPool
                          ? `${selectedPool} 池中没有 ACTIVE 股票`
                          : '没有匹配搜索条件的 ACTIVE 股票'}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </PanelBody>
    </Panel>
  );
}
