import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { buildMonthGrid, monthOf, shanghaiTodayIso, shiftMonth } from './tradingCalendar';

export interface TradingCalendarPanelProps {
  value: string | null;
  /** YYYY-MM-DD 升序交易日列表；缺省时降级为仅 min/max 约束 */
  availableDates?: string[] | undefined;
  min?: string | undefined;
  max?: string | undefined;
  onSelect: (date: string) => void;
  onClear?: (() => void) | undefined;
  'aria-label'?: string | undefined;
}

export function TradingCalendarPanel({
  value,
  availableDates,
  min,
  max,
  onSelect,
  onClear,
  'aria-label': ariaLabel,
}: TradingCalendarPanelProps) {
  const allowed = useMemo(() => (availableDates ? new Set(availableDates) : null), [availableDates]);
  // 后端日期列表不保证升序（/api/daily/dates 为降序），此处统一排序后取边界
  const sortedDates = useMemo(() => (availableDates ? [...availableDates].sort() : null), [availableDates]);
  const firstSelectable = sortedDates?.[0] ?? min ?? null;
  const lastSelectable = sortedDates?.at(-1) ?? max ?? null;

  const [currentMonth, setCurrentMonth] = useState(
    value ? monthOf(value) : lastSelectable ? monthOf(lastSelectable) : monthOf(shanghaiTodayIso()),
  );
  const rootRef = useRef<HTMLDivElement>(null);

  // 打开时聚焦当前选中日；无选中则聚焦面板容器
  useEffect(() => {
    const selected = rootRef.current?.querySelector<HTMLElement>('.calendar-day--selected');
    (selected ?? rootRef.current)?.focus();
  }, []);

  const cells = useMemo(() => buildMonthGrid(currentMonth), [currentMonth]);

  const isSelectable = (date: string): boolean => {
    if (allowed && !allowed.has(date)) return false;
    if (min && date < min) return false;
    if (max && date > max) return false;
    return true;
  };

  const monthHasSelectable = cells.some((cell) => isSelectable(cell.date));
  const prevDisabled = firstSelectable !== null && currentMonth <= monthOf(firstSelectable);
  const nextDisabled = lastSelectable !== null && currentMonth >= monthOf(lastSelectable);
  const [year, month] = currentMonth.split('-') as [string, string];

  return (
    <div ref={rootRef} className="date-popover" role="dialog" aria-label={ariaLabel ?? '选择日期'} tabIndex={-1}>
      <div className="calendar-header">
        <button
          type="button"
          className="calendar-nav"
          disabled={prevDisabled}
          onClick={() => setCurrentMonth(shiftMonth(currentMonth, -1))}
          aria-label="上一个月"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="calendar-title">
          {Number(year)} 年 {Number(month)} 月
        </span>
        <button
          type="button"
          className="calendar-nav"
          disabled={nextDisabled}
          onClick={() => setCurrentMonth(shiftMonth(currentMonth, 1))}
          aria-label="下一个月"
        >
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="calendar-weekdays" aria-hidden="true">
        {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="calendar-grid">
        {cells.map((cell) => {
          const selectable = isSelectable(cell.date);
          const selected = cell.date === value;
          return (
            <button
              key={cell.date}
              type="button"
              disabled={!selectable}
              data-selected={selected || undefined}
              className={clsx(
                'calendar-day',
                !cell.inMonth && 'calendar-day--outside',
                selected && 'calendar-day--selected',
                !selectable && 'calendar-day--disabled',
              )}
              onClick={() => onSelect(cell.date)}
            >
              {Number(cell.date.slice(8, 10))}
            </button>
          );
        })}
      </div>
      {!monthHasSelectable && <div className="calendar-empty">本月无可选交易日</div>}
      <div className="calendar-footer">
        {onClear ? (
          <button type="button" className="calendar-action calendar-action--clear" onClick={onClear}>
            清除
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          className="calendar-action calendar-action--latest"
          disabled={lastSelectable === null}
          onClick={() => lastSelectable && onSelect(lastSelectable)}
        >
          最新
        </button>
      </div>
    </div>
  );
}
