import { useQuery } from '@tanstack/react-query';
import { researchRecordsApi } from '../api/researchRecordsApi';

export const researchRecordKeys = {
  all: ['research-records'] as const,
  phases: (from: string, to: string) => [...researchRecordKeys.all, 'phases', from, to] as const,
  trades: (from: string, to: string) => [...researchRecordKeys.all, 'trades', from, to] as const,
};

export function useResearchRecordSources(from: string, to: string, enabled = true) {
  const phases = useQuery({ queryKey: researchRecordKeys.phases(from, to), queryFn: () => researchRecordsApi.listPhases(from, to), enabled, staleTime: 60_000 });
  const trades = useQuery({ queryKey: researchRecordKeys.trades(from, to), queryFn: () => researchRecordsApi.listTrades(from, to), enabled, staleTime: 60_000 });
  return { phases, trades };
}
