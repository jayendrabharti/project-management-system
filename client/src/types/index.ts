// User types
export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'admin' | 'member';
  createdAt: string;
}

// Project types
export interface Project {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  owner: User | string;
  members: (User | string)[];
  color: string;
  icon: string;
  taskCount?: number;
  completedTaskCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  status?: 'active' | 'completed' | 'archived';
  members?: string[];
  color?: string;
  icon?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: 'active' | 'completed' | 'archived';
  members?: string[];
  color?: string;
  icon?: string;
}

// Task types
export interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'in-review' | 'completed';
  priority: 'urgent' | 'high' | 'medium' | 'low' | 'none';
  project: Project | string;
  assignedTo?: User | string;
  createdBy?: User | string;
  dueDate?: string;
  labels: string[];
  tags: string[];
  subtasks: Subtask[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'in-review' | 'completed';
  priority?: 'urgent' | 'high' | 'medium' | 'low' | 'none';
  project?: string;
  assignedTo?: string;
  dueDate?: string;
  labels?: string[];
  tags?: string[];
  subtasks?: { title: string; completed?: boolean }[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'in-review' | 'completed';
  priority?: 'urgent' | 'high' | 'medium' | 'low' | 'none';
  assignedTo?: string | null;
  dueDate?: string | null;
  labels?: string[];
  tags?: string[];
  subtasks?: { title: string; completed?: boolean }[];
  order?: number;
}

// Activity types
export interface ActivityLog {
  _id: string;
  user: User;
  action: string;
  entityType: 'task' | 'project' | 'comment';
  entityId: string;
  entityName: string;
  projectId?: string;
  details?: string;
  createdAt: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface ApiError {
  success: false;
  message: string;
  errors?: any[];
}
