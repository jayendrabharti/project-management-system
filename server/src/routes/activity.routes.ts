import { Router } from 'express';
import { getActivity, getProjectActivity } from '../controllers/activity.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getActivity);
router.get('/project/:projectId', authenticate, getProjectActivity);

export default router;
