import { Parcel } from '../models/index.js';
import { PAYMENT_METHODS } from '../models/Order.js';
import { PACKAGE_SIZES } from '../models/Parcel.js';
import { logger } from '../config/index.js';

/**
 * @desc    Create a parcel delivery request
 * @route   POST /parcels
 * @access  Private
 */
export const createParcel = async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      pickupName,
      pickupAddress,
      pickupPhone,
      dropoffName,
      dropoffAddress,
      dropoffPhone,
      packageSize,
      notes,
      paymentMethod
    } = req.body;

    // Validate required fields
    const requiredFields = {
      pickupName,
      pickupAddress,
      pickupPhone,
      dropoffName,
      dropoffAddress,
      dropoffPhone,
      packageSize,
      paymentMethod
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => !value || (typeof value === 'string' && value.trim() === ''))
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate package size
    if (!PACKAGE_SIZES.includes(packageSize)) {
      return res.status(400).json({
        success: false,
        message: `Invalid package size. Must be one of: ${PACKAGE_SIZES.join(', ')}`
      });
    }

    // Validate payment method
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Must be one of: ${PAYMENT_METHODS.join(', ')}`
      });
    }

    // Create parcel with default status PENDING
    const parcel = await Parcel.create({
      userId,
      pickupName: pickupName.trim(),
      pickupAddress: pickupAddress.trim(),
      pickupPhone: pickupPhone.trim(),
      dropoffName: dropoffName.trim(),
      dropoffAddress: dropoffAddress.trim(),
      dropoffPhone: dropoffPhone.trim(),
      packageSize,
      notes: notes?.trim() || '',
      paymentMethod,
      status: 'PENDING' // Default status per rules
    });

    logger.info('Parcel created', {
      parcelId: parcel._id,
      userId,
      packageSize,
      paymentMethod
    });

    res.status(201).json({
      success: true,
      message: 'Parcel delivery request created successfully',
      data: {
        parcel
      }
    });
  } catch (error) {
    logger.error('Create parcel error:', { error: error.message });

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create parcel request'
    });
  }
};

/**
 * @desc    Get user's parcels
 * @route   GET /parcels
 * @access  Private
 */
export const getUserParcels = async (req, res) => {
  try {
    const { userId } = req.user;

    const parcels = await Parcel.findByUserId(userId);

    res.status(200).json({
      success: true,
      count: parcels.length,
      data: {
        parcels
      }
    });
  } catch (error) {
    logger.error('Get user parcels error:', { error: error.message });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch parcels'
    });
  }
};

/**
 * @desc    Get single parcel by ID
 * @route   GET /parcels/:id
 * @access  Private
 */
export const getParcelById = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const parcel = await Parcel.findOne({ _id: id, userId });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        parcel
      }
    });
  } catch (error) {
    logger.error('Get parcel by ID error:', { error: error.message });

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid parcel ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch parcel'
    });
  }
};

/**
 * @desc    Get all parcels (Admin)
 * @route   GET /admin/parcels
 * @access  Private (Admin only)
 */
export const getAdminParcels = async (req, res) => {
  try {
    const { status } = req.query;

    let parcels;
    if (status) {
      parcels = await Parcel.findByStatus(status).populate(
        'userId',
        'fullName email phone'
      );
    } else {
      parcels = await Parcel.find()
        .sort({ createdAt: -1 })
        .populate('userId', 'fullName email phone');
    }

    res.status(200).json({
      success: true,
      count: parcels.length,
      data: {
        parcels
      }
    });
  } catch (error) {
    logger.error('Get admin parcels error:', { error: error.message });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch parcels'
    });
  }
};

/**
 * @desc    Update parcel status (Admin)
 * @route   PUT /admin/parcels/:id/status
 * @access  Private (Admin only)
 */
export const updateParcelStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const parcel = await Parcel.findById(id);

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    // Use model method to enforce status flow
    const updated = parcel.updateStatus(status);

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: `Cannot update status from ${parcel.status} to ${status}. Status must follow: PENDING → PICKED → DELIVERED`
      });
    }

    await parcel.save();

    logger.info('Parcel status updated', {
      parcelId: parcel._id,
      newStatus: status
    });

    res.status(200).json({
      success: true,
      message: 'Parcel status updated',
      data: {
        parcel: {
          _id: parcel._id,
          status: parcel.status
        }
      }
    });
  } catch (error) {
    logger.error('Update parcel status error:', { error: error.message });

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid parcel ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update parcel status'
    });
  }
};

export default {
  createParcel,
  getUserParcels,
  getParcelById,
  getAdminParcels,
  updateParcelStatus
};
