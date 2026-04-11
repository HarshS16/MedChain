'use strict';

/**
 * Medical Record metadata model for on-chain storage
 * Actual medical content is stored off-chain (IPFS), only metadata lives on ledger
 */
class Record {
    static VALID_TYPES = [
        'CONSULTATION',
        'PRESCRIPTION',
        'LAB_REPORT',
        'SURGERY',
        'DIAGNOSIS',
        'IMAGING',
        'VACCINATION',
        'ALLERGY',
        'FAMILY_HISTORY'
    ];

    /**
     * Create a Record metadata instance
     * @param {string} recordId - Unique record ID (REC-uuid)
     * @param {string} patientId - Patient ID this record belongs to
     * @param {string} doctorId - Doctor who created the record
     * @param {string} hospitalId - Hospital where record was created
     * @param {string} recordType - Type of medical record
     * @param {string} dataHash - SHA-256 hash of plaintext content
     * @param {string} ipfsCid - IPFS content identifier for encrypted data
     * @param {Object} encryptedKeys - Map of userId → encrypted symmetric key
     * @param {string[]} medicalCategory - Medical categories
     * @param {string[]} tags - Searchable tags
     */
    constructor(recordId, patientId, doctorId, hospitalId, recordType, dataHash, ipfsCid, encryptedKeys = {}, medicalCategory = [], tags = []) {
        this.docType = 'medicalRecord';
        this.recordId = recordId;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.hospitalId = hospitalId;
        this.recordType = recordType;
        this.dataHash = dataHash;
        this.ipfsCid = ipfsCid;
        this.encryptedKeys = encryptedKeys;
        this.medicalCategory = medicalCategory;
        this.tags = tags;
        this.timestamp = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    serialize() {
        return Buffer.from(JSON.stringify(this));
    }

    static deserialize(buffer) {
        const data = JSON.parse(buffer.toString());
        const record = new Record(
            data.recordId, data.patientId, data.doctorId,
            data.hospitalId, data.recordType, data.dataHash,
            data.ipfsCid, data.encryptedKeys, data.medicalCategory, data.tags
        );
        Object.assign(record, data);
        return record;
    }

    static validate(recordId, patientId, doctorId, recordType, dataHash, ipfsCid) {
        if (!recordId || !recordId.startsWith('REC-')) {
            throw new Error('Invalid record ID format. Must start with REC-');
        }
        if (!patientId || !patientId.startsWith('PAT-')) {
            throw new Error('Invalid patient ID format');
        }
        if (!doctorId || !doctorId.startsWith('DOC-')) {
            throw new Error('Invalid doctor ID format');
        }
        if (!Record.VALID_TYPES.includes(recordType)) {
            throw new Error(`Invalid record type: ${recordType}. Must be one of: ${Record.VALID_TYPES.join(', ')}`);
        }
        if (!dataHash || dataHash.length !== 64) {
            throw new Error('Invalid data hash. Must be SHA-256 (64 chars)');
        }
        if (!ipfsCid || !ipfsCid.startsWith('Qm')) {
            throw new Error('Invalid IPFS CID format');
        }
    }
}

module.exports = Record;
