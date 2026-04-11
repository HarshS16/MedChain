'use strict';

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'medchain-dev-secret-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

/**
 * JWT Authentication Middleware
 * Verifies bearer token and attaches user info to req.user
 */
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Authentication required',
            message: 'Missing or invalid Authorization header. Expected: Bearer <token>'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if token is about to expire (warn if < 1 hour)
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        if (expiresIn < 3600) {
            res.set('X-Token-Expiring-Soon', 'true');
        }

        req.user = {
            id: decoded.id,
            role: decoded.role,      // 'patient', 'doctor', 'admin'
            orgId: decoded.orgId,    // Hospital org ID
            name: decoded.name,
            email: decoded.email,
            fabricIdentity: decoded.fabricIdentity // Fabric certificate identity
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired',
                message: 'Your session has expired. Please log in again.'
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token',
                message: 'The provided token is invalid.'
            });
        }

        logger.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Authentication error' });
    }
}

/**
 * Generate JWT token
 */
function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Optional auth — doesn't fail if no token, but attaches user if present
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    try {
        const token = authHeader.split(' ')[1];
        req.user = jwt.verify(token, JWT_SECRET);
    } catch (e) {
        // Silently continue without auth
    }
    next();
}

module.exports = { authenticate, generateToken, optionalAuth, JWT_SECRET };
