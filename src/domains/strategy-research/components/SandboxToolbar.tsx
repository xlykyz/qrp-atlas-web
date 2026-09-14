import { Loader2, Play } from 'lucide-react';
import { Button, StatusBadge, TradingDatePicker } from '@/shared/ui';

interface SandboxToolbarProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  availableDates?: string[] | undefined;
  initialCash: number;
  onInitialCashChange: (val: number) => void;
  benchmarkId: string;
  onBenchmarkChange: (val: string) => void;
  onRun: () => void;
  isPending: boolean;
  durationMs?: number | null | undefined;
}

export function SandboxToolbar({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  availableDates,
  initialCash,
  onInitialCashChange,
  benchmarkId,
  onBenchmarkChange,
  onRun,
  isPending,
  durationMs,
}: SandboxToolbarProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '10px 14px',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface)',
      }}
    >
      {/* Parameter Inputs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TradingDatePicker
            label="开始日"
            value={startDate}
            onChange={onStartDateChange}
            availableDates={availableDates}
            aria-label="回测起始交易日"
          />
          <span style={{ color: 'var(--muted)' }}>至</span>
          <TradingDatePicker
            label="结束日"
            value={endDate}
            onChange={onEndDateChange}
            availableDates={availableDates}
            aria-label="回测结束交易日"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 650 }}>资金:</span>
          <input
            className="input"
            type="number"
            step={100000}
            min={10000}
            value={initialCash}
            onChange={(e) => onInitialCashChange(Number(e.target.value) || 1000000)}
            style={{ width: '105px', height: '32px', fontSize: '12px' }}
            title="初始回测本金"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 650 }}>基准:</span>
          <select
            className="select"
            value={benchmarkId}
            onChange={(e) => onBenchmarkChange(e.target.value)}
            style={{ height: '32px', fontSize: '12px', minWidth: '130px' }}
          >
            <option value="000985.XSHG">000985 中证全指</option>
            <option value="000300.SH">000300 沪深300</option>
            <option value="000905.SH">000905 中证500</option>
            <option value="000852.SH">000852 中证1000</option>
          </select>
        </div>
      </div>

      {/* Action Buttons & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {durationMs != null ? (
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
            计算耗时: <strong style={{ color: 'var(--accent)' }}>{durationMs}ms</strong>
          </span>
        ) : null}
        <StatusBadge tone="success">纯内存计算</StatusBadge>

        <Button
          variant="primary"
          onClick={onRun}
          disabled={isPending || !startDate || !endDate}
          style={{ minWidth: '110px' }}
          title="快捷键: Ctrl+Enter 或 Ctrl+B"
        >
          {isPending ? (
            <>
              <Loader2 size={14} className="spinner" />
              <span>计算中...</span>
            </>
          ) : (
            <>
              <Play size={14} fill="currentColor" />
              <span>编译运行</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
