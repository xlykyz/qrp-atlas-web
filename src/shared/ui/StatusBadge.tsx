import clsx from 'clsx';
import type { ReactNode } from 'react';

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'special';

export function StatusBadge({ tone = 'neutral', children }: { tone?: StatusTone; children: ReactNode }) {
  return <span className={clsx('status-badge', `status-badge--${tone}`)}>{children}</span>;
}
