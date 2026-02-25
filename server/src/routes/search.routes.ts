import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { search } from '../controllers/search.controller';
import { authenticate } from '../middleware/auth';

const router: RouterType = Router();

router.get('/', authenticate, search);

export default router;
