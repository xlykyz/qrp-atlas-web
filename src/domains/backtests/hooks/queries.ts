import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { backtestsApi } from '../api/backtestsApi';
import { isTaskActive } from '../lib/status';
import type { CreateBacktestTaskRequest } from '../types/models';

export const backtestKeys = {
  all: ['backtests'] as const,
  strategies: () => [...backtestKeys.all, 'strategies'] as const,
  strategy: (code: string, version?: string) => [...backtestKeys.strategies(), code, version ?? 'latest'] as const,
  tasks: () => [...backtestKeys.all, 'tasks'] as const,
  task: (id: string) => [...backtestKeys.tasks(), id] as const,
  runs: () => [...backtestKeys.all, 'runs'] as const,
  run: (id: string) => [...backtestKeys.runs(), id] as const,
  artifact: (id: string, artifact: string) => [...backtestKeys.run(id), artifact] as const,
  compare: (ids: string[]) => [...backtestKeys.all, 'compare', ...ids] as const,
};

export const useStrategies = () => useQuery({ queryKey: backtestKeys.strategies(), queryFn: () => backtestsApi.listStrategies() });
export const useStrategy = (code: string, version?: string) => useQuery({ queryKey: backtestKeys.strategy(code, version), queryFn: () => backtestsApi.getStrategy(code, version), enabled: Boolean(code) });
export const useTasks = () => useQuery({ queryKey: backtestKeys.tasks(), queryFn: backtestsApi.listTasks });
export const useTask = (id: string) => useQuery({ queryKey: backtestKeys.task(id), queryFn: () => backtestsApi.getTask(id), enabled: Boolean(id), refetchInterval: (q) => q.state.data && isTaskActive(q.state.data.status) ? 2000 : false });
export const useRuns = () => useQuery({ queryKey: backtestKeys.runs(), queryFn: backtestsApi.listRuns });
export const useRun = (id: string) => useQuery({ queryKey: backtestKeys.run(id), queryFn: () => backtestsApi.getRun(id), enabled: Boolean(id) });
export const useRunArtifact = <T,>(id: string, artifact: string, loader: () => Promise<T>) => useQuery({ queryKey: backtestKeys.artifact(id, artifact), queryFn: loader, enabled: Boolean(id) });
export const useRunCompare = (ids: string[]) => useQuery({ queryKey: backtestKeys.compare(ids), queryFn: () => backtestsApi.compare(ids), enabled: ids.length >= 2 });

export function useCreateTask() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBacktestTaskRequest) => backtestsApi.createTask(body),
    onSuccess: async () => { await Promise.all([client.invalidateQueries({ queryKey: backtestKeys.tasks() }), client.invalidateQueries({ queryKey: backtestKeys.runs() })]); },
  });
}
