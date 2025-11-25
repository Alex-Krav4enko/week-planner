import { http } from './http';
import {
  Entry,
  EntryCreate,
  EntrySummary,
  EntryUpdate,
} from './types';

export function fetchEntriesByDate(date: string) {
  return http<Entry[]>('/entries', {
    query: { date },
  });
}

export function fetchEntriesSummary(from: string, to: string) {
  return http<EntrySummary[]>('/entries/summary', {
    query: { from, to },
  });
}

export function createEntry(payload: EntryCreate) {
  return http<Entry>('/entries', {
    method: 'POST',
    data: payload,
  });
}

export function updateEntry(id: string, payload: EntryUpdate) {
  return http<Entry>(`/entries/${id}`, {
    method: 'PATCH',
    data: payload,
  });
}

export function deleteEntry(id: string) {
  return http<void>(`/entries/${id}`, {
    method: 'DELETE',
  });
}

