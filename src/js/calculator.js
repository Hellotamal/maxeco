// MaxEco Guwahati & Northeast India Solar Sizing & Financial Model Engine
// Based on APDCL regulatory framework and regional solar insolation (~120 kWh/kWp/month)

class SolarCalculator {
  constructor() {
    this.ASSAM_GEN_FACTOR = 120; // Units (kWh) generated per kWp per month in Assam
    this.AREA_PER_KWP = 95;      // Approx sq. ft of shadow-free rooftop area per kWp
    this.AVG_COST_PER_KWP = 52000; // Benchmark on-grid solar EPC cost per kWp (INR)
    this.TARIFFS = {
      commercial: 7.85, // APDCL Commercial LT benchmark
      domestic: 6.20,   // APDCL Domestic benchmark
      industrial: 7.20  // APDCL Industrial LT/HT benchmark
    };
  }

  calculate({ sanctionedLoadKw, monthlyBill, customerType, roofAreaSqFt }) {
    sanctionedLoadKw = Math.max(1, Number(sanctionedLoadKw) || 5);
    monthlyBill = Math.max(500, Number(monthlyBill) || 5000);
    customerType = this.TARIFFS[customerType] ? customerType : 'commercial';
    const tariff = this.TARIFFS[customerType];

    // Estimated monthly consumption in units (kWh)
    const estimatedMonthlyUnits = Math.round(monthlyBill / tariff);

    // Theoretical capacity needed to offset 100% of consumption
    const theoreticalKw = estimatedMonthlyUnits / this.ASSAM_GEN_FACTOR;

    // Constraint 1: APDCL Net Metering Cap (up to 100% of Sanctioned Load)
    const loadCappedKw = Math.min(theoreticalKw, sanctionedLoadKw);

    // Constraint 2: Available Rooftop Area (if provided)
    let finalCapacityKw = loadCappedKw;
    if (roofAreaSqFt && Number(roofAreaSqFt) > 0) {
      const maxKwByArea = Number(roofAreaSqFt) / this.AREA_PER_KWP;
      finalCapacityKw = Math.min(finalCapacityKw, maxKwByArea);
    }

    // Round to 1 decimal place (minimum 1 kWp)
    finalCapacityKw = Math.max(1, Math.round(finalCapacityKw * 10) / 10);

    // Generation metrics
    const monthlyGenerationUnits = Math.round(finalCapacityKw * this.ASSAM_GEN_FACTOR);
    const annualGenerationUnits = monthlyGenerationUnits * 12;

    // Financial savings
    const monthlySavings = Math.round(monthlyGenerationUnits * tariff);
    const annualSavings = monthlySavings * 12;

    // Investment estimate
    const estimatedInvestmentMin = Math.round(finalCapacityKw * (this.AVG_COST_PER_KWP * 0.92));
    const estimatedInvestmentMax = Math.round(finalCapacityKw * (this.AVG_COST_PER_KWP * 1.08));
    const avgInvestment = Math.round(finalCapacityKw * this.AVG_COST_PER_KWP);

    // Payback period in years
    const paybackYears = (avgInvestment / annualSavings).toFixed(1);

    // Area required
    const recommendedRoofArea = Math.round(finalCapacityKw * this.AREA_PER_KWP);

    // 25-Year lifetime savings (assuming 0.7% degradation/year, conservative)
    let lifetimeSavings = 0;
    let currAnnualSavings = annualSavings;
    for (let yr = 1; yr <= 25; yr++) {
      lifetimeSavings += currAnnualSavings;
      currAnnualSavings *= 0.993; // 0.7% yearly solar degradation
    }
    lifetimeSavings = Math.round(lifetimeSavings);

    // 25-Year CO2 emission reduction (Assam grid emission factor ~0.82 kg CO2 / kWh)
    const co2OffsetTonnes25Yr = Math.round((annualGenerationUnits * 25 * 0.82) / 1000);

    return {
      sanctionedLoadKw,
      monthlyBill,
      customerType,
      tariff,
      finalCapacityKw,
      recommendedRoofArea,
      monthlyGenerationUnits,
      annualGenerationUnits,
      monthlySavings,
      annualSavings,
      avgInvestment,
      estimatedInvestmentMin,
      estimatedInvestmentMax,
      paybackYears,
      lifetimeSavings,
      co2OffsetTonnes25Yr,
      disclaimer: "Advisory estimates based on APDCL average tariffs and Assam solar irradiation (~120 units/kWp/month). Actual sanctioned solar capacity is subject to APDCL distribution transformer capacity margin and physical roof shading."
    };
  }

  generateWhatsAppEnquiryUrl(calcResult, phone = "919876543210") {
    const text = encodeURIComponent(
      `Hello MaxEco Energy & Tech,\n\n` +
      `I used your Solar Sizing Calculator for my ${calcResult.customerType.toUpperCase()} property in Assam:\n` +
      `• Proposed System: ${calcResult.finalCapacityKw} kWp Rooftop Solar\n` +
      `• Monthly Bill: ₹${calcResult.monthlyBill.toLocaleString('en-IN')}\n` +
      `• Est. Monthly Generation: ~${calcResult.monthlyGenerationUnits} units\n` +
      `• Est. Annual Savings: ~₹${calcResult.annualSavings.toLocaleString('en-IN')}\n\n` +
      `I would like to request an on-site feasibility assessment & APDCL net-metering guidance.`
    );
    return `https://wa.me/${phone}?text=${text}`;
  }
}

window.solarCalculator = new SolarCalculator();
