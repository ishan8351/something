import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Route Imports
import healthRouter from './routes/health.routes.js';
import userRouter from './routes/user.routes.js';
import productRouter from './routes/product.routes.js';
import authRouter from './routes/auth.routes.js';
import categoryRouter from './routes/category.routes.js';
import orderRouter from './routes/order.routes.js';
import invoiceRouter from './routes/invoice.routes.js';
import paymentRouter from './routes/payment.routes.js';
import walletRouter from './routes/wallet.routes.js';
import wishlistRouter from './routes/wishlist.routes.js';
import analyticsRouter from './routes/analytics.routes.js';

const app = express();

// 1. Security & Global Middlewares
app.use(helmet());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    })
);

// Basic Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

const __dirname = import.meta.dirname;
app.use(express.static(path.join(__dirname, '../public')));

// 3. Routes
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/invoices', invoiceRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/wallet', walletRouter);
app.use('/api/v1/wishlist', wishlistRouter);
app.use('/api/v1/analytics', analyticsRouter);

// 4. Global Error Handler
app.use((err, req, res, next) => {
    // If headers are already sent, delegate to default Express error handler
    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    if (statusCode !== 401) {
        console.error('Global Error Handler Caught:', err);
    }

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || [],
    });
});

export { app };
