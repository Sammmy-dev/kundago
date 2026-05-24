import { Resend } from 'resend';
import env from '../config/env.js';
import { logger } from '../config/index.js';

const resend = new Resend(env.resendApiKey);

const STYLES = `
  body {
    font-family: 'Inter', Arial, sans-serif;
    line-height: 1.6;
    color: #191c1e;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f7f9fb;
  }
  .container {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 32px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  }
  .header {
    text-align: center;
    margin-bottom: 24px;
  }
  .header h1 {
    color: #006e2f;
    margin: 0;
    font-size: 24px;
    font-weight: 700;
  }
  .content {
    color: #191c1e;
  }
  .content p {
    margin: 12px 0;
  }
  .otp-box {
    background-color: #f0fdf4;
    color: #006e2f;
    font-family: 'Courier New', monospace;
    font-size: 32px;
    font-weight: bold;
    letter-spacing: 6px;
    padding: 20px;
    text-align: center;
    border-radius: 8px;
    margin: 24px 0;
  }
  .order-box {
    background-color: #f0fdf4;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
  }
  .order-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    color: #191c1e;
  }
  .order-row:last-child {
    font-weight: 700;
  }
  .highlight {
    background-color: #f0fdf4;
    border-radius: 8px;
    padding: 16px 20px;
    margin: 20px 0;
  }
  .highlight ul {
    margin: 8px 0;
    padding-left: 20px;
  }
  .highlight li {
    margin: 4px 0;
  }
  .footer {
    margin-top: 32px;
    text-align: center;
    font-size: 12px;
    color: #3d4a3d;
  }
`;

/**
 * Send password reset OTP email
 */
export const sendPasswordResetEmail = async (to, otp, userName) => {
  try {
    if (!env.resendApiKey) {
      logger.error('Resend API key not configured');
      throw new Error('Email service not configured');
    }

    const response = await resend.emails.send({
      from: env.resendFromEmail,
      to,
      subject: 'Your Password Reset Code - KundaGo',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${STYLES}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hello ${userName || 'there'},</p>
              <p>We received a request to reset your KundaGo password. Use the code below to proceed:</p>
              <div class="otp-box">${otp}</div>
              <p>This code will expire in <strong>10 minutes</strong>.</p>
              <p>If you did not request this reset, please ignore this email. Your account remains secure.</p>
              <p>Best regards,<br>The KundaGo Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} KundaGo. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    logger.info('Password reset OTP sent', { to, messageId: response.id });
    return response;
  } catch (error) {
    logger.error('Failed to send password reset OTP', { to, error: error.message });
    throw error;
  }
};

/**
 * Send password reset confirmation email
 */
export const sendPasswordResetConfirmation = async (to, userName) => {
  try {
    if (!env.resendApiKey) {
      logger.error('Resend API key not configured');
      throw new Error('Email service not configured');
    }

    const response = await resend.emails.send({
      from: env.resendFromEmail,
      to,
      subject: 'Your KundaGo Password Has Been Reset',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${STYLES}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Successful</h1>
            </div>
            <div class="content">
              <p style="text-align: center; font-size: 48px; margin: 16px 0;">✅</p>
              <p>Hello ${userName || 'there'},</p>
              <p>Your KundaGo account password has been successfully reset.</p>
              <p>You can now log in using your new password.</p>
              <div class="highlight">
                <p style="margin: 0;"><strong>Security Notice:</strong> If you did not make this change, please contact our support team immediately. Your account security is important to us.</p>
              </div>
              <p>Best regards,<br>The KundaGo Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} KundaGo. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    logger.info('Password reset confirmation email sent', { to, messageId: response.id });
    return response;
  } catch (error) {
    logger.error('Failed to send password reset confirmation email', { to, error: error.message });
    throw error;
  }
};

/**
 * Send welcome email to a newly registered user
 */
export const sendWelcomeEmail = async (to, userName) => {
  try {
    if (!env.resendApiKey) return;
    const name = userName || 'Customer';
    await resend.emails.send({
      from: env.resendFromEmail,
      to,
      subject: 'Welcome to KundaGo!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${STYLES}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to KundaGo!</h1>
            </div>
            <div class="content">
              <p style="text-align: center; font-size: 48px; margin: 16px 0;">🎉</p>
              <p>Hello <strong>${name}</strong>,</p>
              <p>We are thrilled to have you on board! Your account has been successfully created.</p>
              <div class="highlight">
                <strong>Here is what you can do:</strong>
                <ul>
                  <li>Browse and shop from a wide range of products</li>
                  <li>Request parcel deliveries</li>
                  <li>Track your orders in real time</li>
                </ul>
              </div>
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Happy Shopping!<br>The KundaGo Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} KundaGo. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    logger.info('Welcome email sent', { to });
  } catch (error) {
    logger.error('Failed to send welcome email', { to, error: error.message });
  }
};

/**
 * Send order confirmation email (when admin confirms or Stripe webhook confirms)
 */
export const sendOrderConfirmation = async (to, userName, orderId, totalAmount, paymentMethod) => {
  try {
    if (!env.resendApiKey) return;

    const name = userName || 'Customer';
    const shortId = orderId?.toString().length > 4
      ? '#KG-' + orderId.toString().slice(-4).toUpperCase()
      : String(orderId);

    const paymentLabels = { STRIPE: 'Card Payment (Stripe)', WAVE: 'Wave Payment', COD: 'Cash on Delivery' };
    const paymentLabel = paymentLabels[paymentMethod] || paymentMethod;

    await resend.emails.send({
      from: env.resendFromEmail,
      to,
      subject: `Order Confirmed ${shortId} - KundaGo`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${STYLES}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmed</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              <p>Great news! Your order has been confirmed and is now being processed.</p>
              <div class="order-box">
                <div class="order-row"><span>Order ID</span><span>${shortId}</span></div>
                <div class="order-row"><span>Payment Method</span><span>${paymentLabel}</span></div>
                <div class="order-row"><span>Total Amount</span><span>${totalAmount} GMD</span></div>
              </div>
              <p>Estimated delivery: <strong>1-2 working days</strong>.</p>
              <p>Thank you for choosing KundaGo!<br>The KundaGo Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} KundaGo. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    logger.info('Order confirmation email sent', { to, orderId });
  } catch (error) {
    logger.error('Failed to send order confirmation email', { to, error: error.message });
  }
};

/**
 * Send order placed email (when user places an order)
 */
export const sendOrderPlaced = async (to, userName, orderId, totalAmount, paymentMethod) => {
  try {
    if (!env.resendApiKey) return;

    const name = userName || 'Customer';
    const shortId = orderId?.toString().length > 4
      ? '#KG-' + orderId.toString().slice(-4).toUpperCase()
      : String(orderId);

    const paymentLabels = { STRIPE: 'Card Payment (Stripe)', WAVE: 'Wave Payment', COD: 'Cash on Delivery' };
    const paymentLabel = paymentLabels[paymentMethod] || paymentMethod;

    await resend.emails.send({
      from: env.resendFromEmail,
      to,
      subject: `Order Placed ${shortId} - KundaGo`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${STYLES}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Placed</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              <p>Thank you for shopping with KundaGo! Your order has been placed successfully and is pending confirmation.</p>
              <div class="order-box">
                <div class="order-row"><span>Order ID</span><span>${shortId}</span></div>
                <div class="order-row"><span>Payment Method</span><span>${paymentLabel}</span></div>
                <div class="order-row"><span>Total Amount</span><span>${totalAmount} GMD</span></div>
              </div>
              <p>We will notify you once your order is confirmed. Estimated delivery: <strong>1-2 working days</strong>.</p>
              <p>Thank you for choosing KundaGo!<br>The KundaGo Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} KundaGo. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    logger.info('Order placed email sent', { to, orderId });
  } catch (error) {
    logger.error('Failed to send order placed email', { to, error: error.message });
  }
};

/**
 * Send email verification OTP
 */
export const sendVerificationEmail = async (to, otp, userName) => {
  try {
    if (!env.resendApiKey) return;

    const name = userName || 'there';

    await resend.emails.send({
      from: env.resendFromEmail,
      to,
      subject: 'Verify your email - KundaGo',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${STYLES}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to KundaGo!</h1>
            </div>
            <div class="content">
              <p>Hello ${name},</p>
              <p>Thank you for creating an account. Please verify your email address using the code below:</p>
              <div class="otp-box">${otp}</div>
              <p>This code will expire in <strong>10 minutes</strong>.</p>
              <p>If you did not create this account, please ignore this email.</p>
              <p>Best regards,<br>The KundaGo Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} KundaGo. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    logger.info('Verification email sent', { to });
  } catch (error) {
    logger.error('Failed to send verification email', { to, error: error.message });
    throw error;
  }
};

export default {
  sendPasswordResetEmail,
  sendPasswordResetConfirmation,
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendOrderPlaced,
  sendVerificationEmail
};
