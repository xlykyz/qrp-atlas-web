import type {
  DailyQuoteDto,
  FreshnessItem,
  IndexDailyDto,
  IndexSnapshot,
  MarketBreadth,
  StatsResponse,
} from '../types/models';

export function shanghaiToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values['year']}-${values['month']}-${values['day']}`;
}

export function addCalendarDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function calendarDayDelta(from: string | null, to: string): number | null {
  if (!from) return null;
  const left = Date.parse(`${from}T00:00:00Z`);
  const right = Date.parse(`${to}T00:00:00Z`);
  if (!Number.isFinite(left) || !Number.isFinite(right)) return null;
  return Math.round((right - left) / 86_400_000);
}

export function deriveBreadth(rows: DailyQuoteDto[]): MarketBreadth {
  const changes = rows
    .map((row) => row.pct_change)
    .filter((value): value is number => value !== null && Number.isFinite(value));
  const sorted = [...changes].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const medianChange = sorted.length === 0
    ? null
    : sorted.length % 2 === 0
      ? ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2
      : (sorted[middle] ?? null);
  const advancing = changes.filter((value) => value > 0).length;
  const declining = changes.filter((value) => value < 0).length;
  const flat = changes.filter((value) => value === 0).length;
  const totalAmount = rows.reduce((sum, row) => sum + (row.amount ?? 0), 0);
  return {
    total: rows.length,
    traded: changes.length,
    advancing,
    declining,
    flat,
    suspended: Math.max(rows.length - changes.length, 0),
    advanceShare: changes.length > 0 ? advancing / changes.length : null,
    totalAmount,
    medianChange,
  };
}

export function deriveIndexSnapshots(rows: IndexDailyDto[]): IndexSnapshot[] {
  const grouped = new Map<string, IndexDailyDto[]>();
  rows.forEach((row) => {
    const current = grouped.get(row.index_code) ?? [];
    current.push(row);
    grouped.set(row.index_code, current);
  });
  return [...grouped.entries()].map(([code, values]) => {
    const ordered = [...values].sort((a, b) => b.trade_date.localeCompare(a.trade_date));
    const latest = ordered[0];
    const previous = ordered[1];
    const changePct = latest?.close !== null && latest?.close !== undefined && previous?.close
      ? ((latest.close / previous.close) - 1) * 100
      : null;
    return {
      code,
      name: latest?.index_name || code,
      tradeDate: latest?.trade_date ?? '—',
      close: latest?.close ?? null,
      changePct,
      updatedAt: latest?.created_at ?? null,
    };
  }).sort((a, b) => a.code.localeCompare(b.code));
}

const coverageLabels: Record<string, string> = {
  daily_market_snapshot: '个股日行情',
  index_daily: '主要指数',
  zt_pool: '涨停池',
  dt_pool: '跌停池',
  research_report_stock: '个股研报',
  cninfo_research_visits: '机构调研',
};

export function deriveFreshness(stats: StatsResponse | undefined, selectedDate: string): FreshnessItem[] {
  return Object.entries(coverageLabels).map(([key, label]) => {
    const table = stats?.tables[key];
    const lagDays = calendarDayDelta(table?.latest_date ?? null, selectedDate);
    let state: FreshnessItem['state'] = 'missing';
    if (table?.latest_date) {
      if (lagDays !== null && lagDays < 0) state = 'future';
      else if (lagDays === 0) state = 'current';
      else state = 'lagging';
    }
    return {
      key,
      label,
      latestDate: table?.latest_date ?? null,
      rows: table?.rows ?? null,
      lagDays,
      state,
    };
  });
}

export function maxUpdatedAt(rows: Array<{ created_at: string | null }>): string | null {
  return rows.reduce<string | null>((latest, row) => {
    if (!row.created_at) return latest;
    if (!latest) return row.created_at;
    return Date.parse(row.created_at) > Date.parse(latest) ? row.created_at : latest;
  }, null);
}
