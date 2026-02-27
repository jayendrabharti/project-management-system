import { Response, NextFunction } from 'express';
import { z } from 'zod';
import Project from '../models/Project';
import Task from '../models/Task';
import Comment from '../models/Comment';
import ActivityLog from '../models/ActivityLog';
import { AuthRequest } from '../types';

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200, 'Name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  status: z.enum(['active', 'completed', 'archived']).optional(),
  members: z.array(z.string()).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200, 'Name too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  status: z.enum(['active', 'completed', 'archived']).optional(),
  members: z.array(z.string()).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

// Get all projects (user is member or owner)
export const getProjects = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { status } = req.query;
    const filter: any = {
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    };

    if (status) {
      filter.status = status;
    }

    const projects = await Project.find(filter)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 });

    // Attach task counts for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const [totalTasks, completedTasks] = await Promise.all([
          Task.countDocuments({ project: project._id }),
          Task.countDocuments({ project: project._id, status: 'completed' }),
        ]);

        return {
          ...project.toObject(),
          taskCount: totalTasks,
          completedTaskCount: completedTasks,
        };
      })
    );

    res.json({
      success: true,
      data: { projects: projectsWithCounts, count: projectsWithCounts.length },
    });
  } catch (error) {
    next(error);
  }
};

// Get project by ID
export const getProjectById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const project = await Project.findOne({
      _id: req.params.id,
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    // Get task stats
    const [totalTasks, completedTasks] = await Promise.all([
      Task.countDocuments({ project: project._id }),
      Task.countDocuments({ project: project._id, status: 'completed' }),
    ]);

    res.json({
      success: true,
      data: {
        project: {
          ...project.toObject(),
          taskCount: totalTasks,
          completedTaskCount: completedTasks,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create project
export const createProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const validatedData = createProjectSchema.parse(req.body);

    // Create project with owner
    const project = await Project.create({
      ...validatedData,
      owner: req.user.id,
      members: validatedData.members || [],
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'created',
      entityType: 'project',
      entityId: project._id.toString(),
      entityName: project.name,
      projectId: project._id,
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project: populatedProject },
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

// Update project
export const updateProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const validatedData = updateProjectSchema.parse(req.body);

    // Find project and check ownership
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to update it',
      });
      return;
    }

    // Update project
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, validatedData, {
      new: true,
      runValidators: true,
    })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'updated',
      entityType: 'project',
      entityId: project._id.toString(),
      entityName: project.name,
      projectId: project._id,
    });

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project: updatedProject },
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

// Delete project - CASCADE delete tasks and comments
export const deleteProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // Find project and check ownership
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to delete it',
      });
      return;
    }

    // Cascade delete: get task IDs first for comment deletion
    const tasks = await Task.find({ project: req.params.id }).select('_id');
    const taskIds = tasks.map((t) => t._id);

    // Delete comments on those tasks
    await Comment.deleteMany({ task: { $in: taskIds } });

    // Delete all tasks in the project
    await Task.deleteMany({ project: req.params.id });

    // Delete activity logs for this project
    await ActivityLog.deleteMany({ projectId: req.params.id });

    // Delete the project
    await Project.findByIdAndDelete(req.params.id);

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'deleted',
      entityType: 'project',
      entityId: req.params.id,
      entityName: project.name,
    });

    res.json({
      success: true,
      message: 'Project and all associated data deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
