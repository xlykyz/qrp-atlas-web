import { StatusBadge } from '@/shared/ui';
import { normalizeTaskStatus } from '../lib/status';
export function TaskStatusBadge({ status }: { status: string }) { const view = normalizeTaskStatus(status); return <StatusBadge tone={view.tone}>{view.label}</StatusBadge>; }
