# 前端技术架构

> 状态：阶段一 SSOT

## 1. 技术选择

- React + TypeScript strict + Vite；
- React Router：URL 作为页面上下文与筛选 SSOT；
- TanStack Query：服务端状态、缓存、失效、轮询和局部状态；
- 原生 fetch 封装：集中 base URL、timeout、auth、错误映射和 request id；
- lightweight-charts：价格/净值/回撤等时间序列；简单图形优先 SVG/CSS；
- Vitest + Testing Library + MSW：纯函数、组件、API 契约与黄金流程测试；
- ESLint + TypeScript project references；
- 不默认引入 Redux/Zustand、Monorepo、GraphQL、复杂 DI 或全量代码生成。

依赖版本以阶段二安装时的稳定兼容组合锁定，所有升级经构建和测试验证。

## 2. 目录边界

```text
src/
  app/
    providers/           # QueryClient、Router、Auth、ErrorBoundary
    router/              # route config、lazy routes、guards
    shell/               # AppHeader、ContextBar、Agent host
    styles/
  domains/
    today/
    market-review/
    stocks/
    research-notes/
    themes/
    strategy-research/
    backtests/
    operations/
      api/               # 本域 endpoint facade
      components/
      hooks/
      lib/               # mapper、selector、chart transform、validation
      pages/             # 轻量路由组合
      types/             # domain model、view model
      index.ts            # 稳定公共出口
  shared/
    api/                  # client、errors、auth、transport types
    config/               # env 与运行配置
    lib/                  # date、format、url、result、assertion
    ui/                   # 通用 Design System
    charts/               # 无业务 DTO 的 renderer/frame
    types/
  test/
```

## 3. 依赖规则

```text
app → domains → shared
app → shared
domain A -X→ domain B internals
shared -X→ domains
page -X→ raw fetch / API DTO calculation
```

跨域跳转通过 route builder；确需共享的业务概念提升为稳定 shared type 或由 app orchestration 组合，不互相导入内部 hook/component。

## 4. 数据流

```text
Page reads URL
→ domain hook builds query key/input
→ domain API facade
→ shared API client
→ qrp-atlas OpenAPI endpoint
→ DTO validation/normalization
→ mapper to Domain Model / View Model
→ presentational components
```

写操作：

```text
Form Model
→ domain validation
→ request mapper
→ mutation
→ stable ApiError or response DTO
→ invalidate/update explicit query keys
→ navigate with server identifiers
```

前端只做展示转换、输入校验和 UI 排序，不计算策略、成交、PIT 或标准绩效。

## 5. API Client

职责：

- 从 `VITE_API_BASE_URL` 解析绝对 URL；空值在开发模式明确报错；
- `AbortController` timeout，路由卸载/查询取消可传 signal；
- JSON 与 204 处理；
- Bearer token 仅由 auth provider 注入，不允许业务模块读取存储细节；
- 统一 `ApiError { kind, status, code, message, detail, requestId, retryable }`；
- 区分 network/timeout/abort/http/parse/contract；
- 不在请求失败后自动回退 Mock；
- 开发日志去除 token 和敏感请求体；
- 支持 local、remote-dev、production base URL。

## 6. OpenAPI 与运行时契约

后端 OpenAPI 是重要 SSOT，但当前 live 与 main 存在版本漂移。阶段二先维护显式 DTO 与少量 runtime guard，不把生成客户端作为阻塞项；待部署契约稳定后评估使用 `openapi-typescript` 生成 transport types。

规则：

- OpenAPI snapshot 可审计；
- adapter 负责兼容后端可选字段和旧部署，页面不做版本判断；
- contract mismatch 转为可见错误；
- DTO、Domain Model、Form Model、Chart Series 分开；
- response 中无 freshness 元数据时标记 unknown。

## 7. 服务端状态

TanStack Query key 工厂按域定义，例如：

```ts
backtestKeys.tasks(filters)
backtestKeys.task(taskId)
backtestKeys.run(runId)
backtestKeys.runArtifact(runId, artifact)
backtestKeys.compare(runIds)
```

- 列表和详情缓存独立；
- 任务 running 时轮询，完成/失败后停止；页面隐藏时降低或停止；
- 运行标准 artifact 并行查询并允许局部失败；
- staleTime 按数据频率设定，不能用无限缓存掩盖新鲜度；
- mutation 成功后只失效相关 key；
- 不把可重新获取的服务器数据复制进全局 store。

## 8. 本地 UI 状态

优先级：URL → Query cache → domain hook local state → component state。

适合 URL：日期、对象 ID、筛选、排序、分页、tab、比较 run ids。
适合本地：抽屉开关、未提交输入、图表 hover、临时列宽。
需要跨页面且不可恢复的状态出现前，不引入全局状态库。

## 9. 路由与代码拆分

- route-level lazy import；
- App Shell 与通用状态常驻；
- 页面只读取 params/search、调用 domain hooks、组合 section；
- 页面建议 <250 行，超过 300 行需说明；
- 图表、表单、表格和复杂副作用必须下沉；
- route builder 集中生成 URL，避免字符串散落。

## 10. 错误边界

- App 级 ErrorBoundary 捕获 render/runtime 错误，提供刷新、返回今日和诊断信息；
- route 级错误处理未知路由与 loader 错误；
- query 错误使用 QueryBoundary，不依赖 ErrorBoundary 处理普通网络失败；
- 单图表/单 artifact 失败局部隔离；
- 错误报告包含时间、route、release（若有）和去敏后的错误 ID。

## 11. 认证

支持后端两种模式：

- local：`GET /api/auth/me` 返回固定用户，不显示登录；
- database：登录获得 bearer session，内存为主，必要的持久化策略由安全评审决定；401 清理会话并保留 return URL；
- 前端永不提交 `owner_user_id`，owner 隔离由后端 CurrentUser 强制。

live API 目前未部署 auth 路由，adapter 应将 404 识别为 legacy/local deployment，并在系统状态中提示版本漂移；不可因此假造用户身份传给业务 API。

## 12. Mock 策略

允许：Design System story/fixture、极端状态、自动测试、尚缺契约页面的开发演示。

要求：

- fixture 与 HTTP adapter 同一 domain interface；
- Mock 只能通过显式开发开关或 test injection；
- 页面显著显示模拟数据；
- 生产构建默认禁用；
- HTTP 失败不回退 Mock；
- 黄金工作流验收只认真实 API。

## 13. 性能

- 按路由拆包，图表库只在分析页面加载；
- 大表分页/虚拟化按真实数据量选择；
- mapper 用 memo/select 避免 render 重算；
- 图表使用 ResizeObserver、增量 update 与正确 dispose；
- 比较页最多 10 runs 与后端一致；
- 首屏目标：静态 shell 快速可见，网络区块独立完成，不被最慢请求阻塞。

## 14. 环境与部署

```env
# local
VITE_API_BASE_URL=http://127.0.0.1:8000

# remote development
VITE_API_BASE_URL=http://192.168.0.102:8000

# production
VITE_API_BASE_URL=https://api.example.com
```

构建产物为静态资源，可由 CDN/Nginx 托管；SPA fallback 到 `index.html`；API CORS/同源代理由部署环境配置。生产必须限制后端 CORS，不能长期保留 `* + credentials`。

## 15. 质量门禁

每个阶段至少运行：

```text
npm run lint
npm run typecheck
npm run test
npm run build
```

关键 domain 增加：DTO mapper、form validation、query polling、URL round-trip、error states 与 golden workflow 集成测试。CI 在 push/PR 执行同一命令。
