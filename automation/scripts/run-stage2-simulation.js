// MaxEco Energy & Tech — Stage 2 Workflow Simulation Runner
// Simulates end-to-end execution of Workflow B & Workflow E and writes local review artifacts.

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const WORKFLOWS_DIR = path.join(ROOT_DIR, 'workflows');
const REPORTS_DIR = path.resolve(process.cwd(), 'docs/reports');

if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

console.log('Starting Stage 2 Simulation Run...');

// -------------------------------------------------------------
// 1. Simulate Workflow B (Daily Follow-Up Reminders)
// -------------------------------------------------------------
console.log('\n[SIMULATION] Executing Workflow B: Daily Follow-up Reminder...');
const wfB = JSON.parse(fs.readFileSync(path.join(WORKFLOWS_DIR, 'workflow-b-daily-followup.json'), 'utf8'));
const leadsData = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data/dummy-crm-leads.json'), 'utf8'));

// Filter
const todayStr = new Date().toISOString().slice(0, 10);
const eligibleLeads = (leadsData.testScenarios || []).filter(l => {
  return l.stage !== 'Won' && l.stage !== 'Lost' && l.nextFollowUpDate <= todayStr;
});

// Sorter & Urgency
const todayMs = new Date(todayStr).getTime();
const processedLeads = eligibleLeads.map(l => {
  const fMs = new Date(l.nextFollowUpDate).getTime();
  const diffDays = Math.floor((todayMs - fMs) / (1000 * 60 * 60 * 24));
  let urgency = 'DUE TODAY';
  if (diffDays > 0) urgency = `OVERDUE (${diffDays} day${diffDays > 1 ? 's' : ''})`;
  
  const cleanPhone = (l.phone || '').replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('91') ? cleanPhone : ('91' + cleanPhone);
  const draftText = `Hello ${l.contactPerson || l.name}, following up regarding your enquiry with MaxEco Energy & Tech for ${l.service}. Please let us know if you have any questions.`;
  const reviewUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(draftText)}`;

  return {
    ...l,
    daysOverdue: Math.max(0, diffDays),
    urgency,
    reviewUrl
  };
});

processedLeads.sort((a, b) => (b.daysOverdue - a.daysOverdue) || (b.estimatedValue - a.estimatedValue));

// Generate HTML Report
const htmlReport = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MaxEco Daily Follow-Up Digest - ${todayStr}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; }
    .container { max-width: 800px; margin: 0 auto; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
    .overdue { background: #ef4444; color: white; }
    .duetoday { background: #f59e0b; color: black; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .btn { display: inline-block; background: #25d366; color: white; padding: 8px 14px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 12px; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>MaxEco Energy & Tech — Daily Follow-Up Digest</h2>
    <p>Report Date: <strong>${todayStr}</strong> | Total Due: <strong>${processedLeads.length}</strong></p>
    <p><em>Security Governance: Zero automated messages sent. Review and click link to open draft manually.</em></p>
    ${processedLeads.map(l => `
      <div class="card">
        <div style="display:flex; justify-content:space-between;">
          <strong>${l.name}</strong>
          <span class="badge ${l.urgency.includes('OVERDUE') ? 'overdue' : 'duetoday'}">${l.urgency}</span>
        </div>
        <div style="font-size:13px; color:#94a3b8; margin: 4px 0;">Service: ${l.service} | Value: ₹${(l.estimatedValue || 0).toLocaleString('en-IN')}</div>
        <div style="font-size:13px; margin-top: 6px;"><strong>Next Action:</strong> ${l.nextAction || 'Follow up'}</div>
        <a href="${l.reviewUrl}" target="_blank" class="btn">Review WhatsApp Draft</a>
      </div>
    `).join('')}
  </div>
</body>
</html>`;

const bReportPath = path.join(REPORTS_DIR, `daily-digest-${todayStr}.html`);
fs.writeFileSync(bReportPath, htmlReport, 'utf8');
console.log(`[SIMULATION] Workflow B generated report: ${bReportPath}`);

// -------------------------------------------------------------
// 2. Simulate Workflow E (Weekly Management & Solvency Report)
// -------------------------------------------------------------
console.log('\n[SIMULATION] Executing Workflow E: Weekly Management & Liquidity Report...');
const financeData = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data/dummy-finance-registers.json'), 'utf8'));

let billed = 0;
let collected = 0;
let receivables = 0;
const overdueInvoices = [];

(financeData.invoices || []).forEach(inv => {
  const b = Number(inv.amountBilled) || 0;
  const c = Number(inv.amountCollected) || 0;
  billed += b;
  collected += c;
  const unp = b - c;
  if (unp > 0) {
    receivables += unp;
    if (inv.dueDate && inv.dueDate < todayStr) {
      overdueInvoices.push(inv);
    }
  }
});

let directCosts = 0;
let overheads = 0;
(financeData.expenses || []).forEach(e => {
  const amt = Number(e.amount) || 0;
  if (e.category === 'Direct Delivery Cost' || e.linkedProject) {
    directCosts += amt;
  } else {
    overheads += amt;
  }
});

const grossProfit = collected - directCosts;
const taxReserve = Math.round(collected * 0.18);
const drawings = (financeData.drawings || []).reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
const netCash = collected - directCosts - overheads - drawings - taxReserve;

const inr = (v) => '₹' + Number(v || 0).toLocaleString('en-IN');

const eReportMd = `# MaxEco Energy & Tech — Weekly Management & Liquidity Report
**Report Date**: ${todayStr} | **Location**: Maligaon, Guwahati, Assam

---

## 1. Cash-Basis Liquidity & Solvency Summary
> **Rule Enforced**: Unpaid invoices and pending quotes are NEVER counted as cash on hand.

| Financial Measure | Amount (INR) | Governance Notes |
| :--- | :--- | :--- |
| **Real Cash Collected in Bank** | **${inr(collected)}** | Physically cleared customer funds |
| **Direct Project Costs Paid** | (${inr(directCosts)}) | Contractor, site survey & delivery costs |
| **Gross Profit on Real Cash** | **${inr(grossProfit)}** | Collected Cash minus Direct Delivery Costs |
| **18% Statutory Tax Reserve** | (${inr(taxReserve)}) | Ring-fenced reserve for tax obligations |
| **Operating Overheads** | (${inr(overheads)}) | Office, internet & recurring tools |
| **Founder Living Drawings** | (${inr(drawings)}) | Personal allowance (kept separate) |
| **NET AVAILABLE CASH RUNWAY** | **${inr(netCash)}** | **Net Liquid Operating Balance** |

---

## 2. Receivables & Collection Warnings
* **Total Billed Invoices**: ${inr(billed)}
* **Outstanding Receivables (Uncollected)**: **${inr(receivables)}**
* **Overdue Customer Invoices**: ${overdueInvoices.length}

${overdueInvoices.map(i => `* ⚠️ **OVERDUE**: Invoice (${i.id}) — ${i.clientName} | ${inr((i.amountBilled || 0) - (i.amountCollected || 0))} due on ${i.dueDate}`).join('\n')}

---

## 3. Commercial Pipeline & Quotations
* **Quoted Pipeline (Non-binding)**: ${inr((financeData.quotations || []).reduce((s, q) => s + (q.totalAmount || 0), 0))}
* **Active Quotations**: ${(financeData.quotations || []).length}

---

## 4. Solvency Alert
${netCash < 0 ? `⚠️ **ATTENTION**: Projected liquid cash position is **${inr(netCash)}** (Deficit). Prioritize collection of ${inr(receivables)} outstanding receivables before committing any further expenses or personal drawings.` : `✅ Cash runway is positive.`}

---
*Confidential Internal Document — Generated by MaxEco Automated Systems*
`;

const eReportPath = path.join(REPORTS_DIR, `weekly-management-report-${todayStr}.md`);
fs.writeFileSync(eReportPath, eReportMd, 'utf8');
console.log(`[SIMULATION] Workflow E generated report: ${eReportPath}`);

console.log('\nSimulation run completed successfully with zero external requests and zero automated messaging.');
