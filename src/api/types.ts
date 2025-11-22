export interface Task {
  id: string;
  title: string;
  link: string;
  created_at: string;
  updated_at: string;
}

export interface EntryTaskSummary {
  id: string;
  title: string;
  link: string;
}

export interface Entry {
  id: string;
  date: string;
  hours: number;
  description?: string;
  task: EntryTaskSummary;
}

export interface EntryCreate {
  taskId: string;
  date: string;
  hours: number;
  description?: string;
}

export type EntryUpdate = Partial<EntryCreate>;

export interface EntrySummary {
  date: string;
  totalHours: number;
}

