import { Router } from 'express';
import {
  getDashboardMetrics,
  getLatestAdminOrders,
  getAdminOrders,
  updateOrderStatus
} from '../controllers/order.controller.js';
import { requireAuth, requireRole } from '../middleware/index.js';

const router = Router();

// All routes require authentication and ADMIN role
router.use(requireAuth, requireRole('ADMIN'));

/**
 * @swagger
 * /admin/orders/metrics/dashboard:
 *   get:
 *     summary: Get dashboard metrics
 *     description: Retrieve key performance metrics for the admin dashboard including monthly revenue, daily orders, pending orders, and completed orders
 *     tags: [Admin - Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     metrics:
 *                       type: object
 *                       properties:
 *                         monthlyRevenue:
 *                           type: number
 *                           description: Total revenue from paid orders in the current month
 *                           example: 15000
 *                         dailyOrders:
 *                           type: number
 *                           description: Number of orders created today
 *                           example: 12
 *                         pendingOrders:
 *                           type: number
 *                           description: Number of orders with status PENDING
 *                           example: 5
 *                         completedOrders:
 *                           type: number
 *                           description: Number of orders with status DELIVERED
 *                           example: 45
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         $ref: '#/components/schemas/ForbiddenError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to fetch dashboard metrics
 */
router.get('/metrics/dashboard', getDashboardMetrics);

/**
 * @swagger
 * /admin/orders/latest:
 *   get:
 *     summary: Get 5 latest orders
 *     tags: [Admin - Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of 5 latest orders
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         $ref: '#/components/schemas/ForbiddenError'
 */
router.get('/latest', getLatestAdminOrders);

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get all orders (with optional status filter)
 *     tags: [Admin - Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, DELIVERED]
 *         description: Filter by order status
 *     responses:
 *       200:
 *         description: List of all orders
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         $ref: '#/components/schemas/ForbiddenError'
 */
router.get('/', getAdminOrders);

/**
 * @swagger
 * /admin/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Admin - Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderStatusRequest'
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Invalid status transition
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         $ref: '#/components/schemas/ForbiddenError'
 *       404:
 *         $ref: '#/components/schemas/NotFoundError'
 */
router.put('/:id/status', updateOrderStatus);

export default router;
