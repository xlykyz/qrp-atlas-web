import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { DeclarativeRuleForm } from './DeclarativeRuleForm';

const createdDefinitions: Record<string, unknown>[] = [];
const server = setupServer(
  http.post('http://127.0.0.1:8001/api/declarative-strategies/validate', async ({ request }) => {
    const body = await request.json() as { definition: Record<string, unknown> };
    return HttpResponse.json({ ok: true, code: body.definition.code, version: body.definition.version, normalized: body.definition, canonical_json: JSON.stringify(body.definition) });
  }),
  http.post('http://127.0.0.1:8001/api/declarative-strategies', async ({ request }) => {
    const body = await request.json() as { definition: Record<string, unknown> };
    createdDefinitions.push(body.definition);
    return HttpResponse.json({ ...body.definition, owner_user_id: 'test', status: 'active', created_at: '2026-07-17T00:00:00Z', referenced_by_runs: false });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => { server.resetHandlers(); createdDefinitions.length = 0; });
afterAll(() => server.close());

describe('DeclarativeRuleForm', () => {
  it('invalidates validation after draft changes and creates only the revalidated definition', async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    render(<QueryClientProvider client={queryClient}><DeclarativeRuleForm /></QueryClientProvider>);

    const createButton = screen.getByRole('button', { name: '创建不可变版本' });
    await user.click(screen.getByRole('button', { name: '校验定义' }));
    expect(await screen.findByText('后端校验通过')).toBeVisible();
    expect(createButton).toBeEnabled();

    await user.clear(screen.getByLabelText('名称'));
    await user.type(screen.getByLabelText('名称'), '定义 B');
    expect(screen.queryByText('后端校验通过')).not.toBeInTheDocument();
    expect(createButton).toBeDisabled();

    await user.click(screen.getByRole('button', { name: '校验定义' }));
    expect(await screen.findByText('后端校验通过')).toBeVisible();
    expect(createButton).toBeEnabled();
    await user.click(createButton);

    await waitFor(() => expect(createdDefinitions).toHaveLength(1));
    expect(createdDefinitions[0]).toMatchObject({ name: '定义 B' });
  });
});
