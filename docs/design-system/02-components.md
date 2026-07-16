# Design System 组件规范

> 状态：阶段一 SSOT

## 1. 分层

```text
Primitives        Button, Input, Select, Checkbox, Tabs, Tooltip, Popover, Dialog
Data display      Badge, Metric, Table, DefinitionList, Status, Freshness, EmptyState
Research patterns ObjectHeader, ContextBar, EvidenceItem, ActivityFeed, FilterBar
Charts            ChartFrame, Legend, Tooltip, EquityChart, DrawdownChart
Workflow          TaskStatus, StepTimeline, ConfigSummary, ErrorPanel, QueryBoundary
Shell             AppHeader, PrimaryNav, GlobalSearch, AgentDrawer, PageFrame
```

业务域可以组合 Design System，但不能把股票、题材或回测 DTO 放入通用组件。

## 2. 核心 Primitives

### Button

变体：`primary`、`secondary`、`ghost`、`danger`、`link`；尺寸：28/32/38px。

- 页面主操作最多一个 primary；
- 图标按钮必须有 accessible name 和 tooltip；
- loading 保留原宽度；
- disabled 与 pending 区分；
- 不使用彩色渐变按钮。

### Input / Select / Date control

- 默认 32px，高密度场景 28px；
- 标签、描述、单位、错误为统一 Field 结构；
- 错误不通过 placeholder 表达；
- 日期控件使用可用交易日并支持键盘；
- 数字输入明确最小/最大/step 和后端单位。

### Tabs

- 使用下边线和文字权重表达选中；
- 支持路由 tab；
- tab 内容局部加载，不重复对象头；
- 超宽时横向滚动，不压缩成不可读图标。

### Overlay

Popover 用于轻量选择，Drawer 用于可持续上下文，Dialog 用于阻塞决策。禁止用 Modal 承载完整分析页面。

## 3. 数据展示

### StatusBadge

状态集合按业务域映射到有限语义：neutral/info/success/warning/danger/special。文本是事实来源，颜色只增强。

建议映射：

- task queued → neutral；running → info；succeeded → success；failed → danger；
- freshness fresh → success；stale → warning；unknown → neutral；partial → warning；
- theme emerging → warning；active → market-up soft；diverging → info；dormant → neutral。

### FreshnessIndicator

显示新鲜度标签、数据时间、相对预期和警告入口。紧凑态用于上下文栏，完整态用于系统页。不得只显示绿点。

### MetricStrip

每项包含 label/value/unit/delta/help。支持 2–8 列自适应。值缺失显示 `—` 和原因 tooltip；不允许将 `null` 格式化为 0。

### DataTable

统一列定义、排序、空态、加载行、数字格式、sticky header、容器滚动和行选择。业务表格列由 domain 定义，通用表格不理解 DTO。

### DefinitionList

用于配置、口径、元数据和诊断，避免为了少量键值创建卡片墙。

## 4. 研究模式组件

### ContextBar

常驻显示：面包屑、对象、as-of/交易日、新鲜度、版本、警告、主操作。宽度不足时，低优先级元数据折叠到“详情”。

### ObjectHeader

标题、稳定标识、状态、简述、元数据和操作。股票显示 ticker/name；策略显示 code/version；run 显示 name/run_id；不把所有信息塞进标题行。

### EvidenceItem

必须支持：来源类型、标题、摘录、published/available/observed 时间、支持/反对/未知立场、可信度/审核状态、打开来源。引用文本受版权与长度约束，产品默认显示短摘录。

### ActivityFeed

按时间展示事件、状态变化、任务和用户记录；事件类型用小型语义标记，不使用大型插画。支持按对象和类型过滤。

### FilterBar

基础筛选保持可见，高级筛选进入 Popover/Drawer；已生效条件以可移除 token 展示；“清除”只影响筛选，不改变对象或全局交易日。

## 5. 页面状态组件

### QueryBoundary

统一处理 initial loading、error、empty；refreshing、stale、partial 由内容区域叠加。支持 retry，保留错误 detail 和 request id（若有）。

### EmptyState

分为：无数据、筛选无结果、能力未接入、无权限。使用简洁图标或无图标，不使用营销插画。

### ErrorPanel

显示错误摘要、后端 detail、发生时间、影响模块、重试和系统诊断链接。开发环境可展开技术信息；生产不泄露敏感配置。

### CapabilityUnavailable

用于后端尚缺正式接口的页面：说明当前不可用能力、缺失契约、预期数据来源和不使用 Mock 的原因。它不是 404。

## 6. 回测组件

### StrategySelector

展示策略名、code、version、family、scope、产品支持状态和依赖；搜索和选择分离。禁止硬编码正式策略目录。

### SchemaField

将 ParameterSpecDTO 转成明确字段：type、required、default、range、enum、description。未知类型退化为 JSON/文本并给出警告，不悄悄忽略。

### BacktestConfigForm

业务分组：策略参数、范围/股票池、基准、组合约束、成本、执行。表单只产出前端模型，由 mapper 生成 CreateBacktestTaskRequest。

### TaskStatusPanel

显示 status、created/updated、run_id、error 和请求快照。运行中轮询；完成提供“打开结果”；失败提供“修改配置”。

### RunSummary

包含核心绩效、相对基准、交易/跳过、成本和诊断状态。指标缺失时展示不可用原因，不用 0。

### RunResultTabs

固定 tab：概览、绩效、交易、成本、暴露、诊断、配置。后端 artifact 不存在时 tab 仍可见但显示明确缺失状态，便于判断产品完整度。

### RunCompareMatrix

行是指标/配置/诊断，列是运行；支持锁定基线、突出差异、跳转运行。2–10 个运行，选择写入 URL。

## 7. 图表框架

ChartFrame 提供标题、结论、范围、legend、loading/empty/error、单位、数据说明和工具区。具体 renderer 可使用 lightweight-charts 或 SVG，但数据转换必须在 domain lib。

- EquityChart：组合、基准、可选超额；
- DrawdownChart：负向面积与区间；
- RollingChart：可选窗口，后端 rolling 数据；
- Distribution：优先简单直方/条形，不引入重型图表库只为单图；
- 所有图表正确销毁实例并通过 ResizeObserver 更新。

## 8. App Shell

### AppHeader

44px 深色栏。品牌左侧，主导航居中/左对齐，右侧为搜索、状态、Agent、用户。当前 nav 用底边线而非大胶囊。

### GlobalSearch

结果按股票、题材、策略、运行、研究记录分组；后端未统一搜索前由各域并行查询或仅启用已有域。不得把数据库表名作为普通搜索结果。

### AgentDrawer

宽 440px，显示作用域、引用、未知项和提案动作。打开时不改变主页面路由；需要可分享的 Agent run 使用独立 run id 参数或详情页。

## 9. 组件验收

每个公共组件至少验证：

- 键盘与 focus；
- disabled/pending/error；
- 长中文、长英文 ID、空值；
- 1280/1024/768 宽度；
- 高对比市场红绿与非颜色状态；
- 不依赖具体 domain DTO；
- 不在组件内部发请求（QueryBoundary 除外也只消费状态）。
