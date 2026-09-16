import { Metric, MetricStrip, Panel, PanelBody, PanelHeader } from '@/shared/ui';
import { formatNumber, formatPercent, signedTone } from '@/shared/lib/format';
import type { BacktestSummary } from '@/domains/backtests/types/models';

/**
 * 基准对比面板。
 *
 * 展示后端结果包里的基准/超额指标——这些字段后端一直有返回，
 * 但此前前端没有任何展示位置（RunMetrics 只带了基准总收益一个）。
 */
export function SandboxBenchmarkPanel({ summary }: { summary: BacktestSummary }) {
  if (!summary.benchmark_id) return null;
  const gapped = summary.full_range_excess_available === false;
  const excessTone = signedTone(summary.excess_percentage_point_pct);
  return (
    <Panel>
      <PanelHeader
        title="基准对比"
        meta={`基准 ${summary.benchmark_id}${gapped ? ' · 区间内基准有缺口，全区间超额不可用' : ''}`}
      />
      <PanelBody>
        <MetricStrip>
          <Metric label="基准收益" value={formatPercent(summary.benchmark_total_return_pct)} />
          <Metric label="组合收益" value={formatPercent(summary.portfolio_total_return_pct)} />
          <Metric
            label="超额（百分点）"
            value={formatPercent(summary.excess_percentage_point_pct)}
            tone={excessTone === 'flat' ? 'default' : excessTone}
          />
          <Metric label="相对收益" value={formatPercent(summary.relative_return_pct)} />
          <Metric label="基准 Sharpe" value={formatNumber(summary.benchmark_sharpe)} />
          <Metric label="超额 Sharpe" value={formatNumber(summary.excess_sharpe)} />
          <Metric label="日频主动 Sharpe" value={formatNumber(summary.daily_active_sharpe)} />
        </MetricStrip>
      </PanelBody>
    </Panel>
  );
}