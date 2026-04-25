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
          { zone: 'engine', category: 'Fluids', itemName: 'Engine Oil & Filter', guideline: 'Replace. Check for leaks around the sump/filter housing.', sortOrder: 1 },
          { zone: 'engine', category: 'Fluids', itemName: 'Coolant Level', guideline: 'Check reservoir level between MIN/MAX. Top up if needed.', sortOrder: 2 },
          { zone: 'engine', category: 'Fluids', itemName: 'Brake Fluid', guideline: 'Check level and moisture content (< 2%).', sortOrder: 3 },
          { zone: 'engine', category: 'Filters', itemName: 'Engine Air Filter', guideline: 'Inspect for heavy debris. Clean or replace if clogged.', sortOrder: 4 },
          { zone: 'engine', category: 'Belts', itemName: 'Drive/Serpentine Belt', guideline: 'Visual check for cracking, fraying, or squealing.', sortOrder: 5 },
          { zone: 'electrical', category: 'Battery', itemName: 'Battery Health', guideline: 'Check voltage (> 12.4V) and clean terminals.', sortOrder: 6 },
          { zone: 'electrical', category: 'Lights', itemName: 'Exterior Lights', guideline: 'Test headlights, high beams, indicators, and brake lights.', sortOrder: 7 },
          { zone: 'electrical', category: 'Visibility', itemName: 'Wiper Blades & Washer', guideline: 'Check for streaking and ensure washer fluid is full.', sortOrder: 8 },
          { zone: 'front-left', category: 'Tyres', itemName: 'Front Left Tyre & Pressure', guideline: 'Check tread depth (>1.6mm) and inflate to spec.', sortOrder: 9 },
          { zone: 'front-right', category: 'Tyres', itemName: 'Front Right Tyre & Pressure', guideline: 'Check tread depth (>1.6mm) and inflate to spec.', sortOrder: 10 },
          { zone: 'rear-left', category: 'Tyres', itemName: 'Rear Left Tyre & Pressure', guideline: 'Check tread depth (>1.6mm) and inflate to spec.', sortOrder: 11 },
          { zone: 'rear-right', category: 'Tyres', itemName: 'Rear Right Tyre & Pressure', guideline: 'Check tread depth (>1.6mm) and inflate to spec.', sortOrder: 12 },
          { zone: 'undercarriage', category: 'Brakes', itemName: 'Brake Pads & Discs', guideline: 'Visual check. Pads must be >3mm thick. Discs free of deep scoring.', sortOrder: 13 },
        ],
      },
    },
  });

  await prisma.checklistTemplate.create({
    data: {
      workshopId: workshop.id,
      name: 'Major Service (40k km)',
      mileageTrigger: 40000,
      serviceType: 'MAJOR',
      isActive: true,
      items: {
        create: [
          // All Minor Service Items
          { zone: 'engine', category: 'Fluids', itemName: 'Engine Oil & Filter', guideline: 'Replace. Check for leaks around the sump/filter housing.', sortOrder: 1 },
          { zone: 'engine', category: 'Fluids', itemName: 'Coolant Level', guideline: 'Check reservoir level between MIN/MAX. Top up if needed.', sortOrder: 2 },
          { zone: 'engine', category: 'Fluids', itemName: 'Brake Fluid', guideline: 'Check level and moisture content (< 2%).', sortOrder: 3 },
          { zone: 'engine', category: 'Filters', itemName: 'Engine Air Filter', guideline: 'Inspect for heavy debris. Clean or replace if clogged.', sortOrder: 4 },
          { zone: 'engine', category: 'Belts', itemName: 'Drive/Serpentine Belt', guideline: 'Visual check for cracking, fraying, or squealing.', sortOrder: 5 },
          { zone: 'electrical', category: 'Battery', itemName: 'Battery Health', guideline: 'Check voltage (> 12.4V) and clean terminals.', sortOrder: 6 },
          { zone: 'electrical', category: 'Lights', itemName: 'Exterior Lights', guideline: 'Test headlights, high beams, indicators, and brake lights.', sortOrder: 7 },
          { zone: 'electrical', category: 'Visibility', itemName: 'Wiper Blades & Washer', guideline: 'Check for streaking and ensure washer fluid is full.', sortOrder: 8 },
          { zone: 'front-left', category: 'Tyres', itemName: 'Front Left Tyre & Pressure', guideline: 'Check tread depth (>1.6mm) and inflate to spec.', sortOrder: 9 },
          { zone: 'front-right', category: 'Tyres', itemName: 'Front Right Tyre & Pressure', guideline: 'Check tread depth (>1.6mm) and inflate to spec.', sortOrder: 10 },
          { zone: 'rear-left', category: 'Tyres', itemName: 'Rear Left Tyre & Pressure', guideline: 'Check tread depth (>1.6mm) and inflate to spec.', sortOrder: 11 },
          { zone: 'rear-right', category: 'Tyres', itemName: 'Rear Right Tyre & Pressure', guideline: 'Check tread depth (>1.6mm) and inflate to spec.', sortOrder: 12 },
          { zone: 'undercarriage', category: 'Brakes', itemName: 'Brake Pads & Discs', guideline: 'Visual check. Pads must be >3mm thick. Discs free of deep scoring.', sortOrder: 13 },
          
          // Major Specific Items
          { zone: 'engine', category: 'Ignition', itemName: 'Spark Plugs', guideline: 'Remove and replace. Check for oil/carbon fouling.', sortOrder: 14 },
          { zone: 'engine', category: 'Filters', itemName: 'Fuel Filter', guideline: 'Replace inline fuel filter (if accessible/applicable).', sortOrder: 15 },
          { zone: 'transmission', category: 'Fluids', itemName: 'Transmission Fluid', guideline: 'Drain and refill (or flush). Check for metal shavings in pan.', sortOrder: 16 },
          { zone: 'transmission', category: 'Drivetrain', itemName: 'CV Joints & Boots', guideline: 'Inspect rubber boots for tears and grease leakage.', sortOrder: 17 },
          { zone: 'undercarriage', category: 'Suspension', itemName: 'Shocks & Struts', guideline: 'Check for fluid leaks and bounce test.', sortOrder: 18 },
          { zone: 'undercarriage', category: 'Steering', itemName: 'Tie Rods & Ball Joints', guideline: 'Check for excessive play or torn dust boots.', sortOrder: 19 },
          { zone: 'undercarriage', category: 'Exhaust', itemName: 'Exhaust System', guideline: 'Inspect for rust holes, loose heat shields, and leaks.', sortOrder: 20 },
          { zone: 'engine', category: 'Fluids', itemName: 'Power Steering Fluid', guideline: 'Check level and condition (if hydraulic).', sortOrder: 21 },
        ],
      },
    },
  });

  await prisma.checklistTemplate.create({
    data: {
      workshopId: workshop.id,
      name: 'Diagnostic Inspection',
      mileageTrigger: 0,
      serviceType: 'INSPECTION',
      isActive: true,
      items: {
        create: [
          { zone: 'electrical', category: 'Diagnostics', itemName: 'OBD-II Scan', guideline: 'Run full system scan. Document all active/historic DTC codes.', sortOrder: 1 },
          { zone: 'engine', category: 'Diagnostics', itemName: 'Engine Idle & Noise', guideline: 'Check for misfires, knocking, or unusual ticking.', sortOrder: 2 },
          { zone: 'undercarriage', category: 'Diagnostics', itemName: 'Undercarriage Leaks', guideline: 'Comprehensive check for oil, coolant, or transmission fluid leaks.', sortOrder: 3 },
          { zone: 'electrical', category: 'Interior', itemName: 'Dashboard Warnings', guideline: 'Verify all warning lights illuminate on startup and turn off.', sortOrder: 4 },
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
