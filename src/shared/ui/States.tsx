import type { ReactNode } from 'react';
import { AlertTriangle, Database, LockKeyhole, RefreshCw, ShieldAlert, Split, TimerReset } from 'lucide-react';
import { Button } from './Button';
import { getErrorMessage } from '@/shared/api/errors';

export function LoadingState({ label = '正在加载数据…' }: { label?: string }) { return <div className="state-block state-block--loading"><span className="spinner" aria-hidden="true" /><span>{label}</span></div>; }
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) { return <div className="state-block"><Database size={20} aria-hidden="true" /><strong>{title}</strong>{description ? <p>{description}</p> : null}{action}</div>; }
export function ErrorState({ error, onRetry, title = '数据加载失败' }: { error: unknown; onRetry?: () => void; title?: string }) { return <div className="state-block state-block--error"><AlertTriangle size={20} aria-hidden="true" /><strong>{title}</strong><p>{getErrorMessage(error)}</p>{onRetry ? <Button size="sm" onClick={onRetry}><RefreshCw size={14} />重试</Button> : null}</div>; }
export function CapabilityUnavailable({ title, contract }: { title: string; contract: string }) { return <div className="state-block state-block--warning"><AlertTriangle size={20} aria-hidden="true" /><strong>{title}</strong><p>正式后端契约尚未部署。需要：<code>{contract}</code>。当前不会使用 Mock 冒充正式数据。</p></div>; }
export function StaleState({ title='数据可能已过期', detail }: { title?: string; detail: ReactNode }) { return <div className="state-banner state-banner--stale"><TimerReset size={16}/><strong>{title}</strong><span>{detail}</span></div>; }
export function PartialSuccessState({ title='部分数据可用', detail }: { title?: string; detail: ReactNode }) { return <div className="state-banner state-banner--partial"><Split size={16}/><strong>{title}</strong><span>{detail}</span></div>; }
export function ContractDriftState({ title='运行契约存在漂移', detail }: { title?: string; detail: ReactNode }) { return <div className="state-banner state-banner--contract"><ShieldAlert size={16}/><strong>{title}</strong><span>{detail}</span></div>; }
export function AccessState({ status }: { status: 401 | 403 }) { const forbidden=status===403; return <div className="state-block state-block--warning"><LockKeyhole size={20}/><strong>{forbidden?'当前账号无权访问':'需要登录'}</strong><p>{forbidden?'服务已识别当前账号，但该能力不在授权范围内。':'登录完成后应恢复当前 URL 与研究上下文。'}</p></div>; }
