# 审计来源与可追溯性

> 审计日期：2026-07-16

## 已检查

- `qrp-atlas main@a307e58`：README、后端 server/routes、认证文档、回测 product/results schemas、OpenAPI。
- 旧 `qrp-atlas/web`：路由、package、API clients、backtest adapters、全部页面文件与行数。
- `docs/动态产业题材库v0.1`：README、产品调研、PRD、运行逻辑、数据基座、Agent 路线、prototype.html 的结构与 tokens。
- `docs/项目诊断报告.html`：尤其前端膨胀、工具重复、测试和后端风险结论。
- `docs/design（暂不启用）/v1.0`：基于旧结构的 Sapphire/Amber 视觉改造，拒绝作为基线。
- `docs/design（暂不启用）/v2.0`：暗色优先、保持旧页面结构的方案，拒绝作为主 Web 基线。
- `qrp-global-atlas`：独立 React/Cesium 应用、深色沉浸式三维场景和工程边界；不复制其布局与主题。
- 局域网 live API：health 与 OpenAPI。

## 关键证据

- 旧页面行数：stock 2688、raw 815、overview 596、logs 509、backtest analysis 363、workflow 306。
- main OpenAPI path：53；live path：28。
- 动态产业原型核心 tokens：canvas `#F4F5F3`、header `#202722`、accent `#17724B`、line `#DDE0DC`、4–8px 圆角、轻浮层阴影。
- v1 失败设计明确“在不改架构前提下”改造旧前端；v2 失败设计明确“暗色优先”并按旧页面优先级推进，均与本项目从工作流重建冲突。

## 未改变的外部仓库

除将本机 `qrp-atlas` checkout fast-forward 到远端 current main 以完成审计外，没有修改 `qrp-atlas` 或 `qrp-global-atlas` 源码与产品架构。
