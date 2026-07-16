import { useQuery } from '@tanstack/react-query';
import { operationsApi } from '../api/operationsApi';

export const operationsKeys = { all: ['operations'] as const, health: () => [...operationsKeys.all, 'health'] as const, stats: () => [...operationsKeys.all, 'stats'] as const, openapi: () => [...operationsKeys.all, 'openapi'] as const };

export function useOperationsData() {
  const health = useQuery({ queryKey: operationsKeys.health(), queryFn: operationsApi.getHealth, refetchInterval: 30_000, staleTime: 15_000 });
  const stats = useQuery({ queryKey: operationsKeys.stats(), queryFn: operationsApi.getStats, staleTime: 60_000 });
  const openapi = useQuery({ queryKey: operationsKeys.openapi(), queryFn: operationsApi.getOpenApi, staleTime: 300_000 });
  return { health, stats, openapi };
}
