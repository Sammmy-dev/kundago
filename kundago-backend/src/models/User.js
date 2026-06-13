import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SALT_ROUNDS = 10;

/**
 * User Schema
 * Based on KundaGo specification
 */
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
      default: null
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    phone: {
      type: String,
      trim: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
      type: String,
      enum: {
        values: ['USER', 'ADMIN'],
        message: 'Role must be either USER or ADMIN'
      },
      default: 'USER'
    },
    profileImage: {
      type: String,
      default: null
    },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    },
    resetPasswordOTP: {
      type: String,
      default: null
    },
    resetPasswordOTPExpires: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationOTP: {
      type: String,
      default: null
    },
    emailVerificationOTPExpires: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    toJSON: {
      transform: (doc, ret) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      }
    }
  }
);

/**
 * Pre-save middleware to hash password
 * Only hashes if password is new or modified
 */
userSchema.pre('save', async function (next) {
  // Only hash if passwordHash is modified (or new)
  if (!this.isModified('passwordHash')) {
    return next();
  }

  try {
    this.passwordHash = await bcrypt.hash(this.passwordHash, SALT_ROUNDS);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method to compare password
 * @param {string} candidatePassword - Plain text password to compare
 * @returns {Promise<boolean>} True if password matches
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * Static method to find user by email
 * @param {string} email - User email
 * @returns {Promise<User|null>} User document or null
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Virtual for checking if user is admin
 */
userSchema.virtual('isAdmin').get(function () {
  return this.role === 'ADMIN';
});

/**
 * Instance method to generate password reset OTP
 * @returns {string} OTP code
 */
userSchema.methods.createPasswordResetOTP = function () {
  // Generate 6 digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP and save to database
  this.resetPasswordOTP = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  // Set expiry (10 minutes)
  this.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;

  return otp;
};

/**
 * Instance method to verify OTP
 * @param {string} candidateOTP - OTP to verify
 * @returns {boolean} True if valid
 */
userSchema.methods.verifyOTP = function (candidateOTP) {
  const hashedOTP = crypto
    .createHash('sha256')
    .update(candidateOTP)
    .digest('hex');
    
  return (
    this.resetPasswordOTP === hashedOTP &&
    this.resetPasswordOTPExpires > Date.now()
  );
};

/**
 * Instance method to generate password reset token
 * @returns {string} Reset token
 */
userSchema.methods.createPasswordResetToken = function () {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set token expiry (1 hour from now)
  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

  return resetToken;
};

/**
 * Instance method to generate email verification OTP
 * @returns {string} OTP code
 */
userSchema.methods.createEmailVerificationOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  this.emailVerificationOTP = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  this.emailVerificationOTPExpires = Date.now() + 10 * 60 * 1000;

  return otp;
};

/**
 * Instance method to verify email OTP
 * @param {string} candidateOTP - OTP to verify
 * @returns {boolean} True if valid
 */
userSchema.methods.verifyEmailOTP = function (candidateOTP) {
  const hashedOTP = crypto
    .createHash('sha256')
    .update(candidateOTP)
    .digest('hex');

  return (
    this.emailVerificationOTP === hashedOTP &&
    this.emailVerificationOTPExpires > Date.now()
  );
};

/**
 * Static method to find user by valid reset token
 * @param {string} token - Reset token
 * @returns {Promise<User|null>} User document or null
 */
userSchema.statics.findByResetToken = function (token) {
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  return this.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });
};


const User = mongoose.model('User', userSchema);

export default User;
