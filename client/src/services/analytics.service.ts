import api from './api';
import type { ApiResponse } from '@/types';

interface AnalyticsData {
  tasksByStatus: Array<{ name: string; value: number }>;
  tasksByPriority: Array<{ name: string; value: number }>;
  projectsByStatus: Array<{ name: string; value: number }>;
  completionTrend: Array<{ date: string; completed: number }>;
  totals: {
    tasks: number;
    projects: number;
    overdue: number;
  };
}

export const getAnalytics = async (): Promise<AnalyticsData> => {
  const response = await api.get<ApiResponse<AnalyticsData>>('/analytics');
  return response.data.data!;
};

const analyticsService = { getAnalytics };
export default analyticsService;
