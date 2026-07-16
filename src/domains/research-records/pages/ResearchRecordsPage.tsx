import { useEffect, useMemo } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, CapabilityUnavailable, PageHeader, StatusBadge } from '@/shared/ui';
import { ResearchRecordCoverage } from '../components/ResearchRecordCoverage';
import { ResearchRecordIndex } from '../components/ResearchRecordIndex';
import { researchRecordKeys, useResearchRecordSources } from '../hooks/queries';
import { defaultRecordRange, filterRecordItems, toRecordItems } from '../lib/deriveResearchRecords';
import type { RecordKind } from '../types/models';

export function ResearchRecordsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaults = useMemo(() => defaultRecordRange(), []);
  const from = searchParams.get('from') ?? defaults.from;
  const to = searchParams.get('to') ?? defaults.to;
  const kindValue = searchParams.get('kind');
  const kind: RecordKind = kindValue === 'phase' || kindValue === 'trade' ? kindValue : 'all';
  const query = searchParams.get('query') ?? '';
  const validRange = from <= to;
  const sources = useResearchRecordSources(from, to, validRange);
  const queryClient = useQueryClient();
  const allRows = toRecordItems(sources.phases.data ?? [], sources.trades.data ?? []);
  const rows = filterRecordItems(allRows, kind, query);
  const sourceError = sources.phases.error ?? sources.trades.error;

  useEffect(() => {
    if (!searchParams.has('from') || !searchParams.has('to')) setSearchParams((current) => { const next = new URLSearchParams(current); if (!next.has('from')) next.set('from', defaults.from); if (!next.has('to')) next.set('to', defaults.to); return next; }, { replace: true });
  }, [defaults.from, defaults.to, searchParams, setSearchParams]);

  const update = (key: 'from' | 'to' | 'kind' | 'query', value: string) => setSearchParams((current) => { const next = new URLSearchParams(current); if (value && !(key === 'kind' && value === 'all')) next.set(key, value); else next.delete(key); return next; });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: researchRecordKeys.all });

  return <div className="stack research-records-page">
    <PageHeader eyebrow="研究过程" title="研究记录" description="统一回看已经写入 QRP Atlas 的专用市场判断与交易事实，并明确通用研究笔记尚缺的正式契约。" meta={<><StatusBadge tone="success">真实 API</StatusBadge><span>{from} 至 {to}</span><span>{allRows.length} 条可用记录</span></>} actions={<><Link className="button button--secondary button--md" to={`/research/stocks?date=${to}`}>进入个股研究</Link><Button onClick={refresh}><RefreshCw size={14} />刷新</Button></>} />
    <div className="record-filterbar"><label><span>起始</span><input className="input" type="date" value={from} onChange={(event) => update('from', event.target.value)} aria-label="记录起始日期" /></label><label><span>截止</span><input className="input" type="date" value={to} onChange={(event) => update('to', event.target.value)} aria-label="记录截止日期" /></label><div className="segmented-control" aria-label="记录来源">{(['all', 'phase', 'trade'] as const).map((value) => <button type="button" key={value} className={kind === value ? 'active' : ''} onClick={() => update('kind', value)}>{value === 'all' ? '全部' : value === 'phase' ? '市场判断' : '交易记录'}</button>)}</div><label className="market-search record-search"><Search size={14} /><input value={query} onChange={(event) => update('query', event.target.value)} placeholder="搜索对象或内容" aria-label="搜索研究记录" /></label></div>
    {!validRange ? <div className="inline-notice inline-notice--warning"><div><strong>日期范围无效</strong><span>起始日期不能晚于截止日期，修正后才会请求记录 API。</span></div></div> : sourceError && allRows.length ? <div className="inline-notice inline-notice--warning"><div><strong>记录源仅部分可用</strong><span>当前索引不是完整结果，失败来源已在右侧标明。</span></div></div> : null}
    <div className="grid grid--main-aside record-workspace"><ResearchRecordIndex rows={rows} total={allRows.length} isLoading={sources.phases.isLoading || sources.trades.isLoading} error={validRange ? sourceError : new Error('日期范围无效')} onRetry={() => { void sources.phases.refetch(); void sources.trades.refetch(); }} /><aside className="stack"><ResearchRecordCoverage phaseCount={sources.phases.data?.length ?? 0} tradeCount={sources.trades.data?.length ?? 0} phaseError={sources.phases.isError} tradeError={sources.trades.isError} phaseLoading={sources.phases.isLoading} tradeLoading={sources.trades.isLoading} /><CapabilityUnavailable title="通用研究记录尚未部署" contract="GET/POST/PATCH /api/research-notes" /></aside></div>
  </div>;
}
