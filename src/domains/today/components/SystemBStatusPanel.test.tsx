import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/api/errors';
import { SystemBStatusPanel } from './SystemBStatusPanel';
import type { SystemBSummaryDto } from '../types/systemB';

const readySummary: SystemBSummaryDto = {
  base_count: 2,
  candidate_count: 3,
  active_count: 4,
  new_listing_warmup_count: 5,
  null_state_count: 6,
  base_to_candidate_count: 1,
  candidate_to_active_count: 2,
  active_to_base_count: 0,
  active_held_count: 4,
  calculation_completed_at: '2026-08-03T10:00:00Z',
  production_run_id: 'run-2026-08-03',
};

function renderPanel({
  summary = readySummary,
  error = null,
}: {
  summary?: SystemBSummaryDto | undefined;
  error?: unknown;
} = {}) {
  return render(
    <SystemBStatusPanel
      date="2026-08-03"
      summary={summary}
      isLoading={false}
      error={error}
      onRetry={vi.fn()}
    />,
  );
}

describe('SystemBStatusPanel', () => {
  it('renders state counts and freshness from the selected date summary', () => {
    renderPanel();

    const metric = (label: string) => screen.getByText(label, { exact: true }).closest('.metric') as HTMLElement;
    expect(within(metric('BASE')).getByText('2')).toBeVisible();
    expect(within(metric('CANDIDATE')).getByText('3')).toBeVisible();
    expect(within(metric('ACTIVE')).getByText('4')).toBeVisible();
    expect(within(metric('BASE')).getByText('13.3%')).toBeVisible();
    expect(screen.getByText('run-2026-08-03')).toBeVisible();
    expect(screen.getByText('08/03 18:00')).toBeVisible();
    expect(screen.queryByText('LATEST-GLOBAL-RUN')).not.toBeInTheDocument();
  });

  it('treats a summary without a production run as not ready instead of zero data', () => {
    renderPanel({
      summary: {
        ...readySummary,
        base_count: 0,
        candidate_count: 0,
        active_count: 0,
        new_listing_warmup_count: 0,
        null_state_count: 0,
        calculation_completed_at: null,
        production_run_id: null,
      },
    });

    expect(screen.getByText('该交易日 System B 尚未完成计算')).toBeVisible();
    expect(screen.queryByText('BASE', { exact: true })).not.toBeInTheDocument();
    expect(screen.queryByText('0', { exact: true })).not.toBeInTheDocument();
  });

  it('maps the backend summary not-ready error to the same user-facing state', () => {
    renderPanel({
      summary: undefined,
      error: new ApiError({
        kind: 'http',
        status: 404,
        message: '请求失败（404）',
        detail: 'SYSTEM_B_SUMMARY_NOT_READY',
      }),
    });

    expect(screen.getByText('该交易日 System B 尚未完成计算')).toBeVisible();
    expect(screen.queryByText('SYSTEM_B_SUMMARY_NOT_READY')).not.toBeInTheDocument();
    expect(screen.queryByText('状态摘要加载失败')).not.toBeInTheDocument();
  });

  it('keeps an unrelated summary failure local to the status panel', () => {
    renderPanel({ summary: undefined, error: new Error('summary unavailable') });

    expect(screen.getByText('状态摘要加载失败')).toBeVisible();
    expect(screen.getByText('summary unavailable')).toBeVisible();
    expect(screen.queryByText('该交易日 System B 尚未完成计算')).not.toBeInTheDocument();
  });
});
