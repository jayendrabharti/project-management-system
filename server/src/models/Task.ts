import mongoose, { Schema } from 'mongoose';
import { ITask } from '../types';

const subtaskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
  },
  { _id: true }
);

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'in-review', 'completed'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['urgent', 'high', 'medium', 'low', 'none'],
      default: 'medium',
    },
    project: {
      type: Schema.Types.ObjectId as any,
      ref: 'Project',
      required: false,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: true,
    },
    dueDate: {
      type: Date,
    },
    labels: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    subtasks: {
      type: [subtaskSchema],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ labels: 1 });

export default mongoose.model<ITask>('Task', taskSchema);
