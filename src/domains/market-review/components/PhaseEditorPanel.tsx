import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button, ErrorState, Field, Input, LoadingState, Panel, PanelBody, PanelHeader, StatusBadge } from '@/shared/ui';
import { getErrorMessage } from '@/shared/api/errors';
import { formatDateTime } from '@/shared/lib/format';
import { useSavePhase } from '../hooks/queries';
import type { PhaseDto, PhaseWrite } from '../types/models';

const signals: Array<{ key: keyof Pick<PhaseWrite, 'M1_core' | 'M2_front' | 'M3_identifiable' | 'V_triggered'>; label: string; description: string }> = [
  { key: 'M1_core', label: 'M1 核心', description: '核心条件成立' },
  { key: 'M2_front', label: 'M2 前置', description: '前置条件成立' },
  { key: 'M3_identifiable', label: 'M3 可识别', description: '结构可被识别' },
  { key: 'V_triggered', label: 'V 已触发', description: '触发条件出现' },
];

function toModel(date: string, value?: PhaseDto): PhaseWrite {
  return { trade_date: date, phase: value?.phase ?? '', M1_core: value?.M1_core ?? false, M2_front: value?.M2_front ?? false, M3_identifiable: value?.M3_identifiable ?? false, V_triggered: value?.V_triggered ?? false, notes: value?.notes ?? '' };
}

interface PhaseEditorPanelProps {
  date: string;
  value: PhaseDto | undefined;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

function PhaseEditorForm({ date, value, isLoading, error, onRetry }: PhaseEditorPanelProps) {
  const [model, setModel] = useState<PhaseWrite>(() => toModel(date, value));
  const save = useSavePhase(date);

  const patch = <K extends keyof PhaseWrite>(key: K, next: PhaseWrite[K]) => setModel((current) => ({ ...current, [key]: next }));
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    save.mutate({ ...model, phase: model.phase?.trim() || null, notes: model.notes?.trim() || null });
  };

  if (isLoading && !value) return <Panel><PanelHeader title="日度阶段判断" meta={date} /><PanelBody><LoadingState label="正在读取人工阶段记录..." /></PanelBody></Panel>;
  if (error && !value) return <Panel><PanelHeader title="日度阶段判断" meta={date} /><PanelBody><ErrorState error={error} onRetry={onRetry} title="无法读取阶段记录" /></PanelBody></Panel>;

  return <Panel>
    <PanelHeader title="日度阶段判断" meta={value ? `最近保存 ${formatDateTime(value.created_at)}` : `${date} 尚无人工记录`} actions={value ? <StatusBadge tone="info">已记录</StatusBadge> : <StatusBadge tone="warning">待判断</StatusBadge>} />
    <PanelBody><form className="phase-editor" onSubmit={submit}>
      <Field label="阶段标签" description="人工研究判断，不由前端行情阈值生成"><Input value={model.phase ?? ''} onChange={(event) => patch('phase', event.target.value)} placeholder="输入当日阶段" disabled={isLoading || save.isPending} /></Field>
      <div className="phase-signals">{signals.map((signal) => <label key={signal.key}><input type="checkbox" checked={Boolean(model[signal.key])} onChange={(event) => patch(signal.key, event.target.checked)} disabled={isLoading || save.isPending} /><span><strong>{signal.label}</strong><small>{signal.description}</small></span></label>)}</div>
      <Field label="复盘备注"><textarea className="input phase-notes" value={model.notes ?? ''} onChange={(event) => patch('notes', event.target.value)} placeholder="记录证据、分歧和下一步观察" disabled={isLoading || save.isPending} /></Field>
      <div className="phase-editor__footer"><span>{save.isError ? <span className="down">保存失败：{getErrorMessage(save.error)}</span> : save.isSuccess ? <span className="up">已写入 QRP Atlas API</span> : '保存会按交易日写入或更新后端阶段记录。'}</span><Button type="submit" variant="primary" disabled={isLoading || save.isPending}><Save size={14} />{save.isPending ? '保存中...' : '保存判断'}</Button></div>
    </form></PanelBody>
  </Panel>;
}

export function PhaseEditorPanel(props: PhaseEditorPanelProps) {
  return <PhaseEditorForm key={`${props.date}-${props.value?.created_at ?? 'empty'}`} {...props} />;
}
