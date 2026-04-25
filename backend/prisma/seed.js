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
          
          // Interior Specific Items
          { zone: 'interior', category: 'Filters', itemName: 'Cabin Air Filter', guideline: 'Inspect and replace if dirty or emitting odor.', sortOrder: 14 },
          { zone: 'interior', category: 'Climate', itemName: 'A/C Cooling & Blower', guideline: 'Test cooling performance and all fan speeds.', sortOrder: 15 },
          { zone: 'interior', category: 'Safety', itemName: 'Seatbelts & SRS', guideline: 'Check seatbelt retraction, fraying, and airbag warning lights.', sortOrder: 16 },
          { zone: 'interior', category: 'Electrical', itemName: 'Power Windows & Mirrors', guideline: 'Ensure all switches and motors operate smoothly.', sortOrder: 17 },
          { zone: 'interior', category: 'Accessories', itemName: 'Horn & Interior Lights', guideline: 'Test horn operation and all cabin dome/reading lights.', sortOrder: 18 },
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
          
          // Interior Specific Items
          { zone: 'interior', category: 'Filters', itemName: 'Cabin Air Filter', guideline: 'Inspect and replace if dirty or emitting odor.', sortOrder: 14 },
          { zone: 'interior', category: 'Climate', itemName: 'A/C Cooling & Blower', guideline: 'Test cooling performance and all fan speeds.', sortOrder: 15 },
          { zone: 'interior', category: 'Safety', itemName: 'Seatbelts & SRS', guideline: 'Check seatbelt retraction, fraying, and airbag warning lights.', sortOrder: 16 },
          { zone: 'interior', category: 'Electrical', itemName: 'Power Windows & Mirrors', guideline: 'Ensure all switches and motors operate smoothly.', sortOrder: 17 },
          { zone: 'interior', category: 'Accessories', itemName: 'Horn & Interior Lights', guideline: 'Test horn operation and all cabin dome/reading lights.', sortOrder: 18 },
          
          // Major Specific Items
          { zone: 'engine', category: 'Ignition', itemName: 'Spark Plugs', guideline: 'Remove and replace. Check for oil/carbon fouling.', sortOrder: 19 },
          { zone: 'engine', category: 'Filters', itemName: 'Fuel Filter', guideline: 'Replace inline fuel filter (if accessible/applicable).', sortOrder: 20 },
          { zone: 'transmission', category: 'Fluids', itemName: 'Transmission Fluid', guideline: 'Drain and refill (or flush). Check for metal shavings in pan.', sortOrder: 21 },
          { zone: 'transmission', category: 'Drivetrain', itemName: 'CV Joints & Boots', guideline: 'Inspect rubber boots for tears and grease leakage.', sortOrder: 22 },
          { zone: 'undercarriage', category: 'Suspension', itemName: 'Shocks & Struts', guideline: 'Check for fluid leaks and bounce test.', sortOrder: 23 },
          { zone: 'undercarriage', category: 'Steering', itemName: 'Tie Rods & Ball Joints', guideline: 'Check for excessive play or torn dust boots.', sortOrder: 24 },
          { zone: 'undercarriage', category: 'Exhaust', itemName: 'Exhaust System', guideline: 'Inspect for rust holes, loose heat shields, and leaks.', sortOrder: 25 },
          { zone: 'engine', category: 'Fluids', itemName: 'Power Steering Fluid', guideline: 'Check level and condition (if hydraulic).', sortOrder: 26 },
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

  // Create Test Customers & Vehicles
  const c1 = await prisma.customer.create({
    data: { workshopId: workshop.id, name: 'Sarah Jenkins', phone: '+60 12-345 6789', email: 'sarah@example.com' }
  });
  await prisma.vehicle.create({
    data: { workshopId: workshop.id, customerId: c1.id, make: 'Mercedes-Benz', model: 'C63 S AMG', year: 2019, plateNumber: 'WAA 1234', glbModelKey: '2019_mercedes-benz_c63_s_amg_coupe', currentMileage: 45000 }
  });

  const c2 = await prisma.customer.create({
    data: { workshopId: workshop.id, name: 'Ahmad Faizal', phone: '+60 19-876 5432', email: 'ahmad@example.com' }
  });
  await prisma.vehicle.create({
    data: { workshopId: workshop.id, customerId: c2.id, make: 'Audi', model: 'RS7 Sportback', year: 2020, plateNumber: 'JQF 8888', glbModelKey: '2020_audi_rs7_sportback', currentMileage: 32000 }
  });

  const c3 = await prisma.customer.create({
    data: { workshopId: workshop.id, name: 'Takeshi', phone: '+60 11-111 2222', email: 'takeshi@example.com' }
  });
  await prisma.vehicle.create({
    data: { workshopId: workshop.id, customerId: c3.id, make: 'Toyota', model: 'Sprinter Trueno AE86', year: 1985, plateNumber: 'AE 86', glbModelKey: '1985_toyota_sprinter_trueno_ae86_project_d', currentMileage: 150000 }
  });

  const c4 = await prisma.customer.create({
    data: { workshopId: workshop.id, name: 'Rajesh Kumar', phone: '+60 16-555 4444', email: 'rajesh@example.com' }
  });
  await prisma.vehicle.create({
    data: { workshopId: workshop.id, customerId: c4.id, make: 'BMW', model: 'M3 E30', year: 1990, plateNumber: 'PEN 330', glbModelKey: 'free_bmw_m3_e30', currentMileage: 120000 }
  });

  const c5 = await prisma.customer.create({
    data: { workshopId: workshop.id, name: 'Mei Ling', phone: '+60 13-999 8888', email: 'mei@example.com' }
  });
  await prisma.vehicle.create({
    data: { workshopId: workshop.id, customerId: c5.id, make: 'Toyota', model: 'Supra A80', year: 1993, plateNumber: 'BND 993', glbModelKey: 'toyota_supra_a80_1993', currentMileage: 95000 }
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
