import type { ReactNode } from 'react';
import { AlertTriangle, Database, RotateCw } from 'lucide-react';
import { Button } from './Button';
import { getErrorMessage } from '@/shared/api/errors';

export function LoadingState({ label = '正在加载数据…' }: { label?: string }) {
  return <div className="state-block state-block--loading"><span className="spinner" aria-hidden="true" /><span>{label}</span></div>;
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="state-block"><Database size={20} aria-hidden="true" /><strong>{title}</strong>{description ? <p>{description}</p> : null}{action}</div>;
}

export function ErrorState({ error, onRetry, title = '数据加载失败' }: { error: unknown; onRetry?: () => void; title?: string }) {
  return <div className="state-block state-block--error"><AlertTriangle size={20} aria-hidden="true" /><strong>{title}</strong><p>{getErrorMessage(error)}</p>{onRetry ? <Button size="sm" onClick={onRetry}><RotateCw size={14} />重试</Button> : null}</div>;
}

export function CapabilityUnavailable({ title, contract }: { title: string; contract: string }) {
  return <div className="state-block state-block--warning"><AlertTriangle size={20} aria-hidden="true" /><strong>{title}</strong><p>正式后端契约尚未部署。需要：<code>{contract}</code>。当前不会使用 Mock 冒充正式数据。</p></div>;
}
