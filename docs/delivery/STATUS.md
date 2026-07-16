# 实施状态

> 最后更新：2026-07-16

| 阶段 | 状态 | 提交/验收 |
| --- | --- | --- |
| 阶段一：产品与架构基线 | 已完成 | `ea31ac7` |
| 阶段二：产品基础与黄金样板 | 已完成 | `3aa5e9c`；真实回测候选环境需在阶段三补全后复验 |
| 阶段三：核心产品建设 | 已完成 | 五个核心域及指标、声明式策略、因子/题材边界、Agent 与统一状态均已交付；真实回测候选环境复验完成 |
| 阶段四：旧前端退出 | 已完成 | 最终覆盖、部署、切换与回滚方案见 `05-stage-four-exit-and-cutover.md` |

## 当前仓库

- 正式仓库：`E:\projects\qrp-atlas-web`。
- GitHub：`https://github.com/xlykyz/qrp-atlas-web`，Public，默认分支 `main`。
- `origin/main` 已建立；本机 `gh` 已登录账号 `xlykyz`。
- `qrp-atlas` 与 `qrp-global-atlas` 未因本任务做产品或源码修改。

## 当前 API

- 正式候选 API：`http://192.168.0.102:8000`。
- 2026-07-16 重启后 OpenAPI 已恢复 current-main 的 53 paths，策略、指标、声明式策略、回测任务、诊断和比较契约均已部署。
- `VITE_API_BASE_URL` 必须显式配置；没有自动 Mock 回退。
- `/api/daily/dates` 基于交易日历，可能返回尚无 `daily_market_snapshot` 的未来/空日期。前端按真实行情水位排除并显示 contract drift；后端契约问题见 `docs/audit/03-stage-three-contract-gaps.md`。

## 已知正式缺口

- 通用研究记录 CRUD 与对象引用；
- 动态产业题材对象、时间线、成员、证据和 provenance API；
- canonical 因子目录、版本、方向、PIT 口径和质量统计；
- 数据更新任务、补算、重试与正式数据集 SLA；
- Agent session/message/citation/tool-permission API；
- 认证 UI 与生产 SSO/Token 生命周期仍需部署方案验证。

## 最终结论

阶段一至阶段四的产品与工程交付完成，详见 `06-final-acceptance.md`。生产切换仍等待服务端未来时间戳问题解除；旧前端未删除。
