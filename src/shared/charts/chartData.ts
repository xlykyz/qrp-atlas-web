import type { Time } from 'lightweight-charts';
import type { EquityPoint } from '@/domains/backtests/types/models';
/** 累计收益率序列（%，以首日净值为基准），用于百分比坐标。 */
export function toReturnSeries(points: EquityPoint[]): { time: Time; value: number }[] {
  const base = points[0]?.equity;
  if (!base) return [];
  return points.map((point) => ({ time: point.date, value: (point.equity / base - 1) * 100 }));
}
