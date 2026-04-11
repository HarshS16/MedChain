'use strict';

const router = require('express').Router();
const authService = require('../services/auth.service');
const { validate, registerPatientSchema, registerDoctorSchema, loginSchema } = require('../utils/validators');
const { authenticate } = require('../middleware/auth.middleware');
const { auditLog } = require('../middleware/audit.middleware');
const logger = require('../utils/logger');

router.use(auditLog);

/**
 * POST /api/auth/register-patient
 * Register a new patient
 */
router.post('/register-patient', validate(registerPatientSchema), async (req, res, next) => {
    try {
        const result = await authService.registerPatient(req.validatedBody);

        res.status(201).json({
            success: true,
            message: 'Patient registered successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/register-doctor
 * Register a new doctor
 */
router.post('/register-doctor', validate(registerDoctorSchema), async (req, res, next) => {
    try {
        const result = await authService.registerDoctor(req.validatedBody);

        res.status(201).json({
            success: true,
            message: 'Doctor registered successfully. Verification pending.',
            data: result
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/login
 * Login with identifier (ABHA ID, NMC number, or email) + password
 */
router.post('/login', validate(loginSchema), async (req, res, next) => {
    try {
        const { identifier, password, role } = req.validatedBody;
        const result = await authService.login(identifier, password, role);

        res.json({
            success: true,
            message: 'Login successful',
            data: result
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req, res, next) => {
    try {
        const user = await authService.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/verify-otp
 * Verify OTP for login (placeholder for ABDM OTP integration)
 */
router.post('/verify-otp', async (req, res, next) => {
    try {
        const { phone, otp } = req.body;

        // Placeholder — in production, verify against ABDM/SMS OTP service
        if (otp === '123456') {
            res.json({
                success: true,
                message: 'OTP verified successfully',
                data: { verified: true }
            });
        } else {
            res.status(400).json({
                error: 'Invalid OTP',
                message: 'The OTP you entered is incorrect.'
            });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;
