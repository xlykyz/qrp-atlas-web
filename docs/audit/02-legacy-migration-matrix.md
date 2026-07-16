# 旧前端能力迁移矩阵

> 审计对象：`qrp-atlas/web` at `main@a307e58`
> 原则：盘点业务能力，不继承信息架构、路由、布局、视觉、状态管理或组件架构。

## 1. 旧前端概况

旧路由：

```text
/                      overview
/stock                 stock-review
/logs                  review-logs
/raw                   raw-preview
/backtest              backtest-analysis
/backtest/workflow     backtest-workflow
```

主要结构风险：

- `stock-review.tsx` 2,688 行、约 115 KB；
- `raw-preview.tsx` 815 行；`overview.tsx` 596 行；
- 页面承载请求、状态、图表生命周期、业务转换、表单和渲染；
- 数据库预览作为一级入口；
- 路由名和页面划分由已有模块决定；
- mock/http 双路径已初步存在于回测 workflow，但旧 UI 不作为新设计资产。

## 2. 能力矩阵

| 旧能力 | 业务价值 | 新产品位置 | 决策 | 可复用内容 |
| --- | --- | --- | --- | --- |
| 可用交易日选择 | 高 | 全局 ContextBar、市场复盘 | 重建 | API path、日期纯函数可参考 |
| 全市场股票总数/上涨/下跌/涨跌停统计 | 高 | 今日、市场复盘 | 重建；短期前端展示聚合，长期建议快照 API | 字段含义与格式化逻辑可参考 |
| 板块筛选、ST 筛选 | 中高 | 市场复盘表格 | 重建并写入 URL | 过滤条件语义可参考 |
| 全市场排序、分页表格 | 高 | 市场复盘 | 重建 | 列字段、格式化器可迁移为纯函数 |
| 从市场表格进入个股 | 高 | `/research/stocks/:ticker` | 重建，保留交易日上下文 | 无 UI 复用 |
| 股票搜索/选择 | 高 | 股票列表、全局搜索、个股头部 | 重建 | `/api/stock/list` 调用；缓存思路 |
| 个股 K 线与成交量 | 高 | 个股详情 overview | 重建 | lightweight-charts 数据转换可审计后迁移 |
| MA/技术指标显示开关 | 中高 | 个股图表工具区 | 重建 | 与 UI 解耦的 series transform 可迁移 |
| 前/后复权切换 | 高 | 个股 URL `adjustment` | 重建 | API 参数与枚举可迁移 |
| 日期范围与图表缩放 | 高 | 个股 URL `range` + 图表状态 | 重建 | 纯日期窗口逻辑可参考 |
| 市场阶段判断读取/创建 | 高 | 市场复盘 journal | 重建 | `/api/phase` client 与 DTO 可参考 |
| 交易记录读取/创建/更新 | 高 | 个股 trades、复盘 journal | 重建 | `/api/trades` client 与字段映射可参考 |
| 个股研报、行业研报、调研 | 高 | 个股 research、题材辅助 | 重建 | API path/查询字段可参考 |
| 复盘日志按日期聚合 | 高 | `/review/journal` | 重建 | 日期分组纯函数可参考 |
| phase/trade tab | 中 | 复盘 journal 的筛选 | 不保留原页面/Tab 结构，仅保留业务过滤 | 无 UI 复用 |
| 回测运行列表 | 高 | `/backtests/runs` | 重建 | DTO/API client 可参考 |
| 回测 summary 指标 | 高 | run overview | 重建 | types/formatters 可审计迁移 |
| 净值与回撤图 | 高 | run overview/performance | 重建 | chart transform/lifecycle 可审计迁移 |
| 交易与跳过表 | 高 | run trades/diagnostics | 重建 | DTO 列定义语义可参考 |
| 配置快照 | 高 | run config | 重建 | DTO 可参考 |
| rolling/benchmark/exposure/reproducibility | 高 | run tabs | 重建并补齐所有状态 | API 调用与类型可参考 |
| 策略目录和 schema 参数表单 | 高 | strategies + backtests/new | 重建 | HTTP adapter、schema validation/mapper 可迁移 |
| 回测任务创建/列表/轮询 | 最高 | golden workflow | 重建 | adapter interface、轮询停止条件可迁移 |
| 多 run 比较 | 最高 | `/backtests/compare` | 重建，选择进入 URL | compare API client/纯比较展示模型可参考 |
| 声明式策略编辑 | 中高 | `/strategies/declarative/*` | 延后到阶段三 | API client、纯校验映射可参考；旧编辑器 UI 不迁移 |
| 通用表列表/预览/schema | 低（产品）/中（诊断） | operations 的受控开发区 | 降级，不做一级导航 | API client 可保留在 internal adapter |
| 任意 SQL 执行 | 低且高风险 | 不进入普通正式 UI | 明确废弃主入口；仅后端/受控开发工具 | 不迁移 UI |
| 明/暗主题切换 | 非核心 | 未来偏好 | 阶段二默认浅色，不以暗色为阻塞 | 不迁移旧主题实现 |
| 旧侧边栏导航 | 负价值 | — | 废弃 | 不迁移 |
| Emoji 涨停/ST 标记 | 低 | 市场状态 cell/badge | 重设计为文本/小型语义标记 | 不迁移 UI |
| localStorage 记忆部分筛选 | 中 | URL +必要本地偏好 | 改用 URL/明确 storage helper | 仅安全纯 storage wrapper 可参考 |
| mock 自动回退 | 负价值 | — | 禁止 | mock fixture 仅用于测试/显式开发 |

## 3. 允许迁移的代码判定

旧代码只有同时满足以下条件才可迁移：

1. 不 import 旧 UI、旧页面或 Tailwind class；
2. 不依赖旧路由和页面状态；
3. 是 API path/DTO、纯格式化、纯排序、纯日期或纯 chart series 转换；
4. 通过新测试覆盖；
5. 命名与新 domain 一致，必要时重写而不是机械复制；
6. 不复制后端算法、绩效口径、策略清单或 owner 逻辑。

优先审计候选：

```text
src/shared/lib/date.ts
src/shared/lib/format.ts
src/shared/lib/sort.ts
src/api/* 的 endpoint 与 error 行为
src/features/backtest-workflow/lib/form-model.ts
src/features/backtest-workflow/lib/validate.ts
src/features/backtest-workflow/lib/compare.ts
回测图表的数据转换（不含组件样式）
```

## 4. 明确不迁移

- `components/layout.tsx` 与旧导航；
- `components/ui/*` 作为 UI 基线；
- 所有旧 pages 的布局与组件结构；
- `stock-review.tsx` 中混合 hook/图表/表单/渲染的组织方式；
- `/raw` 的产品地位；
- 旧设计 v1 的 Sapphire/Amber 营销式视觉改造；
- 旧设计 v2 的“暗色优先”主 Web 假设；
- 任何请求失败后切到 mock 的行为。

## 5. 新旧 URL 初步映射

| 旧 URL | 新 URL | 处理建议 |
| --- | --- | --- |
| `/` | `/today` | 部署层 301/SPA replace |
| `/stock?ticker=...` | `/research/stocks/:ticker?date=...` | 参数转换；无 ticker 到股票列表 |
| `/logs` | `/review/journal` | 保留 date/type 参数映射 |
| `/backtest` | `/backtests/runs/:runId` 或 `/backtests/runs` | 有 runId 打开详情，否则列表 |
| `/backtest/workflow` | `/backtests/new` | strategy/version 参数映射 |
| `/raw` | `/operations?tab=data` | 仅对有权限的开发诊断可达；普通用户到 operations |

最终重定向规则在阶段四依据实际覆盖确认。

## 6. 旧前端退出判定

旧 `qrp-atlas/web` 只有在以下条件全部满足后才可删除或停止部署：

- 市场复盘、个股研究、phase/trade 日志、回测创建/任务/结果/比较已覆盖；
- 必要的研报/调研读取已覆盖；
- 系统诊断提供替代入口；
- 旧 URL 重定向已上线并验证；
- 新 Web 生产 API、认证、CORS 和部署已验证；
- 至少一个完整日常使用周期无阻断缺口；
- 明确得到删除授权。

本任务不直接删除旧前端。
