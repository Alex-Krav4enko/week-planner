import { http } from './http';
import { Task } from './types';

export interface TaskCreate {
  title: string;
  link: string;
}

export type TaskUpdate = Partial<TaskCreate>;

export function fetchTasks(search?: string) {
  return http<Task[]>('/tasks', {
    query: { search },
  });
}

export function createTask(payload: TaskCreate) {
  return http<Task>('/tasks', {
    method: 'POST',
    data: payload,
  });
}

export function updateTask(id: string, payload: TaskUpdate) {
  return http<Task>(`/tasks/${id}`, {
    method: 'PATCH',
    data: payload,
  });
}

export function deleteTask(id: string) {
  return http<void>(`/tasks/${id}`, {
    method: 'DELETE',
  });
}

