const prisma = require('../lib/prisma');

/**
 * getPredictions
 * Statistical prediction: for a given make/model at a given mileage,
 * what parts have been replaced most frequently in similar service sessions?
 *
 * @param {string} make - Vehicle make, e.g. "Toyota"
 * @param {string} model - Vehicle model, e.g. "Vios"
 * @param {number} currentMileage - Current odometer reading
 * @returns {Array} - Ranked predictions [{ partName, probability, count, avgCostMyr, category }]
 */
async function getPredictions(make, model, currentMileage) {
  const TOLERANCE = 0.20; // ±20% mileage band
  const THRESHOLD = 0.30; // Flag if replaced in >30% of similar sessions

  const lowerKm = Math.floor(currentMileage * (1 - TOLERANCE));
  const upperKm = Math.ceil(currentMileage * (1 + TOLERANCE));

  // Find all sessions for this make/model within mileage band
  const similarSessions = await prisma.serviceSession.findMany({
    where: {
      mileageAtVisit: { gte: lowerKm, lte: upperKm },
      vehicle: {
        make: { equals: make, mode: 'insensitive' },
        model: { equals: model, mode: 'insensitive' },
      },
    },
    include: { replacedParts: { select: { partName: true, category: true, costMyr: true } } },
  });

  if (similarSessions.length < 3) {
    // Not enough data — return empty
    return [];
  }

  // Count frequency per part
  const partStats = {};
  for (const session of similarSessions) {
    // Track unique parts per session (avoid double-counting same part replaced twice in one session)
    const seenInSession = new Set();
    for (const part of session.replacedParts) {
      if (seenInSession.has(part.partName)) continue;
      seenInSession.add(part.partName);

      if (!partStats[part.partName]) {
        partStats[part.partName] = { count: 0, costs: [], category: part.category };
      }
      partStats[part.partName].count++;
      if (part.costMyr) partStats[part.partName].costs.push(Number(part.costMyr));
    }
  }

  // Calculate probabilities and filter by threshold
  const totalSessions = similarSessions.length;
  const predictions = Object.entries(partStats)
    .map(([partName, stats]) => ({
      partName,
      category: stats.category,
      probability: stats.count / totalSessions,
      count: stats.count,
      totalSessionsAnalyzed: totalSessions,
      avgCostMyr: stats.costs.length > 0
        ? (stats.costs.reduce((a, b) => a + b, 0) / stats.costs.length).toFixed(2)
        : null,
    }))
    .filter((p) => p.probability >= THRESHOLD)
    .sort((a, b) => b.probability - a.probability);

  return predictions;
}

/**
 * generateAlerts
 * Run predictions for a vehicle and create MaintenanceAlert records.
 * Called automatically when a session is completed.
 */
async function generateAlerts(vehicleId, workshopId) {
  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) return;

    const predictions = await getPredictions(vehicle.make, vehicle.model, vehicle.currentMileage);
    if (predictions.length === 0) return;

    // Clear stale ACTIVE alerts for this vehicle
    await prisma.maintenanceAlert.updateMany({
      where: { vehicleId, status: 'ACTIVE' },
      data: { status: 'RESOLVED' },
    });

    // Create new alerts for high-probability predictions
    const alerts = predictions.map((p) => ({
      workshopId,
      vehicleId,
      alertType: `${p.partName} Due`,
      partName: p.partName,
      message: `Based on ${p.totalSessionsAnalyzed} similar ${vehicle.make} ${vehicle.model} services at ${vehicle.currentMileage.toLocaleString()}km, ${p.partName} was replaced in ${Math.round(p.probability * 100)}% of cases.`,
      probability: p.probability,
      triggerMileage: vehicle.currentMileage,
      status: 'ACTIVE',
    }));

    await prisma.maintenanceAlert.createMany({ data: alerts });
    console.log(`[Predictions] Generated ${alerts.length} alerts for vehicle ${vehicleId}`);
  } catch (err) {
    console.error('[Predictions] Alert generation error:', err.message);
  }
}

module.exports = { getPredictions, generateAlerts };
