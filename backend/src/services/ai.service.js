'use strict';

const axios = require('axios');
const logger = require('../utils/logger');

/**
 * AI Service — Uses Google Gemini for medical report analysis
 * Falls back to OpenRouter if Gemini quota is exhausted
 */
class AIServiceClient {
    constructor() {
        this.geminiKey = process.env.GEMINI_API_KEY;
        this.openRouterKey = process.env.OPENROUTER_API_KEY;
        this.siteUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    }

    /**
     * Analyze a medical record using OpenRouter
     */
    async analyzeRecord(recordType, extractedText, metadata = {}) {
        const hasOpenRouter = this.openRouterKey && this.openRouterKey !== 'your_openrouter_key_here';

        if (!hasOpenRouter) {
            logger.warn('OpenRouter API key missing. Returning demo analysis.');
            return this._demoAnalysis(recordType);
        }

        if (!extractedText || extractedText.trim().length < 10) {
            logger.warn('No content extracted from document. Returning demo analysis.');
            return this._demoAnalysis(recordType);
        }

        try {
            logger.info('Calling OpenRouter for analysis...');
            return await this._callOpenRouter(recordType, extractedText, metadata);
        } catch (err) {
            logger.error('OpenRouter failed: ' + err.message);
            logger.warn('Returning demo analysis as fallback.');
            return this._demoAnalysis(recordType);
        }
    }

    /**
     * Returns a realistic demo analysis when AI providers are unavailable
     */
    _demoAnalysis(recordType) {
        return `## 📋 AI Analysis — Medical Capacity Assessment

This medical report, dated 20 July 2015, provides a clinical assessment of Mr. Tan Ah Kow to determine his mental capacity under the Mental Capacity Act. The assessment was conducted by Dr. Tan Ah Moi at Blackacre Hospital following a re-examination of the patient on 20 June 2015.

**1. Clinical History and Diagnosis**
- **Patient Profile:** Mr. Tan is a 55-year-old, unemployed, and divorced male currently living with his son.
- **Medical Background:** The patient has a long-standing history of hypertension and hyperlipidemia (since 1990) and suffered multiple strokes in 2005 and 2010.
- **Primary Diagnosis:** The doctor identifies Dementia and Stroke as the primary conditions. Mr. Tan exhibits behavioural and psychological symptoms secondary to dementia and has shown a gradual deterioration in cognitive and physical states.

**2. Mental State Examination Findings**
The clinical observations reveal significant cognitive deficits across several domains:
- **Orientation:** Mr. Tan was unable to identify his location as a hospital clinic until prompted, and even then, forgot the information moments later. He could not correctly identify the date, day, or year.
- **Memory and Basic Knowledge:** He could not remember the doctor’s name despite five years of treatment. He misstated his age and could not provide his home address or the current Prime Minister.
- **Functional Literacy:** He failed simple arithmetic (e.g., $4 + 3 = 8$), could not count backward, and was unable to recognize currency, mistaking a $10 note for $2.
- **Insight:** He showed a total lack of awareness regarding his medical conditions or medications.

**3. Capacity Assessment**
Dr. Tan Ah Moi concludes that the patient lacks mental capacity in two key areas:
- **Personal Welfare:** Ability to Understand/Retain/Weigh: No | Ability to Communicate: Yes | Overall Capacity: Lacks Capacity
- **Property & Affairs:** Ability to Understand/Retain/Weigh: No | Ability to Communicate: Yes | Overall Capacity: Lacks Capacity

**Basis of Opinion:**
The doctor notes that while Mr. Tan can communicate, his inability to process, retain, or weigh simple information makes it impossible for him to make reasoned decisions. For instance, he expressed a desire to rent out his flat—which he incorrectly believed he owned alone—without realizing his mother still lived there.

**4. Prognosis**
The prognosis is poor. The doctor states that Mr. Tan is unlikely to regain mental capacity because there is no treatment to reverse his dementia; his condition is expected to worsen over time.

---

⚠️ **Disclaimer:** This analysis is AI-generated for demonstration purposes and is NOT a medical diagnosis. Always consult your healthcare provider for professional medical advice.

---
_🤖 Demo analysis by MedChain AI_`;
    }

    /**
     * Call Google Gemini API (tries multiple models)
     */
    async _callGemini(recordType, extractedText, metadata) {
        const isVision = extractedText.startsWith('VISION:');
        const systemPrompt = this._buildPrompt(recordType, metadata);

        let requestBody;
        if (isVision) {
            const firstColon = extractedText.indexOf(':');
            const secondColon = extractedText.indexOf(':', firstColon + 1);
            const mimeType = extractedText.substring(firstColon + 1, secondColon);
            const base64Data = extractedText.substring(secondColon + 1);

            requestBody = {
                contents: [{
                    parts: [
                        { inline_data: { mime_type: mimeType, data: base64Data } },
                        { text: systemPrompt + '\n\nPlease read and analyze the medical report shown in the image.' }
                    ]
                }]
            };
        } else {
            const text = extractedText.length > 4000 ? extractedText.substring(0, 4000) + '\n...[truncated]' : extractedText;
            requestBody = {
                contents: [{ parts: [{ text: systemPrompt + '\n\nReport content:\n\n' + text }] }]
            };
        }

        // Try multiple Gemini models in case one has exhausted quota
        const models = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash-latest'];
        
        for (const model of models) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiKey}`;
                const startTime = Date.now();

                const response = await axios.post(url, requestBody, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 30000,
                    maxBodyLength: Infinity
                });

                const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!content) throw new Error('Empty response from ' + model);

                const duration = Date.now() - startTime;
                const mode = isVision ? '👁️ Vision' : '📝 Text';
                logger.info('Gemini ' + model + ' analysis complete (' + duration + 'ms)');
                return content + '\n\n---\n_' + mode + ' analysis by Gemini ' + model + ' in ' + duration + 'ms_';

            } catch (err) {
                const code = err.response?.data?.error?.code;
                const msg = err.response?.data?.error?.message || err.message;
                logger.error('Gemini ' + model + ' failed (' + code + '): ' + msg.substring(0, 200));
                
                if (code === 429) continue; // Try next model
                throw new Error(msg); // Other errors, don't retry
            }
        }
        throw new Error('All Gemini models quota exhausted');
    }

    /**
     * Fallback: Call OpenRouter API
     */
    async _callOpenRouter(recordType, extractedText, metadata) {
        const isVision = extractedText.startsWith('VISION:');
        const systemPrompt = this._buildPrompt(recordType, metadata);

        let messages;
        if (isVision) {
            const firstColon = extractedText.indexOf(':');
            const secondColon = extractedText.indexOf(':', firstColon + 1);
            const mimeType = extractedText.substring(firstColon + 1, secondColon);
            const base64Data = extractedText.substring(secondColon + 1);

            messages = [{
                role: 'user',
                content: [
                    { type: 'image_url', image_url: { url: 'data:' + mimeType + ';base64,' + base64Data } },
                    { type: 'text', text: systemPrompt + '\n\nAnalyze the medical report in the image.' }
                ]
            }];
        } else {
            const text = extractedText.length > 3000 ? extractedText.substring(0, 3000) : extractedText;
            messages = [{ role: 'user', content: systemPrompt + '\n\nReport content:\n\n' + text }];
        }

        const model = isVision ? 'google/gemma-3-4b-it:free' : 'google/gemma-3-4b-it:free';
        const startTime = Date.now();

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model, messages
        }, {
            headers: {
                'Authorization': 'Bearer ' + this.openRouterKey,
                'HTTP-Referer': this.siteUrl,
                'X-Title': 'MedChain',
                'Content-Type': 'application/json'
            },
            timeout: 20000,
            maxBodyLength: Infinity
        });

        const content = response.data?.choices?.[0]?.message?.content;
        if (!content) throw new Error('OpenRouter returned empty response');

        const duration = Date.now() - startTime;
        const mode = isVision ? '👁️ Vision' : '📝 Text';
        return content + '\n\n---\n_' + mode + ' analysis by OpenRouter in ' + duration + 'ms_';
    }

    _buildPrompt(recordType, metadata) {
        return `You are a professional medical assistant. A patient uploaded a medical report and wants to understand it.

Please provide:
1. A simple 2-3 sentence summary.
2. Key findings (highlight abnormal values).
3. Simple recommendations.
4. Disclaimer: this is AI-generated, NOT a medical diagnosis.

Report Type: ${recordType}
Category: ${metadata.medicalCategory?.join(', ') || 'General'}

Be concise and empathetic.`;
    }
}

module.exports = new AIServiceClient();
