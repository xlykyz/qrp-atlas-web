import { apiRequest } from '@/shared/api/client';
import type { BacktestConfigSnapshot, BacktestRun, BacktestSummary, BacktestTask, BacktestTrade, CostBreakdown, CreateBacktestTaskRequest, CreateTaskResponse, EquityPoint, RunCompareResponse, RunDiagnostics, SkippedTrade, Strategy, UntypedArtifact } from '../types/models';
import type { BacktestSource } from '../lib/source';

const enc = encodeURIComponent;

/**
 * 结果读取接口工厂。
 *
 * 生产回测（`/api/backtest`）与研究区（`/api/research`）的结果契约完全一致，
 * 仅路径前缀不同，因此共用同一套实现，避免出现第二份口径。
 * 注意：研究区没有任务与策略列表能力，那部分只在 backtestsApi 上提供。
 */
function createRunsApi(prefix: string) {
  return {
    listRuns: () => apiRequest<BacktestRun[]>(`${prefix}/runs`),
    getRun: (runId: string) => apiRequest<BacktestRun>(`${prefix}/runs/${enc(runId)}`),
    getSummary: (runId: string) => apiRequest<BacktestSummary>(`${prefix}/runs/${enc(runId)}/summary`),
    getEquity: (runId: string) => apiRequest<EquityPoint[]>(`${prefix}/runs/${enc(runId)}/equity`),
    getTrades: (runId: string) => apiRequest<BacktestTrade[]>(`${prefix}/runs/${enc(runId)}/trades`),
    getSkipped: (runId: string) => apiRequest<SkippedTrade[]>(`${prefix}/runs/${enc(runId)}/skipped`),
    getConfig: (runId: string) => apiRequest<BacktestConfigSnapshot>(`${prefix}/runs/${enc(runId)}/config`),
    getCosts: (runId: string) => apiRequest<CostBreakdown | null>(`${prefix}/runs/${enc(runId)}/costs`),
    getDiagnostics: (runId: string) => apiRequest<RunDiagnostics | null>(`${prefix}/runs/${enc(runId)}/diagnostics`),
    getArtifact: (runId: string, artifact: string) => apiRequest<UntypedArtifact>(`${prefix}/runs/${enc(runId)}/${artifact}`),
    compare: (runIds: string[]) => {
      const params = new URLSearchParams(); runIds.forEach((id) => params.append('run_ids', id));
      return apiRequest<RunCompareResponse>(`${prefix}/compare?${params.toString()}`);
    },
  };
}

export type RunsApi = ReturnType<typeof createRunsApi>;

export const backtestsApi = {
  ...createRunsApi('/api/backtest'),
  listStrategies: (all = false) => apiRequest<Strategy[]>(`/api/strategies?all=${String(all)}`),
  getStrategy: (code: string, version?: string) => apiRequest<Strategy>(`/api/strategies/${enc(code)}${version ? `?version=${enc(version)}` : ''}`),
  listTasks: () => apiRequest<BacktestTask[]>('/api/backtest/tasks'),
  getTask: (taskId: string) => apiRequest<BacktestTask>(`/api/backtest/tasks/${enc(taskId)}`),
  createTask: (body: CreateBacktestTaskRequest) => apiRequest<CreateTaskResponse>('/api/backtest/tasks', { method: 'POST', body, timeoutMs: 300_000 }),
};

/** 研究区只读结果接口。 */
export const researchRunsApi: RunsApi = createRunsApi('/api/research');

export function runsApiFor(source: BacktestSource): RunsApi {
  return source === 'research' ? researchRunsApi : backtestsApi;
}