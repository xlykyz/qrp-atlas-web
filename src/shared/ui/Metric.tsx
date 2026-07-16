import type { ReactNode } from 'react';
import clsx from 'clsx';

export function MetricStrip({ children }: { children: ReactNode }) {
  return <div className="metric-strip">{children}</div>;
}

export function Metric({ label, value, meta, tone = 'default' }: { label: string; value: ReactNode; meta?: ReactNode; tone?: 'default' | 'up' | 'down' | 'warning' }) {
  return <div className="metric"><span className="metric__label">{label}</span><strong className={clsx('metric__value', `metric__value--${tone}`)}>{value}</strong>{meta ? <span className="metric__meta">{meta}</span> : null}</div>;
}
