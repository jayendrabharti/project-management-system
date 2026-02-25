import { Response, NextFunction } from 'express';
import Task from '../models/Task';
import Project from '../models/Project';
import { AuthRequest } from '../types';

// Search across projects and tasks
export const search = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      res.json({ success: true, data: { projects: [], tasks: [] } });
      return;
    }

    const searchRegex = { $regex: q, $options: 'i' };

    const [projects, tasks] = await Promise.all([
      Project.find({
        $or: [{ name: searchRegex }, { description: searchRegex }],
      })
        .select('name description status')
        .limit(5)
        .lean(),
      Task.find({
        $or: [{ title: searchRegex }, { description: searchRegex }],
      })
        .select('title description status priority project')
        .limit(5)
        .lean(),
    ]);

    res.json({
      success: true,
      data: { projects, tasks },
    });
  } catch (error) {
    next(error);
  }
};
