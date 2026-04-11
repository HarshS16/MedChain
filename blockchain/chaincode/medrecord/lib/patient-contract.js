'use strict';

const { Contract } = require('fabric-contract-api');
const Patient = require('../models/patient');

/**
 * PatientContract — Manages patient registration and identity on the ledger
 */
class PatientContract extends Contract {
    constructor() {
        super('PatientContract');
    }

    /**
     * Initialize the ledger (called once on chaincode instantiation)
     */
    async initLedger(ctx) {
        console.info('============= Initializing MedChain Patient Ledger =============');
        return { success: true, message: 'Patient ledger initialized' };
    }

    /**
     * Register a new patient on the ledger
     * @param {Context} ctx - Transaction context
     * @param {string} patientId - PAT-uuid
     * @param {string} abhaId - ABHA health ID
     * @param {string} publicKey - ECIES public key
     * @param {string} demographicsHash - SHA-256 hash of encrypted demographics
     */
    async registerPatient(ctx, patientId, abhaId, publicKey, demographicsHash) {
        // Validate input
        Patient.validate(patientId, abhaId, publicKey);

        // Check if patient already exists
        const existingPatient = await ctx.stub.getState(patientId);
        if (existingPatient && existingPatient.length > 0) {
            throw new Error(`Patient ${patientId} already exists`);
        }

        // Check ABHA uniqueness via composite key
        const abhaKey = ctx.stub.createCompositeKey('abha~patient', [abhaId]);
        const existingAbha = await ctx.stub.getState(abhaKey);
        if (existingAbha && existingAbha.length > 0) {
            throw new Error(`ABHA ID ${abhaId} is already registered`);
        }

        // Create patient
        const patient = new Patient(patientId, abhaId, publicKey, demographicsHash);

        // Store patient
        await ctx.stub.putState(patientId, patient.serialize());

        // Store ABHA → Patient mapping for reverse lookup
        await ctx.stub.putState(abhaKey, Buffer.from(patientId));

        // Emit event
        ctx.stub.setEvent('PatientRegistered', Buffer.from(JSON.stringify({
            patientId,
            abhaId,
            timestamp: patient.registeredAt
        })));

        return JSON.stringify(patient);
    }

    /**
     * Get patient by ID
     */
    async getPatient(ctx, patientId) {
        const patientBuffer = await ctx.stub.getState(patientId);
        if (!patientBuffer || patientBuffer.length === 0) {
            throw new Error(`Patient ${patientId} not found`);
        }
        return patientBuffer.toString();
    }

    /**
     * Get patient by ABHA ID
     */
    async getPatientByAbhaId(ctx, abhaId) {
        const abhaKey = ctx.stub.createCompositeKey('abha~patient', [abhaId]);
        const patientIdBuffer = await ctx.stub.getState(abhaKey);
        if (!patientIdBuffer || patientIdBuffer.length === 0) {
            throw new Error(`No patient found with ABHA ID ${abhaId}`);
        }

        const patientId = patientIdBuffer.toString();
        return this.getPatient(ctx, patientId);
    }

    /**
     * Update patient's public key (key rotation)
     */
    async updatePublicKey(ctx, patientId, newPublicKey) {
        const patientBuffer = await ctx.stub.getState(patientId);
        if (!patientBuffer || patientBuffer.length === 0) {
            throw new Error(`Patient ${patientId} not found`);
        }

        const patient = Patient.deserialize(patientBuffer);
        patient.publicKey = newPublicKey;
        patient.updatedAt = new Date().toISOString();

        await ctx.stub.putState(patientId, patient.serialize());

        ctx.stub.setEvent('PatientKeyUpdated', Buffer.from(JSON.stringify({
            patientId,
            timestamp: patient.updatedAt
        })));

        return JSON.stringify(patient);
    }

    /**
     * Deactivate patient (soft delete — records remain for audit)
     */
    async deactivatePatient(ctx, patientId) {
        const patientBuffer = await ctx.stub.getState(patientId);
        if (!patientBuffer || patientBuffer.length === 0) {
            throw new Error(`Patient ${patientId} not found`);
        }

        const patient = Patient.deserialize(patientBuffer);
        patient.isActive = false;
        patient.updatedAt = new Date().toISOString();

        await ctx.stub.putState(patientId, patient.serialize());

        ctx.stub.setEvent('PatientDeactivated', Buffer.from(JSON.stringify({
            patientId,
            timestamp: patient.updatedAt
        })));

        return JSON.stringify({ success: true, patientId });
    }

    /**
     * Check if a patient exists
     */
    async patientExists(ctx, patientId) {
        const buffer = await ctx.stub.getState(patientId);
        return JSON.stringify({ exists: buffer && buffer.length > 0 });
    }

    /**
     * Query all patients (admin only — uses CouchDB rich query)
     */
    async queryAllPatients(ctx, pageSize = '10', bookmark = '') {
        const queryString = JSON.stringify({
            selector: { docType: 'patient' },
            sort: [{ registeredAt: 'desc' }]
        });

        const { iterator, metadata } = await ctx.stub.getQueryResultWithPagination(
            queryString,
            parseInt(pageSize),
            bookmark
        );

        const results = [];
        let result = await iterator.next();
        while (!result.done) {
            const value = JSON.parse(result.value.value.toString());
            results.push(value);
            result = await iterator.next();
        }
        await iterator.close();

        return JSON.stringify({
            patients: results,
            count: results.length,
            bookmark: metadata.bookmark
        });
    }

    /**
     * Get patient history (all state changes)
     */
    async getPatientHistory(ctx, patientId) {
        const iterator = await ctx.stub.getHistoryForKey(patientId);
        const history = [];

        let result = await iterator.next();
        while (!result.done) {
            const entry = {
                txId: result.value.txId,
                timestamp: result.value.timestamp,
                isDelete: result.value.isDelete,
                value: result.value.value ? JSON.parse(result.value.value.toString()) : null
            };
            history.push(entry);
            result = await iterator.next();
        }
        await iterator.close();

        return JSON.stringify(history);
    }
}

module.exports = PatientContract;
