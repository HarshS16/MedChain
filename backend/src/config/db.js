'use strict';

const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

// Instantiate Prisma Client
const prisma = new PrismaClient({
    log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
    ],
});

// Middleware to log queries in development
if (process.env.NODE_ENV === 'development') {
    prisma.$on('query', (e) => {
        logger.debug(`Query: ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`);
    });
}

/**
 * Connect to the database
 */
async function connectDb() {
    try {
        await prisma.$connect();
        logger.info('🐘 PostgreSQL Connected (Prisma)');
    } catch (error) {
        logger.error('Failed to connect to PostgreSQL:', error);
        // Don't exit process, allow service to run in degraded mode if needed
    }
}

/**
 * Handle graceful shutdown
 */
async function disconnectDb() {
    await prisma.$disconnect();
    logger.info('PostgreSQL disconnected');
}

module.exports = {
    prisma,
    connectDb,
    disconnectDb
};
