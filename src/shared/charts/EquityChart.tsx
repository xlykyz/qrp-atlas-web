import { useEffect, useMemo, useRef } from 'react';
import { AreaSeries, ColorType, createChart, LineSeries } from 'lightweight-charts';
import type { EquityPoint } from '@/domains/backtests/types/models';
import { toDrawdownSeries, toEquitySeries } from './chartData';

export function EquityChart({ points }: { points: EquityPoint[] }) {
  const container = useRef<HTMLDivElement>(null);
  const equity = useMemo(() => toEquitySeries(points), [points]);
  const drawdown = useMemo(() => toDrawdownSeries(points), [points]);
  useEffect(() => {
    if (!container.current) return;
    const chart = createChart(container.current, {
      height: 330,
      layout: { background: { type: ColorType.Solid, color: '#ffffff' }, textColor: '#68716b', fontFamily: 'Inter, Segoe UI, sans-serif', fontSize: 11 },
      grid: { vertLines: { color: '#eef0ed' }, horzLines: { color: '#eef0ed' } },
      rightPriceScale: { borderColor: '#dde0dc' }, timeScale: { borderColor: '#dde0dc', timeVisible: false },
      crosshair: { vertLine: { color: '#9aa29d', width: 1 }, horzLine: { color: '#9aa29d', width: 1 } },
    });
    const equitySeries = chart.addSeries(AreaSeries, { lineColor: '#17724b', topColor: 'rgba(23,114,75,.20)', bottomColor: 'rgba(23,114,75,.01)', lineWidth: 2, priceFormat: { type: 'price', precision: 2, minMove: 0.01 } });
    equitySeries.setData(equity);
    const drawdownSeries = chart.addSeries(LineSeries, { color: '#b13e3e', lineWidth: 1, priceScaleId: 'drawdown', priceFormat: { type: 'percent', precision: 2, minMove: 0.01 } });
    drawdownSeries.setData(drawdown);
    chart.priceScale('drawdown').applyOptions({ scaleMargins: { top: .75, bottom: 0 }, visible: false });
    chart.timeScale().fitContent();
    const observer = new ResizeObserver((entries) => { const width = entries[0]?.contentRect.width; if (width) chart.applyOptions({ width }); });
    observer.observe(container.current);
    return () => { observer.disconnect(); chart.remove(); };
  }, [drawdown, equity]);
  return <div ref={container} className="chart" aria-label="净值与回撤图" />;
}
