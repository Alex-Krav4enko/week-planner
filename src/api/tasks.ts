import { http } from './http';
import { Task } from './types';

interface TaskCreate {
  title: string;
  link: string;
}

type TaskUpdate = Partial<TaskCreate>;

export function fetchTasks(search?: string) {
  return http<Task[]>('/tasks', {
    query: { search },
  });
}

export function createTask(payload: TaskCreate) {
  return http<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateTask(id: string, payload: TaskUpdate) {
  return http<Task>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteTask(id: string) {
  return http<void>(`/tasks/${id}`, {
    method: 'DELETE',
  });
}

