# QRP Atlas Web

QRP Atlas Web 是 QRP Atlas 的正式个人专业交易研究终端。它从用户工作流出发，独立于后端仓库 `qrp-atlas` 与三维可视化应用 `qrp-global-atlas`。

## 产品边界

- `qrp-atlas`：数据、契约、指标、因子、策略、回测、研究服务、认证与 API。
- `qrp-atlas-web`：日常研究、复盘、策略实验、回测分析与运行诊断的主 Web 产品。
- `qrp-global-atlas`：独立的全球资本事件三维可视化终端；产品品牌一致，代码与主 Web 独立。

本仓库不直接访问 DuckDB/PostgreSQL，不复制 Python 业务算法，不依赖旧 `qrp-atlas/web` UI。

## SSOT 文档

- [产品定位与用户工作流](docs/product/01-product-baseline.md)
- [信息架构、页面地图与导航](docs/product/02-information-architecture.md)
- [页面模板与交互原则](docs/product/03-page-templates-and-interactions.md)
- [Design Tokens](docs/design-system/01-tokens.md)
- [Design System 规范](docs/design-system/02-components.md)
- [前端技术架构](docs/architecture/01-frontend-architecture.md)
- [API 能力盘点与接口缺口](docs/audit/01-api-capability-inventory.md)
- [旧前端能力迁移矩阵](docs/audit/02-legacy-migration-matrix.md)
- [实施与验收方案](docs/delivery/01-implementation-and-acceptance.md)
- [实施状态](docs/delivery/STATUS.md)

## 本地环境

工程底座将在阶段二建立。约定 API 环境变量：

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_API_TIMEOUT_MS=20000
```

远程开发可指向局域网或部署后的 HTTPS API。正式流程不会在请求失败后自动切换 Mock。
