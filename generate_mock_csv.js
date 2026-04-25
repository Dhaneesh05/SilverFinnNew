const fs = require('fs');

const NUM_RECORDS = 5000;

const parts = [
  // Minor Service Items (High frequency, lower expected mileage interval, mostly preventative)
  { name: 'Engine Oil & Filter', type: 'Minor Service', expectedMileage: 10000, stdDev: 2000, weight: 100, brokenChance: 0.05 },
  { name: 'Brake Pads & Discs', type: 'Minor Service', expectedMileage: 35000, stdDev: 5000, weight: 60, brokenChance: 0.40 },
  { name: 'Engine Air Filter', type: 'Minor Service', expectedMileage: 20000, stdDev: 3000, weight: 80, brokenChance: 0.15 },
  { name: 'Cabin Air Filter', type: 'Minor Service', expectedMileage: 20000, stdDev: 3000, weight: 70, brokenChance: 0.10 },
  { name: 'Wiper Blades', type: 'Minor Service', expectedMileage: 15000, stdDev: 4000, weight: 90, brokenChance: 0.25 },
  
  // Major Service Items (Medium frequency, higher mileage interval, more wear-and-tear)
  { name: 'Spark Plugs', type: 'Major Service', expectedMileage: 60000, stdDev: 8000, weight: 30, brokenChance: 0.50 },
  { name: 'Transmission Fluid', type: 'Major Service', expectedMileage: 80000, stdDev: 10000, weight: 20, brokenChance: 0.20 },
  { name: 'Drive/Serpentine Belt', type: 'Major Service', expectedMileage: 70000, stdDev: 9000, weight: 25, brokenChance: 0.60 },
  { name: 'Shocks & Struts', type: 'Major Service', expectedMileage: 90000, stdDev: 12000, weight: 15, brokenChance: 0.75 },
  { name: 'Coolant Flush', type: 'Major Service', expectedMileage: 100000, stdDev: 15000, weight: 15, brokenChance: 0.10 },
  
  // Diagnostic Inspection Items (Lower frequency, very high chance of being broken to trigger replacement)
  { name: 'Oxygen (O2) Sensor', type: 'Diagnostic', expectedMileage: 120000, stdDev: 20000, weight: 10, brokenChance: 0.95 },
  { name: 'Mass Airflow Sensor', type: 'Diagnostic', expectedMileage: 110000, stdDev: 18000, weight: 8, brokenChance: 0.90 },
  { name: 'Alternator', type: 'Diagnostic', expectedMileage: 140000, stdDev: 25000, weight: 5, brokenChance: 0.98 },
  { name: 'Fuel Pump', type: 'Diagnostic', expectedMileage: 150000, stdDev: 30000, weight: 4, brokenChance: 0.99 },
  { name: 'Thermostat', type: 'Diagnostic', expectedMileage: 100000, stdDev: 15000, weight: 12, brokenChance: 0.85 }
];

// Helper to get random normal distribution (Box-Muller transform)
function randomNormal(mean, stdDev) {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) return randomNormal(mean, stdDev); // resample between 0 and 1
  num *= 10; // Stretch to -5 to +5
  return Math.max(0, Math.round(mean + (num - 5) * stdDev));
}

// Select a part based on weighted probability
function getRandomPart() {
  const totalWeight = parts.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;
  for (const part of parts) {
    if (random < part.weight) return part;
    random -= part.weight;
  }
  return parts[parts.length - 1];
}

const data = [];
data.push('ServiceID,PartName,ServiceType,MileageAtReplacement,WasBroken,Severity');

for (let i = 1; i <= NUM_RECORDS; i++) {
  const part = getRandomPart();
  
  // Randomize mileage based on expected distribution
  const mileage = randomNormal(part.expectedMileage, part.stdDev);
  
  // Determine if it was broken (failed) based on its base chance + some mileage age factor
  const ageFactor = mileage > part.expectedMileage ? 0.2 : 0; // 20% higher chance if overdue
  const actualBrokenChance = Math.min(1.0, part.brokenChance + ageFactor);
  const wasBroken = Math.random() < actualBrokenChance ? 'Yes' : 'No';
  
  // Severity of the issue (1 to 5)
  const severity = wasBroken === 'Yes' ? Math.floor(Math.random() * 3) + 3 : Math.floor(Math.random() * 2) + 1;

  data.push(`${i},"${part.name}","${part.type}",${mileage},"${wasBroken}",${severity}`);
}

const csvContent = data.join('\n');
fs.writeFileSync('mock_parts_dataset.csv', csvContent);

console.log(`Successfully generated mock_parts_dataset.csv with ${NUM_RECORDS} records.`);
