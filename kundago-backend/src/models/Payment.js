import mongoose from 'mongoose';
import { PAYMENT_METHODS } from './Order.js';

/**
 * Payment Status Enum
 */
export const PAYMENT_STATUS_VALUES = ['INITIATED', 'SUCCESS', 'FAILED'];

/**
 * Related Type Enum (Polymorphic reference)
 */
export const RELATED_TYPES = ['ORDER', 'PARCEL'];

/**
 * Payment Schema
 * Based on KundaGo specification - Phase 1
 * Supports polymorphic reference to Order or Parcel
 */
const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    referenceId: {
      type: String,
      required: [true, 'Reference ID is required'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    method: {
      type: String,
      enum: {
        values: PAYMENT_METHODS,
        message: 'Method must be STRIPE, WAVE, or COD'
      },
      required: [true, 'Payment method is required']
    },
    status: {
      type: String,
      enum: {
        values: PAYMENT_STATUS_VALUES,
        message: 'Status must be INITIATED, SUCCESS, or FAILED'
      },
      default: 'INITIATED'
    },
    relatedType: {
      type: String,
      enum: {
        values: RELATED_TYPES,
        message: 'Related type must be ORDER or PARCEL'
      },
      required: [true, 'Related type is required']
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Related ID is required'],
      refPath: 'relatedType'
    }
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false }
  }
);

// Indexes for common queries
paymentSchema.index({ userId: 1 });
paymentSchema.index({ referenceId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ relatedType: 1, relatedId: 1 });
paymentSchema.index({ createdAt: -1 });

/**
 * Static method to find payments by user
 * @param {ObjectId} userId - User's ID
 * @returns {Query} Mongoose query
 */
paymentSchema.statics.findByUserId = function (userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

/**
 * Static method to find payment by reference ID
 * @param {string} referenceId - Payment reference ID
 * @returns {Query} Mongoose query
 */
paymentSchema.statics.findByReferenceId = function (referenceId) {
  return this.findOne({ referenceId });
};

/**
 * Static method to find payments for a related entity
 * @param {string} relatedType - 'ORDER' or 'PARCEL'
 * @param {ObjectId} relatedId - Related entity ID
 * @returns {Query} Mongoose query
 */
paymentSchema.statics.findByRelated = function (relatedType, relatedId) {
  return this.find({ relatedType, relatedId }).sort({ createdAt: -1 });
};

/**
 * Instance method to mark payment as successful
 * @returns {boolean} True if status was updated
 */
paymentSchema.methods.markSuccess = function () {
  if (this.status === 'INITIATED') {
    this.status = 'SUCCESS';
    return true;
  }
  return false;
};

/**
 * Instance method to mark payment as failed
 * @returns {boolean} True if status was updated
 */
paymentSchema.methods.markFailed = function () {
  if (this.status === 'INITIATED') {
    this.status = 'FAILED';
    return true;
  }
  return false;
};

/**
 * Instance method to check if payment is successful
 * @returns {boolean} True if status is SUCCESS
 */
paymentSchema.methods.isSuccessful = function () {
  return this.status === 'SUCCESS';
};

/**
 * Virtual to get the related model name for population
 */
paymentSchema.virtual('relatedModel').get(function () {
  return this.relatedType === 'ORDER' ? 'Order' : 'Parcel';
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
