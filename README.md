# QRP Atlas Web

QRP Atlas Web 是 QRP Atlas 的正式个人专业交易研究终端，围绕每日工作、市场复盘、对象研究、策略实验、回测分析与运行诊断组织，而不是按后端模块堆叠菜单。

## 仓库边界

- `qrp-atlas`：数据、契约、指标、因子、策略、回测、认证与 API。
- `qrp-atlas-web`：正式主 Web，本仓库。
- `qrp-global-atlas`：独立的全球资本事件三维终端，品牌一致、代码独立。

本仓库不访问 DuckDB/PostgreSQL，不复制 Python 算法，不依赖旧 `qrp-atlas/web` UI，也不会在 API 失败后自动切换 Mock。

## 当前能力

- 今日工作台、市场复盘、个股研究、研究记录；
- 指标目录、内置策略与声明式策略研究；
- 因子研究契约边界；
- 动态产业题材正式路由与证据/契约边界；
- 回测创建、任务、结果、诊断与比较；
- 数据覆盖、运行状态和 OpenAPI 契约诊断；
- 上下文 Agent 抽屉（正式 Agent API 尚未部署，不提供假聊天）。

## 运行

要求 Node.js 20+。API 地址必须显式配置：

```powershell
Copy-Item .env.example .env.local
npm ci
npm run dev
```

`.env.local` 示例：

```env
VITE_API_BASE_URL=http://192.168.0.102:8000
VITE_API_TIMEOUT_MS=120000
VITE_ENABLE_QUERY_DEVTOOLS=false
```

未配置 `VITE_API_BASE_URL` 时应用会明确报错，不会静默连接硬编码地址。生产环境应使用 HTTPS API。

## 质量门禁

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
```

## SSOT

产品、设计、架构、审计与交付文档位于 `docs/`。当前状态见 `docs/delivery/STATUS.md`。
