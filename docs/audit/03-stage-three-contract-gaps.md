# 阶段三补全：后端最小契约与运行问题

> 日期：2026-07-16

## 1. 交易日与行情覆盖

`GET /api/daily/dates` 的说明是从 `trading_calendar` 返回交易日。2026-07-16 实测，当请求 `end_date=2026-07-17` 时会包含未来日期 `2026-07-17`，但 `GET /api/daily?date=2026-07-17` 为空，`daily_market_snapshot.latest_date` 为 `2026-07-16`。

前端处理：将交易日历与 `/api/stats` 的 `daily_market_snapshot.latest_date` 求有效交集，并在界面显示 contract drift，不静默冒充“最新有效交易日”。

建议后端最小改进：

- 为 `/api/daily/dates` 增加 `require_market_coverage=true`；或
- 新增 `/api/market-dates`，返回 `{date, is_open, has_daily_snapshot, watermark, source}`；
- OpenAPI 明确当前接口是交易日历，不保证行情已落库。

## 2. 因子研究

当前 `/api/indicators` 有 79 个计算目录项，但没有 canonical 因子身份。前端不根据名称或算法自行定义因子。

建议：

```text
GET /api/factors
GET /api/factors/{code}
```

最小字段：`code/name/version/family/direction/scope/frequency/required_inputs/PIT_policy/owner/status/quality_summary/updated_at`。计算值、分组收益和 IC 等仍由后端权威服务提供。

## 3. 动态产业与题材

当前可读取 `/api/reports/industry` 作为真实候选证据，但不能据此在前端生成 canonical 题材。

建议：

```text
GET /api/themes
GET /api/themes/{theme_id}
GET /api/themes/{theme_id}/timeline
GET /api/themes/{theme_id}/members
GET /api/themes/{theme_id}/evidence
```

响应至少携带 `as_of/source/status/freshness/provenance`，并区分事实、推断、提案和人工确认。

## 4. Agent

前端只提供上下文抽屉。正式契约建议：

```text
POST /api/agent/sessions
POST /api/agent/sessions/{id}/messages
```

响应区分 `facts/inferences/unknowns/counter_evidence/next_steps/citations/tool_permissions`。在契约部署前不提供本地假对话。
