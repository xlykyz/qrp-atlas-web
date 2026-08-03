/**
 * PoolFilterPanel — Pool 三池面板 (P0-6)
 *
 * Displays three pool type chips with member counts.  Clicking a chip
 * triggers the cross-filter callback.  An expandable member list shows
 * all IN_POOL members for the selected pool.
 *
 * Cross-filter semantics (system-design-v0.1 §8.6):
 *   - The member count shown is the pool's total IN_POOL count (including
 *     non-ACTIVE members).
 *   - When a pool is selected, the ACTIVE list is filtered to
 *     (Pool members) ∩ (ACTIVE episodes), which may be fewer rows.
 */

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
} from '@/shared/ui';
import { poolLabel, poolShortLabel, poolTone } from '../lib/systemBFormat';
import { isPoolSnapshotNotReadyError } from '../api/systemBApi';
import { POOL_TYPES } from '../types/systemB';
import type { PoolSnapshotResponse } from '../types/systemB';

interface PoolFilterPanelProps {
  snapshot: PoolSnapshotResponse | undefined;
  selectedPool: string | null;
  onPoolSelect: (pool: string | null) => void;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

export function PoolFilterPanel({
  snapshot,
  selectedPool,
  onPoolSelect,
  isLoading,
  error,
  onRetry,
}: PoolFilterPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const poolsMap = new Map<string, number>();
  if (snapshot) {
    for (const pool of snapshot.pools) {
      poolsMap.set(pool.pool_type, pool.count);
    }
  }

  const selectedPoolData = snapshot?.pools.find((p) => p.pool_type === selectedPool);

  return (
    <Panel>
      <PanelHeader
        title="Pool 三池筛选"
        meta={snapshot ? `交易日 ${snapshot.trade_date}` : '加载中…'}
      />
      <PanelBody>
        {isLoading ? (
          <LoadingState label="正在加载三池快照…" />
        ) : isPoolSnapshotNotReadyError(error) ? (
          <EmptyState title="该交易日三池尚未完成计算" description="当前交易日还没有完整的三池快照。" />
        ) : error ? (
          <ErrorState error={error} onRetry={onRetry} title="三池快照加载失败" />
        ) : !snapshot ? (
          <EmptyState title="没有 Pool 数据" description="请确认 pool pipeline 已运行，或配置 QRP_POOL_DB_PATH。" />
        ) : (
          <div className="stack">
            {/* Pool chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <button
                className={`button button--sm${selectedPool === null ? ' button--primary' : ''}`}
                onClick={() => onPoolSelect(null)}
              >
                全部
              </button>
              {POOL_TYPES.map((poolType) => {
                const count = poolsMap.get(poolType) ?? 0;
                const isSelected = selectedPool === poolType;
                return (
                  <button
                    key={poolType}
                    className={`button button--sm${isSelected ? ' button--primary' : ''}`}
                    onClick={() => onPoolSelect(isSelected ? null : poolType)}
                    title={poolLabel(poolType)}
                  >
                    <StatusBadge tone={isSelected ? 'neutral' : poolTone(poolType)}>
                      {poolShortLabel(poolType)}
                    </StatusBadge>
                    <span style={{ marginLeft: '4px' }}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Expandable member list */}
            {selectedPool && selectedPoolData ? (
              <div>
                <button
                  className="button button--ghost button--sm"
                  onClick={() => setExpanded((v) => !v)}
                  style={{ padding: '4px 8px' }}
                >
                  {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  {expanded ? '收起' : '展开'}成员清单（{selectedPoolData.count} 只）
                </button>
                {expanded ? (
                  <div className="data-table-wrap" style={{ marginTop: '8px', maxHeight: '320px' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>代码</th>
                          <th>池类型</th>
                          <th>入池日</th>
                          <th>轮次</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPoolData.members.map((member) => (
                          <tr key={`${member.asset_id}-${member.pool_type}`}>
                            <td className="table-link">{member.asset_id}</td>
                            <td>
                              <StatusBadge tone={poolTone(member.pool_type)}>
                                {poolShortLabel(member.pool_type)}
                              </StatusBadge>
                            </td>
                            <td>{member.entry_date ?? '—'}</td>
                            <td>#{member.pool_cycle_no}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
                <div style={{ marginTop: '6px', color: 'var(--muted)', fontSize: '11px' }}>
                  注：池成员数含非 ACTIVE 股票，联动筛选后 ACTIVE 清单行数可能更少。
                </div>
              </div>
            ) : null}
          </div>
        )}
      </PanelBody>
    </Panel>
  );
}
