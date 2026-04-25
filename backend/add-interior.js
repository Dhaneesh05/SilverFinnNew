const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addInterior() {
  const templates = await prisma.checklistTemplate.findMany();
  for (const t of templates) {
    if (t.name.includes('Minor') || t.name.includes('Major')) {
      await prisma.checklistTemplateItem.createMany({
        data: [
          { templateId: t.id, zone: 'interior', category: 'Filters', itemName: 'Cabin Air Filter', guideline: 'Inspect and replace if dirty or emitting odor.', sortOrder: 14 },
          { templateId: t.id, zone: 'interior', category: 'Climate', itemName: 'A/C Cooling & Blower', guideline: 'Test cooling performance and all fan speeds.', sortOrder: 15 },
          { templateId: t.id, zone: 'interior', category: 'Safety', itemName: 'Seatbelts & SRS', guideline: 'Check seatbelt retraction, fraying, and airbag warning lights.', sortOrder: 16 },
          { templateId: t.id, zone: 'interior', category: 'Electrical', itemName: 'Power Windows & Mirrors', guideline: 'Ensure all switches and motors operate smoothly.', sortOrder: 17 },
          { templateId: t.id, zone: 'interior', category: 'Accessories', itemName: 'Horn & Interior Lights', guideline: 'Test horn operation and all cabin dome/reading lights.', sortOrder: 18 },
        ]
      });
    }
  }
  console.log("Added interior items");
}

addInterior().then(() => process.exit(0)).catch(console.error);
