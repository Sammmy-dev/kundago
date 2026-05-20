# Gambizon Backend – AI Build Instructions

This README serves as a **complete specification and instruction manual** for building the Gambizon backend system. It is written to be consumed by an **AI development tool or human developer** to implement the backend **correctly, consistently, and within scope**.

---

## 1. Project Overview

The Gambizon project requires **building a backend only** to integrate with an **existing FlutterFlow frontend**.

### Business Context
- Single-vendor e‑commerce system
- Manual logistics (no automation)
- Includes a parcel delivery request feature
- Phase 1 scope only (no real‑time tracking, no drivers)

### Frontend
- Built with **FlutterFlow**
- Consumes **REST APIs**
- Uses **JWT authentication**

---

## 2. Technology Stack (MANDATORY)

The backend **must** be implemented using the following technologies:

- **Package Manager:** pnpm
- **Runtime:** Node.js (LTS)
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Payments:** Stripe, Wave, Cash on Delivery
- **Architecture:** RESTful API
- **Logging:** Winston
- **Security:** Cors, rate limiting e.t.c

❌ Firebase is **not** to be used
❌ GraphQL is **not** required

---

## 3. Core System Rules (VERY IMPORTANT)

1. Backend is **stateless**
2. All frontend interaction happens via REST APIs
3. FlutterFlow stores and sends JWT tokens
4. Admin and User are separated by **role-based access control**
5. Payments and logistics statuses are **independent**
6. No real-time features in Phase 1
7. Manual admin operations only

---

## 4. User Roles

### USER
- Browse products
- Add items to cart
- Place orders
- Send parcel delivery requests
- View own orders and parcels

### ADMIN
- Manage products
- View and update orders
- View and update parcel deliveries

---

## 5. Authentication Specification

### JWT Rules
- Token generated on login
- Sent via `Authorization: Bearer <token>`
- Token contains:
  - userId
  - role

### Required Middleware
- `requireAuth`
- `requireRole('ADMIN')`

---

## 6. Data Models (Logical Schema)

The following schemas define the **authoritative MongoDB data structure** for Phase 1. These schemas must be implemented using **Mongoose**, and no additional fields should be introduced without explicit requirement changes.

---

### User Schema
```js
{
  fullName: String,
  email: { type: String, unique: true },
  phone: String,
  passwordHash: String,
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  createdAt: { type: Date, default: Date.now }
}
```

---

### Product Schema
```js
{
  name: String,
  description: String,
  price: Number,
  images: [String],
  stock: Number,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}
```

---

### Cart Schema (Embedded Items)
```js
{
  userId: ObjectId,
  items: [
    {
      productId: ObjectId,
      quantity: Number,
      priceAtTime: Number
    }
  ],
  updatedAt: { type: Date, default: Date.now } 
}
```

---

### Order Schema (Embedded Items)
```js
{
  userId: ObjectId,
  items: [
    {
      productId: ObjectId,
      quantity: Number,
      priceAtTime: Number
    }
  ],
  totalAmount: Number,
  paymentMethod: { type: String, enum: ['STRIPE', 'WAVE', 'COD'] },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
  orderStatus: { type: String, enum: ['PENDING', 'CONFIRMED', 'DELIVERED'], default: 'PENDING' },
  deliveryAddress: String,
  createdAt: { type: Date, default: Date.now }
}
```

---

### Parcel Schema
```js
{
  userId: ObjectId,
  pickupName: String,
  pickupAddress: String,
  pickupPhone: String,
  dropoffName: String,
  dropoffAddress: String,
  dropoffPhone: String,
  packageSize: { type: String, enum: ['SMALL', 'MEDIUM', 'LARGE'] },
  notes: String,
  paymentMethod: { type: String, enum: ['STRIPE', 'WAVE', 'COD'] },
  status: { type: String, enum: ['PENDING', 'PICKED', 'DELIVERED'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now }
}
```

---

### Payment Schema
```js
{
  userId: ObjectId,
  referenceId: String,
  amount: Number,
  method: { type: String, enum: ['STRIPE', 'WAVE', 'COD'] },
  status: { type: String, enum: ['INITIATED', 'SUCCESS', 'FAILED'], default: 'INITIATED' },
  relatedType: { type: String, enum: ['ORDER', 'PARCEL'] },
  relatedId: ObjectId,
  createdAt: { type: Date, default: Date.now }
}
```


### Product
- name
- description
- price
- images[]
- stock
- isActive
- createdAt

### Cart
- userId
- items[]
  - productId
  - quantity
  - priceAtTime
- updatedAt

### Order
- userId
- items[]
  - productId
  - quantity
  - priceAtTime
- totalAmount
- paymentMethod (STRIPE | WAVE | COD)
- paymentStatus (PENDING | PAID | FAILED)
- orderStatus (PENDING | CONFIRMED | DELIVERED)
- deliveryAddress
- createdAt

### Parcel
- userId
- pickupName
- pickupAddress
- pickupPhone
- dropoffName
- dropoffAddress
- dropoffPhone
- packageSize (SMALL | MEDIUM | LARGE)
- notes
- paymentMethod
- status (PENDING | PICKED | DELIVERED)
- createdAt

### Payment
- userId
- referenceId
- amount
- method (STRIPE | WAVE | COD)
- status (INITIATED | SUCCESS | FAILED)
- relatedType (ORDER | PARCEL)
- relatedId
- createdAt

---

## 7. Parcel Delivery Workflow

1. User submits parcel request
2. Parcel created with status `PENDING`
3. Payment handled (if applicable)
4. Admin manually picks up parcel → status `PICKED`
5. Admin delivers parcel → status `DELIVERED`

Rules:
- Status order cannot be skipped
- No tracking, drivers, or maps

---

## 8. Normal Order Workflow

1. User browses products
2. User adds items to cart
3. User reviews cart
4. User checks out
5. Order created with:
   - orderStatus = PENDING
   - paymentStatus = PENDING
6. Payment processed
7. Order confirmed
8. Admin delivers order

Order Status Flow:
```
PENDING → CONFIRMED → DELIVERED
```

Payment Status Flow:
```
PENDING → PAID
```

---

## 9. REST API Endpoints

### Authentication
- POST /auth/register
- POST /auth/login
- GET /auth/me

### Products
- GET /products
- POST /admin/products
- PUT /admin/products/:id
- DELETE /admin/products/:id

### Cart
- GET /cart
- POST /cart/add
- PUT /cart/update
- DELETE /cart/remove/:productId

### Orders
- POST /orders/checkout
- GET /orders
- GET /admin/orders
- PUT /admin/orders/:id/status

### Parcel Delivery
- POST /parcels
- GET /parcels
- GET /admin/parcels
- PUT /admin/parcels/:id/status

### Payments
- POST /payments/stripe/initiate
- POST /payments/wave/initiate
- POST /payments/webhook

---

## 10. Error Handling Rules

- Always return JSON
- Use HTTP status codes correctly
- Never expose stack traces
- Validate all inputs

---

## 11. Security Rules

- Hash passwords (bcrypt)
- Validate JWT on protected routes
- Admin routes must be role-protected
- Use environment variables for secrets

---

## 12. Non-Goals (DO NOT IMPLEMENT)

- Multi-vendor marketplace
- Driver assignment
- Real-time tracking
- Distance-based pricing
- Map integration

---

## 13. Expected Outcome

The backend must:
- Fully support the FlutterFlow frontend
- Be scalable and maintainable
- Follow the defined workflows exactly
- Avoid over-engineering

This README is the **single source of truth** for backend implementation.

