import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleSubtask,
} from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getTasks);
router.get('/:id', authenticate, getTaskById);
router.post('/', authenticate, createTask);
router.put('/:id', authenticate, updateTask);
router.patch('/:id/subtasks/:subtaskId/toggle', authenticate, toggleSubtask);
router.delete('/:id', authenticate, deleteTask);

export default router;
