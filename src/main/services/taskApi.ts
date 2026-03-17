import axios, { AxiosInstance } from 'axios';
import config from 'config';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  dueDateTime: string
  createdAt: string
  updatedAt: string
}

export interface TaskRequest {
  title: string
  description?: string
  status: TaskStatus
  dueDateTime: string
}

function client(): AxiosInstance {
  const baseURL = config.get<string>('services.taskApiUrl');
  return axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10_000,
  });
}

export async function listTasks(): Promise<Task[]> {
  const { data } = await client().get<Task[]>('/tasks');
  return data;
}

export async function getTask(id: string): Promise<Task> {
  const { data } = await client().get<Task>(`/tasks/${id}`);
  return data;
}

export async function createTask(payload: TaskRequest): Promise<Task> {
  const { data } = await client().post<Task>('/tasks', payload);
  return data;
}

export async function updateTask(id: string, payload: TaskRequest): Promise<Task> {
  const { data } = await client().put<Task>(`/tasks/${id}`, payload);
  return data;
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  const { data } = await client().patch<Task>(`/tasks/${id}/status`, { status });
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  await client().delete(`/tasks/${id}`);
}
