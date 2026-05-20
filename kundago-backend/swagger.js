import swaggerJsdoc from 'swagger-jsdoc';
import env from './src/config/env.js';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'KundaGo E-commerce API',
    version: '1.0.0',
    description: `
      Comprehensive REST API for KundaGo e-commerce platform.
      
      **Features:**
      - JWT Authentication
      - Product Management
      - Shopping Cart
      - Order Processing
      - Parcel Delivery
      - Image Upload (Cloudinary)
      - Password Reset (Email)
      
      **Authentication:**
      Most endpoints require JWT authentication. Click the "Authorize" button and enter: Bearer <your-token>
    `,
    contact: {
      name: 'KundaGo API Support',
      email: 'support@kundago.com'
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC'
    }
  },
  servers: [
    {
      url: `http://localhost:${env.port}`,
      description: 'Development server'
    },
    {
      url: process.env.PRODUCTION_URL || 'https://api.kundago.com',
      description: 'Production server'
    }
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User registration, login, logout, and password reset'
    },
    {
      name: 'Products',
      description: 'Public product listing and search'
    },
    {
      name: 'Admin - Products',
      description: 'Admin-only product management (Create, Update, Delete)'
    },
    {
      name: 'Cart',
      description: 'Shopping cart operations'
    },
    {
      name: 'Orders',
      description: 'Order checkout and management'
    },
    {
      name: 'Admin - Orders',
      description: 'Admin order management and status updates'
    },
    {
      name: 'Parcels',
      description: 'Parcel delivery requests'
    },
    {
      name: 'Admin - Parcels',
      description: 'Admin parcel management and status updates'
    },
    {
      name: 'Addresses',
      description: 'User delivery address management'
    },
    {
      name: 'Upload',
      description: 'Image upload for profiles and products'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>'
      }
    },
    schemas: {
      // ============================================
      // USER SCHEMAS
      // ============================================
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          fullName: {
            type: 'string',
            example: 'John Doe'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com'
          },
          phone: {
            type: 'string',
            example: '+1234567890'
          },
          role: {
            type: 'string',
            enum: ['USER', 'ADMIN'],
            example: 'USER'
          },
          profileImage: {
            type: 'string',
            nullable: true,
            example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com'
          },
          password: {
            type: 'string',
            minLength: 6,
            example: 'password123'
          }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com'
          },
          password: {
            type: 'string',
            example: 'password123'
          }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Login successful'
          },
          data: {
            type: 'object',
            properties: {
              user: {
                $ref: '#/components/schemas/User'
              },
              token: {
                type: 'string',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
              }
            }
          }
        }
      },
      ForgotPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com'
          }
        }
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['token', 'newPassword', 'confirmPassword'],
        properties: {
          token: {
            type: 'string',
            example: 'reset-token-from-email'
          },
          newPassword: {
            type: 'string',
            minLength: 6,
            example: 'newpassword123'
          },
          confirmPassword: {
            type: 'string',
            minLength: 6,
            example: 'newpassword123'
          }
        }
      },
      UpdateProfileRequest: {
        type: 'object',
        properties: {
          fullName: {
            type: 'string',
            example: 'John Doe'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com'
          },
          phone: {
            type: 'string',
            example: '+1234567890'
          },
          profileImage: {
            type: 'string',
            format: 'binary',
            description: 'Profile image file (max 5MB, jpg/jpeg/png/webp)'
          }
        }
      },
      
      // ============================================
      // PRODUCT SCHEMAS
      // ============================================
      Product: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          name: {
            type: 'string',
            example: 'iPhone 15 Pro'
          },
          description: {
            type: 'string',
            example: 'Latest iPhone with advanced features'
          },
          price: {
            type: 'number',
            example: 999.99
          },
          images: {
            type: 'array',
            items: {
              type: 'string'
            },
            example: ['https://example.com/image1.jpg']
          },
          category: {
            type: 'string',
            example: 'Electronics'
          },
          stock: {
            type: 'number',
            example: 50
          },
          isActive: {
            type: 'boolean',
            example: true
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      ProductRequest: {
        type: 'object',
        required: ['name', 'price', 'stock'],
        properties: {
          name: {
            type: 'string',
            example: 'iPhone 15 Pro'
          },
          description: {
            type: 'string',
            example: 'Latest iPhone with advanced features'
          },
          price: {
            type: 'number',
            example: 999.99
          },
          images: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Array of existing image URLs',
            example: []
          },
          category: {
            type: 'string',
            example: 'Electronics'
          },
          stock: {
            type: 'number',
            example: 50
          },
          isActive: {
            type: 'boolean',
            example: true
          },
          productImages: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary'
            },
            description: 'Image files to upload to Cloudinary (max 5 files, 5MB each, jpg/jpeg/png/webp)'
          }
        }
      },
      
      // ============================================
      // CART SCHEMAS
      // ============================================
      CartItem: {
        type: 'object',
        properties: {
          productId: {
            $ref: '#/components/schemas/Product'
          },
          quantity: {
            type: 'number',
            example: 2
          },
          priceAtTime: {
            type: 'number',
            example: 999.99
          }
        }
      },
      Cart: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          userId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          items: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/CartItem'
            }
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      AddToCartRequest: {
        type: 'object',
        required: ['productId', 'quantity'],
        properties: {
          productId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          quantity: {
            type: 'number',
            example: 1
          }
        }
      },
      UpdateCartRequest: {
        type: 'object',
        required: ['productId', 'quantity'],
        properties: {
          productId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          quantity: {
            type: 'number',
            example: 3
          }
        }
      },
      
      // ============================================
      // ORDER SCHEMAS
      // ============================================
      Order: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          userId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: {
                  type: 'string'
                },
                quantity: {
                  type: 'number'
                },
                priceAtTime: {
                  type: 'number'
                }
              }
            }
          },
          totalAmount: {
            type: 'number',
            example: 1999.98
          },
          paymentMethod: {
            type: 'string',
            enum: ['STRIPE', 'WAVE', 'COD'],
            example: 'COD'
          },
          paymentStatus: {
            type: 'string',
            enum: ['PENDING', 'PAID', 'FAILED'],
            example: 'PENDING'
          },
          orderStatus: {
            type: 'string',
            enum: ['PENDING', 'CONFIRMED', 'DELIVERED'],
            example: 'PENDING'
          },
          deliveryAddress: {
            type: 'string',
            example: '123 Main St, City, Country'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      CheckoutRequest: {
        type: 'object',
        required: ['paymentMethod', 'deliveryAddress'],
        properties: {
          paymentMethod: {
            type: 'string',
            enum: ['STRIPE', 'WAVE', 'COD'],
            example: 'COD'
          },
          deliveryAddress: {
            type: 'string',
            example: '123 Main St, City, Country'
          }
        }
      },
      UpdateOrderStatusRequest: {
        type: 'object',
        required: ['orderStatus'],
        properties: {
          orderStatus: {
            type: 'string',
            enum: ['PENDING', 'CONFIRMED', 'DELIVERED'],
            example: 'CONFIRMED'
          },
          paymentStatus: {
            type: 'string',
            enum: ['PENDING', 'PAID', 'FAILED'],
            example: 'PAID'
          }
        }
      },
      
      // ============================================
      // PARCEL SCHEMAS
      // ============================================
      Parcel: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          userId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          pickupName: {
            type: 'string',
            example: 'John Doe'
          },
          pickupAddress: {
            type: 'string',
            example: '123 Pickup St'
          },
          pickupPhone: {
            type: 'string',
            example: '+1234567890'
          },
          dropoffName: {
            type: 'string',
            example: 'Jane Smith'
          },
          dropoffAddress: {
            type: 'string',
            example: '456 Dropoff Ave'
          },
          dropoffPhone: {
            type: 'string',
            example: '+0987654321'
          },
          packageSize: {
            type: 'string',
            enum: ['SMALL', 'MEDIUM', 'LARGE'],
            example: 'MEDIUM'
          },
          notes: {
            type: 'string',
            example: 'Handle with care'
          },
          paymentMethod: {
            type: 'string',
            enum: ['STRIPE', 'WAVE', 'COD'],
            example: 'COD'
          },
          status: {
            type: 'string',
            enum: ['PENDING', 'PICKED', 'DELIVERED'],
            example: 'PENDING'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      ParcelRequest: {
        type: 'object',
        required: ['pickupName', 'pickupAddress', 'pickupPhone', 'dropoffName', 'dropoffAddress', 'dropoffPhone', 'packageSize', 'paymentMethod'],
        properties: {
          pickupName: {
            type: 'string',
            example: 'John Doe'
          },
          pickupAddress: {
            type: 'string',
            example: '123 Pickup St'
          },
          pickupPhone: {
            type: 'string',
            example: '+1234567890'
          },
          dropoffName: {
            type: 'string',
            example: 'Jane Smith'
          },
          dropoffAddress: {
            type: 'string',
            example: '456 Dropoff Ave'
          },
          dropoffPhone: {
            type: 'string',
            example: '+0987654321'
          },
          packageSize: {
            type: 'string',
            enum: ['SMALL', 'MEDIUM', 'LARGE'],
            example: 'MEDIUM'
          },
          notes: {
            type: 'string',
            example: 'Handle with care'
          },
          paymentMethod: {
            type: 'string',
            enum: ['STRIPE', 'WAVE', 'COD'],
            example: 'COD'
          }
        }
      },
      UpdateParcelStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['PENDING', 'PICKED', 'DELIVERED'],
            example: 'PICKED'
          }
        }
      },
      
      // ============================================
      // ADDRESS SCHEMAS
      // ============================================
      Address: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          userId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          fullName: {
            type: 'string',
            example: 'John Doe'
          },
          phone: {
            type: 'string',
            example: '+1234567890'
          },
          address: {
            type: 'string',
            example: '123 Main St, Apt 4B'
          },
          landmark: {
            type: 'string',
            example: 'Near Central Park'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      AddressRequest: {
        type: 'object',
        required: ['fullName', 'phone', 'address'],
        properties: {
          fullName: {
            type: 'string',
            example: 'John Doe'
          },
          phone: {
            type: 'string',
            example: '+1234567890'
          },
          address: {
            type: 'string',
            example: '123 Main St, Apt 4B'
          },
          landmark: {
            type: 'string',
            example: 'Near Central Park'
          }
        }
      },
      
      // ============================================
      // RESPONSE SCHEMAS
      // ============================================
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Operation successful'
          },
          data: {
            type: 'object'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Error message'
          }
        }
      },
      ValidationError: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Validation failed'
          }
        }
      },
      UnauthorizedError: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Unauthorized. Please login.'
          }
        }
      },
      ForbiddenError: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Access denied. Admin only.'
          }
        }
      },
      NotFoundError: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Resource not found'
          }
        }
      }
    }
  }
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.js',
    './src/routes/**/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
