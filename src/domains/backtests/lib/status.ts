import type { StatusTone } from '@/shared/ui/StatusBadge';

const labels: Record<string, string> = { queued: '排队中', pending: '待运行', running: '运行中', completed: '已完成', succeeded: '已完成', failed: '失败', cancelled: '已取消' };
export function normalizeTaskStatus(status: string): { label: string; tone: StatusTone } {
  const key = status.toLowerCase();
  if (['completed', 'succeeded'].includes(key)) return { label: labels[key] ?? status, tone: 'success' };
  if (['running'].includes(key)) return { label: labels[key] ?? status, tone: 'info' };
  if (['queued', 'pending'].includes(key)) return { label: labels[key] ?? status, tone: 'warning' };
  if (['failed', 'cancelled'].includes(key)) return { label: labels[key] ?? status, tone: key === 'failed' ? 'danger' : 'neutral' };
  return { label: status || '未知', tone: 'neutral' };
}
export const isTaskActive = (status: string) => ['queued', 'pending', 'running'].includes(status.toLowerCase());
