/**
 * 交易日历面板的日期纯函数工具。
 * 约定：所有日期均为 YYYY-MM-DD 字符串；仅用 Date.UTC / toISOString 做运算，
 * 禁止本地时区 new Date(y, m, d) 构造，避免时区偏移。
 */

const MS_PER_DAY = 86_400_000;

export interface CalendarCell {
  /** YYYY-MM-DD */
  date: string;
  inMonth: boolean;
}

/** 'YYYY-MM-DD' -> 'YYYY-MM' */
export function monthOf(date: string): string {
  return date.slice(0, 7);
}

/** 'YYYY-MM' 月份平移 delta（支持跨年） */
export function shiftMonth(yearMonth: string, delta: number): string {
  const [y, m] = yearMonth.split('-').map(Number) as [number, number];
  return new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7);
}

/** 月视图网格：固定 42 格、周日起始，含前后月补位 */
export function buildMonthGrid(yearMonth: string): CalendarCell[] {
  const [y, m] = yearMonth.split('-').map(Number) as [number, number];
  const firstOfMonth = Date.UTC(y, m - 1, 1);
  const startOffset = new Date(firstOfMonth).getUTCDay(); // 周日=0
  const gridStart = firstOfMonth - startOffset * MS_PER_DAY;
  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart + i * MS_PER_DAY).toISOString().slice(0, 10);
    cells.push({ date, inMonth: date.startsWith(yearMonth) });
  }
  return cells;
}

/** Asia/Shanghai 时区的今天（YYYY-MM-DD），不依赖运行环境本地时区 */
export function shanghaiTodayIso(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
