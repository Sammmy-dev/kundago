import { User } from '../models/index.js';
import { logger } from '../config/index.js';

export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-passwordHash -resetPasswordToken -resetPasswordExpires -resetPasswordOTP -resetPasswordOTPExpires -emailVerificationOTP -emailVerificationOTPExpires -__v')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    logger.error('Get admin users error:', { error: error.message });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    logger.info('User status toggled', {
      userId: user._id,
      isActive: user.isActive
    });

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    logger.error('Toggle user status error:', { error: error.message });

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status'
    });
  }
};

export default {
  getAdminUsers,
  toggleUserStatus
};
