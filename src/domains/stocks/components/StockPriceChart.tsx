import { useEffect, useMemo, useRef } from 'react';
import { CandlestickSeries, ColorType, createChart, HistogramSeries } from 'lightweight-charts';
import { toCandles, toVolume } from '../lib/stockResearch';
import type { DailyQuoteDto } from '../types/models';

export function StockPriceChart({ rows, label }: { rows: DailyQuoteDto[]; label: string }) {
  const container = useRef<HTMLDivElement>(null);
  const candles = useMemo(() => toCandles(rows), [rows]);
  const volume = useMemo(() => toVolume(rows), [rows]);

  useEffect(() => {
    if (!container.current) return;
    const chart = createChart(container.current, {
      height: 390,
      layout: { background: { type: ColorType.Solid, color: '#ffffff' }, textColor: '#68716b', fontFamily: 'Inter, Segoe UI, sans-serif', fontSize: 11 },
      grid: { vertLines: { color: '#eef0ed' }, horzLines: { color: '#eef0ed' } },
      rightPriceScale: { borderColor: '#dde0dc', scaleMargins: { top: .08, bottom: .28 } },
      timeScale: { borderColor: '#dde0dc', timeVisible: false },
      crosshair: { vertLine: { color: '#9aa29d', width: 1 }, horzLine: { color: '#9aa29d', width: 1 } },
    });
    const priceSeries = chart.addSeries(CandlestickSeries, { upColor: '#b13e3e', downColor: '#17724b', borderUpColor: '#b13e3e', borderDownColor: '#17724b', wickUpColor: '#b13e3e', wickDownColor: '#17724b', priceFormat: { type: 'price', precision: 2, minMove: .01 } });
    priceSeries.setData(candles);
    const volumeSeries = chart.addSeries(HistogramSeries, { priceScaleId: 'volume', priceFormat: { type: 'volume' } });
    volumeSeries.setData(volume);
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: .78, bottom: 0 }, visible: false });
    chart.timeScale().fitContent();
    const observer = new ResizeObserver((entries) => { const width = entries[0]?.contentRect.width; if (width) chart.applyOptions({ width }); });
    observer.observe(container.current);
    return () => { observer.disconnect(); chart.remove(); };
  }, [candles, volume]);

  return <div ref={container} className="stock-chart" aria-label={`${label} K 线与成交量图`} />;
}
