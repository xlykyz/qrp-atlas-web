# 阶段四：旧前端退出、部署与切换方案

> 状态：已完成
> 日期：2026-07-16

## 1. 已覆盖能力

| 旧前端能力 | 新产品位置 | 结论 |
| --- | --- | --- |
| 交易日、市场广度、涨跌停与指数 | `/today`、`/review/market` | 已覆盖，并增加行情水位校验 |
| 全市场股票筛选与个股下钻 | `/research/stocks`、`/research/stocks/:ticker` | 已覆盖，日期/筛选写入 URL |
| K 线、复权、研报、调研 | 个股详情 overview/research | 已覆盖 |
| 市场阶段与交易记录 | 市场复盘、个股交易、`/research/notes` | 已覆盖专用真实契约 |
| 策略目录、schema 参数 | `/strategies`、`/backtests/new` | 已覆盖 |
| 指标目录 | `/strategies/indicators` | 已覆盖真实目录 |
| 声明式策略 | `/strategies/declarative/*` | 已覆盖目录、详情、受控编辑、校验、创建和状态 |
| 回测任务、结果、诊断、比较 | `/backtests/*` | 已覆盖并在 current-main 候选 API 真实复验 |
| 数据健康和覆盖 | `/operations` | 已覆盖，不暴露数据库绝对路径 |

## 2. 明确废弃能力

- `/raw` 作为一级产品入口；
- 普通用户任意 SQL 执行和通用原始表浏览；
- 旧侧边栏、旧页面布局和旧 UI 组件；
- Emoji 状态语义和失败自动 Mock 回退；
- 旧前端的 localStorage 页面上下文；
- 暗色沉浸式三维风格作为主 Web 默认主题。

后端受控开发接口可继续存在，但不进入主导航。

## 3. 暂未迁移能力及原因

- 通用研究笔记：缺少对象引用、正文、标签和状态契约；
- canonical 因子研究：缺少 `/api/factors`、PIT 口径和质量统计；
- 动态题材对象：缺少题材、时间线、成员和 provenance API；
- 数据补算/重试：缺少 operations job API；
- Agent 对话：缺少 session/message/citation/tool-permission API；
- 认证 UI：候选环境当前提供用户上下文，正式 Token/SSO 生命周期需部署验证。

以上均以 CapabilityUnavailable、partial 或 contract drift 展示，不由前端复制后端算法。

## 4. 旧 URL 重定向

| 旧 URL | 新 URL | 规则 |
| --- | --- | --- |
| `/` | `/today` | 302 观察期，稳定后 301 |
| `/stock?ticker=X&date=D` | `/research/stocks/X?date=D` | 无 ticker 到股票列表 |
| `/logs?date=D&type=T` | `/research/notes?from=D&to=D&kind=T` | 映射 phase/trade；未知类型删除 |
| `/backtest?runId=R` | `/backtests/runs/R` | 无 runId 到结果列表 |
| `/backtest/workflow?strategy=S&version=V` | `/backtests/new?strategy=S&version=V` | 保留参数 |
| `/raw` | `/operations?tab=data` | 无开发权限仍只显示受控诊断 |

重定向应由网关实现；SPA 内仅处理新路由，不长期携带旧页面逻辑。

## 5. `qrp-atlas/web` 删除条件

全部满足后才可删除，且仍需明确授权：

1. 新 Web 生产域名和 HTTPS API 已上线；
2. 认证、CORS、Cookie/Token 与刷新恢复通过；
3. 上述重定向已验证；
4. 今日、复盘、个股、记录、回测和诊断至少经历一个完整日常使用周期；
5. current-main 回测任务、诊断和比较持续可用；
6. 监控无阻断级错误，回滚包可用；
7. 旧前端进入只读观察期且无唯一必要能力；
8. 获得删除或停止部署的明确授权。

本阶段不删除 `qrp-atlas/web`。

## 6. 部署拓扑

```text
Browser
  ├─ https://atlas.<domain>  → qrp-atlas-web 静态产物/CDN
  └─ https://api.<domain>    → reverse proxy → qrp-atlas API
                                      ├─ auth/session
                                      ├─ research/backtest services
                                      └─ DuckDB/PostgreSQL（仅后端访问）
```

主 Web 与 global-atlas 独立构建、独立域名、独立回滚；不共享运行时 UI 包。

## 7. CORS、认证和环境变量

### CORS

- 生产只允许主 Web 和明确的预发布 origin；
- 允许 `Authorization`、`Content-Type`、`X-Request-ID`；
- 若使用 Cookie，必须精确 origin、`credentials=true`、HTTPS、Secure、HttpOnly、SameSite；
- 禁止生产 `*` 配合 credentials。

### 认证

- `/api/auth/me` 作为启动用户上下文；
- 401 显示登录并保留 return URL，403 显示无权限；
- token 只由 app auth provider 注入 API client，不允许业务域读取存储；
- 生产优先 HttpOnly session；若使用短期 Bearer token，应内存持有并由受控刷新流程更新；
- 不把 token 写入 URL、日志或错误详情。

### 环境变量

```text
VITE_API_BASE_URL           必填；各环境显式绝对 URL
VITE_API_TIMEOUT_MS         可选；默认 120000
VITE_ENABLE_QUERY_DEVTOOLS  仅开发环境可为 true
```

构建产物不含数据库地址、凭据或内部绝对路径。

## 8. 流量切换

1. 部署候选 API，确认 OpenAPI 53 paths 和健康检查；
2. 部署新 Web 预发布，执行真实回测和全路由 smoke；
3. 对旧前端开启只读提示和新终端入口；
4. 网关先将内部/指定用户流量切到新 Web；
5. 观察 API 错误率、前端 fatal error、任务成功率和关键页面可用性；
6. 扩大到全部流量；
7. 启用旧 URL 重定向；
8. 旧前端保留一个发布周期的可回滚静态包，不继续开发新能力。

## 9. 回滚

- Web 回滚：将静态资源/CDN alias 指回上一版本，不回滚用户数据；
- API 回滚：只有契约向后兼容时独立回滚；否则 Web 与 API 按已验证组合一起切换；
- 重定向回滚：恢复旧入口 302，保留新 Web 可直接访问；
- 回测任务不重复提交，依据 task id 恢复；
- 回滚后记录 request id、task/run id、OpenAPI 版本和时间线。

## 10. 旧前端停止部署条件

满足删除条件前，可先停止新版本发布；停止对外部署还要求：

- 新 Web 连续一个完整使用周期无 P0/P1 阻断；
- 旧 URL 访问量降至可接受阈值；
- 新 Web 监控和告警已接管；
- 运维手册、回滚版本和负责人明确；
- 用户确认旧前端无唯一工作流。

停止部署不等于删除源码；源码删除仍需单独授权。
