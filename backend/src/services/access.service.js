'use strict';

const fabricService = require('./fabric.service');
const logger = require('../utils/logger');

/**
 * Access Service — Handles consent management and access auditing
 */
class AccessService {
    /**
     * Grant access to a doctor or hospital
     */
    async grantAccess(patientId, doctorId, durationHours = 0, scope = 'ALL') {
        logger.info(`Granting access: Patient ${patientId} → Doctor ${doctorId} (Scope: ${scope})`);
        
        const result = await fabricService.grantAccess(patientId, doctorId, durationHours, scope);
        
        return {
            success: true,
            grantId: result.grantId || `GRANT-${Date.now()}`,
            patientId,
            doctorId,
            scope,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Revoke access from a doctor or hospital
     */
    async revokeAccess(patientId, doctorId) {
        logger.info(`Revoking access: Patient ${patientId} ↚ Doctor ${doctorId}`);
        
        await fabricService.revokeAccess(patientId, doctorId);
        
        return {
            success: true,
            patientId,
            doctorId,
            revokedAt: new Date().toISOString()
        };
    }

    /**
     * Check if a doctor has access to a patient's records
     */
    async checkAccess(patientId, doctorId) {
        return await fabricService.checkAccess(patientId, doctorId);
    }

    /**
     * Get access audit trail for a patient
     */
    async getAuditTrail(patientId) {
        // Calls the Audit contract on Fabric
        const logs = await fabricService.evaluateTransaction('AuditContract', 'GetAuditTrail', patientId);
        
        return {
            patientId,
            logs: logs || []
        };
    }
}

module.exports = new AccessService();
