'use strict';

const logger = require('../utils/logger');

/**
 * Role-based access control middleware
 * Checks if authenticated user has the required role
 */
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'You must be logged in to access this resource.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            logger.warn(`Access denied: User ${req.user.id} (${req.user.role}) tried to access ${req.method} ${req.path}. Required roles: ${allowedRoles.join(', ')}`);
            return res.status(403).json({
                error: 'Forbidden',
                message: `This resource requires one of the following roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
            });
        }

        next();
    };
}

/**
 * Verify the user is accessing their own resource or is an admin
 * Used for patient-specific endpoints
 */
function requireSelfOrAdmin(paramName = 'patientId') {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const resourceId = req.params[paramName] || req.body[paramName];

        // Admin can access anything
        if (req.user.role === 'admin') {
            return next();
        }

        // Doctors can access if they have been granted access (checked in controller)
        if (req.user.role === 'doctor') {
            return next();
        }

        // Patients can only access their own data
        if (req.user.role === 'patient' && req.user.id !== resourceId) {
            logger.warn(`Patient ${req.user.id} tried to access patient ${resourceId}'s data`);
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only access your own records.'
            });
        }

        next();
    };
}

module.exports = { requireRole, requireSelfOrAdmin };
