import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/api/errors';
import { PoolFilterPanel } from './PoolFilterPanel';
import { SystemBStatusPanel } from './SystemBStatusPanel';
import { ActiveListPanel } from './ActiveListPanel';
import type { ActiveEpisodeDto, PoolMemberDto, PoolSnapshotResponse, SystemBSummaryDto } from '../types/systemB';
import { POOL_TYPES } from '../types/systemB';

function makeEpisode(index: number, overrides: Partial<ActiveEpisodeDto> = {}): ActiveEpisodeDto {
  return {
    asset_id: `6000${String(index).padStart(2, '0')}`,
    name: `Stock ${index}`,
    trade_date: '2026-08-03',
    close: 10 + index,
    episode_id: `episode-${index}`,
    episode_no: index,
    days_since_start: index,
    days_since_confirmed: index,
    episode_return: index / 100,
    peak_return: index / 80,
    drawdown_from_peak: -index / 1000,
    ma5_reentry_count: 0,
    episode_start_date: '2026-07-01',
    episode_confirmed_date: '2026-07-02',
    trend_state: 'ACTIVE',
    previous_trend_state: 'CANDIDATE',
    ...overrides,
  };
}

function renderList({
  episodes,
  poolMembers = [],
  selectedPool = null,
  error = null,
}: {
  episodes: ActiveEpisodeDto[] | undefined;
  poolMembers?: PoolMemberDto[];
  selectedPool?: string | null;
  error?: unknown;
}) {
  return render(
    <ActiveListPanel
      episodes={episodes}
      poolMembers={poolMembers}
      selectedPool={selectedPool ?? null}
      isLoading={false}
      error={error}
      onRetry={vi.fn()}
    />,
  );
}

function rowAssetIds() {
  return screen.getAllByRole('row').slice(1).map((row) => within(row).getAllByRole('cell')[0]?.textContent ?? null);
}

describe('ActiveListPanel', () => {
  it('sorts by episode return and days since start in descending order', async () => {
    const user = userEvent.setup();
    renderList({
      episodes: [
        makeEpisode(1, { asset_id: 'LOW', episode_return: 0.1, days_since_start: 30 }),
        makeEpisode(2, { asset_id: 'HIGH', episode_return: 0.3, days_since_start: 10 }),
        makeEpisode(3, { asset_id: 'MID', episode_return: 0.2, days_since_start: 20 }),
      ],
    });

    expect(rowAssetIds()).toEqual(['HIGH', 'MID', 'LOW']);
    await user.click(screen.getByRole('button', { name: '持续天数' }));
    expect(rowAssetIds()).toEqual(['LOW', 'MID', 'HIGH']);
  });

  it('shows top30 rows while reporting matched and total counts separately', () => {
    renderList({ episodes: Array.from({ length: 35 }, (_, index) => makeEpisode(index + 1)) });

    expect(screen.getByText('显示 30 / 匹配 35 / 总计 35 只 ACTIVE')).toBeVisible();
    expect(screen.getAllByRole('row')).toHaveLength(31);
  });

  it('applies pool intersection and code/name search with Chinese pool labels', async () => {
    const user = userEvent.setup();
    const poolMembers: PoolMemberDto[] = [
      { asset_id: 'A', pool_type: 'HEIGHT', membership_state: 'IN_POOL', pool_cycle_no: 1, entry_date: null, exit_date: null, episode_id: null },
      { asset_id: 'C', pool_type: 'HEIGHT', membership_state: 'IN_POOL', pool_cycle_no: 1, entry_date: null, exit_date: null, episode_id: null },
    ];
    renderList({
      episodes: [
        makeEpisode(1, { asset_id: 'A', name: 'Alpha' }),
        makeEpisode(2, { asset_id: 'B', name: 'Beta' }),
        makeEpisode(3, { asset_id: 'C', name: 'Gamma' }),
      ],
      poolMembers,
      selectedPool: 'HEIGHT',
    });

    expect(screen.getByText(/高度池 ∩ ACTIVE · 显示 2 \/ 匹配 2 \/ 总计 3/)).toBeVisible();
    expect(screen.queryByText(/HEIGHT ∩/)).not.toBeInTheDocument();
    expect(rowAssetIds()).toEqual(['C', 'A']);

    await user.type(screen.getByPlaceholderText('搜索代码或名称…'), 'Alpha');
    expect(screen.getByText(/显示 1 \/ 匹配 1 \/ 总计 3/)).toBeVisible();
    expect(rowAssetIds()).toEqual(['A']);
  });

  it('keeps status and pool panels usable when the active API fails', () => {
    const summary: SystemBSummaryDto = {
      base_count: 1,
      candidate_count: 0,
      active_count: 0,
      new_listing_warmup_count: 0,
      null_state_count: 0,
      base_to_candidate_count: 0,
      candidate_to_active_count: 0,
      active_to_base_count: 0,
      active_held_count: 0,
      calculation_completed_at: '2026-08-03T10:00:00Z',
      production_run_id: 'run-1',
    };
    const snapshot: PoolSnapshotResponse = {
      trade_date: '2026-08-03',
      pools: POOL_TYPES.map((pool_type) => ({ pool_type, count: 0, members: [] })),
    };

    render(
      <>
        <SystemBStatusPanel date="2026-08-03" summary={summary} isLoading={false} error={null} onRetry={vi.fn()} />
        <PoolFilterPanel snapshot={snapshot} selectedPool={null} onPoolSelect={vi.fn()} isLoading={false} error={null} onRetry={vi.fn()} />
        <ActiveListPanel episodes={undefined} poolMembers={[]} selectedPool={null} isLoading={false} error={new ApiError({ kind: 'http', status: 500, message: '请求失败（500）', detail: 'ACTIVE unavailable' })} onRetry={vi.fn()} />
      </>,
    );

    expect(screen.queryByText('状态摘要加载失败')).not.toBeInTheDocument();
    expect(screen.getByText('ACTIVE 清单加载失败')).toBeVisible();
    expect(screen.getByText('run-1')).toBeVisible();
    expect(screen.getByRole('button', { name: /高度/ })).toBeVisible();
  });
});
