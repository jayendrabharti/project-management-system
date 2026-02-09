import { Response, NextFunction } from 'express';
import { z } from 'zod';
import Task from '../models/Task';
import Project from '../models/Project';
import { AuthRequest } from '../types';

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  status: z.enum(['todo', 'in-progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  project: z.string().optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Title too long').optional(),
  description: z.string().max(2000, 'Description too long').optional(),
  status: z.enum(['todo', 'in-progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
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

    const { project, status, priority, assignedTo } = req.query;

    // Get user's projects
    const userProjects = await Project.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    }).select('_id');

    const projectIds = userProjects.map((p) => p._id);

    // Build filter - include tasks in user's projects OR tasks with no project
    const filter: any = {
      $or: [{ project: { $in: projectIds } }, { project: { $exists: false } }, { project: null }],
    };

    if (project) filter.project = project;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate('project', 'name status')
      .populate('assignedTo', 'name email')
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
      .populate('project', 'name status owner members')
      .populate('assignedTo', 'name email');

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
    // If task has no project, anyone can view it (you may want to add owner checks here)

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
    const taskData: any = { ...validatedData };
    if (!taskData.project || taskData.project === '') {
      delete taskData.project;
    }

    // Create task
    const task = await Task.create(taskData);

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name status')
      .populate('assignedTo', 'name email');

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
    // If task has no project, anyone can update it (you may want to add owner checks here)

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, validatedData, {
      new: true,
      runValidators: true,
    })
      .populate('project', 'name status')
      .populate('assignedTo', 'name email');

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

    // Check if user is project owner (only if task has a project)
    if (task.project) {
      const project = await Project.findOne({
        _id: task.project,
        owner: req.user.id,
      });

      if (!project) {
        res.status(403).json({
          success: false,
          message: 'Only project owners can delete tasks',
        });
        return;
      }
    }
    // If task has no project, anyone can delete it (you may want to add owner checks here)

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
