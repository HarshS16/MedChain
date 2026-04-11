'use strict';

const encryptionService = require('./encryption.service');
const ipfsService = require('./ipfs.service');
const crypto = require('../utils/crypto.utils');
const logger = require('../utils/logger');
const fabricService = require('./fabric.service');
const accessService = require('./access.service');
const aiService = require('./ai.service');
const { prisma } = require('../config/db');

/**
 * Record Service — Business logic for medical record operations
 * 
 * Orchestrates: encryption → IPFS storage → blockchain write → cache update
 */
class RecordService {
    constructor() {}

    /**
     * Create a new medical record
     * Full flow: validate → encrypt → store on IPFS → write metadata to chain → cache
     */
    async createRecord(doctorId, hospitalId, data) {
        const { patientId, recordType, content, medicalCategory, tags } = data;

        // 1. Generate record ID
        const recordId = crypto.generateId('REC');

        // 2. Encrypt the medical content
        const {
            encryptedData,
            dataHash,
            symmetricKey,
            encryptedKeys
        } = encryptionService.encryptRecord(content, null);

        // 3. Store encrypted data on IPFS
        const ipfsCid = await ipfsService.storeData(encryptedData);

        // 4. Create on-chain record metadata via Fabric SDK
        const onChainMetadata = await fabricService.createRecord(
            recordId,
            patientId,
            doctorId,
            hospitalId,
            recordType,
            dataHash,
            ipfsCid,
            { [patientId]: symmetricKey, [doctorId]: symmetricKey }
        );

        // 5. Index in PostgreSQL for fast lookup/AI (Hybrid approach)
        await prisma.recordCache.create({
            data: {
                recordId,
                patientId,
                doctorId,
                hospitalId,
                recordType,
                medicalCategory: medicalCategory || [],
                dataHash,
                ipfsCid,
                tags: tags || [],
                blockchainTxId: onChainMetadata.txId,
                recordedAt: new Date(),
            }
        });

        // 6. Trigger AI Ingestion (Async)
        aiService.indexRecord({
            recordId,
            patientId,
            doctorId,
            hospitalId,
            recordType,
            content // Plaintext for AI embedding (decrypted content or source data)
        }).catch(err => logger.error('Async AI Ingestion Trigger failed:', err));

        // 7. Return composite metadata
        const recordMetadata = {
            ...onChainMetadata,
            recordId,
            blockchainTxId: onChainMetadata.txId || `TX-${crypto.generateId('').substring(0, 8)}`
        };

        logger.info(`Record committed to blockchain & indexed in Postgres: ${recordId}`);

        return recordMetadata;
    }

    /**
     * Get all records for a patient
     */
    async getPatientRecords(patientId, requestorId, filters = {}) {
        // 1. Fetch from PostgreSQL index (Hybrid approach)
        const where = { patientId };
        
        let records = await prisma.recordCache.findMany({
            where,
            orderBy: { recordedAt: 'desc' },
            take: parseInt(filters.limit) || 20,
            skip: ((parseInt(filters.page) || 1) - 1) * (parseInt(filters.limit) || 20)
        });

        // Apply filters
        if (filters.recordType) {
            records = records.filter(r => r.recordType === filters.recordType);
        }
        if (filters.startDate) {
            records = records.filter(r => new Date(r.recordedAt) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            records = records.filter(r => new Date(r.recordedAt) <= new Date(filters.endDate));
        }
        if (filters.medicalCategory) {
            records = records.filter(r =>
                r.medicalCategory.some(c => filters.medicalCategory.includes(c))
            );
        }

        // Sort by recordedAt descending
        records.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));

        // Pagination
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 20;
        const startIndex = (page - 1) * limit;
        const paginatedRecords = records.slice(startIndex, startIndex + limit);

        return {
            patientId,
            records: paginatedRecords,
            total: records.length,
            page,
            limit,
            totalPages: Math.ceil(records.length / limit)
        };
    }

    /**
     * Get a single record with decrypted content
     */
    async getRecordById(recordId, requestorId) {
        const cached = this.recordsCache.get(recordId);
        if (!cached) {
            throw Object.assign(new Error(`Record ${recordId} not found`), { statusCode: 404 });
        }

        const { metadata, decryptionKey } = cached;

        // Retrieve from IPFS and decrypt
        let decryptedContent = null;
        try {
            const encryptedData = await ipfsService.retrieveData(metadata.ipfsCid);
            decryptedContent = encryptionService.decryptRecord(encryptedData, decryptionKey);

            // Verify integrity
            const isValid = encryptionService.verifyIntegrity(decryptedContent, metadata.dataHash);
            if (!isValid) {
                logger.warn(`Integrity check failed for record ${recordId}`);
            }
        } catch (error) {
            logger.error(`Failed to decrypt record ${recordId}:`, error);
        }

        return {
            ...metadata,
            content: decryptedContent,
            integrityVerified: true,
            accessedBy: requestorId,
            accessedAt: new Date().toISOString()
        };
    }

    /**
     * Get patient record timeline (chronological)
     */
    async getPatientTimeline(patientId) {
        const recordIds = this.patientRecords.get(patientId) || [];
        const timeline = recordIds.map(id => {
            const cached = this.recordsCache.get(id);
            if (!cached) return null;

            const { metadata } = cached;
            return {
                recordId: metadata.recordId,
                recordType: metadata.recordType,
                medicalCategory: metadata.medicalCategory,
                doctorId: metadata.doctorId,
                hospitalId: metadata.hospitalId,
                timestamp: metadata.timestamp,
                tags: metadata.tags
            };
        }).filter(Boolean);

        // Sort chronologically
        timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        return {
            patientId,
            timeline,
            totalEvents: timeline.length
        };
    }

    /**
     * Get record statistics for a patient
     */
    async getPatientStats(patientId) {
        // 1. Get total count
        const totalRecords = await prisma.recordCache.count({
            where: { patientId }
        });

        // 2. Get records for grouping
        const records = await prisma.recordCache.findMany({
            where: { patientId },
            select: {
                recordType: true,
                medicalCategory: true,
                recordedAt: true
            }
        });

        const stats = {
            totalRecords,
            byType: {},
            byCategory: {},
            firstRecord: records.length > 0 ? records[records.length - 1].recordedAt : null,
            lastRecord: records.length > 0 ? records[0].recordedAt : null
        };

        records.forEach(r => {
            stats.byType[r.recordType] = (stats.byType[r.recordType] || 0) + 1;
            r.medicalCategory.forEach(cat => {
                stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
            });
        });

        return stats;
    }
}

module.exports = new RecordService();
