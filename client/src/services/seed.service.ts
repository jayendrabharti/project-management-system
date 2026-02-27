import api from './api';
import type { ApiResponse } from '@/types';

export const seedDemoData = async (): Promise<void> => {
  await api.post<ApiResponse>('/seed');
};

const seedService = { seedDemoData };
export default seedService;
