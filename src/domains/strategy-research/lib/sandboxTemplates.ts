import type { StrategyTemplate } from '../types/sandbox';

export const SANDBOX_TEMPLATES: StrategyTemplate[] = [
  {
    id: 'm1_cross_section',
    name: '全市场 M1 动量截面打分策略',
    description: '综合近 5 日均成交额（流动性容量）与近 20 日动量，每日开盘选出前 N 名标的等权持有。',
    code: `# -*- coding: utf-8 -*-
"""
QRP Atlas 自定义策略交互式沙盒
策略模式: 全市场 M1 动量截面打分 (Cross-Sectional Score)
"""
import numpy as np
import pandas as pd

# 策略全局参数
MAX_HOLD_COUNT = 8     # 最多持仓股票数
MOMENTUM_WINDOW = 20   # 动量回看周期
VOLUME_WINDOW = 5      # 成交额容量周期

def initialize(context):
    """回测初始化钩子"""
    context.max_hold_count = MAX_HOLD_COUNT
    print(f"沙盒初始化完成: 初始资金 {context.initial_cash:,.0f} 元, 最大持仓 {context.max_hold_count} 只")

def handle_bar(context, market_data):
    """
    每个交易日触发的决策逻辑
    :param context: 包含当前交易日 current_date, 账户持仓 holdings, 现金 cash 等信息
    :param market_data: 包含当日可用股票池的历史价格与指标 DataFrame
    :return: 目标持仓权重字典，例如 {"000001.SZ": 0.125, "600519.SH": 0.125}
    """
    date = context.current_date
    print(f"[{date}] 开始全截面打分与选股计算...")

    # 1. 获取全市场当日正常上市的候选池
    universe = market_data.get_active_universe(date)
    print(f"[{date}] 候选股票池标的数: {len(universe)}")

    # 2. 计算 20 日动量与 5 日均成交额
    # close_df / volume_df 为行是日期、列是标的的数据表
    close_df = market_data.get_history(universe, field='close', bars=MOMENTUM_WINDOW)
    money_df = market_data.get_history(universe, field='money', bars=VOLUME_WINDOW)

    momentum_20 = (close_df.iloc[-1] / close_df.iloc[0]) - 1.0
    avg5_amount = money_df.mean(axis=0)

    # 3. 复合百分位打分 (50% 容量 + 50% 动量)
    m1_score = 0.5 * avg5_amount.rank(pct=True) + 0.5 * momentum_20.rank(pct=True)

    # 4. 选出得分最高的前 N 只
    top_candidates = m1_score.sort_values(ascending=False).head(context.max_hold_count).index.tolist()
    print(f"[{date}] 优选前 {len(top_candidates)} 名标的: {', '.join(top_candidates[:4])}...")

    # 5. 等权重构建组合
    target_weight = 1.0 / len(top_candidates) if top_candidates else 0.0
    targets = {ticker: target_weight for ticker in top_candidates}
    return targets
`,
  },
  {
    id: 'dual_ma',
    name: '双均线趋势择时策略 (Dual Moving Average)',
    description: '基于 5 日均线与 20 日均线金叉/死叉判定趋势，突破建仓，死叉平仓。',
    code: `# -*- coding: utf-8 -*-
"""
QRP Atlas 自定义策略交互式沙盒
策略模式: 双均线趋势择时 (SMA-5 / SMA-20)
"""
import numpy as np
import pandas as pd

FAST_WINDOW = 5
SLOW_WINDOW = 20
ASSET_POOL = ["000300.SH", "000905.SH", "000852.SH"]

def initialize(context):
    context.pool = ASSET_POOL
    print(f"双均线策略初始化，监控核心宽基池: {context.pool}")

def handle_bar(context, market_data):
    date = context.current_date
    close_data = market_data.get_history(context.pool, field='close', bars=SLOW_WINDOW + 2)
    
    selected = []
    for ticker in context.pool:
        prices = close_data[ticker]
        ma_fast = prices.rolling(FAST_WINDOW).mean().iloc[-1]
        ma_slow = prices.rolling(SLOW_WINDOW).mean().iloc[-1]
        ma_fast_prev = prices.rolling(FAST_WINDOW).mean().iloc[-2]
        ma_slow_prev = prices.rolling(SLOW_WINDOW).mean().iloc[-2]

        # 向上穿越金叉
        if ma_fast > ma_slow and ma_fast_prev <= ma_slow_prev:
            print(f"[{date}] {ticker} 发生日线金叉 (MA5: {ma_fast:.2f} > MA20: {ma_slow:.2f})")
            selected.append(ticker)
        elif ma_fast > ma_slow:
            selected.append(ticker)
        else:
            print(f"[{date}] {ticker} 处于死叉空仓区间")

    if not selected:
        return {}

    weight = 1.0 / len(selected)
    return {ticker: weight for ticker in selected}
`,
  },
  {
    id: 'minimal_buy_and_hold',
    name: '极简买入持有基准 (Buy & Hold)',
    description: '将全部初始资金全仓配置在指定基准指数标的，用于收益与波动基线比对。',
    code: `# -*- coding: utf-8 -*-
"""
QRP Atlas 自定义策略交互式沙盒
策略模式: 极简基线测试 (Buy & Hold)
"""

def initialize(context):
    print("沙盒启动: 极简买入并持有基线")

def handle_bar(context, market_data):
    date = context.current_date
    # 始终满仓配置中证全指
    print(f"[{date}] 维持满仓基准持仓")
    return {"000985.XSHG": 1.0}
`,
  },
];
