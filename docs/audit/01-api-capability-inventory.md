# API 能力盘点与已知接口缺口

> 审计日期：2026-07-16
> 后端基线：`qrp-atlas main@a307e58e138677cadcc38a0da2148639b1f99a5c`
> Live：`http://192.168.0.102:8000`

## 1. 审计结论

- 当前 main OpenAPI 有 **53 个 path**；局域网 live OpenAPI 有 **28 个 path**。
- live 服务健康且包含真实市场/研究数据与基础回测结果读取，但未部署 main 中的认证、策略/指标目录、回测任务、扩展结果 artifact、比较、重放和声明式策略路由。
- 黄金工作流所需后端契约已在 main 源码存在，但必须运行/部署当前 main 才能完成真实“创建任务→结果→比较”。
- 动态产业题材、通用研究记录、正式数据运行/更新任务仍无生产 API。
- 本仓库保存两个 OpenAPI 快照：
  - `openapi-main-a307e58.json`
  - `openapi-live-2026-07-16.json`

## 2. 当前 main 能力

### 2.1 认证

| 方法 | Path | 用途 | 前端结论 |
| --- | --- | --- | --- |
| GET | `/api/auth/me` | 当前用户 | App 启动探测；local/database 模式 |
| POST | `/api/auth/login` | 登录并签发 session | database 模式 |
| POST | `/api/auth/logout` | 退出 | Bearer token |

业务路由通过 `CurrentUser` 获取 owner，前端不得传 `owner_user_id`。live 暂无这些路由。

### 2.2 市场与股票

| Path | 能力 | 主要页面 |
| --- | --- | --- |
| `/api/daily` | 按日期或 ticker 查询日线/派生字段，支持复权模式 | 今日、市场复盘、个股 |
| `/api/daily/dates` | 可用交易日期 | 全局日期、复盘 |
| `/api/stock/list` | 股票列表 | 股票搜索/选择 |
| `/api/stock/{ticker}` | 股票资料 | 个股详情 |
| `/api/index-daily` | 指数日线 | 市场复盘 |
| `/api/index-daily/codes` | 指数代码 | 复盘/基准选择 |
| `/api/zt-pool` | 涨停池 | 今日/复盘 |
| `/api/dt-pool` | 跌停池 | 今日/复盘 |
| `/api/adj-factor` | 复权因子 | 个股诊断，通常不直接作为主页面 |

`daily` 当前可支撑市场表格和个股价格图，但首页的统一市场状态摘要需要前端对返回事实做轻量展示聚合，或后端新增快照 API 以减少传输和口径重复。

### 2.3 复盘与交易记录

| Path | 能力 | 结论 |
| --- | --- | --- |
| GET/POST `/api/phase` | 读取/创建市场阶段判断 | 可迁移到复盘日志 |
| GET/POST `/api/trades` | 读取/创建交易记录 | 可迁移到个股/复盘 |
| PATCH `/api/trades/{trade_id}` | 更新交易记录 | 可迁移 |

缺少 phase 更新/删除契约；需确认“同日重建”还是只追加。交易模型是交易记录，不等价于通用研究笔记。

### 2.4 研究资料

| Path | 能力 | 结论 |
| --- | --- | --- |
| `/api/reports/stock` | 个股研报 | 个股 research tab |
| `/api/reports/industry` | 行业研报 | 题材/行业研究辅助 |
| `/api/visits` | 调研活动 | 个股 research tab |

目前仅查询，无通用研究笔记、标签、对象引用和全文搜索 API。

### 2.5 指标、策略与声明式策略

| Path | 能力 | 结论 |
| --- | --- | --- |
| `/api/indicators` | 指标/计算/因子目录 | 策略研究目录 |
| `/api/strategies` | live registry 策略目录 | 黄金流程策略选择；需要 CurrentUser |
| `/api/strategies/{code}` | 指定版本及 parameter schema | schema 表单 |
| `/api/declarative-strategies/validate` | 校验声明式策略 | 编辑器 |
| `/api/declarative-strategies` | 创建/列表 | 声明式策略管理 |
| `/api/declarative-strategies/{code}/{version}` | 读取版本 | 详情 |
| `/api/declarative-strategies/{code}/versions` | 新版本 | 版本管理 |
| `/api/declarative-strategies/{code}/{version}/status` | 状态变更 | 发布流程 |

正式策略参数默认值、范围、enum 和说明均来自 `parameter_schema`，前端不得硬编码目录。

### 2.6 回测任务

| 方法 | Path | 能力 |
| --- | --- | --- |
| POST | `/api/backtest/tasks` | 创建并默认执行真实组合回测任务 |
| GET | `/api/backtest/tasks` | 当前 owner 的任务列表 |
| GET | `/api/backtest/tasks/{task_id}` | 当前 owner 的任务详情 |

创建请求包含：strategy code/version/params、universe mode/preset/index/tickers、日期、benchmark、position、cost、execution。任务记录包含 status、error、run_id、request_snapshot 和时间。

现状限制：

- API 没有取消任务、重试任务或服务端分页；
- 后端当前默认同步执行，长任务期间 POST 可能持续较久，前端必须有较长 timeout/明确 pending；
- status 枚举未在 OpenAPI 中收紧为 literal；前端 adapter 需容错未知状态；
- 无任务事件/日志流。

### 2.7 标准回测结果

基础：

- `/api/backtest/runs`
- `/api/backtest/runs/{run_id}`
- `/summary`、`/equity`、`/trades`、`/skipped`、`/config`

扩展 artifact：

- `/orders`、`/fills`、`/snapshots`
- `/daily-returns`、`/rolling`、`/costs`
- `/diagnostics`、`/benchmark`、`/exposures`、`/reproducibility`

比较与重放：

- GET/POST `/api/backtest/compare`，2–10（路由仅检查非空和最多 10，产品最少 2）个 run；
- POST `/api/backtest/runs/{run_id}/replay`。

owner 由后端对每个 run 强制校验。前端不重新计算 summary 或替代缺失 artifact。

### 2.8 系统与开发

| Path | 能力 | 产品位置 |
| --- | --- | --- |
| `/api/health` | API/数据库健康与表名 | 系统概览 |
| `/api/stats` | 表行数、日期范围、数据库大小 | 系统数据覆盖 |
| `/api/tables`、schema、query | 通用表浏览 | 受控开发诊断，不做一级入口 |
| `/api/dev/sql` | SQL 执行 | 不进入正式普通用户主流程 |

`/api/stats` 暴露数据库路径等实现细节，生产展示需要 adapter 过滤；`/api/dev/sql` 必须由部署环境限制或关闭。

## 3. Live 与 main 差异

live 缺少以下 main 能力：

```text
/api/auth/*
/api/indicators
/api/strategies*
/api/backtest/tasks*
/api/backtest/compare
/api/backtest/runs/* 的 orders/fills/snapshots/daily-returns/rolling/costs/
  diagnostics/benchmark/exposures/reproducibility/replay
/api/declarative-strategies*
```

因此阶段二黄金流程的真实验收环境应选择：

1. 在本机从 `main@a307e58` 启动 API 并使用本地真实数据库/结果；或
2. 将局域网服务部署到该 main 及相同数据环境。

前端系统页会显示契约版本漂移，不能把 live 404 当作业务空数据。

## 4. 产品所需但缺失的最小契约

### G1 今日工作台聚合（P1）

当前可由多个 API 拼装 MVP，但建议减少传输和口径分散：

```http
GET /api/workbench/today?trade_date=
```

建议返回：effective trade date、market breadth、limit counts、index snapshots、running/failed task counts、data freshness/warnings、recent user work ids。市场事实由后端计算，前端只展示。

### G2 通用研究记录（P1）

```http
GET  /api/research-notes?object_type=&object_id=&status=&tag=&from=&to=&cursor=
POST /api/research-notes
GET  /api/research-notes/{id}
PATCH /api/research-notes/{id}
DELETE /api/research-notes/{id}
```

最小字段：id、owner_user_id（仅响应）、object_refs、title、body、status、tags、as_of、created_at、updated_at。禁止前端以 localStorage 作为正式长期事实源。

### G3 动态产业/题材（P1/P2）

采用 `动态产业题材库v0.1` 已提出的 `/api/themes`、members、metrics、cycles、chain-links、events、versions、evidence、proposal、monitor、agent contracts。当前完全缺失；新 Web 只实现 adapter 边界、不可用状态和后续接入点。

### G4 数据运行与更新（P1）

```http
GET  /api/operations/datasets
GET  /api/operations/runs?status=&dataset=&from=&to=
GET  /api/operations/runs/{id}
POST /api/operations/runs              # 受权限控制的更新/补算请求
POST /api/operations/runs/{id}/retry
```

返回预期频率、latest_available_at、watermark、coverage、status、warnings、started/finished、error、affected datasets。不能用通用 SQL 代替。

### G5 市场快照与复盘聚合（P2）

```http
GET /api/market-review/{trade_date}
```

返回统一口径的 breadth、distribution、limit statistics、index summary、market phase 和 data version。MVP 可由现有 daily/index/phase 组合，但正式长期应减少浏览器下载全市场数据后重复计算。

### G6 股票统一研究详情（P2）

现有接口可并行组合；建议提供轻量元数据 envelope 或 BFF 聚合，至少统一 freshness/warnings，不要求把所有大时间序列合并为一个响应。

### G7 回测任务增强（P2）

- 服务端分页/筛选；
- 明确 task status enum；
- 异步队列与 progress/events；
- cancel/retry-from-snapshot；
- 创建接口返回 202 和任务位置（若改异步）。

这些不是阶段二黄金流程的绝对阻塞，但影响长任务体验。

## 5. 契约适配原则

- 每个 domain 自有 DTO 与 mapper，不让 OpenAPI response 直接进入 UI；
- 对 live/main 差异使用 capability detection + 明确提示，不使用 Mock 回退；
- 404 区分“资源不存在”和“路由未部署”；可结合启动时 capability probe；
- 缺 freshness envelope 时统一为 `unknown`；
- owner、PIT、绩效、策略目录由后端权威；
- 系统/开发响应在 adapter 中去除数据库绝对路径等敏感实现细节。
