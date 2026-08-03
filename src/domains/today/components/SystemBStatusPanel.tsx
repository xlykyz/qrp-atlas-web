/**
 * SystemBStatusPanel — 状态摘要面板 (P0-1 / P0-2 / P0-7)
 *
 * Displays:
 *   - Five state distribution cards (BASE / CANDIDATE / ACTIVE / 新股预热 / NULL)
 *   - Four transition counts (BASE→CANDIDATE / CANDIDATE→ACTIVE / ACTIVE→BASE / ACTIVE→ACTIVE)
 *   - Data freshness indicator (last calculation time, production run status, asset count)
 */

import { Clock, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Metric,
  MetricStrip,
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
} from '@/shared/ui';
import { formatCalculationTime } from '../lib/systemBFormat';
import type { ProductionRunDto, SystemBSummaryDto } from '../types/systemB';

interface SystemBStatusPanelProps {
  date: string;
  summary: SystemBSummaryDto | undefined;
  productionRun: ProductionRunDto | null | undefined;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

export function SystemBStatusPanel({
  date,
  summary,
  productionRun,
  isLoading,
  error,
  onRetry,
}: SystemBStatusPanelProps) {
  const totalAssets =
    summary && (summary.base_count + summary.candidate_count + summary.active_count + summary.null_state_count) > 0
      ? summary.base_count + summary.candidate_count + summary.active_count + summary.null_state_count
      : 0;

  const pct = (count: number): string => {
    if (totalAssets === 0) return '—';
    return `${((count / totalAssets) * 100).toFixed(1)}%`;
  };

  const freshnessTone: 'success' | 'warning' | 'danger' =
    productionRun?.status === 'SUCCEEDED' ? 'success' : productionRun?.status ? 'warning' : 'danger';

  return (
    <Panel>
      <PanelHeader
        title="System B 状态监测"
        meta={`${date} · 全市场趋势状态分布`}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {productionRun ? (
              <StatusBadge tone={freshnessTone}>
                <Clock size={11} style={{ marginRight: 3 }} />
                {productionRun.status}
              </StatusBadge>
            ) : null}
            {summary?.calculation_completed_at ? (
              <span style={{ color: 'var(--muted)', fontSize: '11px' }}>
                更新 {formatCalculationTime(summary.calculation_completed_at)}
              </span>
            ) : null}
          </div>
        }
      />
      <PanelBody>
        {isLoading ? (
          <LoadingState label="正在加载 System B 状态摘要…" />
        ) : error ? (
          <ErrorState error={error} onRetry={onRetry} title="状态摘要加载失败" />
        ) : !summary ? (
          <EmptyState title="该交易日没有 System B 状态数据" description="请确认 production run 已完成，或切换交易日。" />
        ) : (
          <div className="stack">
            {/* P0-1: State distribution cards */}
            <MetricStrip>
              <Metric
                label="BASE"
                value={summary.base_count.toLocaleString('zh-CN')}
                meta={pct(summary.base_count)}
              />
              <Metric
                label="CANDIDATE"
                value={summary.candidate_count.toLocaleString('zh-CN')}
                tone="warning"
                meta={pct(summary.candidate_count)}
              />
              <Metric
                label="ACTIVE"
                value={summary.active_count.toLocaleString('zh-CN')}
                tone="up"
                meta={pct(summary.active_count)}
              />
              <Metric
                label="新股预热"
                value={summary.new_listing_warmup_count.toLocaleString('zh-CN')}
                meta="NEW_LISTING_WARMUP"
              />
              <Metric
                label="NULL"
                value={summary.null_state_count.toLocaleString('zh-CN')}
                tone="down"
                meta={pct(summary.null_state_count)}
              />
            </MetricStrip>

            {/* P0-2: Transition counts */}
            <div className="fact-row">
              <span>今日转换</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={13} style={{ color: 'var(--market-up)' }} />
                  <strong>BASE→CANDIDATE</strong>
                  <StatusBadge tone="info">{summary.base_to_candidate_count}</StatusBadge>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={13} style={{ color: 'var(--market-up)' }} />
                  <strong>CANDIDATE→ACTIVE</strong>
                  <StatusBadge tone="success">{summary.candidate_to_active_count}</StatusBadge>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingDown size={13} style={{ color: 'var(--market-down)' }} />
                  <strong>ACTIVE→BASE</strong>
                  <StatusBadge tone="danger">{summary.active_to_base_count}</StatusBadge>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Minus size={13} style={{ color: 'var(--muted)' }} />
                  <strong>ACTIVE 持有</strong>
                  <StatusBadge tone="neutral">{summary.active_held_count.toLocaleString('zh-CN')}</StatusBadge>
                </span>
              </div>
            </div>

            {/* P0-7: Data freshness */}
            <div className="fact-row">
              <span>数据新鲜度</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                {productionRun ? (
                  <>
                    <span>
                      <strong>状态</strong>
                      <StatusBadge tone={freshnessTone}>{productionRun.status}</StatusBadge>
                    </span>
                    {productionRun.asset_count != null ? (
                      <span>
                        <strong>覆盖</strong>
                        <StatusBadge tone="info">{productionRun.asset_count.toLocaleString('zh-CN')} 只</StatusBadge>
                      </span>
                    ) : null}
                    {productionRun.completed_at ? (
                      <span>
                        <strong>完成时间</strong>
                        <span style={{ fontSize: '12px' }}>{formatCalculationTime(productionRun.completed_at)}</span>
                      </span>
                    ) : null}
                  </>
                ) : (
                  <span style={{ color: 'var(--muted)', fontSize: '12px' }}>
                    <RefreshCw size={12} style={{ marginRight: 4 }} />
                    等待 production run 数据…
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </PanelBody>
    </Panel>
  );
}
