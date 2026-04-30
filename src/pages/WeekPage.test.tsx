import { describe, it, vi, afterEach, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WeekPage from './WeekPage';
import * as entriesApi from '../api/entries';

vi.mock('../api/entries');
vi.mock('../WeekNavigation', () => ({
  default: ({
    weekTitle,
    onPrev,
    onNext,
  }: {
    weekTitle: string;
    onPrev: () => void;
    onNext: () => void;
  }) => (
    <div data-testid="week-navigation">
      <button data-testid="prev-week" onClick={onPrev}>
        prev
      </button>
      <span>{weekTitle}</span>
      <button data-testid="next-week" onClick={onNext}>
        next
      </button>
    </div>
  ),
}));

describe('WeekPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders 7 day cards and displays summary hours', async () => {
    vi.spyOn(entriesApi, 'fetchEntriesSummary').mockResolvedValue([
      { date: '2026-04-27T00:00:00.000Z', totalHours: 3 },
    ]);

    render(
      <MemoryRouter initialEntries={['/?from=2026-04-27']}>
        <WeekPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByText('3 ч')).toBeInTheDocument(),
    );
    expect(screen.getAllByText(/ч$/)).toHaveLength(7);
  });

  it('shows error message if summary request fails', async () => {
    vi.spyOn(entriesApi, 'fetchEntriesSummary').mockRejectedValue(
      new Error('Network error'),
    );

    render(
      <MemoryRouter>
        <WeekPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(
        screen.getByText(/Не удалось загрузить данные/),
      ).toBeInTheDocument(),
    );
  });

  it('loads previous week when prev button is clicked', async () => {
    vi.spyOn(entriesApi, 'fetchEntriesSummary').mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={['/?from=2026-04-27']}>
        <WeekPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(entriesApi.fetchEntriesSummary).toHaveBeenCalledWith(
        '2026-04-27',
        '2026-05-03',
      ),
    );

    fireEvent.click(screen.getByTestId('prev-week'));

    await waitFor(() =>
      expect(entriesApi.fetchEntriesSummary).toHaveBeenCalledWith(
        '2026-04-20',
        '2026-04-26',
      ),
    );
  });

  it('loads next week when next button is clicked', async () => {
    vi.spyOn(entriesApi, 'fetchEntriesSummary').mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={['/?from=2026-04-27']}>
        <WeekPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(entriesApi.fetchEntriesSummary).toHaveBeenCalledWith(
        '2026-04-27',
        '2026-05-03',
      ),
    );

    fireEvent.click(screen.getByTestId('next-week'));

    await waitFor(() =>
      expect(entriesApi.fetchEntriesSummary).toHaveBeenCalledWith(
        '2026-05-04',
        '2026-05-10',
      ),
    );
  });
});
