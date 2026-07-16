import { AlertTriangle, CheckCircle2, Clock3, FlaskConical, NotebookPen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ApiError } from '@/shared/api/errors';
import { EmptyState, ErrorState, LoadingState, Panel, PanelBody, PanelHeader, StatusBadge } from '@/shared/ui';
import { isTaskActive, normalizeTaskStatus } from '@/domains/backtests/lib/status';
import type { BacktestTask } from '@/domains/backtests/types/models';

export function WorkQueuePanel({ date, tasks, isLoading, error, onRetry }: { date: string; tasks: BacktestTask[] | undefined; isLoading: boolean; error: unknown; onRetry: () => void }) {
  const active = (tasks ?? []).filter((task) => isTaskActive(task.status));
  const failed = (tasks ?? []).filter((task) => task.status.toLowerCase() === 'failed');
  const recent = [...active, ...failed].slice(0, 4);
  const unavailable = error instanceof ApiError && error.status === 404;
  return (
    <Panel>
      <PanelHeader title="工作队列" meta="把异常直接带入对应研究上下文" actions={<Link className="text-link" to="/backtests/tasks">全部任务</Link>} />
      <PanelBody>
        <div className="queue-shortcuts">
          <Link to={`/review/market?date=${date}`}><NotebookPen size={15} /><span><strong>完成市场复盘</strong><small>固定 {date} 上下文</small></span></Link>
          <Link to="/backtests/new"><FlaskConical size={15} /><span><strong>创建策略验证</strong><small>进入回测黄金流程</small></span></Link>
        </div>
        <div className="queue-section-title"><span>实验任务</span>{!error ? <StatusBadge tone={active.length ? 'warning' : 'success'}>{active.length} 个进行中</StatusBadge> : null}</div>
        {isLoading ? <LoadingState label="正在读取实验任务…" /> : unavailable ? <div className="inline-notice inline-notice--warning"><AlertTriangle size={15} /><div><strong>当前 API 部署未包含回测任务路由</strong><span>市场数据仍可使用；切换到 current-main API 后可恢复任务队列。</span></div></div> : error ? <ErrorState error={error} onRetry={onRetry} /> : recent.length === 0 ? <EmptyState title="没有待处理实验任务" description="进行中与失败任务均已清零。" /> : <div className="queue-list">{recent.map((task) => {
          const status = normalizeTaskStatus(task.status);
          return <Link key={task.task_id} to={`/backtests/tasks/${task.task_id}`}>
            {status.tone === 'danger' ? <AlertTriangle size={15} /> : status.tone === 'success' ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}
            <span><strong>{task.name}</strong><small>{task.strategy_code} · {task.updated_at.replace('T', ' ').slice(0, 16)}</small></span>
            <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
          </Link>;
        })}</div>}
      </PanelBody>
    </Panel>
  );
}
