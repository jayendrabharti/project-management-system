import { Response, NextFunction } from 'express';
import { z } from 'zod';
import Task from '../models/Task';
import Project from '../models/Project';
import ActivityLog from '../models/ActivityLog';
import { AuthRequest } from '../types';

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  status: z.enum(['todo', 'in-progress', 'in-review', 'completed']).optional(),
  priority: z.enum(['urgent', 'high', 'medium', 'low', 'none']).optional(),
  project: z.string().optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
  labels: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  subtasks: z
    .array(z.object({ title: z.string().min(1), completed: z.boolean().optional() }))
    .optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Title too long').optional(),
  description: z.string().max(2000, 'Description too long').optional(),
  status: z.enum(['todo', 'in-progress', 'in-review', 'completed']).optional(),
  priority: z.enum(['urgent', 'high', 'medium', 'low', 'none']).optional(),
  assignedTo: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  subtasks: z
    .array(z.object({ title: z.string().min(1), completed: z.boolean().optional() }))
    .optional(),
  order: z.number().optional(),
});

// Get all tasks with filters
export const getTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { project, status, priority, assignedTo, labels } = req.query;

    // Get user's projects
    const userProjects = await Project.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    }).select('_id');

    const projectIds = userProjects.map((p) => p._id);

    // Build filter - include tasks in user's projects OR tasks created by user
    const filter: any = {
      $or: [
        { project: { $in: projectIds } },
        { createdBy: req.user.id },
        { assignedTo: req.user.id },
        { project: { $exists: false } },
        { project: null },
      ],
    };

    if (project) filter.project = project;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (labels && typeof labels === 'string') {
      filter.labels = { $in: labels.split(',') };
    }

    const tasks = await Task.find(filter)
      .populate('project', 'name status color icon')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { tasks, count: tasks.length },
    });
  } catch (error) {
    next(error);
  }
};

// Get task by ID
export const getTaskById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const task = await Task.findById(req.params.id)
      .populate('project', 'name status owner members color icon')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    // Check if user has access to this task's project (only if task has a project)
    if (task.project) {
      const project = await Project.findOne({
        _id: task.project,
        $or: [{ owner: req.user.id }, { members: req.user.id }],
      });

      if (!project) {
        res.status(403).json({
          success: false,
          message: 'You do not have access to this task',
        });
        return;
      }
    }

    res.json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// Create task
export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const validatedData = createTaskSchema.parse(req.body);

    // Check if user has access to the project (only if project is provided)
    if (validatedData.project) {
      const project = await Project.findOne({
        _id: validatedData.project,
        $or: [{ owner: req.user.id }, { members: req.user.id }],
      });

      if (!project) {
        res.status(403).json({
          success: false,
          message: 'You do not have access to this project',
        });
        return;
      }
    }

    // Clean the data - remove project field if it's empty string
    const taskData: any = { ...validatedData, createdBy: req.user.id };
    if (!taskData.project || taskData.project === '') {
      delete taskData.project;
    }

    // Create task
    const task = await Task.create(taskData);

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name status color icon')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'created',
      entityType: 'task',
      entityId: task._id.toString(),
      entityName: task.title,
      projectId: task.project || undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task: populatedTask },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }
    next(error);
  }
};

// Update task
export const updateTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const validatedData = updateTaskSchema.parse(req.body);

    // Find task and check access
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    // Check if user has access to the project (only if task has a project)
    if (task.project) {
      const project = await Project.findOne({
        _id: task.project,
        $or: [{ owner: req.user.id }, { members: req.user.id }],
      });

      if (!project) {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to update this task',
        });
        return;
      }
    }

    // Build update details for activity log
    const changes: string[] = [];
    if (validatedData.status && validatedData.status !== task.status) {
      changes.push(`status → ${validatedData.status}`);
    }
    if (validatedData.priority && validatedData.priority !== task.priority) {
      changes.push(`priority → ${validatedData.priority}`);
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, validatedData, {
      new: true,
      runValidators: true,
    })
      .populate('project', 'name status color icon')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'updated',
      entityType: 'task',
      entityId: task._id.toString(),
      entityName: task.title,
      projectId: task.project || undefined,
      details: changes.length > 0 ? changes.join(', ') : undefined,
    });

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task: updatedTask },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }
    next(error);
  }
};

// Toggle subtask completion
export const toggleSubtask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { id, subtaskId } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      res.status(404).json({ success: false, message: 'Subtask not found' });
      return;
    }

    subtask.completed = !subtask.completed;
    await task.save();

    const populatedTask = await Task.findById(id)
      .populate('project', 'name status color icon')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.json({
      success: true,
      data: { task: populatedTask },
    });
  } catch (error) {
    next(error);
  }
};

// Delete task
export const deleteTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // Find task and check access
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    // Check if user has access (project owner, member, or task creator)
    if (task.project) {
      const project = await Project.findOne({
        _id: task.project,
        $or: [{ owner: req.user.id }, { members: req.user.id }],
      });

      if (!project && task.createdBy?.toString() !== req.user.id) {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this task',
        });
        return;
      }
    }

    await Task.findByIdAndDelete(req.params.id);

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'deleted',
      entityType: 'task',
      entityId: req.params.id,
      entityName: task.title,
      projectId: task.project || undefined,
    });

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
