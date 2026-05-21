import { Resend } from 'resend';
import env from '../config/env.js';
import { logger } from '../config/index.js';

/**
 * Initialize Resend client
 */
const resend = new Resend(env.resendApiKey);

/**
 * Send password reset OTP email
 * @param {string} to - Recipient email address
 * @param {string} otp - One-Time Password
 * @param {string} userName - User's full name
 * @returns {Promise<Object>} Resend response
 */
export const sendPasswordResetEmail = async (to, otp, userName) => {
  try {
    if (!env.resendApiKey) {
      logger.error('Resend API key not configured');
      throw new Error('Email service not configured');
    }

    // Send email using Resend
    const response = await resend.emails.send({
      from: env.resendFromEmail,
      to: to,
      subject: 'Your Password Reset Code - KundaGo',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background-color: #f9f9f9; border-radius: 8px; padding: 30px; border: 1px solid #ddd; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #2c3e50; margin: 0; }
            .content { background-color: white; padding: 20px; border-radius: 6px; }
            .otp-code { 
              font-family: 'Courier New', monospace;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 5px;
              color: #3498db;
              background-color: #f0f8ff;
              padding: 15px;
              text-align: center;
              border-radius: 5px;
              border: 2px dashed #3498db;
              margin: 20px 0;
            }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #777; }
            .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            
            <div class="content">
              <p>Hello ${userName || 'there'},</p>
              
              <p>We received a request to reset your KundaGo account password. Use the verification code below to proceed:</p>
              
              <div class="otp-code">${otp}</div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul style="margin: 10px 0;">
                  <li>This code will expire in 10 minutes</li>
                  <li>Do not share this code with anyone</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                </ul>
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

    logger.info('Password reset OTP sent', { to, messageId: response.id });
    return response;
  } catch (error) {
    logger.error('Failed to send password reset OTP', { to, error: error.message });
    throw error;
  }
};

/**
 * Send password reset confirmation email
 * @param {string} to - Recipient email address
 * @param {string} userName - User's full name
 * @returns {Promise<Object>} Resend response
 */
export const sendPasswordResetConfirmation = async (to, userName) => {
  try {
    if (!env.resendApiKey) {
      logger.error('Resend API key not configured');
      throw new Error('Email service not configured');
    }

    const response = await resend.emails.send({
      from: env.resendFromEmail,
      to: to,
      subject: 'Your KundaGo Password Has Been Reset',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Confirmation</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 8px;
              padding: 30px;
              border: 1px solid #ddd;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #27ae60;
              margin: 0;
            }
            .content {
              background-color: white;
              padding: 20px;
              border-radius: 6px;
            }
            .success-icon {
              text-align: center;
              font-size: 48px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #777;
            }
            .alert {
              background-color: #d1ecf1;
              border-left: 4px solid #0c5460;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Password Reset Successful</h1>
            </div>
            
            <div class="content">
              <div class="success-icon">🎉</div>
              
              <p>Hello ${userName || 'there'},</p>
              
              <p>Your KundaGo account password has been successfully reset.</p>
              
              <p>You can now log in using your new password.</p>
              
              <div class="alert">
                <strong>🛡️ Security Notice:</strong>
                <p style="margin: 10px 0;">
                  If you did not make this change, please contact our support team immediately. 
                  Your account security is important to us.
                </p>
              </div>
              
              <p>Thank you for using KundaGo!</p>
              
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

    logger.info('Password reset confirmation email sent', { 
      to, 
      messageId: response.id 
    });

    return response;
  } catch (error) {
    logger.error('Failed to send password reset confirmation email', {
      to,
      error: error.message
    });
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
      subject: 'Welcome to KundaGo! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background-color: #f9f9f9; border-radius: 8px; padding: 30px; border: 1px solid #ddd; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { color: #27ae60; margin: 0; }
            .content { background-color: white; padding: 20px; border-radius: 6px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #777; }
            .highlight { background-color: #eafaf1; border-left: 4px solid #27ae60; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to KundaGo! 🎉</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              <p>We are thrilled to have you on board! Your account has been successfully created.</p>
              <div class="highlight">
                <strong>Here's what you can do:</strong>
                <ul style="margin: 10px 0;">
                  <li>Browse and shop our products</li>
                  <li>Request parcel deliveries</li>
                  <li>Track your orders</li>
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
 * Send order confirmation email
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
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background-color: #f9f9f9; border-radius: 8px; padding: 30px; border: 1px solid #ddd; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { color: #27ae60; margin: 0; }
            .content { background-color: white; padding: 20px; border-radius: 6px; }
            .order-box { background-color: #eafaf1; border: 1px solid #a9dfbf; border-radius: 6px; padding: 15px; margin: 20px 0; }
            .order-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #d5f5e3; }
            .order-row:last-child { border-bottom: none; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #777; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Order Received!</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              <p>Thank you for shopping with KundaGo! We have successfully received your order and it is now being processed.</p>
              <div class="order-box">
                <div class="order-row"><span>Order ID</span><span>${shortId}</span></div>
                <div class="order-row"><span>Payment Method</span><span>${paymentLabel}</span></div>
                <div class="order-row"><span>Total Amount</span><span>${totalAmount} GMD</span></div>
              </div>
              <p>We will notify you once your order is out for delivery. Estimated delivery: <strong>1-2 working days</strong>.</p>
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
 * Send email verification OTP
 * @param {string} to - Recipient email address
 * @param {string} otp - One-Time Password
 * @param {string} userName - User's full name
 * @returns {Promise<Object>} Resend response
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
          <title>Verify Your Email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background-color: #f9f9f9; border-radius: 8px; padding: 30px; border: 1px solid #ddd; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #22c55e; margin: 0; }
            .content { background-color: white; padding: 20px; border-radius: 6px; }
            .otp-code {
              font-family: 'Courier New', monospace;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 5px;
              color: #22c55e;
              background-color: #f0fdf4;
              padding: 15px;
              text-align: center;
              border-radius: 5px;
              border: 2px dashed #22c55e;
              margin: 20px 0;
            }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #777; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to KundaGo!</h1>
            </div>
            <div class="content">
              <p>Hello ${name},</p>
              <p>Thank you for creating an account. Please verify your email address using the code below:</p>
              <div class="otp-code">${otp}</div>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't create this account, please ignore this email.</p>
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
  sendVerificationEmail
};
