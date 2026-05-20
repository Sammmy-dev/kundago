import Joi from 'joi';

/**
 * Common validation patterns
 */
const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    'string.pattern.base': '{{#label}} must be a valid MongoDB ObjectId'
  });

const email = Joi.string().email().lowercase().trim();
const password = Joi.string().min(6).max(128);
const phone = Joi.string().pattern(/^[\d\s+\-()]+$/).allow('', null);

// ============================================
// AUTH VALIDATION SCHEMAS
// ============================================

export const authSchemas = {
  register: Joi.object({
    fullName: Joi.string().min(2).max(100).required()
      .messages({ 'any.required': 'Full name is required' }),
    phone: Joi.string().pattern(/^[\d\s+\-()]+$/).required()
      .messages({ 'any.required': 'Phone number is required' }),
    email: email.required()
      .messages({ 'any.required': 'Email is required' }),
    password: password.required()
      .messages({ 
        'any.required': 'Password is required',
        'string.min': 'Password must be at least 6 characters'
      })
  }),

  login: Joi.object({
    email: email.required()
      .messages({ 'any.required': 'Email is required' }),
    password: Joi.string().required()
      .messages({ 'any.required': 'Password is required' })
  }),

  forgotPassword: Joi.object({
    email: email.required()
      .messages({ 'any.required': 'Email is required' })
  }),

  resetPassword: Joi.object({
    token: Joi.string().required()
      .messages({ 'any.required': 'Reset token is required' }),
    newPassword: password.required()
      .messages({ 
        'any.required': 'New password is required',
        'string.min': 'Password must be at least 6 characters'
      }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
      .messages({
        'any.required': 'Please confirm your password',
        'any.only': 'Passwords do not match'
      })
  })
};

// ============================================
// PRODUCT VALIDATION SCHEMAS
// ============================================

export const productSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(200).required()
      .messages({ 'any.required': 'Product name is required' }),
    description: Joi.string().max(2000).allow(''),
    price: Joi.number().min(0).required()
      .messages({ 
        'any.required': 'Price is required',
        'number.min': 'Price cannot be negative'
      }),
    category: Joi.string().max(100).allow(''),
    images: Joi.array().items(Joi.string().uri()).default([]),
    stock: Joi.number().integer().min(0).default(0)
      .messages({ 'number.min': 'Stock cannot be negative' }),
    isActive: Joi.boolean().default(true)
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(200),
    description: Joi.string().max(2000).allow(''),
    price: Joi.number().min(0)
      .messages({ 'number.min': 'Price cannot be negative' }),
    category: Joi.string().max(100).allow(''),
    images: Joi.array().items(Joi.string().uri()),
    stock: Joi.number().integer().min(0)
      .messages({ 'number.min': 'Stock cannot be negative' }),
    isActive: Joi.boolean()
  }).min(1).messages({ 'object.min': 'At least one field is required to update' })
};

// ============================================
// CART VALIDATION SCHEMAS
// ============================================

export const cartSchemas = {
  addItem: Joi.object({
    productId: objectId.required()
      .messages({ 'any.required': 'Product ID is required' }),
    quantity: Joi.number().integer().min(1).default(1)
      .messages({ 'number.min': 'Quantity must be at least 1' })
  }),

  updateItem: Joi.object({
    productId: objectId.required()
      .messages({ 'any.required': 'Product ID is required' }),
    quantity: Joi.number().integer().min(0).required()
      .messages({ 
        'any.required': 'Quantity is required',
        'number.min': 'Quantity cannot be negative'
      })
  })
};

// ============================================
// ORDER VALIDATION SCHEMAS
// ============================================

export const orderSchemas = {
  checkout: Joi.object({
    deliveryAddress: Joi.string().min(10).max(500).required()
      .messages({ 
        'any.required': 'Delivery address is required',
        'string.min': 'Delivery address must be at least 10 characters'
      }),
    paymentMethod: Joi.string().valid('STRIPE', 'WAVE', 'COD').required()
      .messages({ 
        'any.required': 'Payment method is required',
        'any.only': 'Payment method must be STRIPE, WAVE, or COD'
      })
  }),

  updateStatus: Joi.object({
    orderStatus: Joi.string().valid('PENDING', 'CONFIRMED', 'DELIVERED').required()
      .messages({ 
        'any.required': 'Order status is required',
        'any.only': 'Order status must be PENDING, CONFIRMED, or DELIVERED'
      })
  })
};

// ============================================
// PARCEL VALIDATION SCHEMAS
// ============================================

export const parcelSchemas = {
  create: Joi.object({
    pickupName: Joi.string().min(2).max(100).required()
      .messages({ 'any.required': 'Pickup name is required' }),
    pickupAddress: Joi.string().min(10).max(500).required()
      .messages({ 'any.required': 'Pickup address is required' }),
    pickupPhone: Joi.string().pattern(/^[\d\s+\-()]+$/).required()
      .messages({ 'any.required': 'Pickup phone is required' }),
    dropoffName: Joi.string().min(2).max(100).required()
      .messages({ 'any.required': 'Dropoff name is required' }),
    dropoffAddress: Joi.string().min(10).max(500).required()
      .messages({ 'any.required': 'Dropoff address is required' }),
    dropoffPhone: Joi.string().pattern(/^[\d\s+\-()]+$/).required()
      .messages({ 'any.required': 'Dropoff phone is required' }),
    packageSize: Joi.string().valid('SMALL', 'MEDIUM', 'LARGE').required()
      .messages({ 
        'any.required': 'Package size is required',
        'any.only': 'Package size must be SMALL, MEDIUM, or LARGE'
      }),
    notes: Joi.string().max(500).allow(''),
    paymentMethod: Joi.string().valid('STRIPE', 'WAVE', 'COD').required()
      .messages({ 
        'any.required': 'Payment method is required',
        'any.only': 'Payment method must be STRIPE, WAVE, or COD'
      })
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('PENDING', 'PICKED', 'DELIVERED').required()
      .messages({ 
        'any.required': 'Status is required',
        'any.only': 'Status must be PENDING, PICKED, or DELIVERED'
      })
  })
};

// ============================================
// ADDRESS VALIDATION SCHEMAS
// ============================================

export const addressSchemas = {
  create: Joi.object({
    fullName: Joi.string().min(2).max(100).required()
      .messages({ 'any.required': 'Full name is required' }),
    phone: Joi.string().pattern(/^[\d\s+\-()]+$/).required()
      .messages({ 'any.required': 'Phone number is required' }),
    addressLine1: Joi.string().min(5).max(200).required()
      .messages({ 'any.required': 'Address line 1 is required' }),
    addressLine2: Joi.string().max(200).allow(''),
    city: Joi.string().min(2).max(100).required()
      .messages({ 'any.required': 'City is required' }),
    state: Joi.string().max(100).allow(''),
    postalCode: Joi.string().max(20).allow(''),
    country: Joi.string().min(2).max(100).required()
      .messages({ 'any.required': 'Country is required' }),
    isDefault: Joi.boolean().default(false)
  }),

  update: Joi.object({
    fullName: Joi.string().min(2).max(100),
    phone: Joi.string().pattern(/^[\d\s+\-()]+$/),
    addressLine1: Joi.string().min(5).max(200),
    addressLine2: Joi.string().max(200).allow(''),
    city: Joi.string().min(2).max(100),
    state: Joi.string().max(100).allow(''),
    postalCode: Joi.string().max(20).allow(''),
    country: Joi.string().min(2).max(100),
    isDefault: Joi.boolean()
  }).min(1).messages({ 'object.min': 'At least one field is required to update' })
};

// ============================================
// PAYMENT VALIDATION SCHEMAS
// ============================================

export const paymentSchemas = {
  initiateStripe: Joi.object({
    relatedType: Joi.string().valid('ORDER', 'PARCEL').required()
      .messages({ 
        'any.required': 'Related type is required',
        'any.only': 'Related type must be ORDER or PARCEL'
      }),
    relatedId: objectId.required()
      .messages({ 'any.required': 'Related ID is required' })
  })
};

// ============================================
// COMMON PARAM SCHEMAS
// ============================================

export const paramSchemas = {
  id: Joi.object({
    id: objectId.required()
      .messages({ 'any.required': 'ID is required' })
  }),

  productId: Joi.object({
    productId: objectId.required()
      .messages({ 'any.required': 'Product ID is required' })
  })
};

export default {
  auth: authSchemas,
  product: productSchemas,
  cart: cartSchemas,
  order: orderSchemas,
  parcel: parcelSchemas,
  address: addressSchemas,
  payment: paymentSchemas,
  params: paramSchemas
};
