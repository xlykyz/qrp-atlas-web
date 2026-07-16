# 阶段二验证报告：产品基础与回测黄金样板

> 验收日期：2026-07-16
> 前端仓库：`E:\projects\qrp-atlas-web`
> 后端仓库：`E:\projects\qrp-atlas`
> 后端基线：`main@a307e58e138677cadcc38a0da2148639b1f99a5c`

## 1. 交付结论

阶段二已完成本地验收。新 Web 已形成独立工程底座，并通过真实 QRP Atlas API 完成以下黄金流程：

```text
策略目录与策略契约
→ URL 恢复策略/版本
→ 根据 parameter_schema 配置参数
→ 创建真实回测任务
→ 查看任务状态与持久化请求快照
→ 打开标准 run
→ 查看指标、净值/回撤、交易、成本、诊断与复现配置
→ 通过 URL 选择多个 run
→ 调用真实 compare 契约进行横向比较
```

正式流程没有静态数据替代，也没有在 API 失败时自动回退 Mock。尚未进入阶段三的业务域使用明确的不可用状态，不伪装为已接入产品能力。

## 2. 工程与产品范围

已交付：

- React 19、Vite、TypeScript strict、React Router；
- TanStack Query 与集中式原生 `fetch` API Client；
- App Providers、App Error Boundary、App Shell、主导航和 URL 上下文；
- Design Tokens、基础 Design System、统一表格/指标/面板/状态组件；
- loading、empty、error、unavailable、success 状态；
- `lightweight-charts` 图表适配与数据转换边界；
- backtests domain 内的 API、hooks、types、lib、components、pages 分层；
- Vitest、Testing Library、MSW 测试底座；
- 本地、远程和生产 API 地址环境模板。

黄金流程路由：

```text
/strategies
/strategies/:code
/backtests
/backtests/new?strategy=:code&version=:version
/backtests/tasks
/backtests/tasks/:taskId
/backtests/runs
/backtests/runs/:runId?tab=overview|trades|diagnostics|config
/backtests/compare?run=:runId&run=:runId
```

## 3. 真实 API 环境

验收 API：`http://127.0.0.1:8001`。

已验证端点：

- `GET /api/health`
- `GET /api/auth/me`
- `GET /api/strategies`
- `GET /api/strategies/{code}`
- `POST /api/backtest/tasks`
- `GET /api/backtest/tasks`
- `GET /api/backtest/tasks/{task_id}`
- `GET /api/backtest/runs`
- `GET /api/backtest/runs/{run_id}/summary`
- `GET /api/backtest/runs/{run_id}/equity`
- `GET /api/backtest/runs/{run_id}/trades`
- `GET /api/backtest/runs/{run_id}/skipped`
- `GET /api/backtest/runs/{run_id}/costs`
- `GET /api/backtest/runs/{run_id}/diagnostics`
- `GET /api/backtest/runs/{run_id}/config`
- `GET /api/backtest/compare`

认证为后端本地模式，验收用户为 `ryan`。健康检查返回 `ok`。

### 3.1 受控 QA 数据

本机原先没有正式 DuckDB。为验证真实 HTTP 契约和真实回测引擎，使用后端现有自动测试 fixture `_make_classic_db(...)` 生成受控 QA 数据库：

```text
E:\projects\qrp-atlas\data\db\quant.db
```

该数据库、任务和结果均处于后端既有忽略规则内，没有进入 Git；`qrp-atlas` 源码未修改。新前端不依赖该 fixture，不包含数据库访问，也没有 QA 数据回退逻辑。

### 3.2 可复核任务与结果

用于双结果比较：

| 任务 | task id | run id | 状态 |
| --- | --- | --- | --- |
| QA 双均线 3/8 | `task_ca127a2ad088` | `run_2f2c2e349e68` | succeeded / 非 Mock |
| QA 双均线 5/15 | `task_a91dab737bac` | `run_fde0a6de2db0` | succeeded / 非 Mock |

浏览器端从表单重新创建并完成：

| 任务 | task id | run id | 参数 | 状态 |
| --- | --- | --- | --- | --- |
| 浏览器验收 双均线 4/12 | `task_db27662c144f` | `run_de1a801f2313` | `fast_window=4`、`slow_window=12` | succeeded / 非 Mock |

比较上下文：

```text
/backtests/compare?run=run_2f2c2e349e68&run=run_fde0a6de2db0
```

真实比较结果已显示累计收益、年化收益、最大回撤、Sharpe、Sortino、Calmar、交易次数和成本，并保留两个 run 的配置快照。

## 4. 浏览器与视觉验收

完成页面检查：

- 回测实验室总览；
- 策略目录；
- URL 预选策略的新建回测表单；
- 任务状态与请求快照；
- 标准结果概览；
- 交易、诊断、配置与复现页签；
- 双结果比较；
- 通过 UI 创建真实任务并跳转到任务详情。

结果：

- 页面显示 `127.0.0.1:8001` 真实 API 上下文；
- 策略选择会更新 `strategy` 与 `version` URL 参数；
- 创建任务后 URL 进入真实 `task_id`；
- `lightweight-charts` 已创建并获得非零尺寸，净值/回撤图正常 resize；
- 主要页面控制台无应用 error/warning；
- 1440、1280、1024、768 宽度均完成检查；
- 1280/1024/768 下页面没有文档级横向溢出，图表与主内容随容器收缩；
- 768 下导航保持可用、工作流改为单列、关键指标和任务入口保留；
- 视觉为浅色、高密度、克制的研究终端语言，没有营销 Hero、大面积渐变或巨型圆角卡片。

## 5. 自动化验证

阶段二提交前最终门禁应全部通过：

```text
npm run lint
npm run typecheck
npm run test
npm run build
```

现有测试覆盖：

- null/数字/百分比/日期格式；
- A 股涨跌色彩语义；
- task status normalization；
- compare URL parser；
- 动态策略表单默认值、校验和请求映射；
- API HTTP 错误与 JSON parse 错误；
- MSW 黄金流程：策略目录、创建任务、任务详情、summary、compare。

## 6. 已知后端契约与数据问题

以下问题只记录，不在前端重算或掩盖：

### 6.1 交易次数口径不一致

标准 summary 的 `trade_count` 为 `0`，但同一 run：

- `/trades` 返回 1 条 open trade；
- diagnostics 的 `trade_count` 为 `1`。

前端按各端点原始口径展示，并在产品诊断中保留可追溯性。建议后端明确 open trade 是否计入 summary，并统一三个端点的定义。

### 6.2 基准结果缺失

QA 数据库包含 `index_daily` 与 `000300.SH`，请求也包含该 benchmark，但 summary 的 benchmark 指标仍为 `null`，diagnostics 返回：

```text
benchmark_requested_but_data_missing
benchmark_missing
```

建议检查产品 service 向 benchmark loader 传递默认数据库路径和日期范围的链路。前端不会自行读取数据库或重算基准。

### 6.3 目标部署契约落后

2026-07-16 检查的局域网 API `http://192.168.0.102:8000` 只有 28 个 OpenAPI path，而当前 main 快照有 53 个 path。局域网部署缺少策略、任务、compare 和扩展 artifacts 等黄金流程契约。

正式发布新 Web 前，目标 API 环境必须先部署当前 main 等价契约，并完成 CORS、auth mode 和 owner isolation 验证。

## 7. 阶段三入口条件

阶段三继续遵守阶段一 SSOT 和本阶段黄金样板，按用户工作流而非旧页面顺序推进：

1. 今日工作台：交易日、市场摘要、数据/任务异常和最近工作；
2. 市场复盘：daily/index/涨跌停/phase 的真实 API 组合；
3. 个股研究：价格、资料、研报、调研、阶段判断和交易记录；
4. 研究记录与复盘闭环；
5. 指标、因子与策略研究扩展；
6. 系统数据覆盖与诊断；
7. 动态产业题材在正式后端契约到位后接入。

阶段三不得复制旧 `qrp-atlas/web/` 的页面结构或 UI 组件。
