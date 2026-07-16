import { Building2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState, Panel, PanelBody, PanelHeader, StatusBadge } from '@/shared/ui';
import type { ResearchVisitDto, StockReportDto } from '../types/models';

interface FeedItem {
  id: string;
  kind: 'report' | 'visit';
  date: string | null;
  ticker: string;
  name: string;
  title: string;
  source: string;
  meta: string;
}

function toFeedItems(reports: StockReportDto[], visits: ResearchVisitDto[]): FeedItem[] {
  const reportItems: FeedItem[] = reports.map((item) => ({
    id: `report-${item.info_code}`,
    kind: 'report',
    date: item.publish_date,
    ticker: normalizeTicker(item.stock_code ?? ''),
    name: item.stock_name || item.stock_code || '未知标的',
    title: item.title || '未命名研报',
    source: item.org_sname || '研究机构',
    meta: [item.em_rating_name, item.researcher].filter(Boolean).join(' · '),
  }));
  const visitItems: FeedItem[] = visits.map((item, index) => ({
    id: `visit-${item.secu_code}-${item.notice_date ?? index}`,
    kind: 'visit',
    date: item.notice_date,
    ticker: normalizeTicker(item.secu_code),
    name: item.sec_name || item.secu_code,
    title: `${item.receive_way || '机构调研'} · ${item.org_count ?? '—'} 家机构`,
    source: item.source || '调研公告',
    meta: `接待日 ${item.receive_date || '未知'}`,
  }));
  return [...reportItems, ...visitItems]
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
    .slice(0, 8);
}

export function ResearchFeedPanel({ reports, visits, isLoading, error, onRetry }: { reports: StockReportDto[] | undefined; visits: ResearchVisitDto[] | undefined; isLoading: boolean; error: unknown; onRetry: () => void }) {
  const items = toFeedItems(reports ?? [], visits ?? []);
  return (
    <Panel>
      <PanelHeader title="最新研究证据" meta="研报与机构调研按披露日期合并，不代表 QRP 观点" actions={<Link className="text-link" to="/research/stocks">进入个股研究</Link>} />
      <PanelBody>
        {isLoading ? <LoadingState label="正在读取研究证据…" /> : error ? <ErrorState error={error} onRetry={onRetry} /> : items.length === 0 ? <EmptyState title="没有近期研报或调研记录" /> : <div className="evidence-feed">{items.map((item) => <Link key={item.id} to={`/research/stocks/${item.ticker}?date=${item.date ?? ''}&tab=research`}>
          <span className={`evidence-feed__icon evidence-feed__icon--${item.kind}`}>{item.kind === 'report' ? <FileText size={14} /> : <Building2 size={14} />}</span>
          <span className="evidence-feed__main"><strong>{item.title}</strong><small>{item.name} · {item.source}{item.meta ? ` · ${item.meta}` : ''}</small></span>
          <span className="evidence-feed__date"><StatusBadge tone={item.kind === 'report' ? 'info' : 'special'}>{item.kind === 'report' ? '研报' : '调研'}</StatusBadge><time>{item.date || '—'}</time></span>
        </Link>)}</div>}
      </PanelBody>
    </Panel>
  );
}

function normalizeTicker(value: string): string {
  if (!value) return value;
  if (value.includes('.')) return value;
  return value.startsWith('6') || value.startsWith('9') ? `${value}.SH` : `${value}.SZ`;
}
