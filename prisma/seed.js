const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash = await bcrypt.hash('user123', 10);

  // Create or update Admin account
  await prisma.user.upsert({
    where: { email: 'admin@seminarverse.com' },
    update: {},
    create: {
      name: 'Admin SeminarVerse',
      email: 'admin@seminarverse.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      avatar: 'https://ui-avatars.com/api/?name=Admin+SeminarVerse&background=0D8ABC&color=fff'
    }
  });

  // Create or update standard Participant account
  await prisma.user.upsert({
    where: { email: 'user@seminarverse.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'user@seminarverse.com',
      passwordHash: userPasswordHash,
      role: 'PARTICIPANT',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=2563EB&color=fff',
      points: 120
    }
  });

  // Seed default vouchers
  await prisma.voucher.upsert({
    where: { code: 'PROMO10' },
    update: {},
    create: {
      code: 'PROMO10',
      discountType: 'PERCENT',
      discountValue: 10,
      quota: 100,
      expiryDate: new Date('2026-12-31')
    }
  });

  await prisma.voucher.upsert({
    where: { code: 'FREEPASS' },
    update: {},
    create: {
      code: 'FREEPASS',
      discountType: 'PERCENT',
      discountValue: 100,
      quota: 10,
      expiryDate: new Date('2026-08-31')
    }
  });

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
