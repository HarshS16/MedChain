'use strict';

const logger = require('../utils/logger');

/**
 * Audit middleware — logs all API access for compliance
 * Works alongside blockchain audit trail (this is the API-level audit)
 */
function auditLog(req, res, next) {
    const startTime = Date.now();

    // Capture response using event listener
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const auditEntry = {
            timestamp: new Date().toISOString(),
            method: req.method,
            path: req.originalUrl,
            userId: req.user?.id || 'anonymous',
            userRole: req.user?.role || 'none',
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.connection?.remoteAddress,
            userAgent: req.get('user-agent'),
            contentLength: res.get('content-length') || 0
        };

        // Log at different levels based on status
        if (res.statusCode >= 500) {
            logger.error('API Audit (SERVER_ERROR)', auditEntry);
        } else if (res.statusCode >= 400) {
            logger.warn('API Audit (CLIENT_ERROR)', auditEntry);
        } else if (req.path.includes('/records') || req.path.includes('/access')) {
            // Always log record and access operations at info level
            logger.info('API Audit (SENSITIVE)', auditEntry);
        } else {
            logger.debug('API Audit', auditEntry);
        }
    });

    next();
}

module.exports = { auditLog };
