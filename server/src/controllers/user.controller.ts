import { Response, NextFunction } from 'express';
import User from '../models/User';
import Project from '../models/Project';
import Task from '../models/Task';
import { AuthRequest } from '../types';

// Get all users
export const getUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { search } = req.query;

    let filter: any = {};
    if (search && typeof search === 'string') {
      filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const users = await User.find(filter).select('-password').sort({ name: 1 });

    res.json({
      success: true,
      data: {
        users: users.map((u) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          createdAt: u.createdAt,
        })),
        count: users.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID with stats
export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Get user stats
    const [projectCount, taskCount, completedTaskCount] = await Promise.all([
      Project.countDocuments({
        $or: [{ owner: user._id }, { members: user._id }],
      }),
      Task.countDocuments({ assignedTo: user._id }),
      Task.countDocuments({ assignedTo: user._id, status: 'completed' }),
    ]);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
        stats: {
          projectCount,
          taskCount,
          completedTaskCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
