import { Response, NextFunction } from 'express';
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

    const userId = req.user.id;

    // Task stats by status
    const tasksByStatus = await Task.aggregate([
      {
        $match: {
          $or: [{ assignedTo: userId }, { createdBy: userId }],
        },
      },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Task stats by priority
    const tasksByPriority = await Task.aggregate([
      {
        $match: {
          $or: [{ assignedTo: userId }, { createdBy: userId }],
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

    // Total counts
    const [totalTasks, totalProjects, overdueTasks] = await Promise.all([
      Task.countDocuments({}),
      Project.countDocuments({}),
      Task.countDocuments({
        dueDate: { $lt: new Date() },
        status: { $ne: 'completed' },
      }),
    ]);

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
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
