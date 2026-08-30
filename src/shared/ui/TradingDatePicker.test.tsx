import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TradingDatePicker } from './TradingDatePicker';

describe('TradingDatePicker', () => {
  it('renders date input with label, max date, and current value', () => {
    render(
      <TradingDatePicker
        label="交易日"
        value="2026-08-28"
        max="2026-08-28"
        onChange={vi.fn()}
      />,
    );

    const input = screen.getByLabelText('选择交易日');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'date');
    expect(input).toHaveValue('2026-08-28');
    expect(input).toHaveAttribute('max', '2026-08-28');
  });

  it('triggers onChange when date is changed', () => {
    const onChange = vi.fn();
    render(
      <TradingDatePicker
        label="交易日"
        value="2026-08-28"
        onChange={onChange}
      />,
    );

    const input = screen.getByLabelText('选择交易日');
    fireEvent.change(input, { target: { value: '2026-08-25' } });
    expect(onChange).toHaveBeenCalledWith('2026-08-25');
  });

  it('does not trigger onChange when input is emptied', () => {
    const onChange = vi.fn();
    render(
      <TradingDatePicker
        label="交易日"
        value="2026-08-28"
        onChange={onChange}
      />,
    );

    const input = screen.getByLabelText('选择交易日');
    fireEvent.change(input, { target: { value: '' } });
    expect(onChange).not.toHaveBeenCalled();
  });
});
