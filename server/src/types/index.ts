import { Request } from 'express';
import { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: 'admin' | 'member';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IProject extends Document {
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  owner: IUser['_id'];
  members: IUser['_id'][];
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubtask {
  title: string;
  completed: boolean;
}

export interface ITask extends Document {
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'in-review' | 'completed';
  priority: 'urgent' | 'high' | 'medium' | 'low' | 'none';
  project: IProject['_id'];
  assignedTo?: IUser['_id'];
  createdBy: IUser['_id'];
  dueDate?: Date;
  labels: string[];
  tags: string[];
  subtasks: ISubtask[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivityLog extends Document {
  user: IUser['_id'];
  action: string;
  entityType: 'task' | 'project' | 'comment';
  entityId: string;
  entityName: string;
  projectId?: IProject['_id'];
  details?: string;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
}
