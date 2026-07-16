# 实施与验收方案

> 状态：阶段一 SSOT
> 原则：每阶段独立可构建、可运行、可回滚；黄金样板未验证前不批量复制页面。

## 1. 阶段划分

### 阶段一：产品与架构基线

交付：产品定位、JTBD、IA、页面地图、导航、模板、交互原则、Tokens、组件规范、技术架构、API 审计、迁移矩阵、后端缺口、实施验收。

验收：

- 文档之间路由、术语和边界一致；
- 明确旧前端只作能力清单；
- 明确 live/main API 漂移；
- 明确黄金工作流可用与阻塞契约；
- Git 有独立阶段提交。

### 阶段二：产品基础与黄金样板

#### 2A 工程底座

- Vite + React + strict TypeScript；
- lint/typecheck/test/build；
- App providers、Router、ErrorBoundary；
- Design Tokens 和核心 UI；
- App Shell、ContextBar、responsive behavior；
- API client、auth/capability probe、Query client；
- 本地/远程/生产环境模板。

#### 2B 黄金回测工作流

实现：

```text
策略目录
→ 策略详情/schema
→ 新建回测配置
→ POST 真实任务
→ 任务详情/状态
→ 标准 run 详情
→ summary/equity/drawdown/trades/skipped/config
→ benchmark/costs/exposures/diagnostics/reproducibility
→ 多 run 比较
```

要求：

- 针对 current main API；
- 真实数据验收使用本机 main API 或升级后的局域网 API；
- 运行结果 artifact 局部加载/局部失败；
- URL 恢复 strategy/version、task、run、tab、compare ids；
- 无自动 Mock 回退；
- 任务 error detail 可见；
- 至少覆盖一个成功任务、一个校验失败、一个缺失 artifact 和比较流程。

阶段二完成门禁：

```text
npm run lint
npm run typecheck
npm run test
npm run build
真实 API smoke test
桌面 1440/1280 与窄屏 1024/768 检查
```

### 阶段三：核心产品建设

按价值顺序：

1. 今日工作台骨架 + API/任务/数据状态；
2. 市场复盘（真实 daily/index/zt/dt/phase）；
3. 个股研究（真实 stock/daily/reports/visits/trades）；
4. 复盘日志与研究记录（phase/trade 先落地，通用 note 等后端契约）；
5. 指标/因子/策略研究与声明式策略；
6. 动态产业题材（后端契约到位后接入；此前只交付不可用状态/适配边界）；
7. 系统数据覆盖与诊断（health/stats；运行更新待契约）。

每个域必须复用阶段二的页面模板和状态体系，页面不承载请求/复杂表格/图表生命周期。

### 阶段四：核对与切换

- 逐项核对迁移矩阵；
- 输出覆盖、废弃、延期及原因；
- 验证旧 URL 重定向；
- 建立部署、灰度、回滚和切换方案；
- 定义旧 `web/` 删除条件，不直接删除。

## 2. 工作包与依赖

| 工作包 | 依赖 | 可验收输出 |
| --- | --- | --- |
| Foundation | 阶段一 | 可运行 shell、tokens、router、error boundary |
| API/Auth | Foundation + main OpenAPI | health/me/capabilities、错误映射 |
| Backtest Catalog | API | 真实策略目录/详情 |
| Backtest Create | Catalog | schema 表单、真实 POST |
| Task Tracking | Create | 状态/错误/run link |
| Run Analytics | Task | 标准 artifacts 与状态 |
| Compare | Run Analytics | URL compare 和矩阵/曲线 |
| Market Review | Foundation/API | 真实交易日复盘 |
| Stock Research | Market Review/API | 真实个股闭环 |
| Notes/Themes/Ops | 后端契约或已有 API | 正式接口或明确不可用状态 |

## 3. 测试策略

### 单元测试

- DTO → domain mapper；
- 数字/日期/百分比格式（含 null/NaN/0）；
- schema 参数默认值、enum、range、日期与 ticker 校验；
- task status normalization；
- chart series 排序、缺失点、单位；
- URL parser/builder round-trip；
- live/main capability detection。

### 组件测试

- QueryBoundary 的 loading/empty/error/stale/partial；
- 表单错误定位、提交 pending、后端 detail；
- TaskStatus 停止轮询；
- Run tabs 的局部 artifact 失败；
- Compare run add/remove 和最多 6；
- ErrorBoundary fallback。

### 集成测试（MSW）

- catalog → create → task succeeded → run artifacts；
- 创建 400 保留表单；
- 401 登录恢复；
- 路由未部署 404 显示 capability mismatch；
- partial run（summary 有、exposure 无）；
- compare 请求和 URL 恢复。

### 真实 API smoke

- GET health、auth/me、strategies；
- 创建小范围/低成本真实任务；
- 读取 task/run/summary/equity/trades/diagnostics/config；
- 使用至少两个现有或新 run compare；
- 记录 API 基址、后端 commit、run ids 与结果，不提交私有 token/数据库。

## 4. 代码质量验收

- TypeScript `strict: true`，无 `skipLibCheck` 之外的宽松逃逸；
- 禁止业务代码无说明 `any`；API 未知 JSON 从 `unknown` 进入 mapper；
- pages 主要组合，建议 <250 行，>300 行必须拆分或 ADR；
- domain 不导入其他 domain internals；
- API 调用只在集中 client/facade；
- 所有 interval、observer、chart instance、abort controller 正确清理；
- 不直接访问数据库或结果目录；
- Mock 生产禁用、无失败自动回退；
- build bundle warning 有记录且按路由拆分。

## 5. 产品验收场景

### A 每日启动

打开 `/today`，看到明确交易日、API/数据状态、市场摘要、运行/失败任务和最近工作；每个问题可下钻。

### B 市场到个股

选择交易日 → 查看市场结构并筛选排序 → 打开股票 → URL 保留日期 → 查看价格、资料、研报/调研、阶段判断和交易记录。

### C 回测黄金流程

选择真实策略 → schema 配置 → 校验错误可修复 → 创建任务 → 状态与错误可见 → 打开 run → 查看标准指标/图表/交易/诊断 → 将两个 run 加入比较 → 刷新后比较仍恢复。

### D 数据异常

API 不可用、live 契约落后、数据 stale、artifact 缺失时，界面分别说明影响、最后成功时间、重试和系统诊断入口，不出现假数据。

### E 窄屏

1024px 主从布局退化，右侧抽屉化；768px 关键查询和核心指标可用；表格只在自身容器横向滚动。

## 6. 视觉验收

- 与动态产业题材原型一致的浅色专业终端语言；
- 顶部深色产品栏、清晰上下文栏、高密度内容；
- 无营销 Hero、大面积渐变、巨型圆角卡片、彩色图标墙和空洞留白；
- 时间、状态、新鲜度、证据/诊断可见；
- 红涨绿跌符合 A 股；其他状态不与市场方向混淆；
- 表格、指标、图表、活动流和详情面板使用同一 token 系统。

## 7. 发布与回滚

- 环境变量注入 API base；构建产物不含私有地址/token；
- 部署前记录后端 OpenAPI hash/commit；
- 新 Web 使用独立域名或路径灰度，不覆盖旧前端直到阶段四；
- 保留上一构建产物快速回滚；
- 生产 API CORS 限定新 Web origin；
- SPA fallback、缓存策略、source map 和错误采集按环境配置；
- 远程切换前验证 auth mode、owner isolation 和旧 URL。

## 8. 阶段报告模板

每阶段结束记录：

```text
Commit:
文件范围:
已完成:
验证命令与结果:
真实 API 环境/后端 commit:
已知遗留:
下一阶段目标:
```
