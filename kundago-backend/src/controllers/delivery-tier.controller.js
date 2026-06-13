import { DeliveryTier } from '../models/index.js';
import { logger } from '../config/index.js';
import { refreshTiersCache } from '../utils/delivery.js';

export const getDeliveryTiers = async (req, res) => {
  try {
    const tiers = await DeliveryTier.find().sort({ max: 1 }).lean();

    res.status(200).json({
      success: true,
      data: { tiers },
    });
  } catch (error) {
    logger.error('Get delivery tiers error:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery tiers',
    });
  }
};

export const updateDeliveryTier = async (req, res) => {
  try {
    const { id } = req.params;
    const { fee } = req.body;

    if (fee === undefined || fee === null) {
      return res.status(400).json({
        success: false,
        message: 'Fee is required',
      });
    }

    if (typeof fee !== 'number' || fee < 0) {
      return res.status(400).json({
        success: false,
        message: 'Fee must be a non-negative number',
      });
    }

    const tier = await DeliveryTier.findByIdAndUpdate(
      id,
      { fee },
      { new: true, runValidators: true }
    );

    if (!tier) {
      return res.status(404).json({
        success: false,
        message: 'Delivery tier not found',
      });
    }

    await refreshTiersCache();

    res.status(200).json({
      success: true,
      message: 'Delivery tier updated successfully',
      data: { tier },
    });
  } catch (error) {
    logger.error('Update delivery tier error:', { error: error.message });

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid tier ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update delivery tier',
    });
  }
};

export default {
  getDeliveryTiers,
  updateDeliveryTier,
};
