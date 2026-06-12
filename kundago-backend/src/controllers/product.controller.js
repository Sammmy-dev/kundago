import { Product } from '../models/index.js';
import { logger } from '../config/index.js';
import cloudinary from '../config/cloudinary.js';

/**
 * @desc    Get all active products (public listing)
 * @route   GET /products
 * @access  Public
 * @query   category - Optional: filter by category
 * @query   search - Optional: search by name
 * @query   sort - Optional: sort field (price_asc, price_desc, newest)
 */
export const getProducts = async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    let sortOption = { createdAt: -1 };

    if (sort) {
      switch (sort) {
        case 'price_asc':
          sortOption = { price: 1 };
          break;
        case 'price_desc':
          sortOption = { price: -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'oldest':
          sortOption = { createdAt: 1 };
          break;
        case 'name_asc':
          sortOption = { name: 1 };
          break;
        case 'name_desc':
          sortOption = { name: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    }

    const [total, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query).sort(sortOption).skip(skip).limit(limitNum)
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      hasMore: pageNum * limitNum < total,
      data: {
        products
      }
    });
  } catch (error) {
    logger.error('Get products error:', { error: error.message });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /products/:id
 * @access  Public
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({ _id: id, isActive: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    logger.error('Get product by ID error:', { error: error.message });

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

/**
 * Helper to extract Cloudinary public ID from a URL and destroy the image
 * @param {string} imageUrl - Full Cloudinary image URL
 */
const destroyCloudinaryImage = async (imageUrl) => {
  try {
    const urlParts = imageUrl.split('/');
    const publicIdWithExtension = urlParts.slice(-2).join('/');
    const publicId = publicIdWithExtension.split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.warn('Failed to delete image from Cloudinary:', { error: error.message, imageUrl });
  }
};

/**
 * Helper to clean up an array of Cloudinary images (best-effort)
 * @param {string[]} imageUrls - Array of Cloudinary image URLs
 */
const cleanupCloudinaryImages = async (imageUrls) => {
  await Promise.allSettled(imageUrls.map((url) => destroyCloudinaryImage(url)));
};

/**
 * @desc    Create a new product
 * @route   POST /admin/products
 * @access  Private (Admin only)
 * @note    Accepts multipart/form-data with 'productImages' files and/or 'images' URLs in body
 */
export const createProduct = async (req, res) => {
  // Collect uploaded Cloudinary URLs so we can clean up on failure
  const uploadedImageUrls = [];

  try {
    const { name, description, price, images, stock, isActive, category } = req.body;

    console.log('--- Debug Request ---');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    console.log('---------------------');
    

    // Validate required fields
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, price, and stock'
      });
    }

    // Collect images from file uploads (multipart/form-data via multer)
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => uploadedImageUrls.push(file.path));
    }

    // Also accept image URLs passed directly in the body
    let bodyImageUrls = [];
    if (images) {
      bodyImageUrls = Array.isArray(images) ? images : [images];
    }

    const allImages = [...uploadedImageUrls, ...bodyImageUrls];

    const product = await Product.create({
      name,
      description,
      price,
      images: allImages,
      stock,
      category,
      isActive: isActive !== undefined ? isActive : true
    });

    logger.info(`Product created: ${product.name}`, { productId: product._id });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product
      }
    });
  } catch (error) {
    // Clean up any uploaded images if product creation failed
    if (uploadedImageUrls.length > 0) {
      logger.info('Cleaning up uploaded images after failed product creation');
      await cleanupCloudinaryImages(uploadedImageUrls);
    }

    logger.error('Create product error:', { error: error.message });

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
};

/**
 * @desc    Update a product
 * @route   PUT /admin/products/:id
 * @access  Private (Admin only)
 * @note    Accepts multipart/form-data with optional 'productImages' files.
 *          - New uploaded images are appended to existing images.
 *          - To replace images entirely, pass 'images' (URL array) in body; uploaded files are appended after.
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, images, stock, isActive, category } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update only provided fields
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (isActive !== undefined) product.isActive = isActive;
    if (category !== undefined) product.category = category;

    // Handle images
    let newImages = [];

    // 1. Handle explicit 'images' array from body (URLs)
    if (images !== undefined) {
      const bodyImageUrls = Array.isArray(images) ? images : [images];
      newImages = bodyImageUrls;
    }

    // 2. Handle uploaded files
    if (req.files && req.files.length > 0) {
      const uploadedUrls = req.files.map((file) => file.path);
      
      if (images !== undefined) {
        // If both URLs and files provided, combine them
        newImages = [...newImages, ...uploadedUrls];
      } else {
        // If ONLY files provided, replace existing images with new files
        newImages = uploadedUrls;
      }
      
      product.images = newImages;
    } else if (images !== undefined) {
       // If only URLs provided (no files), update to those URLs
       product.images = newImages;
    }
    // Else: if neither provided, keep existing product.images (do nothing)

    await product.save();

    logger.info(`Product updated: ${product.name}`, { productId: product._id });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product
      }
    });
  } catch (error) {
    logger.error('Update product error:', { error: error.message });

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
};

/**
 * @desc    Hard delete a product (removes from DB and Cloudinary)
 * @route   DELETE /admin/products/:id
 * @access  Private (Admin only)
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      await cleanupCloudinaryImages(product.images);
    }

    // Hard delete from database
    await Product.findByIdAndDelete(id);

    logger.info(`Product deleted (hard): ${product.name}`, { productId: product._id });

    res.status(200).json({
      success: true,
      message: 'Product permanently deleted'
    });
  } catch (error) {
    logger.error('Delete product error:', { error: error.message });

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

/**
 * @desc    Toggle product active status (soft delete/restore)
 * @route   PATCH /admin/products/:id/soft-delete
 * @access  Private (Admin only)
 */
export const softDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Toggle isActive status
    product.isActive = !product.isActive;
    await product.save();

    const statusMessage = product.isActive ? 'activated' : 'deactivated';
    logger.info(`Product ${statusMessage}: ${product.name}`, { productId: product._id });

    res.status(200).json({
      success: true,
      message: `Product ${statusMessage} successfully`,
      data: {
        product
      }
    });
  } catch (error) {
    logger.error('Toggle product status error:', { error: error.message });

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

  //    product.isActive = false;
  //   await product.save();

  //   logger.info(`Product soft deleted: ${product.name}`, { productId: product._id });

  //   res.status(200).json({
  //     success: true,
  //     message: 'Product deactivated successfully'
  //   });
  // } catch (error) {
  //   logger.error('Soft delete product error:', { error: error.message });

  //   if (error.name === 'CastError') {
  //     return res.status(400).json({
  //       success: false,
  //       message: 'Invalid product ID'
  //     });
  //   }


    res.status(500).json({
      success: false,
      message: 'Failed to deactivate product'
    });
  }
};

/**
 * @desc    Get all products (including inactive) for admin
 * @route   GET /admin/products
 * @access  Private (Admin only)
 */
export const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: {
        products
      }
    });
  } catch (error) {
    logger.error('Get admin products error:', { error: error.message });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

/**
 * @desc    Get products by category
 * @route   GET /products/category/:category
 * @access  Public
 */
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    const query = { category, isActive: true };

    const [total, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum)
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      hasMore: pageNum * limitNum < total,
      data: {
        products,
        category
      }
    });
  } catch (error) {
    logger.error('Get products by category error:', { error: error.message });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch products by category'
    });
  }
};

/**
 * @desc    Upload product images
 * @route   POST /admin/products/:id/images
 * @access  Private (Admin only)
 */
export const uploadProductImages = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    // Get Cloudinary URLs from uploaded files
    const imageUrls = req.files.map((file) => file.path);

    // Find product
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Add new images to product (append to existing images)
    product.images = [...product.images, ...imageUrls];
    await product.save();

    logger.info('Product images uploaded', {
      productId: id,
      imageCount: imageUrls.length
    });

    res.status(200).json({
      success: true,
      message: 'Product images uploaded successfully',
      data: {
        product: {
          _id: product._id,
          name: product.name,
          images: product.images
        },
        uploadedImages: imageUrls
      }
    });
  } catch (error) {
    logger.error('Upload product images error:', { error: error.message });

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload product images'
    });
  }
};

/**
 * @desc    Delete a single product image
 * @route   DELETE /admin/products/:id/images
 * @access  Private (Admin only)
 */
export const deleteProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if image exists in product
    if (!product.images.includes(imageUrl)) {
      return res.status(404).json({
        success: false,
        message: 'Image not found in product'
      });
    }

    // Delete image from Cloudinary
    await destroyCloudinaryImage(imageUrl);

    // Remove image URL from product
    product.images = product.images.filter((img) => img !== imageUrl);
    await product.save();

    logger.info('Product image deleted', { productId: id, imageUrl });

    res.status(200).json({
      success: true,
      message: 'Product image deleted successfully',
      data: {
        product: {
          _id: product._id,
          name: product.name,
          images: product.images
        }
      }
    });
  } catch (error) {
    logger.error('Delete product image error:', { error: error.message });

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete product image'
    });
  }
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminProducts,
  getProductsByCategory,
  uploadProductImages,
  deleteProductImage,
  softDeleteProduct
};
