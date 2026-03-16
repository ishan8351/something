# Sovely E-Commerce Backend Service

## Overview

The Sovely E-Commerce Backend is a robust, scalable, and secure RESTful API built to power a modern e-commerce platform. Engineered with Node.js, Express.js, and MongoDB, this service handles the complete lifecycle of digital retail, including passwordless authentication, inventory management, secure checkout processing, digital wallet ledgers, and dynamic tax invoice generation.

## Architecture & Technology Stack

* **Runtime:** Node.js
* **Framework:** Express.js 5.x (Native asynchronous error handling)
* **Database:** MongoDB
* **ODM:** Mongoose (Enforcing strict schema validation and ACID transactions)
* **Authentication:** JSON Web Tokens (JWT) & OTP-based passwordless login
* **Payment Gateway:** Razorpay
* **File Handling:** Multer (Local disk storage for bulk CSV/Excel uploads)
* **Document Generation:** PDFKit & Node-QRCode

## Core Modules & Capabilities

### 1. Authentication & Authorization

* **Passwordless Entry:** Mobile OTP generation and validation using time-to-live (TTL) indexed database tokens.
* **Stateless Sessions:** Secure, HTTP-only, SameSite-strict JWT cookie implementation.
* **Role-Based Access Control (RBAC):** Centralized middleware strictly isolating `CUSTOMER` and `ADMIN` operational privileges.

### 2. Product & Inventory Management

* **Optimized Search:** High-performance text indexing on product titles and tags.
* **Bulk Operations:** Admin endpoint supporting mass product uploads and updates via CSV/Excel, utilizing local memory caching and Mongoose `bulkWrite` for maximum database efficiency.
* **Stock Control:** Pre-save hooks and transactional queries to prevent overselling during high-concurrency checkout events.

### 3. Order Processing & Internal Economy

* **ACID Transactions:** The checkout process is wrapped in MongoDB sessions, ensuring that stock deductions, sequence ID generation, order creation, and invoice generation succeed or fail as a single atomic unit.
* **Digital Wallet:** A dual-path integrity ledger that tracks user balances. Wallets can be topped up via external payment gateways or utilized as primary payment methods during checkout.

### 4. Invoicing & Document Streaming

* **Dynamic Sequences:** Thread-safe, atomic sequence generators for localized Order IDs and Invoice Numbers.
* **On-the-Fly PDF Generation:** Programmatic creation of tax-compliant invoices featuring reverse-calculated GST, embedded UPI QR codes, and optimized buffer streaming directly to the client.

## Security & Standards

* **Data Sanitization:** Centralized error handling wrapper (`asyncHandler`) and custom error classes (`ApiError`) ensure no internal stack traces or unhandled promise rejections are leaked to the client.
* **Network Security:** Secured via `helmet` HTTP headers and strictly configured `cors` origin policies.
* **Idempotency:** Payment webhooks and sequence generators are designed defensively to process external signals exactly once, preventing duplicate charges or data collisions.

## Directory Structure

```text
src/
├── controllers/    # Core business logic and request handling
├── db/             # Database connection establishment
├── middlewares/    # Request interception (Auth, Roles, File Uploads)
├── models/         # Mongoose schema definitions and database hooks
├── routes/         # Express routing and endpoint definitions
├── utils/          # Standardized API responses and error classes
└── app.js          # Express application configuration

```

## Local Development & Setup

### Prerequisites

* Node.js (v18.x or higher recommended)
* MongoDB (Local instance or Atlas URI)

### Installation

1. Clone the repository and navigate to the root directory.
2. Install dependencies:
```bash
npm install

```



### Environment Configuration

Create a `.env` file in the root directory and populate it with the following required variables:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=your_secure_random_string
ACCESS_TOKEN_EXPIRY=1d
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
NODE_ENV=development

```

### Execution

Start the development server with hot-reloading:

```bash
npm run dev

```

The server will establish a connection to MongoDB and begin listening on the designated port. A successful initialization will output `MongoDB Connected!!` to the console.

## Current Status

**Stable / Production-Ready.** All core flows (Auth, Cart, Checkout, Webhooks) have been audited for race conditions, security vulnerabilities, and database integrity.