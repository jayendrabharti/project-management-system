import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { getAnalytics } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';

const router: RouterType = Router();

router.get('/', authenticate, getAnalytics);

export default router;
