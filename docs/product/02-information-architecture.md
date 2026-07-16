# 信息架构、页面地图与导航

> 状态：阶段一 SSOT

## 1. IA 设计方法

信息架构按用户工作过程组织，不映射后端目录。一级导航回答六类稳定问题：现在做什么、今天发生什么、研究哪个对象、验证哪个方法、回测结果如何、系统是否可信。

## 2. 一级导航

| 导航 | 用户问题 | 默认入口 | 说明 |
| --- | --- | --- | --- |
| 今日 | 我现在最该处理什么？ | `/today` | 市场状态、未完成研究、运行任务、数据新鲜度 |
| 复盘 | 指定交易日发生了什么？ | `/review/market` | 市场结构、日度判断、交易与复盘记录 |
| 研究 | 哪个对象值得继续研究？ | `/research/stocks` | 个股、题材/产业、研究记录 |
| 策略 | 这个研究方法是什么、能否验证？ | `/strategies` | 指标、因子、策略目录与版本 |
| 回测 | 如何配置、运行、分析和比较？ | `/backtests` | 新建、任务、运行、比较 |
| 系统 | 数据和服务是否可信？ | `/operations` | API、数据覆盖、更新、任务与诊断 |

“开发工具”“数据库预览”“原始数据”不进入一级导航。必要时仅在系统页的受控“开发诊断”区域提供链接，并默认隐藏。

## 3. 二级导航与页面地图

```text
/today

/review
  /review/market?date=YYYY-MM-DD&scope=all
  /review/journal?date=YYYY-MM-DD&kind=phase|trade

/research
  /research/stocks?query=&board=&date=
  /research/stocks/:ticker?date=&adjustment=&range=&tab=overview|events|research|trades|notes
  /research/themes?asOf=&state=&sort=&query=
  /research/themes/:themeId?asOf=&cycle=&tab=overview|members|chain|evidence|timeline|versions
  /research/notes?objectType=&objectId=&status=&tag=&from=&to=
  /research/notes/:noteId

/strategies
  /strategies?kind=indicator|factor|strategy&scope=&query=
  /strategies/:code?version=&tab=definition|parameters|dependencies|runs
  /strategies/declarative/new
  /strategies/declarative/:code/:version

/backtests
  /backtests                         # 回测工作区总览
  /backtests/new?strategy=&version=  # 创建实验
  /backtests/tasks?status=&strategy=&from=&to=
  /backtests/tasks/:taskId
  /backtests/runs?strategy=&status=&from=&to=
  /backtests/runs/:runId?tab=overview|performance|trades|costs|exposures|diagnostics|config
  /backtests/compare?run=:id&run=:id

/operations
  /operations?tab=overview|data|jobs|diagnostics
  /operations/data/:dataset

/login                               # database auth 模式
/not-found
```

当前没有真实后端契约的页面可以进入路由和设计系统，但必须显示“能力尚未接入”与所需契约，不得使用无标识的正式 Mock。

## 4. 导航结构

### 4.1 App Shell

- 顶部深色产品栏：品牌、六个一级导航、全局搜索、API/数据状态、Agent 入口、用户菜单。
- 上下文栏：当前交易日/as-of、当前对象、面包屑、数据新鲜度、版本与页面主操作。
- 主内容区：页面模板决定单列、主从、分析工作区或对象详情布局。
- 可选右侧上下文抽屉：Agent、证据、任务详情、筛选详情；不永久占用所有页面宽度。

采用顶部主导航而不是固定宽侧栏，原因是研究终端需要最大化横向表格/图表空间，同时保持当前对象、时间和数据状态在视线顶部。

### 4.2 导航状态

- 一级导航只表达稳定业务域；二级导航位于页面标题区或局部 tab。
- 当前交易日、股票、题材、策略和 run 是显式上下文，不通过隐藏全局 state 传递。
- 跨域动作使用“带上下文跳转”，例如从股票详情创建回测时携带 ticker/date；从 run 进入比较时携带 run id。
- 浏览器前进/后退必须恢复有价值筛选。

## 5. 页面职责

### 今日工作台 `/today`

第一屏回答：最新有效交易日是什么、市场处于什么状态、哪些变化需要处理、哪些任务仍在运行、数据是否新鲜。由市场快照、异常队列、近期研究与任务流组成，不复制所有业务页面。

### 市场复盘 `/review/market`

固定交易日上下文，呈现市场广度、涨跌停、指数、分布、强弱表格和日度判断。表格行可进入个股详情；判断与交易记录进入复盘日志。

### 个股详情 `/research/stocks/:ticker`

对象头部常驻 ticker、名称、交易日、复权、数据新鲜度。主区为价格/成交与指标图表，辅助区按 tab 展示事件、研报/调研、交易和研究记录。禁止再次形成巨型单文件。

### 题材详情 `/research/themes/:themeId`

沿用动态产业题材库的产品语言：生命周期、状态解释、指标带、催化、产业链、成员双轴、证据、风险、事件时间轴和版本切换。Agent 在当前题材与 as-of 范围内工作。

### 策略详情 `/strategies/:code`

展示目录定义、版本、参数 schema、依赖指标、股票池/执行约束、关联运行。页面本身不执行策略；“创建回测”进入配置页。

### 回测新建 `/backtests/new`

使用步骤化但不做营销向导：左侧/顶部明确当前策略，主体按“研究假设—范围—组合—成本执行—确认”分组；右侧持续显示校验、配置摘要和数据限制。

### 任务详情 `/backtests/tasks/:taskId`

显示任务状态机、时间、请求快照、错误和 run 链接。轮询只针对运行中任务；失败可复制错误并基于快照重建配置。

### 运行详情 `/backtests/runs/:runId`

首屏给出结论性指标、相对基准、净值/回撤和诊断摘要；tab 承载绩效、交易、成本、暴露、诊断、配置与可复现性。所有指标口径来自后端标准结果。

### 比较 `/backtests/compare`

2–10 个运行，URL 多值 `run` 保存选择。提供指标矩阵、曲线叠加、配置差异和诊断差异；不在前端重新计算绩效。

### 系统运行 `/operations`

从研究可信度而非运维后台视角组织：API 可用性、数据集最近日期/行数、数据新鲜度、任务失败、artifact 缺失、版本不一致。原始表浏览仅为受控下钻。

## 6. 窄屏退化

产品桌面优先，目标 1280px 以上。窄屏规则：

- 1024–1279px：隐藏低优先级辅助列，右侧面板改抽屉，指标带允许换行；
- 768–1023px：一级导航可横向滚动，主从布局改单列，表格保持容器内横向滚动；
- 小于 768px：保证查询、状态、关键指标和基础操作可用，不承诺完整复杂图表编辑体验；
- 禁止页面级横向滚动和内容被固定栏遮挡。

## 7. 路由命名原则

- 使用复数资源名与业务语言，不沿用 `/raw`、`/logs` 等含糊旧名；
- path 表达对象身份，search params 表达可恢复视图状态；
- tab 使用稳定枚举，不把临时 UI 文案写入 URL；
- ID 统一 encode，未知参数安全回退并给出提示；
- URL 变化不得触发不必要的全页重载。
