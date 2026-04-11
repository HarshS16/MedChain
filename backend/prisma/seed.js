const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed initial hospitals
  const hospitals = [
    {
      hospitalId: 'HOSP-001',
      name: 'Apollo Hospital Bangalore',
      registrationNo: 'REG-12345',
      fabricOrgMsp: 'HospitalAMSP',
      address: 'Bannerghatta Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560076',
      accreditationStatus: 'NABH',
    },
    {
      hospitalId: 'HOSP-002',
      name: 'AIIMS Delhi',
      registrationNo: 'REG-67890',
      fabricOrgMsp: 'HospitalBMSP',
      address: 'Ansari Nagar',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110029',
      accreditationStatus: 'JCI',
    }
  ];

  for (const hospital of hospitals) {
    const upsertedItem = await prisma.hospital.upsert({
      where: { hospitalId: hospital.hospitalId },
      update: {},
      create: hospital,
    });
    console.log(`✅ Upserted hospital: ${upsertedItem.name}`);
  }

  // 2. Seed a test patient (Optional for dev)
  const testPatient = await prisma.patient.upsert({
    where: { patientId: 'PAT-TEST-001' },
    update: {},
    create: {
      patientId: 'PAT-TEST-001',
      abhaId: '12-3456-7890-1234',
      publicKey: 'test-public-key',
      demographicsHash: 'dummy-hash',
    }
  });
  console.log(`✅ Upserted test patient: ${testPatient.patientId}`);

  console.log('✨ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
