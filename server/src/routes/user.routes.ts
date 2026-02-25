import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { getUsers, getUserById } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router: RouterType = Router();

// All routes are protected
router.get('/', authenticate, getUsers);
router.get('/:id', authenticate, getUserById);

export default router;
