import { useEffect, useMemo, useRef } from 'react';
import { AreaSeries, ColorType, createChart, LineSeries, LineStyle } from 'lightweight-charts';
import type { EquityPoint } from '@/domains/backtests/types/models';
import { toReturnSeries } from './chartData';

/** 可选对比曲线：累计收益率（百分数，-0.92 表示 -0.92%）。 */
export interface BenchmarkCurvePoint { date: string; return_pct: number }

export function EquityChart({ points, benchmark }: { points: EquityPoint[]; benchmark?: BenchmarkCurvePoint[] }) {
  const container = useRef<HTMLDivElement>(null);
  const returns = useMemo(() => toReturnSeries(points), [points]);
  const benchmarkReturns = useMemo(() => (benchmark ?? []).map((point) => ({ time: point.date, value: point.return_pct })), [benchmark]);
  useEffect(() => {
    if (!container.current) return;
    const chart = createChart(container.current, {
      height: 330,
      layout: { background: { type: ColorType.Solid, color: '#ffffff' }, textColor: '#68716b', fontFamily: 'Inter, Segoe UI, sans-serif', fontSize: 11 },
      grid: { vertLines: { color: '#eef0ed' }, horzLines: { color: '#eef0ed' } },
      rightPriceScale: { borderColor: '#dde0dc' }, timeScale: { borderColor: '#dde0dc', timeVisible: false },
      crosshair: { vertLine: { color: '#9aa29d', width: 1 }, horzLine: { color: '#9aa29d', width: 1 } },
    });
    const returnSeries = chart.addSeries(AreaSeries, { lineColor: '#b13e3e', topColor: 'rgba(177,62,62,.18)', bottomColor: 'rgba(177,62,62,.01)', lineWidth: 2, priceFormat: { type: 'percent', precision: 2, minMove: 0.01 } });
    returnSeries.setData(returns);
    // 0% 横线：收益率图的视觉锚点，便于判断跑赢/跑输基准。
    returnSeries.createPriceLine({ price: 0, color: '#c2c8c4', lineWidth: 1, lineStyle: LineStyle.Solid, axisLabelVisible: false, title: '' });
    if (benchmarkReturns.length) {
      const benchmarkSeries = chart.addSeries(LineSeries, { color: '#2f6fb5', lineWidth: 2, priceFormat: { type: 'percent', precision: 2, minMove: 0.01 } });
      benchmarkSeries.setData(benchmarkReturns);
    }
    chart.timeScale().fitContent();
    const observer = new ResizeObserver((entries) => { const width = entries[0]?.contentRect.width; if (width) chart.applyOptions({ width }); });
    observer.observe(container.current);
    return () => { observer.disconnect(); chart.remove(); };
  }, [benchmarkReturns, returns]);
  return <div ref={container} className="chart" aria-label="累计收益率图" />;
}