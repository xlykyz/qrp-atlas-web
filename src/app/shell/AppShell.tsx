import { Activity, Bot, Command, Globe2 } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { env } from '@/shared/config/env';
import { AgentDrawer } from './AgentDrawer';

const nav = [
  { to: '/today', label: '今日' },
  { to: '/review', label: '复盘' },
  { to: '/research', label: '研究' },
  { to: '/strategies', label: '策略' },
  { to: '/backtests', label: '回测' },
  { to: '/operations', label: '系统' },
];

const contextNames: Record<string, string> = {
  today: '今日工作台', review: '市场复盘', research: '研究中心', strategies: '策略研究', backtests: '回测实验室', operations: '运行与诊断',
};

export function AppShell() {
  const location = useLocation();
  const [agentOpen, setAgentOpen] = useState(false);
  const section = location.pathname.split('/').filter(Boolean)[0] ?? 'today';
  return (
    <div className="app-frame">
      <header className="app-header">
        <NavLink to="/today" className="brand" aria-label="QRP Atlas 首页"><Globe2 size={18} /><span>QRP ATLAS</span><small>研究终端</small></NavLink>
        <nav className="primary-nav" aria-label="主导航">
          {nav.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? 'active' : undefined}>{item.label}</NavLink>)}
        </nav>
        <div className="header-status"><Activity size={13} /><span>API</span><code>{new URL(env.apiBaseUrl).host}</code></div>
        <button className="header-action" type="button" aria-expanded={agentOpen} onClick={() => setAgentOpen(true)}><Bot size={16} /><span>研究 Agent</span></button>
        <span className="command-hint"><Command size={13} />K</span>
      </header>
      <div className="context-bar">
        <div className="context-bar__title"><span className="context-dot" />{contextNames[section] ?? 'QRP Atlas'}</div>
        <div className="context-bar__meta"><span>上下文由 URL 保留</span><span>数据源：QRP Atlas API</span><span>Mock 回退：关闭</span></div>
      </div>
      <main className="app-main"><Outlet /></main>
      <AgentDrawer open={agentOpen} onClose={() => setAgentOpen(false)} pathname={location.pathname} search={location.search} />
    </div>
  );
}
