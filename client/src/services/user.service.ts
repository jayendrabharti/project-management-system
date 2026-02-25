import api from './api';
import type { User, ApiResponse } from '@/types';

export interface UserWithStats {
  user: User;
  stats: {
    projectCount: number;
    taskCount: number;
    completedTaskCount: number;
  };
}

export const getUsers = async (search?: string): Promise<User[]> => {
  const params = search ? { search } : {};
  const response = await api.get<ApiResponse<{ users: User[]; count: number }>>('/users', {
    params,
  });
  return response.data.data!.users;
};

export const getUserById = async (id: string): Promise<UserWithStats> => {
  const response = await api.get<ApiResponse<UserWithStats>>(`/users/${id}`);
  return response.data.data!;
};

const userService = {
  getUsers,
  getUserById,
};

export default userService;
