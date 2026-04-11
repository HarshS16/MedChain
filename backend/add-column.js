require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    await p.$executeRawUnsafe('ALTER TABLE record_cache ADD COLUMN IF NOT EXISTS extracted_text TEXT');
    console.log('✅ extracted_text column added successfully');
    await p.$disconnect();
}

main().catch(e => { console.error('Error:', e.message); p.$disconnect(); });


