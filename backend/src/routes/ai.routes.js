'use strict';

const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { auditLog } = require('../middleware/audit.middleware');
const { validate, aiQuerySchema } = require('../utils/validators');
const logger = require('../utils/logger');

router.use(authenticate);
router.use(auditLog);

/**
 * GET /api/ai/summary/:patientId
 * Get AI-generated patient summary (Level 0/1/2)
 */
router.get('/summary/:patientId', requireRole('doctor', 'admin'), async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const level = parseInt(req.query.level) || 0;

        // In production, this calls the AI service
        // For MVP, return mock summary
        const mockSummaries = {
            0: `Patient ${patientId} — Summary not yet generated. AI service integration pending.`,
            1: {
                conditions: [
                    {
                        name: 'Summary Generation Pending',
                        status: 'AI service not yet connected',
                        details: 'Connect AI service to generate condition-wise breakdowns'
                    }
                ]
            },
            2: {
                timeline: [
                    {
                        date: new Date().toISOString(),
                        event: 'Patient registered in system',
                        type: 'SYSTEM'
                    }
                ]
            }
        };

        res.json({
            success: true,
            data: {
                patientId,
                level,
                summary: mockSummaries[level] || mockSummaries[0],
                generatedAt: new Date().toISOString(),
                isStale: false,
                model: 'pending-ai-integration'
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/ai/query
 * Doctor asks a natural language question about patient history
 */
router.post('/query', requireRole('doctor', 'admin'), validate(aiQuerySchema), async (req, res, next) => {
    try {
        const { patientId, query, filters } = req.validatedBody;

        logger.info(`AI Query: "${query}" for patient ${patientId} by ${req.user.id}`);

        // In production, this calls the AI FastAPI service
        // For MVP, return a helpful placeholder
        const response = {
            patientId,
            query,
            answer: `AI query processing is pending integration with the AI service.\n\nQuery received: "${query}"\n\nOnce the AI pipeline is connected, this will:\n1. Search the vector store for relevant medical records\n2. Use RAG to generate an evidence-based answer\n3. Include citations linking to specific records`,
            citations: [],
            confidence: 0,
            model: 'pending-integration',
            processingTime: '0ms'
        };

        res.json({
            success: true,
            data: response
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/ai/query-history
 * Follow-up query with conversation context
 */
router.post('/query-history', requireRole('doctor', 'admin'), async (req, res, next) => {
    try {
        const { patientId, query, conversationId, previousMessages } = req.body;

        res.json({
            success: true,
            data: {
                patientId,
                query,
                answer: 'Follow-up query processing pending AI service integration.',
                conversationId: conversationId || `conv-${Date.now()}`,
                citations: [],
                model: 'pending-integration'
            }
        });
    } catch (error) {
        next(error);
    }
});

const aiServiceClient = require('../services/ai.service');

/**
 * POST /api/ai/analyze-record
 * Get AI insights for a specific record
 */
router.post('/analyze-record', async (req, res, next) => {
    try {
        const { recordId, recordType, ipfsCid, metadata } = req.body;
        
        const gateway = process.env.IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs';
        const ipfsUrl = `${gateway}/${ipfsCid}`;

        const analysis = await aiServiceClient.analyzeRecord(
            recordType,
            ipfsUrl,
            metadata || {}
        );

        res.json({
            success: true,
            data: {
                recordId,
                analysis
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
