import type { ChangeEvent } from 'react';
import { CalendarDays } from 'lucide-react';
import clsx from 'clsx';

export interface TradingDatePickerProps {
  label?: string;
  value: string | null;
  onChange: (date: string) => void;
  max?: string | undefined;
  min?: string | undefined;
  'aria-label'?: string;
  className?: string;
}

export function TradingDatePicker({
  label = '交易日',
  value,
  onChange,
  max,
  min,
  'aria-label': ariaLabel,
  className,
}: TradingDatePickerProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    if (nextValue) {
      onChange(nextValue);
    }
  };

  return (
    <label className={clsx('date-control', className)}>
      <CalendarDays size={14} />
      <span>{label}</span>
      <input
        type="date"
        className="date-input"
        value={value ?? ''}
        max={max}
        min={min}
        onChange={handleChange}
        aria-label={ariaLabel ?? `选择${label}`}
      />
    </label>
  );
}
