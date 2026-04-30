import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DayPage from './DayPage';

vi.mock('../DayGroup', () => ({
  default: ({
    day,
    isoDate,
  }: {
    day: string;
    date: string;
    isoDate?: string;
  }) => (
    <div>
      <span data-testid="day-name">{day}</span>
      <span data-testid="iso-date">{isoDate}</span>
    </div>
  ),
}));

function renderDayPage(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/day/:day" element={<DayPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('DayPage', () => {
  it('computes correct isoDate for Monday when ?from=2026-04-27', () => {
    renderDayPage('/day/Monday?from=2026-04-27');
    expect(screen.getByTestId('iso-date').textContent).toBe('2026-04-27');
    expect(screen.getByTestId('day-name').textContent).toBe('Monday');
  });

  it('computes correct isoDate for Friday when ?from=2026-04-27', () => {
    renderDayPage('/day/Friday?from=2026-04-27');
    expect(screen.getByTestId('iso-date').textContent).toBe('2026-05-01');
  });

  it('computes correct isoDate for Sunday when ?from=2026-04-27', () => {
    renderDayPage('/day/Sunday?from=2026-04-27');
    expect(screen.getByTestId('iso-date').textContent).toBe('2026-05-03');
  });

  it('falls back to current week when ?from= is absent', () => {
    renderDayPage('/day/Monday');
    expect(screen.getByTestId('iso-date').textContent).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
  });
});
