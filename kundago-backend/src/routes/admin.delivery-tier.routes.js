import { Router } from 'express';
import { getDeliveryTiers, updateDeliveryTier } from '../controllers/delivery-tier.controller.js';
import { requireAuth, requireRole } from '../middleware/index.js';

const router = Router();

router.use(requireAuth, requireRole('ADMIN'));

router.get('/', getDeliveryTiers);
router.put('/:id', updateDeliveryTier);

export default router;
