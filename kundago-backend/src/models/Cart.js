import mongoose from 'mongoose';

/**
 * Cart Item Schema (Embedded)
 * Stores product snapshot at time of adding to cart
 */
const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    priceAtTime: {
      type: Number,
      required: [true, 'Price at time is required'],
      min: [0, 'Price cannot be negative']
    }
  },
  { _id: false }
);

/**
 * Cart Schema
 * Based on KundaGo specification - Phase 1
 */
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true
    },
    items: {
      type: [cartItemSchema],
      default: []
    }
  },
  {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' }
  }
);

/**
 * Static method to find or create cart for user
 * @param {ObjectId} userId - User's ID
 * @returns {Promise<Cart>} User's cart
 */
cartSchema.statics.findOrCreateByUserId = async function (userId) {
  let cart = await this.findOne({ userId });
  if (!cart) {
    cart = await this.create({ userId, items: [] });
  }
  return cart;
};

/**
 * Instance method to add item to cart
 * @param {ObjectId} productId - Product ID
 * @param {number} quantity - Quantity to add
 * @param {number} price - Current product price
 */
cartSchema.methods.addItem = function (productId, quantity, price) {
  const existingItem = this.items.find(
    (item) => item.productId.toString() === productId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.priceAtTime = price; // Update to latest price
  } else {
    this.items.push({
      productId,
      quantity,
      priceAtTime: price
    });
  }
};

/**
 * Instance method to update item quantity
 * @param {ObjectId} productId - Product ID
 * @param {number} quantity - New quantity
 * @returns {boolean} True if item was found and updated
 */
cartSchema.methods.updateItemQuantity = function (productId, quantity) {
  const item = this.items.find(
    (item) => item.productId.toString() === productId.toString()
  );

  if (!item) return false;

  if (quantity <= 0) {
    this.removeItem(productId);
  } else {
    item.quantity = quantity;
  }
  return true;
};

/**
 * Instance method to remove item from cart
 * @param {ObjectId} productId - Product ID to remove
 * @returns {boolean} True if item was found and removed
 */
cartSchema.methods.removeItem = function (productId) {
  const initialLength = this.items.length;
  this.items = this.items.filter(
    (item) => item.productId.toString() !== productId.toString()
  );
  return this.items.length < initialLength;
};

/**
 * Instance method to clear all items from cart
 */
cartSchema.methods.clearCart = function () {
  this.items = [];
};

/**
 * Instance method to calculate cart total
 * @returns {number} Total amount
 */
cartSchema.methods.calculateTotal = function () {
  return this.items.reduce((total, item) => {
    return total + item.priceAtTime * item.quantity;
  }, 0);
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
