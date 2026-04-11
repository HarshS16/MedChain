'use strict';

const axios = require('axios');
const logger = require('../utils/logger');

/**
 * AI Service Client — Bridge to the Python FastAPI RAG engine
 */
class AIServiceClient {
    constructor() {
        this.baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        this.openRouterKey = process.env.OPENROUTER_API_KEY;
        this.siteUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        this.siteName = 'MedChain';
    }

    /**
     * Send new record for vectorization and indexing
     */
    async indexRecord(recordData) {
        try {
            logger.info(`Indexing record ${recordData.recordId} for AI...`);
            const response = await axios.post(`${this.baseUrl}/ingest`, {
                record_id: recordData.recordId,
                patient_id: recordData.patientId,
                record_type: recordData.recordType,
                content: recordData.content, // Actual medical content
                doctor_id: recordData.doctorId || '',
                hospital_id: recordData.hospitalId || '',
                timestamp: recordData.timestamp || new Date().toISOString()
            });
            return response.data;
        } catch (error) {
            logger.error('AI Ingestion failed:', error.message);
            // Non-critical: failure to index shouldn't break the blockchain transaction
            return null;
        }
    }

    /**
     * Send document (PDF/Image) for OCR and indexing
     */
    async processDocument(fileBuffer, mimeType, patientId, recordId) {
        try {
            const formData = new FormData();
            formData.append('file', new Blob([fileBuffer], { type: mimeType }), 'record_doc');
            formData.append('patient_id', patientId);
            formData.append('record_id', recordId);

            const response = await axios.post(`${this.baseUrl}/process-document`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            logger.error('Document OCR processing failed:', error.message);
            return null;
        }
    }

    /**
     * Query patient history via RAG
     */
    async queryPatient(patientId, query, topK = 5) {
        try {
            const response = await axios.post(`${this.baseUrl}/query`, {
                patient_id: patientId,
                query: query,
                top_k: topK
            });
            return response.data;
        } catch (error) {
            logger.error('AI Query failed:', error.message);
            throw new Error('AI Assistant is currently unavailable');
        }
    }

    /**
     * Analyze a specific record using OpenRouter (LLM)
     */
    async analyzeRecord(recordType, ipfsUrl, metadata = {}) {
        try {
            if (!this.openRouterKey) {
                logger.warn('OpenRouter API Key missing. Returning fallback analysis.');
                return "AI Analysis is currently in demo mode. Please configure OPENROUTER_API_KEY in .env to see real insights.";
            }

            const prompt = `
                You are a professional medical assistant. Analyze this medical record:
                Type: ${recordType}
                IPFS Link: ${ipfsUrl}
                Category: ${metadata.medicalCategory?.join(', ') || 'General'}
                
                Please provide:
                1. A simple 2-sentence summary of what this report is.
                2. Any key findings or values that a patient should notice.
                3. A disclaimer that this is AI-generated and not a diagnosis.
                
                Keep it concise and empathetic.
            `;

            const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                model: 'google/gemini-2.0-flash-001', // High speed, high quality
                messages: [{ role: 'user', content: prompt }]
            }, {
                headers: {
                    'Authorization': `Bearer ${this.openRouterKey}`,
                    'HTTP-Referer': this.siteUrl,
                    'X-Title': this.siteName,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            logger.error('OpenRouter Analysis failed:', error.response?.data || error.message);
            throw new Error('Failed to reach AI Analysis engine');
        }
    }
}

module.exports = new AIServiceClient();
