import api from './api';
import type { ApiResponse } from '@/types';

export interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  task: string;
  createdAt: string;
  updatedAt: string;
}

export const getComments = async (taskId: string): Promise<Comment[]> => {
  const response = await api.get<ApiResponse<{ comments: Comment[] }>>(`/tasks/${taskId}/comments`);
  return response.data.data!.comments;
};

export const createComment = async (taskId: string, content: string): Promise<Comment> => {
  const response = await api.post<ApiResponse<{ comment: Comment }>>(`/tasks/${taskId}/comments`, {
    content,
  });
  return response.data.data!.comment;
};

export const deleteComment = async (commentId: string): Promise<void> => {
  await api.delete(`/comments/${commentId}`);
};

const commentService = { getComments, createComment, deleteComment };
export default commentService;
