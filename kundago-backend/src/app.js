import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env, logger } from './config/index.js';
import { authRoutes, productRoutes, adminProductRoutes, cartRoutes, orderRoutes, adminOrderRoutes, parcelRoutes, adminParcelRoutes, addressRoutes, paymentRoutes, adminUserRoutes, adminDeliveryTierRoutes } from './routes/index.js';
import swaggerSpec from '../swagger.js';

// Initialize Express app
const app = express();

// Trust proxy for rate limiting behind reverse proxy (Render)
app.set('trust proxy', 1);

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
    },
  },
}));

// Rate limiting - 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/health';
  }
});

// Apply rate limiting to all routes
app.use(limiter);

// Stricter rate limit for auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Enable CORS
app.use(cors({
  origin: env.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
  });
  
  next();
});

// ============================================
// ROOT ENDPOINT
// ============================================

app.all('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'KundaGo API',
    environment: env.nodeEnv
  });
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv
  });
});

// ============================================
// API DOCUMENTATION (SWAGGER)
// ============================================

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'KundaGo API Documentation',
  customfavIcon: '/favicon.ico'
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

logger.info('Swagger documentation available at /api-docs');

// ============================================
// API ROUTES
// ============================================

// Authentication routes (with stricter rate limit)
app.use('/auth', authLimiter, authRoutes);

// Product routes (public)
app.use('/products', productRoutes);

// Admin product routes (protected)
app.use('/admin/products', adminProductRoutes);

// Cart routes (protected)
app.use('/cart', cartRoutes);

// Order routes (protected)
app.use('/orders', orderRoutes);

// Admin order routes (protected)
app.use('/admin/orders', adminOrderRoutes);

// Parcel routes (protected)
app.use('/parcels', parcelRoutes);

// Admin parcel routes (protected)
app.use('/admin/parcels', adminParcelRoutes);

// Address routes (protected)
app.use('/addresses', addressRoutes);

// Payment routes
app.use('/payments', paymentRoutes);

// Admin user routes (protected)
app.use('/admin/users', adminUserRoutes);

// Admin delivery tier routes (protected)
app.use('/admin/delivery-tiers', adminDeliveryTierRoutes);

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Resource not found'
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';
  let errors = err.errors || null;

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    errors = Object.keys(err.errors).map((field) => ({
      field,
      message: err.errors[field].message
    }));
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token has expired';
  }

  // Handle Stripe errors
  if (err.type && err.type.startsWith('Stripe')) {
    statusCode = err.statusCode || 400;
    code = 'STRIPE_ERROR';
    message = err.message;
  }

  // Log error with full details
  logger.error(`${message}`, {
    statusCode,
    code,
    method: req.method,
    url: req.originalUrl,
    ...(env.isDevelopment() && { stack: err.stack })
  });

  // Build response object
  const response = {
    success: false,
    message,
    code
  };

  // Include field errors if available
  if (errors) {
    response.errors = errors;
  }

  // Include stack trace in development
  if (env.isDevelopment()) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
});

export default app;
