import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/auth';
import { validate, createTaskSchema, updateTaskSchema } from '../middleware/validate';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
} from '../controllers/tasks.controller';

const router = Router();

const taskLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Rate limit exceeded. Slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authenticate);
router.use(taskLimiter);

router.get('/', getTasks);
router.post('/', validate(createTaskSchema), createTask);
router.put('/reorder', reorderTasks);
router.put('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);

export default router;
