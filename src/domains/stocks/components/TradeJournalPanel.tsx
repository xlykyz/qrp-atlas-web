import { useState } from 'react';
import type { FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { Button, EmptyState, ErrorState, Field, Input, LoadingState, Panel, PanelBody, PanelHeader, StatusBadge } from '@/shared/ui';
import { getErrorMessage } from '@/shared/api/errors';
import { formatNumber } from '@/shared/lib/format';
import { useCreateTrade } from '../hooks/queries';
import type { TradeDto, TradeWrite } from '../types/models';

function emptyTrade(ticker: string, date: string): TradeWrite {
  return { ticker, entry_date: date, entry_price: null, path_type: '', half_sell_trigger: null, half_sell_date: null, half_sell_price: null, exit_date: null, exit_price: null, position_pct: null, notes: '' };
}

function TradeCreateForm({ ticker, date }: { ticker: string; date: string }) {
  const [model, setModel] = useState(() => emptyTrade(ticker, date));
  const create = useCreateTrade(ticker);
  const patch = <K extends keyof TradeWrite>(key: K, value: TradeWrite[K]) => setModel((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate({ ...model, path_type: model.path_type?.trim() || null, notes: model.notes?.trim() || null }, { onSuccess: () => setModel(emptyTrade(ticker, date)) });
  };
  return <form className="trade-create-form" onSubmit={submit}><div className="form-grid"><Field label="入场日期"><Input type="date" value={model.entry_date ?? ''} onChange={(event) => patch('entry_date', event.target.value || null)} required /></Field><Field label="入场价格"><Input type="number" min="0" step="0.001" value={model.entry_price ?? ''} onChange={(event) => patch('entry_price', event.target.value ? Number(event.target.value) : null)} required /></Field><Field label="路径类型"><Input value={model.path_type ?? ''} onChange={(event) => patch('path_type', event.target.value)} placeholder="研究路径或交易类型" /></Field><Field label="仓位值" description="当前后端契约未声明单位"><Input type="number" min="0" step="0.01" value={model.position_pct ?? ''} onChange={(event) => patch('position_pct', event.target.value ? Number(event.target.value) : null)} /></Field><Field label="半仓触发价"><Input type="number" step="0.01" value={model.half_sell_trigger ?? ''} onChange={(event) => patch('half_sell_trigger', event.target.value ? Number(event.target.value) : null)} /></Field><Field label="备注"><Input value={model.notes ?? ''} onChange={(event) => patch('notes', event.target.value)} placeholder="入场依据与观察条件" /></Field></div><div className="trade-create-footer"><span>{create.isError ? <span className="down">创建失败：{getErrorMessage(create.error)}</span> : create.isSuccess ? <span className="up">交易记录已创建</span> : '提交后由 QRP Atlas API 生成 trade_id；仓位单位需后端补充契约。'}</span><Button type="submit" variant="primary" disabled={create.isPending}><Plus size={14} />{create.isPending ? '创建中...' : '创建交易记录'}</Button></div></form>;
}

export function TradeJournalPanel({ ticker, date, rows, isLoading, error, onRetry }: { ticker: string; date: string; rows: TradeDto[] | undefined; isLoading: boolean; error: unknown; onRetry: () => void }) {
  return <div className="stack"><Panel><PanelHeader title="新建交易记录" meta="研究记录中的交易事实，不是实盘下单" /><PanelBody><TradeCreateForm key={`${ticker}-${date}`} ticker={ticker} date={date} /></PanelBody></Panel><Panel><PanelHeader title="历史交易记录" meta={`${rows?.length ?? 0} 条`} /><PanelBody className="panel__body--flush">{isLoading && !rows ? <LoadingState /> : error && !rows ? <ErrorState error={error} onRetry={onRetry} /> : !rows?.length ? <EmptyState title="该标的尚无交易记录" description="可以在上方记录研究交易；这里不会触发实盘委托。" /> : <div className="data-table-wrap"><table className="data-table"><thead><tr><th>状态</th><th>入场</th><th className="numeric">入场价</th><th>路径</th><th className="numeric">仓位原始值</th><th>半仓</th><th>退出</th><th className="numeric">退出价</th><th>备注</th></tr></thead><tbody>{rows.map((trade) => <tr key={trade.trade_id}><td><StatusBadge tone={trade.exit_date ? 'neutral' : 'info'}>{trade.exit_date ? '已退出' : '持仓中'}</StatusBadge><div className="table-subtitle">{trade.trade_id}</div></td><td>{trade.entry_date ?? '—'}</td><td className="numeric">{formatNumber(trade.entry_price, 3)}</td><td>{trade.path_type ?? '—'}</td><td className="numeric">{formatNumber(trade.position_pct, 4)}</td><td>{trade.half_sell_date ?? '—'}<div className="table-subtitle">{formatNumber(trade.half_sell_price, 3)}</div></td><td>{trade.exit_date ?? '—'}</td><td className="numeric">{formatNumber(trade.exit_price, 3)}</td><td>{trade.notes ?? '—'}</td></tr>)}</tbody></table></div>}</PanelBody></Panel></div>;
}
