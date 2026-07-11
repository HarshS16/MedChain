'use strict';

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { prisma } = require('../config/db');

class ChatService {
    constructor() {
        this.openRouterKey = process.env.OPENROUTER_API_KEY;
        this.siteUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        this.architecturePath = path.join(__dirname, '../../../MEDCHAIN_ARCHITECTURE.md');
        this.cachedArchitecture = null;
    }

    async _getArchitecture() {
        if (this.cachedArchitecture) return this.cachedArchitecture;
        try {
            if (fs.existsSync(this.architecturePath)) {
                this.cachedArchitecture = fs.readFileSync(this.architecturePath, 'utf8');
                return this.cachedArchitecture;
            }
        } catch (err) {
            logger.error('Failed to read architecture file:', err.message);
        }
        return "MedChain architecture info unavailable.";
    }

    async _getPatientContext(patientId) {
        if (!patientId) {
            logger.warn('No patientId provided for context retrieval');
            return "No patient identification available for context.";
        }
        try {
            logger.info(`Fetching patient records for context: ${patientId}`);
            const records = await prisma.recordCache.findMany({
                where: { 
                    patientId: String(patientId),
                    aiAnalysis: { not: null }
                },
                select: {
                    recordType: true,
                    aiAnalysis: true,
                    recordedAt: true
                },
                orderBy: { recordedAt: 'desc' }
            });

            if (records.length === 0) {
                logger.info(`No AI-analyzed records found for patient: ${patientId}`);
                return "No medical records analysis available for this patient yet.";
            }

            logger.info(`Found ${records.length} analyzed records for patient context.`);
            return records.map(r => `[${r.recordedAt.toISOString().split('T')[0]}] ${r.recordType}:\n${r.aiAnalysis}`).join('\n\n---\n\n');
        } catch (err) {
            logger.error('Failed to fetch patient context:', { error: err.message, patientId });
            return "Error retrieving patient medical context.";
        }
    }

    async getChatResponse(patientId, userMessage, chatHistory = []) {
        const archInfo = await this._getArchitecture();
        const patientContext = await this._getPatientContext(patientId);

        const systemPrompt = `You are the MedChain AI Assistant, a professional and empathetic medical companion. 
Your goal is to help users understand the MedChain platform and their own medical history.

STRICT RULES:
1. ONLY answer questions about the MedChain application/architecture OR the patient's medical history provided in the context below.
2. If a user asks something unrelated to MedChain or their medical records, politely decline and explain that you can only assist with MedChain-related topics.
3. Use the "MedChain Architecture" context to answer platform questions.
4. Use the "Patient Medical Context" to answer questions about the user's health history.
5. If the user asks for a medical diagnosis, remind them that you are an AI and they should consult a doctor.
6. Be concise, professional, and empathetic.

---
MEDCHAIN ARCHITECTURE (Knowledge Base):
${archInfo.substring(0, 5000)}

---
PATIENT MEDICAL CONTEXT (Analyzed Records):
${patientContext}
---

Current conversation history follows. Answer the user's latest message based on the context above.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...chatHistory.slice(-6).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
        ];

        const models = [
            'google/gemma-4-31b-it:free',
            'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
            'poolside/laguna-xs-2.1:free',
            'tencent/hy3:free'
        ];

        let lastError = null;

        for (const model of models) {
            try {
                logger.info(`Attempting chat with model: ${model}`);
                const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                    model,
                    messages
                }, {
                    headers: {
                        'Authorization': 'Bearer ' + this.openRouterKey,
                        'HTTP-Referer': this.siteUrl,
                        'X-Title': 'MedChain Assistant',
                        'Content-Type': 'application/json'
                    },
                    timeout: 25000
                });

                const content = response.data?.choices?.[0]?.message?.content;
                if (!content) {
                    logger.error(`Model ${model} returned empty response`);
                    continue; 
                }

                logger.info(`Chat response successful via ${model}`);
                return content;

            } catch (err) {
                const statusCode = err.response?.status;
                const errorMsg = err.response?.data?.error?.message || err.message;
                lastError = errorMsg;
                
                logger.warn(`Model ${model} failed (Status ${statusCode}): ${errorMsg}`);
                
                if (statusCode === 429 || statusCode === 404 || statusCode === 400 || statusCode === 502) {
                    logger.info(`Switching to fallback model due to status ${statusCode} on ${model}...`);
                    continue; // Try next model
                }
                
                // If it's not a rate limit error, it might be a payload or auth error
                break; 
            }
        }

        throw new Error(`MedChain AI is currently reaching its free limit (${lastError}). Please try again in a few minutes or provide your own API key.`);
    }
}

module.exports = new ChatService();
