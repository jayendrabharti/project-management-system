import { Response, NextFunction } from 'express';
import { z } from 'zod';
import Comment from '../models/Comment';
import { AuthRequest } from '../types';

// Get comments for a task
export const getComments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { taskId } = req.params;

    const comments = await Comment.find({ task: taskId })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { comments },
    });
  } catch (error) {
    next(error);
  }
};

// Create a comment
export const createComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { taskId } = req.params;

    const commentSchema = z.object({
      content: z.string().min(1, 'Comment content is required'),
    });

    const { content } = commentSchema.parse(req.body);

    const comment = await Comment.create({
      content,
      author: req.user.id,
      task: taskId,
    });

    const populated = await comment.populate('author', 'name email');

    res.status(201).json({
      success: true,
      data: { comment: populated },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a comment
export const deleteComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      res.status(404).json({ success: false, message: 'Comment not found' });
      return;
    }

    // Only author can delete
    if (comment.author.toString() !== req.user.id) {
      res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
      return;
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};
