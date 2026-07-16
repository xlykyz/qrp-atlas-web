import { Link } from 'react-router-dom';
import { DatabaseZap, RotateCcw, Workflow } from 'lucide-react';
import { Panel, PanelBody, PanelHeader, StatusBadge } from '@/shared/ui';
import type { OpenApiDocument } from '../types/models';

export function OperationsJobsPanel({ openapi }: { openapi: OpenApiDocument | undefined }) {
  const paths = new Set(Object.keys(openapi?.paths ?? {}));
  const datasetsReady = paths.has('/api/operations/datasets');
  const runsReady = paths.has('/api/operations/runs');
  const tasksReady = paths.has('/api/backtest/tasks');
  return <div className="grid grid--2 operations-job-grid"><Panel><PanelHeader title="数据更新任务" meta="正式运行与补算工作流" actions={<StatusBadge tone={runsReady && datasetsReady ? 'success' : 'warning'}>{runsReady && datasetsReady ? '已部署' : '契约缺失'}</StatusBadge>} /><PanelBody><div className="operation-gap"><DatabaseZap size={22} /><strong>数据运行 API 尚未部署</strong><p>需要 <code>GET /api/operations/datasets</code>、<code>GET/POST /api/operations/runs</code> 和受权限控制的 retry 契约。当前不会用 SQL 控制台替代正式任务。</p></div></PanelBody></Panel><Panel><PanelHeader title="回测任务队列" meta="阶段二黄金工作流部署检查" actions={<StatusBadge tone={tasksReady ? 'success' : 'danger'}>{tasksReady ? '已部署' : '当前 live 缺失'}</StatusBadge>} /><PanelBody><div className="operation-gap"><Workflow size={22} /><strong>{tasksReady ? '回测任务契约可用' : 'live API 落后于 current-main'}</strong><p>{tasksReady ? '任务创建、状态和运行结果可通过正式工作流使用。' : '当前 OpenAPI 没有 /api/backtest/tasks，黄金工作流只能在 current-main API 环境使用。'}</p><Link className="button button--secondary button--sm" to="/backtests/tasks"><RotateCcw size={13} />打开任务工作区</Link></div></PanelBody></Panel></div>;
}
