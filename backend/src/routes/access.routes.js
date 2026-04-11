'use strict';

const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { auditLog } = require('../middleware/audit.middleware');
const { validate, grantAccessSchema, revokeAccessSchema } = require('../utils/validators');
const accessService = require('../services/access.service');

router.use(authenticate);
router.use(auditLog);

/**
 * POST /api/access/grant
 * Patient grants access to a doctor/hospital
 */
router.post('/grant', requireRole('patient', 'admin'), validate(grantAccessSchema), async (req, res, next) => {
    try {
        const { patientId, grantedTo, grantedToType, scope, durationHours } = req.validatedBody;

        // Verify the requester is the patient (or admin)
        if (req.user.role === 'patient' && req.user.id !== patientId) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only grant access to your own records'
            });
        }

        const result = await accessService.grantAccess(
            patientId, 
            grantedTo, 
            durationHours || 0, 
            scope || 'ALL'
        );

        res.status(201).json({
            success: true,
            message: 'Access granted successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/access/revoke
 * Patient revokes access from a doctor/hospital
 */
router.post('/revoke', requireRole('patient', 'admin'), validate(revokeAccessSchema), async (req, res, next) => {
    try {
        const { patientId, revokeFrom } = req.validatedBody;

        if (req.user.role === 'patient' && req.user.id !== patientId) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only revoke access from your own records'
            });
        }

        const result = await accessService.revokeAccess(patientId, revokeFrom);

        res.json({
            success: true,
            message: 'Access revoked successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/access/check/:patientId/:requestorId
 * Check if a requestor has access to a patient's records
 */
router.get('/check/:patientId/:requestorId', async (req, res, next) => {
    try {
        const { patientId, requestorId } = req.params;

        // Self-access always allowed
        if (patientId === requestorId) {
            return res.json({
                success: true,
                data: { hasAccess: true, reason: 'self' }
            });
        }

        const hasAccess = await accessService.checkAccess(patientId, requestorId);

        res.json({
            success: true,
            data: { hasAccess }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/access/audit/:patientId
 * Get access audit trail for a patient
 */
router.get('/audit/:patientId', async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const audit = await accessService.getAuditTrail(patientId);

        res.json({
            success: true,
            data: audit
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/access/my-grants
 * Get all active access grants for the current user
 */
router.get('/my-grants', async (req, res, next) => {
    try {
        const { prisma } = require('../config/db');
        
        let grants;
        if (req.user.role === 'patient') {
            grants = await prisma.accessGrant.findMany({
                where: { patientId: req.user.id, isActive: true }
            });
        } else if (req.user.role === 'doctor') {
            grants = await prisma.accessGrant.findMany({
                where: { grantedTo: req.user.id, isActive: true }
            });
        } else {
            grants = [];
        }

        res.json({
            success: true,
            data: { grants, count: grants.length }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

