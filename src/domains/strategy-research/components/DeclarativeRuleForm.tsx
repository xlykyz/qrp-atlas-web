import { useMemo, useState } from 'react';
import { Button, ErrorState, PartialSuccessState, StatusBadge } from '@/shared/ui';
import { initialRuleDraft, stableDefinitionKey, toDefinition, validateDraft } from '../lib/declarative';
import { useDeclarativeMutations } from '../hooks/queries';
import type { RuleDraft } from '../types/models';

const ops = [['gt', '大于'], ['gte', '大于等于'], ['lt', '小于'], ['lte', '小于等于'], ['eq', '等于'], ['ne', '不等于']] as const;

export function DeclarativeRuleForm() {
  const [draft, setDraft] = useState<RuleDraft>(initialRuleDraft);
  const [validatedDefinitionKey, setValidatedDefinitionKey] = useState<string | null>(null);
  const mutations = useDeclarativeMutations();
  const errors = useMemo(() => validateDraft(draft), [draft]);
  const definition = useMemo(() => toDefinition(draft), [draft]);
  const definitionKey = useMemo(() => stableDefinitionKey(definition), [definition]);
  const hasCurrentValidation = Boolean(mutations.validate.data?.ok && validatedDefinitionKey === definitionKey);

  const set = <K extends keyof RuleDraft>(key: K, value: RuleDraft[K]) => {
    setValidatedDefinitionKey(null);
    mutations.validate.reset();
    setDraft((current) => ({ ...current, [key]: value }));
  };
  const validate = () => {
    const submittedDefinitionKey = definitionKey;
    mutations.validate.mutate(definition, {
      onSuccess: (result) => setValidatedDefinitionKey(result.ok ? submittedDefinitionKey : null),
      onError: () => setValidatedDefinitionKey(null),
    });
  };
  const create = () => {
    if (hasCurrentValidation && mutations.validate.data) mutations.create.mutate(mutations.validate.data.normalized);
  };

  return <div className="stack">
    <PartialSuccessState title="受控规则编辑器" detail="只允许字段、白名单比较算子和字面量；不接收 Python、函数、导入或任意执行文本。" />
    <div className="form-grid">
      <label>策略代码<input className="input" value={draft.code} onChange={(event) => set('code', event.target.value)} /></label>
      <label>名称<input className="input" value={draft.name} onChange={(event) => set('name', event.target.value)} /></label>
      <label>版本<input className="input" value={draft.version} onChange={(event) => set('version', event.target.value)} /></label>
      <label>字段<input className="input" value={draft.field} onChange={(event) => set('field', event.target.value)} /></label>
      <label className="form-span-2">说明<input className="input" value={draft.description} onChange={(event) => set('description', event.target.value)} /></label>
    </div>
    <div className="rule-grid">
      <section><strong>进入条件</strong><select className="select" value={draft.entryOperator} onChange={(event) => set('entryOperator', event.target.value as RuleDraft['entryOperator'])}>{ops.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><input className="input" type="number" value={draft.entryValue} onChange={(event) => set('entryValue', Number(event.target.value))} /></section>
      <section><strong>退出条件</strong><select className="select" value={draft.exitOperator} onChange={(event) => set('exitOperator', event.target.value as RuleDraft['exitOperator'])}>{ops.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><input className="input" type="number" value={draft.exitValue} onChange={(event) => set('exitValue', Number(event.target.value))} /></section>
    </div>
    {errors.length ? <div className="form-errors">{errors.map((error) => <p key={error}>{error}</p>)}</div> : null}
    {hasCurrentValidation && mutations.validate.data ? <div className="validation-result"><StatusBadge tone="success">后端校验通过</StatusBadge><code>{mutations.validate.data.code}@{mutations.validate.data.version}</code></div> : null}
    {mutations.validate.isError ? <ErrorState title="后端校验未通过" error={mutations.validate.error} /> : null}
    {mutations.create.isError ? <ErrorState title="创建失败" error={mutations.create.error} /> : null}
    <div className="form-actions">
      <Button disabled={Boolean(errors.length) || mutations.validate.isPending} onClick={validate}>校验定义</Button>
      <Button variant="primary" disabled={Boolean(errors.length) || !hasCurrentValidation || mutations.create.isPending} onClick={create}>创建不可变版本</Button>
    </div>
  </div>;
}
