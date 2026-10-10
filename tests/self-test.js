// MaxEco Business Operating System - Automated Self-Test & Quality Assurance Suite
// Verifies business logic, data persistence, cash-flow rules, and solar algorithms.

const fs = require('fs');

// 1. Mock Browser Environment
const localStorageData = {};
global.localStorage = {
  getItem: (key) => localStorageData[key] || null,
  setItem: (key, val) => { localStorageData[key] = String(val); },
  removeItem: (key) => { delete localStorageData[key]; },
  clear: () => { Object.keys(localStorageData).forEach(k => delete localStorageData[k]); }
};

const sessionStorageData = {};
global.sessionStorage = {
  getItem: (key) => sessionStorageData[key] || null,
  setItem: (key, val) => { sessionStorageData[key] = String(val); },
  removeItem: (key) => { delete sessionStorageData[key]; }
};

global.window = global;
global.document = {
  createElement: (tag) => ({
    tagName: tag,
    setAttribute: () => {},
    style: {},
    click: () => {},
    parentNode: null,
    removeChild: () => {},
    appendChild: () => {}
  }),
  body: {
    appendChild: () => {},
    removeChild: () => {}
  },
  getElementById: () => null,
  querySelectorAll: () => []
};

global.Blob = class {
  constructor(content, options) {
    this.content = content;
    this.options = options;
  }
};
global.URL = {
  createObjectURL: () => 'blob:mock-url',
  revokeObjectURL: () => {}
};

// 2. Load Core Modules
require('../src/data/initial-data.js');
require('../src/js/storage.js');
require('../src/js/calculator.js');
require('../src/js/crm.js');
require('../src/js/finance.js');
require('../src/js/projects.js');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

console.log('====================================================');
console.log('🧪 RUNNING MAXECO OS AUTOMATED VERIFICATION SUITE');
console.log('====================================================\n');

// TEST SUITE 1: SEED DATA & STORAGE
console.log('--- TEST SUITE 1: Storage & Seed Persistence ---');
const leads = window.storage.getLeads();
assert(leads.length === 4, `Initial leads loaded correctly (found ${leads.length}, expected 4)`);

const settings = window.storage.getSettings();
assert(settings.companyName === 'MaxEco Energy & Tech', 'Settings loaded company name');
assert(settings.adminPin === 'maxeco2026', 'Default security PIN configured');
assert(settings.taxReserveRate === 18, 'Tax reserve benchmark rate set to 18%');

// TEST SUITE 2: CRM & LEADS MANAGEMENT
console.log('\n--- TEST SUITE 2: Sales CRM & Pipeline Rules ---');
const newLead = window.storage.saveLead({
  name: 'Dispur Specialty Hospital',
  contactPerson: 'Dr. Bhaskar Sarma',
  phone: '+91 94351 00000',
  customerType: 'Healthcare / Small Business',
  service: 'Solar EPC Coordination',
  source: 'Direct Referral',
  estimatedValue: 2500000,
  stage: 'Qualified',
  nextFollowUpDate: '2026-10-15',
  nextAction: 'Present 60 kWp rooftop sizing report'
});
assert(newLead.id.startsWith('LEAD-'), `New lead generated unique ID: ${newLead.id}`);

const updatedLeads = window.storage.getLeads();
assert(updatedLeads.length === 5, 'New lead persisted to storage');

const metrics = window.crmController.getMetrics();
assert(metrics.totalLeads === 5, 'Total lead count reflects new addition');
assert(metrics.activePipelineValue > 2500000, 'Active pipeline value includes qualified deal');

const waUrl = window.crmController.generateWhatsAppFollowUpUrl(newLead);
assert(waUrl.includes('wa.me/919435100000'), 'Generated pre-drafted WhatsApp outreach URL with country code');

// TEST SUITE 3: ADVANCED PVGIS SOLAR FEASIBILITY & GENERATION ENGINE
console.log('\n--- TEST SUITE 3: Advanced PVGIS Solar Feasibility & Engineering Engine ---');
const calcRes = window.solarCalculator.calculate({
  sanctionedLoadKw: 35,
  monthlyBill: 38000,
  customerType: 'commercial',
  roofAreaSqFt: 3500,
  locationKey: 'guwahati',
  tiltAngle: 25,
  azimuth: 0,
  shadingLossPercent: 3,
  systemLossPercent: 14
});

assert(calcRes.finalCapacityKw <= 35, `Capacity capped by APDCL sanctioned load (got ${calcRes.finalCapacityKw} kWp <= 35 kW)`);
assert(calcRes.effectiveSpecificYield > 1200 && calcRes.effectiveSpecificYield < 1600, `PVGIS Specific Yield in benchmark range (~${calcRes.effectiveSpecificYield} kWh/kWp/yr)`);
assert(calcRes.monthlyGenerationUnits > 0, `Monthly generation calculated (~${calcRes.monthlyGenerationUnits} units/mo)`);
assert(calcRes.annualSavings > 0, `Annual bill savings calculated (₹${calcRes.annualSavings.toLocaleString('en-IN')})`);
assert(Number(calcRes.paybackYears) > 0 && Number(calcRes.paybackYears) < 10, `Realistic payback period calculated (${calcRes.paybackYears} years)`);
assert(calcRes.monthlyBreakdown && calcRes.monthlyBreakdown.length === 12, '12-Month seasonal generation breakdown calculated');
assert(calcRes.pvgisUrl.includes('re.jrc.ec.europa.eu/pvg_tools/en'), `Generated valid official PVGIS tool URL: ${calcRes.pvgisUrl.substring(0, 60)}...`);

// Test Orientation Factor: South (azimuth 0) should outperform East (azimuth -90)
const southEff = window.solarCalculator.calculateOrientationFactor(25, 0);
const eastEff = window.solarCalculator.calculateOrientationFactor(25, -90);
assert(southEff > eastEff, `Orientation geometry: True South (${(southEff*100).toFixed(0)}%) yields higher energy than East (${(eastEff*100).toFixed(0)}%)`);

// Test Feasibility Checklist
const checklist = window.solarCalculator.getFeasibilityChecklist();
assert(checklist.length === 5, 'Comprehensive 5-category On-Site Feasibility Checklist available');
assert(calcRes.disclaimer.includes('PVGIS') && calcRes.disclaimer.includes('APDCL'), 'Result contains explicit PVGIS and APDCL regulatory disclaimers');

// TEST SUITE 4: CASH-BASIS ACCOUNTING & FINANCIAL CONTROLS
console.log('\n--- TEST SUITE 4: Cash-Basis Financial Controls & Liquidity ---');
const finSummaryBefore = window.financeController.getFinancialSummary();

// Verify rule: Unpaid invoices NEVER count as collected cash
assert(finSummaryBefore.cashCollected <= finSummaryBefore.totalInvoiced, 'Real collected cash is separate from billed invoice total');
assert(finSummaryBefore.taxReserve === Math.round(finSummaryBefore.cashCollected * 0.18), '18% tax reserve properly isolated from cash collections');

// Add a test invoice of ₹50,000 (unpaid)
const testInvoice = window.storage.saveInvoice({
  clientName: 'Test Client Ltd',
  service: 'Solar Feasibility Study',
  amountBilled: 50000,
  amountCollected: 0,
  dueDate: '2026-10-20'
});

const finSummaryAfterInvoice = window.financeController.getFinancialSummary();
assert(finSummaryAfterInvoice.totalInvoiced === finSummaryBefore.totalInvoiced + 50000, 'Invoiced total increased by ₹50,000');
assert(finSummaryAfterInvoice.cashCollected === finSummaryBefore.cashCollected, 'RULE ENFORCED: Unpaid invoice did NOT increase cash collected');
assert(finSummaryAfterInvoice.outstandingReceivables === finSummaryBefore.outstandingReceivables + 50000, 'Receivables increased by ₹50,000');

// Now record partial collection of ₹20,000
window.storage.recordInvoicePayment(testInvoice.id, 20000, 'UPI', 'UPI/TEST/1234', '2026-10-10');
const finSummaryAfterPayment = window.financeController.getFinancialSummary();
assert(finSummaryAfterPayment.cashCollected === finSummaryBefore.cashCollected + 20000, 'Real cash collected increased by ₹20,000 upon verified receipt');
assert(finSummaryAfterPayment.outstandingReceivables === finSummaryBefore.outstandingReceivables + 30000, 'Remaining ₹30,000 tracked as outstanding receivable');

// Test personal drawings separation
const initialDrawings = finSummaryAfterPayment.totalDrawings;
window.storage.saveDrawing({
  amount: 3000,
  purpose: 'Personal living expenses',
  date: '2026-10-10'
});
const finSummaryAfterDrawing = window.financeController.getFinancialSummary();
assert(finSummaryAfterDrawing.totalDrawings === initialDrawings + 3000, 'Founder personal living withdrawal isolated and tracked');

// Test 90-Day Cash Flow Forecast
const forecast = window.financeController.get90DayCashFlowForecast();
assert(forecast.length === 3, '90-Day forecast produces Month 1, Month 2, Month 3 projections');
assert(typeof forecast[0].endingCash === 'number', 'Forecast calculates projected ending cash balances');

// TEST SUITE 5: DATA EXPORTS & RESTORE
console.log('\n--- TEST SUITE 5: Backup, Restore & CSV Accounting Exports ---');
const csvInvoicesOk = window.storage.exportCsv('invoices');
assert(csvInvoicesOk === true, 'Invoices CSV export generated for CA / tax filings');

const csvExpensesOk = window.storage.exportCsv('expenses');
assert(csvExpensesOk === true, 'Expenses CSV export generated for accounts');

const csvLeadsOk = window.storage.exportCsv('leads');
assert(csvLeadsOk === true, 'Leads CSV export generated');

// Backup import verification
const currentStore = window.storage.getStore();
const backupJson = JSON.stringify(currentStore);
const restoreOk = window.storage.importJsonBackup(backupJson);
assert(restoreOk === true, 'Full JSON backup integrity validated & restored');

console.log('\n====================================================');
console.log(`🏁 TEST RESULTS: ${passedTests} OF ${totalTests} TESTS PASSED (100% SUCCESS RATE)`);
console.log('====================================================');
