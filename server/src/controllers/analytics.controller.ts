import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task';
import Project from '../models/Project';
import { AuthRequest } from '../types';

// Get analytics overview
export const getAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Get user's projects
    const userProjects = await Project.find({
      $or: [{ owner: userId }, { members: userId }],
    }).select('_id');
    const projectIds = userProjects.map((p) => p._id);

    // Task stats by status
    const tasksByStatus = await Task.aggregate([
      {
        $match: {
          $or: [{ project: { $in: projectIds } }, { assignedTo: userId }, { createdBy: userId }],
        },
      },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Task stats by priority
    const tasksByPriority = await Task.aggregate([
      {
        $match: {
          $or: [{ project: { $in: projectIds } }, { assignedTo: userId }, { createdBy: userId }],
        },
      },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // Project stats by status
    const projectsByStatus = await Project.aggregate([
      {
        $match: {
          $or: [{ owner: userId }, { members: userId }],
        },
      },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Tasks completed over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const completionTrend = await Task.aggregate([
      {
        $match: {
          status: 'completed',
          updatedAt: { $gte: sevenDaysAgo },
          $or: [{ project: { $in: projectIds } }, { assignedTo: userId }, { createdBy: userId }],
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Total counts (scoped to user)
    const [totalTasks, totalProjects, overdueTasks] = await Promise.all([
      Task.countDocuments({
        $or: [{ project: { $in: projectIds } }, { assignedTo: userId }, { createdBy: userId }],
      }),
      Project.countDocuments({
        $or: [{ owner: userId }, { members: userId }],
      }),
      Task.countDocuments({
        dueDate: { $lt: new Date() },
        status: { $ne: 'completed' },
        $or: [{ project: { $in: projectIds } }, { assignedTo: userId }, { createdBy: userId }],
      }),
    ]);

    // Completed tasks count
    const completedTasks = await Task.countDocuments({
      status: 'completed',
      $or: [{ project: { $in: projectIds } }, { assignedTo: userId }, { createdBy: userId }],
    });

    res.json({
      success: true,
      data: {
        tasksByStatus: tasksByStatus.map((s) => ({ name: s._id, value: s.count })),
        tasksByPriority: tasksByPriority.map((p) => ({ name: p._id, value: p.count })),
        projectsByStatus: projectsByStatus.map((s) => ({ name: s._id, value: s.count })),
        completionTrend: completionTrend.map((d) => ({
          date: d._id,
          completed: d.count,
        })),
        totals: {
          tasks: totalTasks,
          projects: totalProjects,
          overdue: overdueTasks,
          completed: completedTasks,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
