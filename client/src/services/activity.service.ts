import api from './api';
import type { ActivityLog, ApiResponse } from '@/types';

export const getActivity = async (limit = 20): Promise<ActivityLog[]> => {
  const response = await api.get<ApiResponse<{ activities: ActivityLog[] }>>('/activity', {
    params: { limit },
  });
  return response.data.data!.activities;
};

export const getProjectActivity = async (projectId: string, limit = 30): Promise<ActivityLog[]> => {
  const response = await api.get<ApiResponse<{ activities: ActivityLog[] }>>(
    `/activity/project/${projectId}`,
    { params: { limit } }
  );
  return response.data.data!.activities;
};

const activityService = { getActivity, getProjectActivity };
export default activityService;
