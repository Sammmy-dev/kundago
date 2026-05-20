import { Router } from 'express';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminProducts,
  uploadProductImages,
  deleteProductImage,
  softDeleteProduct
} from '../controllers/product.controller.js';
import { requireAuth, requireRole } from '../middleware/index.js';
import {
  uploadProductImages as multerProductUpload,
  handleUploadError,
  requireCloudinaryConfig
} from '../middleware/upload.js';

const router = Router();

// All routes require authentication and ADMIN role
router.use(requireAuth, requireRole('ADMIN'));

/**
 * @swagger
 * /admin/products:
 *   get:
 *     summary: Get all products (including inactive)
 *     tags: [Admin - Products]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all products
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
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         $ref: '#/components/schemas/ForbiddenError'
 */
router.get('/', getAdminProducts);

/**
 * @swagger
 * /admin/products:
 *   post:
 *     summary: Create a new product (with optional image uploads)
 *     tags: [Admin - Products]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               category:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional array of existing image URLs
 *               productImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Optional image files to upload (max 5, 5MB each, jpg/jpeg/png/webp)
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductRequest'
 *     responses:
 *       201:
 *         description: Product created
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
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         $ref: '#/components/schemas/ValidationError'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         $ref: '#/components/schemas/ForbiddenError'
 */
router.post(
  '/',
  requireCloudinaryConfig,
  multerProductUpload,
  handleUploadError,
  createProduct
);

/**
 * @swagger
 * /admin/products/{id}:
 *   put:
 *     summary: Update a product (with optional image uploads)
 *     tags: [Admin - Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               category:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional array of image URLs to replace existing images
 *               productImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Optional new image files to upload and append (max 5, 5MB each)
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductRequest'
 *     responses:
 *       200:
 *         description: Product updated
 *       400:
 *         $ref: '#/components/schemas/ValidationError'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         $ref: '#/components/schemas/ForbiddenError'
 *       404:
 *         $ref: '#/components/schemas/NotFoundError'
 */
router.put(
  '/:id',
  requireCloudinaryConfig,
  multerProductUpload,
  handleUploadError,
  updateProduct
);

/**
 * @swagger
 * /admin/products/{id}:
 *   delete:
 *     summary: Delete a product (hard delete)
 *     tags: [Admin - Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product permanently deleted
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         $ref: '#/components/schemas/ForbiddenError'
 *       404:
 *         $ref: '#/components/schemas/NotFoundError'
 */
router.delete('/:id', deleteProduct);

/**
 * @swagger
 * /admin/products/{id}/soft-delete:
 *   patch:
 *     summary: Soft delete a product (set isActive to false)
 *     tags: [Admin - Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deactivated successfully
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         $ref: '#/components/schemas/ForbiddenError'
 *       404:
 *         $ref: '#/components/schemas/NotFoundError'
 */
router.patch('/:id/soft-delete', softDeleteProduct);

/**
 * @swagger
 * /admin/products/{id}/images:
 *   post:
 *     summary: Upload product images (multiple)
 *     tags: [Admin - Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               productImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Product images (max 5 files, 5MB each, jpg/jpeg/png/webp)
 *     responses:
 *       200:
 *         description: Product images uploaded successfully
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
 *                   example: Product images uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         images:
 *                           type: array
 *                           items:
 *                             type: string
 *                     uploadedImages:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: No images provided or invalid format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         $ref: '#/components/schemas/ForbiddenError'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.post(
  '/:id/images',
  requireCloudinaryConfig,
  multerProductUpload,
  handleUploadError,
  uploadProductImages
);

/**
 * @swagger
 * /admin/products/{id}/images:
 *   delete:
 *     summary: Delete a single product image
 *     tags: [Admin - Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: Full Cloudinary URL of the image to delete
 *                 example: https://res.cloudinary.com/demo/image/upload/sample.jpg
 *     responses:
 *       200:
 *         description: Product image deleted successfully
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
 *                   example: Product image deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         images:
 *                           type: array
 *                           items:
 *                             type: string
 *       400:
 *         description: Image URL not provided or not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         $ref: '#/components/schemas/ForbiddenError'
 *       404:
 *         description: Product not found or image not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.delete('/:id/images', deleteProductImage);

export default router;
