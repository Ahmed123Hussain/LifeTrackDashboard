import { Router } from 'express';
import * as todoController from '../controllers/todoController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);
router.get('/', todoController.getTodos);
router.get('/:id', todoController.getTodo);
router.post('/', todoController.createTodo);
router.put('/:id', todoController.updateTodo);
router.delete('/:id', todoController.deleteTodo);

export default router;
