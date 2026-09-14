import { useCallback, useState } from 'react';
import { PageHeader, Panel, PanelBody, PanelHeader, StatusBadge } from '@/shared/ui';
import { useTradingDates } from '@/domains/today/hooks/queries';
import { EquityChart } from '@/shared/charts/EquityChart';
import { RunMetrics } from '@/domains/backtests/components/RunMetrics';
import { StrategyResearchNav } from '../components/StrategyResearchNav';
import { SandboxEditor } from '../components/SandboxEditor';
import { SandboxToolbar } from '../components/SandboxToolbar';
import { SandboxConsole } from '../components/SandboxConsole';
import { SANDBOX_TEMPLATES } from '../lib/sandboxTemplates';
import { sandboxApi, simulateSandboxRun } from '../api/sandboxApi';
import type { SandboxRunResponse } from '../types/sandbox';

export function StrategySandboxPage() {
  const dates = useTradingDates();
  const availableDates = dates.data?.dates;

  // Derive initial start and end dates from trading calendar with fallback
  const defaultEndDate = availableDates?.[0] ?? '2025-06-30';
  const defaultStartDate =
    availableDates && availableDates.length >= 20
      ? (availableDates[Math.min(availableDates.length - 1, 120)] ?? '2025-01-02')
      : '2025-01-02';

  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);

  const startDate = selectedStartDate ?? defaultStartDate;
  const endDate = selectedEndDate ?? defaultEndDate;

  // Code & configuration state
  const [code, setCode] = useState<string>(SANDBOX_TEMPLATES[0]?.code ?? '');
  const [initialCash, setInitialCash] = useState<number>(1000000);
  const [benchmarkId, setBenchmarkId] = useState<string>('000985.XSHG');

  // Execution state: initialized with initial simulation result so page is immediately alive
  const [isPending, setIsPending] = useState<boolean>(false);
  const [runResult, setRunResult] = useState<SandboxRunResponse>(() =>
    simulateSandboxRun({
      code: SANDBOX_TEMPLATES[0]?.code ?? '',
      start_date: '2025-01-02',
      end_date: '2025-06-30',
      initial_cash: 1000000,
      benchmark_id: '000985.XSHG',
    })
  );

  // Execute sandbox run
  const handleRun = useCallback(() => {
    if (isPending || !startDate || !endDate) return;
    setIsPending(true);

    void sandboxApi
      .runSandbox({
        code,
        start_date: startDate,
        end_date: endDate,
        initial_cash: initialCash,
        benchmark_id: benchmarkId,
      })
      .then((result) => {
        setRunResult(result);
      })
      .catch((err: unknown) => {
        setRunResult({
          success: false,
          summary: null,
          equity_points: [],
          logs: [`[沙盒异常] 执行中断: ${err instanceof Error ? err.message : String(err)}`],
          error_message: err instanceof Error ? err.stack || err.message : String(err),
          duration_ms: 0,
        });
      })
      .finally(() => {
        setIsPending(false);
      });
  }, [code, startDate, endDate, initialCash, benchmarkId, isPending]);

  return (
    <div className="stack" style={{ gap: '16px' }}>
      <PageHeader
        eyebrow="策略研究"
        title="自定义策略沙盒 (Python)"
        description="纯内存即时计算与交互式沙盒研究台。无需持久化任务流水、不写入后端数据库，代码即写即跑，即刻呈现净值曲线与执行日志。"
        meta={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <StatusBadge tone="special">Python 交互沙盒</StatusBadge>
            <StatusBadge tone="success">无状态 · 内存即时计算</StatusBadge>
          </div>
        }
      />

      <StrategyResearchNav />

      {/* Main Split Workbench (Left Editor, Right Controls & Results) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(420px, 52%) minmax(380px, 48%)',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        {/* Left Side: Code Editor */}
        <div style={{ minWidth: 0, height: '100%' }}>
          <SandboxEditor
            code={code}
            onChange={setCode}
            onRun={handleRun}
            isPending={isPending}
          />
        </div>

        {/* Right Side: Parameters Toolbar, Charts & Console */}
        <div className="stack" style={{ minWidth: 0, gap: '14px' }}>
          {/* Top Control Bar */}
          <SandboxToolbar
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setSelectedStartDate}
            onEndDateChange={setSelectedEndDate}
            availableDates={availableDates}
            initialCash={initialCash}
            onInitialCashChange={setInitialCash}
            benchmarkId={benchmarkId}
            onBenchmarkChange={setBenchmarkId}
            onRun={handleRun}
            isPending={isPending}
            durationMs={runResult.duration_ms}
          />

          {/* Performance & Charts Panel */}
          <Panel>
            <PanelHeader
              title="实时绩效与收益曲线"
              meta={
                runResult.summary
                  ? `基准: ${benchmarkId} | 交易日: ${runResult.equity_points.length} 天`
                  : '准备就绪'
              }
            />
            <PanelBody>
              <div className="stack" style={{ gap: '12px' }}>
                {runResult.summary ? (
                  <RunMetrics summary={runResult.summary} />
                ) : (
                  <div style={{ padding: '8px 0', color: 'var(--muted)', fontSize: '12px' }}>
                    点击【编译运行】生成实时绩效指标。
                  </div>
                )}

                {runResult.equity_points.length > 0 ? (
                  <div style={{ background: '#fff', borderRadius: '4px', padding: '4px' }}>
                    <EquityChart points={runResult.equity_points} />
                  </div>
                ) : null}
              </div>
            </PanelBody>
          </Panel>

          {/* Console & Diagnostics Panel */}
          <SandboxConsole
            logs={runResult.logs}
            errorMessage={runResult.error_message}
            onClear={() => setRunResult((prev) => ({ ...prev, logs: [], error_message: null }))}
          />
        </div>
      </div>
    </div>
  );
}
