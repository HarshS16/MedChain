'use strict';

/**
 * Access Grant model for on-chain consent tracking
 */
class AccessGrant {
    static VALID_SCOPES = ['ALL', 'READ_ONLY', 'CONSULTATION', 'PRESCRIPTION', 'LAB_REPORT', 'SURGERY', 'DIAGNOSIS'];

    /**
     * Create an AccessGrant instance
     * @param {string} grantId - Unique grant ID
     * @param {string} patientId - Patient granting access
     * @param {string} grantedTo - Doctor/Hospital receiving access
     * @param {string} grantedToType - 'doctor' or 'hospital'
     * @param {string} scope - Access scope
     * @param {string} expiresAt - ISO timestamp when access expires
     */
    constructor(grantId, patientId, grantedTo, grantedToType, scope = 'ALL', expiresAt = null) {
        this.docType = 'accessGrant';
        this.grantId = grantId;
        this.patientId = patientId;
        this.grantedTo = grantedTo;
        this.grantedToType = grantedToType;
        this.scope = scope;
        this.grantedAt = new Date().toISOString();
        this.expiresAt = expiresAt;
        this.revokedAt = null;
        this.isActive = true;
    }

    serialize() {
        return Buffer.from(JSON.stringify(this));
    }

    static deserialize(buffer) {
        const data = JSON.parse(buffer.toString());
        const grant = new AccessGrant(
            data.grantId, data.patientId, data.grantedTo,
            data.grantedToType, data.scope, data.expiresAt
        );
        Object.assign(grant, data);
        return grant;
    }

    /**
     * Check if grant is currently valid
     */
    isValid() {
        if (!this.isActive || this.revokedAt) return false;
        if (this.expiresAt && new Date(this.expiresAt) < new Date()) return false;
        return true;
    }

    /**
     * Revoke this access grant
     */
    revoke() {
        this.isActive = false;
        this.revokedAt = new Date().toISOString();
    }

    static validate(patientId, grantedTo, grantedToType, scope) {
        if (!patientId || !patientId.startsWith('PAT-')) {
            throw new Error('Invalid patient ID');
        }
        if (!grantedTo || (!grantedTo.startsWith('DOC-') && !grantedTo.startsWith('HOSP-'))) {
            throw new Error('Invalid grantee ID. Must start with DOC- or HOSP-');
        }
        if (!['doctor', 'hospital'].includes(grantedToType)) {
            throw new Error('grantedToType must be "doctor" or "hospital"');
        }
        if (scope && !AccessGrant.VALID_SCOPES.includes(scope)) {
            throw new Error(`Invalid scope: ${scope}`);
        }
    }
}

module.exports = AccessGrant;
