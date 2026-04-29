const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Patient model fields:', Object.keys(prisma.patient));
    try {
        // This is just to see the error message details in the console
        await prisma.patient.create({
            data: {
                name: 'test'
            }
        });
    } catch (e) {
        console.log('Error caught:');
        console.log(e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
