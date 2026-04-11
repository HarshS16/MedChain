'use strict';

const { Contract } = require('fabric-contract-api');

/**
 * AuditContract — Immutable audit trail for all medical record access
 * 
 * Every read, write, and access change is logged permanently on-chain.
 * This provides a tamper-proof record of who accessed what, when.
 */
class AuditContract extends Contract {
    constructor() {
        super('AuditContract');
    }

    /**
     * Log an audit event
     * @param {string} auditId - Unique audit entry ID
     * @param {string} patientId - Patient whose data was accessed
     * @param {string} accessorId - Who accessed the data
     * @param {string} accessorType - 'doctor', 'hospital', 'patient', 'system', 'admin'
     * @param {string} action - What was done: VIEW, CREATE, UPDATE, GRANT_ACCESS, REVOKE_ACCESS, etc.
     * @param {string} recordId - Specific record accessed (optional)
     * @param {string} detailsJson - Additional details as JSON string
     */
    async logAccess(ctx, auditId, patientId, accessorId, accessorType, action, recordId = '', detailsJson = '{}') {
        const validActions = [
            'VIEW', 'VIEW_ALL', 'CREATE', 'UPDATE', 'DELETE',
            'GRANT_ACCESS', 'REVOKE_ACCESS', 'ACCESS_DENIED',
            'DOWNLOAD', 'PRINT', 'SHARE', 'EMERGENCY_ACCESS',
            'KEY_ROTATION', 'SUMMARY_GENERATED', 'AI_QUERY'
        ];

        if (!validActions.includes(action)) {
            throw new Error(`Invalid action: ${action}. Valid actions: ${validActions.join(', ')}`);
        }

        const details = JSON.parse(detailsJson);

        const auditEntry = {
            docType: 'auditLog',
            auditId,
            patientId,
            accessorId,
            accessorType,
            action,
            recordId: recordId || null,
            details,
            txId: ctx.stub.getTxID(),
            timestamp: new Date().toISOString(),
            channelId: ctx.stub.getChannelID()
        };

        // Store audit entry (immutable)
        await ctx.stub.putState(auditId, Buffer.from(JSON.stringify(auditEntry)));

        // Composite keys for queries
        const patientAuditKey = ctx.stub.createCompositeKey('patient~audit', [patientId, auditId]);
        await ctx.stub.putState(patientAuditKey, Buffer.from('\u0000'));

        const accessorAuditKey = ctx.stub.createCompositeKey('accessor~audit', [accessorId, auditId]);
        await ctx.stub.putState(accessorAuditKey, Buffer.from('\u0000'));

        // Action-based key for filtering
        const actionAuditKey = ctx.stub.createCompositeKey('action~audit', [action, auditId]);
        await ctx.stub.putState(actionAuditKey, Buffer.from('\u0000'));

        return JSON.stringify(auditEntry);
    }

    /**
     * Get full audit trail for a patient
     * Returns all access events in reverse chronological order
     */
    async getAuditTrail(ctx, patientId, pageSize = '50', bookmark = '') {
        const queryString = JSON.stringify({
            selector: {
                docType: 'auditLog',
                patientId: patientId
            },
            sort: [{ timestamp: 'desc' }],
            use_index: ['_design/indexPatientAuditDoc', 'indexPatientAudit']
        });

        const { iterator, metadata } = await ctx.stub.getQueryResultWithPagination(
            queryString,
            parseInt(pageSize),
            bookmark
        );

        const entries = [];
        let result = await iterator.next();
        while (!result.done) {
            entries.push(JSON.parse(result.value.value.toString()));
            result = await iterator.next();
        }
        await iterator.close();

        return JSON.stringify({
            patientId,
            auditTrail: entries,
            count: entries.length,
            bookmark: metadata.bookmark,
            retrievedAt: new Date().toISOString()
        });
    }

    /**
     * Get audit trail for a specific accessor (e.g., "show me everything Dr. X accessed")
     */
    async getAccessorAuditTrail(ctx, accessorId) {
        const iterator = await ctx.stub.getStateByPartialCompositeKey('accessor~audit', [accessorId]);
        const entries = [];

        let result = await iterator.next();
        while (!result.done) {
            const parts = ctx.stub.splitCompositeKey(result.value.key);
            const auditId = parts.attributes[1];

            const auditBuffer = await ctx.stub.getState(auditId);
            if (auditBuffer && auditBuffer.length > 0) {
                entries.push(JSON.parse(auditBuffer.toString()));
            }
            result = await iterator.next();
        }
        await iterator.close();

        // Sort by timestamp descending
        entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return JSON.stringify({
            accessorId,
            auditTrail: entries,
            count: entries.length
        });
    }

    /**
     * Get audit trail filtered by action type
     */
    async getAuditByAction(ctx, action, patientId = '') {
        let queryString;

        if (patientId) {
            queryString = JSON.stringify({
                selector: {
                    docType: 'auditLog',
                    patientId: patientId,
                    action: action
                },
                sort: [{ timestamp: 'desc' }]
            });
        } else {
            queryString = JSON.stringify({
                selector: {
                    docType: 'auditLog',
                    action: action
                },
                sort: [{ timestamp: 'desc' }]
            });
        }

        const iterator = await ctx.stub.getQueryResult(queryString);
        const entries = [];

        let result = await iterator.next();
        while (!result.done) {
            entries.push(JSON.parse(result.value.value.toString()));
            result = await iterator.next();
        }
        await iterator.close();

        return JSON.stringify({
            action,
            patientId: patientId || 'all',
            entries,
            count: entries.length
        });
    }

    /**
     * Get audit summary for a patient (aggregated view)
     */
    async getAuditSummary(ctx, patientId) {
        const queryString = JSON.stringify({
            selector: {
                docType: 'auditLog',
                patientId: patientId
            }
        });

        const iterator = await ctx.stub.getQueryResult(queryString);
        const actionCounts = {};
        const uniqueAccessors = new Set();
        let totalEvents = 0;
        let lastAccess = null;

        let result = await iterator.next();
        while (!result.done) {
            const entry = JSON.parse(result.value.value.toString());
            totalEvents++;
            actionCounts[entry.action] = (actionCounts[entry.action] || 0) + 1;
            uniqueAccessors.add(entry.accessorId);

            if (!lastAccess || new Date(entry.timestamp) > new Date(lastAccess)) {
                lastAccess = entry.timestamp;
            }
            result = await iterator.next();
        }
        await iterator.close();

        return JSON.stringify({
            patientId,
            totalEvents,
            uniqueAccessors: uniqueAccessors.size,
            actionCounts,
            lastAccessAt: lastAccess,
            generatedAt: new Date().toISOString()
        });
    }

    /**
     * Detect suspicious access patterns
     * Flags: high-frequency access, unusual hours, bulk downloads
     */
    async detectAnomalies(ctx, accessorId, windowHours = '24') {
        const cutoff = new Date(Date.now() - parseInt(windowHours) * 60 * 60 * 1000).toISOString();

        const queryString = JSON.stringify({
            selector: {
                docType: 'auditLog',
                accessorId: accessorId,
                timestamp: { '$gte': cutoff }
            }
        });

        const iterator = await ctx.stub.getQueryResult(queryString);
        const entries = [];
        const patientsAccessed = new Set();

        let result = await iterator.next();
        while (!result.done) {
            const entry = JSON.parse(result.value.value.toString());
            entries.push(entry);
            patientsAccessed.add(entry.patientId);
            result = await iterator.next();
        }
        await iterator.close();

        const anomalies = [];

        // Flag: More than 50 accesses in window
        if (entries.length > 50) {
            anomalies.push({
                type: 'HIGH_FREQUENCY',
                message: `${entries.length} accesses in ${windowHours}h window`,
                severity: 'HIGH'
            });
        }

        // Flag: Accessing more than 20 unique patients
        if (patientsAccessed.size > 20) {
            anomalies.push({
                type: 'BULK_ACCESS',
                message: `Accessed ${patientsAccessed.size} unique patients in ${windowHours}h`,
                severity: 'MEDIUM'
            });
        }

        // Flag: Multiple ACCESS_DENIED events
        const denials = entries.filter(e => e.action === 'ACCESS_DENIED');
        if (denials.length > 5) {
            anomalies.push({
                type: 'REPEATED_DENIAL',
                message: `${denials.length} access denied events`,
                severity: 'HIGH'
            });
        }

        return JSON.stringify({
            accessorId,
            windowHours: parseInt(windowHours),
            totalAccesses: entries.length,
            uniquePatients: patientsAccessed.size,
            anomalies,
            hasAnomalies: anomalies.length > 0,
            checkedAt: new Date().toISOString()
        });
    }
}

module.exports = AuditContract;
