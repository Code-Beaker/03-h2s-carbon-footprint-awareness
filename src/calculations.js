// Regional emission factors (coal grid, LPG cylinders, transit splits)
export const EMISSION_FACTORS = {
  electricity: 0.82, // kg CO2e per kWh (coal-dominated electricity grid)
  lpgCylinder: 14.2 * 2.984, // ~42.37 kg CO2e per 14.2 kg cylinder
  png: 2.02, // kg CO2e per cubic meter (PNG)
  twoWheeler: 0.045, // kg CO2e per km (average petrol scooter/bike)
  carPetrol: 0.18, // kg CO2e per km
  carDiesel: 0.2, // kg CO2e per km
  carCng: 0.12, // kg CO2e per km
  carEv: 0.07, // kg CO2e per km (efficiency ~7 km/kWh charged on coal grid)
  publicTransit: 0.015, // kg CO2e per km (weighted mix of local train, metro & buses)
  dietBase: {
    "vegetarian-low": 80,
    "vegetarian-high": 110,
    eggetarian: 120,
    "nonveg-low": 150,
    "nonveg-high": 220,
  },
  diningOutMultiplier: 6, // kg CO2e per occurrence
  wasteBase: {
    yes: 5,
    partial: 12,
    no: 20,
  },
  wasteCompostNo: 15, // kg CO2e added if wet waste is not composted
  plasticAddition: {
    minimal: 0,
    moderate: 4,
    high: 8,
  },
};

/**
 * Calculates monthly household energy emissions.
 */
export function calculateEnergyEmissions(electricity, cookingFuel, lpgCylinders, pngUsage) {
  let energyEmissions = electricity * EMISSION_FACTORS.electricity;
  if (cookingFuel === "lpg") {
    energyEmissions += lpgCylinders * EMISSION_FACTORS.lpgCylinder;
  } else if (cookingFuel === "png") {
    energyEmissions += pngUsage * EMISSION_FACTORS.png;
  }
  return energyEmissions;
}

/**
 * Calculates monthly mobility emissions (daily values multiplied by 30).
 */
export function calculateMobilityEmissions(twoWheeler, carTravel, carFuel, publicTransit) {
  let mobilityEmissions =
    twoWheeler * EMISSION_FACTORS.twoWheeler * 30 +
    publicTransit * EMISSION_FACTORS.publicTransit * 30;
  if (carTravel > 0) {
    let carFactor = EMISSION_FACTORS.carPetrol;
    if (carFuel === "diesel") carFactor = EMISSION_FACTORS.carDiesel;
    else if (carFuel === "cng") carFactor = EMISSION_FACTORS.carCng;
    else if (carFuel === "ev") carFactor = EMISSION_FACTORS.carEv;

    mobilityEmissions += carTravel * carFactor * 30;
  }
  return mobilityEmissions;
}

/**
 * Calculates monthly diet and dining out emissions.
 */
export function calculateDietEmissions(dietType, diningOut, localFood) {
  let dietEmissions =
    EMISSION_FACTORS.dietBase[dietType] +
    diningOut * EMISSION_FACTORS.diningOutMultiplier;
  if (localFood === "mostly") {
    dietEmissions *= 0.9; // 10% reduction
  } else if (localFood === "rarely") {
    dietEmissions *= 1.15; // 15% increase
  }
  return dietEmissions;
}

/**
 * Calculates monthly waste emissions.
 */
export function calculateWasteEmissions(wasteSegregation, composting, singleUsePlastic) {
  let wasteEmissions = EMISSION_FACTORS.wasteBase[wasteSegregation];
  if (composting === "no") {
    wasteEmissions += EMISSION_FACTORS.wasteCompostNo;
  }
  wasteEmissions += EMISSION_FACTORS.plasticAddition[singleUsePlastic];
  return wasteEmissions;
}

/**
 * Calculates total monthly carbon footprint.
 */
export function calculateTotalFootprint(inputs) {
  const energy = calculateEnergyEmissions(
    inputs.electricity,
    inputs.cookingFuel,
    inputs.lpgCylinders,
    inputs.pngUsage
  );
  const mobility = calculateMobilityEmissions(
    inputs.twoWheeler,
    inputs.carTravel,
    inputs.carFuel,
    inputs.publicTransit
  );
  const diet = calculateDietEmissions(
    inputs.dietType,
    inputs.diningOut,
    inputs.localFood
  );
  const waste = calculateWasteEmissions(
    inputs.wasteSegregation,
    inputs.composting,
    inputs.singleUsePlastic
  );

  return {
    total: energy + mobility + diet + waste,
    energy,
    mobility,
    diet,
    waste,
  };
}

/**
 * Calculates optimized footprint and trees offset based on pledge values.
 */
export function calculatePledgeSavings(activePledgeValues, initialFootprint) {
  let savings = 0;
  activePledgeValues.forEach((val) => {
    savings += val;
  });

  // Calculate final result (cap at minimum 20 kg to represent unavoidable public overhead)
  const optimizedFootprint = Math.max(initialFootprint - savings, 20);
  const correctedSavings = initialFootprint - optimizedFootprint;

  // Equivalent trees (absorb 22 kg CO2 per year)
  // savings are monthly, so annual savings = correctedSavings * 12
  const treesOffset = (correctedSavings * 12) / 22;

  return {
    savings: correctedSavings,
    optimizedFootprint,
    treesOffset,
  };
}
