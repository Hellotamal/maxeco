/**
 * MaxEco Energy & Tech — Solar Capacity & ROI Calculator Engine
 * Calibrated for Guwahati, Assam and Northeast India Solar Irradiance
 */

export const SOLAR_BENCHMARKS = {
  // Average specific yield for Guwahati, Assam (kWh/kWp/year)
  ANNUAL_YIELD_KWH_PER_KWP: 1320,
  // Average monthly generation factor (kWh/kWp/month)
  MONTHLY_YIELD_KWH_PER_KWP: 110,
  // Required shadow-free rooftop space per kWp using high-efficiency Tier-1 Mono PERC panels (Sq. Ft.)
  SQ_FT_PER_KWP: 100,
  // Benchmark turnkey commercial EPC cost per kWp (INR) including panels, inverter, mounting, ACDB/DCDB, and net-metering kit
  BENCHMARK_COST_PER_KWP: 58000,
  // Default APDCL Tariff Slabs (INR per kWh)
  TARIFFS: {
    commercial: { label: 'Commercial (APDCL LT/HT)', rate: 7.85 },
    industrial: { label: 'Industrial (APDCL S&M)', rate: 6.80 },
    residential: { label: 'Residential (APDCL Slab)', rate: 6.20 }
  }
};

/**
 * Calculates solar feasibility and ROI
 * @param {Object} params
 * @param {number} params.monthlyBill - Average monthly electricity bill in INR
 * @param {number} params.tariff - Applicable tariff in INR per kWh
 * @param {number} params.roofArea - Available shadow-free roof area in Sq. Ft.
 * @returns {Object} Feasibility breakdown with inputs, outputs, assumptions, and disclaimers
 */
export function calculateSolarFeasibility({
  monthlyBill = 6000,
  tariff = SOLAR_BENCHMARKS.TARIFFS.commercial.rate,
  roofArea = 600
}) {
  // Sanitize and validate inputs
  const safeBill = Math.max(0, Number(monthlyBill) || 0);
  const safeTariff = Math.max(1, Number(tariff) || SOLAR_BENCHMARKS.TARIFFS.commercial.rate);
  const safeArea = Math.max(0, Number(roofArea) || 0);

  if (safeBill <= 0 || safeArea <= 0) {
    return {
      isValid: false,
      message: 'Please provide a valid monthly electricity bill and available rooftop area.'
    };
  }

  // 1. Calculate monthly electricity consumption units
  const monthlyUnitsConsumed = safeBill / safeTariff;

  // 2. Ideal capacity needed to offset 100% of daytime consumption
  const idealCapacityKw = monthlyUnitsConsumed / SOLAR_BENCHMARKS.MONTHLY_YIELD_KWH_PER_KWP;

  // 3. Maximum capacity physically supported by available rooftop space
  const maxAreaCapacityKw = safeArea / SOLAR_BENCHMARKS.SQ_FT_PER_KWP;

  // 4. Feasible recommended plant size
  const recommendedKwRaw = Math.min(idealCapacityKw, maxAreaCapacityKw);
  // Round to 1 decimal place, minimum 1 kWp for meaningful commercial/residential installation
  const recommendedKw = Math.max(1.0, Math.round(recommendedKwRaw * 10) / 10);

  // Check if rooftop space is the limiting bottleneck
  const isRoofConstrained = maxAreaCapacityKw < idealCapacityKw;

  // 5. Projected generation metrics
  const monthlyGenerationKwh = Math.round(recommendedKw * SOLAR_BENCHMARKS.MONTHLY_YIELD_KWH_PER_KWP);
  const annualGenerationKwh = Math.round(recommendedKw * SOLAR_BENCHMARKS.ANNUAL_YIELD_KWH_PER_KWP);

  // 6. Financial savings
  const annualFinancialSavings = Math.round(annualGenerationKwh * safeTariff);
  const monthlyFinancialSavings = Math.round(monthlyGenerationKwh * safeTariff);

  // 7. Estimated turnkey capital expenditure
  const estimatedCapexMin = Math.round(recommendedKw * 54000);
  const estimatedCapexMax = Math.round(recommendedKw * 62000);
  const estimatedCapexAvg = Math.round(recommendedKw * SOLAR_BENCHMARKS.BENCHMARK_COST_PER_KWP);

  // 8. Simple payback period in years
  const paybackYearsRaw = annualFinancialSavings > 0 ? (estimatedCapexAvg / annualFinancialSavings) : 0;
  const paybackYears = Math.round(paybackYearsRaw * 10) / 10;

  // 9. Environmental impact
  // 1 kWh solar offsets ~0.82 kg CO2 in Indian grid mix
  const annualCo2MitigationTonnes = Math.round((annualGenerationKwh * 0.82 / 1000) * 10) / 10;
  const areaUtilizedSqFt = Math.round(recommendedKw * SOLAR_BENCHMARKS.SQ_FT_PER_KWP);

  return {
    isValid: true,
    inputs: {
      monthlyBill: safeBill,
      tariff: safeTariff,
      roofArea: safeArea
    },
    outputs: {
      recommendedKw,
      isRoofConstrained,
      monthlyUnitsConsumed: Math.round(monthlyUnitsConsumed),
      monthlyGenerationKwh,
      annualGenerationKwh,
      annualFinancialSavings,
      monthlyFinancialSavings,
      estimatedCapexMin,
      estimatedCapexMax,
      estimatedCapexAvg,
      paybackYears,
      areaUtilizedSqFt,
      annualCo2MitigationTonnes
    },
    assumptions: {
      yieldAnnual: `${SOLAR_BENCHMARKS.ANNUAL_YIELD_KWH_PER_KWP} kWh/kWp/year (Guwahati solar irradiance)`,
      areaFactor: `${SOLAR_BENCHMARKS.SQ_FT_PER_KWP} sq. ft. per kWp (Tier-1 Mono PERC)`,
      benchmarkCost: `₹${SOLAR_BENCHMARKS.BENCHMARK_COST_PER_KWP.toLocaleString('en-IN')}/kWp indicative turnkey installation`
    },
    disclaimer: 'Estimates are indicative and depend on site conditions, actual electricity tariffs, system design, equipment cost, consumption patterns, applicable regulations, and other project-specific factors. A site assessment is required for a reliable proposal.'
  };
}
