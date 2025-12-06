import { Router } from 'express';
import * as goalController from '../controllers/goalController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);
router.get('/', goalController.getGoals);
router.get('/:id', goalController.getGoal);
router.post('/', goalController.createGoal);
router.put('/:id', goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);
router.get('/dashboard/stats', goalController.getDashboardStats);

export default router;
