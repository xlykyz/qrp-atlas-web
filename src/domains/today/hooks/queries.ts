import { useQuery } from '@tanstack/react-query';
import { useTasks } from '@/domains/backtests/hooks/queries';
import { todayApi } from '../api/todayApi';
import { addCalendarDays, shanghaiToday } from '../lib/deriveToday';

export const todayKeys = {
  all: ['today'] as const,
  dates: (through: string) => [...todayKeys.all, 'dates', through] as const,
  health: () => [...todayKeys.all, 'health'] as const,
  stats: () => [...todayKeys.all, 'stats'] as const,
  daily: (date: string) => [...todayKeys.all, 'daily', date] as const,
  indexes: (date: string) => [...todayKeys.all, 'indexes', date] as const,
  limitUps: (date: string) => [...todayKeys.all, 'limit-ups', date] as const,
  limitDowns: (date: string) => [...todayKeys.all, 'limit-downs', date] as const,
  phase: (date: string) => [...todayKeys.all, 'phase', date] as const,
  reports: () => [...todayKeys.all, 'reports'] as const,
  visits: () => [...todayKeys.all, 'visits'] as const,
};

export function useTradingDates() {
  const through = shanghaiToday();
  return useQuery({
    queryKey: todayKeys.dates(through),
    queryFn: () => todayApi.listTradingDates(through),
    staleTime: 5 * 60_000,
  });
}

export function useTodayWorkspace(date: string | null) {
  const stableDate = date ?? '';
  const enabled = Boolean(date);
  const health = useQuery({ queryKey: todayKeys.health(), queryFn: todayApi.getHealth, staleTime: 30_000 });
  const stats = useQuery({ queryKey: todayKeys.stats(), queryFn: todayApi.getStats, staleTime: 60_000 });
  const reports = useQuery({ queryKey: todayKeys.reports(), queryFn: todayApi.listRecentReports, staleTime: 5 * 60_000 });
  const visits = useQuery({ queryKey: todayKeys.visits(), queryFn: todayApi.listRecentVisits, staleTime: 5 * 60_000 });
  const daily = useQuery({ queryKey: todayKeys.daily(stableDate), queryFn: () => todayApi.getDailySnapshot(stableDate), enabled, staleTime: 60_000 });
  const indexes = useQuery({ queryKey: todayKeys.indexes(stableDate), queryFn: () => todayApi.getIndexSeries(addCalendarDays(stableDate, -14), stableDate), enabled, staleTime: 60_000 });
  const limitUps = useQuery({ queryKey: todayKeys.limitUps(stableDate), queryFn: () => todayApi.getLimitUps(stableDate), enabled, staleTime: 60_000 });
  const limitDowns = useQuery({ queryKey: todayKeys.limitDowns(stableDate), queryFn: () => todayApi.getLimitDowns(stableDate), enabled, staleTime: 60_000 });
  const phase = useQuery({ queryKey: todayKeys.phase(stableDate), queryFn: () => todayApi.getPhase(stableDate), enabled, staleTime: 60_000 });
  const tasks = useTasks();
  return { health, stats, reports, visits, daily, indexes, limitUps, limitDowns, phase, tasks };
}
