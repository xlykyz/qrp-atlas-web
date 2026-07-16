import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState, Metric, MetricStrip, Panel, PanelBody, PanelHeader, StatusBadge } from '@/shared/ui';
import { formatMoney, formatNumber, formatPercent } from '@/shared/lib/format';
import { deriveBreadth, maxUpdatedAt } from '../lib/deriveToday';
import type { DailyQuoteDto, PhaseDto } from '../types/models';

interface MarketOverviewPanelProps {
  date: string;
  rows: DailyQuoteDto[] | undefined;
  phase: PhaseDto | undefined;
  limitUpCount: number | undefined;
  limitDownCount: number | undefined;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

export function MarketOverviewPanel({ date, rows, phase, limitUpCount, limitDownCount, isLoading, error, onRetry }: MarketOverviewPanelProps) {
  const breadth = deriveBreadth(rows ?? []);
  const advanceWidth = breadth.traded > 0 ? (breadth.advancing / breadth.traded) * 100 : 0;
  const flatWidth = breadth.traded > 0 ? (breadth.flat / breadth.traded) * 100 : 0;
  return (
    <Panel>
      <PanelHeader title="市场广度" meta={`${date} · 全市场日行情 · 更新时间 ${maxUpdatedAt(rows ?? [])?.replace('T', ' ').slice(0, 16) ?? '未知'}`} actions={<Link className="text-link" to={`/review/market?date=${date}`}>进入完整复盘</Link>} />
      <PanelBody>
        {isLoading ? <LoadingState label="正在读取全市场快照…" /> : error ? <ErrorState error={error} onRetry={onRetry} /> : !rows?.length ? <EmptyState title="该交易日没有市场快照" description="请切换交易日，或前往系统页检查 daily_market_snapshot 覆盖。" /> : <div className="stack">
          <MetricStrip>
            <Metric label="上涨" value={breadth.advancing.toLocaleString('zh-CN')} tone="up" meta={`占成交样本 ${formatPercent((breadth.advanceShare ?? 0) * 100, 1)}`} />
            <Metric label="下跌" value={breadth.declining.toLocaleString('zh-CN')} tone="down" meta={`平盘 ${breadth.flat.toLocaleString('zh-CN')}`} />
            <Metric label="涨停池" value={limitUpCount ?? '—'} tone="up" meta="来自 zt_pool" />
            <Metric label="跌停池" value={limitDownCount ?? '—'} tone="down" meta="来自 dt_pool" />
            <Metric label="成交额" value={formatMoney(breadth.totalAmount)} meta={`${breadth.traded.toLocaleString('zh-CN')} 只有效样本`} />
            <Metric label="涨跌幅中位数" value={formatPercent(breadth.medianChange)} tone={breadth.medianChange === null || breadth.medianChange === 0 ? 'default' : breadth.medianChange > 0 ? 'up' : 'down'} meta={`停牌/缺失 ${breadth.suspended}`} />
          </MetricStrip>
          <div className="breadth-summary" aria-label={`上涨 ${breadth.advancing}，平盘 ${breadth.flat}，下跌 ${breadth.declining}`}>
            <div className="breadth-bar">
              <span className="breadth-bar__up" style={{ width: `${advanceWidth}%` }} />
              <span className="breadth-bar__flat" style={{ width: `${flatWidth}%` }} />
            </div>
            <div className="breadth-legend">
              <span className="up"><ArrowUpRight size={13} />上涨 {breadth.advancing}</span>
              <span><Minus size={13} />平盘 {breadth.flat}</span>
              <span className="down"><ArrowDownRight size={13} />下跌 {breadth.declining}</span>
            </div>
          </div>
          <div className="fact-row">
            <span>人工市场阶段</span>
            {phase?.phase ? <StatusBadge tone="special">{phase.phase}</StatusBadge> : <StatusBadge tone="neutral">尚未记录</StatusBadge>}
            <strong>{phase?.notes || '当前页面只呈现事实快照，不根据前端阈值生成市场阶段。'}</strong>
          </div>
          <div className="market-footnote">样本 {formatNumber(breadth.total, 0)} 只；涨跌幅与成交额来自 <code>daily_market_snapshot</code>，涨跌停数量来自独立池表，口径不在前端重算。</div>
        </div>}
      </PanelBody>
    </Panel>
  );
}


