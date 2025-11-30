import { describe, it, vi, afterEach, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WeekPage from './WeekPage';
import * as entriesApi from '../api/entries';

vi.mock('../api/entries');
vi.mock('../WeekNavigation', () => ({
  default: ({ weekTitle }: { weekTitle: string }) => (
    <div data-testid="week-navigation">{weekTitle}</div>
  ),
}));

describe('WeekPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders all days and displays summary hours', async () => {
    vi.spyOn(entriesApi, 'fetchEntriesSummary').mockResolvedValue([
      { date: '2025-11-25T00:00:00.000Z', totalHours: 3 },
    ]);

    render(
      <MemoryRouter>
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
});

