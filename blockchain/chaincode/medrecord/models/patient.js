'use strict';

/**
 * Patient data model for on-chain storage
 */
class Patient {
    /**
     * Create a Patient instance
     * @param {string} patientId - Unique patient ID (PAT-uuid)
     * @param {string} abhaId - ABHA health ID (12-3456-7890-1234)
     * @param {string} publicKey - Patient's ECIES public key
     * @param {string} demographicsHash - SHA-256 hash of encrypted demographics
     */
    constructor(patientId, abhaId, publicKey, demographicsHash = '') {
        this.docType = 'patient';
        this.patientId = patientId;
        this.abhaId = abhaId;
        this.publicKey = publicKey;
        this.demographicsHash = demographicsHash;
        this.registeredAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
        this.isActive = true;
        this.activeAccessGrants = [];
    }

    /**
     * Serialize patient to JSON for ledger storage
     */
    serialize() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize from ledger buffer
     */
    static deserialize(buffer) {
        const data = JSON.parse(buffer.toString());
        const patient = new Patient(
            data.patientId,
            data.abhaId,
            data.publicKey,
            data.demographicsHash
        );
        Object.assign(patient, data);
        return patient;
    }

    /**
     * Validate patient data
     */
    static validate(patientId, abhaId, publicKey) {
        if (!patientId || !patientId.startsWith('PAT-')) {
            throw new Error('Invalid patient ID format. Must start with PAT-');
        }
        if (!abhaId || !/^\d{2}-\d{4}-\d{4}-\d{4}$/.test(abhaId)) {
            throw new Error('Invalid ABHA ID format. Expected: XX-XXXX-XXXX-XXXX');
        }
        if (!publicKey || publicKey.length < 10) {
            throw new Error('Invalid public key');
        }
    }
}

module.exports = Patient;
