/**
 * SystemBStatusPanel — 状态摘要面板 (P0-1 / P0-2 / P0-7)
 *
 * Displays:
 *   - Five state distribution cards (BASE / CANDIDATE / ACTIVE / 新股预热 / NULL)
 *   - Four transition counts (BASE→CANDIDATE / CANDIDATE→ACTIVE / ACTIVE→BASE / ACTIVE→ACTIVE)
 *   - Data freshness indicator bound to the selected date's production run
 */

import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
import { isSystemBSummaryNotReadyError } from '../api/systemBApi';
import type { SystemBSummaryDto } from '../types/systemB';

interface SystemBStatusPanelProps {
  date: string;
  summary: SystemBSummaryDto | undefined;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

export function SystemBStatusPanel({
  date,
  summary,
  isLoading,
  error,
  onRetry,
}: SystemBStatusPanelProps) {
  // The backend summary SQL counts NEW_LISTING_WARMUP separately; its
  // trend_state is already represented by one of the four state buckets (or
  // NULL), so it must not be added to this denominator a second time.
  const totalAssets = summary
    ? summary.base_count + summary.candidate_count + summary.active_count + summary.null_state_count
    : 0;

  const pct = (count: number): string => {
    if (totalAssets === 0) return '—';
    return `${((count / totalAssets) * 100).toFixed(1)}%`;
  };
  const summaryReady = Boolean(summary?.production_run_id?.trim());

  return (
    <Panel>
      <PanelHeader
        title="System B 状态监测"
        meta={`${date} · 全市场趋势状态分布`}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {summaryReady ? (
              <StatusBadge tone="success">
                <Clock size={11} style={{ marginRight: 3 }} />
                已完成
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
        ) : isSystemBSummaryNotReadyError(error) ? (
          <EmptyState title="该交易日 System B 尚未完成计算" description="当前交易日还没有可用的生产结果。" />
        ) : error ? (
          <ErrorState error={error} onRetry={onRetry} title="状态摘要加载失败" />
        ) : !summary || !summaryReady ? (
          <EmptyState title="该交易日 System B 尚未完成计算" description="当前交易日还没有可用的生产结果。" />
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
                <span>
                  <strong>生产批次</strong>
                  <code>{summary.production_run_id}</code>
                </span>
                <span>
                  <strong>完成时间</strong>
                  <span style={{ fontSize: '12px' }}>{formatCalculationTime(summary.calculation_completed_at)}</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </PanelBody>
    </Panel>
  );
}
