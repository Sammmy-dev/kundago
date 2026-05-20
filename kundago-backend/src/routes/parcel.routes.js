import { Router } from 'express';
import {
  createParcel,
  getUserParcels,
  getParcelById
} from '../controllers/parcel.controller.js';
import { requireAuth } from '../middleware/index.js';

const router = Router();

// All parcel routes require authentication
router.use(requireAuth);

/**
 * @swagger
 * /parcels:
 *   post:
 *     summary: Create a parcel delivery request
 *     tags: [Parcels]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParcelRequest'
 *     responses:
 *       201:
 *         description: Parcel request created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     parcel:
 *                       $ref: '#/components/schemas/Parcel'
 *       400:
 *         $ref: '#/components/schemas/ValidationError'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 */
router.post('/', createParcel);

/**
 * @swagger
 * /parcels:
 *   get:
 *     summary: Get user's parcels
 *     tags: [Parcels]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's parcels
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
 */
router.get('/', getUserParcels);

/**
 * @swagger
 * /parcels/{id}:
 *   get:
 *     summary: Get single parcel by ID
 *     tags: [Parcels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Parcel ID
 *     responses:
 *       200:
 *         description: Parcel details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     parcel:
 *                       $ref: '#/components/schemas/Parcel'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       404:
 *         $ref: '#/components/schemas/NotFoundError'
 */
router.get('/:id', getParcelById);

export default router;
