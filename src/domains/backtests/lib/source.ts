/**
 * 回测结果数据源。
 *
 * - product：生产回测实验室（`/api/backtest/*`），有任务与策略能力。
 * - research：独立研究区（`/api/research/*`），只读结果，无任务概念。
 *
 * 两者在后端是彻底隔离的独立 loader，run_id 可能撞名，因此前端必须显式区分，
 * 不允许合并展示。数据源通过 URL query 保留，保证链接可分享、可恢复。
 */

export type BacktestSource = 'product' | 'research';

const SOURCE_PARAM = 'source';
const RESEARCH_VALUE = 'research';

/** 从 query string 解析数据源；未知或缺失一律回落到生产。 */
export function parseBacktestSource(search: string): BacktestSource {
  return new URLSearchParams(search).get(SOURCE_PARAM) === RESEARCH_VALUE ? 'research' : 'product';
}

/** 构造回测页面链接：保留其他查询参数、覆盖数据源；product 为默认值，不写入 URL。 */
export function backtestHref(path: string, source: BacktestSource, search = ''): string {
  const params = new URLSearchParams(search);
  if (source === RESEARCH_VALUE) params.set(SOURCE_PARAM, RESEARCH_VALUE);
  else params.delete(SOURCE_PARAM);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}