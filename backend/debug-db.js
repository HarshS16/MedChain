const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
    try {
        const records = await prisma.recordCache.findMany();
        const patients = await prisma.patient.findMany();
        console.log('--- RECORDS IN DB ---');
        console.log(JSON.stringify(records, null, 2));
        console.log('\n--- PATIENTS IN DB ---');
        console.log(JSON.stringify(patients, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

debug();
