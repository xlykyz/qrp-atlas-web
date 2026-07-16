import { Link } from 'react-router-dom';
import { EmptyState, PageHeader } from '@/shared/ui';
export function NotFoundPage() { return <div className="stack"><PageHeader eyebrow="404" title="页面不存在" description="该 URL 不属于当前 QRP Atlas Web 信息架构。" /><EmptyState title="无法打开此研究上下文" action={<Link className="button button--primary button--sm" to="/today">返回今日工作台</Link>} /></div>; }
