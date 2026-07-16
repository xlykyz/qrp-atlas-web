import { Panel, PanelBody, PanelHeader, StatusBadge } from '@/shared/ui';

export function ResearchRecordCoverage({ phaseCount, tradeCount, phaseError, tradeError, phaseLoading, tradeLoading }: { phaseCount: number; tradeCount: number; phaseError: boolean; tradeError: boolean; phaseLoading: boolean; tradeLoading: boolean }) {
  const state = (loading: boolean, error: boolean) => error ? <StatusBadge tone="danger">失败</StatusBadge> : loading ? <StatusBadge tone="info">读取中</StatusBadge> : <StatusBadge tone="success">可用</StatusBadge>;
  return <Panel><PanelHeader title="当前覆盖" meta="真实 API 专用记录源" /><PanelBody><div className="record-coverage"><div><span><strong>市场阶段判断</strong><small>GET /api/phase</small></span><b>{phaseCount}</b>{state(phaseLoading, phaseError)}</div><div><span><strong>交易记录</strong><small>GET /api/trades</small></span><b>{tradeCount}</b>{state(tradeLoading, tradeError)}</div><div><span><strong>通用研究记录</strong><small>对象引用、正文、标签、状态</small></span><b>—</b><StatusBadge tone="warning">未部署</StatusBadge></div></div></PanelBody></Panel>;
}
