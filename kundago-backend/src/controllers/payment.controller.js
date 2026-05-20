import { getStripe, isStripeConfigured } from '../config/stripe.js';
import { logger } from '../config/index.js';
import { Payment, Order, Parcel } from '../models/index.js';

/**
 * Initiate Stripe payment for an Order
 * Creates payment intent and stores payment record
 * 
 * @route POST /payments/stripe/initiate
 * @access Private (Authenticated users)
 */
export const initiateStripePayment = async (req, res) => {
  try {
    const { relatedType, relatedId } = req.body;
    const userId = req.user.userId;

    // Validate Stripe configuration
    if (!isStripeConfigured()) {
      logger.error('Stripe payment attempted but Stripe is not configured');
      return res.status(503).json({
        success: false,
        message: 'Payment service is not configured'
      });
    }

    // Validate input
    if (!relatedType || !relatedId) {
      return res.status(400).json({
        success: false,
        message: 'relatedType and relatedId are required'
      });
    }

    if (!['ORDER', 'PARCEL'].includes(relatedType)) {
      return res.status(400).json({
        success: false,
        message: 'relatedType must be ORDER or PARCEL'
      });
    }

    // Find the related entity and validate ownership
    let relatedEntity;
    let amount;
    let description;

    if (relatedType === 'ORDER') {
      relatedEntity = await Order.findById(relatedId);
      if (!relatedEntity) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Verify user owns this order
      if (relatedEntity.userId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to pay for this order'
        });
      }

      // Check if order is already paid
      if (relatedEntity.paymentStatus === 'PAID') {
        return res.status(400).json({
          success: false,
          message: 'Order is already paid'
        });
      }

      // Check payment method matches
      if (relatedEntity.paymentMethod !== 'STRIPE') {
        return res.status(400).json({
          success: false,
          message: 'Order payment method is not Stripe'
        });
      }

      amount = relatedEntity.totalAmount;
      description = `KundaGo Order #${relatedId}`;

    } else if (relatedType === 'PARCEL') {
      relatedEntity = await Parcel.findById(relatedId);
      if (!relatedEntity) {
        return res.status(404).json({
          success: false,
          message: 'Parcel not found'
        });
      }

      // Verify user owns this parcel
      if (relatedEntity.userId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to pay for this parcel'
        });
      }

      // Check payment method matches
      if (relatedEntity.paymentMethod !== 'STRIPE') {
        return res.status(400).json({
          success: false,
          message: 'Parcel payment method is not Stripe'
        });
      }

      // Calculate parcel delivery fee based on package size
      const parcelFees = {
        SMALL: 500,   // 5.00 in minor units
        MEDIUM: 1000, // 10.00 in minor units
        LARGE: 1500   // 15.00 in minor units
      };
      amount = parcelFees[relatedEntity.packageSize] / 100; // Convert back to major units (Dalasi)
      description = `KundaGo Parcel Delivery #${relatedId}`;
    }

    // Check for existing pending payment
    const existingPayment = await Payment.findOne({
      relatedType,
      relatedId,
      status: 'INITIATED'
    });

    if (existingPayment) {
      // Return existing payment intent if still valid
      logger.info(`Returning existing payment intent for ${relatedType} ${relatedId}`);
      return res.status(200).json({
        success: true,
        message: 'Existing payment intent found',
        data: {
          payment: {
            _id: existingPayment._id,
            referenceId: existingPayment.referenceId,
            amount: existingPayment.amount,
            status: existingPayment.status,
            relatedType: existingPayment.relatedType,
            relatedId: existingPayment.relatedId
          },
          clientSecret: existingPayment.referenceId.startsWith('pi_') 
            ? `${existingPayment.referenceId}_secret_placeholder` 
            : null
        }
      });
    }

    // Get Stripe instance
    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Stripe service unavailable'
      });
    }

    // Create Stripe Payment Intent
    // Amount must be in cents for Stripe
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'gmd',
      description,
      metadata: {
        relatedType,
        relatedId: relatedId.toString(),
        userId: userId.toString()
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    logger.info(`Stripe payment intent created: ${paymentIntent.id} for ${relatedType} ${relatedId}`);

    // Create payment record in database
    const payment = await Payment.create({
      userId,
      referenceId: paymentIntent.id,
      amount,
      method: 'STRIPE',
      status: 'INITIATED',
      relatedType,
      relatedId
    });

    logger.info(`Payment record created: ${payment._id}`);

    res.status(201).json({
      success: true,
      message: 'Payment initiated successfully',
      data: {
        payment: {
          _id: payment._id,
          referenceId: payment.referenceId,
          amount: payment.amount,
          status: payment.status,
          relatedType: payment.relatedType,
          relatedId: payment.relatedId,
          createdAt: payment.createdAt
        },
        clientSecret: paymentIntent.client_secret
      }
    });

  } catch (error) {
    logger.error('Error initiating Stripe payment:', error);

    // Handle Stripe-specific errors
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment request'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment'
    });
  }
};

/**
 * Handle Stripe webhook events
 * Updates payment and order/parcel status based on webhook events
 * 
 * @route POST /payments/webhook
 * @access Public (verified by Stripe signature)
 */
export const handleStripeWebhook = async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Stripe service unavailable'
      });
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    // Verify webhook signature if secret is configured
    if (webhookSecret && sig) {
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err) {
        logger.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({
          success: false,
          message: 'Webhook signature verification failed'
        });
      }
    } else {
      // In development without webhook secret, parse body directly
      event = req.body;
      logger.warn('Processing webhook without signature verification (development mode)');
    }

    logger.info(`Stripe webhook received: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        await handlePaymentFailure(paymentIntent);
        break;
      }

      default:
        logger.info(`Unhandled webhook event type: ${event.type}`);
    }

    res.status(200).json({ received: true });

  } catch (error) {
    logger.error('Error handling Stripe webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

/**
 * Handle successful payment
 * @param {Object} paymentIntent - Stripe payment intent object
 */
const handlePaymentSuccess = async (paymentIntent) => {
  try {
    const { id: referenceId, metadata } = paymentIntent;

    // Find payment record
    const payment = await Payment.findByReferenceId(referenceId);
    if (!payment) {
      logger.error(`Payment record not found for reference: ${referenceId}`);
      return;
    }

    // Update payment status
    payment.markSuccess();
    await payment.save();

    logger.info(`Payment ${payment._id} marked as SUCCESS`);

    // Update related entity
    const { relatedType, relatedId } = metadata;

    if (relatedType === 'ORDER') {
      const order = await Order.findById(relatedId);
      if (order) {
        order.updatePaymentStatus('PAID');
        order.updateOrderStatus('CONFIRMED');
        await order.save();
        logger.info(`Order ${relatedId} payment status updated to PAID and order status to CONFIRMED`);
      }
    }
    // Note: Parcel doesn't have paymentStatus field in the schema,
    // but payment record tracks the payment status

  } catch (error) {
    logger.error('Error handling payment success:', error);
  }
};

/**
 * Handle failed payment
 * @param {Object} paymentIntent - Stripe payment intent object
 */
const handlePaymentFailure = async (paymentIntent) => {
  try {
    const { id: referenceId, metadata } = paymentIntent;

    // Find payment record
    const payment = await Payment.findByReferenceId(referenceId);
    if (!payment) {
      logger.error(`Payment record not found for reference: ${referenceId}`);
      return;
    }

    // Update payment status
    payment.markFailed();
    await payment.save();

    logger.info(`Payment ${payment._id} marked as FAILED`);

    // Update related entity if it's an order
    const { relatedType, relatedId } = metadata;

    if (relatedType === 'ORDER') {
      const order = await Order.findById(relatedId);
      if (order) {
        order.updatePaymentStatus('FAILED');
        await order.save();
        logger.info(`Order ${relatedId} payment status updated to FAILED`);
      }
    }

  } catch (error) {
    logger.error('Error handling payment failure:', error);
  }
};

/**
 * Get payment by ID
 * 
 * @route GET /payments/:id
 * @access Private (Owner only)
 */
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Verify user owns this payment
    if (payment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        payment
      }
    });

  } catch (error) {
    logger.error('Error getting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment'
    });
  }
};

/**
 * Get user's payment history
 * 
 * @route GET /payments
 * @access Private
 */
export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user._id;

    const payments = await Payment.findByUserId(userId);

    res.status(200).json({
      success: true,
      count: payments.length,
      data: {
        payments
      }
    });

  } catch (error) {
    logger.error('Error getting user payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payments'
    });
  }
};
