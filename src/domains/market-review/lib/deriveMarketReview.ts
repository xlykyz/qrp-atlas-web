import type { DailyQuoteDto, IndexDailyDto, IndexSnapshot, IndustryStat, LimitDownDto, LimitPoolRow, LimitUpDto, MarketBreadth } from '../types/models';

export function shanghaiToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map['year']}-${map['month']}-${map['day']}`;
}

export function addDays(value: string, amount: number): string {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function deriveBreadth(rows: DailyQuoteDto[]): MarketBreadth {
  const changes = rows.map((row) => row.pct_change).filter((value): value is number => value !== null && Number.isFinite(value)).sort((a, b) => a - b);
  const advancing = changes.filter((value) => value > 0).length;
  const declining = changes.filter((value) => value < 0).length;
  const flat = changes.length - advancing - declining;
  const middle = Math.floor(changes.length / 2);
  const medianChange = changes.length === 0 ? null : changes.length % 2 ? changes[middle]! : (changes[middle - 1]! + changes[middle]!) / 2;
  return {
    total: rows.length,
    traded: changes.length,
    advancing,
    declining,
    flat,
    suspended: rows.length - changes.length,
    totalAmount: rows.reduce((sum, row) => sum + (row.amount ?? 0), 0),
    medianChange,
  };
}

export function deriveIndexes(rows: IndexDailyDto[]): IndexSnapshot[] {
  const byCode = new Map<string, IndexDailyDto[]>();
  rows.forEach((row) => byCode.set(row.index_code, [...(byCode.get(row.index_code) ?? []), row]));
  return [...byCode.entries()].map(([code, values]) => {
    const sorted = values.sort((a, b) => b.trade_date.localeCompare(a.trade_date));
    const latest = sorted[0]!;
    const previous = sorted.find((item) => item.trade_date < latest.trade_date);
    const changePct = latest.close !== null && previous?.close ? ((latest.close / previous.close) - 1) * 100 : null;
    const intradayPct = latest.close !== null && latest.open ? ((latest.close / latest.open) - 1) * 100 : null;
    return { code, name: latest.index_name ?? code, date: latest.trade_date, close: latest.close, changePct, intradayPct };
  }).sort((a, b) => a.code.localeCompare(b.code));
}

export function combineLimitPools(ups: LimitUpDto[], downs: LimitDownDto[]): LimitPoolRow[] {
  return [
    ...ups.map((row) => ({ ...row, direction: 'up' as const })),
    ...downs.map((row) => ({ ...row, direction: 'down' as const })),
  ];
}

export function deriveIndustryStats(ups: LimitUpDto[], downs: LimitDownDto[]): IndustryStat[] {
  const map = new Map<string, IndustryStat>();
  const add = (name: string | null, direction: 'up' | 'down') => {
    const key = name?.trim() || '未分类';
    const item = map.get(key) ?? { name: key, up: 0, down: 0, net: 0, total: 0 };
    item[direction] += 1;
    item.net = item.up - item.down;
    item.total = item.up + item.down;
    map.set(key, item);
  };
  ups.forEach((row) => add(row.industry_name, 'up'));
  downs.forEach((row) => add(row.industry_name, 'down'));
  return [...map.values()].sort((a, b) => b.total - a.total || b.net - a.net || a.name.localeCompare(b.name));
}

export function strongest(rows: DailyQuoteDto[], direction: 'up' | 'down', limit = 8): DailyQuoteDto[] {
  return rows.filter((row) => row.pct_change !== null).sort((a, b) => direction === 'up' ? (b.pct_change ?? -Infinity) - (a.pct_change ?? -Infinity) : (a.pct_change ?? Infinity) - (b.pct_change ?? Infinity)).slice(0, limit);
}
