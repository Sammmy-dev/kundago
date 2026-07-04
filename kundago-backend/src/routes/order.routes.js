import { Router } from 'express';
import {
  checkout,
  getUserOrders,
  getOrderById
} from '../controllers/order.controller.js';
import { requireAuth } from '../middleware/index.js';
import { idempotencyMiddleware } from '../middleware/idempotency.js';

const router = Router();

// All order routes require authentication
router.use(requireAuth);

/**
 * @swagger
 * /orders/checkout:
 *   post:
 *     summary: Create order from cart
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
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
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         description: Cart is empty or validation error
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 */
router.post('/checkout', idempotencyMiddleware, checkout);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get user's orders
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
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
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 */
router.get('/', getUserOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get single order by ID
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
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
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       404:
 *         $ref: '#/components/schemas/NotFoundError'
 */
router.get('/:id', getOrderById);

export default router;
