import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
} from '../controllers/cart.controller.js';
import { requireAuth } from '../middleware/index.js';

const router = Router();

// All cart routes require authentication
router.use(requireAuth);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved
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
 *                     cart:
 *                       $ref: '#/components/schemas/Cart'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 */
router.get('/', getCart);

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToCartRequest'
 *     responses:
 *       200:
 *         description: Item added to cart
 *       400:
 *         description: Validation error or insufficient stock
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       404:
 *         description: Product not found
 */
router.post('/add', addToCart);

/**
 * @swagger
 * /cart/update:
 *   put:
 *     summary: Update item quantity in cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartRequest'
 *     responses:
 *       200:
 *         description: Cart updated
 *       400:
 *         description: Validation error
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 */
router.put('/update', updateCartItem);

/**
 * @swagger
 * /cart/remove/{productId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to remove
 *     responses:
 *       200:
 *         description: Item removed from cart
 *       400:
 *         description: Invalid product ID
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 */
router.delete('/remove/:productId', removeFromCart);

export default router;
