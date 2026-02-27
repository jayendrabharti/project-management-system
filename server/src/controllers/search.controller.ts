import { Response, NextFunction } from 'express';
import Task from '../models/Task';
import Project from '../models/Project';
import { AuthRequest } from '../types';

// Search across projects and tasks (user-scoped)
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

    // Get user's projects for scoping
    const userProjects = await Project.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    }).select('_id');
    const projectIds = userProjects.map((p) => p._id);

    const [projects, tasks] = await Promise.all([
      Project.find({
        $and: [
          { $or: [{ owner: req.user.id }, { members: req.user.id }] },
          { $or: [{ name: searchRegex }, { description: searchRegex }] },
        ],
      })
        .select('name description status color icon')
        .limit(5)
        .lean(),
      Task.find({
        $and: [
          {
            $or: [
              { project: { $in: projectIds } },
              { createdBy: req.user.id },
              { assignedTo: req.user.id },
            ],
          },
          { $or: [{ title: searchRegex }, { description: searchRegex }] },
        ],
      })
        .select('title description status priority project labels')
        .populate('project', 'name color')
        .limit(10)
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
