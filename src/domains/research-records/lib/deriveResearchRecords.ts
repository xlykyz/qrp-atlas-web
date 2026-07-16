import type { PhaseDto, RecordKind, ResearchRecordItem, TradeDto } from '../types/models';

export function defaultRecordRange(now = new Date()): { from: string; to: string } {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const to = `${map['year']}-${map['month']}-${map['day']}`;
  const start = new Date(`${to}T12:00:00Z`);
  start.setUTCFullYear(start.getUTCFullYear() - 1);
  return { from: start.toISOString().slice(0, 10), to };
}

export function toRecordItems(phases: PhaseDto[], trades: TradeDto[]): ResearchRecordItem[] {
  const phaseItems: ResearchRecordItem[] = phases.map((phase) => ({
    id: `phase:${phase.trade_date}`,
    kind: 'phase',
    date: phase.trade_date,
    title: phase.phase?.trim() || '未命名市场阶段',
    objectLabel: '市场日',
    summary: phase.notes,
    status: '人工判断',
    href: `/review/market?date=${encodeURIComponent(phase.trade_date)}`,
    source: '/api/phase',
  }));
  const tradeItems: ResearchRecordItem[] = trades.map((trade) => ({
    id: trade.trade_id,
    kind: 'trade',
    date: trade.entry_date,
    title: `${trade.ticker ?? '未知标的'} · ${trade.path_type?.trim() || '交易记录'}`,
    objectLabel: trade.ticker ?? '未知标的',
    summary: trade.notes,
    status: trade.exit_date ? '已退出' : '持仓中',
    href: trade.ticker ? `/research/stocks/${encodeURIComponent(trade.ticker)}?date=${encodeURIComponent(trade.entry_date ?? '')}&tab=trades` : '/research/stocks',
    source: '/api/trades',
  }));
  return [...phaseItems, ...tradeItems].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || a.id.localeCompare(b.id));
}

export function filterRecordItems(items: ResearchRecordItem[], kind: RecordKind, query: string): ResearchRecordItem[] {
  const normalized = query.trim().toLocaleLowerCase('zh-CN');
  return items.filter((item) => (kind === 'all' || item.kind === kind) && (!normalized || `${item.title} ${item.objectLabel} ${item.summary ?? ''}`.toLocaleLowerCase('zh-CN').includes(normalized)));
}
