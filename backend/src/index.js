'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const logger = require('./utils/logger');
const authRoutes = require('./routes/auth.routes');
const recordRoutes = require('./routes/record.routes');
const accessRoutes = require('./routes/access.routes');
const aiRoutes = require('./routes/ai.routes');
const adminRoutes = require('./routes/admin.routes');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const fabricGateway = require('./config/fabric-gateway');
const { connectDb, disconnectDb } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// Middleware Stack
// ============================================

// Security headers
app.use(helmet());

// CORS Configuration
app.use(cors({
    origin: '*', // Allow all origins (Web, Mobile, etc.) in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
}));

// Rate limiting (prevent bulk data exfiltration)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        error: 'Too many requests. Please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', limiter);

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Too many authentication attempts. Please try again later.' }
});
app.use('/api/auth/', authLimiter);

// ============================================
// Routes
// ============================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'medchain-backend',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// Start Server
// ============================================

app.listen(PORT, async () => {
    logger.info(`🏥 MedChain Backend API running on port ${PORT}`);
    logger.info(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/health`);

    // Initialize Databases
    try {
        await connectDb();
        await fabricGateway.init();
    } catch (error) {
        logger.error('Critical: Failed to initialize infrastructure on startup');
    }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Closing connections...');
    await fabricGateway.close();
    await disconnectDb();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received. Closing connections...');
    await fabricGateway.close();
    await disconnectDb();
    process.exit(0);
});

module.exports = app;
