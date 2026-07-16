import { EmptyState, ErrorState, LoadingState, Panel, PanelBody, PanelHeader, StatusBadge } from '@/shared/ui';
import { formatNumber, formatPercent, signedTone } from '@/shared/lib/format';
import { deriveIndexSnapshots } from '../lib/deriveToday';
import type { IndexDailyDto } from '../types/models';

export function IndexTapePanel({ rows, selectedDate, isLoading, error, onRetry }: { rows: IndexDailyDto[] | undefined; selectedDate: string; isLoading: boolean; error: unknown; onRetry: () => void }) {
  const indexes = deriveIndexSnapshots(rows ?? []);
  return (
    <Panel>
      <PanelHeader title="主要指数" meta={`截止 ${selectedDate} 的最近可用收盘 · 涨跌幅由相邻两个指数收盘展示计算`} />
      <PanelBody className="panel__body--flush">
        {isLoading ? <LoadingState /> : error ? <ErrorState error={error} onRetry={onRetry} /> : indexes.length === 0 ? <EmptyState title="没有指数行情" description="当前日期窗口没有 index_daily 数据。" /> : <div className="index-tape">
          {indexes.map((index) => {
            const tone = signedTone(index.changePct);
            const lagging = index.tradeDate !== selectedDate;
            return <article key={index.code} className="index-tape__item">
              <div><strong>{index.name}</strong><code>{index.code}</code></div>
              <div className="index-tape__quote"><strong>{formatNumber(index.close, 2)}</strong><span className={tone}>{formatPercent(index.changePct)}</span></div>
              <div className="index-tape__meta"><span>{index.tradeDate}</span>{lagging ? <StatusBadge tone="warning">晚于市场快照更新</StatusBadge> : <StatusBadge tone="success">同日</StatusBadge>}</div>
            </article>;
          })}
        </div>}
      </PanelBody>
    </Panel>
  );
}
