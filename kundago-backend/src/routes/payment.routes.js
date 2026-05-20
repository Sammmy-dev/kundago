import { Router } from 'express';
import express from 'express';
import {
  initiateStripePayment,
  handleStripeWebhook,
  getPaymentById,
  getUserPayments
} from '../controllers/payment.controller.js';
import { requireAuth } from '../middleware/index.js';

const router = Router();

/**
 * @swagger
 * /payments/stripe/initiate:
 *   post:
 *     summary: Initiate Stripe payment
 *     description: Create a payment intent for an order or parcel delivery
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - relatedType
 *               - relatedId
 *             properties:
 *               relatedType:
 *                 type: string
 *                 enum: [ORDER, PARCEL]
 *                 description: Type of entity to pay for
 *                 example: ORDER
 *               relatedId:
 *                 type: string
 *                 description: ID of the order or parcel
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       201:
 *         description: Payment initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Payment initiated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     payment:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         referenceId:
 *                           type: string
 *                         amount:
 *                           type: number
 *                         status:
 *                           type: string
 *                         relatedType:
 *                           type: string
 *                         relatedId:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                     clientSecret:
 *                       type: string
 *                       description: Stripe client secret for frontend
 *       400:
 *         description: Invalid request or order already paid
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Not authorized to pay for this resource
 *       404:
 *         description: Order or parcel not found
 *       503:
 *         description: Payment service not configured
 */
router.post('/stripe/initiate', requireAuth, initiateStripePayment);

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get user's payment history
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's payments
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
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Payment'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 */
router.get('/', requireAuth, getUserPayments);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment details
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
 *                     payment:
 *                       $ref: '#/components/schemas/Payment'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Not authorized to view this payment
 *       404:
 *         description: Payment not found
 */
router.get('/:id', requireAuth, getPaymentById);

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Stripe webhook endpoint
 *     description: Handle Stripe webhook events (payment success/failure)
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Webhook signature verification failed
 */
// Note: Webhook route uses raw body for signature verification
// This must be configured in app.js before JSON parsing for this route
router.post('/webhook', handleStripeWebhook);

export default router;
