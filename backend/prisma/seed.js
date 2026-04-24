require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting minimal seed...');

  // Create Workshop
  const workshop = await prisma.workshop.create({
    data: {
      name: 'Silver Finn HQ',
      location: 'Kuala Lumpur, Malaysia',
      phone: '+60 3-1234 5678',
      email: 'hello@silverfinn.com',
    },
  });

  // Create Admin User
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      workshopId: workshop.id,
      name: 'System Admin',
      email: 'admin@silverfinn.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // Create Check Templates
  await prisma.checklistTemplate.create({
    data: {
      workshopId: workshop.id,
      name: 'Minor Service (10k km)',
      mileageTrigger: 10000,
      serviceType: 'MINOR',
      isActive: true,
      items: {
        create: [
          { zone: 'engine', category: 'Fluids', itemName: 'Engine Oil', guideline: 'Check level and colour', sortOrder: 1 },
          { zone: 'front-left', category: 'Tyres', itemName: 'Front Left Tyre', guideline: 'Check tread depth (>1.6mm)', sortOrder: 2 },
          { zone: 'front-right', category: 'Tyres', itemName: 'Front Right Tyre', guideline: 'Check tread depth (>1.6mm)', sortOrder: 3 },
          { zone: 'undercarriage', category: 'Brakes', itemName: 'Brake Pads', guideline: 'Check thickness (>3mm)', sortOrder: 4 },
        ],
      },
    },
  });

  console.log('✅ Minimal seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
