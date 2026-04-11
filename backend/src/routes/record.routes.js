'use strict';

const router = require('express').Router();
const recordService = require('../services/record.service');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { auditLog } = require('../middleware/audit.middleware');
const { validate, createRecordSchema } = require('../utils/validators');
const logger = require('../utils/logger');
const multer = require('multer');
const aiService = require('../services/ai.service');
const ipfsService = require('../services/ipfs.service');
const { prisma } = require('../config/db');

const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);
router.use(auditLog);

/**
 * POST /api/records/create
 * Doctor creates a new medical record
 */
router.post('/create', requireRole('doctor', 'admin'), validate(createRecordSchema), async (req, res, next) => {
    try {
        const record = await recordService.createRecord(
            req.user.id,
            req.user.orgId || 'HOSP-default',
            req.validatedBody
        );

        res.status(201).json({
            success: true,
            message: 'Medical record created successfully',
            data: { record }
        });
    } catch (error) {
        next(error);
    }
});
/**
 * POST /api/records/upload-document
 * Upload a clinical document (Photo/PDF) for OCR and AI indexing
 */
router.post('/upload-document', requireRole('patient', 'doctor', 'admin'), upload.single('document'), async (req, res, next) => {
    try {
        const { patientId, recordType } = req.body;
        const file = req.file;

        if (!patientId) {
            return res.status(400).json({ error: 'Missing Patient ID', message: 'You must provide a valid Patient ID to upload a document.' });
        }

        if (!file) {
            return res.status(400).json({ error: 'No document uploaded' });
        }

        // 0. Safety: Find the actual patient to prevent foreign key errors
        let targetPatient = await prisma.patient.findUnique({
            where: { patientId: patientId }
        });

        // If not found by custom ID, and it looks like a UUID, try searching by UUID
        if (!targetPatient && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(patientId)) {
            targetPatient = await prisma.patient.findUnique({
                where: { id: patientId }
            });
        }

        if (!targetPatient) {
            return res.status(404).json({ 
                error: 'Patient not found', 
                message: `The provided patient ID (${patientId}) does not exist in our database.` 
            });
        }

        const actualPatientId = targetPatient.patientId;

        // 1. Upload to IPFS
        const ipfsCid = await ipfsService.storeData(file.buffer);
        const recordId = `REC-DOC-${Date.now()}`;

        // 2. Extract text / prepare compressed image for AI vision
        let extractedText = '';
        try {
            const sharp = require('sharp');

            if (file.mimetype === 'application/pdf') {
                const pdfParse = require('pdf-parse');
                const pdfData = await pdfParse(file.buffer);
                const text = (pdfData.text || '').trim();
                
                if (text.length > 50) {
                    // Good text extraction — text-based PDF
                    extractedText = text;
                    logger.info(`📄 PDF text extracted: ${text.length} chars for ${recordId}`);
                } else {
                    // Scanned PDF — can't extract text, store note for user
                    extractedText = '[Scanned PDF: No machine-readable text. For best AI analysis, please upload an image of the report or a text-based PDF.]';
                    logger.info(`📄 Scanned PDF detected for ${recordId}, no text available`);
                }
            } else if (file.mimetype.startsWith('image/')) {
                // Compress image to a small JPEG for vision AI (max 800px wide, 60% quality)
                const compressed = await sharp(file.buffer)
                    .resize(800, null, { withoutEnlargement: true })
                    .jpeg({ quality: 60 })
                    .toBuffer();
                
                const base64 = compressed.toString('base64');
                extractedText = `VISION:image/jpeg:${base64}`;
                const sizeMB = (compressed.length / 1024 / 1024).toFixed(2);
                logger.info(`🖼️ Image compressed (${sizeMB}MB) and stored for vision AI: ${file.originalname}`);
            } else {
                extractedText = `[Unsupported file type: ${file.mimetype}]`;
            }
        } catch (ocrErr) {
            logger.error(`Processing failed for ${recordId}:`, ocrErr.message);
            // Last resort: try to compress with sharp, otherwise store note
            try {
                const sharp = require('sharp');
                const compressed = await sharp(file.buffer)
                    .resize(600, null, { withoutEnlargement: true })
                    .jpeg({ quality: 50 })
                    .toBuffer();
                extractedText = `VISION:image/jpeg:${compressed.toString('base64')}`;
            } catch {
                extractedText = '[Document processing failed. Please re-upload as an image (JPG/PNG).]';
            }
        }


        // 3. Save to Database with extracted text
        const record = await prisma.recordCache.create({
            data: {
                recordId,
                patientId: actualPatientId,
                doctorId: req.user.role === 'doctor' ? req.user.id : 'SELF',
                hospitalId: req.user.orgId || 'HOSP-UPLOAD',
                recordType: recordType || 'Patient Uploaded Document',
                medicalCategory: ['General'],
                dataHash: `HASH-${Date.now()}`,
                ipfsCid,
                extractedText,
                recordedAt: new Date(),
            }
        });

        logger.info(`✅ Record ${recordId} saved with ${extractedText.length} chars of extracted text`);

        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            data: { record }
        });
    } catch (error) {
        next(error);
    }
});


/**
 * GET /api/records/patient/:patientId
 * Get all records for a patient (paginated, filtered)
 */
router.get('/patient/:patientId', async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const filters = {
            recordType: req.query.type,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            medicalCategory: req.query.category ? req.query.category.split(',') : null,
            page: req.query.page,
            limit: req.query.limit
        };

        const result = await recordService.getPatientRecords(patientId, req.user.id, filters);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/records/:recordId
 * Get single record with decrypted content
 */
router.get('/:recordId', async (req, res, next) => {
    try {
        const record = await recordService.getRecordById(req.params.recordId, req.user.id);

        res.json({
            success: true,
            data: { record }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/records/patient/:patientId/timeline
 * Get chronological timeline view of patient records
 */
router.get('/patient/:patientId/timeline', async (req, res, next) => {
    try {
        const timeline = await recordService.getPatientTimeline(req.params.patientId);

        res.json({
            success: true,
            data: timeline
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/records/patient/:patientId/stats
 * Get record statistics for a patient
 */
router.get('/patient/:patientId/stats', async (req, res, next) => {
    try {
        const stats = await recordService.getPatientStats(req.params.patientId);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
