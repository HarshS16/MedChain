'use strict';

const logger = require('../utils/logger');

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res, next) {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} does not exist`,
        timestamp: new Date().toISOString()
    });
}

/**
 * Global error handler
 */
function errorHandler(err, req, res, next) {
    // Log the error
    logger.error('Unhandled error:', {
        error: err.message,
        stack: err.stack,
        method: req.method,
        path: req.originalUrl,
        userId: req.user?.id,
        body: req.body
    });

    // Determine status code
    const statusCode = err.statusCode || err.status || 500;

    // Don't leak internal errors in production
    const message = statusCode === 500 && process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;

    res.status(statusCode).json({
        error: statusCode >= 500 ? 'Internal Server Error' : 'Request Error',
        message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
        timestamp: new Date().toISOString()
    });
}

module.exports = { notFoundHandler, errorHandler };
