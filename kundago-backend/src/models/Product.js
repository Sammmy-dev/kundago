import mongoose from 'mongoose';

/**
 * Product Schema
 * Based on KundaGo specification - Phase 1
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    images: {
      type: [String],
      default: []
    },
    category: {
      type: String,
      trim: true,
      maxlength: [100, 'Category cannot exceed 100 characters'],
      index: true
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [0, 'Weight cannot be negative'],
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false }
  }
);

// Compound indexes for common query + sort patterns
productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ isActive: 1, category: 1, createdAt: -1 });
productSchema.index({ isActive: 1, price: 1 });
productSchema.index({ isActive: 1, price: -1 });
productSchema.index({ isActive: 1, name: 1 });

// Index for text search
productSchema.index({ name: 'text' });

/**
 * Static method to find active products
 * @returns {Query} Mongoose query for active products
 */
productSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

/**
 * Static method to find products by category
 * @param {string} category - Category name
 * @param {boolean} activeOnly - Filter by active products only (default: true)
 * @returns {Query} Mongoose query for products in category
 */
productSchema.statics.findByCategory = function (category, activeOnly = true) {
  const query = { category: category };
  if (activeOnly) {
    query.isActive = true;
  }
  return this.find(query).sort({ createdAt: -1 });
};

/**
 * Instance method to check if product is in stock
 * @returns {boolean} True if stock > 0
 */
productSchema.methods.isInStock = function () {
  return this.stock > 0;
};

/**
 * Instance method to decrease stock
 * @param {number} quantity - Quantity to decrease
 * @returns {boolean} True if successful
 */
productSchema.methods.decreaseStock = async function (quantity) {
  if (this.stock < quantity) {
    return false;
  }
  this.stock -= quantity;
  await this.save();
  return true;
};

const Product = mongoose.model('Product', productSchema);

export default Product;
