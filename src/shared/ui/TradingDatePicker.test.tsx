import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TradingDatePicker } from './TradingDatePicker';

// mock 交易日：2026-09-01（二）、09-02（三）、09-03（四）；周末与范围外日期均不在列表
const MOCK_DATES = ['2026-09-01', '2026-09-02', '2026-09-03'];

function renderPicker(overrides: Partial<Parameters<typeof TradingDatePicker>[0]> = {}) {
  const props: Parameters<typeof TradingDatePicker>[0] = {
    label: '交易日',
    value: '2026-09-02',
    availableDates: MOCK_DATES,
    onChange: vi.fn(),
    ...overrides,
  };
  render(<TradingDatePicker {...props} />);
  return props;
}

function openPanel() {
  fireEvent.click(screen.getByRole('button', { name: '选择交易日' }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
}

/** 在日历网格中按日期数字找到可点击的当日按钮（排除置灰的补位月同名日） */
function selectableDay(day: string): HTMLButtonElement {
  const candidates = screen.getAllByRole('button', { name: day });
  const target = candidates.find((el) => !(el as HTMLButtonElement).disabled);
  expect(target, `day ${day} should be selectable`).toBeDefined();
  return target as HTMLButtonElement;
}

describe('TradingDatePicker', () => {
  it('renders trigger with label and current value', () => {
    renderPicker();
    const trigger = screen.getByRole('button', { name: '选择交易日' });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent('2026-09-02');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens the calendar panel and highlights the selected day', () => {
    renderPicker();
    openPanel();
    const selected = document.querySelector('.calendar-day--selected');
    expect(selected).toHaveTextContent('2');
    expect(selected?.getAttribute('data-selected')).toBe('true');
  });

  it('triggers onChange and closes the panel when a selectable day is clicked', () => {
    const props = renderPicker();
    openPanel();
    fireEvent.click(selectableDay('3'));
    expect(props.onChange).toHaveBeenCalledWith('2026-09-03');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('disables non-trading days and ignores clicks on them', () => {
    const props = renderPicker();
    openPanel();
    // 9 月 5 日是周六，不在交易日列表
    const saturday = screen.getAllByRole('button', { name: '5' });
    for (const el of saturday) expect(el).toBeDisabled();
    fireEvent.click(saturday[0] as HTMLButtonElement);
    expect(props.onChange).not.toHaveBeenCalled();
  });

  it('closes the panel on Escape', () => {
    renderPicker();
    openPanel();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClear and closes the panel when the clear button is clicked', () => {
    const onClear = vi.fn();
    const props = renderPicker({ onClear });
    openPanel();
    fireEvent.click(screen.getByRole('button', { name: '清除' }));
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(props.onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('hides the clear button when onClear is absent', () => {
    renderPicker();
    openPanel();
    expect(screen.queryByRole('button', { name: '清除' })).not.toBeInTheDocument();
  });

  it('jumps to the latest trading day via the latest button', () => {
    const props = renderPicker();
    openPanel();
    fireEvent.click(screen.getByRole('button', { name: '最新' }));
    expect(props.onChange).toHaveBeenCalledWith('2026-09-03');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('sorts a descending date list before deriving boundaries', () => {
    // 后端 /api/daily/dates 返回降序；“最新”必须取排序后的最后一项
    const props = renderPicker({ availableDates: ['2026-09-03', '2026-09-01', '2026-09-02'] });
    openPanel();
    expect(screen.getByRole('button', { name: '上一个月' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '下一个月' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '最新' }));
    expect(props.onChange).toHaveBeenCalledWith('2026-09-03');
  });

  it('disables month navigation beyond the available range', () => {
    renderPicker();
    openPanel();
    expect(screen.getByRole('button', { name: '上一个月' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '下一个月' })).toBeDisabled();
  });

  it('falls back to min/max constraints only when availableDates is absent', () => {
    renderPicker({ availableDates: undefined, value: '2026-09-04' });
    openPanel();
    // 无交易日列表：周末不再置灰（仅受 max 约束），9 月 5 日周六可选
    expect(screen.getAllByRole('button', { name: '5' })[0]).not.toBeDisabled();
  });
});
