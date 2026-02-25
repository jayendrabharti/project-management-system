import { Router } from 'express';
import type { Router as RouterType } from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router: RouterType = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);

export default router;
