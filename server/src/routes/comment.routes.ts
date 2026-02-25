import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { getComments, createComment, deleteComment } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth';

const router: RouterType = Router();

// All routes protected
router.get('/tasks/:taskId/comments', authenticate, getComments);
router.post('/tasks/:taskId/comments', authenticate, createComment);
router.delete('/comments/:id', authenticate, deleteComment);

export default router;
