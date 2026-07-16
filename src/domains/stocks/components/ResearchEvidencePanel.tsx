import { ExternalLink, FileText, Users } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState, Panel, PanelBody, PanelHeader, StatusBadge } from '@/shared/ui';
import type { ResearchVisitDto, StockReportDto } from '../types/models';

function EvidenceText({ value }: { value: string | null }) {
  if (!value) return <span className="muted">无正文摘要</span>;
  return <p>{value.replace(/\s+/g, ' ').trim()}</p>;
}

export function ResearchEvidencePanel({ reports, visits, isLoading, error, onRetry }: { reports: StockReportDto[] | undefined; visits: ResearchVisitDto[] | undefined; isLoading: boolean; error: unknown; onRetry: () => void }) {
  if (isLoading && !reports && !visits) return <LoadingState label="正在读取研报与机构调研..." />;
  if (error && !reports && !visits) return <ErrorState error={error} onRetry={onRetry} />;
  const hasEvidence = Boolean(reports?.length || visits?.length);
  return <div className="stack">
    {error ? <div className="inline-notice inline-notice--warning"><div><strong>研究证据仅返回部分数据</strong><span>已保留可用记录，未将缺失接口解释为无研究资料。</span></div></div> : null}
    {!hasEvidence && !error ? <EmptyState title="截至当前日期没有研报或调研记录" description="这是后端查询结果，不代表标的没有其他公开信息。" /> : null}
    {reports?.length ? <Panel><PanelHeader title="券商研报" meta={`${reports.length} 条 · 外部研究观点，不代表 QRP 判断`} /><PanelBody className="panel__body--flush"><div className="research-document-list">{reports.map((report) => <details key={report.info_code}><summary><span className="evidence-feed__icon"><FileText size={14} /></span><span><strong>{report.title ?? '未命名研报'}</strong><small>{report.org_sname ?? '机构未知'} · {report.researcher ?? '研究员未知'} · {report.publish_date ?? '日期未知'}</small></span><StatusBadge tone="info">{report.em_rating_name ?? '无评级'}</StatusBadge></summary><div className="research-document-content"><EvidenceText value={report.notice_content} />{report.attach_url ? <a className="text-link" href={report.attach_url} target="_blank" rel="noreferrer"><ExternalLink size={13} />打开原始附件</a> : null}</div></details>)}</div></PanelBody></Panel> : null}
    {visits?.length ? <Panel><PanelHeader title="机构调研" meta={`${visits.length} 条 · 来源 ${visits[0]?.source ?? '未知'}`} /><PanelBody className="panel__body--flush"><div className="research-document-list">{visits.map((visit, index) => <details key={`${visit.secu_code}-${visit.notice_date}-${index}`}><summary><span className="evidence-feed__icon evidence-feed__icon--visit"><Users size={14} /></span><span><strong>{visit.receive_way ?? visit.announcement_title ?? '机构调研'}</strong><small>{visit.receive_date ?? visit.notice_date ?? '日期未知'} · {visit.org_count ?? '—'} 家机构 · {visit.receive_place ?? '地点未知'}</small></span><StatusBadge tone="special">调研</StatusBadge></summary><div className="research-document-content"><EvidenceText value={visit.content} /></div></details>)}</div></PanelBody></Panel> : null}
  </div>;
}
