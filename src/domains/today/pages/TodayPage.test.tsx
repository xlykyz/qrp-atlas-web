import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TodayPage } from './TodayPage';

const baseUrl = 'http://127.0.0.1:8001';
const requestUrls: string[] = [];

function record(request: Request) {
  requestUrls.push(request.url);
}

function summaryFor(date: string) {
  return {
    base_count: 1,
    candidate_count: 2,
    active_count: 3,
    new_listing_warmup_count: 0,
    null_state_count: 0,
    base_to_candidate_count: 0,
    candidate_to_active_count: 1,
    active_to_base_count: 0,
    active_held_count: 2,
    calculation_completed_at: '2026-08-03T10:00:00Z',
    production_run_id: `run-${date}`,
  };
}

function emptyPoolSnapshot(date: string) {
  return {
    trade_date: date,
    pools: [
      { pool_type: 'HEIGHT', count: 0, members: [] },
      { pool_type: 'CAPACITY', count: 0, members: [] },
      { pool_type: 'RECOGNITION', count: 0, members: [] },
    ],
  };
}

const server = setupServer(
  http.get(`${baseUrl}/api/daily/dates`, ({ request }) => {
    record(request);
    return HttpResponse.json(['2026-08-03', '2026-08-02']);
  }),
  http.get(`${baseUrl}/api/stats`, ({ request }) => {
    record(request);
    return HttpResponse.json({
      database: 'today.duckdb',
      size_bytes: 1024,
      tables: {
        daily_market_snapshot: { rows: 2, earliest_date: '2026-08-02', latest_date: '2026-08-03' },
      },
    });
  }),
  http.get(`${baseUrl}/api/health`, ({ request }) => {
    record(request);
    return HttpResponse.json({ status: 'ok', tables: [] });
  }),
  http.get(`${baseUrl}/api/reports/stock`, ({ request }) => {
    record(request);
    return HttpResponse.json([]);
  }),
  http.get(`${baseUrl}/api/visits`, ({ request }) => {
    record(request);
    return HttpResponse.json([]);
  }),
  http.get(`${baseUrl}/api/backtest/tasks`, ({ request }) => {
    record(request);
    return HttpResponse.json([]);
  }),
  http.get(`${baseUrl}/api/daily`, ({ request }) => {
    record(request);
    return HttpResponse.json([]);
  }),
  http.get(`${baseUrl}/api/index-daily`, ({ request }) => {
    record(request);
    return HttpResponse.json([]);
  }),
  http.get(`${baseUrl}/api/zt-pool`, ({ request }) => {
    record(request);
    return HttpResponse.json([]);
  }),
  http.get(`${baseUrl}/api/dt-pool`, ({ request }) => {
    record(request);
    return HttpResponse.json([]);
  }),
  http.get(`${baseUrl}/api/phase`, ({ request }) => {
    record(request);
    return HttpResponse.json([]);
  }),
  http.get(`${baseUrl}/api/v1/system-b/summary`, ({ request }) => {
    record(request);
    const date = new URL(request.url).searchParams.get('trade_date') ?? 'unknown';
    return HttpResponse.json(summaryFor(date));
  }),
  http.get(`${baseUrl}/api/v1/system-b/active-episodes`, ({ request }) => {
    record(request);
    return HttpResponse.json([]);
  }),
  http.get(`${baseUrl}/api/v1/system-b/pools/snapshot`, ({ request }) => {
    record(request);
    const date = new URL(request.url).searchParams.get('trade_date') ?? 'unknown';
    return HttpResponse.json(emptyPoolSnapshot(date));
  }),
  http.get(`${baseUrl}/api/v1/system-b/production-runs/latest`, ({ request }) => {
    record(request);
    return HttpResponse.json({ production_run_id: 'LATEST-GLOBAL-RUN', status: 'SUCCEEDED' });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  requestUrls.length = 0;
});
afterAll(() => server.close());

function renderTodayPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter initialEntries={['/today?date=2026-08-03']}>
      <QueryClientProvider client={queryClient}>
        <TodayPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('TodayPage System B integration', () => {
  it('updates date-dependent queries, resets pool selection, refreshes all panels, and keeps existing panels', async () => {
    const user = userEvent.setup();
    renderTodayPage();

    expect(await screen.findByText('run-2026-08-03')).toBeVisible();
    expect(screen.getByText('市场广度')).toBeVisible();
    expect(screen.getByText('极端状态')).toBeVisible();
    expect(screen.getByText('最新研究证据')).toBeVisible();
    expect(screen.getByText('工作队列')).toBeVisible();
    expect(requestUrls.some((url) => url.includes('/api/v1/system-b/production-runs/latest'))).toBe(false);

    await user.click(screen.getByRole('button', { name: /高度/ }));
    expect(screen.getByRole('button', { name: '高度0' })).toHaveClass('button--primary');

    await user.selectOptions(screen.getByRole('combobox', { name: '选择交易日' }), '2026-08-02');
    expect(await screen.findByText('run-2026-08-02')).toBeVisible();
    await waitFor(() => expect(screen.getByRole('button', { name: '全部' })).toHaveClass('button--primary'));

    const dateDependentPaths = [
      '/api/v1/system-b/summary',
      '/api/v1/system-b/active-episodes',
      '/api/v1/system-b/pools/snapshot',
      '/api/daily',
      '/api/index-daily',
      '/api/zt-pool',
      '/api/dt-pool',
      '/api/phase',
    ];
    for (const path of dateDependentPaths) {
      expect(requestUrls.some((url) => url.startsWith(`${baseUrl}${path}`) && url.includes('2026-08-02'))).toBe(true);
    }

    const summaryRequestsBeforeRefresh = requestUrls.filter((url) => url.includes('/api/v1/system-b/summary')).length;
    const activeRequestsBeforeRefresh = requestUrls.filter((url) => url.includes('/api/v1/system-b/active-episodes')).length;
    const poolRequestsBeforeRefresh = requestUrls.filter((url) => url.includes('/api/v1/system-b/pools/snapshot')).length;
    await user.click(screen.getByRole('button', { name: '刷新' }));
    await waitFor(() => {
      expect(requestUrls.filter((url) => url.includes('/api/v1/system-b/summary')).length).toBeGreaterThan(summaryRequestsBeforeRefresh);
      expect(requestUrls.filter((url) => url.includes('/api/v1/system-b/active-episodes')).length).toBeGreaterThan(activeRequestsBeforeRefresh);
      expect(requestUrls.filter((url) => url.includes('/api/v1/system-b/pools/snapshot')).length).toBeGreaterThan(poolRequestsBeforeRefresh);
    });
  });
});
