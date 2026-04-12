'use strict';

const express = require('express');
const router = express.Router();
const chatService = require('../services/chat.service');
const logger = require('../utils/logger');

/**
 * GET /api/chat/ping
 * Health check for chat service
 */
router.get('/ping', (req, res) => {
    res.json({ pong: true, timestamp: new Date().toISOString() });
});

/**
 * POST /api/chat
 * Bot endpoint for patient's medical history + app architecture
 */
router.post('/', async (req, res) => {
    try {
        const { message, chatHistory, patientId } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!patientId) {
            return res.status(400).json({ error: 'Patient ID context is required' });
        }

        const response = await chatService.getChatResponse(patientId, message, chatHistory || []);
        
        res.json({
            success: true,
            response
        });
    } catch (err) {
        logger.error('Chat Route Error:', err.message);
        res.status(500).json({
            error: 'Chat Failed',
            message: err.message
        });
    }
});

module.exports = router;
