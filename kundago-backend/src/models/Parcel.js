import mongoose from 'mongoose';
import { PAYMENT_METHODS } from './Order.js';

/**
 * Parcel Status Enum
 */
export const PARCEL_STATUSES = ['PENDING', 'PICKED', 'DELIVERED'];

/**
 * Package Size Enum
 */
export const PACKAGE_SIZES = ['SMALL', 'MEDIUM', 'LARGE'];

/**
 * Parcel Schema
 * Based on KundaGo specification - Phase 1
 */
const parcelSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    pickupName: {
      type: String,
      required: [true, 'Pickup name is required'],
      trim: true
    },
    pickupAddress: {
      type: String,
      required: [true, 'Pickup address is required'],
      trim: true
    },
    pickupPhone: {
      type: String,
      required: [true, 'Pickup phone is required'],
      trim: true
    },
    dropoffName: {
      type: String,
      required: [true, 'Dropoff name is required'],
      trim: true
    },
    dropoffAddress: {
      type: String,
      required: [true, 'Dropoff address is required'],
      trim: true
    },
    dropoffPhone: {
      type: String,
      required: [true, 'Dropoff phone is required'],
      trim: true
    },
    packageSize: {
      type: String,
      enum: {
        values: PACKAGE_SIZES,
        message: 'Package size must be SMALL, MEDIUM, or LARGE'
      },
      required: [true, 'Package size is required']
    },
    notes: {
      type: String,
      trim: true
    },
    paymentMethod: {
      type: String,
      enum: {
        values: PAYMENT_METHODS,
        message: 'Payment method must be STRIPE, WAVE, or COD'
      },
      required: [true, 'Payment method is required']
    },
    status: {
      type: String,
      enum: {
        values: PARCEL_STATUSES,
        message: 'Status must be PENDING, PICKED, or DELIVERED'
      },
      default: 'PENDING'
    }
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false }
  }
);

// Indexes for common queries
parcelSchema.index({ userId: 1 });
parcelSchema.index({ status: 1 });
parcelSchema.index({ createdAt: -1 });

/**
 * Static method to find parcels by user
 * @param {ObjectId} userId - User's ID
 * @returns {Query} Mongoose query
 */
parcelSchema.statics.findByUserId = function (userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

/**
 * Static method to find parcels by status
 * @param {string} status - Parcel status
 * @returns {Query} Mongoose query
 */
parcelSchema.statics.findByStatus = function (status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

/**
 * Instance method to update parcel status
 * Enforces status flow: PENDING → PICKED → DELIVERED (no skipping)
 * @param {string} newStatus - New parcel status
 * @returns {boolean} True if status was updated
 */
parcelSchema.methods.updateStatus = function (newStatus) {
  const statusOrder = { PENDING: 0, PICKED: 1, DELIVERED: 2 };
  const currentIndex = statusOrder[this.status];
  const newIndex = statusOrder[newStatus];

  // Can only move forward in status, not backward
  if (newIndex <= currentIndex) {
    return false;
  }

  // Cannot skip statuses (e.g., PENDING -> DELIVERED)
  if (newIndex - currentIndex > 1) {
    return false;
  }

  this.status = newStatus;
  return true;
};

/**
 * Instance method to check if parcel is delivered
 * @returns {boolean} True if status is DELIVERED
 */
parcelSchema.methods.isDelivered = function () {
  return this.status === 'DELIVERED';
};

const Parcel = mongoose.model('Parcel', parcelSchema);

export default Parcel;
