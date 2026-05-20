import { Router } from 'express';
import {
  getAdminParcels,
  updateParcelStatus
} from '../controllers/parcel.controller.js';
import { requireAuth, requireRole } from '../middleware/index.js';

const router = Router();

// All routes require authentication and ADMIN role
router.use(requireAuth, requireRole('ADMIN'));

/**
 * @swagger
 * /admin/parcels:
 *   get:
 *     summary: Get all parcels (with optional status filter)
 *     tags: [Admin - Parcels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PICKED, DELIVERED]
 *         description: Filter by parcel status
 *     responses:
 *       200:
 *         description: List of all parcels
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: object
 *                   properties:
 *                     parcels:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Parcel'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         $ref: '#/components/schemas/ForbiddenError'
 */
router.get('/', getAdminParcels);

/**
 * @swagger
 * /admin/parcels/{id}/status:
 *   put:
 *     summary: Update parcel status
 *     tags: [Admin - Parcels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Parcel ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateParcelStatusRequest'
 *     responses:
 *       200:
 *         description: Parcel status updated
 *       400:
 *         description: Invalid status transition
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         $ref: '#/components/schemas/ForbiddenError'
 *       404:
 *         $ref: '#/components/schemas/NotFoundError'
 */
router.put('/:id/status', updateParcelStatus);

export default router;
