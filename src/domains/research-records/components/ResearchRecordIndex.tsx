import { Link } from 'react-router-dom';
import { BookOpenText, CandlestickChart } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState, Panel, PanelBody, PanelHeader, StatusBadge } from '@/shared/ui';
import type { ResearchRecordItem } from '../types/models';

export function ResearchRecordIndex({ rows, total, isLoading, error, onRetry }: { rows: ResearchRecordItem[]; total: number; isLoading: boolean; error: unknown; onRetry: () => void }) {
  return <Panel><PanelHeader title="记录索引" meta={`显示 ${rows.length} / ${total} 条可用专用记录`} /><PanelBody className="panel__body--flush">{isLoading && total === 0 ? <LoadingState label="正在读取市场判断与交易记录..." /> : error && total === 0 ? <ErrorState error={error} onRetry={onRetry} title="无法读取现有记录" /> : rows.length === 0 ? <EmptyState title={total ? '当前筛选没有匹配记录' : '当前日期范围没有专用记录'} description={total ? '调整来源或搜索条件。' : '市场阶段和交易记录 API 均返回空数据。'} /> : <div className="record-index">{rows.map((row) => <Link key={`${row.kind}:${row.id}`} to={row.href}><span className={`record-index__icon record-index__icon--${row.kind}`}>{row.kind === 'phase' ? <BookOpenText size={15} /> : <CandlestickChart size={15} />}</span><span className="record-index__main"><strong>{row.title}</strong><small>{row.objectLabel} · {row.date ?? '日期未知'} · 来源 {row.source}</small>{row.summary ? <p>{row.summary}</p> : null}</span><StatusBadge tone={row.kind === 'phase' ? 'special' : row.status === '持仓中' ? 'info' : 'neutral'}>{row.status}</StatusBadge></Link>)}</div>}</PanelBody></Panel>;
}
