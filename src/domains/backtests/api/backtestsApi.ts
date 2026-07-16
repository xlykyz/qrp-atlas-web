import { apiRequest } from '@/shared/api/client';
import type { BacktestConfigSnapshot, BacktestRun, BacktestSummary, BacktestTask, BacktestTrade, CostBreakdown, CreateBacktestTaskRequest, CreateTaskResponse, EquityPoint, RunCompareResponse, RunDiagnostics, SkippedTrade, Strategy, UntypedArtifact } from '../types/models';

const enc = encodeURIComponent;
export const backtestsApi = {
  listStrategies: (all = false) => apiRequest<Strategy[]>(`/api/strategies?all=${String(all)}`),
  getStrategy: (code: string, version?: string) => apiRequest<Strategy>(`/api/strategies/${enc(code)}${version ? `?version=${enc(version)}` : ''}`),
  listTasks: () => apiRequest<BacktestTask[]>('/api/backtest/tasks'),
  getTask: (taskId: string) => apiRequest<BacktestTask>(`/api/backtest/tasks/${enc(taskId)}`),
  createTask: (body: CreateBacktestTaskRequest) => apiRequest<CreateTaskResponse>('/api/backtest/tasks', { method: 'POST', body, timeoutMs: 300_000 }),
  listRuns: () => apiRequest<BacktestRun[]>('/api/backtest/runs'),
  getRun: (runId: string) => apiRequest<BacktestRun>(`/api/backtest/runs/${enc(runId)}`),
  getSummary: (runId: string) => apiRequest<BacktestSummary>(`/api/backtest/runs/${enc(runId)}/summary`),
  getEquity: (runId: string) => apiRequest<EquityPoint[]>(`/api/backtest/runs/${enc(runId)}/equity`),
  getTrades: (runId: string) => apiRequest<BacktestTrade[]>(`/api/backtest/runs/${enc(runId)}/trades`),
  getSkipped: (runId: string) => apiRequest<SkippedTrade[]>(`/api/backtest/runs/${enc(runId)}/skipped`),
  getConfig: (runId: string) => apiRequest<BacktestConfigSnapshot>(`/api/backtest/runs/${enc(runId)}/config`),
  getCosts: (runId: string) => apiRequest<CostBreakdown | null>(`/api/backtest/runs/${enc(runId)}/costs`),
  getDiagnostics: (runId: string) => apiRequest<RunDiagnostics | null>(`/api/backtest/runs/${enc(runId)}/diagnostics`),
  getArtifact: (runId: string, artifact: string) => apiRequest<UntypedArtifact>(`/api/backtest/runs/${enc(runId)}/${artifact}`),
  compare: (runIds: string[]) => {
    const params = new URLSearchParams(); runIds.forEach((id) => params.append('run_ids', id));
    return apiRequest<RunCompareResponse>(`/api/backtest/compare?${params.toString()}`);
  },
};
