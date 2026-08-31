import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { StocksPage } from './StocksPage';

const baseUrl = 'http://127.0.0.1:8001';
const listQueries: string[] = [];

const server = setupServer(
  http.get(`${baseUrl}/api/daily/dates`, () => {
    return HttpResponse.json(['2026-08-28', '2026-08-27']);
  }),
  http.get(`${baseUrl}/api/stats`, () => {
    return HttpResponse.json({
      tables: {
        daily_market_snapshot: { latest_date: '2026-08-28' },
      },
    });
  }),
  http.get(`${baseUrl}/api/stock/list`, ({ request }) => {
    const url = new URL(request.url);
    listQueries.push(url.searchParams.get('keyword') ?? '');
    return HttpResponse.json([
      {
        ticker: '000001.SZ',
        secu_name: '平安银行',
        exchange: 'SZ',
        market: '主板',
        list_date: '1991-04-03',
        delist_date: null,
        is_active: true,
      },
    ]);
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  listQueries.length = 0;
});
afterAll(() => server.close());

function renderStocksPage(initialEntries = ['/research/stocks?date=2026-08-28']) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/research/stocks" element={<StocksPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('StocksPage Search Input & IME Handling', () => {
  it('handles digit input 1234 correctly and syncs to search query', async () => {
    renderStocksPage();
    const input = await screen.findByPlaceholderText('输入代码或名称');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '1234' } });
    expect(input).toHaveValue('1234');

    await waitFor(() => {
      expect(listQueries).toContain('1234');
    });
  });

  it('handles English input ASDF correctly and syncs to search query', async () => {
    renderStocksPage();
    const input = await screen.findByPlaceholderText('输入代码或名称');

    fireEvent.change(input, { target: { value: 'ASDF' } });
    expect(input).toHaveValue('ASDF');

    await waitFor(() => {
      expect(listQueries).toContain('ASDF');
    });
  });

  it('handles Chinese IME composition sequence without character duplication or intermediate request clobbering', async () => {
    renderStocksPage();
    const input = await screen.findByPlaceholderText('输入代码或名称');

    // 1. Composition starts
    fireEvent.compositionStart(input);

    // 2. Typing pinyin in IME
    fireEvent.change(input, { target: { value: 'a' } });
    expect(input).toHaveValue('a');

    fireEvent.change(input, { target: { value: 'as' } });
    expect(input).toHaveValue('as');

    fireEvent.change(input, { target: { value: 'asd' } });
    expect(input).toHaveValue('asd');

    fireEvent.change(input, { target: { value: 'asdf' } });
    expect(input).toHaveValue('asdf');

    // Fast-forward time to ensure no debounced requests were fired with incomplete composition
    await act(async () => {
      await new Promise((r) => setTimeout(r, 300));
    });
    expect(listQueries.filter((q) => q === 'asdf' || q === 'asd' || q === 'as' || q === 'a')).toHaveLength(0);

    // 3. User commits Chinese candidate: "平安银行"
    fireEvent.compositionEnd(input, { currentTarget: { value: '平安银行' }, target: { value: '平安银行' } });
    expect(input).toHaveValue('平安银行');

    // 4. Final query should be synced
    await waitFor(() => {
      expect(listQueries).toContain('平安银行');
    });
  });

  it('clears query when input is emptied', async () => {
    renderStocksPage(['/research/stocks?date=2026-08-28&query=平安银行']);
    const input = await screen.findByPlaceholderText('输入代码或名称');
    expect(input).toHaveValue('平安银行');

    fireEvent.change(input, { target: { value: '' } });
    expect(input).toHaveValue('');

    await waitFor(() => {
      expect(listQueries).toContain('');
    });
  });
});
