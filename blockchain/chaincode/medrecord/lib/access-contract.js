'use strict';

const { Contract } = require('fabric-contract-api');
const AccessGrant = require('../models/access-grant');

/**
 * AccessContract — Manages patient consent and access control on the ledger
 * 
 * Flow:
 * 1. Patient grants access → smart contract logs consent with timestamp + expiry
 * 2. Doctor's certificate verified against Fabric CA
 * 3. Encrypted symmetric key shared with authorized doctor
 * 4. All access immutably logged on-chain
 */
class AccessContract extends Contract {
    constructor() {
        super('AccessContract');
    }

    /**
     * Patient grants access to a doctor or hospital
     * @param {string} grantId - Unique grant ID (GRANT-uuid)
     * @param {string} patientId - Patient granting access
     * @param {string} grantedTo - Doctor or Hospital ID receiving access
     * @param {string} grantedToType - 'doctor' or 'hospital'
     * @param {string} scope - Access scope (ALL, READ_ONLY, specific types)
     * @param {string} durationHours - How many hours access lasts (0 = indefinite)
     */
    async grantAccess(ctx, grantId, patientId, grantedTo, grantedToType, scope = 'ALL', durationHours = '0') {
        // Validate
        AccessGrant.validate(patientId, grantedTo, grantedToType, scope);

        // Verify patient exists
        const patientBuffer = await ctx.stub.getState(patientId);
        if (!patientBuffer || patientBuffer.length === 0) {
            throw new Error(`Patient ${patientId} not found`);
        }

        // Check for existing active grant (prevent duplicates)
        const existingGrant = await this._findActiveGrant(ctx, patientId, grantedTo);
        if (existingGrant) {
            throw new Error(`Active access grant already exists for ${grantedTo} on patient ${patientId}. Revoke first to create a new one.`);
        }

        // Calculate expiry
        const hours = parseInt(durationHours);
        let expiresAt = null;
        if (hours > 0) {
            expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
        }

        // Create grant
        const grant = new AccessGrant(grantId, patientId, grantedTo, grantedToType, scope, expiresAt);

        // Store grant
        await ctx.stub.putState(grantId, grant.serialize());

        // Composite keys for efficient queries
        const patientGrantKey = ctx.stub.createCompositeKey('patient~grant', [patientId, grantId]);
        await ctx.stub.putState(patientGrantKey, Buffer.from('\u0000'));

        const granteeKey = ctx.stub.createCompositeKey('grantee~grant', [grantedTo, grantId]);
        await ctx.stub.putState(granteeKey, Buffer.from('\u0000'));

        // Update patient record with the active grant
        const patient = JSON.parse(patientBuffer.toString());
        if (!patient.activeAccessGrants) {
            patient.activeAccessGrants = [];
        }
        patient.activeAccessGrants.push({
            grantId,
            grantedTo,
            scope,
            expiresAt
        });
        patient.updatedAt = new Date().toISOString();
        await ctx.stub.putState(patientId, Buffer.from(JSON.stringify(patient)));

        // Emit event
        ctx.stub.setEvent('AccessGranted', Buffer.from(JSON.stringify({
            grantId,
            patientId,
            grantedTo,
            grantedToType,
            scope,
            expiresAt,
            timestamp: grant.grantedAt
        })));

        return JSON.stringify(grant);
    }

    /**
     * Patient or admin revokes access
     */
    async revokeAccess(ctx, patientId, grantedTo) {
        // Find active grant
        const activeGrant = await this._findActiveGrant(ctx, patientId, grantedTo);
        if (!activeGrant) {
            throw new Error(`No active access grant found for ${grantedTo} on patient ${patientId}`);
        }

        // Revoke
        activeGrant.revoke();
        await ctx.stub.putState(activeGrant.grantId, activeGrant.serialize());

        // Update patient record — remove from active grants
        const patientBuffer = await ctx.stub.getState(patientId);
        if (patientBuffer && patientBuffer.length > 0) {
            const patient = JSON.parse(patientBuffer.toString());
            patient.activeAccessGrants = (patient.activeAccessGrants || [])
                .filter(g => g.grantedTo !== grantedTo);
            patient.updatedAt = new Date().toISOString();
            await ctx.stub.putState(patientId, Buffer.from(JSON.stringify(patient)));
        }

        // Emit event
        ctx.stub.setEvent('AccessRevoked', Buffer.from(JSON.stringify({
            grantId: activeGrant.grantId,
            patientId,
            revokedFrom: grantedTo,
            timestamp: activeGrant.revokedAt
        })));

        return JSON.stringify({
            success: true,
            grantId: activeGrant.grantId,
            revokedAt: activeGrant.revokedAt
        });
    }

    /**
     * Check if a user has access to a patient's records
     */
    async checkAccess(ctx, patientId, requestorId) {
        // Patient always has access to own records
        if (patientId === requestorId) {
            return JSON.stringify({ hasAccess: true, reason: 'self' });
        }

        const activeGrant = await this._findActiveGrant(ctx, patientId, requestorId);
        if (activeGrant && activeGrant.isValid()) {
            return JSON.stringify({
                hasAccess: true,
                grantId: activeGrant.grantId,
                scope: activeGrant.scope,
                expiresAt: activeGrant.expiresAt
            });
        }

        return JSON.stringify({ hasAccess: false });
    }

    /**
     * Get all access grants for a patient (active and revoked)
     */
    async getPatientGrants(ctx, patientId) {
        const iterator = await ctx.stub.getStateByPartialCompositeKey('patient~grant', [patientId]);
        const grants = [];

        let result = await iterator.next();
        while (!result.done) {
            const parts = ctx.stub.splitCompositeKey(result.value.key);
            const grantId = parts.attributes[1];

            const grantBuffer = await ctx.stub.getState(grantId);
            if (grantBuffer && grantBuffer.length > 0) {
                grants.push(JSON.parse(grantBuffer.toString()));
            }
            result = await iterator.next();
        }
        await iterator.close();

        // Separate active and revoked
        const active = grants.filter(g => g.isActive && (!g.expiresAt || new Date(g.expiresAt) > new Date()));
        const revoked = grants.filter(g => !g.isActive || (g.expiresAt && new Date(g.expiresAt) <= new Date()));

        return JSON.stringify({
            patientId,
            active,
            revoked,
            totalGrants: grants.length
        });
    }

    /**
     * Get all patients a doctor has access to
     */
    async getDoctorAccess(ctx, doctorId) {
        const iterator = await ctx.stub.getStateByPartialCompositeKey('grantee~grant', [doctorId]);
        const grants = [];

        let result = await iterator.next();
        while (!result.done) {
            const parts = ctx.stub.splitCompositeKey(result.value.key);
            const grantId = parts.attributes[1];

            const grantBuffer = await ctx.stub.getState(grantId);
            if (grantBuffer && grantBuffer.length > 0) {
                const grant = JSON.parse(grantBuffer.toString());
                if (grant.isActive && (!grant.expiresAt || new Date(grant.expiresAt) > new Date())) {
                    grants.push(grant);
                }
            }
            result = await iterator.next();
        }
        await iterator.close();

        return JSON.stringify({
            doctorId,
            activeGrants: grants,
            patientCount: grants.length
        });
    }

    /**
     * Grant emergency access (time-limited, logged differently)
     */
    async grantEmergencyAccess(ctx, grantId, patientId, emergencyDoctorId, hospitalId) {
        const emergencyDurationHours = '24'; // 24-hour emergency access

        const grant = await this.grantAccess(
            ctx, grantId, patientId, emergencyDoctorId,
            'doctor', 'ALL', emergencyDurationHours
        );

        // Additional emergency event
        ctx.stub.setEvent('EmergencyAccessGranted', Buffer.from(JSON.stringify({
            grantId,
            patientId,
            emergencyDoctorId,
            hospitalId,
            expiresIn: '24 hours',
            timestamp: new Date().toISOString()
        })));

        return grant;
    }

    /**
     * Internal: Find active grant between patient and grantee
     */
    async _findActiveGrant(ctx, patientId, grantedTo) {
        const queryString = JSON.stringify({
            selector: {
                docType: 'accessGrant',
                patientId: patientId,
                grantedTo: grantedTo,
                isActive: true
            }
        });

        const iterator = await ctx.stub.getQueryResult(queryString);
        let result = await iterator.next();

        while (!result.done) {
            const grant = AccessGrant.deserialize(result.value.value);
            if (grant.isValid()) {
                await iterator.close();
                return grant;
            }
            result = await iterator.next();
        }
        await iterator.close();

        return null;
    }
}

module.exports = AccessContract;
