# Gambizon E-commerce API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:3000`  
**API Type:** RESTful JSON API

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Getting Started](#getting-started)
4. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication-endpoints)
   - [Products](#products-endpoints)
   - [Admin - Products](#admin-products-endpoints)
   - [Cart](#cart-endpoints)
   - [Orders](#orders-endpoints)
   - [Admin - Orders](#admin-orders-endpoints)
   - [Parcels](#parcels-endpoints)
   - [Admin - Parcels](#admin-parcels-endpoints)
   - [Addresses](#addresses-endpoints)
   - [Upload](#upload-endpoints)
   - [Payments](#payments-endpoints)
5. [Error Handling](#error-handling)
6. [Status Codes](#status-codes)
7. [Data Models](#data-models)

---

## Overview

The Gambizon E-commerce API is a comprehensive REST API for managing an e-commerce platform with the following features:

- **JWT Authentication** - Secure token-based authentication
- **Product Management** - Browse and manage products with categories
- **Shopping Cart** - Add, update, and remove cart items
- **Order Processing** - Checkout and order tracking
- **Parcel Delivery** - Request and track parcel deliveries
- **Image Upload** - Cloudinary-powered image management
- **Password Reset** - Email-based password recovery
- **Address Management** - Save and manage delivery addresses

---

## Authentication

The API uses **JWT (JSON Web Token)** for authentication. Protected endpoints require a valid JWT token in the `Authorization` header.

### Authentication Flow

1. **Register** a new user account (`POST /auth/register`)
2. **Login** to receive a JWT token (`POST /auth/login`)
3. **Include token** in subsequent requests: `Authorization: Bearer <token>`

### Header Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### User Roles

- **USER** - Standard customer access (default)
- **ADMIN** - Administrative access with elevated permissions

---

## Getting Started

### Prerequisites

- Node.js (LTS version)
- MongoDB (running on `mongodb://localhost:27017/gambizon`)
- Environment variables configured (see `.env.example`)

### Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/gambizon

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Resend (for email)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@gambizon.com
FRONTEND_URL=http://localhost:3000

# Payment Gateways
STRIPE_SECRET_KEY=your-stripe-key
WAVE_API_KEY=your-wave-key

# CORS
CORS_ORIGIN=*
```

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

### Interactive Documentation

Visit `http://localhost:3000/api-docs` for Swagger UI (interactive API testing)

---

## API Endpoints

### Authentication Endpoints

#### Register User

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "john@example.com",
      "role": "USER",
      "createdAt": "2024-01-06T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### Login User

**POST** `/auth/login`

Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### Get Current User

**GET** `/auth/profile`

Get authenticated user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "USER",
      "profileImage": "https://res.cloudinary.com/demo/image/upload/profile.jpg",
      "createdAt": "2024-01-06T12:00:00.000Z"
    }
  }
}
```

---

#### Update User Profile

**PUT** `/auth/profile`

Update authenticated user profile with optional profile image.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
| Field | Type | Description |
|-------|------|-------------|
| `fullName` | string | Full name (optional) |
| `email` | string | Email address (optional) |
| `phone` | string | Phone number (optional) |
| `profileImage` | file | Profile image (optional, max 5MB, jpg/jpeg/png/webp) |

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "USER",
      "profileImage": "https://res.cloudinary.com/demo/image/upload/profile.jpg",
      "createdAt": "2024-01-06T12:00:00.000Z"
    }
  }
}
```

---

#### Logout User

**POST** `/auth/logout`

Logout current user (client-side token removal).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### Forgot Password

**POST** `/auth/forgot-password`

Request password reset email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

#### Reset Password

**POST** `/auth/reset-password`

Reset password using token from email.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "newpassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### Products Endpoints

#### Get All Products

**GET** `/products`

Get all active products (optionally filter by category).

**Query Parameters:**
- `category` (optional) - Filter by category name

**Example:**
```
GET /products?category=Electronics
```

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 10,
  "data": {
    "products": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Wireless Headphones",
        "description": "High-quality Bluetooth headphones",
        "price": 99.99,
        "category": "Electronics",
        "images": [
          "https://res.cloudinary.com/demo/image/upload/headphones.jpg"
        ],
        "stock": 50,
        "isActive": true,
        "createdAt": "2024-01-06T12:00:00.000Z"
      }
    ]
  }
}
```

---

#### Get Products by Category

**GET** `/products/category/:category`

Get all active products in a specific category.

**Parameters:**
- `category` (path) - Category name

**Example:**
```
GET /products/category/Electronics
```

**Response:** `200 OK` (same structure as Get All Products)

---

#### Get Product by ID

**GET** `/products/:id`

Get single product details.

**Parameters:**
- `id` (path) - Product ID

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "product": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Wireless Headphones",
      "description": "High-quality Bluetooth headphones",
      "price": 99.99,
      "category": "Electronics",
      "images": ["https://..."],
      "stock": 50,
      "isActive": true,
      "createdAt": "2024-01-06T12:00:00.000Z"
    }
  }
}
```

---

### Admin Products Endpoints

🔒 **Requires:** Admin role

#### Get All Products (Admin)

**GET** `/admin/products`

Get all products including inactive ones.

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 25,
  "data": {
    "products": [...]
  }
}
```

---

#### Create Product

**POST** `/admin/products`

Create a new product with optional image uploads via Cloudinary.

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
```

> **Note:** This endpoint accepts both `multipart/form-data` (with file uploads) and `application/json` (URL-only). When using `multipart/form-data`, product fields are sent as form fields and images as file attachments.

**Request Body (multipart/form-data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Product name |
| `description` | string | ❌ | Product description |
| `price` | number | ✅ | Product price |
| `category` | string | ❌ | Product category |
| `stock` | number | ✅ | Stock quantity |
| `isActive` | boolean | ❌ | Active status (default: true) |
| `images` | string[] | ❌ | Array of existing image URLs |
| `productImages` | file[] | ❌ | Image files to upload (max 5, 5MB each, jpg/jpeg/png/webp) |

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Wireless Headphones",
      "price": 99.99,
      "category": "Electronics",
      "images": [
        "https://res.cloudinary.com/demo/image/upload/v1/products/images/abc123.jpg"
      ],
      "stock": 50,
      "isActive": true
    }
  }
}
```

> **Image Handling:** Uploaded files are stored on Cloudinary and their URLs are saved to the product. If product creation fails, any uploaded images are automatically cleaned up from Cloudinary.
```

---

#### Update Product

**PUT** `/admin/products/:id`

Update an existing product with optional image uploads via Cloudinary.

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
```

> **Note:** This endpoint accepts both `multipart/form-data` (with file uploads) and `application/json`. When using `multipart/form-data`, product fields are sent as form fields and new images as file attachments.

**Request Body (multipart/form-data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ❌ | Product name |
| `description` | string | ❌ | Product description |
| `price` | number | ❌ | Product price |
| `category` | string | ❌ | Product category |
| `stock` | number | ❌ | Stock quantity |
| `isActive` | boolean | ❌ | Active status |
| `images` | string[] | ❌ | Array of image URLs (replaces existing images) |
| `productImages` | file[] | ❌ | New image files to upload and append (max 5, 5MB each, jpg/jpeg/png/webp) |

> **Image Behavior:**
> - If `images` (URL array) is provided in the body, it **replaces** the existing images.
> - If `productImages` (files) are uploaded, they are **appended** after the current/replaced images.
> - Both can be combined: send `images` to set the base list, and `productImages` to add new uploads.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "product": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Updated Product Name",
      "price": 89.99,
      "images": [
        "https://res.cloudinary.com/demo/image/upload/v1/products/images/existing.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/products/images/newupload.jpg"
      ],
      "stock": 75,
      "isActive": true
    }
  }
}
```

---

#### Delete Product

**DELETE** `/admin/products/:id`

Soft delete a product (sets `isActive` to false).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### Cart Endpoints

🔒 **Requires:** Authentication

#### Get User Cart

**GET** `/cart`

Get current user's cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "cart": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "items": [
        {
          "productId": {
            "_id": "507f1f77bcf86cd799439013",
            "name": "Wireless Headphones",
            "price": 99.99,
            "images": ["https://..."]
          },
          "quantity": 2,
          "priceAtTime": 99.99
        }
      ],
      "updatedAt": "2024-01-06T12:00:00.000Z"
    }
  }
}
```

---

#### Add to Cart

**POST** `/cart/add`

Add item to cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": "507f1f77bcf86cd799439013",
  "quantity": 2
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Item added to cart"
}
```

---

#### Update Cart Item

**PUT** `/cart/update`

Update item quantity in cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": "507f1f77bcf86cd799439013",
  "quantity": 3
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Cart updated"
}
```

---

#### Remove from Cart

**DELETE** `/cart/remove/:productId`

Remove item from cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

---

### Orders Endpoints

🔒 **Requires:** Authentication

#### Checkout

**POST** `/orders/checkout`

Create order from cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "deliveryAddress": "123 Main St, City, Country",
  "paymentMethod": "COD"
}
```

**Payment Methods:**
- `STRIPE` - Stripe payment gateway
- `WAVE` - Wave payment gateway
- `COD` - Cash on Delivery

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439014",
      "userId": "507f1f77bcf86cd799439012",
      "items": [...],
      "totalAmount": 199.98,
      "paymentMethod": "COD",
      "paymentStatus": "PENDING",
      "orderStatus": "PENDING",
      "deliveryAddress": "123 Main St, City, Country",
      "createdAt": "2024-01-06T12:00:00.000Z"
    }
  }
}
```

---

#### Get User Orders

**GET** `/orders`

Get all orders for current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 5,
  "data": {
    "orders": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "items": [...],
        "totalAmount": 199.98,
        "paymentMethod": "COD",
        "paymentStatus": "PENDING",
        "orderStatus": "PENDING",
        "deliveryAddress": "123 Main St",
        "createdAt": "2024-01-06T12:00:00.000Z"
      }
    ]
  }
}
```

---

#### Get Order by ID

**GET** `/orders/:id`

Get single order details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439014",
      "items": [...],
      "totalAmount": 199.98,
      "orderStatus": "PENDING",
      "paymentStatus": "PENDING"
    }
  }
}
```

---

### Admin Orders Endpoints

🔒 **Requires:** Admin role

#### Get All Orders (Admin)

**GET** `/admin/orders`

Get all orders with optional status filter.

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `status` (optional) - Filter by order status (`PENDING`, `CONFIRMED`, `DELIVERED`)

**Example:**
```
GET /admin/orders?status=PENDING
```

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 20,
  "data": {
    "orders": [...]
  }
}
```

---

#### Update Order Status

**PUT** `/admin/orders/:id/status`

Update order status.

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "orderStatus": "CONFIRMED"
}
```

**Order Status Flow:**
- `PENDING` → `CONFIRMED` → `DELIVERED`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Order status updated"
}
```

---

### Parcels Endpoints

🔒 **Requires:** Authentication

#### Create Parcel Request

**POST** `/parcels`

Create a parcel delivery request.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "pickupName": "John Doe",
  "pickupAddress": "123 Main St, City",
  "pickupPhone": "+1234567890",
  "dropoffName": "Jane Smith",
  "dropoffAddress": "456 Oak Ave, City",
  "dropoffPhone": "+0987654321",
  "packageSize": "MEDIUM",
  "notes": "Handle with care",
  "paymentMethod": "COD"
}
```

**Package Sizes:**
- `SMALL` - Small packages
- `MEDIUM` - Medium packages
- `LARGE` - Large packages

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Parcel request created",
  "data": {
    "parcel": {
      "_id": "507f1f77bcf86cd799439015",
      "userId": "507f1f77bcf86cd799439012",
      "pickupName": "John Doe",
      "dropoffName": "Jane Smith",
      "packageSize": "MEDIUM",
      "status": "PENDING",
      "paymentMethod": "COD",
      "createdAt": "2024-01-06T12:00:00.000Z"
    }
  }
}
```

---

#### Get User Parcels

**GET** `/parcels`

Get all parcels for current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 3,
  "data": {
    "parcels": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "pickupName": "John Doe",
        "dropoffName": "Jane Smith",
        "packageSize": "MEDIUM",
        "status": "PENDING",
        "createdAt": "2024-01-06T12:00:00.000Z"
      }
    ]
  }
}
```

---

#### Get Parcel by ID

**GET** `/parcels/:id`

Get single parcel details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "parcel": {
      "_id": "507f1f77bcf86cd799439015",
      "pickupName": "John Doe",
      "pickupAddress": "123 Main St",
      "pickupPhone": "+1234567890",
      "dropoffName": "Jane Smith",
      "dropoffAddress": "456 Oak Ave",
      "dropoffPhone": "+0987654321",
      "packageSize": "MEDIUM",
      "notes": "Handle with care",
      "status": "PENDING",
      "paymentMethod": "COD"
    }
  }
}
```

---

### Admin Parcels Endpoints

🔒 **Requires:** Admin role

#### Get All Parcels (Admin)

**GET** `/admin/parcels`

Get all parcels with optional status filter.

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `status` (optional) - Filter by parcel status (`PENDING`, `PICKED`, `DELIVERED`)

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 15,
  "data": {
    "parcels": [...]
  }
}
```

---

#### Update Parcel Status

**PUT** `/admin/parcels/:id/status`

Update parcel status.

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "status": "PICKED"
}
```

**Parcel Status Flow:**
- `PENDING` → `PICKED` → `DELIVERED`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Parcel status updated"
}
```

---

### Addresses Endpoints

🔒 **Requires:** Authentication

#### Get User Addresses

**GET** `/addresses`

Get all addresses for current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 2,
  "data": {
    "addresses": [
      {
        "_id": "507f1f77bcf86cd799439016",
        "userId": "507f1f77bcf86cd799439012",
        "fullName": "John Doe",
        "phone": "+1234567890",
        "addressLine1": "123 Main St",
        "addressLine2": "Apt 4B",
        "city": "New York",
        "state": "NY",
        "postalCode": "10001",
        "country": "USA",
        "isDefault": true
      }
    ]
  }
}
```

---

#### Get Address by ID

**GET** `/addresses/:id`

Get single address details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "address": {
      "_id": "507f1f77bcf86cd799439016",
      "fullName": "John Doe",
      "phone": "+1234567890",
      "addressLine1": "123 Main St",
      "city": "New York",
      "isDefault": true
    }
  }
}
```

---

#### Create Address

**POST** `/addresses`

Create a new address.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "phone": "+1234567890",
  "addressLine1": "123 Main St",
  "addressLine2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "USA",
  "isDefault": true
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Address created successfully",
  "data": {
    "address": {
      "_id": "507f1f77bcf86cd799439016",
      "fullName": "John Doe",
      "addressLine1": "123 Main St",
      "city": "New York",
      "isDefault": true
    }
  }
}
```

---

#### Update Address

**PUT** `/addresses/:id`

Update an existing address.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "addressLine1": "456 Oak Ave",
  "city": "Los Angeles",
  "isDefault": false
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Address updated successfully"
}
```

---

#### Delete Address

**DELETE** `/addresses/:id`

Delete an address.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

---

### Admin Product Image Endpoints

🔒 **Requires:** Admin role

#### Upload Product Images

**POST** `/admin/products/:id/images`

Upload product images (Admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
```

**Parameters:**
- `id` (path) - Product ID

**Form Data:**
- `productImages` (files) - Multiple image files (max 5 files, 5MB each, jpg/jpeg/png/webp)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Product images uploaded successfully",
  "data": {
    "product": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Product Name",
      "images": [
        "https://res.cloudinary.com/demo/image/upload/v1/product1.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/product2.jpg"
      ]
    },
    "uploadedImages": [
      "https://res.cloudinary.com/demo/image/upload/v1/product1.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1/product2.jpg"
    ]
  }
}
```

---

#### Delete Product Image

**DELETE** `/admin/products/:id/images`

Delete a single product image (Admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Parameters:**
- `id` (path) - Product ID

**Request Body:**
```json
{
  "imageUrl": "https://res.cloudinary.com/demo/image/upload/v1/product1.jpg"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Product image deleted successfully",
  "data": {
    "product": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Product Name",
      "images": []
    }
  }
}
```

---

### Upload Endpoints (Legacy)

> **Note:** Profile image upload is now handled via `PUT /auth/profile` endpoint. Product image upload is now handled via `/admin/products/:id/images` endpoints.

🔒 **Requires:** Authentication (Admin for product images)

#### Upload Profile Image

**POST** `/upload/profile`

Upload user profile image. *(Recommended: Use `PUT /auth/profile` instead)*

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `profileImage` (file) - Image file (max 5MB, jpg/jpeg/png/webp)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile image uploaded successfully",
  "data": {
    "profileImage": "https://res.cloudinary.com/demo/image/upload/v1/profile.jpg",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "profileImage": "https://res.cloudinary.com/demo/image/upload/v1/profile.jpg"
    }
  }
}
```

---

#### Delete Profile Image

**DELETE** `/upload/profile`

Delete user profile image.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile image deleted successfully"
}
```

---

#### Upload Product Images (Legacy)

**POST** `/upload/product/:productId`

Upload product images (Admin only). *(Recommended: Use `POST /admin/products/:id/images` instead)*

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
```

**Form Data:**
- `productImages` (files) - Multiple image files (max 5 files, 5MB each, jpg/jpeg/png/webp)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Product images uploaded successfully",
  "data": {
    "product": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Product Name",
      "images": ["..."]
    },
    "uploadedImages": ["..."]
  }
}
```

---

#### Delete Product Image (Legacy)

**DELETE** `/upload/product/:productId/image`

Delete a single product image (Admin only). *(Recommended: Use `DELETE /admin/products/:id/images` instead)*

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "imageUrl": "https://res.cloudinary.com/demo/image/upload/v1/product1.jpg"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Product image deleted successfully"
}
```

---

### Payments Endpoints

🔒 **Requires:** Authentication (except webhook)

#### Initiate Stripe Payment

**POST** `/payments/stripe/initiate`

Create a payment intent for an order or parcel delivery.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "relatedType": "ORDER",
  "relatedId": "507f1f77bcf86cd799439014"
}
```

**Related Types:**
- `ORDER` - Pay for an order
- `PARCEL` - Pay for a parcel delivery

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "payment": {
      "_id": "507f1f77bcf86cd799439020",
      "userId": "507f1f77bcf86cd799439012",
      "referenceId": "pi_3abc123xyz",
      "amount": 199.98,
      "method": "STRIPE",
      "status": "INITIATED",
      "relatedType": "ORDER",
      "relatedId": "507f1f77bcf86cd799439014",
      "createdAt": "2024-01-06T12:00:00.000Z"
    },
    "clientSecret": "pi_3abc123xyz_secret_def456"
  }
}
```

**Error Responses:**
- `400` - Order already paid or invalid request
- `403` - Not authorized to pay for this resource
- `404` - Order or parcel not found
- `503` - Payment service not configured

---

#### Get User Payments

**GET** `/payments`

Get all payments for current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 5,
  "data": {
    "payments": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "referenceId": "pi_3abc123xyz",
        "amount": 199.98,
        "method": "STRIPE",
        "status": "COMPLETED",
        "relatedType": "ORDER",
        "relatedId": "507f1f77bcf86cd799439014",
        "createdAt": "2024-01-06T12:00:00.000Z"
      }
    ]
  }
}
```

---

#### Get Payment by ID

**GET** `/payments/:id`

Get single payment details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "payment": {
      "_id": "507f1f77bcf86cd799439020",
      "userId": "507f1f77bcf86cd799439012",
      "referenceId": "pi_3abc123xyz",
      "amount": 199.98,
      "method": "STRIPE",
      "status": "COMPLETED",
      "relatedType": "ORDER",
      "relatedId": "507f1f77bcf86cd799439014",
      "createdAt": "2024-01-06T12:00:00.000Z",
      "updatedAt": "2024-01-06T12:05:00.000Z"
    }
  }
}
```

---

#### Stripe Webhook

**POST** `/payments/webhook`

Handle Stripe webhook events. This endpoint is called by Stripe servers to notify about payment status changes.

> ⚠️ **Note:** This endpoint is called automatically by Stripe. Do not call it from your application.

**Headers:**
```
Stripe-Signature: <signature>
```

**Response:** `200 OK`
```json
{
  "received": true
}
```

**Handled Events:**
- `payment_intent.succeeded` - Payment completed successfully
- `payment_intent.payment_failed` - Payment failed

---

## Error Handling

All errors follow a consistent JSON structure:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "error": "Detailed error information (development only)"
}
```

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authenticated. Please login."
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error. Please try again later."
}
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Authentication required or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource does not exist |
| 500 | Internal Server Error - Server-side error |

---

## Data Models

### User Model

```javascript
{
  _id: ObjectId,
  fullName: String,
  email: String (unique),
  phone: String,
  passwordHash: String,
  role: Enum ['USER', 'ADMIN'],
  profileImage: String (nullable),
  resetPasswordToken: String (nullable),
  resetPasswordExpires: Date (nullable),
  createdAt: Date
}
```

### Product Model

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String,
  images: [String],
  stock: Number,
  isActive: Boolean,
  createdAt: Date
}
```

### Cart Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  items: [
    {
      productId: ObjectId (ref: Product),
      quantity: Number,
      priceAtTime: Number
    }
  ],
  updatedAt: Date
}
```

### Order Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  items: [
    {
      productId: ObjectId (ref: Product),
      quantity: Number,
      priceAtTime: Number
    }
  ],
  totalAmount: Number,
  paymentMethod: Enum ['STRIPE', 'WAVE', 'COD'],
  paymentStatus: Enum ['PENDING', 'PAID', 'FAILED'],
  orderStatus: Enum ['PENDING', 'CONFIRMED', 'DELIVERED'],
  deliveryAddress: String,
  createdAt: Date
}
```

### Parcel Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  pickupName: String,
  pickupAddress: String,
  pickupPhone: String,
  dropoffName: String,
  dropoffAddress: String,
  dropoffPhone: String,
  packageSize: Enum ['SMALL', 'MEDIUM', 'LARGE'],
  notes: String,
  paymentMethod: Enum ['STRIPE', 'WAVE', 'COD'],
  status: Enum ['PENDING', 'PICKED', 'DELIVERED'],
  createdAt: Date
}
```

### Address Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  fullName: String,
  phone: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
  isDefault: Boolean
}
```

### Payment Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  referenceId: String,           // Payment gateway reference (e.g., Stripe payment intent ID)
  amount: Number,
  method: Enum ['STRIPE', 'WAVE', 'COD'],
  status: Enum ['INITIATED', 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
  relatedType: Enum ['ORDER', 'PARCEL'],
  relatedId: ObjectId,           // Polymorphic reference to Order or Parcel
  metadata: Object,              // Additional payment metadata
  createdAt: Date,
  updatedAt: Date
}
```

---

## Additional Resources

- **Swagger UI:** `http://localhost:3000/api-docs` (Interactive testing)
- **OpenAPI JSON:** `http://localhost:3000/api-docs.json` (Export for Postman/Insomnia)
- **GitHub Repository:** [Your repository URL]
- **Support:** support@gambizon.com

---

## Changelog

### Version 1.0.0 (2024-01-06)
- Initial API release
- JWT authentication
- Product management with categories
- Shopping cart functionality
- Order processing
- Parcel delivery system
- Image upload with Cloudinary
- Password reset via email
- Address management

---

**Last Updated:** January 6, 2024  
**API Version:** 1.0.0
