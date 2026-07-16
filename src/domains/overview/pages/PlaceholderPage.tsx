import { CapabilityUnavailable, PageHeader, Panel, PanelBody, PanelHeader } from '@/shared/ui';

const content: Record<string, { title: string; description: string; contract: string }> = {
  today: { title: '今日工作台', description: '市场状态、待处理研究任务、数据新鲜度与最新实验的统一入口。', contract: '聚合式 /api/workspace/today（阶段三后端契约建议）' },
  review: { title: '市场复盘', description: '围绕交易日组织市场结构、行业主题、异常信号与证据。', contract: '现有 /api/review/* 与 /api/market-overview/* 的适配聚合' },
  research: { title: '研究中心', description: '个股、研究记录、动态产业与题材研究的连续工作空间。', contract: '现有股票与动态题材 API，缺口见阶段一审计' },
  operations: { title: '运行与诊断', description: '数据更新、服务健康、任务运行和系统诊断。', contract: '/api/health、/api/data/* 与诊断契约' },
};
export function PlaceholderPage({ kind }: { kind: keyof typeof content }) { const item = content[kind]!; return <div className="stack"><PageHeader eyebrow="阶段三业务域" title={item.title} description={item.description} /><Panel><PanelHeader title="能力边界" meta="黄金样板完成后按价值顺序建设" /><PanelBody><CapabilityUnavailable title="此业务域尚未进入阶段二黄金样板" contract={item.contract} /></PanelBody></Panel></div>; }
