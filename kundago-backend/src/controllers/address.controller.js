import { Address } from '../models/index.js';
import { logger } from '../config/index.js';

/**
 * @desc    Get user's addresses
 * @route   GET /addresses
 * @access  Private
 */
export const getUserAddresses = async (req, res) => {
  try {
    const { userId } = req.user;

    const addresses = await Address.findByUserId(userId);

    res.status(200).json({
      success: true,
      count: addresses.length,
      data: {
        addresses
      }
    });
  } catch (error) {
    logger.error('Get user addresses error:', { error: error.message });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch addresses'
    });
  }
};

/**
 * @desc    Get single address by ID
 * @route   GET /addresses/:id
 * @access  Private
 */
export const getAddressById = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const address = await Address.findOne({ _id: id, userId });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        address
      }
    });
  } catch (error) {
    logger.error('Get address by ID error:', { error: error.message });

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid address ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch address'
    });
  }
};

/**
 * @desc    Create a new address
 * @route   POST /addresses
 * @access  Private
 */
export const createAddress = async (req, res) => {
  try {
    const { userId } = req.user;
    const { fullName, phone, address, landmark } = req.body;

    // Validate required fields
    if (!fullName || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide fullName, phone, and address'
      });
    }

    const newAddress = await Address.create({
      userId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      landmark: landmark?.trim() || ''
    });

    logger.info('Address created', { addressId: newAddress._id, userId });

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      data: {
        address: newAddress
      }
    });
  } catch (error) {
    logger.error('Create address error:', { error: error.message });

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create address'
    });
  }
};

/**
 * @desc    Update an address
 * @route   PUT /addresses/:id
 * @access  Private
 */
export const updateAddress = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const { fullName, phone, address, landmark } = req.body;

    const existingAddress = await Address.findOne({ _id: id, userId });

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Update only provided fields
    if (fullName !== undefined) existingAddress.fullName = fullName.trim();
    if (phone !== undefined) existingAddress.phone = phone.trim();
    if (address !== undefined) existingAddress.address = address.trim();
    if (landmark !== undefined) existingAddress.landmark = landmark.trim();

    await existingAddress.save();

    logger.info('Address updated', { addressId: id, userId });

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: {
        address: existingAddress
      }
    });
  } catch (error) {
    logger.error('Update address error:', { error: error.message });

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid address ID'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update address'
    });
  }
};

/**
 * @desc    Delete an address
 * @route   DELETE /addresses/:id
 * @access  Private
 */
export const deleteAddress = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const address = await Address.findOne({ _id: id, userId });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await Address.deleteOne({ _id: id });

    logger.info('Address deleted', { addressId: id, userId });

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    logger.error('Delete address error:', { error: error.message });

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid address ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete address'
    });
  }
};

export default {
  getUserAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress
};
