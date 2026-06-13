import { User, Cart, Address, Order, Parcel, Payment } from '../models/index.js';
import { generateTokenForUser } from '../utils/index.js';
import { logger } from '../config/index.js';
import { sendPasswordResetEmail, sendPasswordResetConfirmation, sendWelcomeEmail, sendVerificationEmail } from '../utils/email.js';

/**
 * @desc    Register a new user
 * @route   POST /auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { fullName, phone, email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Basic validation for password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create new user (password will be hashed by pre-save hook)
    const user = await User.create({
      fullName,
      phone,
      email,
      passwordHash: password, // Will be hashed by pre-save middleware
      role: 'USER' // Always register as USER, never allow ADMIN via registration
    });

    // Generate and send email verification OTP
    const otp = user.createEmailVerificationOTP();
    await user.save({ validateBeforeSave: false });

    try {
      await sendVerificationEmail(email, otp, fullName);
    } catch (emailError) {
      logger.error('Failed to send verification email', { error: emailError.message });
    }

    // Generate JWT token
    const token = generateTokenForUser(user);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    logger.error('Registration error:', { error: error.message });

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email (need to select passwordHash explicitly since it's excluded by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      logger.warn(`Failed login attempt for: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateTokenForUser(user);

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    logger.error('Login error:', { error: error.message });

    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /auth/profile
 * @access  Private (requires authentication)
 */
export const getProfile = async (req, res) => {
  try {
    // req.user is set by requireAuth middleware
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileImage: user.profileImage,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    logger.error('Get profile error:', { error: error.message });

    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /auth/profile
 * @access  Private (requires authentication)
 */
export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { fullName, phone, email } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }
      user.email = email;
    }

    // Update profile fields if provided
    if (fullName !== undefined && fullName.trim() !== '') user.fullName = fullName;
    if (phone !== undefined && phone.trim() !== '') user.phone = phone;

    // Handle profile image if file was uploaded
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (user.profileImage) {
        try {
          const cloudinary = (await import('../config/cloudinary.js')).default;
          const urlParts = user.profileImage.split('/');
          const publicIdWithExtension = urlParts.slice(-2).join('/');
          const publicId = publicIdWithExtension.split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          logger.warn('Failed to delete old profile image:', { error: error.message });
        }
      }
      user.profileImage = req.file.path;
    }

    await user.save();

    logger.info('User profile updated', { userId });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileImage: user.profileImage,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    logger.error('Update profile error:', { error: error.message });

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
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
      message: 'Failed to update profile'
    });
  }
};

/**
 * @desc    Logout user
 * @route   POST /auth/logout
 * @access  Private (requires authentication)
 */
export const logout = async (req, res) => {
  try {
    // Since JWT is stateless, logout is handled client-side by removing the token
    // This endpoint exists for:
    // 1. Logging logout events
    // 2. Future token blacklisting if needed
    // 3. Consistent API design

    const { userId } = req.user;
    const user = await User.findById(userId);

    if (user) {
      logger.info(`User logged out: ${user.email}`);
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', { error: error.message });

    res.status(500).json({
      success: false,
      message: 'Logout failed. Please try again.'
    });
  }
};

/**
 * @desc    Forgot password - send reset link
 * @route   POST /auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address'
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);

    if (!user) {
      // For security, don't reveal if email exists or not
      // Always return success message
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link shortly'
      });
    }

    // Generate OTP
    const otp = user.createPasswordResetOTP();
    await user.save({ validateBeforeSave: false });

    // Send reset OTP email
    try {
      await sendPasswordResetEmail(user.email, otp, user.fullName);

      logger.info('Password reset OTP sent', { email: user.email });

      res.status(200).json({
        success: true,
        message: 'Password reset code sent to your email'
      });
    } catch (emailError) {
      // If email fails, clear reset data
      user.resetPasswordOTP = null;
      user.resetPasswordOTPExpires = null;
      await user.save({ validateBeforeSave: false });

      logger.error('Failed to send reset email:', { error: emailError.message });

      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset code. Please try again later.'
      });
    }
  } catch (error) {
    logger.error('Forgot password error:', { error: error.message });

    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request. Please try again.'
    });
  }
};

/**
 * @desc    Verify OTP code
 * @route   POST /auth/verify-otp
 * @access  Public
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and verification code'
      });
    }

    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Verify OTP logic
    const isValid = user.verifyOTP(otp);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // OTP is valid. Now generate a secure temporary token
    // so the client can use it for the final resetPassword step.
    const resetToken = user.createPasswordResetToken();
    
    // Clear the OTP fields so it can't be reused for this step
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined; 
    
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Code verified successfully',
      data: {
        resetToken // Send this to the client; client sends it to /reset-password
      }
    });

  } catch (error) {
    logger.error('Verify OTP error:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    });
  }
};

/**
 * @desc    Reset password with verified token
 * @route   POST /auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body; // 'token' is the resetToken from verifyOTP step

    // Validate inputs
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required'
      });
    }

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new password and confirmation'
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Find user by valid reset token
    const user = await User.findByResetToken(token);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.passwordHash = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Send confirmation email
    try {
      await sendPasswordResetConfirmation(user.email, user.fullName);
    } catch (emailError) {
      logger.warn('Failed to send confirmation email:', { error: emailError.message });
      // Don't fail the request if confirmation email fails
    }

    logger.info('Password reset successful', { email: user.email });

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });
  } catch (error) {
    logger.error('Reset password error:', { error: error.message });

    res.status(500).json({
      success: false,
      message: 'Failed to reset password. Please try again.'
    });
  }
};

/**
 * @desc    Send email verification OTP
 * @route   POST /auth/send-verification
 * @access  Public
 */
export const sendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address'
      });
    }

    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a verification code will be sent'
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'Email is already verified'
      });
    }

    const otp = user.createEmailVerificationOTP();
    await user.save({ validateBeforeSave: false });

    try {
      await sendVerificationEmail(user.email, otp, user.fullName);
      logger.info('Verification email resent', { email: user.email });
    } catch (emailError) {
      user.emailVerificationOTP = null;
      user.emailVerificationOTPExpires = null;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Failed to send verification code. Please try again later.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email'
    });
  } catch (error) {
    logger.error('Send verification error:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code. Please try again.'
    });
  }
};

/**
 * @desc    Verify email with OTP
 * @route   POST /auth/verify-email
 * @access  Public
 */
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and verification code'
      });
    }

    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'Email is already verified'
      });
    }

    const isValid = user.verifyEmailOTP(otp);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    user.isVerified = true;
    user.emailVerificationOTP = null;
    user.emailVerificationOTPExpires = null;
    await user.save({ validateBeforeSave: false });

    const token = generateTokenForUser(user);

    logger.info('Email verified successfully', { email: user.email });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    logger.error('Verify email error:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Verification failed. Please try again.'
    });
  }
};

/**
 * @desc    Delete authenticated user's account and all associated data
 * @route   DELETE /auth/account
 * @access  Private
 */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;

    await Promise.all([
      Cart.deleteMany({ userId }),
      Address.deleteMany({ userId }),
      Order.deleteMany({ userId }),
      Parcel.deleteMany({ userId }),
      Payment.deleteMany({ userId }),
      User.findByIdAndDelete(userId)
    ]);

    logger.info('Account deleted', { userId });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    logger.error('Delete account error:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to delete account. Please try again.'
    });
  }
};

export default {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  forgotPassword,
  verifyOTP,
  resetPassword,
  sendVerification,
  verifyEmail,
  deleteAccount
};
