import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { backtestsApi, runsApiFor } from '../api/backtestsApi';
import { isTaskActive } from '../lib/status';
import type { BacktestSource } from '../lib/source';
import type { CreateBacktestTaskRequest } from '../types/models';

export const backtestKeys = {
  all: ['backtests'] as const,
  strategies: () => [...backtestKeys.all, 'strategies'] as const,
  strategy: (code: string, version?: string) => [...backtestKeys.strategies(), code, version ?? 'latest'] as const,
  tasks: () => [...backtestKeys.all, 'tasks'] as const,
  task: (id: string) => [...backtestKeys.tasks(), id] as const,
  runs: (source: BacktestSource = 'product') => [...backtestKeys.all, 'runs', source] as const,
  run: (source: BacktestSource, id: string) => [...backtestKeys.runs(source), id] as const,
  artifact: (source: BacktestSource, id: string, artifact: string) => [...backtestKeys.run(source, id), artifact] as const,
  compare: (source: BacktestSource, ids: string[]) => [...backtestKeys.all, 'compare', source, ...ids] as const,
};

export const useStrategies = () => useQuery({ queryKey: backtestKeys.strategies(), queryFn: () => backtestsApi.listStrategies() });
export const useStrategy = (code: string, version?: string) => useQuery({ queryKey: backtestKeys.strategy(code, version), queryFn: () => backtestsApi.getStrategy(code, version), enabled: Boolean(code) });
export const useTasks = () => useQuery({ queryKey: backtestKeys.tasks(), queryFn: backtestsApi.listTasks });
export const useTask = (id: string) => useQuery({ queryKey: backtestKeys.task(id), queryFn: () => backtestsApi.getTask(id), enabled: Boolean(id), refetchInterval: (q) => q.state.data && isTaskActive(q.state.data.status) ? 2000 : false });
export const useRuns = (source: BacktestSource = 'product') => useQuery({ queryKey: backtestKeys.runs(source), queryFn: () => runsApiFor(source).listRuns() });
export const useRun = (id: string, source: BacktestSource = 'product') => useQuery({ queryKey: backtestKeys.run(source, id), queryFn: () => runsApiFor(source).getRun(id), enabled: Boolean(id) });
export const useRunArtifact = <T,>(id: string, artifact: string, loader: () => Promise<T>, source: BacktestSource = 'product') => useQuery({ queryKey: backtestKeys.artifact(source, id, artifact), queryFn: loader, enabled: Boolean(id) });
export const useRunCompare = (ids: string[], source: BacktestSource = 'product') => useQuery({ queryKey: backtestKeys.compare(source, ids), queryFn: () => runsApiFor(source).compare(ids), enabled: ids.length >= 2 });

export function useCreateTask() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBacktestTaskRequest) => backtestsApi.createTask(body),
    onSuccess: async () => { await Promise.all([client.invalidateQueries({ queryKey: backtestKeys.tasks() }), client.invalidateQueries({ queryKey: backtestKeys.runs() })]); },
  });
}
