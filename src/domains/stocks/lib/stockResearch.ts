import type { CandlestickData, HistogramData, Time } from 'lightweight-charts';
import type { DailyQuoteDto, PriceRange, StockSnapshot } from '../types/models';

export function shanghaiToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map['year']}-${map['month']}-${map['day']}`;
}

export function rangeStart(endDate: string, range: PriceRange): string {
  const date = new Date(`${endDate}T12:00:00Z`);
  const months: Record<PriceRange, number> = { '3m': 3, '6m': 6, '1y': 12, '3y': 36 };
  date.setUTCMonth(date.getUTCMonth() - months[range]);
  return date.toISOString().slice(0, 10);
}

export function deriveStockSnapshot(rows: DailyQuoteDto[]): StockSnapshot {
  const valid = [...rows].filter((row) => row.close !== null).sort((a, b) => a.trade_date.localeCompare(b.trade_date));
  const first = valid[0] ?? null;
  const latest = valid.at(-1) ?? null;
  const rangeReturn = first?.close && latest?.close ? ((latest.close / first.close) - 1) * 100 : null;
  const highs = valid.map((row) => row.high).filter((value): value is number => value !== null);
  const lows = valid.map((row) => row.low).filter((value): value is number => value !== null);
  return {
    latest,
    first,
    rangeReturn,
    rangeHigh: highs.length ? Math.max(...highs) : null,
    rangeLow: lows.length ? Math.min(...lows) : null,
    totalAmount: valid.reduce((sum, row) => sum + (row.amount ?? 0), 0),
  };
}

export function toCandles(rows: DailyQuoteDto[]): CandlestickData<Time>[] {
  return [...rows].filter((row) => row.open !== null && row.high !== null && row.low !== null && row.close !== null).sort((a, b) => a.trade_date.localeCompare(b.trade_date)).map((row) => ({ time: row.trade_date, open: row.open!, high: row.high!, low: row.low!, close: row.close! }));
}

export function toVolume(rows: DailyQuoteDto[]): HistogramData<Time>[] {
  return [...rows].filter((row) => row.volume !== null).sort((a, b) => a.trade_date.localeCompare(b.trade_date)).map((row) => ({ time: row.trade_date, value: row.volume ?? 0, color: (row.close ?? 0) >= (row.open ?? 0) ? 'rgba(177,62,62,.55)' : 'rgba(23,114,75,.55)' }));
}
