import api from './api';
import type { Task, CreateTaskData, UpdateTaskData, ApiResponse } from '@/types';

export interface TaskFilters {
  project?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  labels?: string;
}

export const getTasks = async (filters?: TaskFilters): Promise<Task[]> => {
  const response = await api.get<ApiResponse<{ tasks: Task[]; count: number }>>('/tasks', {
    params: filters,
  });
  return response.data.data!.tasks;
};

export const getTask = async (id: string): Promise<Task> => {
  const response = await api.get<ApiResponse<{ task: Task }>>(`/tasks/${id}`);
  return response.data.data!.task;
};

export const createTask = async (data: CreateTaskData): Promise<Task> => {
  const response = await api.post<ApiResponse<{ task: Task }>>('/tasks', data);
  return response.data.data!.task;
};

export const updateTask = async (id: string, data: UpdateTaskData): Promise<Task> => {
  const response = await api.put<ApiResponse<{ task: Task }>>(`/tasks/${id}`, data);
  return response.data.data!.task;
};

export const toggleSubtask = async (taskId: string, subtaskId: string): Promise<Task> => {
  const response = await api.patch<ApiResponse<{ task: Task }>>(
    `/tasks/${taskId}/subtasks/${subtaskId}/toggle`
  );
  return response.data.data!.task;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

const taskService = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  toggleSubtask,
  deleteTask,
};

export default taskService;
