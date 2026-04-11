'use strict';

const { Contract } = require('fabric-contract-api');
const Record = require('../models/record');

/**
 * RecordContract — Manages medical record metadata on the ledger
 * 
 * Actual medical data lives off-chain (IPFS). This contract handles:
 * - Record metadata storage (hash, IPFS CID, type, timestamps)
 * - Encrypted symmetric key management
 * - Record queries with access control
 */
class RecordContract extends Contract {
    constructor() {
        super('RecordContract');
    }

    /**
     * Create a new medical record entry on the ledger
     * @param {Context} ctx - Transaction context
     * @param {string} recordId - REC-uuid
     * @param {string} patientId - Patient this record belongs to
     * @param {string} doctorId - Doctor creating the record
     * @param {string} hospitalId - Hospital where record was created
     * @param {string} recordType - CONSULTATION, PRESCRIPTION, LAB_REPORT, etc.
     * @param {string} dataHash - SHA-256 hash of plaintext medical data
     * @param {string} ipfsCid - IPFS content identifier for encrypted data
     * @param {string} encryptedKeysJson - JSON string of {userId: encryptedSymKey}
     * @param {string} medicalCategoryJson - JSON array of medical categories
     * @param {string} tagsJson - JSON array of tags
     */
    async createRecord(ctx, recordId, patientId, doctorId, hospitalId, recordType, dataHash, ipfsCid, encryptedKeysJson, medicalCategoryJson, tagsJson) {
        // Validate input
        Record.validate(recordId, patientId, doctorId, recordType, dataHash, ipfsCid);

        // Check record doesn't already exist
        const existingRecord = await ctx.stub.getState(recordId);
        if (existingRecord && existingRecord.length > 0) {
            throw new Error(`Record ${recordId} already exists`);
        }

        // Verify patient exists
        const patientBuffer = await ctx.stub.getState(patientId);
        if (!patientBuffer || patientBuffer.length === 0) {
            throw new Error(`Patient ${patientId} not found. Register patient first.`);
        }

        // Parse JSON inputs
        const encryptedKeys = JSON.parse(encryptedKeysJson || '{}');
        const medicalCategory = JSON.parse(medicalCategoryJson || '[]');
        const tags = JSON.parse(tagsJson || '[]');

        // Create record
        const record = new Record(
            recordId, patientId, doctorId, hospitalId,
            recordType, dataHash, ipfsCid, encryptedKeys,
            medicalCategory, tags
        );

        // Store record
        await ctx.stub.putState(recordId, record.serialize());

        // Create composite keys for efficient queries
        // patient~record mapping
        const patientRecordKey = ctx.stub.createCompositeKey('patient~record', [patientId, recordId]);
        await ctx.stub.putState(patientRecordKey, Buffer.from('\u0000'));

        // patient~type~record mapping
        const patientTypeKey = ctx.stub.createCompositeKey('patient~type~record', [patientId, recordType, recordId]);
        await ctx.stub.putState(patientTypeKey, Buffer.from('\u0000'));

        // doctor~record mapping
        const doctorRecordKey = ctx.stub.createCompositeKey('doctor~record', [doctorId, recordId]);
        await ctx.stub.putState(doctorRecordKey, Buffer.from('\u0000'));

        // Emit event for AI ingestion pipeline
        ctx.stub.setEvent('RecordCreated', Buffer.from(JSON.stringify({
            recordId,
            patientId,
            doctorId,
            hospitalId,
            recordType,
            ipfsCid,
            timestamp: record.timestamp
        })));

        return JSON.stringify(record);
    }

    /**
     * Get a single record by ID (with access control check)
     * @param {string} requestorId - Doctor/Hospital requesting access
     */
    async getRecordById(ctx, recordId, requestorId) {
        const recordBuffer = await ctx.stub.getState(recordId);
        if (!recordBuffer || recordBuffer.length === 0) {
            throw new Error(`Record ${recordId} not found`);
        }

        const record = Record.deserialize(recordBuffer);

        // Access control: check if requestor has access
        const hasAccess = await this._checkAccess(ctx, record.patientId, requestorId);
        if (!hasAccess) {
            // Log unauthorized access attempt
            await this._logAuditEvent(ctx, record.patientId, requestorId, 'ACCESS_DENIED', recordId);
            throw new Error(`Access denied. ${requestorId} does not have access to patient ${record.patientId}'s records`);
        }

        // Log successful access
        await this._logAuditEvent(ctx, record.patientId, requestorId, 'VIEW', recordId);

        return JSON.stringify(record);
    }

    /**
     * Get all records for a patient (with access control)
     * @param {string} patientId - Patient whose records to retrieve
     * @param {string} requestorId - Who is requesting (doctor, or the patient themselves)
     * @param {string} recordType - Optional filter by record type
     */
    async getRecordsByPatient(ctx, patientId, requestorId, recordType = '') {
        // Check access
        const hasAccess = (requestorId === patientId) || await this._checkAccess(ctx, patientId, requestorId);
        if (!hasAccess) {
            await this._logAuditEvent(ctx, patientId, requestorId, 'ACCESS_DENIED', null);
            throw new Error(`Access denied. ${requestorId} does not have access to patient ${patientId}'s records`);
        }

        let iterator;
        if (recordType) {
            // Get records filtered by type
            iterator = await ctx.stub.getStateByPartialCompositeKey('patient~type~record', [patientId, recordType]);
        } else {
            // Get all records for patient
            iterator = await ctx.stub.getStateByPartialCompositeKey('patient~record', [patientId]);
        }

        const records = [];
        let result = await iterator.next();
        while (!result.done) {
            const compositeKeyParts = ctx.stub.splitCompositeKey(result.value.key);
            const recordId = compositeKeyParts.attributes[compositeKeyParts.attributes.length - 1];

            const recordBuffer = await ctx.stub.getState(recordId);
            if (recordBuffer && recordBuffer.length > 0) {
                records.push(JSON.parse(recordBuffer.toString()));
            }
            result = await iterator.next();
        }
        await iterator.close();

        // Sort by timestamp descending
        records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Log access
        await this._logAuditEvent(ctx, patientId, requestorId, 'VIEW_ALL', null);

        return JSON.stringify({
            patientId,
            records,
            count: records.length,
            accessedBy: requestorId,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Add encrypted key for a new authorized user (when access is granted)
     */
    async addEncryptedKey(ctx, recordId, userId, encryptedKey) {
        const recordBuffer = await ctx.stub.getState(recordId);
        if (!recordBuffer || recordBuffer.length === 0) {
            throw new Error(`Record ${recordId} not found`);
        }

        const record = Record.deserialize(recordBuffer);
        record.encryptedKeys[userId] = encryptedKey;
        record.updatedAt = new Date().toISOString();

        await ctx.stub.putState(recordId, record.serialize());

        return JSON.stringify({ success: true, recordId, userId });
    }

    /**
     * Remove encrypted key for a user (when access is revoked)
     */
    async removeEncryptedKey(ctx, recordId, userId) {
        const recordBuffer = await ctx.stub.getState(recordId);
        if (!recordBuffer || recordBuffer.length === 0) {
            throw new Error(`Record ${recordId} not found`);
        }

        const record = Record.deserialize(recordBuffer);
        delete record.encryptedKeys[userId];
        record.updatedAt = new Date().toISOString();

        await ctx.stub.putState(recordId, record.serialize());

        return JSON.stringify({ success: true, recordId, userId });
    }

    /**
     * Query records by CouchDB rich query
     */
    async queryRecords(ctx, queryString) {
        const iterator = await ctx.stub.getQueryResult(queryString);
        const results = [];

        let result = await iterator.next();
        while (!result.done) {
            results.push(JSON.parse(result.value.value.toString()));
            result = await iterator.next();
        }
        await iterator.close();

        return JSON.stringify(results);
    }

    /**
     * Get record count for a patient
     */
    async getRecordCount(ctx, patientId) {
        const iterator = await ctx.stub.getStateByPartialCompositeKey('patient~record', [patientId]);
        let count = 0;

        let result = await iterator.next();
        while (!result.done) {
            count++;
            result = await iterator.next();
        }
        await iterator.close();

        return JSON.stringify({ patientId, recordCount: count });
    }

    /**
     * Internal: Check if requestor has access to patient's records
     */
    async _checkAccess(ctx, patientId, requestorId) {
        // Query active access grants
        const queryString = JSON.stringify({
            selector: {
                docType: 'accessGrant',
                patientId: patientId,
                grantedTo: requestorId,
                isActive: true
            }
        });

        const iterator = await ctx.stub.getQueryResult(queryString);
        let result = await iterator.next();
        let hasAccess = false;

        while (!result.done) {
            const grant = JSON.parse(result.value.value.toString());
            // Check if grant hasn't expired
            if (!grant.expiresAt || new Date(grant.expiresAt) > new Date()) {
                hasAccess = true;
                break;
            }
            result = await iterator.next();
        }
        await iterator.close();

        return hasAccess;
    }

    /**
     * Internal: Log an audit event
     */
    async _logAuditEvent(ctx, patientId, accessorId, action, recordId) {
        const auditId = `AUDIT-${ctx.stub.getTxID().substring(0, 8)}-${Date.now()}`;
        const auditEntry = {
            docType: 'auditLog',
            auditId,
            patientId,
            accessorId,
            action,
            recordId,
            txId: ctx.stub.getTxID(),
            timestamp: new Date().toISOString()
        };

        await ctx.stub.putState(auditId, Buffer.from(JSON.stringify(auditEntry)));

        ctx.stub.setEvent('AuditLogCreated', Buffer.from(JSON.stringify(auditEntry)));
    }
}

module.exports = RecordContract;
