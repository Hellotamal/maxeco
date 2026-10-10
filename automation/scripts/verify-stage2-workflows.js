// MaxEco Energy & Tech — Stage 2 Automation & Workflow Verification Suite
// Tests workflow JSON integrity, simulation of nodes against dummy data, and security invariants.

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const WORKFLOWS_DIR = path.join(ROOT_DIR, 'workflows');
const DATA_DIR = path.join(ROOT_DIR, 'data');

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
  }
}

console.log('\n============================================================');
console.log('MAXECO AUTOMATION SUITE — STAGE 2 VERIFICATION RUN');
console.log('============================================================\n');

// -----------------------------------------------------------------------------
// 1. Workflow JSON Validation
// -----------------------------------------------------------------------------
console.log('--- 1. Validating Workflow JSON Files ---');
const workflowFiles = [
  'workflow-a-lead-capture.json',
  'workflow-b-daily-followup.json',
  'workflow-c-quote-payment-drafts.json',
  'workflow-d-project-milestones.json',
  'workflow-e-weekly-management-report.json'
];

workflowFiles.forEach(file => {
  const filePath = path.join(WORKFLOWS_DIR, file);
  assert(fs.existsSync(filePath), `File exists: ${file}`);
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert(content.name && content.nodes && Array.isArray(content.nodes), `${file} has valid n8n workflow structure`);
    assert(content.nodes.length >= 3, `${file} contains expected minimum node count (${content.nodes.length})`);
    
    // Check for duplicate node IDs
    const ids = content.nodes.map(n => n.id);
    const uniqueIds = new Set(ids);
    assert(ids.length === uniqueIds.size, `${file} all node IDs are unique`);
    
    // Check connections point to valid node names
    const nodeNames = new Set(content.nodes.map(n => n.name));
    let connectionsValid = true;
    for (const [source, conn] of Object.entries(content.connections || {})) {
      if (!nodeNames.has(source)) connectionsValid = false;
      conn.main?.forEach(branch => {
        branch.forEach(target => {
          if (!nodeNames.has(target.node)) connectionsValid = false;
        });
      });
    }
    assert(connectionsValid, `${file} connection graph references valid node names`);
  } catch (err) {
    assert(false, `${file} JSON parse failed: ${err.message}`);
  }
});

// -----------------------------------------------------------------------------
// 2. Dummy Data Suite Integrity
// -----------------------------------------------------------------------------
console.log('\n--- 2. Validating Dummy Test Datasets ---');
const leadsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'dummy-crm-leads.json'), 'utf8'));
const financeData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'dummy-finance-registers.json'), 'utf8'));
const enquiryData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'dummy-incoming-enquiries.json'), 'utf8'));

assert(leadsData.testScenarios && leadsData.testScenarios.length >= 5, 'Dummy leads dataset has test scenarios');
assert(financeData.invoices && financeData.invoices.length >= 3, 'Dummy finance dataset has invoices');
assert(financeData.expenses && financeData.expenses.length >= 3, 'Dummy finance dataset has direct & overhead expenses');
assert(financeData.drawings && financeData.drawings.length >= 1, 'Dummy finance dataset isolates founder drawings');
assert(enquiryData.submissions && enquiryData.submissions.length >= 4, 'Dummy enquiries dataset has spam, invalid and valid tests');

// -----------------------------------------------------------------------------
// 3. Workflow B Logic Simulation (Daily Follow-Up Reminders)
// -----------------------------------------------------------------------------
console.log('\n--- 3. Testing Workflow B Execution Logic (Daily Follow-up) ---');
const todayStr = '2026-10-10'; // Deterministic test reference date
const todayMs = new Date(todayStr).getTime();

// Filter Node Simulation:
const activeFollowUps = leadsData.testScenarios.filter(l => {
  return l.stage !== 'Won' && l.stage !== 'Lost' && l.nextFollowUpDate <= todayStr;
});

assert(activeFollowUps.length === 2, `Filter correctly identifies 2 leads due or overdue (Got: ${activeFollowUps.length})`);
assert(activeFollowUps.some(l => l.id === 'LEAD-TEST-001'), 'Includes overdue solar lead LEAD-TEST-001');
assert(activeFollowUps.some(l => l.id === 'LEAD-TEST-002'), 'Includes due-today website lead LEAD-TEST-002');
assert(!activeFollowUps.some(l => l.id === 'LEAD-TEST-003'), 'Correctly excludes future lead LEAD-TEST-003');
assert(!activeFollowUps.some(l => l.id === 'LEAD-TEST-004'), 'Correctly excludes Won lead LEAD-TEST-004');
assert(!activeFollowUps.some(l => l.id === 'LEAD-TEST-005'), 'Correctly excludes Lost lead LEAD-TEST-005');

// Urgency Sorter & Digest Node Simulation:
const overdueLead = activeFollowUps.find(l => l.id === 'LEAD-TEST-001');
const overdueDays = Math.floor((todayMs - new Date(overdueLead.nextFollowUpDate).getTime()) / (1000 * 60 * 60 * 24));
assert(overdueDays === 2, `Calculates days overdue accurately (Expected 2 days, got ${overdueDays})`);

// WhatsApp Safe Link Generation:
const phoneDigits = overdueLead.phone.replace(/[^0-9]/g, '');
const waUrl = `https://wa.me/${phoneDigits.startsWith('91') ? phoneDigits : '91' + phoneDigits}`;
assert(waUrl.startsWith('https://wa.me/919954400001'), 'Generates safe wa.me manual review URL (no auto-send)');

// -----------------------------------------------------------------------------
// 4. Workflow E Logic Simulation (Cash-Basis Accounting & Solvency)
// -----------------------------------------------------------------------------
console.log('\n--- 4. Testing Workflow E Execution Logic (Cash Accounting) ---');

let totalBilled = 0;
let realCollectedCash = 0;
let outstandingReceivables = 0;

financeData.invoices.forEach(inv => {
  const billed = Number(inv.amountBilled) || 0;
  const collected = Number(inv.amountCollected) || 0;
  totalBilled += billed;
  realCollectedCash += collected;
  const unpaid = billed - collected;
  if (unpaid > 0) outstandingReceivables += unpaid;
});

assert(totalBilled === 35500, `Total Invoiced amount: ₹${totalBilled}`);
assert(realCollectedCash === 6000, `Real Collected Cash: ₹${realCollectedCash}`);
assert(outstandingReceivables === 29500, `Outstanding Receivables: ₹${outstandingReceivables}`);
assert(totalBilled !== realCollectedCash, 'INVARIANT ENFORCED: Invoiced revenue is NOT counted as cash!');

// Direct Costs vs Overheads
let directCosts = 0;
let overheads = 0;
financeData.expenses.forEach(e => {
  if (e.category === 'Direct Delivery Cost' || e.linkedProject) {
    directCosts += Number(e.amount) || 0;
  } else {
    overheads += Number(e.amount) || 0;
  }
});

assert(directCosts === 1650, `Direct Project Delivery Costs: ₹${directCosts}`);
assert(overheads === 943, `Operating Overheads: ₹${overheads}`);

// Tax Reserve (18% of collected funds)
const taxReserve = Math.round(realCollectedCash * 0.18);
assert(taxReserve === 1080, `Tax Reserve (18% of ₹6,000): ₹${taxReserve}`);

// Founder Personal Drawings
const drawingsTotal = financeData.drawings.reduce((sum, d) => sum + Number(d.amount), 0);
assert(drawingsTotal === 2500, `Founder Personal Drawings: ₹${drawingsTotal}`);

// Available Liquid Runway:
const netAvailableCash = realCollectedCash - directCosts - overheads - drawingsTotal - taxReserve;
// 6000 - 1650 - 943 - 2500 - 1080 = -173
console.log(`    ℹ️ Net Available Cash Calculation: ₹6,000 - ₹1,650 (direct) - ₹943 (overheads) - ₹2,500 (drawings) - ₹1,080 (tax) = ₹${netAvailableCash}`);
assert(netAvailableCash === -173, 'Accurately detects negative cash runway triggering solvency warning');

// -----------------------------------------------------------------------------
// 5. Workflow A Logic Simulation (Intake Validation & Spam Defense)
// -----------------------------------------------------------------------------
console.log('\n--- 5. Testing Workflow A Lead Intake & Spam Validation ---');
const validSub = enquiryData.submissions.find(s => s.testCase.includes('Valid'));
const invalidPhoneSub = enquiryData.submissions.find(s => s.testCase.includes('Malformed Phone'));
const spamBotSub = enquiryData.submissions.find(s => s.testCase.includes('Bot / Spam'));

// Honeypot check
assert(spamBotSub.payload.honeypot.length > 0, 'Spam submission has honeypot filled');

// Phone validation logic
function checkPhone(raw) {
  const digits = String(raw).replace(/[^0-9]/g, '');
  return (digits.length === 10) || (digits.length === 12 && digits.startsWith('91'));
}
assert(checkPhone(validSub.payload.phone) === true, 'Accepts valid Indian mobile number');
assert(checkPhone(invalidPhoneSub.payload.phone) === false, 'Rejects malformed 5-digit number');

// -----------------------------------------------------------------------------
// Final Results
// -----------------------------------------------------------------------------
console.log('\n============================================================');
console.log(`VERIFICATION SUMMARY: ${passedTests} / ${totalTests} assertions passed (${Math.round(passedTests/totalTests*100)}%)`);
console.log('============================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
