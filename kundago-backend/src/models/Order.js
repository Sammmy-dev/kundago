import mongoose from 'mongoose';

/**
 * Payment Method Enum
 */
export const PAYMENT_METHODS = ['STRIPE', 'WAVE', 'COD'];

/**
 * Payment Status Enum
 */
export const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED'];

/**
 * Order Status Enum
 */
export const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'DELIVERED'];

/**
 * Order Item Schema (Embedded)
 * Stores product snapshot at time of order
 */
const orderItemSchema = new mongoose.Schema(
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
 * Order Schema
 * Based on KundaGo specification - Phase 1
 */
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'Order must have at least one item'],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: 'Order must have at least one item'
      }
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    paymentMethod: {
      type: String,
      enum: {
        values: PAYMENT_METHODS,
        message: 'Payment method must be STRIPE, WAVE, or COD'
      },
      required: [true, 'Payment method is required']
    },
    paymentStatus: {
      type: String,
      enum: {
        values: PAYMENT_STATUSES,
        message: 'Payment status must be PENDING, PAID, or FAILED'
      },
      default: 'PENDING'
    },
    orderStatus: {
      type: String,
      enum: {
        values: ORDER_STATUSES,
        message: 'Order status must be PENDING, CONFIRMED, or DELIVERED'
      },
      default: 'PENDING'
    },
    deliveryAddress: {
      type: String,
      required: [true, 'Delivery address is required'],
      trim: true
    }
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false }
  }
);

// Indexes for common queries
orderSchema.index({ userId: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

/**
 * Static method to find orders by user
 * @param {ObjectId} userId - User's ID
 * @returns {Query} Mongoose query
 */
orderSchema.statics.findByUserId = function (userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

/**
 * Static method to find orders by status
 * @param {string} status - Order status
 * @returns {Query} Mongoose query
 */
orderSchema.statics.findByStatus = function (status) {
  return this.find({ orderStatus: status }).sort({ createdAt: -1 });
};

/**
 * Instance method to update order status
 * Enforces status flow: PENDING → CONFIRMED → DELIVERED
 * @param {string} newStatus - New order status
 * @returns {boolean} True if status was updated
 */
orderSchema.methods.updateOrderStatus = function (newStatus) {
  const statusOrder = { PENDING: 0, CONFIRMED: 1, DELIVERED: 2 };
  const currentIndex = statusOrder[this.orderStatus];
  const newIndex = statusOrder[newStatus];

  // Can only move forward in status, not backward
  if (newIndex <= currentIndex) {
    return false;
  }

  // Cannot skip statuses (e.g., PENDING -> DELIVERED)
  if (newIndex - currentIndex > 1) {
    return false;
  }

  this.orderStatus = newStatus;
  return true;
};

/**
 * Instance method to update payment status
 * @param {string} newStatus - New payment status
 */
orderSchema.methods.updatePaymentStatus = function (newStatus) {
  if (PAYMENT_STATUSES.includes(newStatus)) {
    this.paymentStatus = newStatus;
    return true;
  }
  return false;
};

/**
 * Instance method to check if order is paid
 * @returns {boolean} True if payment status is PAID
 */
orderSchema.methods.isPaid = function () {
  return this.paymentStatus === 'PAID';
};

/**
 * Instance method to check if order is delivered
 * @returns {boolean} True if order status is DELIVERED
 */
orderSchema.methods.isDelivered = function () {
  return this.orderStatus === 'DELIVERED';
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
