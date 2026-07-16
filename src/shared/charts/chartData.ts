import type { Time } from 'lightweight-charts';
import type { EquityPoint } from '@/domains/backtests/types/models';
export function toEquitySeries(points: EquityPoint[]): { time: Time; value: number }[] { return points.map((point) => ({ time: point.date, value: point.equity })); }
export function toDrawdownSeries(points: EquityPoint[]): { time: Time; value: number }[] { return points.map((point) => ({ time: point.date, value: point.drawdown_pct })); }
