import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WeekNavigation from './WeekNavigation';

describe('WeekNavigation', () => {
  it('displays the week title', () => {
    render(
      <WeekNavigation weekTitle="Week Apr 27" onPrev={vi.fn()} onNext={vi.fn()} />,
    );
    expect(screen.getByText('Week Apr 27')).toBeInTheDocument();
  });

  it('calls onPrev when the left button is clicked', () => {
    const onPrev = vi.fn();
    render(
      <WeekNavigation weekTitle="Test" onPrev={onPrev} onNext={vi.fn()} />,
    );
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when the right button is clicked', () => {
    const onNext = vi.fn();
    render(
      <WeekNavigation weekTitle="Test" onPrev={vi.fn()} onNext={onNext} />,
    );
    fireEvent.click(screen.getAllByRole('button')[1]);
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
