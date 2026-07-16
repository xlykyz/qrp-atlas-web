# Design Tokens

> 状态：阶段一 SSOT
> 来源：继承动态产业题材库原型的专业、浅色、高密度产品语言；不复制固定三栏布局。

## 1. 设计方向

- 默认浅色研究终端，深色仅用于顶部产品栏和未来可选主题；
- 中性暖灰背景、白色工作面、深墨绿文本；
- 主交互使用克制的研究绿；
- A 股市场方向使用红涨绿跌；
- 蓝色用于信息/基准，琥珀用于警告/萌芽，紫色用于争议/特殊研究状态；
- 边框承担主要层级，阴影只给浮层；
- 紧凑 4/8px 节奏，4–8px 圆角。

## 2. 色彩

### 2.1 基础色

| Token | 值 | 用途 |
| --- | --- | --- |
| `--color-canvas` | `#F4F5F3` | 应用背景 |
| `--color-surface` | `#FFFFFF` | 主工作面 |
| `--color-surface-subtle` | `#F8F9F7` | 次级分组、hover |
| `--color-surface-raised` | `#FFFFFF` | 浮层 |
| `--color-line` | `#DDE0DC` | 默认边框 |
| `--color-line-strong` | `#C6CBC5` | 控件、分隔强调 |
| `--color-text` | `#1D2420` | 主文本 |
| `--color-text-muted` | `#68716B` | 辅助文本 |
| `--color-text-faint` | `#8A928D` | 低优先级元数据 |
| `--color-header` | `#202722` | 顶部产品栏 |
| `--color-header-hover` | `#2C352F` | 顶栏控件 hover |

### 2.2 品牌与研究语义

| Token | 值 | 用途 |
| --- | --- | --- |
| `--color-accent` | `#17724B` | 主操作、选中、链接 |
| `--color-accent-hover` | `#115E3D` | 主操作 hover |
| `--color-accent-soft` | `#E8F4ED` | 选中背景、正向完成 |
| `--color-info` | `#316C9E` | 信息、基准、数据源 |
| `--color-info-soft` | `#EAF2F8` | 信息背景 |
| `--color-warning` | `#9A6816` | 警告、stale、萌芽 |
| `--color-warning-soft` | `#FFF4DC` | 警告背景 |
| `--color-special` | `#72549A` | 争议、特殊状态、研究分支 |
| `--color-special-soft` | `#F1ECF7` | 特殊状态背景 |

### 2.3 市场与系统状态

| Token | 值 | 用途 |
| --- | --- | --- |
| `--color-market-up` | `#B13E3E` | A 股上涨 |
| `--color-market-up-soft` | `#FBECEC` | 上涨弱背景 |
| `--color-market-down` | `#17724B` | A 股下跌 |
| `--color-market-down-soft` | `#E8F4ED` | 下跌弱背景 |
| `--color-danger` | `#B13E3E` | 错误/破坏性动作，必须配文字或图标 |
| `--color-danger-soft` | `#FBECEC` | 错误背景 |
| `--color-success` | `#17724B` | 运行成功/新鲜 |
| `--color-neutral` | `#68716B` | 未知、未开始 |

上涨和系统错误可以共享基础红值，但组件必须通过图标、标签和上下文区分，不能只靠颜色。

## 3. 字体

```css
--font-sans: Inter, "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif;
--font-mono: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
```

| Token | 大小/行高/字重 | 用途 |
| --- | --- | --- |
| `--text-page-title` | `22px / 30px / 650` | 页面标题 |
| `--text-object-title` | `20px / 28px / 650` | 对象标题 |
| `--text-section-title` | `14px / 20px / 650` | 分区标题 |
| `--text-body` | `13px / 20px / 400` | 默认正文 |
| `--text-body-strong` | `13px / 20px / 600` | 强调正文 |
| `--text-meta` | `12px / 18px / 400` | 时间、来源、说明 |
| `--text-caption` | `11px / 16px / 500` | 图例、标签 |
| `--text-metric-lg` | `24px / 30px / 650` | 关键指标 |
| `--text-metric` | `18px / 24px / 650` | 指标带 |

数字、日期、ticker、百分比和金额使用 `font-variant-numeric: tabular-nums`；长文本保持无衬线，避免全站等宽字体造成噪声。

## 4. 间距

基础单位 4px：

```text
0: 0
1: 4px
2: 8px
3: 12px
4: 16px
5: 20px
6: 24px
8: 32px
10: 40px
12: 48px
```

- 控件内部：8–12px；
- 紧凑表格行：36px，默认 40px；
- 区块内部：12–16px；
- 区块间：12px；
- 页面横向 padding：24px，窄屏 16px；
- 页面最大内容宽度不全局锁死，表格/图表页使用可用宽度。

## 5. 尺寸

| Token | 值 |
| --- | --- |
| `--height-header` | `44px` |
| `--height-context-bar` | `44px` |
| `--height-control-sm` | `28px` |
| `--height-control` | `32px` |
| `--height-control-lg` | `38px` |
| `--width-agent-drawer` | `440px`（最大 100vw） |
| `--width-detail-drawer` | `400px` |
| `--width-readable` | `820px`（长文本） |

## 6. 圆角、边框与阴影

```css
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--border-default: 1px solid var(--color-line);
--shadow-float: 0 4px 18px rgba(30, 40, 33, 0.08);
--shadow-drawer: -10px 0 30px rgba(20, 30, 23, 0.16);
```

卡片不使用 16–24px 大圆角。静态内容默认无阴影；popover、menu、dialog、drawer 可用浮层阴影。

## 7. 图表 Tokens

| Token | 值 |
| --- | --- |
| `--chart-primary` | `#17724B` |
| `--chart-benchmark` | `#316C9E` |
| `--chart-drawdown` | `#B13E3E` |
| `--chart-warning` | `#C08A2D` |
| `--chart-special` | `#72549A` |
| `--chart-grid` | `#E5E8E4` |
| `--chart-crosshair` | `#7B847E` |
| `--chart-axis` | `#68716B` |

多序列优先使用线型、透明度和直接标签辅助区分，不无限扩展高饱和颜色。

## 8. 层级与 z-index

```text
base 0
sticky 10
header 20
popover 30
drawer 40
dialog 50
toast 60
```

## 9. 动效

```css
--motion-fast: 120ms;
--motion-base: 160ms;
--motion-slow: 220ms;
--ease-standard: cubic-bezier(.2, .8, .2, 1);
```

尊重 `prefers-reduced-motion`。禁止装饰性循环动画和大范围背景渐变动画。
