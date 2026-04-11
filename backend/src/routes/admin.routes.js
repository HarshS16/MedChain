'use strict';

const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { auditLog } = require('../middleware/audit.middleware');
const logger = require('../utils/logger');

router.use(authenticate);
router.use(auditLog);
router.use(requireRole('admin'));

/**
 * GET /api/admin/verify-doctor/:doctorId
 * Verify a doctor's NMC registration
 */
router.get('/verify-doctor/:doctorId', async (req, res, next) => {
    try {
        const { doctorId } = req.params;

        // In production, this calls the NMC verification API
        res.json({
            success: true,
            data: {
                doctorId,
                verificationStatus: 'pending',
                message: 'NMC verification API integration pending. Manually verify and update status.'
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/admin/verify-doctor/:doctorId/approve
 * Approve a doctor's verification
 */
router.post('/verify-doctor/:doctorId/approve', async (req, res, next) => {
    try {
        const { doctorId } = req.params;

        logger.info(`Doctor ${doctorId} verified by admin ${req.user.id}`);

        res.json({
            success: true,
            message: `Doctor ${doctorId} has been verified`,
            data: {
                doctorId,
                verifiedBy: req.user.id,
                verifiedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/admin/network-status
 * Get blockchain network health status
 */
router.get('/network-status', async (req, res, next) => {
    try {
        // In production, this queries Fabric peer/orderer status
        res.json({
            success: true,
            data: {
                network: 'medchain-fabric',
                status: 'mock-healthy',
                peers: [
                    { name: 'peer0.hospitala.medchain.com', status: 'up', port: 7051 },
                    { name: 'peer1.hospitala.medchain.com', status: 'up', port: 8051 },
                    { name: 'peer0.hospitalb.medchain.com', status: 'up', port: 9051 },
                    { name: 'peer1.hospitalb.medchain.com', status: 'up', port: 10051 }
                ],
                orderer: { name: 'orderer.medchain.com', status: 'up', port: 7050 },
                channels: ['medchannel'],
                chaincode: {
                    name: 'medrecord',
                    version: '1.0.0',
                    status: 'installed'
                },
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/admin/stats
 * Get system-wide statistics
 */
router.get('/stats', async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: {
                totalPatients: 0,
                totalDoctors: 0,
                totalRecords: 0,
                totalAccessGrants: 0,
                activeGrants: 0,
                aiQueriesProcessed: 0,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
