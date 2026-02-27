import { Response, NextFunction } from 'express';
import ActivityLog from '../models/ActivityLog';
import { AuthRequest } from '../types';

// Get recent activity (global for user)
export const getActivity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 20;

    const activities = await ActivityLog.find({})
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: { activities },
    });
  } catch (error) {
    next(error);
  }
};

// Get activity for a specific project
export const getProjectActivity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { projectId } = req.params;
    const limit = parseInt(req.query.limit as string) || 30;

    const activities = await ActivityLog.find({ projectId })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: { activities },
    });
  } catch (error) {
    next(error);
  }
};
