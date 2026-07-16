import { EmptyState, ErrorState, LoadingState, Panel, PanelBody, PanelHeader, StatusBadge } from '@/shared/ui';
import { deriveContractStatuses } from '../lib/deriveOperations';
import type { OpenApiDocument } from '../types/models';

export function ContractDiagnosticsPanel({ openapi, isLoading, error, onRetry }: { openapi: OpenApiDocument | undefined; isLoading: boolean; error: unknown; onRetry: () => void }) {
  if (isLoading && !openapi) return <LoadingState label="正在读取运行时 OpenAPI..." />;
  if (error && !openapi) return <ErrorState error={error} onRetry={onRetry} title="无法读取运行时契约" />;
  if (!openapi) return <EmptyState title="没有 OpenAPI 文档" />;
  const rows = deriveContractStatuses(Object.keys(openapi.paths));
  const missingRequired = rows.filter((item) => item.priority === 'required' && !item.deployed).length;
  return <Panel><PanelHeader title="前后端契约诊断" meta={`${openapi.info.title ?? 'API'} ${openapi.info.version ?? '未知版本'} · ${Object.keys(openapi.paths).length} paths`} actions={<StatusBadge tone={missingRequired ? 'warning' : 'success'}>{missingRequired ? `${missingRequired} 个必需缺口` : '必需契约完整'}</StatusBadge>} /><PanelBody className="panel__body--flush"><div className="data-table-wrap"><table className="data-table"><thead><tr><th>产品域</th><th>能力</th><th>运行时路径</th><th>优先级</th><th>部署状态</th></tr></thead><tbody>{rows.map((item) => <tr key={item.path}><td>{item.group}</td><td><strong>{item.label}</strong></td><td><code>{item.path}</code></td><td>{item.priority === 'required' ? '当前必需' : '计划契约'}</td><td><StatusBadge tone={item.deployed ? 'success' : item.priority === 'required' ? 'danger' : 'warning'}>{item.deployed ? '已部署' : '未部署'}</StatusBadge></td></tr>)}</tbody></table></div></PanelBody></Panel>;
}
