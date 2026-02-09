import api from './api';
import type { Project, CreateProjectData, UpdateProjectData, ApiResponse } from '@/types';

export const getProjects = async (status?: string): Promise<Project[]> => {
  const params = status ? { status } : {};
  const response = await api.get<ApiResponse<{ projects: Project[]; count: number }>>('/projects', {
    params,
  });
  return response.data.data!.projects;
};

export const getProject = async (id: string): Promise<Project> => {
  const response = await api.get<ApiResponse<{ project: Project }>>(`/projects/${id}`);
  return response.data.data!.project;
};

export const createProject = async (data: CreateProjectData): Promise<Project> => {
  const response = await api.post<ApiResponse<{ project: Project }>>('/projects', data);
  return response.data.data!.project;
};

export const updateProject = async (id: string, data: UpdateProjectData): Promise<Project> => {
  const response = await api.put<ApiResponse<{ project: Project }>>(`/projects/${id}`, data);
  return response.data.data!.project;
};

export const deleteProject = async (id: string): Promise<void> => {
  await api.delete(`/projects/${id}`);
};

const projectService = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};

export default projectService;
