# 阶段三补全验收报告

> 状态：已完成
> 基线：保留阶段二 App Shell、Design System、页面状态与回测黄金流程，不重新设计。

## 补全范围

- 有效交易日按真实行情水位校验并暴露契约漂移；
- 指标目录 `/strategies/indicators`；
- 因子研究 `/strategies/factors` 的真实能力审计与正式缺口；
- 声明式策略目录、详情、受控编辑、后端校验、创建、状态和版本入口；
- 动态产业题材 `/research/themes` 与详情路由，接入真实行业研报证据，不生成假题材；
- 可操作上下文 Agent 抽屉；
- stale、partial success、contract drift、401/403 共享状态；
- API 地址显式配置与文档一致性修复。

## 验收记录

### 自动化门禁

```text
npm run lint       通过
npm run typecheck  通过
npm run test       13 files / 30 tests 通过
npm run build      通过
```

### 真实 API 与浏览器

候选 API `http://192.168.0.102:8000` 已恢复 current-main 53 paths。

- `/today` 自动排除日历返回但无行情覆盖的 `2026-07-17`，落到 `2026-07-16` 并显示 contract drift；
- `/strategies/indicators` 读取 79 个真实目录项；
- 因子页明确区分可复用计算与 canonical 因子缺口；
- 声明式策略目录、受控编辑器和后端 validate/create/status 适配完成；
- 题材页读取真实行业研报，同时保持题材对象 unavailable；
- Agent 抽屉可操作并绑定当前 URL/对象/as-of/范围；
- 1280px 新增路由无页面级横向溢出和控制台错误；已有阶段三核心页面继续沿用已验收的 800px 退化规则，最终阶段再做全路由 800px 回归。

### 正式回测复验

真实浏览器创建：

- `task_19dfacf18d7c` → `run_20af01b0bf73`；
- `task_64dc025079a7` → `run_3164cff08be6`。

两者均为真实执行且成功；完成任务状态、标准结果、指标、净值、交易、诊断、配置和 compare。比较 URL 保存两个 run id。诊断明确暴露 benchmark 缺失，不以 Mock 填充。

候选后端返回的任务/结果生成时间为 `2026-07-17 03:11–03:12`，晚于当前日期 `2026-07-16`，属于服务端时钟/时区问题，已列为部署阻塞项，前端不改写权威时间。
