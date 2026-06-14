import { Order, Cart, Product, User } from '../models/index.js';
import { PAYMENT_METHODS } from '../models/Order.js';
import { logger } from '../config/index.js';
import { sendOrderPlaced, sendOrderConfirmation } from '../utils/email.js';
import { calculateDeliveryFee } from '../utils/delivery.js';

/**
 * @desc    Checkout - Create order from cart
 * @route   POST /orders/checkout
 * @access  Private
 */
export const checkout = async (req, res) => {
  try {
    const { userId } = req.user;
    const { paymentMethod, deliveryAddress } = req.body;

    // Validate required fields
    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Must be one of: ${PAYMENT_METHODS.join(', ')}`
      });
    }

    if (!deliveryAddress || deliveryAddress.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required'
      });
    }

    // Require email verification before placing order
    const user = await User.findById(userId).select('isVerified');
    if (!user || !user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before placing an order.',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Step 1: Validate cart exists and has items
    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Add items before checkout.'
      });
    }

    // Step 2: Validate all products are available and in stock
    const productIds = cart.items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    const productMap = new Map();
    products.forEach((p) => productMap.set(p._id.toString(), p));

    const unavailableItems = [];
    const insufficientStock = [];

    for (const cartItem of cart.items) {
      const product = productMap.get(cartItem.productId.toString());

      if (!product || !product.isActive) {
        unavailableItems.push(cartItem.productId);
        continue;
      }

      if (product.stock < cartItem.quantity) {
        insufficientStock.push({
          productId: cartItem.productId,
          name: product.name,
          requested: cartItem.quantity,
          available: product.stock
        });
      }
    }

    if (unavailableItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some products are no longer available',
        data: { unavailableItems }
      });
    }

    if (insufficientStock.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock for some items',
        data: { insufficientStock }
      });
    }

    // Step 3: Prepare order items with current prices
    const orderItems = cart.items.map((cartItem) => {
      const product = productMap.get(cartItem.productId.toString());
      return {
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        priceAtTime: product.price
      };
    });

    // Calculate subtotal from items
    const subtotal = orderItems.reduce((sum, item) => {
      return sum + item.priceAtTime * item.quantity;
    }, 0);

    // Calculate delivery fee based on heaviest product
    const productWeights = cart.items.map((cartItem) => {
      const product = productMap.get(cartItem.productId.toString());
      return product?.weight || 0;
    });
    const { fee: deliveryFee } = calculateDeliveryFee(productWeights);

    const totalAmount = subtotal + deliveryFee;

    // Step 4: Create order with initial statuses
    const order = await Order.create({
      userId,
      items: orderItems,
      totalAmount,
      deliveryFee,
      paymentMethod,
      paymentStatus: 'PENDING',
      orderStatus: 'PENDING',
      deliveryAddress: deliveryAddress.trim()
    });

    // Step 5: Decrease stock for each product
    for (const cartItem of cart.items) {
      await Product.findByIdAndUpdate(cartItem.productId, {
        $inc: { stock: -cartItem.quantity }
      });
    }

    // Step 6: Clear cart (only for non-Stripe payments; Stripe cart is cleared on successful payment)
    if (paymentMethod !== 'STRIPE') {
      cart.clearCart();
      await cart.save();
    }

    logger.info('Order created', {
      orderId: order._id,
      userId,
      totalAmount,
      paymentMethod
    });

    // Populate product details for response
    await order.populate('items.productId', 'name images');

    // Send Order Placed Email (fire-and-forget, non-blocking)
    // Skip for Stripe - order confirmed email will be sent via webhook on successful payment
    if (paymentMethod !== 'STRIPE') {
      User.findById(userId)
        .then((user) => {
          if (user && user.email) {
            return sendOrderPlaced(user.email, user.fullName, order._id, totalAmount, paymentMethod);
          }
        })
        .catch((e) => logger.error('Failed to send order placed email', { error: e.message }));
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order: {
          _id: order._id,
          items: order.items,
          totalAmount: order.totalAmount,
          deliveryFee: order.deliveryFee,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          deliveryAddress: order.deliveryAddress,
          createdAt: order.createdAt
        }
      }
    });
  } catch (error) {
    logger.error('Checkout error:', { error: error.message, stack: error.stack });

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to process checkout'
    });
  }
};

/**
 * @desc    Get user's orders
 * @route   GET /orders
 * @access  Private
 */
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.user;

    const orders = await Order.findByUserId(userId).populate(
      'items.productId',
      'name images'
    );

    res.status(200).json({
      success: true,
      count: orders.length,
      data: {
        orders
      }
    });
  } catch (error) {
    logger.error('Get user orders error:', { error: error.message });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /orders/:id
 * @access  Private
 */
export const getOrderById = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, userId }).populate(
      'items.productId',
      'name images price'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        order
      }
    });
  } catch (error) {
    logger.error('Get order by ID error:', { error: error.message });

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
};

/**
 * @desc    Get dashboard metrics (Admin)
 * @route   GET /admin/orders/metrics/dashboard
 * @access  Private (Admin only)
 */
export const getDashboardMetrics = async (req, res) => {
  try {
    // Get current date range for month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get today's date range
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Calculate monthly revenue
    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
          paymentStatus: 'PAID' // Only count paid orders
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const monthlyRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Count daily orders (today)
    const dailyOrders = await Order.countDocuments({
      createdAt: { $gte: todayStart, $lt: todayEnd }
    });

    // Count pending orders
    const pendingOrders = await Order.countDocuments({
      orderStatus: 'PENDING'
    });

    // Count completed/delivered orders
    const completedOrders = await Order.countDocuments({
      orderStatus: 'DELIVERED'
    });

    // Count total users
    const totalUsers = await User.countDocuments();

    logger.info('Dashboard metrics fetched', {
      monthlyRevenue,
      dailyOrders,
      pendingOrders,
      completedOrders,
      totalUsers
    });

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          monthlyRevenue,
          dailyOrders,
          pendingOrders,
          completedOrders,
          totalUsers
        }
      }
    });
  } catch (error) {
    logger.error('Get dashboard metrics error:', { error: error.message });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard metrics'
    });
  }
};

/**
 * @desc    Get 5 latest orders (Admin)
 * @route   GET /admin/orders/latest
 * @access  Private (Admin only)
 */
export const getLatestAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate([
        { path: 'userId', select: 'fullName email phone' },
        { path: 'items.productId', select: 'name images' }
      ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: {
        orders
      }
    });
  } catch (error) {
    logger.error('Get latest admin orders error:', { error: error.message });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest orders'
    });
  }
};

/**
 * @desc    Get all orders (Admin)
 * @route   GET /admin/orders
 * @access  Private (Admin only)
 */
export const getAdminOrders = async (req, res) => {
  try {
    const { status } = req.query;

    let orders;
    if (status) {
      orders = await Order.findByStatus(status).populate([
        { path: 'userId', select: 'fullName email phone' },
        { path: 'items.productId', select: 'name images' }
      ]);
    } else {
      orders = await Order.find()
        .sort({ createdAt: -1 })
        .populate([
          { path: 'userId', select: 'fullName email phone' },
          { path: 'items.productId', select: 'name images' }
        ]);
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      data: {
        orders
      }
    });
  } catch (error) {
    logger.error('Get admin orders error:', { error: error.message });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

/**
 * @desc    Update order status (Admin)
 * @route   PUT /admin/orders/:id/status
 * @access  Private (Admin only)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    if (!orderStatus) {
      return res.status(400).json({
        success: false,
        message: 'Order status is required'
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Use model method to enforce status flow
    const updated = order.updateOrderStatus(orderStatus);

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: `Cannot update status from ${order.orderStatus} to ${orderStatus}. Status must follow: PENDING → CONFIRMED → DELIVERED`
      });
    }

    await order.save();

    logger.info('Order status updated', {
      orderId: order._id,
      newStatus: orderStatus
    });

    // Send confirmation email when status changes to CONFIRMED
    if (orderStatus === 'CONFIRMED') {
      User.findById(order.userId)
        .then((user) => {
          if (user && user.email) {
            return sendOrderConfirmation(user.email, user.fullName, order._id, order.totalAmount, order.paymentMethod);
          }
        })
        .catch((e) => logger.error('Failed to send order confirmation email', { error: e.message }));
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: {
        order: {
          _id: order._id,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus
        }
      }
    });
  } catch (error) {
    logger.error('Update order status error:', { error: error.message });

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};

export default {
  checkout,
  getUserOrders,
  getOrderById,
  getDashboardMetrics,
  getLatestAdminOrders,
  getAdminOrders,
  updateOrderStatus
};
