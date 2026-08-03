import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/api/errors';
import { ActiveListPanel } from './ActiveListPanel';
import { PoolFilterPanel } from './PoolFilterPanel';
import { POOL_TYPES } from '../types/systemB';
import type { ActiveEpisodeDto, PoolSnapshotResponse } from '../types/systemB';

const emptySnapshot: PoolSnapshotResponse = {
  trade_date: '2026-08-03',
  pools: POOL_TYPES.map((pool_type) => ({ pool_type, count: 0, members: [] })),
};

const activeEpisode: ActiveEpisodeDto = {
  asset_id: '600001',
  name: '示例股票',
  trade_date: '2026-08-03',
  close: 10,
  episode_id: 'episode-1',
  episode_no: 1,
  days_since_start: 3,
  days_since_confirmed: 2,
  episode_return: 0.1,
  peak_return: 0.12,
  drawdown_from_peak: -0.02,
  ma5_reentry_count: 0,
  episode_start_date: '2026-07-30',
  episode_confirmed_date: '2026-07-31',
  trend_state: 'ACTIVE',
  previous_trend_state: 'CANDIDATE',
};

function renderPool(snapshot: PoolSnapshotResponse | undefined, error: unknown = null) {
  return render(
    <PoolFilterPanel
      snapshot={snapshot}
      selectedPool={null}
      onPoolSelect={vi.fn()}
      isLoading={false}
      error={error}
      onRetry={vi.fn()}
    />,
  );
}

describe('PoolFilterPanel', () => {
  it('keeps three legitimate zero-count pools visible after completion', () => {
    renderPool(emptySnapshot);

    expect(screen.getByRole('button', { name: /高度/ })).toBeVisible();
    expect(screen.getByRole('button', { name: /容量/ })).toBeVisible();
    expect(screen.getByRole('button', { name: /辨识度/ })).toBeVisible();
    expect(screen.getAllByText('0', { exact: true })).toHaveLength(3);
  });

  it('shows a not-ready state for POOL_SNAPSHOT_NOT_READY instead of zero pools', () => {
    renderPool(undefined, new ApiError({
      kind: 'http',
      status: 404,
      message: '请求失败（404）',
      detail: 'POOL_SNAPSHOT_NOT_READY',
    }));

    expect(screen.getByText('该交易日三池尚未完成计算')).toBeVisible();
    expect(screen.queryByRole('button', { name: /高度/ })).not.toBeInTheDocument();
    expect(screen.queryByText('POOL_SNAPSHOT_NOT_READY')).not.toBeInTheDocument();
  });

  it('does not let a pool error block the active list', () => {
    render(
      <>
        <PoolFilterPanel
          snapshot={undefined}
          selectedPool={null}
          onPoolSelect={vi.fn()}
          isLoading={false}
          error={new ApiError({
            kind: 'http',
            status: 404,
            message: '请求失败（404）',
            detail: 'POOL_SNAPSHOT_NOT_READY',
          })}
          onRetry={vi.fn()}
        />
        <ActiveListPanel
          episodes={[activeEpisode]}
          poolMembers={[]}
          selectedPool={null}
          isLoading={false}
          error={null}
          onRetry={vi.fn()}
        />
      </>,
    );

    expect(screen.getByText('该交易日三池尚未完成计算')).toBeVisible();
    expect(screen.getByText('600001')).toBeVisible();
  });
});
