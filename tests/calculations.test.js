import {
  calculateEnergyEmissions,
  calculateMobilityEmissions,
  calculateDietEmissions,
  calculateWasteEmissions,
  calculateTotalFootprint,
  calculatePledgeSavings,
  EMISSION_FACTORS,
} from "../src/calculations.js";

describe("Carbon Footprint Calculations", () => {
  describe("calculateEnergyEmissions", () => {
    test("should compute electricity emissions and LPG cylinder emissions", () => {
      // electricity = 100 kWh, cookingFuel = lpg, cylinders = 2
      const result = calculateEnergyEmissions(100, "lpg", 2, 0);
      const expected = (100 * EMISSION_FACTORS.electricity) + (2 * EMISSION_FACTORS.lpgCylinder);
      expect(result).toBeCloseTo(expected);
    });

    test("should compute electricity emissions and PNG emissions", () => {
      // electricity = 150 kWh, cookingFuel = png, pngUsage = 25
      const result = calculateEnergyEmissions(150, "png", 0, 25);
      const expected = (150 * EMISSION_FACTORS.electricity) + (25 * EMISSION_FACTORS.png);
      expect(result).toBeCloseTo(expected);
    });

    test("should return only electricity emissions if cookingFuel is none", () => {
      const result = calculateEnergyEmissions(200, "none", 1, 30);
      const expected = 200 * EMISSION_FACTORS.electricity;
      expect(result).toBeCloseTo(expected);
    });

    test("should handle zero inputs correctly", () => {
      const result = calculateEnergyEmissions(0, "lpg", 0, 0);
      expect(result).toBe(0);
    });
  });

  describe("calculateMobilityEmissions", () => {
    test("should compute emissions for two-wheeler commute", () => {
      // 10km daily for 30 days
      const result = calculateMobilityEmissions(10, 0, "petrol", 0);
      const expected = 10 * EMISSION_FACTORS.twoWheeler * 30;
      expect(result).toBeCloseTo(expected);
    });

    test("should compute emissions for petrol car travel", () => {
      // 20km daily for 30 days
      const result = calculateMobilityEmissions(0, 20, "petrol", 0);
      const expected = 20 * EMISSION_FACTORS.carPetrol * 30;
      expect(result).toBeCloseTo(expected);
    });

    test("should compute emissions for diesel car travel", () => {
      const result = calculateMobilityEmissions(0, 20, "diesel", 0);
      const expected = 20 * EMISSION_FACTORS.carDiesel * 30;
      expect(result).toBeCloseTo(expected);
    });

    test("should compute emissions for CNG car travel", () => {
      const result = calculateMobilityEmissions(0, 20, "cng", 0);
      const expected = 20 * EMISSION_FACTORS.carCng * 30;
      expect(result).toBeCloseTo(expected);
    });

    test("should compute emissions for EV car travel", () => {
      const result = calculateMobilityEmissions(0, 20, "ev", 0);
      const expected = 20 * EMISSION_FACTORS.carEv * 30;
      expect(result).toBeCloseTo(expected);
    });

    test("should compute public transit emissions", () => {
      const result = calculateMobilityEmissions(0, 0, "petrol", 40);
      const expected = 40 * EMISSION_FACTORS.publicTransit * 30;
      expect(result).toBeCloseTo(expected);
    });

    test("should compute combined transit travel", () => {
      const result = calculateMobilityEmissions(10, 15, "diesel", 25);
      const expected =
        (10 * EMISSION_FACTORS.twoWheeler * 30) +
        (15 * EMISSION_FACTORS.carDiesel * 30) +
        (25 * EMISSION_FACTORS.publicTransit * 30);
      expect(result).toBeCloseTo(expected);
    });
  });

  describe("calculateDietEmissions", () => {
    test("should compute emissions for pure vegetarian diet with no dining out", () => {
      const result = calculateDietEmissions("vegetarian-low", 0, "some");
      const expected = EMISSION_FACTORS.dietBase["vegetarian-low"];
      expect(result).toBeCloseTo(expected);
    });

    test("should apply 10% discount for mostly local/organic foods", () => {
      const result = calculateDietEmissions("vegetarian-low", 0, "mostly");
      const expected = EMISSION_FACTORS.dietBase["vegetarian-low"] * 0.9;
      expect(result).toBeCloseTo(expected);
    });

    test("should apply 15% markup for rarely local / imported foods", () => {
      const result = calculateDietEmissions("nonveg-high", 4, "rarely");
      const base = EMISSION_FACTORS.dietBase["nonveg-high"] + (4 * EMISSION_FACTORS.diningOutMultiplier);
      const expected = base * 1.15;
      expect(result).toBeCloseTo(expected);
    });

    test("should compute emissions with frequent dining out", () => {
      const result = calculateDietEmissions("nonveg-low", 6, "some");
      const expected = EMISSION_FACTORS.dietBase["nonveg-low"] + (6 * EMISSION_FACTORS.diningOutMultiplier);
      expect(result).toBeCloseTo(expected);
    });
  });

  describe("calculateWasteEmissions", () => {
    test("should compute emissions with strict segregation and composting", () => {
      const result = calculateWasteEmissions("yes", "yes", "minimal");
      const expected = EMISSION_FACTORS.wasteBase["yes"] + EMISSION_FACTORS.plasticAddition["minimal"];
      expect(result).toBeCloseTo(expected);
    });

    test("should add extra emissions if composting is no", () => {
      const result = calculateWasteEmissions("partial", "no", "moderate");
      const expected =
        EMISSION_FACTORS.wasteBase["partial"] +
        EMISSION_FACTORS.wasteCompostNo +
        EMISSION_FACTORS.plasticAddition["moderate"];
      expect(result).toBeCloseTo(expected);
    });

    test("should handle high plastic consumption markup", () => {
      const result = calculateWasteEmissions("no", "no", "high");
      const expected =
        EMISSION_FACTORS.wasteBase["no"] +
        EMISSION_FACTORS.wasteCompostNo +
        EMISSION_FACTORS.plasticAddition["high"];
      expect(result).toBeCloseTo(expected);
    });
  });

  describe("calculateTotalFootprint", () => {
    test("should sum up all emission category values correctly", () => {
      const inputs = {
        electricity: 120,
        cookingFuel: "lpg",
        lpgCylinders: 1,
        pngUsage: 0,
        twoWheeler: 5,
        carTravel: 0,
        carFuel: "petrol",
        publicTransit: 10,
        dietType: "vegetarian-high",
        diningOut: 2,
        localFood: "mostly",
        wasteSegregation: "yes",
        composting: "yes",
        singleUsePlastic: "minimal",
      };

      const result = calculateTotalFootprint(inputs);

      const energyExpected = calculateEnergyEmissions(120, "lpg", 1, 0);
      const mobilityExpected = calculateMobilityEmissions(5, 0, "petrol", 10);
      const dietExpected = calculateDietEmissions("vegetarian-high", 2, "mostly");
      const wasteExpected = calculateWasteEmissions("yes", "yes", "minimal");
      const totalExpected = energyExpected + mobilityExpected + dietExpected + wasteExpected;

      expect(result.energy).toBeCloseTo(energyExpected);
      expect(result.mobility).toBeCloseTo(mobilityExpected);
      expect(result.diet).toBeCloseTo(dietExpected);
      expect(result.waste).toBeCloseTo(wasteExpected);
      expect(result.total).toBeCloseTo(totalExpected);
    });
  });

  describe("calculatePledgeSavings", () => {
    test("should compute correct savings, optimized footprint, and tree offset", () => {
      const initialFootprint = 200;
      const pledgeValues = [10, 25, 5]; // total savings 40

      const result = calculatePledgeSavings(pledgeValues, initialFootprint);
      expect(result.savings).toBe(40);
      expect(result.optimizedFootprint).toBe(160);

      // Trees offset: (savings * 12) / 22
      const expectedTrees = (40 * 12) / 22;
      expect(result.treesOffset).toBeCloseTo(expectedTrees);
    });

    test("should cap optimized footprint at 20 kg minimum and correct savings accordingly", () => {
      const initialFootprint = 50;
      const pledgeValues = [25, 45, 10]; // total savings 80, but capped at 20kg

      const result = calculatePledgeSavings(pledgeValues, initialFootprint);
      expect(result.optimizedFootprint).toBe(20);
      // Actual savings achieved: initial (50) - optimized (20) = 30
      expect(result.savings).toBe(30);

      const expectedTrees = (30 * 12) / 22;
      expect(result.treesOffset).toBeCloseTo(expectedTrees);
    });
  });
});
