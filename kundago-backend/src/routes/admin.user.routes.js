import { Router } from 'express';
import { getAdminUsers, toggleUserStatus } from '../controllers/user.controller.js';
import { requireAuth, requireRole } from '../middleware/index.js';

const router = Router();

router.use(requireAuth, requireRole('ADMIN'));

router.get('/', getAdminUsers);
router.patch('/:id/toggle-status', toggleUserStatus);

export default router;
