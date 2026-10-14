// MaxEco Finance & Cash-Flow Controller
// Strict cash-basis accounting: real collections separated from billed receivables,
// tax reserves isolated, and personal drawings accounted for.

class FinanceController {
  constructor() {}

  getFinancialSummary() {
    const store = window.storage.getStore();
    const settings = window.storage.getSettings();
    const taxRate = (Number(settings.taxReserveRate) || 18) / 100;

    // 1. Quoted Pipeline Amount
    const quotations = store.quotations || [];
    let totalQuoted = 0;
    quotations.forEach(q => {
      totalQuoted += Number(q.totalAmount) || 0;
    });

    // 2. Invoiced Revenue vs Cash Actually Collected
    const invoices = store.invoices || [];
    let totalInvoiced = 0;
    let cashCollected = 0;
    let overdueReceivables = 0;
    const today = new Date().toISOString().slice(0, 10);

    invoices.forEach(inv => {
      const billed = Number(inv.amountBilled) || 0;
      const collected = Number(inv.amountCollected) || 0;
      totalInvoiced += billed;
      cashCollected += collected;

      const outstanding = billed - collected;
      if (outstanding > 0 && inv.dueDate && inv.dueDate < today) {
        overdueReceivables += outstanding;
      }
    });

    const outstandingReceivables = Math.max(0, totalInvoiced - cashCollected);

    // 3. Direct Delivery Costs vs Operating Overheads
    const expenses = store.expenses || [];
    let directCosts = 0;
    let operatingOverheads = 0;

    expenses.forEach(exp => {
      const amt = Number(exp.amount) || 0;
      if (exp.category === 'Direct Delivery Cost') {
        directCosts += amt;
      } else {
        operatingOverheads += amt;
      }
    });

    const totalExpenses = directCosts + operatingOverheads;

    // 4. Gross Profit on Real Collected Cash
    const grossProfitCollected = Math.max(0, cashCollected - directCosts);

    // 5. Tax Reserve (isolated reserve on collections)
    const taxReserve = Math.round(cashCollected * taxRate);

    // 6. Personal Living Withdrawals (Founder Drawings)
    const drawings = store.drawings || [];
    let totalDrawings = 0;
    drawings.forEach(d => {
      totalDrawings += Number(d.amount) || 0;
    });

    // 7. Net Available Operational Cash Balance
    // True cash in bank available to run operations without defaulting on tax or direct delivery
    const availableCashBalance = cashCollected - totalExpenses - taxReserve - totalDrawings;

    // 8. Net Profit Estimate
    const netProfitEstimate = grossProfitCollected - operatingOverheads;

    return {
      totalQuoted,
      totalInvoiced,
      cashCollected,
      outstandingReceivables,
      overdueReceivables,
      directCosts,
      operatingOverheads,
      totalExpenses,
      grossProfitCollected,
      taxReserve,
      totalDrawings,
      availableCashBalance,
      netProfitEstimate,
      taxRatePercent: settings.taxReserveRate || 18
    };
  }

  get90DayCashFlowForecast() {
    const summary = this.getFinancialSummary();
    const store = window.storage.getStore();

    // Estimate base starting cash
    let currentCash = summary.availableCashBalance;

    // Monthly baseline overheads from past 30 days
    const monthlyOverheadRunRate = Math.max(1500, summary.operatingOverheads || 2000);
    const monthlyLivingAllowanceTarget = 15000; // Realistic founder bootstrap living requirement

    // Month 1: 0 - 30 days
    // Expected collections: overdue receivables + 60% of current outstanding receivables
    const m1Inflow = Math.round(summary.outstandingReceivables * 0.7);
    const m1Outflow = monthlyOverheadRunRate + monthlyLivingAllowanceTarget;
    const m1EndingCash = currentCash + m1Inflow - m1Outflow;

    // Month 2: 31 - 60 days
    // Expected from pipeline proposals (assume 10% conversion of active proposals)
    let pipelineWonExpected = 0;
    (store.leads || []).forEach(l => {
      if (l.stage === 'Proposal Sent' || l.stage === 'Negotiation') {
        pipelineWonExpected += (Number(l.estimatedValue) || 0) * 0.15; // advance milestone
      }
    });
    const m2Inflow = Math.round(pipelineWonExpected * 0.5);
    const m2Outflow = monthlyOverheadRunRate + monthlyLivingAllowanceTarget;
    const m2EndingCash = m1EndingCash + m2Inflow - m2Outflow;

    // Month 3: 61 - 90 days
    const m3Inflow = Math.round(pipelineWonExpected * 0.4);
    const m3Outflow = monthlyOverheadRunRate + monthlyLivingAllowanceTarget;
    const m3EndingCash = m2EndingCash + m3Inflow - m3Outflow;

    return [
      {
        month: "Next 30 Days (M1)",
        startingCash: currentCash,
        projectedInflow: m1Inflow,
        projectedOutflow: m1Outflow,
        endingCash: m1EndingCash,
        isDeficit: m1EndingCash < 0,
        notes: "Based on collecting current pending invoices and immediate customer advances."
      },
      {
        month: "31–60 Days (M2)",
        startingCash: m1EndingCash,
        projectedInflow: m2Inflow,
        projectedOutflow: m2Outflow,
        endingCash: m2EndingCash,
        isDeficit: m2EndingCash < 0,
        notes: "Depends on closing proposals currently in negotiation (e.g. Amingaon Solar / Clinic Web)."
      },
      {
        month: "61–90 Days (M3)",
        startingCash: m2EndingCash,
        projectedInflow: m3Inflow,
        projectedOutflow: m3Outflow,
        endingCash: m3EndingCash,
        isDeficit: m3EndingCash < 0,
        notes: "Milestone completion payouts and new lead generation required to sustain cash buffer."
      }
    ];
  }
}

window.financeController = new FinanceController();
