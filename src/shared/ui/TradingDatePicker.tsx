import { useEffect, useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { TradingCalendarPanel } from './TradingCalendarPanel';

export interface TradingDatePickerProps {
  label?: string;
  value: string | null;
  onChange: (date: string) => void;
  /** YYYY-MM-DD 升序交易日列表；非交易日置灰不可点，缺省时降级为仅 min/max 约束 */
  availableDates?: string[] | undefined;
  /** 清空选择回调；未传则不渲染"清除"按钮 */
  onClear?: (() => void) | undefined;
  max?: string | undefined;
  min?: string | undefined;
  'aria-label'?: string;
  className?: string;
}

export function TradingDatePicker({
  label = '交易日',
  value,
  onChange,
  availableDates,
  onClear,
  max,
  min,
  'aria-label': ariaLabel,
  className,
}: TradingDatePickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={className ? `date-control ${className}` : 'date-control'}
      onKeyDown={(event) => {
        if (event.key === 'Escape') close(true);
      }}
    >
      <CalendarDays size={14} />
      <span>{label}</span>
      <button
        ref={triggerRef}
        type="button"
        className="date-input date-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel ?? `选择${label}`}
        onClick={() => setOpen((v) => !v)}
      >
        {value ?? '选择日期'}
      </button>
      {open && (
        <TradingCalendarPanel
          value={value}
          availableDates={availableDates}
          min={min}
          max={max}
          aria-label={ariaLabel ? `选择${ariaLabel}` : undefined}
          onSelect={(date) => {
            onChange(date);
            close(true);
          }}
          onClear={
            onClear
              ? () => {
                  onClear();
                  close(true);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
