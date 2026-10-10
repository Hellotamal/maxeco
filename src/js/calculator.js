// MaxEco Advanced Solar Feasibility & Generation Engine
// Integrated with PVGIS (Photovoltaic Geographical Information System) regional benchmarks,
// tilt & azimuth orientation geometry, shading derating, APDCL net-metering regulations,
// and equipment datasheet verification checklist.

class SolarCalculator {
  constructor() {
    this.AREA_PER_KWP = 95;        // Approx sq. ft of shadow-free rooftop area per kWp
    this.AVG_COST_PER_KWP = 52000; // Benchmark on-grid solar EPC cost per kWp (INR) in Assam
    this.TARIFFS = {
      commercial: 7.85, // APDCL Commercial LT benchmark
      domestic: 6.20,   // APDCL Domestic benchmark
      industrial: 7.20  // APDCL Industrial LT/HT benchmark
    };

    // Regional solar irradiance profiles calibrated to PVGIS (SARAH-2 satellite dataset)
    this.LOCATION_PRESETS = {
      guwahati: { name: "Guwahati (Kamrup Metro, Assam)", lat: 26.1445, lon: 91.7362, baseSpecificYield: 1420 },
      dibrugarh: { name: "Dibrugarh (Upper Assam)", lat: 27.4728, lon: 94.9120, baseSpecificYield: 1360 },
      silchar: { name: "Silchar (Barak Valley, Assam)", lat: 24.8333, lon: 92.7789, baseSpecificYield: 1390 },
      tezpur: { name: "Tezpur (Sonitpur, Assam)", lat: 26.6528, lon: 92.7926, baseSpecificYield: 1410 },
      jorhat: { name: "Jorhat (Upper Assam)", lat: 26.7509, lon: 94.2037, baseSpecificYield: 1380 },
      shillong: { name: "Shillong (Meghalaya)", lat: 25.5788, lon: 91.8933, baseSpecificYield: 1350 },
      agartala: { name: "Agartala (Tripura)", lat: 23.8315, lon: 91.2868, baseSpecificYield: 1430 }
    };

    // Monthly solar distribution weights in Assam (Monsoon dip in Jun-Aug, clear winter/spring)
    // Normalized to sum to 1.0
    this.MONTHLY_WEIGHTS = [
      0.082, // Jan: clear winter, short days
      0.088, // Feb: high sun hours
      0.098, // Mar: spring peak
      0.096, // Apr: pre-monsoon
      0.088, // May: thunder showers starting
      0.068, // Jun: peak monsoon cloud cover & rain
      0.065, // Jul: heavy monsoon
      0.072, // Aug: late monsoon
      0.080, // Sep: clearing skies
      0.092, // Oct: autumn peak
      0.087, // Nov: clear post-monsoon
      0.084  // Dec: clear, mild morning fog
    ];
  }

  // Calculate orientation and tilt derating factor based on PVGIS geometric solar model
  calculateOrientationFactor(tiltAngle = 25, azimuth = 0) {
    tiltAngle = Number(tiltAngle) || 25;
    azimuth = Number(azimuth) || 0; // 0 = South, 90 = West, -90 = East, 180 = North

    // In Guwahati (Lat ~26° N), optimal fixed tilt is ~24°-26° facing true South (azimuth 0°)
    const optimalTilt = 25;
    const tiltDiff = Math.abs(tiltAngle - optimalTilt);
    const tiltLossPercent = (tiltDiff * 0.25); // ~0.25% loss per degree away from optimal

    // Azimuth loss: South is 100%, East/West (-90/+90) incurs ~14-18% penalty
    const azimuthRad = Math.abs(azimuth) * (Math.PI / 180);
    const azimuthLossPercent = (1 - Math.cos(azimuthRad * 0.6)) * 28;

    const totalGeometricEfficiency = Math.max(0.65, 1 - ((tiltLossPercent + azimuthLossPercent) / 100));
    return totalGeometricEfficiency;
  }

  calculate({
    sanctionedLoadKw,
    monthlyBill,
    customerType = 'commercial',
    roofAreaSqFt,
    locationKey = 'guwahati',
    tiltAngle = 25,
    azimuth = 0,
    shadingLossPercent = 3,
    systemLossPercent = 14
  }) {
    sanctionedLoadKw = Math.max(1, Number(sanctionedLoadKw) || 5);
    monthlyBill = Math.max(500, Number(monthlyBill) || 5000);
    customerType = this.TARIFFS[customerType] ? customerType : 'commercial';
    const tariff = this.TARIFFS[customerType];

    const location = this.LOCATION_PRESETS[locationKey] || this.LOCATION_PRESETS.guwahati;
    const orientationFactor = this.calculateOrientationFactor(tiltAngle, azimuth);
    
    // Total system derate (system loss default 14% + local shading)
    const systemLossFactor = (100 - (Number(systemLossPercent) || 14)) / 86; // normalized against standard 14% loss
    const shadingFactor = (100 - Math.min(50, Math.max(0, Number(shadingLossPercent) || 0))) / 100;

    // Effective Specific Yield (kWh per kWp per year)
    const effectiveSpecificYield = Math.round(location.baseSpecificYield * orientationFactor * systemLossFactor * shadingFactor);
    const avgMonthlyGenPerKwp = effectiveSpecificYield / 12;

    // Estimated monthly consumption in units (kWh)
    const estimatedMonthlyUnits = Math.round(monthlyBill / tariff);

    // Theoretical capacity needed to offset 100% of consumption
    const theoreticalKw = estimatedMonthlyUnits / avgMonthlyGenPerKwp;

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

    // Annual and Monthly generation metrics
    const annualGenerationUnits = Math.round(finalCapacityKw * effectiveSpecificYield);
    const monthlyGenerationUnits = Math.round(annualGenerationUnits / 12);

    // Monthly breakdown (12 months) accounting for Assam monsoon seasonality
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyBreakdown = months.map((monthName, idx) => {
      const gen = Math.round(annualGenerationUnits * this.MONTHLY_WEIGHTS[idx]);
      return {
        month: monthName,
        generationUnits: gen,
        savings: Math.round(gen * tariff)
      };
    });

    // Financial savings
    const monthlySavings = Math.round(monthlyGenerationUnits * tariff);
    const annualSavings = Math.round(annualGenerationUnits * tariff);

    // Investment estimate
    const estimatedInvestmentMin = Math.round(finalCapacityKw * (this.AVG_COST_PER_KWP * 0.92));
    const estimatedInvestmentMax = Math.round(finalCapacityKw * (this.AVG_COST_PER_KWP * 1.08));
    const avgInvestment = Math.round(finalCapacityKw * this.AVG_COST_PER_KWP);

    // Payback period in years
    const paybackYears = (avgInvestment / annualSavings).toFixed(1);

    // Area required
    const recommendedRoofArea = Math.round(finalCapacityKw * this.AREA_PER_KWP);

    // 25-Year lifetime savings (factoring 0.7% annual solar degradation)
    let lifetimeSavings = 0;
    let currAnnualSavings = annualSavings;
    for (let yr = 1; yr <= 25; yr++) {
      lifetimeSavings += currAnnualSavings;
      currAnnualSavings *= 0.993;
    }
    lifetimeSavings = Math.round(lifetimeSavings);

    // 25-Year CO2 emission reduction (Assam grid factor ~0.82 kg CO2 / kWh)
    const co2OffsetTonnes25Yr = Math.round((annualGenerationUnits * 25 * 0.82) / 1000);

    // Generate direct PVGIS simulation tool URL for cross-verification
    const pvgisUrl = this.generatePvgisUrl({
      lat: location.lat,
      lon: location.lon,
      peakPowerKw: finalCapacityKw,
      tilt: tiltAngle,
      azimuth: azimuth,
      systemLoss: systemLossPercent
    });

    return {
      sanctionedLoadKw,
      monthlyBill,
      customerType,
      tariff,
      location,
      tiltAngle,
      azimuth,
      shadingLossPercent,
      systemLossPercent,
      effectiveSpecificYield,
      finalCapacityKw,
      recommendedRoofArea,
      monthlyGenerationUnits,
      annualGenerationUnits,
      monthlyBreakdown,
      monthlySavings,
      annualSavings,
      avgInvestment,
      estimatedInvestmentMin,
      estimatedInvestmentMax,
      paybackYears,
      lifetimeSavings,
      co2OffsetTonnes25Yr,
      pvgisUrl,
      disclaimer: "Advisory estimates calibrated to PVGIS SARAH-2 satellite solar databases, regional Assam monsoon weather patterns, and APDCL benchmark tariffs. Actual project performance requires on-site shadow path analysis, local roof structural inspection, equipment datasheet validation, and APDCL transformer headroom approval."
    };
  }

  // Official European Commission PVGIS tool link generator
  generatePvgisUrl({ lat, lon, peakPowerKw, tilt = 25, azimuth = 0, systemLoss = 14 }) {
    // PVGIS format: aspect 0=South, 90=West, -90=East
    return `https://re.jrc.ec.europa.eu/pvg_tools/en/#PVP?lat=${lat}&lon=${lon}&peakpower=${peakPowerKw}&loss=${systemLoss}&angle=${tilt}&aspect=${azimuth}`;
  }

  generateWhatsAppEnquiryUrl(calcResult, phone = "919876543210") {
    const text = encodeURIComponent(
      `Hello MaxEco Energy & Tech,\n\n` +
      `I ran a preliminary solar feasibility assessment using your PVGIS-calibrated model for ${calcResult.location.name}:\n` +
      `• Proposed System: ${calcResult.finalCapacityKw} kWp Rooftop Solar\n` +
      `• Tilt & Azimuth: ${calcResult.tiltAngle}° Tilt / ${calcResult.azimuth}° Azimuth\n` +
      `• Specific Yield: ~${calcResult.effectiveSpecificYield} kWh/kWp/year\n` +
      `• Est. Annual Generation: ~${calcResult.annualGenerationUnits.toLocaleString('en-IN')} units\n` +
      `• Est. Annual Savings: ~₹${calcResult.annualSavings.toLocaleString('en-IN')}\n\n` +
      `I would like to schedule an on-site shading survey, roof inspection, and APDCL net-metering review.`
    );
    return `https://wa.me/${phone}?text=${text}`;
  }

  // Comprehensive Site Survey & Engineering Feasibility Checklist for proposals
  getFeasibilityChecklist() {
    return [
      {
        category: "1. Solar Irradiance & Orientation",
        items: [
          "Cross-reference preliminary specific yield (kWh/kWp/yr) against PVGIS satellite dataset for site coordinates.",
          "Measure true roof azimuth using compass / solar noon reference (South = 0°, East = -90°, West = +90°).",
          "Verify optimal tilt angle (Assam benchmark: 24°–26° for RCC, or existing roof pitch for industrial sheds)."
        ]
      },
      {
        category: "2. Local Shading & Obstruction Analysis",
        items: [
          "Conduct horizon and near-shading survey for parapets, water tanks, lift machine rooms, and cell towers.",
          "Survey external tree growth and neighboring multi-story buildings across winter/summer sun paths.",
          "Apply shading derate factor (0%–15%+) to ensure generation estimates reflect actual unshaded hours."
        ]
      },
      {
        category: "3. Rooftop Structural & Wind Load Integrity",
        items: [
          "Inspect RCC slab waterproof coating or industrial GI/color-coated sheet gauge (minimum 0.5mm recommended).",
          "Verify structure design matches Assam Wind Zone 5 standards (gust velocities up to 50 m/s / 180 km/h).",
          "Confirm hot-dip galvanized mounting structures (minimum 80 microns coating) or anodized aluminum rails."
        ]
      },
      {
        category: "4. Equipment Datasheet & Component Validation",
        items: [
          "Solar Modules: Verify ALMM (Approved List of Models and Manufacturers) listing, BIS certification, and Temperature Coefficient of Pmax (lower than -0.35%/°C preferred for Assam summer humidity).",
          "Inverters: Verify dual/multi MPPT voltage window matches module string sizing, CEC/European efficiency >98%, and built-in Type-II Surge Protection Devices (SPD).",
          "DC Cabling: UV-resistant, halogen-free cross-linked polyethylene (XLPO) solar DC cables."
        ]
      },
      {
        category: "5. DISCOM / APDCL Regulatory Interconnection",
        items: [
          "Verify APDCL distribution transformer capacity margin (total solar capacity on transformer typically capped at 70%–80% of rating under AERC norms).",
          "Confirm consumer connection sanctioned load and supply phase (LT Single Phase up to 5 kW, LT Three Phase up to 50 kW, HT 11 kV above 50 kW).",
          "Ensure CEIG (Chief Electrical Inspector to Government of Assam) approval preparation for applicable system sizes.",
          "Provide dedicated chemical earthing pits (separate for AC, DC, and Lightning Arrestor) with earth resistance < 5 Ohms."
        ]
      }
    ];
  }
}

window.solarCalculator = new SolarCalculator();
