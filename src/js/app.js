// MaxEco OS Master Application Controller & UI Coordinator
// Handles routing, view transitions, modal workflows, PIN security gate, and event handlers.

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'warning') icon = '⚠️';
  if (type === 'error') icon = '❌';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 400);
  }, 3500);
}

class AppController {
  constructor() {
    this.currentView = 'home';
    this.isAuthenticated = sessionStorage.getItem('maxeco_auth') === 'true';
    this.init();
  }

  init() {
    this.bindEvents();
    this.handleRoute();
    this.renderHeaderNav();
  }

  bindEvents() {
    // Navigation clicks
    window.addEventListener('hashchange', () => this.handleRoute());

    // Close modal on escape or background click
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
        this.closeMenuDropdowns();
      }
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeAllModals();
      });
    });

    // Close menu dropdowns on click outside
    window.addEventListener('click', (e) => {
      if (!e.target.closest('.menu-dropdown') && !e.target.closest('button[onclick*="toggleMenuDropdown"]')) {
        this.closeMenuDropdowns();
      }
    });
  }

  handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const privateViews = ['dashboard', 'leads', 'quotes-invoices', 'finance', 'projects', 'settings', 'solar-feasibility', 'cafm'];

    if (privateViews.includes(hash)) {
      if (!this.isAuthenticated) {
        this.openPinModal(hash);
        return;
      }
      this.showView(hash, true);
    } else {
      this.showView(hash, false);
    }
  }

  showView(viewName, isPrivate) {
    this.currentView = viewName;
    window.location.hash = '#' + viewName;

    // Toggle public vs private containers
    const publicContainer = document.getElementById('public-portal');
    const privateContainer = document.getElementById('private-dashboard');
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      link.classList.toggle('active', href === '#' + viewName);
    });

    if (isPrivate) {
      if (publicContainer) publicContainer.classList.add('hidden');
      if (privateContainer) privateContainer.classList.remove('hidden');

      // Hide all private tabs
      document.querySelectorAll('.dashboard-tab').forEach(tab => tab.classList.add('hidden'));

      // Show target tab
      const targetTab = document.getElementById(`tab-${viewName}`);
      if (targetTab) targetTab.classList.remove('hidden');

      this.renderPrivateView(viewName);
    } else {
      if (publicContainer) publicContainer.classList.remove('hidden');
      if (privateContainer) privateContainer.classList.add('hidden');

      // Scroll to target public section
      const targetSection = document.getElementById(`sec-${viewName}`);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    }

    this.renderHeaderNav();
  }

  renderHeaderNav() {
    const authBtn = document.getElementById('btn-auth-toggle');
    if (!authBtn) return;

    if (this.isAuthenticated) {
      authBtn.innerHTML = '🔒 Lock Founder OS';
      authBtn.className = 'btn btn-secondary btn-sm';
      authBtn.onclick = () => this.lockSession();
      document.getElementById('private-nav-links')?.classList.remove('hidden');
      document.getElementById('public-nav-links')?.classList.add('hidden');
    } else {
      authBtn.innerHTML = '🔑 Founder Login';
      authBtn.className = 'btn btn-secondary btn-sm';
      authBtn.onclick = () => this.openPinModal('dashboard');
      document.getElementById('private-nav-links')?.classList.add('hidden');
      document.getElementById('public-nav-links')?.classList.remove('hidden');
    }
  }

  // --- PIN GATE ---
  openPinModal(destination = 'dashboard') {
    this.pendingDestination = destination;
    const modal = document.getElementById('modal-pin');
    if (modal) {
      modal.classList.remove('hidden');
      const pinInput = document.getElementById('pin-input');
      if (pinInput) {
        pinInput.value = '';
        pinInput.focus();
      }
    }
  }

  verifyPin() {
    const pinInput = document.getElementById('pin-input');
    const settings = window.storage.getSettings();
    const targetPin = settings.adminPin || 'maxeco2026';

    if (pinInput && pinInput.value === targetPin) {
      this.isAuthenticated = true;
      sessionStorage.setItem('maxeco_auth', 'true');
      this.closeAllModals();
      showToast('Founder session authenticated successfully.', 'success');
      this.showView(this.pendingDestination || 'dashboard', true);
    } else {
      showToast('Incorrect security PIN. Please try again.', 'error');
      if (pinInput) {
        pinInput.value = '';
        pinInput.focus();
      }
    }
  }

  lockSession() {
    this.isAuthenticated = false;
    sessionStorage.removeItem('maxeco_auth');
    showToast('Founder session locked. Business records protected.', 'info');
    this.showView('home', false);
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
    this.closeMenuDropdowns();
  }

  toggleMenuDropdown(menuId, event) {
    if (event) event.stopPropagation();
    const target = document.getElementById(menuId);
    if (!target) return;
    const isHidden = target.classList.contains('hidden');
    this.closeMenuDropdowns();
    if (isHidden) {
      target.classList.remove('hidden');
    }
  }

  closeMenuDropdowns() {
    document.querySelectorAll('.menu-dropdown').forEach(d => d.classList.add('hidden'));
  }

  // --- RENDER PRIVATE VIEWS ---
  renderPrivateView(view) {
    if (view === 'dashboard') this.renderDashboardTab();
    else if (view === 'leads') this.renderLeadsTab();
    else if (view === 'quotes-invoices') this.renderQuotesInvoicesTab();
    else if (view === 'finance') this.renderFinanceTab();
    else if (view === 'projects') this.renderProjectsTab();
    else if (view === 'cafm') this.renderCafmTab();
    else if (view === 'settings') this.renderSettingsTab();
    else if (view === 'solar-feasibility') this.renderSolarFeasibilityTab();
  }

  renderSolarFeasibilityTab() {
    if (!this.lastSolarCalcResult) {
      this.runInternalSolarCalculator();
    }
  }

  renderDashboardTab() {
    const finSummary = window.financeController.getFinancialSummary();
    const crmMetrics = window.crmController.getMetrics();
    const today = new Date().toISOString().slice(0, 10);

    // KPI Cards
    document.getElementById('kpi-cash-balance').textContent = formatINR(finSummary.availableCashBalance);
    document.getElementById('kpi-cash-collected').textContent = formatINR(finSummary.cashCollected);
    document.getElementById('kpi-outstanding').textContent = formatINR(finSummary.outstandingReceivables);
    document.getElementById('kpi-active-pipeline').textContent = formatINR(crmMetrics.activePipelineValue);
    document.getElementById('kpi-tax-reserve').textContent = formatINR(finSummary.taxReserve);

    // Overdue banner alert
    const alertBox = document.getElementById('dashboard-alerts');
    let alertsHtml = '';
    if (finSummary.overdueReceivables > 0) {
      alertsHtml += `
        <div style="background: rgba(244, 63, 94, 0.15); border: 1px solid var(--accent-rose); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <strong class="text-rose">⚠️ Overdue Customer Collections Alert:</strong>
            <span style="margin-left: 8px;">₹${finSummary.overdueReceivables.toLocaleString('en-IN')} in customer receivables are past due date!</span>
          </div>
          <button class="btn btn-sm btn-primary" onclick="app.showView('quotes-invoices', true)">Review Invoices</button>
        </div>
      `;
    }

    if (crmMetrics.overdueFollowUpsCount > 0) {
      alertsHtml += `
        <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid var(--solar-amber); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <strong class="text-amber">⏳ Overdue Follow-ups Alert:</strong>
            <span style="margin-left: 8px;">${crmMetrics.overdueFollowUpsCount} client lead(s) require action today.</span>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="app.showView('leads', true)">View Leads</button>
        </div>
      `;
    }
    alertBox.innerHTML = alertsHtml;

    // Upcoming Follow-ups Table
    const leads = window.storage.getLeads().filter(l => l.stage !== 'Won' && l.stage !== 'Lost');
    const upcomingContainer = document.getElementById('dashboard-upcoming-followups');
    if (leads.length === 0) {
      upcomingContainer.innerHTML = '<tr><td colspan="5" class="text-muted text-center" style="padding: 20px;">No pending follow-ups. Ready for outreach!</td></tr>';
    } else {
      upcomingContainer.innerHTML = leads.slice(0, 5).map(lead => {
        const isOverdue = lead.nextFollowUpDate && lead.nextFollowUpDate < today;
        const waUrl = window.crmController.generateWhatsAppFollowUpUrl(lead);
        return `
          <tr>
            <td><strong>${lead.name}</strong><br><small class="text-muted">${lead.service}</small></td>
            <td>${lead.contactPerson || '—'}<br><small class="text-secondary">${lead.phone}</small></td>
            <td><span class="${isOverdue ? 'text-rose font-bold' : ''}">${formatDate(lead.nextFollowUpDate)}</span></td>
            <td>${lead.nextAction || '—'}</td>
            <td>
              <a href="${waUrl}" target="_blank" class="btn btn-whatsapp btn-sm" title="Review draft message in WhatsApp">💬 WhatsApp</a>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  renderLeadsTab() {
    const metrics = window.crmController.getMetrics();
    document.getElementById('leads-metric-total').textContent = metrics.totalLeads;
    document.getElementById('leads-metric-pipeline').textContent = formatINR(metrics.activePipelineValue);
    document.getElementById('leads-metric-overdue').textContent = metrics.overdueFollowUpsCount;
    document.getElementById('leads-metric-won').textContent = `${metrics.wonCount} (${formatINR(metrics.wonValue)})`;

    const filteredLeads = window.crmController.getFilteredLeads();
    const tableBody = document.getElementById('leads-table-body');
    const today = new Date().toISOString().slice(0, 10);

    if (filteredLeads.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted" style="padding: 30px;">No matching leads found. Click "Add Lead" to record a new enquiry.</td></tr>';
      return;
    }

    tableBody.innerHTML = filteredLeads.map(lead => {
      const isOverdue = lead.nextFollowUpDate && lead.nextFollowUpDate < today && lead.stage !== 'Won' && lead.stage !== 'Lost';
      const waUrl = window.crmController.generateWhatsAppFollowUpUrl(lead);
      return `
        <tr>
          <td>
            <strong>${lead.name}</strong><br>
            <small class="text-muted">${lead.customerType || 'General'} • ${lead.location || 'Guwahati'}</small>
          </td>
          <td>
            ${lead.contactPerson || '—'}<br>
            <small class="text-secondary">${lead.phone}</small>
          </td>
          <td>
            <span class="text-cyan">${lead.service}</span><br>
            <small class="text-muted">${lead.source || 'Direct'}</small>
          </td>
          <td><strong>${formatINR(lead.estimatedValue)}</strong></td>
          <td>${window.crmController.renderLeadBadge(lead.stage)}</td>
          <td>
            <span class="${isOverdue ? 'text-rose' : ''}"><strong>${formatDate(lead.nextFollowUpDate)}</strong></span><br>
            <small class="text-secondary">${lead.nextAction || '—'}</small>
          </td>
          <td style="white-space: nowrap;">
            <div class="flex gap-2">
              <a href="${waUrl}" target="_blank" class="btn btn-whatsapp btn-sm" title="Draft WhatsApp message">💬</a>
              <button class="btn btn-secondary btn-sm" onclick="app.openEditLeadModal('${lead.id}')">✏️ Edit</button>
              <button class="btn btn-secondary btn-sm" onclick="app.openLeadToQuoteModal('${lead.id}')" title="Generate Quotation">📄 Quote</button>
              <button class="btn btn-danger btn-sm" onclick="app.deleteLead('${lead.id}')">🗑️ Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderQuotesInvoicesTab() {
    const quotes = window.storage.getQuotations() || [];
    const invoices = window.storage.getInvoices() || [];
    const payments = window.storage.getPayments() || [];
    const today = new Date().toISOString().slice(0, 10);

    // Compute Billing KPIs
    let totalInvoiced = 0;
    let cashCollected = 0;
    let overdueCount = 0;
    let overdueAmt = 0;

    invoices.forEach(inv => {
      const billed = Number(inv.amountBilled) || 0;
      const collected = Number(inv.amountCollected) || 0;
      const outstanding = Math.max(0, billed - collected);
      totalInvoiced += billed;
      cashCollected += collected;
      if (outstanding > 0 && inv.dueDate && inv.dueDate < today) {
        overdueCount++;
        overdueAmt += outstanding;
      }
    });

    const receivables = Math.max(0, totalInvoiced - cashCollected);
    const totalQuoted = quotes.reduce((acc, q) => acc + (Number(q.totalAmount) || 0), 0);

    // Populate KPI Elements
    const elInvoiced = document.getElementById('billing-kpi-invoiced');
    if (elInvoiced) elInvoiced.textContent = formatINR(totalInvoiced);
    const elInvoicesCount = document.getElementById('billing-kpi-invoices-count');
    if (elInvoicesCount) elInvoicesCount.textContent = `${invoices.length} invoices raised`;

    const elCollected = document.getElementById('billing-kpi-collected');
    if (elCollected) elCollected.textContent = formatINR(cashCollected);
    const elReceiptsCount = document.getElementById('billing-kpi-receipts-count');
    if (elReceiptsCount) elReceiptsCount.textContent = `${payments.length} receipts logged`;

    const elReceivables = document.getElementById('billing-kpi-receivables');
    if (elReceivables) elReceivables.textContent = formatINR(receivables);

    const elOverdue = document.getElementById('billing-kpi-overdue');
    if (elOverdue) elOverdue.textContent = overdueCount;
    const elOverdueAmt = document.getElementById('billing-kpi-overdue-amt');
    if (elOverdueAmt) elOverdueAmt.textContent = `${formatINR(overdueAmt)} past due`;

    const elQuoted = document.getElementById('billing-kpi-quoted');
    if (elQuoted) elQuoted.textContent = formatINR(totalQuoted);
    const elQuotesCount = document.getElementById('billing-kpi-quotes-count');
    if (elQuotesCount) elQuotesCount.textContent = `${quotes.length} proposals recorded`;

    // Badges
    const badgeInv = document.getElementById('billing-badge-invoices');
    if (badgeInv) badgeInv.textContent = invoices.length;
    const badgeQuo = document.getElementById('billing-badge-quotes');
    if (badgeQuo) badgeQuo.textContent = quotes.length;
    const badgePay = document.getElementById('billing-badge-payments');
    if (badgePay) badgePay.textContent = payments.length;

    // GST Tax Reserve (18% on realized cash)
    const elTaxReserve = document.getElementById('gst-tax-reserve-amt');
    if (elTaxReserve) elTaxReserve.textContent = `${formatINR(Math.round(cashCollected * 0.18))} (18%)`;

    // Render Sub-Views
    this.renderInvoicesTable();
    this.renderQuotesTable();
    this.renderPaymentsTable();
    this.renderGstBreakdownTable();

    // Populate autofill options for modal-quotation and modal-invoice
    this.populateBillingAutofills();
  }

  switchBillingSubTab(subTab) {
    const tabs = ['invoices', 'quotes', 'payments', 'gst'];
    tabs.forEach(t => {
      const viewEl = document.getElementById(`billing-view-${t}`);
      const btnEl = document.getElementById(`btn-billing-subtab-${t}`);
      if (viewEl) viewEl.classList.toggle('hidden', t !== subTab);
      if (btnEl) {
        if (t === subTab) {
          btnEl.classList.add('active');
          btnEl.style.borderColor = '#0284c7';
          btnEl.style.color = '#0284c7';
        } else {
          btnEl.classList.remove('active');
          btnEl.style.borderColor = 'var(--border-color)';
          btnEl.style.color = 'var(--text-secondary)';
        }
      }
    });

    if (subTab === 'invoices') this.renderInvoicesTable();
    else if (subTab === 'quotes') this.renderQuotesTable();
    else if (subTab === 'payments') this.renderPaymentsTable();
    else if (subTab === 'gst') this.renderGstBreakdownTable();
  }

  renderInvoicesTable() {
    const invoicesBody = document.getElementById('invoices-table-body');
    if (!invoicesBody) return;
    const invoices = window.storage.getInvoices() || [];
    const today = new Date().toISOString().slice(0, 10);

    if (invoices.length === 0) {
      invoicesBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted" style="padding: 24px;">No invoices issued yet. Click "+ New Direct Invoice" to generate one.</td></tr>';
      return;
    }

    invoicesBody.innerHTML = invoices.map(inv => {
      const outstanding = Math.max(0, (Number(inv.amountBilled) || 0) - (Number(inv.amountCollected) || 0));
      const isOverdue = outstanding > 0 && inv.dueDate && inv.dueDate < today;
      let badgeClass = 'badge-new';
      if (inv.status === 'Paid') badgeClass = 'badge-won';
      else if (isOverdue) badgeClass = 'badge-lost';
      else if (inv.status === 'Partially Paid') badgeClass = 'badge-proposal';

      const hsnInfo = window.invoiceController ? window.invoiceController.detectHsnSac(inv.service) : null;
      const sacDisplay = inv.hsnSac || (hsnInfo ? hsnInfo.code : '998313');

      return `
        <tr>
          <td><strong>${inv.id}</strong><br><small class="text-muted">${formatDate(inv.date)}</small></td>
          <td>
            <strong>${inv.clientName}</strong><br>
            <small class="text-secondary">${inv.service}</small>
          </td>
          <td><span class="font-mono text-xs" style="background: rgba(2, 132, 199, 0.12); color: #0284c7; padding: 2px 6px; border-radius: 4px;">SAC ${sacDisplay}</span></td>
          <td><strong>${formatINR(inv.amountBilled)}</strong></td>
          <td>
            <span class="text-emerald"><strong>${formatINR(inv.amountCollected)}</strong></span><br>
            <small class="${outstanding > 0 ? 'text-amber' : 'text-muted'}">Due: ${formatINR(outstanding)}</small>
          </td>
          <td>
            <span class="${isOverdue ? 'text-rose' : ''}">${formatDate(inv.dueDate)}</span>
            ${isOverdue ? '<br><small class="text-rose" style="font-weight: 700;">OVERDUE</small>' : ''}
          </td>
          <td><span class="badge ${badgeClass}">${inv.status}</span></td>
          <td>
            <div class="flex gap-2">
              <button class="btn btn-secondary btn-sm" onclick="app.viewInvoiceFormat('${inv.id}')" title="View & Print Official Invoice">📄 Format</button>
              ${outstanding > 0 ? `<button class="btn btn-primary btn-sm" onclick="app.openRecordPaymentModal('${inv.id}')" style="background: #10b981; border-color: #10b981;">💳 Pay</button>` : `<span class="text-emerald text-sm" style="font-weight: 600; padding: 4px 6px;">Settled</span>`}
              <button class="btn btn-secondary btn-sm" onclick="app.openEditInvoiceModal('${inv.id}')">✏️ Edit</button>
              <button class="btn btn-danger btn-sm" onclick="app.deleteInvoice('${inv.id}')">✕</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderQuotesTable() {
    const quotesBody = document.getElementById('quotes-table-body');
    if (!quotesBody) return;
    const quotes = window.storage.getQuotations() || [];

    if (quotes.length === 0) {
      quotesBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted" style="padding: 24px;">No quotations recorded yet. Click "+ Generate Quotation" to create a proposal.</td></tr>';
      return;
    }

    quotesBody.innerHTML = quotes.map(q => `
      <tr>
        <td><strong>${q.id}</strong><br><small class="text-muted">${formatDate(q.date)}</small></td>
        <td>${q.clientName}<br><small class="text-secondary">${q.service}</small></td>
        <td><strong>${formatINR(q.totalAmount)}</strong></td>
        <td>${formatINR(q.directCostEstimate)}</td>
        <td><small class="text-emerald">Margin: ${formatINR(q.projectedMargin)} (${q.marginPercent || 0}%)</small></td>
        <td><span class="badge ${q.status === 'Accepted' ? 'badge-won' : (q.status === 'Declined' ? 'badge-lost' : 'badge-proposal')}">${q.status}</span></td>
        <td>
          <div class="flex gap-2">
            <button class="btn btn-secondary btn-sm" onclick="app.viewQuotationFormat('${q.id}')" title="View Proposal">📄 Proposal</button>
            <button class="btn btn-secondary btn-sm" onclick="app.convertQuoteToInvoice('${q.id}')">Convert Inv</button>
            <button class="btn btn-secondary btn-sm" onclick="app.openEditQuotationModal('${q.id}')">✏️ Edit</button>
            <button class="btn btn-danger btn-sm" onclick="app.deleteQuotation('${q.id}')">✕</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  renderPaymentsTable() {
    const paymentsBody = document.getElementById('payments-table-body');
    if (!paymentsBody) return;
    const payments = window.storage.getPayments() || [];

    if (payments.length === 0) {
      paymentsBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted" style="padding: 24px;">No payment collections recorded yet. Click "💳 Record Payment" to issue a receipt.</td></tr>';
      return;
    }

    paymentsBody.innerHTML = payments.map(p => `
      <tr>
        <td>
          <span class="font-mono text-xs" style="color: #10b981; font-weight: 700;">${p.id}</span><br>
          <small class="text-muted">${formatDate(p.date)}</small>
        </td>
        <td><span class="font-mono text-xs">${p.invoiceId || 'DIRECT'}</span></td>
        <td>
          <strong>${p.clientName}</strong><br>
          <small class="text-secondary">${p.service || 'Advisory / Services'}</small>
        </td>
        <td><span class="text-emerald" style="font-weight: 700;">${formatINR(p.amount)}</span></td>
        <td><span class="badge badge-won" style="font-size: 11px;">${p.paymentMethod || 'UPI / Bank Transfer'}</span></td>
        <td><span class="font-mono text-xs">${p.referenceNo || 'Verified'}</span></td>
        <td>
          <span class="${p.balanceRemaining > 0 ? 'text-amber' : 'text-emerald'}">
            ${p.balanceRemaining > 0 ? formatINR(p.balanceRemaining) : '₹0 (Settled)'}
          </span>
        </td>
        <td>
          <div class="flex gap-2">
            <button class="btn btn-secondary btn-sm" onclick="app.viewPaymentReceiptSlip('${p.id}')" title="View & Print Official Receipt Voucher">🧾 Receipt</button>
            <button class="btn btn-whatsapp btn-sm" onclick="app.sharePaymentReceiptWhatsApp('${p.id}')" title="Share via WhatsApp">💬 WA</button>
            <button class="btn btn-danger btn-sm" onclick="app.deletePayment('${p.id}')" title="Delete Payment Record">✕</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  renderGstBreakdownTable() {
    const gstBody = document.getElementById('gst-breakdown-table-body');
    if (!gstBody) return;
    const invoices = window.storage.getInvoices() || [];

    if (invoices.length === 0) {
      gstBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted" style="padding: 24px;">No invoice ledger entries available for GST calculation.</td></tr>';
      return;
    }

    gstBody.innerHTML = invoices.map(inv => {
      const hsnInfo = window.invoiceController ? window.invoiceController.detectHsnSac(inv.service) : null;
      const sacCode = inv.hsnSac || (hsnInfo ? hsnInfo.code : '998313');
      const total = Number(inv.amountBilled) || 0;
      const base = Math.round(total / 1.18);
      const gstAmt = total - base;
      const cgst = Math.round(gstAmt / 2);
      const sgst = gstAmt - cgst;

      return `
        <tr>
          <td><span class="font-mono text-xs" style="font-weight: 700;">${inv.id}</span></td>
          <td>
            <strong>${inv.clientName}</strong><br>
            <small class="text-muted">${inv.clientAddress || 'Guwahati, Assam (State Code: 18)'}</small>
          </td>
          <td>
            <span class="font-mono text-xs" style="background: rgba(2, 132, 199, 0.12); color: #0284c7; padding: 2px 6px; border-radius: 4px;">SAC ${sacCode}</span><br>
            <small class="text-secondary">${inv.service}</small>
          </td>
          <td class="font-mono"><strong>${formatINR(base)}</strong></td>
          <td class="font-mono text-cyan">${formatINR(cgst)}</td>
          <td class="font-mono text-cyan">${formatINR(sgst)}</td>
          <td class="font-mono text-emerald"><strong>${formatINR(total)}</strong></td>
          <td><span class="badge ${inv.status === 'Paid' ? 'badge-won' : 'badge-proposal'}">${inv.status}</span></td>
        </tr>
      `;
    }).join('');
  }

  populateBillingAutofills() {
    const leads = window.storage.getLeads() || [];
    const quotes = window.storage.getQuotations() || [];

    // Quote autofill dropdown
    const quoteSel = document.getElementById('quote-lead-autofill');
    if (quoteSel) {
      quoteSel.innerHTML = '<option value="">-- Select Lead to Autofill Scope & Pricing --</option>' +
        leads.map(l => `<option value="${l.id}">${l.name} — ${l.service} (${formatINR(l.estimatedValue)})</option>`).join('');
    }

    // Invoice autofill dropdown
    const invSel = document.getElementById('invoice-lead-autofill');
    if (invSel) {
      let options = '<option value="">-- Select Lead or Quote to Autofill Client Details --</option>';
      if (quotes.length > 0) {
        options += '<optgroup label="From Accepted / Formal Quotations">';
        quotes.forEach(q => {
          options += `<option value="QUOTE:${q.id}">[Quote ${q.id}] ${q.clientName} — ${q.service} (${formatINR(q.totalAmount)})</option>`;
        });
        options += '</optgroup>';
      }
      if (leads.length > 0) {
        options += '<optgroup label="From CRM Sales Leads">';
        leads.forEach(l => {
          options += `<option value="LEAD:${l.id}">[Lead ${l.id}] ${l.name} — ${l.service} (${formatINR(l.estimatedValue)})</option>`;
        });
        options += '</optgroup>';
      }
      invSel.innerHTML = options;
    }
  }

  autofillQuoteFromLead(leadId) {
    if (!leadId) return;
    const lead = (window.storage.getLeads() || []).find(l => l.id === leadId);
    if (!lead) return;

    if (document.getElementById('quote-client')) document.getElementById('quote-client').value = lead.name;
    if (document.getElementById('quote-service')) document.getElementById('quote-service').value = lead.service;
    if (document.getElementById('quote-amount')) document.getElementById('quote-amount').value = lead.estimatedValue || '';
    if (document.getElementById('quote-cost')) document.getElementById('quote-cost').value = Math.round((lead.estimatedValue || 0) * 0.8);
    
    const tbody = document.getElementById('quote-items-table-body');
    if (tbody) {
      tbody.innerHTML = '';
      const hsn = window.invoiceController ? window.invoiceController.detectHsnSac(lead.service) : null;
      this.addQuoteItemRow({
        description: lead.service,
        sac: hsn ? hsn.code : '995461',
        qty: 1,
        unit: 'Job',
        rate: lead.estimatedValue || '',
        amount: lead.estimatedValue || ''
      });
    }

    showToast(`Autofilled quotation details from lead ${lead.name}`, 'info');
  }

  autofillInvoiceFromLead(val) {
    if (!val) return;
    if (val.startsWith('QUOTE:')) {
      const qId = val.replace('QUOTE:', '');
      const quote = (window.storage.getQuotations() || []).find(q => q.id === qId);
      if (quote) {
        if (document.getElementById('invoice-client')) document.getElementById('invoice-client').value = quote.clientName;
        if (document.getElementById('invoice-service')) document.getElementById('invoice-service').value = quote.service;
        if (document.getElementById('invoice-billed')) document.getElementById('invoice-billed').value = quote.totalAmount || '';
        if (document.getElementById('invoice-notes') && quote.terms) document.getElementById('invoice-notes').value = quote.terms;
        const hsn = window.invoiceController ? window.invoiceController.detectHsnSac(quote.service) : null;
        if (document.getElementById('invoice-hsn') && hsn) document.getElementById('invoice-hsn').value = hsn.code;

        const tbody = document.getElementById('invoice-items-table-body');
        if (tbody) {
          tbody.innerHTML = '';
          if (Array.isArray(quote.items) && quote.items.length > 0) {
            quote.items.forEach(it => this.addInvoiceItemRow(it));
          } else {
            this.addInvoiceItemRow({
              description: quote.service,
              sac: hsn ? hsn.code : '995461',
              qty: 1,
              unit: 'Job',
              rate: quote.totalAmount,
              amount: quote.totalAmount
            });
          }
        }

        showToast(`Autofilled invoice from Quotation ${quote.id}`, 'info');
      }
    } else if (val.startsWith('LEAD:')) {
      const lId = val.replace('LEAD:', '');
      const lead = (window.storage.getLeads() || []).find(l => l.id === lId);
      if (lead) {
        if (document.getElementById('invoice-client')) document.getElementById('invoice-client').value = lead.name;
        if (document.getElementById('invoice-service')) document.getElementById('invoice-service').value = lead.service;
        if (document.getElementById('invoice-billed')) document.getElementById('invoice-billed').value = lead.estimatedValue || '';
        const hsn = window.invoiceController ? window.invoiceController.detectHsnSac(lead.service) : null;
        if (document.getElementById('invoice-hsn') && hsn) document.getElementById('invoice-hsn').value = hsn.code;

        const tbody = document.getElementById('invoice-items-table-body');
        if (tbody) {
          tbody.innerHTML = '';
          this.addInvoiceItemRow({
            description: lead.service,
            sac: hsn ? hsn.code : '995461',
            qty: 1,
            unit: 'Job',
            rate: lead.estimatedValue || '',
            amount: lead.estimatedValue || ''
          });
        }

        showToast(`Autofilled invoice from Lead ${lead.name}`, 'info');
      }
    }
  }

  renderFinanceTab() {
    const finSummary = window.financeController.getFinancialSummary();
    const forecast = window.financeController.get90DayCashFlowForecast();
    const expenses = window.storage.getExpenses();
    const drawings = window.storage.getDrawings();

    // Fill summary cards
    document.getElementById('fin-quoted-amount').textContent = formatINR(finSummary.totalQuoted);
    document.getElementById('fin-invoiced-rev').textContent = formatINR(finSummary.totalInvoiced);
    document.getElementById('fin-collected-cash').textContent = formatINR(finSummary.cashCollected);
    document.getElementById('fin-receivables').textContent = formatINR(finSummary.outstandingReceivables);
    document.getElementById('fin-direct-costs').textContent = formatINR(finSummary.directCosts);
    document.getElementById('fin-gross-profit').textContent = formatINR(finSummary.grossProfitCollected);
    document.getElementById('fin-overheads').textContent = formatINR(finSummary.operatingOverheads);
    document.getElementById('fin-tax-reserve').textContent = `${formatINR(finSummary.taxReserve)} (${finSummary.taxRatePercent}%)`;
    document.getElementById('fin-drawings').textContent = formatINR(finSummary.totalDrawings);
    document.getElementById('fin-available-cash').textContent = formatINR(finSummary.availableCashBalance);

    // 90-day cash flow cards
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = forecast.map(f => `
      <div class="card" style="border-top: 4px solid ${f.isDeficit ? 'var(--accent-rose)' : 'var(--solar-amber)'};">
        <div class="flex justify-between items-center" style="margin-bottom: 8px;">
          <h4 style="font-size: 14px;">${f.month}</h4>
          ${f.isDeficit ? '<span class="badge badge-lost">Deficit Alert</span>' : '<span class="badge badge-won">Solvent</span>'}
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">${f.notes}</div>
        <div style="font-size: 12px; margin-bottom: 4px;" class="flex justify-between">
          <span>Starting Cash:</span> <span>${formatINR(f.startingCash)}</span>
        </div>
        <div style="font-size: 12px; margin-bottom: 4px;" class="flex justify-between text-emerald">
          <span>+ Proj. Inflows:</span> <span>${formatINR(f.projectedInflow)}</span>
        </div>
        <div style="font-size: 12px; margin-bottom: 8px;" class="flex justify-between text-rose">
          <span>- Proj. Outflows:</span> <span>${formatINR(f.projectedOutflow)}</span>
        </div>
        <div style="font-size: 14px; font-weight: 700; border-top: 1px solid var(--border-color); padding-top: 8px;" class="flex justify-between">
          <span>Ending Cash:</span> <span class="${f.endingCash < 0 ? 'text-rose' : 'text-primary'}">${formatINR(f.endingCash)}</span>
        </div>
      </div>
    `).join('');

    // Expenses Table
    const expensesBody = document.getElementById('expenses-table-body');
    if (expenses.length === 0) {
      expensesBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding: 20px;">No expenses recorded yet.</td></tr>';
    } else {
      expensesBody.innerHTML = expenses.map(exp => `
        <tr>
          <td>${formatDate(exp.date)}</td>
          <td><span class="badge ${exp.category === 'Direct Delivery Cost' ? 'badge-proposal' : 'badge-new'}">${exp.category}</span></td>
          <td>${exp.description}<br><small class="text-muted">Paid to: ${exp.paidTo}</small></td>
          <td><strong>${formatINR(exp.amount)}</strong></td>
          <td>${exp.linkedProject || '—'}</td>
          <td>
            <div class="flex gap-2">
              <button class="btn btn-secondary btn-sm" onclick="app.openEditExpenseModal('${exp.id}')">✏️ Edit</button>
              <button class="btn btn-danger btn-sm" onclick="app.deleteExpense('${exp.id}')">✕</button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    // Drawings Table
    const drawingsBody = document.getElementById('drawings-table-body');
    if (drawings.length === 0) {
      drawingsBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding: 20px;">No personal drawings recorded yet.</td></tr>';
    } else {
      drawingsBody.innerHTML = drawings.map(d => `
        <tr>
          <td>${formatDate(d.date)}</td>
          <td><strong>${formatINR(d.amount)}</strong></td>
          <td>${d.purpose || 'Living allowance'}</td>
          <td>${d.account || 'Personal Bank'}</td>
          <td>
            <div class="flex gap-2">
              <button class="btn btn-secondary btn-sm" onclick="app.openEditDrawingModal('${d.id}')">✏️ Edit</button>
              <button class="btn btn-danger btn-sm" onclick="app.deleteDrawing('${d.id}')">✕</button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  }

  renderProjectsTab() {
    const solarProjects = window.storage.getSolarProjects();
    const itProjects = window.storage.getItProjects();

    // Solar Projects
    const solarContainer = document.getElementById('solar-projects-container');
    if (solarProjects.length === 0) {
      solarContainer.innerHTML = '<div class="card text-center text-muted">No active solar projects. Won solar proposals appear here.</div>';
    } else {
      solarContainer.innerHTML = solarProjects.map(proj => {
        const progress = window.projectsController.calculateSolarProgress(proj);
        return `
          <div class="card" style="margin-bottom: 20px;">
            <div class="flex justify-between items-center" style="margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
              <div>
                <h3 style="font-size: 16px;">${proj.clientName} (${proj.systemCapacityKwp} kWp)</h3>
                <span class="text-muted" style="font-size: 12px;">Site: ${proj.siteLocation} | DISCOM: ${proj.discom || 'APDCL'} (Sanctioned: ${proj.sanctionedLoadKw || '—'} kW)</span>
              </div>
              <div class="text-right">
                <span class="text-amber font-mono" style="font-size: 16px; font-weight: 700;">${formatINR(proj.totalContractValue)}</span><br>
                <small class="text-muted">Progress: ${progress}%</small>
                <div class="flex gap-2" style="margin-top: 6px; justify-content: flex-end;">
                  <button class="btn btn-secondary btn-sm" onclick="app.openEditSolarProjectModal('${proj.id}')">✏️ Modify</button>
                  <button class="btn btn-danger btn-sm" onclick="app.deleteSolarProject('${proj.id}')">✕</button>
                </div>
              </div>
            </div>

            <!-- Milestones -->
            <div style="margin-bottom: 16px;">
              <h4 style="font-size: 12px; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 8px;">Delivery & Commissioning Milestones</h4>
              <div class="grid grid-cols-2 gap-2">
                ${(proj.milestones || []).map((m, idx) => `
                  <div style="background: var(--bg-surface); padding: 8px 12px; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-size: 12px; font-weight: 600;">${m.name}</div>
                      <div style="font-size: 10px; color: var(--text-muted);">Target: ${formatDate(m.date)}</div>
                    </div>
                    <select class="form-control" style="width: auto; padding: 2px 6px; font-size: 11px;" onchange="app.updateSolarMilestoneStatus('${proj.id}', ${idx}, this.value)">
                      <option value="Pending" ${m.status === 'Pending' ? 'selected' : ''}>Pending</option>
                      <option value="In Progress" ${m.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                      <option value="Completed" ${m.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                  </div>
                `).join('')}
              </div>
            </div>

            <div style="background: rgba(245, 158, 11, 0.08); border-left: 3px solid var(--solar-amber); padding: 8px 12px; font-size: 11px; color: var(--text-secondary);">
              <strong>Technical Assumptions & Notes:</strong> ${proj.assumptions || 'Solar generation benchmark calibrated at 120 units/kWp/month.'}
            </div>
          </div>
        `;
      }).join('');
    }

    // IT Projects
    const itContainer = document.getElementById('it-projects-container');
    if (itProjects.length === 0) {
      itContainer.innerHTML = '<div class="card text-center text-muted">No active IT projects.</div>';
    } else {
      itContainer.innerHTML = itProjects.map(proj => {
        const progress = window.projectsController.calculateItProgress(proj);
        return `
          <div class="card" style="margin-bottom: 20px;">
            <div class="flex justify-between items-center" style="margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
              <div>
                <h3 style="font-size: 16px;">${proj.clientName}</h3>
                <span class="text-cyan" style="font-size: 12px;">Scope: ${proj.serviceScope}</span>
              </div>
              <div class="text-right">
                <span class="text-cyan font-mono" style="font-size: 16px; font-weight: 700;">${formatINR(proj.contractValue)}</span><br>
                <small class="text-muted">Progress: ${progress}%</small>
                <div class="flex gap-2" style="margin-top: 6px; justify-content: flex-end;">
                  <button class="btn btn-secondary btn-sm" onclick="app.openEditItProjectModal('${proj.id}')">✏️ Modify</button>
                  <button class="btn btn-danger btn-sm" onclick="app.deleteItProject('${proj.id}')">✕</button>
                </div>
              </div>
            </div>

            <!-- Milestones -->
            <div style="margin-bottom: 16px;">
              <h4 style="font-size: 12px; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 8px;">Development Milestones</h4>
              <div class="grid grid-cols-2 gap-2">
                ${(proj.milestones || []).map((m, idx) => `
                  <div style="background: var(--bg-surface); padding: 8px 12px; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-size: 12px; font-weight: 600;">${m.name}</div>
                      <div style="font-size: 10px; color: var(--text-muted);">Target: ${formatDate(m.date)}</div>
                    </div>
                    <select class="form-control" style="width: auto; padding: 2px 6px; font-size: 11px;" onchange="app.updateItMilestoneStatus('${proj.id}', ${idx}, this.value)">
                      <option value="Pending" ${m.status === 'Pending' ? 'selected' : ''}>Pending</option>
                      <option value="In Progress" ${m.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                      <option value="Completed" ${m.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Encrypted Local Credential Vault -->
            <div style="background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: var(--radius-md); padding: 10px 14px;">
              <div class="flex justify-between items-center" style="margin-bottom: 6px;">
                <strong style="font-size: 12px; color: var(--tech-cyan);">🔐 Secure Local Credential Vault:</strong>
                <small class="text-muted">Stored offline only</small>
              </div>
              <div style="font-size: 12px; color: var(--text-primary); font-family: var(--font-mono);">${proj.vaultNotes || 'No credentials stored.'}</div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // --- ERP OPERATIONS & FIELD EXECUTION TRACKER CONTROLS ---
  renderOperationsDashboard() {
    if (!window.operationsController) return;
    const summary = window.operationsController.getOperationalSummary();

    // 1. Populate Operations KPI Cards
    const elSolarCap = document.getElementById('op-kpi-solar-capacity');
    if (elSolarCap) elSolarCap.textContent = `${summary.totalSolarKwp} kWp`;
    const elSolarCount = document.getElementById('op-kpi-solar-count');
    if (elSolarCount) elSolarCount.textContent = `${summary.solarProjectsCount} active site(s) under execution`;

    const elBomSpend = document.getElementById('op-kpi-bom-spend');
    if (elBomSpend) elBomSpend.textContent = formatINR(summary.bomActualTotal || summary.bomEstTotal);
    const elBomStatus = document.getElementById('op-kpi-bom-status');
    if (elBomStatus) elBomStatus.textContent = `${summary.bomDeliveredCount}/${summary.totalBOMItems} delivered to site`;

    const elWoCount = document.getElementById('op-kpi-wo-count');
    if (elWoCount) elWoCount.textContent = `${summary.woActiveCount} Active`;
    const elWoFees = document.getElementById('op-kpi-wo-fees');
    if (elWoFees) elWoFees.textContent = `${formatINR(summary.woFeesTotal)} contractor fees`;

    const elApdcl = document.getElementById('op-kpi-apdcl-status');
    if (elApdcl) {
      elApdcl.textContent = summary.apdclUnderReview > 0 ? `${summary.apdclUnderReview} In Review` : 'All Approved';
    }

    // 2. Render Sub-Tables
    this.renderBOMTable();
    this.renderWorkOrdersTable();
    this.renderApdclTable();
  }

  switchOpSubTab(subTab) {
    const tabs = ['deliverables', 'bom', 'workorders', 'apdcl'];
    tabs.forEach(t => {
      const viewEl = document.getElementById(`op-view-${t}`);
      const btnEl = document.getElementById(`btn-subtab-${t}`);
      if (viewEl) viewEl.classList.toggle('hidden', t !== subTab);
      if (btnEl) {
        if (t === subTab) {
          btnEl.classList.add('active');
          btnEl.style.borderColor = 'var(--solar-amber)';
          btnEl.style.color = 'var(--solar-amber)';
        } else {
          btnEl.classList.remove('active');
          btnEl.style.borderColor = 'var(--border-color)';
          btnEl.style.color = 'var(--text-secondary)';
        }
      }
    });

    if (subTab === 'bom') this.renderBOMTable();
    else if (subTab === 'workorders') this.renderWorkOrdersTable();
    else if (subTab === 'apdcl') this.renderApdclTable();
  }

  // --- BOM & PROCUREMENTS TABLE ---
  filterBOMTable(filterVal) {
    this.renderBOMTable(filterVal);
  }

  renderBOMTable(filterVal = 'all') {
    const tableBody = document.getElementById('op-bom-table-body');
    if (!tableBody) return;

    const list = window.operationsController ? window.operationsController.getProcurements(filterVal) : (window.storage.getProcurements() || []);
    if (list.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="10" class="text-center text-muted" style="padding: 24px;">No material requisitions found matching filter. Click "+ Add Requisition (BOM)" to log components.</td></tr>';
      return;
    }

    tableBody.innerHTML = list.map(item => {
      const isDelivered = item.status === 'Delivered at Site' || item.status === 'Quality Inspected';
      const statusColor = isDelivered ? '#10b981' : (item.status === 'In Transit' ? '#0284c7' : '#f59e0b');

      return `
        <tr>
          <td><span class="font-mono text-xs" style="color: var(--solar-amber); font-weight: 700;">${item.id}</span></td>
          <td><span class="font-mono text-xs">${item.projectId || 'General'}</span></td>
          <td><span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.06);">${item.itemCategory}</span></td>
          <td>
            <strong>${item.itemName}</strong>
            ${item.notes ? `<div style="font-size: 10px; color: var(--text-muted);">${item.notes}</div>` : ''}
          </td>
          <td>${item.supplierName || '—'}</td>
          <td><span class="font-mono">${item.quantity || '1 Set'}</span></td>
          <td>
            <div class="font-mono font-bold">${formatINR(item.actualCost || item.estimatedCost)}</div>
            ${item.actualCost && item.estimatedCost && item.actualCost !== item.estimatedCost ? 
              `<div style="font-size: 10px; color: var(--text-muted);">Est: ${formatINR(item.estimatedCost)}</div>` : ''}
          </td>
          <td>${formatDate(item.targetDeliveryDate)}</td>
          <td>
            <select class="form-control" style="width: auto; padding: 2px 6px; font-size: 11px; color: ${statusColor}; font-weight: 700;" onchange="app.updateProcurementStatus('${item.id}', this.value)">
              <option value="Requisitioned" ${item.status === 'Requisitioned' ? 'selected' : ''}>Requisitioned</option>
              <option value="PO Issued" ${item.status === 'PO Issued' ? 'selected' : ''}>PO Issued</option>
              <option value="In Transit" ${item.status === 'In Transit' ? 'selected' : ''}>In Transit</option>
              <option value="Delivered at Site" ${item.status === 'Delivered at Site' ? 'selected' : ''}>Delivered at Site</option>
              <option value="Quality Inspected" ${item.status === 'Quality Inspected' ? 'selected' : ''}>Quality Inspected</option>
            </select>
          </td>
          <td style="text-align: right;">
            <div class="flex gap-1" style="justify-content: flex-end;">
              <button class="btn btn-secondary btn-sm" onclick="app.openEditProcurementModal('${item.id}')" title="Edit Requisition">✏️</button>
              <button class="btn btn-danger btn-sm" onclick="app.deleteProcurement('${item.id}')" title="Delete">✕</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // --- FIELD WORK ORDERS TABLE ---
  filterWorkOrdersTable(filterVal) {
    this.renderWorkOrdersTable(filterVal);
  }

  renderWorkOrdersTable(filterVal = 'all') {
    const tableBody = document.getElementById('op-wo-table-body');
    if (!tableBody) return;

    const list = window.operationsController ? window.operationsController.getWorkOrders(filterVal) : (window.storage.getWorkOrders() || []);
    if (list.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="9" class="text-center text-muted" style="padding: 24px;">No field work orders found matching filter. Click "+ Dispatch Work Order" to assign tasks.</td></tr>';
      return;
    }

    tableBody.innerHTML = list.map(wo => {
      const isDone = wo.status === 'Completed' || wo.status === 'Completed & Signed Off';
      const statusColor = isDone ? '#10b981' : (wo.status === 'In Progress' ? '#0284c7' : '#f59e0b');

      return `
        <tr>
          <td><span class="font-mono text-xs" style="color: #a78bfa; font-weight: 700;">${wo.id}</span></td>
          <td><span class="font-mono text-xs">${wo.projectId || 'General'}</span></td>
          <td>
            <strong>${wo.title}</strong>
            ${wo.safetyCompliance ? `<div style="font-size: 10px; color: var(--solar-amber); margin-top: 2px;">⚠️ ${wo.safetyCompliance}</div>` : ''}
          </td>
          <td>
            <div><strong>${wo.assignedTo}</strong></div>
            ${wo.contactPhone ? `<div style="font-size: 11px; color: var(--text-muted);">${wo.contactPhone}</div>` : ''}
          </td>
          <td><span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.06);">${wo.workType}</span></td>
          <td>${formatDate(wo.scheduledDate)}</td>
          <td><span class="font-mono font-bold">${formatINR(wo.contractorFee)}</span></td>
          <td>
            <select class="form-control" style="width: auto; padding: 2px 6px; font-size: 11px; color: ${statusColor}; font-weight: 700;" onchange="app.updateWorkOrderStatus('${wo.id}', this.value)">
              <option value="Scheduled" ${wo.status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
              <option value="Dispatched" ${wo.status === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
              <option value="In Progress" ${wo.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Under Inspection" ${wo.status === 'Under Inspection' ? 'selected' : ''}>Under Inspection</option>
              <option value="Completed & Signed Off" ${wo.status === 'Completed & Signed Off' || wo.status === 'Completed' ? 'selected' : ''}>Completed & Signed Off</option>
            </select>
          </td>
          <td style="text-align: right;">
            <div class="flex gap-1" style="justify-content: flex-end;">
              <button class="btn btn-secondary btn-sm" onclick="app.viewWorkOrderSlip('${wo.id}')" title="Print Work Order Slip" style="color: var(--solar-amber); font-weight: 700;">📋 Slip</button>
              <button class="btn btn-secondary btn-sm" onclick="app.openEditWorkOrderModal('${wo.id}')" title="Edit">✏️</button>
              <button class="btn btn-danger btn-sm" onclick="app.deleteWorkOrder('${wo.id}')" title="Delete">✕</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // --- APDCL STATUTORY COMPLIANCE TABLE ---
  renderApdclTable() {
    const tableBody = document.getElementById('op-apdcl-table-body');
    if (!tableBody) return;

    const solarProjects = window.storage.getSolarProjects() || [];
    if (solarProjects.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="11" class="text-center text-muted" style="padding: 24px;">No active solar projects requiring DISCOM net-metering. Add a solar project to track APDCL liaison.</td></tr>';
      return;
    }

    tableBody.innerHTML = solarProjects.map(proj => {
      const nocStatus = proj.feasibilityNocStatus || 'In Progress';
      const ceigStatus = proj.ceigStatus || 'Pending';
      const netMeterStatus = proj.netMeterStatus || 'Pending';

      return `
        <tr>
          <td><span class="font-mono text-xs font-bold" style="color: var(--solar-amber);">${proj.id}</span></td>
          <td>
            <strong>${proj.clientName}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">${proj.siteLocation || 'Guwahati'}</div>
          </td>
          <td><span class="badge" style="background: rgba(245, 158, 11, 0.15); color: var(--solar-amber);">${proj.discom || 'APDCL'}</span></td>
          <td><span class="font-mono">${proj.consumerNo || '—'}</span></td>
          <td><span class="font-mono font-bold">${proj.sanctionedLoadKw || '—'} kW</span></td>
          <td><span class="font-mono font-bold text-amber">${proj.systemCapacityKwp || '—'} kWp</span></td>
          <td><span class="font-mono text-xs">${proj.applicationNo || 'APDCL-PORTAL-TBD'}</span></td>
          <td><span class="font-mono text-xs">${proj.dtrCode || 'DTR-LOC-TBD'}</span></td>
          <td>
            <select class="form-control" style="width: auto; padding: 2px 6px; font-size: 11px; font-weight: 700; color: ${nocStatus === 'Approved' ? '#10b981' : '#f59e0b'};" onchange="app.updateApdclField('${proj.id}', 'feasibilityNocStatus', this.value)">
              <option value="Pending" ${nocStatus === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="In Progress" ${nocStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Approved" ${nocStatus === 'Approved' ? 'selected' : ''}>Approved</option>
              <option value="Rejected" ${nocStatus === 'Rejected' ? 'selected' : ''}>Rejected</option>
            </select>
          </td>
          <td>
            <select class="form-control" style="width: auto; padding: 2px 6px; font-size: 11px; font-weight: 700; color: ${ceigStatus === 'Approved' ? '#10b981' : '#f59e0b'};" onchange="app.updateApdclField('${proj.id}', 'ceigStatus', this.value)">
              <option value="Pending" ${ceigStatus === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Under Inspection" ${ceigStatus === 'Under Inspection' ? 'selected' : ''}>Under Inspection</option>
              <option value="Approved" ${ceigStatus === 'Approved' ? 'selected' : ''}>Approved</option>
            </select>
          </td>
          <td>
            <select class="form-control" style="width: auto; padding: 2px 6px; font-size: 11px; font-weight: 700; color: ${netMeterStatus === 'Synchronized' || netMeterStatus === 'Completed' ? '#10b981' : '#f59e0b'};" onchange="app.updateApdclField('${proj.id}', 'netMeterStatus', this.value)">
              <option value="Pending" ${netMeterStatus === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Meter Issued" ${netMeterStatus === 'Meter Issued' ? 'selected' : ''}>Meter Issued</option>
              <option value="Installed" ${netMeterStatus === 'Installed' ? 'selected' : ''}>Installed</option>
              <option value="Synchronized" ${netMeterStatus === 'Synchronized' || netMeterStatus === 'Completed' ? 'selected' : ''}>Synchronized</option>
            </select>
          </td>
        </tr>
      `;
    }).join('');
  }

  updateApdclField(projId, fieldName, value) {
    const store = window.storage.getStore();
    const proj = (store.solarProjects || []).find(p => p.id === projId);
    if (proj) {
      proj[fieldName] = value;
      window.storage.saveStore(store);
      showToast(`APDCL status updated: ${fieldName} -> ${value}`, 'success');
      this.renderOperationsDashboard();
    }
  }

  // --- MATERIAL PROCUREMENTS (BOM) MODAL CONTROLS ---
  populateProjectSelect(selectId, selectedVal = '') {
    const selectEl = document.getElementById(selectId);
    if (!selectEl) return;
    const solarList = window.storage.getSolarProjects() || [];
    const itList = window.storage.getItProjects() || [];

    let options = '<option value="">(Unassigned / General Inventory)</option>';
    solarList.forEach(p => {
      options += `<option value="${p.id}" ${p.id === selectedVal ? 'selected' : ''}>[Solar] ${p.id} — ${p.clientName} (${p.systemCapacityKwp} kWp)</option>`;
    });
    itList.forEach(p => {
      options += `<option value="${p.id}" ${p.id === selectedVal ? 'selected' : ''}>[IT] ${p.id} — ${p.clientName}</option>`;
    });
    selectEl.innerHTML = options;
  }

  openAddProcurementModal(editProc = null) {
    this.populateProjectSelect('procurement-project', editProc ? editProc.projectId : '');
    const titleEl = document.getElementById('procurement-modal-title');

    if (editProc) {
      if (titleEl) titleEl.textContent = `Edit Component Requisition: ${editProc.id}`;
      document.getElementById('procurement-id').value = editProc.id;
      document.getElementById('procurement-category').value = editProc.itemCategory || 'Solar Modules';
      document.getElementById('procurement-item-name').value = editProc.itemName || '';
      document.getElementById('procurement-supplier').value = editProc.supplierName || '';
      document.getElementById('procurement-quantity').value = editProc.quantity || '';
      document.getElementById('procurement-est-cost').value = editProc.estimatedCost || '';
      document.getElementById('procurement-actual-cost').value = editProc.actualCost || '';
      document.getElementById('procurement-order-date').value = editProc.orderDate || new Date().toISOString().slice(0, 10);
      document.getElementById('procurement-target-date').value = editProc.targetDeliveryDate || '';
      document.getElementById('procurement-status').value = editProc.status || 'Requisitioned';
      document.getElementById('procurement-ref').value = editProc.invoiceRef || '';
      document.getElementById('procurement-notes').value = editProc.notes || '';
    } else {
      if (titleEl) titleEl.textContent = '📦 New Material Requisition & BOM Procurement';
      document.getElementById('procurement-id').value = '';
      document.getElementById('procurement-category').value = 'Solar Modules';
      document.getElementById('procurement-item-name').value = '';
      document.getElementById('procurement-supplier').value = '';
      document.getElementById('procurement-quantity').value = '1 Job';
      document.getElementById('procurement-est-cost').value = '';
      document.getElementById('procurement-actual-cost').value = '';
      document.getElementById('procurement-order-date').value = new Date().toISOString().slice(0, 10);
      document.getElementById('procurement-target-date').value = '';
      document.getElementById('procurement-status').value = 'Requisitioned';
      document.getElementById('procurement-ref').value = '';
      document.getElementById('procurement-notes').value = '';
    }
    document.getElementById('modal-add-procurement').classList.remove('hidden');
  }

  openEditProcurementModal(id) {
    const list = window.storage.getProcurements() || [];
    const item = list.find(p => p.id === id);
    if (item) this.openAddProcurementModal(item);
  }

  saveProcurementFromModal() {
    const id = document.getElementById('procurement-id').value;
    const projectId = document.getElementById('procurement-project').value;
    const itemCategory = document.getElementById('procurement-category').value;
    const itemName = document.getElementById('procurement-item-name').value.trim();
    const supplierName = document.getElementById('procurement-supplier').value.trim();
    const quantity = document.getElementById('procurement-quantity').value.trim();
    const estimatedCost = Number(document.getElementById('procurement-est-cost').value) || 0;
    const actualCost = Number(document.getElementById('procurement-actual-cost').value) || estimatedCost;
    const orderDate = document.getElementById('procurement-order-date').value;
    const targetDeliveryDate = document.getElementById('procurement-target-date').value;
    const status = document.getElementById('procurement-status').value;
    const invoiceRef = document.getElementById('procurement-ref').value.trim();
    const notes = document.getElementById('procurement-notes').value.trim();

    if (!itemName || !estimatedCost) {
      showToast('Please enter component specification and estimated cost.', 'error');
      return;
    }

    const saved = window.storage.saveProcurement({
      id: id || undefined,
      projectId,
      itemCategory,
      itemName,
      supplierName,
      quantity,
      estimatedCost,
      actualCost,
      orderDate,
      targetDeliveryDate,
      status,
      invoiceRef,
      notes
    });

    this.closeAllModals();
    showToast(`BOM Component Requisition saved: ${saved.id}`, 'success');
    this.renderOperationsDashboard();
  }

  updateProcurementStatus(id, newStatus) {
    window.storage.updateProcurementStatus(id, newStatus);
    showToast(`Material status updated: ${newStatus}`, 'info');
    this.renderOperationsDashboard();
  }

  deleteProcurement(id) {
    if (confirm('Are you sure you want to delete this material requisition?')) {
      window.storage.deleteProcurement(id);
      showToast('Material requisition removed.', 'info');
      this.renderOperationsDashboard();
    }
  }

  // --- FIELD WORK ORDERS MODAL CONTROLS ---
  openAddWorkOrderModal(editWo = null) {
    this.populateProjectSelect('workorder-project', editWo ? editWo.projectId : '');
    const titleEl = document.getElementById('workorder-modal-title');

    if (editWo) {
      if (titleEl) titleEl.textContent = `Edit Work Order: ${editWo.id}`;
      document.getElementById('workorder-id').value = editWo.id;
      document.getElementById('workorder-type').value = editWo.workType || 'Civil & Structural Fabrication';
      document.getElementById('workorder-title').value = editWo.title || '';
      document.getElementById('workorder-assigned').value = editWo.assignedTo || '';
      document.getElementById('workorder-phone').value = editWo.contactPhone || '';
      document.getElementById('workorder-scheduled-date').value = editWo.scheduledDate || new Date().toISOString().slice(0, 10);
      document.getElementById('workorder-target-date').value = editWo.targetCompletionDate || '';
      document.getElementById('workorder-fee').value = editWo.contractorFee || '';
      document.getElementById('workorder-safety').value = editWo.safetyCompliance || '';
      document.getElementById('workorder-status').value = editWo.status || 'Scheduled';
      document.getElementById('workorder-notes').value = editWo.notes || '';
    } else {
      if (titleEl) titleEl.textContent = '👷 Dispatch New Field Work Order';
      document.getElementById('workorder-id').value = '';
      document.getElementById('workorder-type').value = 'Civil & Structural Fabrication';
      document.getElementById('workorder-title').value = '';
      document.getElementById('workorder-assigned').value = '';
      document.getElementById('workorder-phone').value = '';
      document.getElementById('workorder-scheduled-date').value = new Date().toISOString().slice(0, 10);
      document.getElementById('workorder-target-date').value = '';
      document.getElementById('workorder-fee').value = '';
      document.getElementById('workorder-safety').value = 'Full fall-arrest harness, hard hats, safety boots & CEIG earthing resistance verified';
      document.getElementById('workorder-status').value = 'Scheduled';
      document.getElementById('workorder-notes').value = '';
    }
    document.getElementById('modal-add-work-order').classList.remove('hidden');
  }

  openEditWorkOrderModal(id) {
    const list = window.storage.getWorkOrders() || [];
    const item = list.find(w => w.id === id);
    if (item) this.openAddWorkOrderModal(item);
  }

  saveWorkOrderFromModal() {
    const id = document.getElementById('workorder-id').value;
    const projectId = document.getElementById('workorder-project').value;
    const workType = document.getElementById('workorder-type').value;
    const title = document.getElementById('workorder-title').value.trim();
    const assignedTo = document.getElementById('workorder-assigned').value.trim();
    const contactPhone = document.getElementById('workorder-phone').value.trim();
    const scheduledDate = document.getElementById('workorder-scheduled-date').value;
    const targetCompletionDate = document.getElementById('workorder-target-date').value;
    const contractorFee = Number(document.getElementById('workorder-fee').value) || 0;
    const safetyCompliance = document.getElementById('workorder-safety').value.trim();
    const status = document.getElementById('workorder-status').value;
    const notes = document.getElementById('workorder-notes').value.trim();

    if (!title || !assignedTo || !scheduledDate) {
      showToast('Please provide work order title, contractor name, and scheduled date.', 'error');
      return;
    }

    const saved = window.storage.saveWorkOrder({
      id: id || undefined,
      projectId,
      workType,
      title,
      assignedTo,
      contactPhone,
      scheduledDate,
      targetCompletionDate,
      contractorFee,
      safetyCompliance,
      status,
      notes
    });

    this.closeAllModals();
    showToast(`Work Order Dispatched: ${saved.id}`, 'success');
    this.renderOperationsDashboard();
  }

  updateWorkOrderStatus(id, newStatus) {
    window.storage.updateWorkOrderStatus(id, newStatus);
    showToast(`Work order status updated: ${newStatus}`, 'info');
    this.renderOperationsDashboard();
  }

  deleteWorkOrder(id) {
    if (confirm('Are you sure you want to delete this field work order?')) {
      window.storage.deleteWorkOrder(id);
      showToast('Work order deleted.', 'info');
      this.renderOperationsDashboard();
    }
  }

  // --- WORK ORDER PRINTABLE SLIP ---
  viewWorkOrderSlip(woId) {
    const list = window.storage.getWorkOrders() || [];
    const wo = list.find(w => w.id === woId);
    if (!wo || !window.operationsController) {
      showToast('Work order not found.', 'error');
      return;
    }

    const html = window.operationsController.generateWorkOrderSlipHTML(wo);
    const contentEl = document.getElementById('workorder-slip-view-content');
    if (contentEl) contentEl.innerHTML = html;
    const activeIdEl = document.getElementById('workorder-active-view-id');
    if (activeIdEl) activeIdEl.value = wo.id;

    document.getElementById('modal-workorder-slip').classList.remove('hidden');
  }

  printWorkOrderSlip() {
    window.print();
  }

  shareWorkOrderWhatsApp() {
    const activeId = document.getElementById('workorder-active-view-id')?.value;
    const list = window.storage.getWorkOrders() || [];
    const wo = list.find(w => w.id === activeId);
    if (!wo) return;

    const phone = (wo.contactPhone || '').replace(/\D/g, '') || '919954493909';
    const text = encodeURIComponent(
      `*MAXECO ENERGY & TECH — FIELD WORK ORDER [${wo.id}]*\n\n` +
      `• *Task:* ${wo.title}\n` +
      `• *Assigned Lead:* ${wo.assignedTo}\n` +
      `• *Scheduled Date:* ${wo.scheduledDate}\n` +
      `• *Target Handover:* ${wo.targetCompletionDate || 'Immediate'}\n` +
      `• *Agreed Fee:* ₹${(wo.contractorFee || 0).toLocaleString('en-IN')}\n` +
      `• *Safety Protocol:* ${wo.safetyCompliance || 'Standard CEIG PPE mandated'}\n\n` +
      `Please confirm receipt and dispatch arrival to MaxEco Project Lead.`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  }

  copyWorkOrderSlipText() {
    const activeId = document.getElementById('workorder-active-view-id')?.value;
    const list = window.storage.getWorkOrders() || [];
    const wo = list.find(w => w.id === activeId);
    if (!wo) return;

    const text = `MAXECO ENERGY & TECH — FIELD WORK ORDER [${wo.id}]\nTask: ${wo.title}\nAssigned: ${wo.assignedTo} (${wo.contactPhone || ''})\nCategory: ${wo.workType}\nScheduled: ${wo.scheduledDate}\nFee: ₹${(wo.contractorFee || 0).toLocaleString('en-IN')}\nSafety: ${wo.safetyCompliance || ''}`;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Work order details copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Could not copy to clipboard.', 'error');
    });
  }

  // --- DAILY STANDUP BRIEF & EXPORT ---
  copyOperationsStandupBrief() {
    if (!window.operationsController) return;
    const brief = window.operationsController.generateOperationalStandupDigest();
    navigator.clipboard.writeText(brief).then(() => {
      showToast('Daily Operations Standup Brief copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Could not copy to clipboard.', 'error');
    });
  }

  exportOperationsCsv() {
    const okPO = window.storage.exportCsv('procurements');
    const okWO = window.storage.exportCsv('workOrders');
    if (okPO && okWO) {
      showToast('BOM Procurements & Work Orders CSV exports generated!', 'success');
    } else {
      showToast('Failed to export operations CSV.', 'error');
    }
  }

  renderSettingsTab() {
    const settings = window.storage.getSettings();
    document.getElementById('setting-company-name').value = settings.companyName || '';
    document.getElementById('setting-phone').value = settings.contactPhone || '';
    document.getElementById('setting-email').value = settings.contactEmail || '';
    document.getElementById('setting-whatsapp').value = settings.whatsappNumber || '';
    document.getElementById('setting-tax-rate').value = settings.taxReserveRate || 18;
    document.getElementById('setting-admin-pin').value = settings.adminPin || 'maxeco2026';
    if (document.getElementById('setting-bank-name')) document.getElementById('setting-bank-name').value = settings.bankName || 'Punjab National Bank';
    if (document.getElementById('setting-bank-acc-name')) document.getElementById('setting-bank-acc-name').value = settings.bankAccountName || 'Tamal Roy';
    if (document.getElementById('setting-bank-acc-no')) document.getElementById('setting-bank-acc-no').value = settings.bankAccountNo || '4589000100072219';
    if (document.getElementById('setting-bank-ifsc')) document.getElementById('setting-bank-ifsc').value = settings.bankIfscCode || 'PUNB0458900';
    if (document.getElementById('setting-bank-branch')) document.getElementById('setting-bank-branch').value = settings.bankBranch || 'Maligaon, Guwahati';
    if (document.getElementById('setting-bank-acc-type')) document.getElementById('setting-bank-acc-type').value = settings.bankAccountType || 'Saving Account';
  }

  // --- ACTIONS & MODAL HANDLERS ---
  openAddLeadModal() {
    document.getElementById('lead-modal-title').textContent = 'Add New Customer Lead';
    document.getElementById('lead-id').value = '';
    document.getElementById('lead-name').value = '';
    document.getElementById('lead-contact').value = '';
    document.getElementById('lead-phone').value = '';
    document.getElementById('lead-email').value = '';
    document.getElementById('lead-location').value = 'Guwahati, Assam';
    document.getElementById('lead-type').value = 'Commercial & Industrial';
    document.getElementById('lead-service').value = 'Solar EPC Coordination';
    document.getElementById('lead-source').value = 'Direct Referral';
    document.getElementById('lead-value').value = '';
    document.getElementById('lead-stage').value = 'New';
    document.getElementById('lead-next-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('lead-next-action').value = 'Initial discovery call and site requirements';
    document.getElementById('lead-notes').value = '';
    document.getElementById('lead-lost-reason-group').classList.add('hidden');
    document.getElementById('modal-lead').classList.remove('hidden');
  }

  openEditLeadModal(id) {
    const lead = window.storage.getLeads().find(l => l.id === id);
    if (!lead) return;

    document.getElementById('lead-modal-title').textContent = `Edit Lead: ${lead.name}`;
    document.getElementById('lead-id').value = lead.id;
    document.getElementById('lead-name').value = lead.name;
    document.getElementById('lead-contact').value = lead.contactPerson || '';
    document.getElementById('lead-phone').value = lead.phone || '';
    document.getElementById('lead-email').value = lead.email || '';
    document.getElementById('lead-location').value = lead.location || '';
    document.getElementById('lead-type').value = lead.customerType || 'Commercial & Industrial';
    document.getElementById('lead-service').value = lead.service || 'Solar EPC Coordination';
    document.getElementById('lead-source').value = lead.source || 'Direct Referral';
    document.getElementById('lead-value').value = lead.estimatedValue || '';
    document.getElementById('lead-stage').value = lead.stage || 'New';
    document.getElementById('lead-next-date').value = lead.nextFollowUpDate || '';
    document.getElementById('lead-next-action').value = lead.nextAction || '';
    document.getElementById('lead-notes').value = lead.notes || '';

    const lostGroup = document.getElementById('lead-lost-reason-group');
    if (lead.stage === 'Lost') {
      lostGroup.classList.remove('hidden');
      document.getElementById('lead-lost-reason').value = lead.lostReason || '';
    } else {
      lostGroup.classList.add('hidden');
    }

    document.getElementById('modal-lead').classList.remove('hidden');
  }

  saveLeadFromModal() {
    const id = document.getElementById('lead-id').value;
    const name = document.getElementById('lead-name').value.trim();
    const phone = document.getElementById('lead-phone').value.trim();
    const stage = document.getElementById('lead-stage').value;

    if (!name || !phone) {
      showToast('Please provide both Business/Client Name and Phone Number.', 'error');
      return;
    }

    let lostReason = '';
    if (stage === 'Lost') {
      lostReason = document.getElementById('lead-lost-reason').value.trim();
      if (!lostReason) {
        showToast('Please provide a reason why this deal was Lost (required for learning).', 'error');
        return;
      }
    }

    const leadData = {
      id: id || undefined,
      name,
      contactPerson: document.getElementById('lead-contact').value.trim(),
      phone,
      email: document.getElementById('lead-email').value.trim(),
      location: document.getElementById('lead-location').value.trim(),
      customerType: document.getElementById('lead-type').value,
      service: document.getElementById('lead-service').value,
      source: document.getElementById('lead-source').value,
      estimatedValue: Number(document.getElementById('lead-value').value) || 0,
      stage,
      lostReason: stage === 'Lost' ? lostReason : undefined,
      nextFollowUpDate: document.getElementById('lead-next-date').value,
      nextAction: document.getElementById('lead-next-action').value.trim(),
      notes: document.getElementById('lead-notes').value.trim()
    };

    window.storage.saveLead(leadData);
    this.closeAllModals();
    showToast(`Lead saved successfully: ${name}`, 'success');
    this.renderLeadsTab();
  }

  openRecordPaymentModal(invoiceId) {
    const inv = window.storage.getInvoices().find(i => i.id === invoiceId);
    if (!inv) return;

    const outstanding = (Number(inv.amountBilled) || 0) - (Number(inv.amountCollected) || 0);
    document.getElementById('pay-invoice-id').value = inv.id;
    document.getElementById('pay-client-name').textContent = inv.clientName;
    document.getElementById('pay-billed-amount').textContent = formatINR(inv.amountBilled);
    document.getElementById('pay-outstanding-amount').textContent = formatINR(outstanding);
    document.getElementById('pay-amount').value = outstanding;
    document.getElementById('pay-method').value = 'UPI / Bank Transfer';
    document.getElementById('pay-ref').value = '';
    document.getElementById('pay-date').value = new Date().toISOString().slice(0, 10);

    document.getElementById('modal-payment').classList.remove('hidden');
  }

  savePaymentFromModal() {
    const invId = document.getElementById('pay-invoice-id').value;
    const amount = Number(document.getElementById('pay-amount').value);
    const method = document.getElementById('pay-method').value;
    const ref = document.getElementById('pay-ref').value.trim();
    const date = document.getElementById('pay-date').value;

    if (!amount || amount <= 0) {
      showToast('Please enter a valid payment collection amount.', 'error');
      return;
    }

    window.storage.recordInvoicePayment(invId, amount, method, ref, date);
    this.closeAllModals();
    showToast(`Payment of ₹${amount.toLocaleString('en-IN')} recorded successfully!`, 'success');
    this.renderQuotesInvoicesTab();
  }

  // --- EXPENSE CONTROLS ---
  openAddExpenseModal() {
    document.getElementById('exp-edit-id').value = '';
    const titleEl = document.getElementById('exp-modal-title');
    if (titleEl) titleEl.textContent = 'Record Business Expense';
    const btnEl = document.getElementById('exp-modal-btn');
    if (btnEl) btnEl.textContent = 'Save Expense';
    document.getElementById('exp-category').value = 'Operating Overhead';
    document.getElementById('exp-desc').value = '';
    document.getElementById('exp-amount').value = '';
    document.getElementById('exp-paidto').value = '';
    document.getElementById('exp-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('exp-project').value = '';
    document.getElementById('modal-expense').classList.remove('hidden');
  }

  openEditExpenseModal(expenseId) {
    const exp = window.storage.getExpenses().find(e => e.id === expenseId);
    if (!exp) return;
    document.getElementById('exp-edit-id').value = exp.id;
    const titleEl = document.getElementById('exp-modal-title');
    if (titleEl) titleEl.textContent = `Modify Expense (${exp.id})`;
    const btnEl = document.getElementById('exp-modal-btn');
    if (btnEl) btnEl.textContent = 'Update Expense';
    document.getElementById('exp-category').value = exp.category || 'Operating Overhead';
    document.getElementById('exp-desc').value = exp.description || '';
    document.getElementById('exp-amount').value = exp.amount || '';
    document.getElementById('exp-paidto').value = exp.paidTo || '';
    document.getElementById('exp-date').value = exp.date || new Date().toISOString().slice(0, 10);
    document.getElementById('exp-project').value = exp.linkedProject || '';
    document.getElementById('modal-expense').classList.remove('hidden');
  }

  saveExpenseFromModal() {
    const editId = document.getElementById('exp-edit-id').value.trim();
    const category = document.getElementById('exp-category').value;
    const description = document.getElementById('exp-desc').value.trim();
    const amount = Number(document.getElementById('exp-amount').value);
    const paidTo = document.getElementById('exp-paidto').value.trim();
    const date = document.getElementById('exp-date').value;
    const linkedProject = document.getElementById('exp-project').value.trim();

    if (!description || !amount || amount <= 0) {
      showToast('Please specify expense description and amount.', 'error');
      return;
    }

    const expData = {
      category,
      description,
      amount,
      paidTo: paidTo || 'Vendor / Self',
      date,
      linkedProject: linkedProject || null,
      paymentMethod: 'UPI'
    };

    if (editId) {
      expData.id = editId;
    }

    window.storage.saveExpense(expData);

    this.closeAllModals();
    showToast(editId ? `Expense ${editId} updated.` : `Expense recorded: ₹${amount.toLocaleString('en-IN')}`, 'success');
    this.renderFinanceTab();
  }

  // --- DRAWING CONTROLS ---
  openAddDrawingModal() {
    document.getElementById('drw-edit-id').value = '';
    const titleEl = document.getElementById('drw-modal-title');
    if (titleEl) titleEl.textContent = 'Log Founder Living Withdrawal';
    const btnEl = document.getElementById('drw-modal-btn');
    if (btnEl) btnEl.textContent = 'Log Withdrawal';
    document.getElementById('drw-amount').value = '';
    document.getElementById('drw-purpose').value = 'Founder personal living allowance';
    document.getElementById('drw-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('modal-drawing').classList.remove('hidden');
  }

  openEditDrawingModal(drawingId) {
    const drw = window.storage.getDrawings().find(d => d.id === drawingId);
    if (!drw) return;
    document.getElementById('drw-edit-id').value = drw.id;
    const titleEl = document.getElementById('drw-modal-title');
    if (titleEl) titleEl.textContent = `Modify Withdrawal (${drw.id})`;
    const btnEl = document.getElementById('drw-modal-btn');
    if (btnEl) btnEl.textContent = 'Update Withdrawal';
    document.getElementById('drw-amount').value = drw.amount || '';
    document.getElementById('drw-purpose').value = drw.purpose || '';
    document.getElementById('drw-date').value = drw.date || new Date().toISOString().slice(0, 10);
    document.getElementById('modal-drawing').classList.remove('hidden');
  }

  saveDrawingFromModal() {
    const editId = document.getElementById('drw-edit-id').value.trim();
    const amount = Number(document.getElementById('drw-amount').value);
    const purpose = document.getElementById('drw-purpose').value.trim();
    const date = document.getElementById('drw-date').value;

    if (!amount || amount <= 0) {
      showToast('Please enter valid withdrawal amount.', 'error');
      return;
    }

    const drwData = {
      amount,
      purpose,
      date,
      account: 'Personal Bank Account'
    };

    if (editId) {
      drwData.id = editId;
    }

    window.storage.saveDrawing(drwData);

    this.closeAllModals();
    showToast(editId ? `Withdrawal ${editId} updated.` : `Personal drawing logged: ₹${amount.toLocaleString('en-IN')}`, 'info');
    this.renderFinanceTab();
  }

  // --- QUOTATION CONTROLS & LINE ITEMS REPEATER ---
  addQuoteItemRow(data = {}) {
    const tbody = document.getElementById('quote-items-table-body');
    if (!tbody) return;

    const rowId = 'quo-row-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const tr = document.createElement('tr');
    tr.id = rowId;
    tr.className = 'quote-item-row';

    const desc = (data.description !== undefined ? data.description : '').replace(/"/g, '&quot;');
    const sac = (data.sac || data.hsn || '').replace(/"/g, '&quot;');
    const qty = data.qty !== undefined && data.qty !== '' ? data.qty : 1;
    const unit = data.unit || 'Nos';
    const rate = data.rate !== undefined && data.rate !== '' ? data.rate : (data.amount !== undefined ? data.amount : '');
    const amount = Number(qty) * Number(rate) || 0;

    tr.innerHTML = `
      <td>
        <input type="text" class="form-control form-control-sm quo-item-desc" placeholder="e.g. Turnkey Solar PV Rooftop Erection" value="${desc}" required oninput="app.onQuoteItemChanged()">
      </td>
      <td>
        <input type="text" class="form-control form-control-sm quo-item-sac" placeholder="995461" value="${sac}" style="font-family: var(--font-mono); font-size: 11px;">
      </td>
      <td>
        <input type="number" class="form-control form-control-sm quo-item-qty" placeholder="1" min="0.01" step="any" value="${qty}" required oninput="app.onQuoteItemChanged()">
      </td>
      <td>
        <select class="form-control form-control-sm quo-item-unit" onchange="app.onQuoteItemChanged()">
          <option value="Nos" ${unit === 'Nos' ? 'selected' : ''}>Nos</option>
          <option value="kWp" ${unit === 'kWp' ? 'selected' : ''}>kWp</option>
          <option value="Job" ${unit === 'Job' ? 'selected' : ''}>Job</option>
          <option value="Set" ${unit === 'Set' ? 'selected' : ''}>Set</option>
          <option value="Mtr" ${unit === 'Mtr' ? 'selected' : ''}>Mtr</option>
          <option value="Sqft" ${unit === 'Sqft' ? 'selected' : ''}>Sqft</option>
          <option value="Hours" ${unit === 'Hours' ? 'selected' : ''}>Hours</option>
          <option value="Month" ${unit === 'Month' ? 'selected' : ''}>Month</option>
        </select>
      </td>
      <td>
        <input type="number" class="form-control form-control-sm quo-item-rate" placeholder="0" min="0" step="any" value="${rate}" required oninput="app.onQuoteItemChanged()">
      </td>
      <td style="text-align: right; vertical-align: middle;">
        <span class="font-mono text-cyan quo-item-amount" style="font-weight: 600;">₹${Number(amount).toLocaleString('en-IN')}</span>
      </td>
      <td style="text-align: center; vertical-align: middle;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="app.removeQuoteItemRow('${rowId}')" title="Remove deliverable" style="padding: 2px 6px; color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">✕</button>
      </td>
    `;

    tbody.appendChild(tr);
    this.recalculateQuoteItemsTotal();
  }

  removeQuoteItemRow(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;
    const tbody = document.getElementById('quote-items-table-body');
    if (tbody && tbody.children.length <= 1) {
      if (typeof showToast === 'function') showToast('At least one deliverable item is required.', 'warning');
      return;
    }
    row.remove();
    this.recalculateQuoteItemsTotal();
  }

  onQuoteItemChanged() {
    this.recalculateQuoteItemsTotal();
  }

  recalculateQuoteItemsTotal() {
    const tbody = document.getElementById('quote-items-table-body');
    if (!tbody) return;

    let grandTotal = 0;
    const rows = tbody.querySelectorAll('.quote-item-row');
    rows.forEach(tr => {
      const qtyInput = tr.querySelector('.quo-item-qty');
      const rateInput = tr.querySelector('.quo-item-rate');
      const qty = parseFloat(qtyInput ? qtyInput.value : 0) || 0;
      const rate = parseFloat(rateInput ? rateInput.value : 0) || 0;
      const lineAmt = Math.round(qty * rate * 100) / 100;
      grandTotal += lineAmt;
      const amtSpan = tr.querySelector('.quo-item-amount');
      if (amtSpan) amtSpan.textContent = '₹' + lineAmt.toLocaleString('en-IN');
    });

    const subtotalEl = document.getElementById('quote-items-subtotal-display');
    if (subtotalEl) subtotalEl.textContent = '₹' + grandTotal.toLocaleString('en-IN');

    const amountInput = document.getElementById('quote-amount');
    if (amountInput) {
      amountInput.value = grandTotal > 0 ? grandTotal : '';
    }

    const costInput = document.getElementById('quote-cost');
    if (costInput && (!costInput.value || parseFloat(costInput.value) === 0)) {
      costInput.value = Math.round(grandTotal * 0.8);
    }

    const serviceInput = document.getElementById('quote-service');
    if (serviceInput && !serviceInput.value.trim() && rows.length > 0) {
      const firstDescInput = rows[0].querySelector('.quo-item-desc');
      const firstDesc = firstDescInput ? firstDescInput.value.trim() : '';
      if (firstDesc) {
        serviceInput.value = rows.length > 1 ? `${firstDesc} (+${rows.length - 1} deliverables)` : firstDesc;
      }
    }
  }

  collectQuoteItems() {
    const tbody = document.getElementById('quote-items-table-body');
    if (!tbody) return [];

    const items = [];
    const rows = tbody.querySelectorAll('.quote-item-row');
    rows.forEach(tr => {
      const descInput = tr.querySelector('.quo-item-desc');
      const sacInput = tr.querySelector('.quo-item-sac');
      const qtyInput = tr.querySelector('.quo-item-qty');
      const unitInput = tr.querySelector('.quo-item-unit');
      const rateInput = tr.querySelector('.quo-item-rate');

      const desc = descInput ? descInput.value.trim() : '';
      const sac = sacInput ? sacInput.value.trim() : '';
      const qty = parseFloat(qtyInput ? qtyInput.value : 1) || 1;
      const unit = unitInput ? unitInput.value : 'Nos';
      const rate = parseFloat(rateInput ? rateInput.value : 0) || 0;
      const amount = Math.round(qty * rate * 100) / 100;

      if (desc || rate > 0) {
        items.push({ description: desc || 'Deliverable', sac, qty, unit, rate, amount });
      }
    });
    return items;
  }

  openAddQuotationModal() {
    document.getElementById('quote-edit-id').value = '';
    const titleEl = document.getElementById('quote-modal-title');
    if (titleEl) titleEl.textContent = 'Create Formal Quotation';
    const btnEl = document.getElementById('quote-modal-btn');
    if (btnEl) btnEl.textContent = 'Save Quotation';
    document.getElementById('quote-client').value = '';
    const presetSelect = document.getElementById('quote-service-preset');
    if (presetSelect) presetSelect.value = '';
    document.getElementById('quote-service').value = '';
    document.getElementById('quote-amount').value = '';
    document.getElementById('quote-cost').value = '';
    document.getElementById('quote-terms').value = '15% advance with order, 45% upon module delivery, 25% upon mounting, 15% upon commissioning.';

    const tbody = document.getElementById('quote-items-table-body');
    if (tbody) {
      tbody.innerHTML = '';
      this.addQuoteItemRow({ qty: 1, unit: 'Job' });
    }

    document.getElementById('modal-quotation').classList.remove('hidden');
  }

  openEditQuotationModal(quoteId) {
    const quote = window.storage.getQuotations().find(q => q.id === quoteId);
    if (!quote) return;
    document.getElementById('quote-edit-id').value = quote.id;
    const titleEl = document.getElementById('quote-modal-title');
    if (titleEl) titleEl.textContent = `Modify Quotation (${quote.id})`;
    const btnEl = document.getElementById('quote-modal-btn');
    if (btnEl) btnEl.textContent = 'Update Quotation';
    document.getElementById('quote-client').value = quote.clientName || '';
    const presetSelect = document.getElementById('quote-service-preset');
    if (presetSelect) presetSelect.value = '';
    document.getElementById('quote-service').value = quote.service || '';
    document.getElementById('quote-amount').value = quote.totalAmount || '';
    document.getElementById('quote-cost').value = quote.directCostEstimate || '';
    document.getElementById('quote-terms').value = quote.terms || '';

    const tbody = document.getElementById('quote-items-table-body');
    if (tbody) {
      tbody.innerHTML = '';
      if (Array.isArray(quote.items) && quote.items.length > 0) {
        quote.items.forEach(it => this.addQuoteItemRow(it));
      } else {
        this.addQuoteItemRow({
          description: quote.service || 'Turnkey Deliverable',
          sac: '995461',
          qty: 1,
          unit: 'Job',
          rate: quote.totalAmount || '',
          amount: quote.totalAmount || ''
        });
      }
    }

    document.getElementById('modal-quotation').classList.remove('hidden');
  }

  onQuotePresetChange(val) {
    const presets = {
      solar_epc: {
        scope: "Solar EPC Coordination — Complete Turnkey Rooftop Solar PV Installation (Site Audit, Structural Erection, Tier-1 Mono PERC Modules, Grid-Tie Inverter & APDCL Net-Metering Sync)",
        terms: "15% advance with work order, 45% upon module/inverter site delivery, 25% upon structural erection & wiring, 15% upon APDCL net-meter synchronization & CEIG testing."
      },
      solar_advisory: {
        scope: "Solar Advisory & Feasibility Study — Comprehensive PVGIS Shading Analysis, APDCL Net-Metering Viability, Financial Payback Modeling & Vendor BOQ Verification",
        terms: "50% advance upon commencement, 50% upon delivery of final feasibility report & vendor BOQ evaluation."
      },
      solar_amc: {
        scope: "Solar O&M and Annual Maintenance Contract (AMC) — Scheduled Module Cleaning, Electrical Inverter Health Checks, String Testing & Generation Monitoring",
        terms: "Quarterly advance retainer payable at the beginning of each 3-month operational cycle."
      },
      it_infra_sales: {
        scope: "IT Infra Sales & Setup — Commercial Workstations, Server Procurement, Structured Networking, Gigabit Switches & UPS Deployment",
        terms: "50% equipment advance with purchase order, 40% upon site delivery, 10% on installation, network signoff & warranty handover."
      },
      it_infra_amc: {
        scope: "IT Infrastructure Support & Annual Maintenance Contract (AMC) — Comprehensive On-Site Hardware Servicing, OS/Network SLA & Preventive Care",
        terms: "Quarterly advance for 3-month continuous IT infrastructure AMC coverage."
      },
      smb_website: {
        scope: "Professional SMB Website Design — 5-Page Responsive Mobile-First Business Website, Fast Hosting Setup, Local SEO & Direct WhatsApp Lead Routing",
        terms: "50% project advance with work order, 50% upon final website testing, client approval & live handover."
      },
      web_retainer: {
        scope: "Website Maintenance Retainer — Regular Content & Catalog Updates, Uptime Monitoring, Security Patches & Technical Support",
        terms: "Quarterly advance for 3 months retainer maintenance."
      },
      ai_automation: {
        scope: "WhatsApp & AI Workflow Automation — Direct Customer Inquiry Routing, Digital Catalog Link & Customer Intake Auto-Response",
        terms: "50% advance with scope signoff, 50% upon live automation testing & client walkthrough."
      }
    };

    if (presets[val]) {
      document.getElementById('quote-service').value = presets[val].scope;
      if (document.getElementById('quote-terms')) {
        document.getElementById('quote-terms').value = presets[val].terms;
      }
      const tbody = document.getElementById('quote-items-table-body');
      if (tbody) {
        tbody.innerHTML = '';
        const hsn = window.invoiceController ? window.invoiceController.detectHsnSac(presets[val].scope) : null;
        this.addQuoteItemRow({
          description: presets[val].scope,
          sac: hsn ? hsn.code : '995461',
          qty: 1,
          unit: val.includes('solar') ? 'kWp' : 'Job',
          rate: '',
          amount: ''
        });
      }
    }
  }

  saveQuotationFromModal() {
    const editId = document.getElementById('quote-edit-id').value.trim();
    const clientName = document.getElementById('quote-client').value.trim();
    let service = document.getElementById('quote-service').value.trim();
    let totalAmount = Number(document.getElementById('quote-amount').value) || 0;
    const directCostEstimate = Number(document.getElementById('quote-cost').value) || 0;
    const terms = document.getElementById('quote-terms').value.trim();

    const items = this.collectQuoteItems();
    if (!totalAmount && items.length > 0) {
      totalAmount = items.reduce((sum, it) => sum + (it.amount || 0), 0);
    }
    if (!service && items.length > 0) {
      service = items.length === 1 ? items[0].description : `${items[0].description} (+${items.length - 1} deliverables)`;
    }

    if (!clientName || !totalAmount) {
      showToast('Please provide Client Name and Total Amount.', 'error');
      return;
    }

    const projectedMargin = totalAmount - directCostEstimate;
    const marginPercent = totalAmount > 0 ? Math.round((projectedMargin / totalAmount) * 1000) / 10 : 0;

    const quoteData = {
      clientName,
      service,
      totalAmount,
      directCostEstimate,
      projectedMargin,
      marginPercent,
      terms,
      items
    };

    if (editId) {
      quoteData.id = editId;
    } else {
      quoteData.status = 'Sent';
    }

    window.storage.saveQuotation(quoteData);

    this.closeAllModals();
    showToast(editId ? `Quotation ${editId} updated.` : `Quotation created for ${clientName}`, 'success');
    this.renderQuotesInvoicesTab();
  }

  convertQuoteToInvoice(quoteId) {
    const quote = window.storage.getQuotations().find(q => q.id === quoteId);
    if (!quote) return;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const invoice = window.storage.saveInvoice({
      clientName: quote.clientName,
      service: quote.service,
      amountBilled: quote.totalAmount,
      amountCollected: 0,
      dueDate: dueDate.toISOString().slice(0, 10),
      status: 'Sent',
      items: quote.items || []
    });

    quote.status = 'Accepted';
    window.storage.saveQuotation(quote);

    showToast(`Invoice ${invoice.id} created from quotation!`, 'success');
    this.renderQuotesInvoicesTab();
  }

  openLeadToQuoteModal(leadId) {
    const lead = window.storage.getLeads().find(l => l.id === leadId);
    if (!lead) return;

    document.getElementById('quote-edit-id').value = '';
    const titleEl = document.getElementById('quote-modal-title');
    if (titleEl) titleEl.textContent = 'Create Formal Quotation';
    const btnEl = document.getElementById('quote-modal-btn');
    if (btnEl) btnEl.textContent = 'Save Quotation';
    document.getElementById('quote-client').value = lead.name;
    document.getElementById('quote-service').value = lead.service;
    document.getElementById('quote-amount').value = lead.estimatedValue || '';
    document.getElementById('quote-cost').value = Math.round((lead.estimatedValue || 0) * 0.8);

    const tbody = document.getElementById('quote-items-table-body');
    if (tbody) {
      tbody.innerHTML = '';
      const hsn = window.invoiceController ? window.invoiceController.detectHsnSac(lead.service) : null;
      this.addQuoteItemRow({
        description: lead.service,
        sac: hsn ? hsn.code : '995461',
        qty: 1,
        unit: 'Job',
        rate: lead.estimatedValue || '',
        amount: lead.estimatedValue || ''
      });
    }

    document.getElementById('modal-quotation').classList.remove('hidden');
  }

  // --- INVOICE LINE ITEMS REPEATER & QUANTITIES ---
  addInvoiceItemRow(data = {}) {
    const tbody = document.getElementById('invoice-items-table-body');
    if (!tbody) return;

    const rowId = 'inv-row-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const tr = document.createElement('tr');
    tr.id = rowId;
    tr.className = 'invoice-item-row';

    const desc = (data.description !== undefined ? data.description : '').replace(/"/g, '&quot;');
    const sac = (data.sac || data.hsn || '').replace(/"/g, '&quot;');
    const qty = data.qty !== undefined && data.qty !== '' ? data.qty : 1;
    const unit = data.unit || 'Nos';
    const rate = data.rate !== undefined && data.rate !== '' ? data.rate : (data.amount !== undefined ? data.amount : '');
    const amount = Number(qty) * Number(rate) || 0;

    tr.innerHTML = `
      <td>
        <input type="text" class="form-control form-control-sm inv-item-desc" placeholder="e.g. 540W Mono PERC Solar Panel" value="${desc}" required oninput="app.onInvoiceItemChanged()">
      </td>
      <td>
        <input type="text" class="form-control form-control-sm inv-item-sac" placeholder="995461" value="${sac}" style="font-family: var(--font-mono); font-size: 11px;">
      </td>
      <td>
        <input type="number" class="form-control form-control-sm inv-item-qty" placeholder="1" min="0.01" step="any" value="${qty}" required oninput="app.onInvoiceItemChanged()">
      </td>
      <td>
        <select class="form-control form-control-sm inv-item-unit" onchange="app.onInvoiceItemChanged()">
          <option value="Nos" ${unit === 'Nos' ? 'selected' : ''}>Nos</option>
          <option value="kWp" ${unit === 'kWp' ? 'selected' : ''}>kWp</option>
          <option value="Job" ${unit === 'Job' ? 'selected' : ''}>Job</option>
          <option value="Set" ${unit === 'Set' ? 'selected' : ''}>Set</option>
          <option value="Mtr" ${unit === 'Mtr' ? 'selected' : ''}>Mtr</option>
          <option value="Sqft" ${unit === 'Sqft' ? 'selected' : ''}>Sqft</option>
          <option value="Hours" ${unit === 'Hours' ? 'selected' : ''}>Hours</option>
          <option value="Month" ${unit === 'Month' ? 'selected' : ''}>Month</option>
        </select>
      </td>
      <td>
        <input type="number" class="form-control form-control-sm inv-item-rate" placeholder="0" min="0" step="any" value="${rate}" required oninput="app.onInvoiceItemChanged()">
      </td>
      <td style="text-align: right; vertical-align: middle;">
        <span class="font-mono text-emerald inv-item-amount" style="font-weight: 600;">₹${Number(amount).toLocaleString('en-IN')}</span>
      </td>
      <td style="text-align: center; vertical-align: middle;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="app.removeInvoiceItemRow('${rowId}')" title="Remove line item" style="padding: 2px 6px; color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">✕</button>
      </td>
    `;

    tbody.appendChild(tr);
    this.recalculateInvoiceItemsTotal();
  }

  removeInvoiceItemRow(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;
    const tbody = document.getElementById('invoice-items-table-body');
    if (tbody && tbody.children.length <= 1) {
      if (typeof showToast === 'function') showToast('At least one line item is required.', 'warning');
      return;
    }
    row.remove();
    this.recalculateInvoiceItemsTotal();
  }

  onInvoiceItemChanged() {
    this.recalculateInvoiceItemsTotal();
  }

  recalculateInvoiceItemsTotal() {
    const tbody = document.getElementById('invoice-items-table-body');
    if (!tbody) return;

    let grandTotal = 0;
    const rows = tbody.querySelectorAll('.invoice-item-row');
    rows.forEach(tr => {
      const qtyInput = tr.querySelector('.inv-item-qty');
      const rateInput = tr.querySelector('.inv-item-rate');
      const qty = parseFloat(qtyInput ? qtyInput.value : 0) || 0;
      const rate = parseFloat(rateInput ? rateInput.value : 0) || 0;
      const lineAmt = Math.round(qty * rate * 100) / 100;
      grandTotal += lineAmt;
      const amtSpan = tr.querySelector('.inv-item-amount');
      if (amtSpan) amtSpan.textContent = '₹' + lineAmt.toLocaleString('en-IN');
    });

    const subtotalEl = document.getElementById('invoice-items-subtotal-display');
    if (subtotalEl) subtotalEl.textContent = '₹' + grandTotal.toLocaleString('en-IN');

    const billedInput = document.getElementById('invoice-billed');
    if (billedInput) {
      billedInput.value = grandTotal > 0 ? grandTotal : '';
    }

    const serviceInput = document.getElementById('invoice-service');
    if (serviceInput && !serviceInput.value.trim() && rows.length > 0) {
      const firstDescInput = rows[0].querySelector('.inv-item-desc');
      const firstDesc = firstDescInput ? firstDescInput.value.trim() : '';
      if (firstDesc) {
        serviceInput.value = rows.length > 1 ? `${firstDesc} (+${rows.length - 1} items)` : firstDesc;
      }
    }
  }

  collectInvoiceItems() {
    const tbody = document.getElementById('invoice-items-table-body');
    if (!tbody) return [];

    const items = [];
    const rows = tbody.querySelectorAll('.invoice-item-row');
    rows.forEach(tr => {
      const descInput = tr.querySelector('.inv-item-desc');
      const sacInput = tr.querySelector('.inv-item-sac');
      const qtyInput = tr.querySelector('.inv-item-qty');
      const unitInput = tr.querySelector('.inv-item-unit');
      const rateInput = tr.querySelector('.inv-item-rate');

      const desc = descInput ? descInput.value.trim() : '';
      const sac = sacInput ? sacInput.value.trim() : '';
      const qty = parseFloat(qtyInput ? qtyInput.value : 1) || 1;
      const unit = unitInput ? unitInput.value : 'Nos';
      const rate = parseFloat(rateInput ? rateInput.value : 0) || 0;
      const amount = Math.round(qty * rate * 100) / 100;

      if (desc || rate > 0) {
        items.push({ description: desc || 'Item', sac, qty, unit, rate, amount });
      }
    });
    return items;
  }

  // --- INVOICE CONTROLS ---
  openAddInvoiceModal() {
    document.getElementById('invoice-edit-id').value = '';
    const titleEl = document.getElementById('invoice-modal-title');
    if (titleEl) titleEl.textContent = 'Create Direct Invoice';
    const btnEl = document.getElementById('invoice-modal-btn');
    if (btnEl) btnEl.textContent = 'Save Invoice';
    document.getElementById('invoice-client').value = '';
    document.getElementById('invoice-service').value = '';
    document.getElementById('invoice-billed').value = '';
    document.getElementById('invoice-collected').value = '0';
    const due = new Date();
    due.setDate(due.getDate() + 14);
    document.getElementById('invoice-due-date').value = due.toISOString().slice(0, 10);
    document.getElementById('invoice-status').value = 'Sent';
    if (document.getElementById('invoice-address')) document.getElementById('invoice-address').value = 'Guwahati, Assam';
    if (document.getElementById('invoice-gstin')) document.getElementById('invoice-gstin').value = '';
    if (document.getElementById('invoice-type')) document.getElementById('invoice-type').value = 'TAX INVOICE';
    if (document.getElementById('invoice-hsn')) document.getElementById('invoice-hsn').value = '';
    if (document.getElementById('invoice-notes')) document.getElementById('invoice-notes').value = 'Due on Receipt / Milestone terms';

    const tbody = document.getElementById('invoice-items-table-body');
    if (tbody) {
      tbody.innerHTML = '';
      this.addInvoiceItemRow({ qty: 1, unit: 'Job' });
    }

    document.getElementById('modal-invoice').classList.remove('hidden');
  }

  openEditInvoiceModal(invoiceId) {
    const inv = window.storage.getInvoices().find(i => i.id === invoiceId);
    if (!inv) return;
    document.getElementById('invoice-edit-id').value = inv.id;
    const titleEl = document.getElementById('invoice-modal-title');
    if (titleEl) titleEl.textContent = `Modify Invoice (${inv.id})`;
    const btnEl = document.getElementById('invoice-modal-btn');
    if (btnEl) btnEl.textContent = 'Update Invoice';
    document.getElementById('invoice-client').value = inv.clientName || '';
    document.getElementById('invoice-service').value = inv.service || '';
    document.getElementById('invoice-billed').value = inv.amountBilled || '';
    document.getElementById('invoice-collected').value = inv.amountCollected || 0;
    document.getElementById('invoice-due-date').value = inv.dueDate || '';
    document.getElementById('invoice-status').value = inv.status || 'Sent';
    if (document.getElementById('invoice-address')) document.getElementById('invoice-address').value = inv.clientAddress || '';
    if (document.getElementById('invoice-gstin')) document.getElementById('invoice-gstin').value = inv.clientGstin || '';
    if (document.getElementById('invoice-type')) document.getElementById('invoice-type').value = inv.invoiceType || 'TAX INVOICE';
    if (document.getElementById('invoice-hsn')) document.getElementById('invoice-hsn').value = inv.hsnSac || '';
    if (document.getElementById('invoice-notes')) document.getElementById('invoice-notes').value = inv.terms || '';

    const tbody = document.getElementById('invoice-items-table-body');
    if (tbody) {
      tbody.innerHTML = '';
      if (Array.isArray(inv.items) && inv.items.length > 0) {
        inv.items.forEach(it => this.addInvoiceItemRow(it));
      } else {
        this.addInvoiceItemRow({
          description: inv.service || 'Professional Service',
          sac: inv.hsnSac || '995461',
          qty: 1,
          unit: 'Job',
          rate: inv.amountBilled || '',
          amount: inv.amountBilled || ''
        });
      }
    }

    document.getElementById('modal-invoice').classList.remove('hidden');
  }

  saveInvoiceFromModal() {
    const editId = document.getElementById('invoice-edit-id').value.trim();
    const clientName = document.getElementById('invoice-client').value.trim();
    let service = document.getElementById('invoice-service').value.trim();
    let amountBilled = Number(document.getElementById('invoice-billed').value) || 0;
    const amountCollected = Number(document.getElementById('invoice-collected').value) || 0;
    const dueDate = document.getElementById('invoice-due-date').value;
    const status = document.getElementById('invoice-status').value;
    const clientAddress = document.getElementById('invoice-address') ? document.getElementById('invoice-address').value.trim() : '';
    const clientGstin = document.getElementById('invoice-gstin') ? document.getElementById('invoice-gstin').value.trim() : '';
    const invoiceType = document.getElementById('invoice-type') ? document.getElementById('invoice-type').value : 'TAX INVOICE';
    const hsnSac = document.getElementById('invoice-hsn') ? document.getElementById('invoice-hsn').value.trim() : '';
    const terms = document.getElementById('invoice-notes') ? document.getElementById('invoice-notes').value.trim() : '';

    const items = this.collectInvoiceItems();
    if (!amountBilled && items.length > 0) {
      amountBilled = items.reduce((sum, it) => sum + (it.amount || 0), 0);
    }
    if (!service && items.length > 0) {
      service = items.length === 1 ? items[0].description : `${items[0].description} (+${items.length - 1} items)`;
    }

    if (!clientName || !amountBilled) {
      showToast('Please provide Client Name and Amount Billed.', 'error');
      return;
    }

    const invData = {
      clientName,
      service,
      amountBilled,
      amountCollected,
      dueDate,
      status,
      clientAddress,
      clientGstin,
      invoiceType,
      hsnSac,
      terms,
      items
    };

    if (editId) {
      invData.id = editId;
    }

    const saved = window.storage.saveInvoice(invData);
    this.closeAllModals();
    showToast(editId ? `Invoice ${editId} updated.` : `Invoice created for ${clientName}`, 'success');
    this.renderQuotesInvoicesTab();
    if (this.currentView === 'finance' || this.currentView === 'dashboard') {
      this.renderPrivateView(this.currentView);
    }
  }

  deleteInvoice(id) {
    if (confirm('Are you sure you want to delete this invoice record?')) {
      window.storage.deleteInvoice(id);
      showToast('Invoice deleted.', 'info');
      this.renderQuotesInvoicesTab();
    }
  }

  // --- INVOICE FORMAT VIEWER CONTROLS ---
  viewInvoiceFormat(invoiceId) {
    if (window.invoiceController) {
      window.invoiceController.openInvoiceFormatModal(invoiceId);
    } else {
      showToast('Invoice format controller loading...', 'info');
    }
  }

  printActiveInvoice() {
    if (window.invoiceController) {
      window.invoiceController.printInvoice();
    }
  }

  shareActiveInvoiceWhatsApp() {
    const activeId = document.getElementById('invoice-active-view-id')?.value;
    if (activeId && window.invoiceController) {
      window.invoiceController.shareInvoiceWhatsApp(activeId);
    }
  }

  copyActiveInvoiceText() {
    const activeId = document.getElementById('invoice-active-view-id')?.value;
    if (activeId && window.invoiceController) {
      window.invoiceController.copyInvoiceText(activeId);
    }
  }

  openInvoiceFormatSelector() {
    const invoices = window.storage.getInvoices();
    if (!invoices || invoices.length === 0) {
      showToast('No invoices issued yet. Please create an invoice first.', 'info');
      this.openAddInvoiceModal();
      return;
    }
    this.viewInvoiceFormat(invoices[0].id);
  }

  // --- QUOTATION & PROPOSAL FORMAT CONTROLS (MAXECO) ---
  viewQuotationFormat(quoteId) {
    if (window.invoiceController && typeof window.invoiceController.openQuotationFormatModal === 'function') {
      window.invoiceController.openQuotationFormatModal(quoteId);
    } else {
      showToast('Quotation format controller loading...', 'info');
    }
  }

  printActiveQuotation() {
    if (window.invoiceController) {
      window.invoiceController.printQuotation();
    }
  }

  shareActiveQuotationWhatsApp() {
    const activeId = document.getElementById('quotation-active-view-id')?.value;
    if (activeId && window.invoiceController) {
      window.invoiceController.shareQuotationWhatsApp(activeId);
    }
  }

  copyActiveQuotationText() {
    const activeId = document.getElementById('quotation-active-view-id')?.value;
    if (activeId && window.invoiceController) {
      window.invoiceController.copyQuotationText(activeId);
    }
  }

  openQuotationFormatSelector() {
    const quotations = window.storage.getQuotations();
    if (!quotations || quotations.length === 0) {
      showToast('No quotations recorded yet. Please generate a quotation first.', 'info');
      this.openAddQuotationModal();
      return;
    }
    this.viewQuotationFormat(quotations[0].id);
  }

  convertActiveQuotationToInvoice() {
    const activeId = document.getElementById('quotation-active-view-id')?.value;
    if (activeId) {
      this.closeAllModals();
      this.convertQuoteToInvoice(activeId);
    }
  }

  // --- CUSTOMER PAYMENT RECORDING & RECEIPT VOUCHERS (MAXECO) ---
  openRecordPaymentModal(preselectedInvoiceId = '') {
    const invoices = window.storage.getInvoices() || [];
    if (invoices.length === 0) {
      showToast('No invoices found. Please create an invoice first.', 'error');
      this.openAddInvoiceModal();
      return;
    }

    const sel = document.getElementById('payment-invoice-select');
    if (!sel) return;

    // Filter to invoices with outstanding balance first, or show all
    const pendingInvoices = invoices.filter(inv => (Number(inv.amountBilled) || 0) > (Number(inv.amountCollected) || 0));
    const targetInvoices = pendingInvoices.length > 0 ? pendingInvoices : invoices;

    sel.innerHTML = targetInvoices.map(inv => {
      const due = Math.max(0, (Number(inv.amountBilled) || 0) - (Number(inv.amountCollected) || 0));
      return `<option value="${inv.id}">[${inv.id}] ${inv.clientName} — Due: ${formatINR(due)} (${inv.status})</option>`;
    }).join('');

    if (preselectedInvoiceId && targetInvoices.some(i => i.id === preselectedInvoiceId)) {
      sel.value = preselectedInvoiceId;
    } else {
      sel.value = targetInvoices[0].id;
    }

    document.getElementById('payment-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('payment-reference').value = '';
    document.getElementById('payment-notes').value = '';

    this.onPaymentInvoiceSelected(sel.value);
    document.getElementById('modal-record-payment')?.classList.remove('hidden');
  }

  onPaymentInvoiceSelected(invoiceId) {
    const invoice = (window.storage.getInvoices() || []).find(i => i.id === invoiceId);
    const box = document.getElementById('payment-invoice-summary-box');
    const amtInput = document.getElementById('payment-amount');

    if (!invoice) {
      if (box) box.innerHTML = '<span class="text-muted">No invoice selected.</span>';
      return;
    }

    const billed = Number(invoice.amountBilled) || 0;
    const collected = Number(invoice.amountCollected) || 0;
    const outstanding = Math.max(0, billed - collected);

    if (box) {
      box.innerHTML = `
        <div class="flex justify-between" style="margin-bottom: 4px;">
          <span>Client: <strong>${invoice.clientName}</strong></span>
          <span>Service: <strong>${invoice.service}</strong></span>
        </div>
        <div class="flex justify-between" style="border-top: 1px dashed rgba(16, 185, 129, 0.3); padding-top: 4px;">
          <span>Billed: <strong>${formatINR(billed)}</strong></span>
          <span>Collected: <strong class="text-emerald">${formatINR(collected)}</strong></span>
          <span>Outstanding Due: <strong class="text-amber">${formatINR(outstanding)}</strong></span>
        </div>
      `;
    }

    if (amtInput) {
      amtInput.value = outstanding > 0 ? outstanding : billed;
      amtInput.dataset.outstanding = outstanding;
    }

    this.updatePaymentRemainingPreview();
  }

  updatePaymentRemainingPreview() {
    const amtInput = document.getElementById('payment-amount');
    const previewEl = document.getElementById('payment-preview-balance');
    if (!amtInput || !previewEl) return;

    const outstanding = Number(amtInput.dataset.outstanding) || 0;
    const paying = Number(amtInput.value) || 0;
    const remaining = Math.max(0, outstanding - paying);

    previewEl.textContent = formatINR(remaining);
    previewEl.className = remaining > 0 ? 'text-amber' : 'text-emerald';
  }

  saveCustomerPaymentFromModal() {
    const invoiceId = document.getElementById('payment-invoice-select')?.value;
    const amount = Number(document.getElementById('payment-amount')?.value) || 0;
    const date = document.getElementById('payment-date')?.value || new Date().toISOString().slice(0, 10);
    const method = document.getElementById('payment-method')?.value || 'UPI / QR Code';
    const ref = document.getElementById('payment-reference')?.value?.trim() || '';
    const notes = document.getElementById('payment-notes')?.value?.trim() || '';

    if (!invoiceId) {
      showToast('Please select a customer invoice.', 'error');
      return;
    }
    if (!amount || amount <= 0) {
      showToast('Please enter a valid payment amount greater than ₹0.', 'error');
      return;
    }

    const res = window.storage.recordCustomerPayment(invoiceId, amount, method, ref, date, notes);
    if (!res) {
      showToast('Error recording payment.', 'error');
      return;
    }

    this.closeAllModals();
    showToast(`Payment receipt ${res.paymentRecord.id} recorded successfully (₹${amount.toLocaleString('en-IN')})!`, 'success');

    // Refresh views
    this.renderQuotesInvoicesTab();
    if (this.currentView === 'finance' || this.currentView === 'dashboard') {
      this.renderPrivateView(this.currentView);
    }

    // Immediately open the official payment receipt voucher
    this.viewPaymentReceiptSlip(res.paymentRecord.id);
  }

  viewPaymentReceiptSlip(receiptId) {
    const payments = window.storage.getPayments() || [];
    const receipt = payments.find(p => p.id === receiptId) || payments[0];
    if (!receipt) {
      showToast('Payment receipt not found.', 'error');
      return;
    }

    const invoice = (window.storage.getInvoices() || []).find(i => i.id === receipt.invoiceId);
    const container = document.getElementById('payment-receipt-view-content');
    const activeIdEl = document.getElementById('payment-receipt-active-id');

    if (container && window.invoiceController) {
      container.innerHTML = window.invoiceController.generatePaymentReceiptHTML(receipt, invoice);
    }
    if (activeIdEl) {
      activeIdEl.value = receipt.id;
    }

    document.getElementById('modal-payment-receipt')?.classList.remove('hidden');
  }

  printPaymentReceiptSlip() {
    window.print();
  }

  sharePaymentReceiptWhatsApp(receiptId = '') {
    const activeId = receiptId || document.getElementById('payment-receipt-active-id')?.value;
    const payments = window.storage.getPayments() || [];
    const receipt = payments.find(p => p.id === activeId) || payments[0];
    if (!receipt) return;

    const text = `*OFFICIAL PAYMENT RECEIPT — MAXECO ENERGY & TECH*\n` +
      `Receipt No: ${receipt.id}\n` +
      `Settlement Date: ${receipt.date}\n` +
      `Received With Thanks From: ${receipt.clientName}\n` +
      `Towards: ${receipt.service || 'Advisory / Services'}\n` +
      `Amount Paid: ₹${Number(receipt.amount).toLocaleString('en-IN')}\n` +
      `Payment Mode: ${receipt.paymentMethod || 'UPI / Bank Transfer'}\n` +
      `Bank UTR / Reference: ${receipt.referenceNo || 'Verified'}\n` +
      `Remaining Balance: ₹${Number(receipt.balanceRemaining).toLocaleString('en-IN')}\n\n` +
      `Thank you for your business!\n` +
      `MaxEco Energy & Tech | Maligaon, Guwahati, Assam | +91 99544 93909`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  copyPaymentReceiptText(receiptId = '') {
    const activeId = receiptId || document.getElementById('payment-receipt-active-id')?.value;
    const payments = window.storage.getPayments() || [];
    const receipt = payments.find(p => p.id === activeId) || payments[0];
    if (!receipt) return;

    const text = `====================================================\n` +
      `MAXECO ENERGY & TECH — OFFICIAL PAYMENT RECEIPT\n` +
      `Maligaon, Guwahati, Assam, Pin - 781011 | +91 99544 93909\n` +
      `====================================================\n` +
      `Receipt Voucher: ${receipt.id} | Date: ${receipt.date}\n` +
      `Invoice Ref: ${receipt.invoiceId || 'DIRECT'}\n` +
      `Client: ${receipt.clientName}\n` +
      `Service: ${receipt.service || 'Professional Advisory'}\n` +
      `Amount Received: ₹${Number(receipt.amount).toLocaleString('en-IN')}\n` +
      `Payment Method: ${receipt.paymentMethod || 'UPI / Bank Transfer'}\n` +
      `Bank Ref / UTR: ${receipt.referenceNo || 'Verified'}\n` +
      `Balance Due: ₹${Number(receipt.balanceRemaining).toLocaleString('en-IN')}\n` +
      `Beneficiary: Tamal Roy | Punjab National Bank (A/C: 4589000100072219, IFSC: PUNB0458900, Branch: Maligaon, Guwahati)\n` +
      `====================================================\n`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Receipt details copied to clipboard.', 'success');
      });
    }
  }

  deletePayment(id) {
    if (confirm('Are you sure you want to delete this payment receipt record?')) {
      window.storage.deletePayment(id);
      showToast('Payment receipt removed.', 'info');
      this.renderQuotesInvoicesTab();
      if (this.currentView === 'finance' || this.currentView === 'dashboard') {
        this.renderPrivateView(this.currentView);
      }
    }
  }

  // --- PROJECT CONTROLS ---
  openAddProjectModal(defaultType = 'solar') {
    document.getElementById('project-edit-id').value = '';
    const titleEl = document.getElementById('project-modal-title');
    if (titleEl) titleEl.textContent = defaultType === 'solar' ? 'Create Solar EPC Project' : 'Create IT & Web Project';
    const btnEl = document.getElementById('project-modal-btn');
    if (btnEl) btnEl.textContent = 'Save Project';
    document.getElementById('project-type').value = defaultType;
    this.onProjectTypeChange(defaultType);
    document.getElementById('project-client').value = '';
    document.getElementById('project-capacity').value = '';
    document.getElementById('project-discom').value = 'APDCL';
    document.getElementById('project-scope').value = '';
    document.getElementById('project-value').value = '';
    document.getElementById('project-location').value = 'Guwahati, Assam';
    document.getElementById('project-notes').value = '';
    document.getElementById('modal-project').classList.remove('hidden');
  }

  onProjectTypeChange(type) {
    const solarFields = document.getElementById('project-solar-fields');
    const itFields = document.getElementById('project-it-fields');
    if (type === 'solar') {
      solarFields?.classList.remove('hidden');
      itFields?.classList.add('hidden');
    } else {
      solarFields?.classList.add('hidden');
      itFields?.classList.remove('hidden');
    }
  }

  openEditSolarProjectModal(projectId) {
    const proj = window.storage.getSolarProjects().find(p => p.id === projectId);
    if (!proj) return;
    document.getElementById('project-edit-id').value = proj.id;
    document.getElementById('project-type').value = 'solar';
    this.onProjectTypeChange('solar');
    const titleEl = document.getElementById('project-modal-title');
    if (titleEl) titleEl.textContent = `Modify Solar Project (${proj.id})`;
    const btnEl = document.getElementById('project-modal-btn');
    if (btnEl) btnEl.textContent = 'Update Project';
    document.getElementById('project-client').value = proj.clientName || '';
    document.getElementById('project-capacity').value = proj.systemCapacityKwp || '';
    document.getElementById('project-discom').value = proj.discom || 'APDCL';
    document.getElementById('project-value').value = proj.totalContractValue || '';
    document.getElementById('project-location').value = proj.siteLocation || '';
    document.getElementById('project-notes').value = proj.assumptions || '';
    document.getElementById('modal-project').classList.remove('hidden');
  }

  openEditItProjectModal(projectId) {
    const proj = window.storage.getItProjects().find(p => p.id === projectId);
    if (!proj) return;
    document.getElementById('project-edit-id').value = proj.id;
    document.getElementById('project-type').value = 'it';
    this.onProjectTypeChange('it');
    const titleEl = document.getElementById('project-modal-title');
    if (titleEl) titleEl.textContent = `Modify IT Project (${proj.id})`;
    const btnEl = document.getElementById('project-modal-btn');
    if (btnEl) btnEl.textContent = 'Update Project';
    document.getElementById('project-client').value = proj.clientName || '';
    document.getElementById('project-scope').value = proj.serviceScope || '';
    document.getElementById('project-value').value = proj.contractValue || '';
    document.getElementById('project-location').value = proj.location || 'Guwahati';
    document.getElementById('project-notes').value = proj.vaultNotes || '';
    document.getElementById('modal-project').classList.remove('hidden');
  }

  saveProjectFromModal() {
    const editId = document.getElementById('project-edit-id').value.trim();
    const type = document.getElementById('project-type').value;
    const clientName = document.getElementById('project-client').value.trim();
    const totalValue = Number(document.getElementById('project-value').value) || 0;
    const location = document.getElementById('project-location').value.trim();
    const notes = document.getElementById('project-notes').value.trim();

    if (!clientName || !totalValue) {
      showToast('Please enter Client Name and Contract Value.', 'error');
      return;
    }

    if (type === 'solar') {
      const capacity = Number(document.getElementById('project-capacity').value) || 10;
      const discom = document.getElementById('project-discom').value;
      const projData = {
        clientName,
        systemCapacityKwp: capacity,
        discom,
        siteLocation: location || 'Guwahati, Assam',
        totalContractValue: totalValue,
        assumptions: notes || 'Standard solar generation model.'
      };
      if (editId) {
        projData.id = editId;
      } else {
        projData.milestones = [
          { name: "Site Survey & Engineering Design", targetDate: "2026-10-25", status: "In Progress" },
          { name: "APDCL Net-Metering Feasibility", targetDate: "2026-11-05", status: "Pending" },
          { name: "Procurement & Module Delivery", targetDate: "2026-11-20", status: "Pending" },
          { name: "Structural Mounting & Wiring", targetDate: "2026-12-05", status: "Pending" },
          { name: "CEIG & Bi-directional Meter Sync", targetDate: "2026-12-15", status: "Pending" }
        ];
      }
      window.storage.saveSolarProject(projData);
      showToast(editId ? `Solar project ${editId} updated.` : `Solar project created for ${clientName}`, 'success');
    } else {
      const scope = document.getElementById('project-scope').value.trim() || 'SMB Website';
      const projData = {
        clientName,
        serviceScope: scope,
        contractValue: totalValue,
        location: location || 'Guwahati',
        vaultNotes: notes || ''
      };
      if (editId) {
        projData.id = editId;
      } else {
        projData.milestones = [
          { name: "Scope & Design Wireframes", targetDate: "2026-10-20", status: "In Progress" },
          { name: "Front-end Development", targetDate: "2026-10-30", status: "Pending" },
          { name: "WhatsApp & Form Integration", targetDate: "2026-11-05", status: "Pending" },
          { name: "Final Client Review & Live Launch", targetDate: "2026-11-12", status: "Pending" }
        ];
      }
      window.storage.saveItProject(projData);
      showToast(editId ? `IT project ${editId} updated.` : `IT project created for ${clientName}`, 'success');
    }

    this.closeAllModals();
    this.renderProjectsTab();
  }

  deleteSolarProject(id) {
    if (confirm('Are you sure you want to delete this solar project record?')) {
      window.storage.deleteSolarProject(id);
      showToast('Solar project deleted.', 'info');
      this.renderProjectsTab();
    }
  }

  deleteItProject(id) {
    if (confirm('Are you sure you want to delete this IT project record?')) {
      window.storage.deleteItProject(id);
      showToast('IT project deleted.', 'info');
      this.renderProjectsTab();
    }
  }

  // --- UNIVERSAL MODIFY RECORD SELECTOR CONTROLS ---
  openModifySelectorModal(defaultType = 'lead') {
    const typeSelect = document.getElementById('modify-type-select');
    if (typeSelect) typeSelect.value = defaultType;
    this.onModifyTypeSelected(defaultType);
    document.getElementById('modal-modify-selector').classList.remove('hidden');
  }

  onModifyTypeSelected(type) {
    const recSelect = document.getElementById('modify-record-select');
    if (!recSelect) return;
    recSelect.innerHTML = '';

    let items = [];
    if (type === 'lead') {
      items = window.storage.getLeads().map(l => ({ id: l.id, label: `[${l.id}] ${l.name} — ${formatINR(l.estimatedValue)} (${l.stage})` }));
    } else if (type === 'quotation') {
      items = window.storage.getQuotations().map(q => ({ id: q.id, label: `[${q.id}] ${q.clientName} — ${formatINR(q.totalAmount)} (${q.status})` }));
    } else if (type === 'invoice') {
      items = window.storage.getInvoices().map(i => ({ id: i.id, label: `[${i.id}] ${i.clientName} — ${formatINR(i.amountBilled)} (${i.status})` }));
    } else if (type === 'payment') {
      items = (window.storage.getPayments() || []).map(p => ({ id: p.id, label: `[${p.id}] ${p.clientName} — ${formatINR(p.amount)} (${p.paymentMethod || 'UPI'})` }));
    } else if (type === 'expense') {
      items = window.storage.getExpenses().map(e => ({ id: e.id, label: `[${e.id}] ${e.description} — ${formatINR(e.amount)} (${e.category})` }));
    } else if (type === 'drawing') {
      items = window.storage.getDrawings().map(d => ({ id: d.id, label: `[${d.id}] ${d.purpose} — ${formatINR(d.amount)} (${formatDate(d.date)})` }));
    } else if (type === 'solar') {
      items = window.storage.getSolarProjects().map(p => ({ id: p.id, label: `[${p.id}] ${p.clientName} (${p.systemCapacityKwp} kWp) — ${formatINR(p.totalContractValue)}` }));
    } else if (type === 'it') {
      items = window.storage.getItProjects().map(p => ({ id: p.id, label: `[${p.id}] ${p.clientName} — ${formatINR(p.contractValue)}` }));
    } else if (type === 'procurement') {
      items = (window.storage.getProcurements() || []).map(p => ({ id: p.id, label: `[${p.id}] ${p.itemName} — ${formatINR(p.actualCost || p.estimatedCost)} (${p.status})` }));
    } else if (type === 'workorder') {
      items = (window.storage.getWorkOrders() || []).map(w => ({ id: w.id, label: `[${w.id}] ${w.title} — ${w.assignedTo} (${w.status})` }));
    } else if (type === 'site') {
      items = (window.storage.getFacilitySites() || []).map(s => ({ id: s.id, label: `[${s.id}] ${s.name} — ${s.clientName} (${s.siteType})` }));
    } else if (type === 'facilityAsset') {
      items = (window.storage.getFacilityAssets() || []).map(a => ({ id: a.id, label: `[${a.id}] ${a.name} — ${a.category} (${a.status})` }));
    } else if (type === 'serviceTicket') {
      items = (window.storage.getServiceTickets() || []).map(t => ({ id: t.id, label: `[${t.id}] ${t.title} — Priority: ${t.priority} (${t.status})` }));
    } else if (type === 'amcContract') {
      items = (window.storage.getAmcContracts() || []).map(c => ({ id: c.id, label: `[${c.id}] ${c.title} — ${formatINR(c.annualFee)}/yr (${c.status})` }));
    }

    if (items.length === 0) {
      recSelect.innerHTML = '<option value="">(No records available in this category)</option>';
      this.updateModifyPreview('');
    } else {
      recSelect.innerHTML = items.map(it => `<option value="${it.id}">${it.label}</option>`).join('');
      this.updateModifyPreview(items[0].id);
    }
  }

  updateModifyPreview(id) {
    const previewEl = document.getElementById('modify-record-preview');
    if (!previewEl) return;
    if (!id) {
      previewEl.innerHTML = '<span class="text-muted">No record selected.</span>';
      return;
    }
    const type = document.getElementById('modify-type-select').value;
    let details = '';
    if (type === 'lead') {
      const l = window.storage.getLeads().find(x => x.id === id);
      if (l) details = `<strong>${l.name}</strong> • ${l.service} • Stage: <strong>${l.stage}</strong> • Phone: ${l.phone} • Value: <strong>${formatINR(l.estimatedValue)}</strong>`;
    } else if (type === 'quotation') {
      const q = window.storage.getQuotations().find(x => x.id === id);
      if (q) details = `<strong>${q.clientName}</strong> • ${q.service} • Value: <strong>${formatINR(q.totalAmount)}</strong> • Margin: ${formatINR(q.projectedMargin)} • Status: ${q.status}`;
    } else if (type === 'invoice') {
      const i = window.storage.getInvoices().find(x => x.id === id);
      if (i) details = `<strong>${i.clientName}</strong> • Billed: <strong>${formatINR(i.amountBilled)}</strong> • Collected: <strong>${formatINR(i.amountCollected)}</strong> • Due: ${formatDate(i.dueDate)} • Status: ${i.status}`;
    } else if (type === 'payment') {
      const p = (window.storage.getPayments() || []).find(x => x.id === id);
      if (p) details = `<strong>[Receipt] ${p.clientName}</strong> • Amount: <strong>${formatINR(p.amount)}</strong> • Method: ${p.paymentMethod} • Ref: ${p.referenceNo || 'Verified'} • Date: ${formatDate(p.date)}`;
    } else if (type === 'expense') {
      const e = window.storage.getExpenses().find(x => x.id === id);
      if (e) details = `<strong>${e.description}</strong> • ${e.category} • Amount: <strong>${formatINR(e.amount)}</strong> • Paid to: ${e.paidTo}`;
    } else if (type === 'drawing') {
      const d = window.storage.getDrawings().find(x => x.id === id);
      if (d) details = `<strong>${d.purpose}</strong> • Amount: <strong>${formatINR(d.amount)}</strong> • Date: ${formatDate(d.date)}`;
    } else if (type === 'solar') {
      const s = window.storage.getSolarProjects().find(x => x.id === id);
      if (s) details = `<strong>${s.clientName}</strong> • Capacity: <strong>${s.systemCapacityKwp} kWp</strong> • Value: <strong>${formatINR(s.totalContractValue)}</strong> • DISCOM: ${s.discom}`;
    } else if (type === 'it') {
      const it = window.storage.getItProjects().find(x => x.id === id);
      if (it) details = `<strong>${it.clientName}</strong> • Scope: ${it.serviceScope} • Contract: <strong>${formatINR(it.contractValue)}</strong>`;
    } else if (type === 'procurement') {
      const p = (window.storage.getProcurements() || []).find(x => x.id === id);
      if (p) details = `<strong>${p.itemName}</strong> • Cat: ${p.itemCategory} • Supplier: ${p.supplierName || '—'} • Cost: <strong>${formatINR(p.actualCost || p.estimatedCost)}</strong> • Status: ${p.status}`;
    } else if (type === 'workorder') {
      const w = (window.storage.getWorkOrders() || []).find(x => x.id === id);
      if (w) details = `<strong>${w.title}</strong> • Assigned: ${w.assignedTo} (${w.contactPhone || ''}) • Fee: <strong>${formatINR(w.contractorFee)}</strong> • Status: ${w.status}`;
    } else if (type === 'site') {
      const s = (window.storage.getFacilitySites() || []).find(x => x.id === id);
      if (s) details = `<strong>[Facility] ${s.name}</strong> • Client: ${s.clientName} • Location: ${s.location} • Solar: ${s.solarCapacityKwp || 0} kWp • APDCL: ${s.apdclConsumerNo || '—'}`;
    } else if (type === 'facilityAsset') {
      const a = (window.storage.getFacilityAssets() || []).find(x => x.id === id);
      if (a) details = `<strong>[Asset] ${a.name}</strong> • Cat: ${a.category} • Model: ${a.modelNumber || '—'} • Serial: ${a.serialNumber || '—'} • Next Due: ${formatDate(a.nextServiceDate)} • Status: ${a.status}`;
    } else if (type === 'serviceTicket') {
      const t = (window.storage.getServiceTickets() || []).find(x => x.id === id);
      if (t) details = `<strong>[Ticket] ${t.title}</strong> • Priority: <strong>${t.priority}</strong> • Tech: ${t.assignedTech || 'Unassigned'} • Status: ${t.status}`;
    } else if (type === 'amcContract') {
      const c = (window.storage.getAmcContracts() || []).find(x => x.id === id);
      if (c) details = `<strong>[AMC] ${c.title}</strong> • Annual: <strong>${formatINR(c.annualFee)}</strong> • Cycle: ${c.billingFrequency} • Next Bill: ${formatDate(c.nextBillingDate)} • Status: ${c.status}`;
    }
    previewEl.innerHTML = details || '<span class="text-muted">Record details loaded. Click below to modify.</span>';
  }

  openSelectedRecordForEdit() {
    const id = document.getElementById('modify-record-select').value;
    if (!id) {
      showToast('Please select a record to modify.', 'error');
      return;
    }
    const type = document.getElementById('modify-type-select').value;
    this.closeAllModals();

    if (type === 'lead') {
      this.openEditLeadModal(id);
    } else if (type === 'quotation') {
      this.openEditQuotationModal(id);
    } else if (type === 'invoice') {
      this.openEditInvoiceModal(id);
    } else if (type === 'payment') {
      this.viewPaymentReceiptSlip(id);
    } else if (type === 'expense') {
      this.openEditExpenseModal(id);
    } else if (type === 'drawing') {
      this.openEditDrawingModal(id);
    } else if (type === 'solar') {
      this.openEditSolarProjectModal(id);
    } else if (type === 'it') {
      this.openEditItProjectModal(id);
    } else if (type === 'procurement') {
      this.openEditProcurementModal(id);
    } else if (type === 'workorder') {
      this.openEditWorkOrderModal(id);
    } else if (type === 'site') {
      this.openEditFacilitySiteModal(id);
    } else if (type === 'facilityAsset') {
      this.openEditFacilityAssetModal(id);
    } else if (type === 'serviceTicket') {
      this.openEditServiceTicketModal(id);
    } else if (type === 'amcContract') {
      this.openEditAmcModal(id);
    }
  }

  updateSolarMilestoneStatus(projId, milestoneIdx, status) {
    window.storage.updateSolarMilestone(projId, milestoneIdx, status);
    showToast('Solar milestone updated.', 'info');
    this.renderProjectsTab();
  }

  updateItMilestoneStatus(projId, milestoneIdx, status) {
    window.storage.updateItMilestone(projId, milestoneIdx, status);
    showToast('IT milestone updated.', 'info');
    this.renderProjectsTab();
  }

  saveSettingsFromModal() {
    const companyName = document.getElementById('setting-company-name').value.trim();
    const contactPhone = document.getElementById('setting-phone').value.trim();
    const contactEmail = document.getElementById('setting-email').value.trim();
    const whatsappNumber = document.getElementById('setting-whatsapp').value.trim();
    const taxReserveRate = Number(document.getElementById('setting-tax-rate').value) || 18;
    const adminPin = document.getElementById('setting-admin-pin').value.trim() || 'maxeco2026';
    const bankName = document.getElementById('setting-bank-name') ? document.getElementById('setting-bank-name').value.trim() : 'Punjab National Bank';
    const bankAccountName = document.getElementById('setting-bank-acc-name') ? document.getElementById('setting-bank-acc-name').value.trim() : 'Tamal Roy';
    const bankAccountNo = document.getElementById('setting-bank-acc-no') ? document.getElementById('setting-bank-acc-no').value.trim() : '4589000100072219';
    const bankIfscCode = document.getElementById('setting-bank-ifsc') ? document.getElementById('setting-bank-ifsc').value.trim() : 'PUNB0458900';
    const bankBranch = document.getElementById('setting-bank-branch') ? document.getElementById('setting-bank-branch').value.trim() : 'Maligaon, Guwahati';
    const bankAccountType = document.getElementById('setting-bank-acc-type') ? document.getElementById('setting-bank-acc-type').value.trim() : 'Saving Account';

    window.storage.saveSettings({
      companyName,
      contactPhone,
      contactEmail,
      whatsappNumber,
      taxReserveRate,
      adminPin,
      bankName,
      bankAccountName,
      bankAccountNo,
      bankIfscCode,
      bankBranch,
      bankAccountType
    });

    if (window.invoiceController && window.invoiceController.companyProfile) {
      window.invoiceController.companyProfile.bankName = bankName;
      window.invoiceController.companyProfile.accountName = bankAccountName;
      window.invoiceController.companyProfile.accountNo = bankAccountNo;
      window.invoiceController.companyProfile.ifscCode = bankIfscCode;
      window.invoiceController.companyProfile.branch = bankBranch;
      window.invoiceController.companyProfile.accountType = bankAccountType;
    }

    showToast('System and bank settings saved successfully!', 'success');
  }

  deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense record?')) {
      window.storage.deleteExpense(id);
      showToast('Expense removed.', 'info');
      this.renderFinanceTab();
    }
  }

  deleteDrawing(id) {
    if (confirm('Are you sure you want to delete this drawing record?')) {
      window.storage.deleteDrawing(id);
      showToast('Drawing removed.', 'info');
      this.renderFinanceTab();
    }
  }

  deleteQuotation(id) {
    if (confirm('Are you sure you want to delete this quotation?')) {
      window.storage.deleteQuotation(id);
      showToast('Quotation removed.', 'info');
      this.renderQuotesInvoicesTab();
    }
  }

  deleteLead(id) {
    if (confirm('Are you sure you want to permanently delete this lead record?')) {
      window.storage.deleteLead(id);
      showToast('Lead record removed.', 'info');
      this.renderLeadsTab();
      if (this.currentView === 'dashboard') {
        this.renderDashboardTab();
      }
    }
  }

  // --- UNIVERSAL DELETE SELECTOR CONTROLS ---
  openDeleteSelectorModal(defaultType = 'lead') {
    const typeSelect = document.getElementById('delete-type-select');
    if (typeSelect) typeSelect.value = defaultType;
    this.onDeleteTypeSelected(defaultType);
    document.getElementById('modal-delete-selector').classList.remove('hidden');
  }

  onDeleteTypeSelected(type) {
    const recSelect = document.getElementById('delete-record-select');
    if (!recSelect) return;
    recSelect.innerHTML = '';

    let items = [];
    if (type === 'lead') {
      items = window.storage.getLeads().map(l => ({ id: l.id, label: `[${l.id}] ${l.name} — ${formatINR(l.estimatedValue)} (${l.stage})` }));
    } else if (type === 'quotation') {
      items = window.storage.getQuotations().map(q => ({ id: q.id, label: `[${q.id}] ${q.clientName} — ${formatINR(q.totalAmount)} (${q.status})` }));
    } else if (type === 'invoice') {
      items = window.storage.getInvoices().map(i => ({ id: i.id, label: `[${i.id}] ${i.clientName} — ${formatINR(i.amountBilled)} (${i.status})` }));
    } else if (type === 'payment') {
      items = (window.storage.getPayments() || []).map(p => ({ id: p.id, label: `[${p.id}] ${p.clientName} — ${formatINR(p.amount)} (${p.paymentMethod || 'UPI'})` }));
    } else if (type === 'expense') {
      items = window.storage.getExpenses().map(e => ({ id: e.id, label: `[${e.id}] ${e.description} — ${formatINR(e.amount)} (${e.category})` }));
    } else if (type === 'drawing') {
      items = window.storage.getDrawings().map(d => ({ id: d.id, label: `[${d.id}] ${d.purpose} — ${formatINR(d.amount)} (${formatDate(d.date)})` }));
    } else if (type === 'solar') {
      items = window.storage.getSolarProjects().map(p => ({ id: p.id, label: `[${p.id}] ${p.clientName} (${p.systemCapacityKwp} kWp) — ${formatINR(p.totalContractValue)}` }));
    } else if (type === 'it') {
      items = window.storage.getItProjects().map(p => ({ id: p.id, label: `[${p.id}] ${p.clientName} — ${formatINR(p.contractValue)}` }));
    } else if (type === 'procurement') {
      items = (window.storage.getProcurements() || []).map(p => ({ id: p.id, label: `[${p.id}] ${p.itemName} — ${formatINR(p.actualCost || p.estimatedCost)} (${p.status})` }));
    } else if (type === 'workorder') {
      items = (window.storage.getWorkOrders() || []).map(w => ({ id: w.id, label: `[${w.id}] ${w.title} — ${w.assignedTo} (${w.status})` }));
    } else if (type === 'site') {
      items = (window.storage.getFacilitySites() || []).map(s => ({ id: s.id, label: `[${s.id}] ${s.name} — ${s.clientName} (${s.siteType})` }));
    } else if (type === 'facilityAsset') {
      items = (window.storage.getFacilityAssets() || []).map(a => ({ id: a.id, label: `[${a.id}] ${a.name} — ${a.category} (${a.status})` }));
    } else if (type === 'serviceTicket') {
      items = (window.storage.getServiceTickets() || []).map(t => ({ id: t.id, label: `[${t.id}] ${t.title} — Priority: ${t.priority} (${t.status})` }));
    } else if (type === 'amcContract') {
      items = (window.storage.getAmcContracts() || []).map(c => ({ id: c.id, label: `[${c.id}] ${c.title} — ${formatINR(c.annualFee)}/yr (${c.status})` }));
    }

    if (items.length === 0) {
      recSelect.innerHTML = '<option value="">(No records found in this category)</option>';
      this.updateDeletePreview('');
    } else {
      recSelect.innerHTML = items.map(it => `<option value="${it.id}">${it.label}</option>`).join('');
      this.updateDeletePreview(items[0].id);
    }
  }

  updateDeletePreview(id) {
    const previewEl = document.getElementById('delete-record-preview');
    if (!previewEl) return;
    if (!id) {
      previewEl.innerHTML = '<span class="text-muted">No record selected.</span>';
      return;
    }
    const type = document.getElementById('delete-type-select').value;
    let details = '';
    if (type === 'lead') {
      const l = window.storage.getLeads().find(x => x.id === id);
      if (l) details = `<strong style="color: var(--accent-rose);">[Lead] ${l.name}</strong> • ${l.service} • Phone: ${l.phone} • Value: ${formatINR(l.estimatedValue)} • Stage: ${l.stage}`;
    } else if (type === 'quotation') {
      const q = window.storage.getQuotations().find(x => x.id === id);
      if (q) details = `<strong style="color: var(--accent-rose);">[Quote] ${q.clientName}</strong> • ${q.service} • Value: ${formatINR(q.totalAmount)} • Status: ${q.status}`;
    } else if (type === 'invoice') {
      const i = window.storage.getInvoices().find(x => x.id === id);
      if (i) details = `<strong style="color: var(--accent-rose);">[Invoice] ${i.clientName}</strong> • Billed: ${formatINR(i.amountBilled)} • Collected: ${formatINR(i.amountCollected)} • Due: ${formatDate(i.dueDate)} • Status: ${i.status}`;
    } else if (type === 'payment') {
      const p = (window.storage.getPayments() || []).find(x => x.id === id);
      if (p) details = `<strong style="color: var(--accent-rose);">[Receipt] ${p.clientName}</strong> • Amount: ${formatINR(p.amount)} • Method: ${p.paymentMethod} • Ref: ${p.referenceNo || 'Verified'} • Date: ${formatDate(p.date)}`;
    } else if (type === 'expense') {
      const e = window.storage.getExpenses().find(x => x.id === id);
      if (e) details = `<strong style="color: var(--accent-rose);">[Expense] ${e.description}</strong> • ${e.category} • Amount: ${formatINR(e.amount)} • Paid to: ${e.paidTo}`;
    } else if (type === 'drawing') {
      const d = window.storage.getDrawings().find(x => x.id === id);
      if (d) details = `<strong style="color: var(--accent-rose);">[Withdrawal] ${d.purpose}</strong> • Amount: ${formatINR(d.amount)} • Date: ${formatDate(d.date)}`;
    } else if (type === 'solar') {
      const s = window.storage.getSolarProjects().find(x => x.id === id);
      if (s) details = `<strong style="color: var(--accent-rose);">[Solar Project] ${s.clientName}</strong> • ${s.systemCapacityKwp} kWp • Value: ${formatINR(s.totalContractValue)} • Site: ${s.siteLocation}`;
    } else if (type === 'it') {
      const it = window.storage.getItProjects().find(x => x.id === id);
      if (it) details = `<strong style="color: var(--accent-rose);">[IT Project] ${it.clientName}</strong> • Scope: ${it.serviceScope} • Contract: ${formatINR(it.contractValue)}`;
    } else if (type === 'procurement') {
      const p = (window.storage.getProcurements() || []).find(x => x.id === id);
      if (p) details = `<strong style="color: var(--accent-rose);">[BOM Item] ${p.itemName}</strong> • Cat: ${p.itemCategory} • Supplier: ${p.supplierName} • Cost: ${formatINR(p.actualCost || p.estimatedCost)} • Status: ${p.status}`;
    } else if (type === 'workorder') {
      const w = (window.storage.getWorkOrders() || []).find(x => x.id === id);
      if (w) details = `<strong style="color: var(--accent-rose);">[Work Order] ${w.title}</strong> • Assigned: ${w.assignedTo} • Fee: ${formatINR(w.contractorFee)} • Status: ${w.status}`;
    } else if (type === 'site') {
      const s = (window.storage.getFacilitySites() || []).find(x => x.id === id);
      if (s) details = `<strong style="color: var(--accent-rose);">[Facility Site] ${s.name}</strong> • Client: ${s.clientName} • Location: ${s.location}`;
    } else if (type === 'facilityAsset') {
      const a = (window.storage.getFacilityAssets() || []).find(x => x.id === id);
      if (a) details = `<strong style="color: var(--accent-rose);">[Facility Asset] ${a.name}</strong> • Cat: ${a.category} • Serial: ${a.serialNumber || '—'}`;
    } else if (type === 'serviceTicket') {
      const t = (window.storage.getServiceTickets() || []).find(x => x.id === id);
      if (t) details = `<strong style="color: var(--accent-rose);">[Service Ticket] ${t.title}</strong> • Priority: ${t.priority} • Tech: ${t.assignedTech || 'Unassigned'}`;
    } else if (type === 'amcContract') {
      const c = (window.storage.getAmcContracts() || []).find(x => x.id === id);
      if (c) details = `<strong style="color: var(--accent-rose);">[AMC Contract] ${c.title}</strong> • Annual: ${formatINR(c.annualFee)} • Cycle: ${c.billingFrequency}`;
    }
    previewEl.innerHTML = details || '<span class="text-muted">Record details loaded.</span>';
  }

  executeDeleteFromSelector() {
    const id = document.getElementById('delete-record-select').value;
    if (!id) {
      showToast('Please select a record to delete.', 'error');
      return;
    }
    const type = document.getElementById('delete-type-select').value;
    this.closeAllModals();

    if (type === 'lead') {
      this.deleteLead(id);
    } else if (type === 'quotation') {
      this.deleteQuotation(id);
    } else if (type === 'invoice') {
      this.deleteInvoice(id);
    } else if (type === 'payment') {
      this.deletePayment(id);
    } else if (type === 'expense') {
      this.deleteExpense(id);
    } else if (type === 'drawing') {
      this.deleteDrawing(id);
    } else if (type === 'solar') {
      this.deleteSolarProject(id);
    } else if (type === 'it') {
      this.deleteItProject(id);
    } else if (type === 'procurement') {
      this.deleteProcurement(id);
    } else if (type === 'workorder') {
      this.deleteWorkOrder(id);
    } else if (type === 'site') {
      this.deleteFacilitySite(id);
    } else if (type === 'facilityAsset') {
      this.deleteFacilityAsset(id);
    } else if (type === 'serviceTicket') {
      this.deleteServiceTicket(id);
    } else if (type === 'amcContract') {
      this.deleteAmc(id);
    }
  }

  // --- ADVANCED PVGIS SOLAR CALCULATOR INTERACTION ---
  runPublicCalculator() {
    const sanctionedLoadKw = Number(document.getElementById('calc-load').value);
    const monthlyBill = Number(document.getElementById('calc-bill').value);
    const customerType = document.getElementById('calc-type').value;
    const roofAreaSqFt = Number(document.getElementById('calc-roof').value);

    const locationKey = document.getElementById('calc-location')?.value || 'guwahati';
    const tiltAngle = Number(document.getElementById('calc-tilt')?.value) || 25;
    const azimuth = Number(document.getElementById('calc-azimuth')?.value) || 0;
    const shadingLossPercent = Number(document.getElementById('calc-shading')?.value) || 3;
    const systemLossPercent = Number(document.getElementById('calc-loss')?.value) || 14;

    if (!monthlyBill || monthlyBill < 500) {
      showToast('Please enter an average monthly electricity bill of at least ₹500.', 'warning');
      return;
    }

    const result = window.solarCalculator.calculate({
      sanctionedLoadKw,
      monthlyBill,
      customerType,
      roofAreaSqFt,
      locationKey,
      tiltAngle,
      azimuth,
      shadingLossPercent,
      systemLossPercent
    });

    document.getElementById('calc-res-capacity').textContent = `${result.finalCapacityKw} kWp`;
    document.getElementById('calc-res-monthly-gen').textContent = `~${result.monthlyGenerationUnits} Units / mo`;
    document.getElementById('calc-res-annual-gen').textContent = `~${result.annualGenerationUnits.toLocaleString('en-IN')} Units / yr`;
    document.getElementById('calc-res-annual-savings').textContent = `~${formatINR(result.annualSavings)} / yr`;
    document.getElementById('calc-res-investment').textContent = `${formatINR(result.estimatedInvestmentMin)} – ${formatINR(result.estimatedInvestmentMax)}`;
    document.getElementById('calc-res-payback').textContent = `~${result.paybackYears} Years`;
    document.getElementById('calc-res-lifetime-savings').textContent = `~${formatINR(result.lifetimeSavings)}`;
    document.getElementById('calc-res-co2').textContent = `~${result.co2OffsetTonnes25Yr} Tonnes`;
    document.getElementById('calc-res-area').textContent = `~${result.recommendedRoofArea} sq. ft.`;

    // Advanced PVGIS metrics
    const yieldElem = document.getElementById('calc-res-specific-yield');
    if (yieldElem) yieldElem.textContent = `~${result.effectiveSpecificYield} kWh/kWp/yr`;

    const locElem = document.getElementById('calc-res-location-title');
    if (locElem) locElem.textContent = `${result.location.name} (Tilt: ${result.tiltAngle}°, Azimuth: ${result.azimuth}°)`;

    const pvgisBtn = document.getElementById('calc-btn-pvgis');
    if (pvgisBtn) {
      pvgisBtn.href = result.pvgisUrl;
    }

    // Render 12-Month Seasonal Generation Breakdown
    const monthlyContainer = document.getElementById('calc-monthly-breakdown-container');
    if (monthlyContainer && result.monthlyBreakdown) {
      monthlyContainer.innerHTML = result.monthlyBreakdown.map(m => `
        <div style="background: var(--bg-surface); padding: 8px; border-radius: var(--radius-sm); text-align: center; border: 1px solid var(--border-color);">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-secondary);">${m.month}</div>
          <div style="font-size: 13px; font-weight: 800; color: var(--solar-amber); margin: 2px 0;">${m.generationUnits}</div>
          <div style="font-size: 10px; color: var(--accent-emerald);">${formatINR(m.savings)}</div>
        </div>
      `).join('');
    }

    // Render Feasibility & DISCOM Checklist
    const checklistContainer = document.getElementById('calc-feasibility-checklist-container');
    if (checklistContainer) {
      const checklist = window.solarCalculator.getFeasibilityChecklist();
      checklistContainer.innerHTML = checklist.map(group => `
        <div style="margin-bottom: 12px;">
          <h5 style="font-size: 12px; font-weight: 700; color: var(--solar-amber); margin-bottom: 4px;">${group.category}</h5>
          <ul style="font-size: 11px; color: var(--text-secondary); line-height: 1.6; padding-left: 16px;">
            ${group.items.map(it => `<li>${it}</li>`).join('')}
          </ul>
        </div>
      `).join('');
    }

    const settings = window.storage.getSettings();
    const waUrl = window.solarCalculator.generateWhatsAppEnquiryUrl(result, settings.whatsappNumber || '919954493909');
    const waBtn = document.getElementById('calc-btn-whatsapp');
    if (waBtn) {
      waBtn.href = waUrl;
    }

    this.lastSolarCalcResult = result;

    document.getElementById('calc-results-box').classList.remove('hidden');
    document.getElementById('calc-results-box').scrollIntoView({ behavior: 'smooth' });
  }

  // Alias for founder internal engineering workbench
  runInternalSolarCalculator() {
    this.runPublicCalculator();
  }

  convertSolarCalcToQuote() {
    if (!this.lastSolarCalcResult) {
      this.runInternalSolarCalculator();
    }
    const res = this.lastSolarCalcResult;
    if (!res) return;

    this.openAddQuotationModal();
    const presetSelect = document.getElementById('quote-service-preset');
    if (presetSelect) presetSelect.value = 'solar_epc';
    document.getElementById('quote-service').value = `Solar EPC Coordination — Complete Turnkey ${res.finalCapacityKw} kWp Rooftop System (Est. ${res.annualGenerationUnits.toLocaleString('en-IN')} Units/Yr)`;
    document.getElementById('quote-amount').value = res.avgInvestment;
    document.getElementById('quote-cost').value = Math.round(res.avgInvestment * 0.8);
    document.getElementById('quote-terms').value = "15% advance with work order, 45% upon module/inverter site delivery, 25% upon structural erection & wiring, 15% upon APDCL net-meter synchronization & CEIG testing.";

    const tbody = document.getElementById('quote-items-table-body');
    if (tbody) {
      tbody.innerHTML = '';
      this.addQuoteItemRow({
        description: `Solar EPC Coordination — Complete Turnkey ${res.finalCapacityKw} kWp Rooftop System`,
        sac: '995461',
        qty: res.finalCapacityKw,
        unit: 'kWp',
        rate: Math.round(res.avgInvestment / res.finalCapacityKw),
        amount: res.avgInvestment
      });
    }

    showToast(`Quotation pre-populated from ${res.finalCapacityKw} kWp Solar Sizing!`, 'success');
  }

  // --- PUBLIC CONTACT FORM ENQUIRY ---
  submitPublicContact(event) {
    event.preventDefault();
    const name = document.getElementById('contact-name').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const service = document.getElementById('contact-service').value;
    const location = document.getElementById('contact-location').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !phone) {
      showToast('Please provide your name and phone number.', 'error');
      return;
    }

    // Save as new lead in CRM
    window.storage.saveLead({
      name,
      contactPerson: name,
      phone,
      location: location || 'Guwahati, Assam',
      service,
      source: 'Website Form',
      stage: 'New',
      nextFollowUpDate: new Date().toISOString().slice(0, 10),
      nextAction: 'Call customer to review preliminary requirements',
      notes: message
    });

    const settings = window.storage.getSettings();
    const waText = encodeURIComponent(
      `Hello MaxEco Energy & Tech,\n\n` +
      `I submitted an enquiry through your website:\n` +
      `• Name: ${name}\n` +
      `• Phone: ${phone}\n` +
      `• Service: ${service}\n` +
      `• Location: ${location}\n` +
      `• Note: ${message}\n\n` +
      `Looking forward to connecting with your advisory team.`
    );

    const waLink = `https://wa.me/${settings.whatsappNumber || '919954493909'}?text=${waText}`;

    showToast('Enquiry received! Opening WhatsApp to connect directly...', 'success');
    window.open(waLink, '_blank');

    // Reset form
    document.getElementById('public-contact-form').reset();
  }

  // =========================================================================
  // CAFM (COMPUTER-AIDED FACILITY MANAGEMENT) APP METHODS
  // =========================================================================

  renderCafmTab() {
    if (!window.cafm) return;
    const summary = window.cafm.getSummary();

    // Populate Tenant Selector dropdown
    const orgSel = document.getElementById('cafm-tenant-selector');
    if (orgSel) {
      const orgs = window.cafm.getOrganizations();
      const current = window.cafm.getOrganizationFilter();
      orgSel.innerHTML = `
        <option value="all" ${current === 'all' ? 'selected' : ''}>🌐 All Client Organizations (Master Admin)</option>
        ${orgs.map(o => `<option value="${o.id}" ${o.id === current ? 'selected' : ''}>🏢 ${o.name} (${o.id})</option>`).join('')}
      `;
    }

    // Update KPI counters
    const elOrgs = document.getElementById('cafm-kpi-orgs');
    if (elOrgs) elOrgs.textContent = summary.totalOrganizations || 0;

    const elSites = document.getElementById('cafm-kpi-sites');
    if (elSites) elSites.textContent = summary.totalSites;

    const elSolar = document.getElementById('cafm-kpi-solar-kwp');
    if (elSolar) elSolar.textContent = `${summary.totalSolarCapacityKwp.toFixed(1)} kWp`;

    const elAssets = document.getElementById('cafm-kpi-assets');
    if (elAssets) elAssets.textContent = summary.totalAssets;

    const elDue = document.getElementById('cafm-kpi-due-tasks');
    if (elDue) elDue.textContent = summary.dueAssetsCount;

    const elTickets = document.getElementById('cafm-kpi-open-tickets');
    if (elTickets) elTickets.textContent = summary.openTicketsCount;

    const elCrit = document.getElementById('cafm-kpi-critical-tickets');
    if (elCrit) elCrit.textContent = summary.criticalTicketsCount;

    const elAmcVal = document.getElementById('cafm-kpi-amc-value');
    if (elAmcVal) elAmcVal.textContent = formatINR(summary.totalAnnualAmcValue);

    const elActiveAmcs = document.getElementById('cafm-kpi-active-amcs');
    if (elActiveAmcs) elActiveAmcs.textContent = summary.activeAmcCount;

    const elExpiringAmcs = document.getElementById('cafm-kpi-expiring-amcs');
    if (elExpiringAmcs) elExpiringAmcs.textContent = summary.expiringAmcCount || 0;

    const elSpaces = document.getElementById('cafm-kpi-spaces');
    if (elSpaces) elSpaces.textContent = summary.totalSpaces || 0;

    const elCompliance = document.getElementById('cafm-kpi-compliance-alerts');
    if (elCompliance) elCompliance.textContent = summary.complianceAlertsCount || 0;

    // Sub-tab selection
    this.setCafmSubTab(this.cafmSubTab || 'sites');
  }

  onCafmTenantChange(orgId) {
    window.cafm.setOrganizationFilter(orgId);
    this.renderCafmTab();
    const orgName = orgId === 'all' ? 'All Organizations (Master Admin)' : (window.cafm.getOrganizationById(orgId)?.name || orgId);
    showToast(`CAFM scoped to: ${orgName}`, 'info');
  }

  setCafmSubTab(tab) {
    this.cafmSubTab = tab;
    const tabs = ['orgs', 'sites', 'spaces', 'assets', 'utility', 'vendors', 'compliance', 'ppm', 'tickets', 'amcs', 'parts', 'audit'];

    tabs.forEach(t => {
      const btn = document.getElementById(`cafm-tab-btn-${t}`);
      if (btn) {
        if (t === tab) {
          btn.className = 'btn btn-primary btn-sm';
        } else {
          btn.className = 'btn btn-secondary btn-sm';
        }
      }

      const view = document.getElementById(`cafm-view-${t}`);
      if (view) {
        if (t === tab) view.classList.remove('hidden');
        else view.classList.add('hidden');
      }
    });

    const addBtn = document.getElementById('cafm-subtab-add-btn');
    if (addBtn) {
      if (tab === 'orgs') { addBtn.style.display = 'inline-flex'; addBtn.textContent = '🏢 Add Organization'; }
      else if (tab === 'sites') { addBtn.style.display = 'inline-flex'; addBtn.textContent = '➕ Add Facility Site'; }
      else if (tab === 'spaces') { addBtn.style.display = 'inline-flex'; addBtn.textContent = '📐 Add Space Zone'; }
      else if (tab === 'assets') { addBtn.style.display = 'inline-flex'; addBtn.textContent = '⚙️ Register Facility Asset'; }
      else if (tab === 'utility') { addBtn.style.display = 'inline-flex'; addBtn.textContent = '⚡ Log Monthly Reading'; }
      else if (tab === 'vendors') { addBtn.style.display = 'inline-flex'; addBtn.textContent = '🤝 Register Contractor'; }
      else if (tab === 'compliance') { addBtn.style.display = 'inline-flex'; addBtn.textContent = '📜 Register Certificate'; }
      else if (tab === 'ppm') { addBtn.style.display = 'inline-flex'; addBtn.textContent = '🎫 Log Maintenance Ticket'; }
      else if (tab === 'tickets') { addBtn.style.display = 'inline-flex'; addBtn.textContent = '🎫 Log Service Ticket'; }
      else if (tab === 'amcs') { addBtn.style.display = 'inline-flex'; addBtn.textContent = '📜 Add AMC Contract'; }
      else if (tab === 'parts') { addBtn.style.display = 'inline-flex'; addBtn.textContent = '📦 Add Spare Part'; }
      else if (tab === 'audit') { addBtn.style.display = 'none'; }
    }

    if (tab === 'orgs') this.renderCafmOrgs();
    else if (tab === 'sites') this.renderCafmSites();
    else if (tab === 'spaces') this.renderCafmSpaces();
    else if (tab === 'assets') this.renderCafmAssets();
    else if (tab === 'utility') this.renderCafmUtility();
    else if (tab === 'vendors') this.renderCafmVendors();
    else if (tab === 'compliance') this.renderCafmCompliance();
    else if (tab === 'ppm') this.renderCafmPpm();
    else if (tab === 'tickets') this.renderCafmTickets();
    else if (tab === 'amcs') this.renderCafmAmcs();
    else if (tab === 'parts') this.renderCafmParts();
    else if (tab === 'audit') this.renderCafmAudit();
  }

  handleCafmSubTabAddAction() {
    const tab = this.cafmSubTab || 'sites';
    if (tab === 'orgs') this.openAddOrganizationModal();
    else if (tab === 'sites') this.openAddFacilitySiteModal();
    else if (tab === 'spaces') this.openAddSpaceModal();
    else if (tab === 'assets') this.openAddFacilityAssetModal();
    else if (tab === 'utility') this.openAddUtilityModal();
    else if (tab === 'vendors') this.openAddVendorModal();
    else if (tab === 'compliance') this.openAddComplianceModal();
    else if (tab === 'ppm' || tab === 'tickets') this.openAddServiceTicketModal();
    else if (tab === 'amcs') this.openAddAmcModal();
    else if (tab === 'parts') this.openAddPartModal();
  }

  // --- SUB-TAB 0: ORGANIZATIONS ---
  renderCafmOrgs() {
    const orgs = window.cafm.getOrganizations();
    const container = document.getElementById('cafm-orgs-container');
    if (!container) return;

    if (orgs.length === 0) {
      container.innerHTML = `
        <div class="card text-center text-muted" style="grid-column: 1 / -1; padding: 30px;">
          No customer organizations registered yet. Click <strong>"🏢 Add Organization"</strong> above to record corporate offices, factories, or retail clients.
        </div>`;
      return;
    }

    const allSites = window.storage.getFacilitySites() || [];
    const allAmcs = window.storage.getAmcContracts() || [];

    container.innerHTML = orgs.map(o => {
      const orgSites = allSites.filter(s => s.organizationId === o.id);
      const totalSolarKwp = orgSites.reduce((sum, s) => sum + (Number(s.solarCapacityKwp) || 0), 0);
      const orgAmcs = allAmcs.filter(a => a.organizationId === o.id && a.status === 'Active');

      return `
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-left: 4px solid var(--eco-green);">
          <div>
            <div class="flex justify-between items-center" style="margin-bottom: 8px;">
              <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; font-weight: 700;">${o.type || 'Commercial Client'}</span>
              <span class="badge" style="background: ${o.status === 'Active' ? '#10b981' : '#64748b'}; color: #fff;">${o.status || 'Active'}</span>
            </div>
            <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 4px; color: #f8fafc;">${o.name}</h3>
            <div style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 8px;">
              Sector: <strong>${o.industry || 'Commercial Enterprise'}</strong>
            </div>

            <div style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px; border-bottom: 1px dashed var(--border-color); padding-bottom: 10px;">
              <div>👤 <strong>Contact:</strong> ${o.contactPerson || '—'}</div>
              <div>📞 <strong>Phone:</strong> ${o.phone || '—'}</div>
              <div>✉️ <strong>Email:</strong> ${o.email || '—'}</div>
              <div>📍 <strong>Address:</strong> ${o.billingAddress || 'Guwahati, Assam'}</div>
              ${o.gstin ? `<div style="font-family: monospace; font-size: 11px; color: var(--solar-amber); margin-top: 2px;">GSTIN: <strong>${o.gstin}</strong></div>` : ''}
            </div>

            <div class="grid grid-cols-3 gap-2" style="margin-bottom: 12px; font-size: 11px; text-align: center;">
              <div style="background: var(--bg-surface); padding: 6px; border-radius: var(--radius-sm);">
                <div style="color: var(--text-muted); font-size: 10px;">Sites</div>
                <strong style="font-size: 13px;">${orgSites.length}</strong>
              </div>
              <div style="background: var(--bg-surface); padding: 6px; border-radius: var(--radius-sm);">
                <div style="color: var(--text-muted); font-size: 10px;">Solar Capacity</div>
                <strong style="color: var(--solar-amber); font-size: 13px;">${totalSolarKwp} kWp</strong>
              </div>
              <div style="background: var(--bg-surface); padding: 6px; border-radius: var(--radius-sm);">
                <div style="color: var(--text-muted); font-size: 10px;">Active AMCs</div>
                <strong style="color: #10b981; font-size: 13px;">${orgAmcs.length}</strong>
              </div>
            </div>

            ${o.notes ? `<div style="font-size: 11px; color: #94a3b8; font-style: italic; margin-bottom: 12px;">"${o.notes}"</div>` : ''}
          </div>

          <div class="flex gap-2" style="border-top: 1px solid var(--border-color); padding-top: 10px; justify-content: space-between; flex-wrap: wrap;">
            <div class="flex gap-1">
              <button class="btn btn-secondary btn-sm" onclick="app.onCafmTenantChange('${o.id}')" title="Filter entire CAFM view to this Organization">🔍 View Scope</button>
              <button class="btn btn-secondary btn-sm" onclick="app.openAddFacilitySiteModal('', '${o.id}')" title="Add Facility Site for this Org">📍 +Site</button>
            </div>
            <div class="flex gap-1">
              <button class="btn btn-secondary btn-sm" onclick="app.openEditOrganizationModal('${o.id}')">✏️</button>
              <button class="btn btn-danger btn-sm" onclick="app.deleteOrganization('${o.id}')">✕</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- SITES SUB-TAB ---
  renderCafmSites() {
    const sites = window.cafm.getSites();
    const container = document.getElementById('cafm-sites-container');
    if (!container) return;

    if (sites.length === 0) {
      container.innerHTML = `
        <div class="card text-center text-muted" style="grid-column: 1 / -1; padding: 30px;">
          No facility sites recorded for current view. Click <strong>"➕ Add Facility Site"</strong> above to register client commercial premises.
        </div>`;
      return;
    }

    const allAssets = window.storage.getFacilityAssets() || [];
    const allAmcs = window.storage.getAmcContracts() || [];

    container.innerHTML = sites.map(s => {
      const siteAssets = allAssets.filter(a => a.siteId === s.id);
      const siteAmcs = allAmcs.filter(c => c.siteId === s.id && c.status === 'Active');
      const org = window.cafm.getOrganizationById(s.organizationId);

      return `
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div class="flex justify-between items-center" style="margin-bottom: 8px;">
              <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; font-weight: 700;">${s.siteType || 'Commercial Site'}</span>
              <span class="badge" style="background: ${s.status === 'Active' ? '#10b981' : '#f59e0b'}; color: #fff;">${s.status || 'Active'}</span>
            </div>
            <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 4px; color: #f8fafc;">${s.name}</h3>
            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">
              Organization: <strong>${org ? org.name : (s.clientName || 'Client')}</strong>
            </div>

            <div style="font-size: 11.5px; color: var(--text-muted); line-height: 1.5; margin-bottom: 12px; border-bottom: 1px dashed var(--border-color); padding-bottom: 10px;">
              <div>📍 ${s.location}</div>
              <div>📞 ${s.contactPerson ? `${s.contactPerson} (${s.contactPhone})` : s.contactPhone || '—'}</div>
              ${s.apdclConsumerNo ? `<div style="color: var(--sky-blue);">⚡ APDCL: <strong>${s.apdclConsumerNo}</strong> (Load: ${s.sanctionedLoadKw || '—'} kW)</div>` : ''}
            </div>

            <div class="grid grid-cols-2 gap-2" style="margin-bottom: 12px; font-size: 11px;">
              <div style="background: var(--bg-surface); padding: 6px 10px; border-radius: var(--radius-sm);">
                <div style="color: var(--text-muted);">Solar Capacity:</div>
                <strong style="color: var(--solar-amber); font-size: 13px;">${s.solarCapacityKwp || 0} kWp</strong>
              </div>
              <div style="background: var(--bg-surface); padding: 6px 10px; border-radius: var(--radius-sm);">
                <div style="color: var(--text-muted);">Registered Assets:</div>
                <strong style="font-size: 13px;">${siteAssets.length} Units</strong>
              </div>
            </div>

            ${s.itScope ? `<div style="font-size: 11px; color: #94a3b8; margin-bottom: 12px;">💻 <strong>IT Scope:</strong> ${s.itScope}</div>` : ''}
            ${siteAmcs.length > 0 ? `<div style="font-size: 11px; color: #10b981; font-weight: 600; margin-bottom: 12px;">🛡️ Active AMC: ${siteAmcs.map(a => formatINR(a.annualFee) + '/yr').join(', ')}</div>` : ''}
          </div>

          <div class="flex gap-2" style="border-top: 1px solid var(--border-color); padding-top: 10px; justify-content: space-between; flex-wrap: wrap;">
            <div class="flex gap-1">
              <button class="btn btn-secondary btn-sm" onclick="app.openAddFacilityAssetModal('${s.id}')" title="Register New Asset for this Site">⚙️ +Asset</button>
              <button class="btn btn-secondary btn-sm" onclick="app.openAddServiceTicketModal('', '${s.id}')" title="Log Ticket for this Site">🎫 +Ticket</button>
            </div>
            <div class="flex gap-1">
              <button class="btn btn-secondary btn-sm" onclick="app.openEditFacilitySiteModal('${s.id}')">✏️</button>
              <button class="btn btn-danger btn-sm" onclick="app.deleteFacilitySite('${s.id}')">✕</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- ASSETS SUB-TAB ---
  renderCafmAssets() {
    const category = document.getElementById('cafm-filter-asset-category')?.value || 'all';
    const status = document.getElementById('cafm-filter-asset-status')?.value || 'all';
    const assets = window.cafm.getAssets(category, status);
    const sites = window.storage.getFacilitySites() || [];
    const container = document.getElementById('cafm-assets-table-container');
    if (!container) return;

    if (assets.length === 0) {
      container.innerHTML = `<div class="card text-center text-muted" style="padding: 30px;">No facility assets found matching filters.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="card">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Category</th>
                <th>Asset Name &amp; Model</th>
                <th>Site Premise</th>
                <th>Serial Number</th>
                <th>Criticality</th>
                <th>Next Service Due</th>
                <th>Status</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${assets.map(a => {
                const site = sites.find(s => s.id === a.siteId);
                const isDue = a.status === 'Service Due' || (a.nextServiceDate && a.nextServiceDate <= new Date(Date.now() + 15*86400000).toISOString().slice(0, 10));

                let catBadge = '';
                if (a.category === 'Solar EPC') catBadge = '<span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b;">☀️ Solar EPC</span>';
                else if (a.category === 'IT Infrastructure') catBadge = '<span class="badge" style="background: rgba(2, 132, 199, 0.15); color: #0284c7;">🖥️ IT Infra</span>';
                else if (a.category === 'Electrical & CEIG') catBadge = '<span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">⚡ Electrical</span>';
                else catBadge = '<span class="badge" style="background: rgba(148, 163, 184, 0.15); color: #cbd5e1;">🏢 Utility</span>';

                let statusBadge = `<span class="badge" style="background: #10b981; color: #fff;">${a.status}</span>`;
                if (a.status === 'Service Due' || isDue) {
                  statusBadge = `<span class="badge" style="background: #f59e0b; color: #0f172a; font-weight: 700;">Service Due</span>`;
                } else if (a.status === 'Under Repair') {
                  statusBadge = `<span class="badge" style="background: #ef4444; color: #fff;">Under Repair</span>`;
                }

                return `
                  <tr>
                    <td class="font-mono font-bold" style="font-size: 12px; color: var(--solar-amber);">${a.id}</td>
                    <td>${catBadge}</td>
                    <td>
                      <strong>${a.name}</strong>
                      ${a.modelNumber ? `<div style="font-size: 11px; color: var(--text-muted);">${a.modelNumber}</div>` : ''}
                    </td>
                    <td>${site ? site.name : '—'}</td>
                    <td class="font-mono" style="font-size: 11px; color: var(--sky-blue);">${a.serialNumber || '—'}</td>
                    <td>
                      <span class="badge" style="background: ${a.criticality === 'Critical' ? '#ef4444' : (a.criticality === 'High' ? '#f59e0b' : 'rgba(255,255,255,0.1)')}; color: #fff; font-size: 10px;">
                        ${a.criticality || 'Normal'}
                      </span>
                    </td>
                    <td style="font-size: 11.5px; font-weight: 600; color: ${isDue ? 'var(--solar-amber)' : 'inherit'};">
                      ${formatDate(a.nextServiceDate)}
                    </td>
                    <td>${statusBadge}</td>
                    <td style="text-align: right;">
                      <div class="flex gap-1" style="justify-content: flex-end;">
                        <button class="btn btn-secondary btn-sm" onclick="app.viewAssetQrTag('${a.id}')" title="View & Print Equipment QR Tag">🏷️ Tag (QR)</button>
                        <button class="btn btn-secondary btn-sm" onclick="app.markAssetServiced('${a.id}')" title="Record Preventive Service Completed Today">✅ Done</button>
                        <button class="btn btn-secondary btn-sm" onclick="app.openAddServiceTicketModal('${a.id}')" title="Log Helpdesk / Breakdown Ticket">🎫</button>
                        <button class="btn btn-secondary btn-sm" onclick="app.openEditFacilityAssetModal('${a.id}')">✏️</button>
                        <button class="btn btn-danger btn-sm" onclick="app.deleteFacilityAsset('${a.id}')">✕</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  viewAssetQrTag(assetId) {
    const html = window.cafm.generateAssetTagHtml(assetId);
    const content = document.getElementById('cafm-asset-tag-view-content');
    if (content) content.innerHTML = html;
    document.getElementById('cafm-active-tag-asset-id').value = assetId;
    document.getElementById('modal-asset-qr-tag').classList.remove('hidden');
  }

  printAssetTag() {
    window.print();
  }

  createPpmTicketFromAsset(assetId) {
    const ticket = window.cafm.createPpmTicket(assetId);
    if (ticket) {
      showToast(`PPM ticket ${ticket.id} created for asset!`, 'success');
      this.setCafmSubTab('tickets');
    }
  }

  // --- PPM SUB-TAB ---
  renderCafmPpm() {
    const summary = window.cafm.getSummary();
    const ppmDueList = window.cafm.getPpmDueAssets(30);
    const allAssets = window.cafm.getAssets();
    const sites = window.storage.getFacilitySites() || [];

    const alertContainer = document.getElementById('cafm-ppm-alerts-container');
    if (alertContainer) {
      if (ppmDueList.length > 0) {
        alertContainer.innerHTML = `
          <div style="background: rgba(245, 158, 11, 0.12); border: 1px solid var(--solar-amber); border-radius: var(--radius-md); padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
            <div>
              <strong style="color: var(--solar-amber); font-size: 14px;">⚠️ ${ppmDueList.length} Preventive Maintenance Tasks Due / Overdue:</strong>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                Solar array washing cycles, inverter heat-sink thermography, or CEIG earth resistance audits requiring action within the 30-day window.
              </div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="app.openAddServiceTicketModal()">🎫 Dispatch Service Crew</button>
          </div>`;
      } else {
        alertContainer.innerHTML = `
          <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid #10b981; border-radius: var(--radius-md); padding: 14px 18px; color: #10b981; font-size: 13px;">
            ✅ All facility assets and solar equipment are currently compliant with scheduled maintenance cycles.
          </div>`;
      }
    }

    const tbody = document.getElementById('cafm-ppm-table-body');
    if (!tbody) return;

    if (allAssets.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding: 24px;">No facility assets registered.</td></tr>`;
      return;
    }

    const sorted = [...allAssets].sort((a, b) => (a.nextServiceDate || '9999').localeCompare(b.nextServiceDate || '9999'));

    tbody.innerHTML = sorted.map(a => {
      const site = sites.find(s => s.id === a.siteId);
      const isDue = a.status === 'Service Due' || (a.nextServiceDate && a.nextServiceDate <= new Date(Date.now() + 15*86400000).toISOString().slice(0, 10));

      return `
        <tr style="${isDue ? 'background: rgba(245, 158, 11, 0.04);' : ''}">
          <td class="font-mono font-bold" style="color: var(--solar-amber);">${a.id}</td>
          <td>
            <strong>${a.name}</strong>
            <div style="font-size: 10.5px; color: var(--text-muted);">${a.category} • SN: ${a.serialNumber || '—'}</div>
          </td>
          <td>${site ? site.name : '—'}</td>
          <td>Every ${a.maintenanceCycleDays || 90} Days</td>
          <td>${formatDate(a.lastServicedDate)}</td>
          <td style="font-weight: 700; color: ${isDue ? 'var(--solar-amber)' : 'inherit'};">
            ${formatDate(a.nextServiceDate)}
          </td>
          <td>
            <span class="badge" style="background: ${isDue ? '#f59e0b' : '#10b981'}; color: ${isDue ? '#0f172a' : '#fff'};">
              ${isDue ? 'Due' : 'Compliant'}
            </span>
          </td>
          <td style="text-align: right;">
            <div class="flex gap-1" style="justify-content: flex-end;">
              <button class="btn btn-secondary btn-sm" onclick="app.markAssetServiced('${a.id}')" title="Mark Serviced Today">✅ Done</button>
              <button class="btn btn-primary btn-sm" onclick="app.createPpmTicketFromAsset('${a.id}')" title="1-Click Create Scheduled PPM Ticket">⚡ PPM Ticket</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // --- TICKETS SUB-TAB ---
  renderCafmTickets() {
    const status = document.getElementById('cafm-filter-ticket-status')?.value || 'all';
    const priority = document.getElementById('cafm-filter-ticket-priority')?.value || 'all';
    const tickets = window.cafm.getTickets(status, priority);
    const sites = window.storage.getFacilitySites() || [];
    const assets = window.storage.getFacilityAssets() || [];
    const container = document.getElementById('cafm-tickets-table-container');
    if (!container) return;

    if (tickets.length === 0) {
      container.innerHTML = `<div class="card text-center text-muted" style="padding: 30px;">No service tickets found matching filters.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="card">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Priority &amp; SLA</th>
                <th>Title &amp; Scope</th>
                <th>Facility Premise &amp; Asset</th>
                <th>Reported</th>
                <th>Assigned Lead</th>
                <th>Status</th>
                <th>Linked WO</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${tickets.map(t => {
                const site = sites.find(s => s.id === t.siteId);
                const asset = assets.find(a => a.id === t.assetId);
                const sla = window.cafm.calculateTicketSla(t);
                const checklist = t.checklist || [];
                const completedTasks = checklist.filter(c => c.completed).length;

                let prioBadge = `<span class="badge" style="background: #3b82f6; color: #fff;">Normal</span>`;
                if (t.priority === 'Critical') prioBadge = `<span class="badge" style="background: #ef4444; color: #fff; font-weight: 800;">CRITICAL</span>`;
                else if (t.priority === 'High') prioBadge = `<span class="badge" style="background: #f59e0b; color: #0f172a; font-weight: 700;">High</span>`;
                else if (t.priority === 'Low') prioBadge = `<span class="badge" style="background: #64748b; color: #fff;">Low</span>`;

                let slaBadge = '';
                if (sla.slaStatus === 'Breached') {
                  slaBadge = `<span class="badge" style="background: #ef4444; color: #fff; font-size: 10px; margin-top: 3px;" title="Target: ${sla.targetHours}h, Elapsed: ${sla.elapsedHours.toFixed(1)}h">⚠️ SLA Breached</span>`;
                } else if (sla.slaStatus === 'Met') {
                  slaBadge = `<span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #10b981; font-size: 10px; margin-top: 3px;">✅ SLA Met</span>`;
                } else {
                  slaBadge = `<span class="badge" style="background: rgba(2, 132, 199, 0.15); color: #0284c7; font-size: 10px; margin-top: 3px;">⏱️ ${sla.remainingHours.toFixed(1)}h left</span>`;
                }

                let chargeableBadge = '';
                if (t.chargeableWork && t.chargeableWork.approvalStatus && t.chargeableWork.approvalStatus !== 'N/A') {
                  const apprSt = t.chargeableWork.approvalStatus;
                  const bg = apprSt === 'Approved' ? '#10b981' : (apprSt === 'Pending' ? '#f59e0b' : '#64748b');
                  chargeableBadge = `<div style="margin-top: 3px;"><span class="badge" style="background: ${bg}; color: #fff; font-size: 10px;">💳 ${apprSt} (${formatINR(t.chargeableWork.estimatedAmount || 0)})</span></div>`;
                }

                return `
                  <tr>
                    <td class="font-mono font-bold" style="font-size: 12px; color: var(--solar-amber);">${t.id}</td>
                    <td>
                      <div>${prioBadge}</div>
                      ${slaBadge}
                    </td>
                    <td>
                      <div class="flex items-center gap-1" style="flex-wrap: wrap;">
                        <strong>${t.title}</strong>
                        ${checklist.length > 0 ? `<span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; font-size: 10px;" title="Inspection Checklist Progress">📋 ${completedTasks}/${checklist.length}</span>` : ''}
                      </div>
                      <div style="font-size: 11px; color: var(--text-muted); max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${t.issueDescription || ''}
                      </div>
                      ${chargeableBadge}
                    </td>
                    <td>
                      <div style="font-weight: 600;">${site ? site.name : '—'}</div>
                      <div style="font-size: 11px; color: var(--text-muted);">${asset ? asset.name : 'General Asset'}</div>
                    </td>
                    <td style="font-size: 11px;">${formatDate(t.reportedDate)}</td>
                    <td style="font-size: 11px;">${t.assignedTech || 'Unassigned'}</td>
                    <td>
                      <span class="badge" style="background: ${t.status === 'Resolved' || t.status === 'Closed' ? '#10b981' : '#f59e0b'}; color: ${t.status === 'Resolved' || t.status === 'Closed' ? '#fff' : '#0f172a'}; font-weight: 600;">
                        ${t.status}
                      </span>
                    </td>
                    <td>
                      ${t.workOrderId ? `<span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; font-weight: 700;">${t.workOrderId}</span>` : '<span class="text-muted" style="font-size: 11px;">—</span>'}
                    </td>
                    <td style="text-align: right;">
                      <div class="flex gap-1" style="justify-content: flex-end; flex-wrap: wrap;">
                        <button class="btn btn-primary btn-sm" onclick="app.openTicketOperationsModal('${t.id}')" title="Technician Checklist, Parts & Client Approvals">🛠️ Ops</button>
                        <button class="btn btn-secondary btn-sm" onclick="app.openServiceReportModal('${t.id}')" title="Official A4 Service & Safety Audit Report">📄 Report</button>
                        ${!t.workOrderId ? `<button class="btn btn-secondary btn-sm" onclick="app.dispatchCafmTicketToWorkOrder('${t.id}')" title="Dispatch to Field Work Order in Operations">🚀 WO</button>` : ''}
                        <button class="btn btn-secondary btn-sm" onclick="app.openEditServiceTicketModal('${t.id}')">✏️</button>
                        <button class="btn btn-danger btn-sm" onclick="app.deleteServiceTicket('${t.id}')">✕</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --- AMCS SUB-TAB ---
  renderCafmAmcs() {
    const amcs = window.cafm.getAmcs();
    const sites = window.storage.getFacilitySites() || [];
    const container = document.getElementById('cafm-amcs-container');
    if (!container) return;

    if (amcs.length === 0) {
      container.innerHTML = `<div class="card text-center text-muted" style="grid-column: 1 / -1; padding: 30px;">No AMC service contracts registered for current view. Click <strong>"➕ Add AMC Contract"</strong> to record recurring O&M retainers.</div>`;
      return;
    }

    container.innerHTML = amcs.map(a => {
      const site = sites.find(s => s.id === a.siteId);
      const isExpired = a.status === 'Expired';
      const isSolar = (a.contractType || '').toLowerCase().includes('solar');
      const compliance = window.cafm.getAmcVisitCompliance(a.id);
      
      const today = new Date();
      const endD = a.endDate ? new Date(a.endDate) : null;
      const daysLeft = endD ? Math.ceil((endD - today) / (1000 * 60 * 60 * 24)) : 999;
      const isExpiringSoon = daysLeft <= (a.renewalReminderDays || 45) && daysLeft > 0;

      return `
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-left: 4px solid ${isSolar ? 'var(--solar-amber)' : 'var(--sky-blue)'};">
          <div>
            <div class="flex justify-between items-center" style="margin-bottom: 8px;">
              <span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; font-weight: 700;">${a.tier || a.contractType}</span>
              <div>
                ${isExpiringSoon ? `<span class="badge" style="background: #f59e0b; color: #0f172a; font-weight: 800; margin-right: 4px;">⏳ Expiring in ${daysLeft}d</span>` : ''}
                <span class="badge" style="background: ${isExpired ? '#ef4444' : '#10b981'}; color: #fff;">${a.status}</span>
              </div>
            </div>
            <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">${a.title}</h3>
            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">
              Facility: <strong>${site ? site.name : 'Client Site'}</strong> (${site ? site.clientName : ''})
            </div>

            <div class="grid grid-cols-2 gap-2" style="background: var(--bg-surface); padding: 10px 14px; border-radius: var(--radius-sm); margin-bottom: 12px;">
              <div>
                <span style="font-size: 11px; color: var(--text-muted);">Annual Contract Value:</span>
                <div class="font-mono text-amber" style="font-size: 18px; font-weight: 800;">${formatINR(a.annualFee)}</div>
              </div>
              <div>
                <span style="font-size: 11px; color: var(--text-muted);">Billing Cycle:</span>
                <div style="font-weight: 700; font-size: 13px;">${a.billingFrequency} (${a.sacCode || 'SAC 995461'})</div>
              </div>
            </div>

            <!-- Scheduled Maintenance Visits Progress -->
            <div style="background: var(--bg-surface); padding: 8px 12px; border-radius: var(--radius-sm); margin-bottom: 12px;">
              <div class="flex justify-between items-center" style="font-size: 11px; margin-bottom: 4px;">
                <span style="color: var(--text-muted);">Preventive Visits Fulfilled:</span>
                <strong style="color: ${compliance.compliancePercent === 100 ? '#10b981' : 'var(--solar-amber)'};">${compliance.completedVisits} of ${compliance.totalVisits} (${compliance.compliancePercent}%)</strong>
              </div>
              <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;">
                <div style="width: ${compliance.compliancePercent}%; height: 100%; background: ${compliance.compliancePercent === 100 ? '#10b981' : 'var(--solar-amber)'};"></div>
              </div>
            </div>

            <div style="font-size: 11.5px; line-height: 1.5; color: var(--text-secondary); margin-bottom: 12px;">
              <div>📅 <strong>Period:</strong> ${formatDate(a.startDate)} to ${formatDate(a.endDate)}</div>
              <div>💳 <strong>Next Billing:</strong> <strong style="color: var(--solar-amber);">${formatDate(a.nextBillingDate)}</strong></div>
              <div>⚡ <strong>Emergency SLA:</strong> ${a.emergencyResponseSlaHours || 4} Hours Response</div>
            </div>

            ${a.terms ? `<div style="font-size: 11px; color: #94a3b8; line-height: 1.4; border-top: 1px dashed var(--border-color); padding-top: 8px; margin-bottom: 12px;"><strong>SLA Scope:</strong> ${a.terms}</div>` : ''}
          </div>

          <div class="flex gap-2" style="border-top: 1px solid var(--border-color); padding-top: 12px; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <div class="flex gap-1">
              <button class="btn btn-primary btn-sm" onclick="app.createInvoiceFromAmc('${a.id}')" title="Generate periodic billing invoice with SAC code">🧾 Issue Invoice</button>
              <button class="btn btn-secondary btn-sm" onclick="app.openAmcVisitsModal('${a.id}')" title="View Scheduled Service Visits">📅 Visits (${compliance.completedVisits}/${compliance.totalVisits})</button>
            </div>
            <div class="flex gap-1">
              <button class="btn btn-secondary btn-sm" onclick="app.openEditAmcModal('${a.id}')">✏️ Edit</button>
              <button class="btn btn-danger btn-sm" onclick="app.deleteAmc('${a.id}')">✕</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- SUB-TAB 6: AUDIT LOG JOURNAL ---
  renderCafmAudit() {
    const logs = window.storage.getAuditLogs() || [];
    const tbody = document.getElementById('cafm-audit-table-body');
    if (!tbody) return;

    if (logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 24px;">No audit entries recorded yet. Actions are automatically captured here.</td></tr>`;
      return;
    }

    tbody.innerHTML = logs.map(l => `
      <tr>
        <td class="font-mono" style="font-size: 11px; color: var(--solar-amber); font-weight: 700;">${l.id}</td>
        <td style="font-size: 11px; color: var(--text-muted);">${new Date(l.timestamp).toLocaleString('en-IN')}</td>
        <td>
          <strong>${l.user}</strong>
          <div style="font-size: 10px; color: var(--text-muted);">${l.role}</div>
        </td>
        <td>
          <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; font-weight: 700; font-size: 10px;">${l.action}</span>
        </td>
        <td style="font-size: 11px;">${l.entityType}</td>
        <td class="font-mono" style="font-size: 11px; color: var(--sky-blue);">${l.entityId || '—'}</td>
        <td style="font-size: 11px; color: var(--text-secondary); max-width: 300px;">${l.details || ''}</td>
      </tr>
    `).join('');
  }

  // --- ACTION HANDLERS: CUSTOMER ORGANIZATIONS ---
  openAddOrganizationModal() {
    document.getElementById('org-modal-id').value = '';
    document.getElementById('modal-org-title').textContent = '🏢 Add Customer Organization';
    document.getElementById('org-modal-name').value = '';
    document.getElementById('org-modal-type').value = 'Commercial Factory & Logistics';
    document.getElementById('org-modal-industry').value = '';
    document.getElementById('org-modal-gstin').value = '';
    document.getElementById('org-modal-contact').value = '';
    document.getElementById('org-modal-phone').value = '';
    document.getElementById('org-modal-email').value = '';
    document.getElementById('org-modal-address').value = 'Guwahati, Assam';
    document.getElementById('org-modal-notes').value = '';
    document.getElementById('modal-cafm-organization').classList.remove('hidden');
  }

  openEditOrganizationModal(id) {
    const org = window.cafm.getOrganizationById(id);
    if (!org) return;
    document.getElementById('org-modal-id').value = org.id;
    document.getElementById('modal-org-title').textContent = `🏢 Edit Customer Organization (${org.id})`;
    document.getElementById('org-modal-name').value = org.name || '';
    document.getElementById('org-modal-type').value = org.type || 'Commercial Factory & Logistics';
    document.getElementById('org-modal-industry').value = org.industry || '';
    document.getElementById('org-modal-gstin').value = org.gstin || '';
    document.getElementById('org-modal-contact').value = org.contactPerson || '';
    document.getElementById('org-modal-phone').value = org.phone || '';
    document.getElementById('org-modal-email').value = org.email || '';
    document.getElementById('org-modal-address').value = org.billingAddress || '';
    document.getElementById('org-modal-notes').value = org.notes || '';
    document.getElementById('modal-cafm-organization').classList.remove('hidden');
  }

  saveOrganizationFromModal() {
    const name = document.getElementById('org-modal-name').value.trim();
    if (!name) {
      showToast('Organization Name is required.', 'error');
      return;
    }

    const orgData = {
      id: document.getElementById('org-modal-id').value || null,
      name,
      type: document.getElementById('org-modal-type').value,
      industry: document.getElementById('org-modal-industry').value.trim(),
      gstin: document.getElementById('org-modal-gstin').value.trim(),
      contactPerson: document.getElementById('org-modal-contact').value.trim(),
      phone: document.getElementById('org-modal-phone').value.trim(),
      email: document.getElementById('org-modal-email').value.trim(),
      billingAddress: document.getElementById('org-modal-address').value.trim(),
      notes: document.getElementById('org-modal-notes').value.trim(),
      status: 'Active'
    };

    window.cafm.saveOrganization(orgData);
    this.closeAllModals();
    showToast(`Organization "${name}" saved!`, 'success');
    this.renderCafmTab();
  }

  deleteOrganization(id) {
    if (confirm('Delete this customer organization record? Associated sites and assets will remain in system.')) {
      window.cafm.deleteOrganization(id);
      showToast('Customer organization deleted.', 'info');
      this.renderCafmTab();
    }
  }

  // --- MULTI-TENANT ORG SELECTOR HELPERS ---
  populateOrgSelectOptions(selectId, selectedOrgId = '', allowAll = false) {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    const orgs = window.cafm.getOrganizations() || [];
    let opts = allowAll ? '<option value="">All Organizations (Enterprise Scope)</option>' : '';
    opts += orgs.map(o => `
      <option value="${o.id}" ${o.id === selectedOrgId ? 'selected' : ''}>
        ${o.name} [${o.id}]
      </option>
    `).join('');
    sel.innerHTML = opts;
  }

  // --- ACTION HANDLERS: SITES ---
  onSiteOrgSelected() {
    const orgId = document.getElementById('site-modal-org-id').value;
    const clientInput = document.getElementById('site-modal-client');
    if (orgId) {
      const org = window.cafm.getOrganizationById(orgId);
      if (org && (!clientInput.value || clientInput.dataset.autofilled === 'true')) {
        clientInput.value = org.name;
        clientInput.dataset.autofilled = 'true';
      }
    }
  }

  openAddFacilitySiteModal(preselectedName = '', preselectedOrgId = '') {
    const activeTenant = preselectedOrgId || window.cafm.getOrganizationFilter() || '';
    this.populateOrgSelectOptions('site-modal-org-id', activeTenant);

    document.getElementById('site-modal-id').value = '';
    document.getElementById('modal-facility-site-title').textContent = '🏢 Add Client Facility Premise';
    document.getElementById('site-modal-name').value = preselectedName || '';
    
    const clientInput = document.getElementById('site-modal-client');
    const selectedOrg = window.cafm.getOrganizationById(document.getElementById('site-modal-org-id').value);
    clientInput.value = selectedOrg ? selectedOrg.name : '';
    clientInput.dataset.autofilled = selectedOrg ? 'true' : 'false';

    document.getElementById('site-modal-type').value = 'Commercial Factory & Warehouse';
    document.getElementById('site-modal-status').value = 'Active';
    document.getElementById('site-modal-location').value = selectedOrg ? selectedOrg.billingAddress : 'Guwahati, Assam';
    document.getElementById('site-modal-contact').value = selectedOrg ? selectedOrg.contactPerson : '';
    document.getElementById('site-modal-phone').value = selectedOrg ? selectedOrg.phone : '';
    document.getElementById('site-modal-apdcl').value = '';
    document.getElementById('site-modal-sanctioned-kw').value = '';
    document.getElementById('site-modal-solar-kwp').value = '';
    document.getElementById('site-modal-it-scope').value = '';
    document.getElementById('modal-facility-site').classList.remove('hidden');
  }

  openEditFacilitySiteModal(id) {
    const site = window.cafm.getSiteById(id);
    if (!site) return;
    this.populateOrgSelectOptions('site-modal-org-id', site.organizationId || '');
    document.getElementById('site-modal-id').value = site.id;
    document.getElementById('modal-facility-site-title').textContent = `🏢 Edit Facility Site (${site.id})`;
    document.getElementById('site-modal-name').value = site.name || '';
    const clientInput = document.getElementById('site-modal-client');
    clientInput.value = site.clientName || '';
    clientInput.dataset.autofilled = 'false';
    document.getElementById('site-modal-type').value = site.siteType || 'Commercial Factory & Warehouse';
    document.getElementById('site-modal-status').value = site.status || 'Active';
    document.getElementById('site-modal-location').value = site.location || '';
    document.getElementById('site-modal-contact').value = site.contactPerson || '';
    document.getElementById('site-modal-phone').value = site.contactPhone || '';
    document.getElementById('site-modal-apdcl').value = site.apdclConsumerNo || '';
    document.getElementById('site-modal-sanctioned-kw').value = site.sanctionedLoadKw || '';
    document.getElementById('site-modal-solar-kwp').value = site.solarCapacityKwp || '';
    document.getElementById('site-modal-it-scope').value = site.itScope || '';
    document.getElementById('modal-facility-site').classList.remove('hidden');
  }

  saveFacilitySiteFromModal() {
    const name = document.getElementById('site-modal-name').value.trim();
    const clientName = document.getElementById('site-modal-client').value.trim();
    const location = document.getElementById('site-modal-location').value.trim();
    const organizationId = document.getElementById('site-modal-org-id').value || null;

    if (!name || !clientName) {
      showToast('Facility Name and Client Name are required.', 'error');
      return;
    }

    const siteData = {
      id: document.getElementById('site-modal-id').value || null,
      organizationId,
      name,
      clientName,
      siteType: document.getElementById('site-modal-type').value,
      status: document.getElementById('site-modal-status').value,
      location,
      contactPerson: document.getElementById('site-modal-contact').value.trim(),
      contactPhone: document.getElementById('site-modal-phone').value.trim(),
      apdclConsumerNo: document.getElementById('site-modal-apdcl').value.trim(),
      sanctionedLoadKw: Number(document.getElementById('site-modal-sanctioned-kw').value) || 0,
      solarCapacityKwp: Number(document.getElementById('site-modal-solar-kwp').value) || 0,
      itScope: document.getElementById('site-modal-it-scope').value.trim()
    };

    window.cafm.saveSite(siteData);
    this.closeAllModals();
    showToast(`Facility premise "${name}" saved!`, 'success');
    this.renderCafmTab();
  }

  deleteFacilitySite(id) {
    if (confirm('Are you sure you want to delete this facility site? All associated assets remain intact.')) {
      window.cafm.deleteSite(id);
      showToast('Facility site deleted.', 'info');
      this.renderCafmTab();
    }
  }

  // --- ACTION HANDLERS: ASSETS ---
  populateSiteSelectOptions(selectId, selectedSiteId = '', orgFilter = '') {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    let sites = window.storage.getFacilitySites() || [];
    if (orgFilter) {
      sites = sites.filter(s => s.organizationId === orgFilter);
    }
    if (sites.length === 0) {
      sel.innerHTML = '<option value="">(No sites registered for this organization)</option>';
      return;
    }
    sel.innerHTML = sites.map(s => `
      <option value="${s.id}" ${s.id === selectedSiteId ? 'selected' : ''}>
        ${s.name} (${s.clientName})
      </option>
    `).join('');
  }

  onAssetOrgSelected() {
    const orgId = document.getElementById('asset-modal-org-id').value;
    this.populateSiteSelectOptions('asset-modal-site-id', '', orgId);
  }

  openAddFacilityAssetModal(preselectedSiteId = '', preselectedOrgId = '') {
    let orgId = preselectedOrgId;
    if (preselectedSiteId && !orgId) {
      const site = window.cafm.getSiteById(preselectedSiteId);
      if (site) orgId = site.organizationId;
    }
    if (!orgId) {
      orgId = window.cafm.getOrganizationFilter() || '';
    }

    this.populateOrgSelectOptions('asset-modal-org-id', orgId);
    const activeOrg = document.getElementById('asset-modal-org-id').value;
    this.populateSiteSelectOptions('asset-modal-site-id', preselectedSiteId, activeOrg);

    document.getElementById('asset-modal-id').value = '';
    document.getElementById('modal-facility-asset-title').textContent = '⚙️ Register Facility Asset';
    document.getElementById('asset-modal-category').value = 'Solar EPC';
    document.getElementById('asset-modal-criticality').value = 'Normal';
    document.getElementById('asset-modal-name').value = '';
    document.getElementById('asset-modal-location').value = '';
    document.getElementById('asset-modal-model').value = '';
    document.getElementById('asset-modal-serial').value = '';
    document.getElementById('asset-modal-install-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('asset-modal-warranty-expiry').value = '';
    document.getElementById('asset-modal-cycle-days').value = '90';
    document.getElementById('asset-modal-last-service').value = new Date().toISOString().slice(0, 10);
    const nextDate = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
    document.getElementById('asset-modal-next-service').value = nextDate;
    document.getElementById('asset-modal-status').value = 'Operational';
    document.getElementById('asset-modal-notes').value = '';
    document.getElementById('modal-facility-asset').classList.remove('hidden');
  }

  openEditFacilityAssetModal(id) {
    const asset = window.cafm.getAssetById(id);
    if (!asset) return;
    const site = window.cafm.getSiteById(asset.siteId);
    const orgId = asset.organizationId || (site ? site.organizationId : '');

    this.populateOrgSelectOptions('asset-modal-org-id', orgId);
    this.populateSiteSelectOptions('asset-modal-site-id', asset.siteId, orgId);

    document.getElementById('asset-modal-id').value = asset.id;
    document.getElementById('modal-facility-asset-title').textContent = `⚙️ Edit Facility Asset (${asset.id})`;
    document.getElementById('asset-modal-category').value = asset.category || 'Solar EPC';
    document.getElementById('asset-modal-criticality').value = asset.criticality || 'Normal';
    document.getElementById('asset-modal-name').value = asset.name || '';
    document.getElementById('asset-modal-location').value = asset.location || '';
    document.getElementById('asset-modal-model').value = asset.modelNumber || '';
    document.getElementById('asset-modal-serial').value = asset.serialNumber || '';
    document.getElementById('asset-modal-install-date').value = asset.installDate || '';
    document.getElementById('asset-modal-warranty-expiry').value = asset.warrantyExpiry || '';
    document.getElementById('asset-modal-cycle-days').value = asset.maintenanceCycleDays || 90;
    document.getElementById('asset-modal-last-service').value = asset.lastServicedDate || '';
    document.getElementById('asset-modal-next-service').value = asset.nextServiceDate || '';
    document.getElementById('asset-modal-status').value = asset.status || 'Operational';
    document.getElementById('asset-modal-notes').value = asset.notes || '';
    document.getElementById('modal-facility-asset').classList.remove('hidden');
  }

  saveFacilityAssetFromModal() {
    const name = document.getElementById('asset-modal-name').value.trim();
    const siteId = document.getElementById('asset-modal-site-id').value;
    const nextServiceDate = document.getElementById('asset-modal-next-service').value;
    const organizationId = document.getElementById('asset-modal-org-id').value || null;

    if (!name || !siteId || !nextServiceDate) {
      showToast('Asset Name, Facility Site, and Next Service Date are required.', 'error');
      return;
    }

    const assetData = {
      id: document.getElementById('asset-modal-id').value || null,
      organizationId,
      siteId,
      category: document.getElementById('asset-modal-category').value,
      criticality: document.getElementById('asset-modal-criticality').value,
      name,
      location: document.getElementById('asset-modal-location').value.trim(),
      modelNumber: document.getElementById('asset-modal-model').value.trim(),
      serialNumber: document.getElementById('asset-modal-serial').value.trim(),
      installDate: document.getElementById('asset-modal-install-date').value,
      warrantyExpiry: document.getElementById('asset-modal-warranty-expiry').value,
      maintenanceCycleDays: Number(document.getElementById('asset-modal-cycle-days').value) || 90,
      lastServicedDate: document.getElementById('asset-modal-last-service').value,
      nextServiceDate,
      status: document.getElementById('asset-modal-status').value,
      notes: document.getElementById('asset-modal-notes').value.trim()
    };

    window.cafm.saveAsset(assetData);
    this.closeAllModals();
    showToast(`Facility asset "${name}" registered!`, 'success');
    this.renderCafmTab();
  }

  deleteFacilityAsset(id) {
    if (confirm('Delete this facility asset record?')) {
      window.cafm.deleteAsset(id);
      showToast('Facility asset deleted.', 'info');
      this.renderCafmTab();
    }
  }

  markAssetServiced(id) {
    const asset = window.cafm.getAssetById(id);
    if (!asset) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const cycle = Number(asset.maintenanceCycleDays) || 90;
    const nextDate = new Date(Date.now() + cycle * 86400000).toISOString().slice(0, 10);

    asset.lastServicedDate = todayStr;
    asset.nextServiceDate = nextDate;
    asset.status = 'Operational';

    window.cafm.saveAsset(asset);
    showToast(`Asset "${asset.name}" marked serviced! Next due: ${formatDate(nextDate)}`, 'success');
    this.renderCafmTab();
  }

  // --- ACTION HANDLERS: SERVICE TICKETS ---
  populateAssetSelectOptions(selectId, siteId, selectedAssetId = '') {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    const allAssets = window.storage.getFacilityAssets() || [];
    const filtered = siteId ? allAssets.filter(a => a.siteId === siteId) : allAssets;

    if (filtered.length === 0) {
      sel.innerHTML = '<option value="">(No specific asset - General facility issue)</option>';
      return;
    }

    sel.innerHTML = `
      <option value="">(General Facility Issue / Multiple Assets)</option>
      ${filtered.map(a => `
        <option value="${a.id}" ${a.id === selectedAssetId ? 'selected' : ''}>
          ${a.name} [${a.category}]
        </option>
      `).join('')}
    `;
  }

  onTicketOrgChanged() {
    const orgId = document.getElementById('ticket-modal-org-id').value;
    this.populateSiteSelectOptions('ticket-modal-site-id', '', orgId);
    const newSiteId = document.getElementById('ticket-modal-site-id').value;
    this.populateAssetSelectOptions('ticket-modal-asset-id', newSiteId);
  }

  onTicketSiteChanged() {
    const siteId = document.getElementById('ticket-modal-site-id').value;
    this.populateAssetSelectOptions('ticket-modal-asset-id', siteId);
  }

  openAddServiceTicketModal(preselectedAssetId = '', preselectedSiteId = '', preselectedOrgId = '') {
    let siteId = preselectedSiteId;
    let orgId = preselectedOrgId;

    if (preselectedAssetId) {
      const asset = window.cafm.getAssetById(preselectedAssetId);
      if (asset) {
        siteId = asset.siteId;
        orgId = asset.organizationId;
      }
    }
    if (siteId && !orgId) {
      const site = window.cafm.getSiteById(siteId);
      if (site) orgId = site.organizationId;
    }
    if (!orgId) {
      orgId = window.cafm.getOrganizationFilter() || '';
    }

    this.populateOrgSelectOptions('ticket-modal-org-id', orgId);
    const activeOrg = document.getElementById('ticket-modal-org-id').value;
    this.populateSiteSelectOptions('ticket-modal-site-id', siteId, activeOrg);
    const currentSiteId = document.getElementById('ticket-modal-site-id').value;
    this.populateAssetSelectOptions('ticket-modal-asset-id', currentSiteId, preselectedAssetId);

    document.getElementById('ticket-modal-id').value = '';
    document.getElementById('modal-service-ticket-title').textContent = '🎫 Log Maintenance Service Ticket';
    document.getElementById('ticket-modal-title').value = '';
    document.getElementById('ticket-modal-priority').value = 'Normal';
    document.getElementById('ticket-modal-status').value = 'Open';
    document.getElementById('ticket-modal-reported-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('ticket-modal-tech').value = '';
    document.getElementById('ticket-modal-desc').value = '';
    document.getElementById('ticket-modal-resolution').value = '';
    document.getElementById('modal-service-ticket').classList.remove('hidden');
  }

  openEditServiceTicketModal(id) {
    const ticket = window.cafm.getTicketById(id);
    if (!ticket) return;

    const site = window.cafm.getSiteById(ticket.siteId);
    const orgId = ticket.organizationId || (site ? site.organizationId : '');

    this.populateOrgSelectOptions('ticket-modal-org-id', orgId);
    this.populateSiteSelectOptions('ticket-modal-site-id', ticket.siteId, orgId);
    this.populateAssetSelectOptions('ticket-modal-asset-id', ticket.siteId, ticket.assetId);

    document.getElementById('ticket-modal-id').value = ticket.id;
    document.getElementById('modal-service-ticket-title').textContent = `🎫 Edit Service Ticket (${ticket.id})`;
    document.getElementById('ticket-modal-title').value = ticket.title || '';
    document.getElementById('ticket-modal-priority').value = ticket.priority || 'Normal';
    document.getElementById('ticket-modal-status').value = ticket.status || 'Open';
    document.getElementById('ticket-modal-reported-date').value = ticket.reportedDate || '';
    document.getElementById('ticket-modal-tech').value = ticket.assignedTech || '';
    document.getElementById('ticket-modal-desc').value = ticket.issueDescription || '';
    document.getElementById('ticket-modal-resolution').value = ticket.resolutionNotes || '';
    document.getElementById('modal-service-ticket').classList.remove('hidden');
  }

  saveServiceTicketFromModal() {
    const title = document.getElementById('ticket-modal-title').value.trim();
    const siteId = document.getElementById('ticket-modal-site-id').value;
    const organizationId = document.getElementById('ticket-modal-org-id').value || null;

    if (!title || !siteId) {
      showToast('Ticket Title and Facility Site are required.', 'error');
      return;
    }

    const ticketData = {
      id: document.getElementById('ticket-modal-id').value || null,
      organizationId,
      siteId,
      assetId: document.getElementById('ticket-modal-asset-id').value || null,
      title,
      priority: document.getElementById('ticket-modal-priority').value,
      status: document.getElementById('ticket-modal-status').value,
      reportedDate: document.getElementById('ticket-modal-reported-date').value,
      assignedTech: document.getElementById('ticket-modal-tech').value.trim(),
      issueDescription: document.getElementById('ticket-modal-desc').value.trim(),
      resolutionNotes: document.getElementById('ticket-modal-resolution').value.trim()
    };

    window.cafm.saveTicket(ticketData);
    this.closeAllModals();
    showToast(`Service ticket "${title}" saved!`, 'success');
    this.renderCafmTab();
  }

  deleteServiceTicket(id) {
    if (confirm('Delete this service ticket?')) {
      window.cafm.deleteTicket(id);
      showToast('Service ticket deleted.', 'info');
      this.renderCafmTab();
    }
  }

  dispatchCafmTicketToWorkOrder(ticketId) {
    const wo = window.cafm.dispatchTicketToWorkOrder(ticketId);
    if (wo) {
      showToast(`CAFM Ticket dispatched to Field Work Order: ${wo.id}!`, 'success');
      this.renderCafmTab();
    }
  }

  // --- ACTION HANDLERS: AMCS ---
  onAmcOrgChanged() {
    const orgId = document.getElementById('amc-modal-org-id').value;
    this.populateSiteSelectOptions('amc-modal-site-id', '', orgId);
  }

  openAddAmcModal(preselectedSiteId = '', preselectedOrgId = '') {
    let orgId = preselectedOrgId;
    if (preselectedSiteId && !orgId) {
      const site = window.cafm.getSiteById(preselectedSiteId);
      if (site) orgId = site.organizationId;
    }
    if (!orgId) {
      orgId = window.cafm.getOrganizationFilter() || '';
    }

    this.populateOrgSelectOptions('amc-modal-org-id', orgId);
    const activeOrg = document.getElementById('amc-modal-org-id').value;
    this.populateSiteSelectOptions('amc-modal-site-id', preselectedSiteId, activeOrg);

    document.getElementById('amc-modal-id').value = '';
    document.getElementById('modal-amc-contract-title').textContent = '📜 Add AMC Service Contract';
    document.getElementById('amc-modal-type').value = 'Comprehensive Solar O&M';
    document.getElementById('amc-modal-title').value = '';
    document.getElementById('amc-modal-fee').value = '45000';
    document.getElementById('amc-modal-freq').value = 'Quarterly';
    document.getElementById('amc-modal-status').value = 'Active';
    document.getElementById('amc-modal-start').value = new Date().toISOString().slice(0, 10);
    const end = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
    const nextBill = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
    document.getElementById('amc-modal-end').value = end;
    document.getElementById('amc-modal-billing').value = nextBill;
    document.getElementById('amc-modal-terms').value = 'Includes quarterly preventative maintenance visits, emergency breakdown response, and CEIG compliance audit.';
    document.getElementById('modal-amc-contract').classList.remove('hidden');
  }

  openEditAmcModal(id) {
    const amc = window.cafm.getAmcById(id);
    if (!amc) return;

    const site = window.cafm.getSiteById(amc.siteId);
    const orgId = amc.organizationId || (site ? site.organizationId : '');

    this.populateOrgSelectOptions('amc-modal-org-id', orgId);
    this.populateSiteSelectOptions('amc-modal-site-id', amc.siteId, orgId);

    document.getElementById('amc-modal-id').value = amc.id;
    document.getElementById('modal-amc-contract-title').textContent = `📜 Edit AMC Contract (${amc.id})`;
    document.getElementById('amc-modal-type').value = amc.contractType || 'Comprehensive Solar O&M';
    document.getElementById('amc-modal-title').value = amc.title || '';
    document.getElementById('amc-modal-fee').value = amc.annualFee || 0;
    document.getElementById('amc-modal-freq').value = amc.billingFrequency || 'Quarterly';
    document.getElementById('amc-modal-status').value = amc.status || 'Active';
    document.getElementById('amc-modal-start').value = amc.startDate || '';
    document.getElementById('amc-modal-end').value = amc.endDate || '';
    document.getElementById('amc-modal-billing').value = amc.nextBillingDate || '';
    document.getElementById('amc-modal-terms').value = amc.terms || '';
    document.getElementById('modal-amc-contract').classList.remove('hidden');
  }

  saveAmcFromModal() {
    const title = document.getElementById('amc-modal-title').value.trim();
    const siteId = document.getElementById('amc-modal-site-id').value;
    const fee = Number(document.getElementById('amc-modal-fee').value);
    const organizationId = document.getElementById('amc-modal-org-id').value || null;

    if (!title || !siteId || !fee) {
      showToast('Contract Title, Facility Site, and Annual Fee are required.', 'error');
      return;
    }

    const amcData = {
      id: document.getElementById('amc-modal-id').value || null,
      organizationId,
      siteId,
      contractType: document.getElementById('amc-modal-type').value,
      title,
      annualFee: fee,
      billingFrequency: document.getElementById('amc-modal-freq').value,
      status: document.getElementById('amc-modal-status').value,
      startDate: document.getElementById('amc-modal-start').value,
      endDate: document.getElementById('amc-modal-end').value,
      nextBillingDate: document.getElementById('amc-modal-billing').value,
      terms: document.getElementById('amc-modal-terms').value.trim()
    };

    window.cafm.saveAmc(amcData);
    this.closeAllModals();
    showToast(`AMC contract "${title}" saved!`, 'success');
    this.renderCafmTab();
  }

  deleteAmc(id) {
    if (confirm('Delete this AMC contract?')) {
      window.cafm.deleteAmc(id);
      showToast('AMC contract deleted.', 'info');
      this.renderCafmTab();
    }
  }

  createInvoiceFromAmc(amcId) {
    const inv = window.cafm.createInvoiceFromAmc(amcId);
    if (inv) {
      showToast(`Periodic AMC invoice ${inv.id} generated! Value: ${formatINR(inv.amountBilled)}`, 'success');
      this.showView('quotes-invoices', true);
    }
  }

  // --- INSPECTION SLIP CONSOLE ---
  openViewCafmSlipModal(ticketId) {
    const html = window.cafm.generateInspectionSlipHtml(ticketId);
    document.getElementById('cafm-slip-view-content').innerHTML = html;
    document.getElementById('cafm-active-slip-ticket-id').value = ticketId;
    document.getElementById('modal-cafm-slip').classList.remove('hidden');
  }

  printCafmSlip() {
    window.print();
  }

  shareCafmSlipWhatsApp() {
    const ticketId = document.getElementById('cafm-active-slip-ticket-id').value;
    const ticket = window.cafm.getTicketById(ticketId);
    const site = ticket ? window.cafm.getSiteById(ticket.siteId) : null;

    const phone = site && site.contactPhone ? site.contactPhone.replace(/[^0-9]/g, '') : '';
    const text = encodeURIComponent(
      `Hello ${site ? site.clientName : 'Customer'},\n\n` +
      `Here is the verified MaxEco CAFM Service & Inspection Record:\n` +
      `• Record ID: ${ticket ? ticket.id : 'N/A'}\n` +
      `• Facility Premise: ${site ? site.name : 'Client Facility'}\n` +
      `• Service Task: ${ticket ? ticket.title : 'Preventive Maintenance'}\n` +
      `• Status: ${ticket ? ticket.status : 'Inspected'}\n` +
      `• Lead Engineer: ${ticket ? ticket.assignedTech : 'MaxEco Technical Team'}\n\n` +
      `Digitally verified by MaxEco Energy & Tech, Guwahati, Assam.`
    );

    const waUrl = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(waUrl, '_blank');
  }

  // --- CSV EXPORT WRAPPER ---
  exportCafmCsv(type) {
    const ok = window.storage.exportCsv(type);
    if (ok) {
      showToast(`CAFM ${type} exported to CSV successfully!`, 'success');
    } else {
      showToast(`Failed to export ${type}.`, 'error');
    }
  }

  // =========================================================================
  // PHASE 2 OPERATIONS: SPARE PARTS CATALOG & INVENTORY CRUD
  // =========================================================================

  renderCafmParts() {
    const category = document.getElementById('cafm-filter-part-category')?.value || 'all';
    const parts = window.cafm.getPartsCatalog(category);
    const container = document.getElementById('cafm-parts-table-container');
    if (!container) return;

    if (parts.length === 0) {
      container.innerHTML = `<div class="card text-center text-muted" style="padding: 30px;">No spare parts or consumables found in catalog.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="card">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Part ID</th>
                <th>Category</th>
                <th>Component / Consumable Name</th>
                <th>Part Number</th>
                <th style="text-align: right;">Unit Cost (₹)</th>
                <th style="text-align: center;">Stock Qty</th>
                <th>Unit</th>
                <th>Compatible OEM</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${parts.map(p => {
                let catBadge = '';
                if (p.category === 'Solar EPC') catBadge = '<span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b;">☀️ Solar EPC</span>';
                else if (p.category === 'IT Infrastructure') catBadge = '<span class="badge" style="background: rgba(2, 132, 199, 0.15); color: #0284c7;">🖥️ IT Infra</span>';
                else if (p.category === 'Electrical & CEIG') catBadge = '<span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">⚡ Electrical</span>';
                else catBadge = '<span class="badge" style="background: rgba(148, 163, 184, 0.15); color: #cbd5e1;">🏢 Utility</span>';

                return `
                  <tr>
                    <td class="font-mono font-bold" style="font-size: 12px; color: var(--solar-amber);">${p.id}</td>
                    <td>${catBadge}</td>
                    <td><strong>${p.name}</strong></td>
                    <td class="font-mono" style="font-size: 11px; color: var(--sky-blue);">${p.partNumber || '—'}</td>
                    <td class="font-mono" style="text-align: right; font-weight: 700; color: #10b981;">${formatINR(p.unitCost)}</td>
                    <td style="text-align: center; font-weight: 700;">
                      <span class="badge" style="background: ${p.stockQuantity > 5 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; color: ${p.stockQuantity > 5 ? '#10b981' : '#ef4444'};">
                        ${p.stockQuantity}
                      </span>
                    </td>
                    <td style="font-size: 11.5px; color: var(--text-muted);">${p.unitMeasure || 'Nos'}</td>
                    <td style="font-size: 11.5px; color: var(--text-secondary);">${p.compatibleOem || 'Standard Universal'}</td>
                    <td style="text-align: right;">
                      <div class="flex gap-1" style="justify-content: flex-end;">
                        <button class="btn btn-secondary btn-sm" onclick="app.openEditPartModal('${p.id}')">✏️ Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="app.deletePartFromCatalog('${p.id}')">✕</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  openAddPartModal() {
    document.getElementById('part-modal-id').value = '';
    document.getElementById('modal-cafm-part-title').textContent = '📦 Register Spare Part / Consumable';
    document.getElementById('part-modal-name').value = '';
    document.getElementById('part-modal-category').value = 'Solar EPC';
    document.getElementById('part-modal-num').value = '';
    document.getElementById('part-modal-cost').value = '';
    document.getElementById('part-modal-qty').value = '10';
    document.getElementById('part-modal-unit').value = 'Nos';
    document.getElementById('part-modal-oem').value = '';
    document.getElementById('modal-cafm-part').classList.remove('hidden');
  }

  openEditPartModal(id) {
    const part = window.cafm.getPartById(id);
    if (!part) return;

    document.getElementById('part-modal-id').value = part.id;
    document.getElementById('modal-cafm-part-title').textContent = `📦 Edit Spare Part (${part.id})`;
    document.getElementById('part-modal-name').value = part.name || '';
    document.getElementById('part-modal-category').value = part.category || 'Solar EPC';
    document.getElementById('part-modal-num').value = part.partNumber || '';
    document.getElementById('part-modal-cost').value = part.unitCost || 0;
    document.getElementById('part-modal-qty').value = part.stockQuantity || 0;
    document.getElementById('part-modal-unit').value = part.unitMeasure || 'Nos';
    document.getElementById('part-modal-oem').value = part.compatibleOem || '';
    document.getElementById('modal-cafm-part').classList.remove('hidden');
  }

  savePartFromModal() {
    const name = document.getElementById('part-modal-name').value.trim();
    const cost = Number(document.getElementById('part-modal-cost').value);

    if (!name || isNaN(cost) || cost < 0) {
      showToast('Part Name and a valid Unit Cost are required.', 'error');
      return;
    }

    const partData = {
      id: document.getElementById('part-modal-id').value || null,
      name,
      category: document.getElementById('part-modal-category').value,
      partNumber: document.getElementById('part-modal-num').value.trim(),
      unitCost: cost,
      stockQuantity: Number(document.getElementById('part-modal-qty').value) || 0,
      unitMeasure: document.getElementById('part-modal-unit').value,
      compatibleOem: document.getElementById('part-modal-oem').value.trim()
    };

    window.cafm.savePart(partData);
    this.closeAllModals();
    showToast(`Spare part "${name}" saved to catalog!`, 'success');
    this.renderCafmParts();
  }

  deletePartFromCatalog(id) {
    if (confirm('Delete this spare part from inventory catalog?')) {
      window.cafm.deletePart(id);
      showToast('Spare part deleted.', 'info');
      this.renderCafmParts();
    }
  }

  // =========================================================================
  // PHASE 2 OPERATIONS: TECHNICIAN WORKSPACE (CHECKLIST, PARTS, APPROVALS, NOTIFS)
  // =========================================================================

  openTicketOperationsModal(ticketId) {
    const ticket = window.cafm.getTicketById(ticketId);
    if (!ticket) return;

    document.getElementById('ticket-op-active-id').value = ticketId;
    document.getElementById('ticket-op-modal-header').textContent = `🛠️ Operations Workspace — ${ticket.id}`;
    document.getElementById('ticket-op-modal-sub').textContent = `${ticket.title} • Assigned: ${ticket.assignedTech || 'Unassigned'}`;

    const site = window.cafm.getSiteById(ticket.siteId);
    const asset = window.cafm.getAssetById(ticket.assetId);
    const sla = window.cafm.calculateTicketSla(ticket);

    const metaBar = document.getElementById('ticket-op-meta-bar');
    if (metaBar) {
      metaBar.innerHTML = `
        <div style="font-size: 12px; line-height: 1.4;">
          <div>🏢 Premise: <strong>${site ? site.name : 'Client Site'}</strong> (${site ? site.clientName : ''})</div>
          <div>⚙️ Asset: <strong>${asset ? asset.name : 'General Facility Asset'}</strong> ${asset && asset.serialNumber ? `(SN: ${asset.serialNumber})` : ''}</div>
        </div>
        <div style="font-size: 12px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <span class="badge" style="background: ${ticket.priority === 'Critical' ? '#ef4444' : '#3b82f6'}; color: #fff;">Priority: ${ticket.priority}</span>
          <span class="badge" style="background: ${sla.slaStatus === 'Breached' ? '#ef4444' : (sla.slaStatus === 'Met' ? '#10b981' : 'rgba(2, 132, 199, 0.15)')}; color: ${sla.slaStatus === 'Breached' || sla.slaStatus === 'Met' ? '#fff' : '#0284c7'}; font-weight: 700;">
            ${sla.slaStatus === 'Breached' ? `⚠️ SLA Breached (${sla.elapsedHours.toFixed(1)}h)` : (sla.slaStatus === 'Met' ? `✅ SLA Met (${sla.elapsedHours.toFixed(1)}h)` : `⏱️ SLA Target: ${sla.targetHours}h (${sla.remainingHours.toFixed(1)}h left)`)}
          </span>
          <span class="badge" style="background: #10b981; color: #fff;">Status: ${ticket.status}</span>
        </div>
      `;
    }

    // Populate parts catalog dropdown
    const partSelect = document.getElementById('ticket-op-part-select');
    if (partSelect) {
      const catalog = window.cafm.getPartsCatalog();
      partSelect.innerHTML = `
        <option value="">-- Choose Component from Catalog --</option>
        ${catalog.map(c => `
          <option value="${c.id}" data-cost="${c.unitCost}" data-partno="${c.partNumber || ''}">
            ${c.name} (₹${c.unitCost} / ${c.unitMeasure || 'Nos'})
          </option>
        `).join('')}
      `;
    }

    this.setTicketOpSubTab('checklist');
    document.getElementById('modal-ticket-operations').classList.remove('hidden');
  }

  setTicketOpSubTab(tab) {
    const tabs = ['checklist', 'parts', 'approval', 'notifs'];
    tabs.forEach(t => {
      const btn = document.getElementById(`top-tab-btn-${t}`);
      const view = document.getElementById(`top-view-${t}`);
      if (btn) {
        if (t === tab) btn.className = 'btn btn-primary btn-sm';
        else btn.className = 'btn btn-secondary btn-sm';
      }
      if (view) {
        if (t === tab) view.classList.remove('hidden');
        else view.classList.add('hidden');
      }
    });

    if (tab === 'checklist') this.renderTicketOpChecklist();
    else if (tab === 'parts') this.renderTicketOpParts();
    else if (tab === 'approval') this.renderTicketOpApproval();
    else if (tab === 'notifs') this.renderTicketOpNotifs();
  }

  // --- SUBTAB 1: CHECKLIST HANDLERS ---
  renderTicketOpChecklist() {
    const ticketId = document.getElementById('ticket-op-active-id').value;
    const items = window.cafm.getTicketChecklist(ticketId);
    const container = document.getElementById('ticket-op-checklist-container');
    const progEl = document.getElementById('ticket-op-checklist-progress');
    if (!container) return;

    const completed = items.filter(i => i.completed).length;
    const total = items.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (progEl) {
      progEl.innerHTML = `
        <span style="color: ${percent === 100 ? '#10b981' : 'var(--solar-amber)'}; font-weight: 700;">
          ${completed} of ${total} Steps Completed (${percent}%)
        </span>
      `;
    }

    if (items.length === 0) {
      container.innerHTML = `<div class="text-muted" style="font-size: 12px; padding: 12px; text-align: center;">No inspection checklist assigned to this ticket. Use box below to add steps.</div>`;
      return;
    }

    container.innerHTML = items.map(item => `
      <div style="background: #0f172a; border: 1px solid ${item.completed ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)'}; border-radius: 6px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
          <input type="checkbox" id="chk-${item.id}" ${item.completed ? 'checked' : ''} onchange="app.toggleTicketChecklistItem('${item.id}')" style="width: 17px; height: 17px; cursor: pointer;">
          <label for="chk-${item.id}" style="margin: 0; font-size: 13px; font-weight: ${item.completed ? '400' : '600'}; color: ${item.completed ? 'var(--text-muted)' : 'var(--text-main)'}; text-decoration: ${item.completed ? 'line-through' : 'none'}; cursor: pointer;">
            ${item.task}
          </label>
        </div>
        <div style="font-size: 11px; text-align: right; color: var(--text-muted);">
          ${item.completed ? `<span style="color: #10b981;">✓ Verified by ${item.checkedBy || 'Technician'}</span><div style="font-size: 10px;">${item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</div>` : '<span style="color: #94a3b8;">Pending Check</span>'}
        </div>
      </div>
    `).join('');
  }

  toggleTicketChecklistItem(itemId) {
    const ticketId = document.getElementById('ticket-op-active-id').value;
    const currentUser = window.storage.getCurrentUser()?.name || 'Field Lead';
    window.cafm.toggleChecklistItem(ticketId, itemId, currentUser);
    this.renderTicketOpChecklist();
    this.renderCafmTickets();
  }

  addCustomChecklistTask() {
    const ticketId = document.getElementById('ticket-op-active-id').value;
    const input = document.getElementById('ticket-op-new-task-input');
    const taskText = input.value.trim();
    if (!taskText) {
      showToast('Enter task or inspection step text.', 'error');
      return;
    }
    const currentUser = window.storage.getCurrentUser()?.name || 'Field Lead';
    window.cafm.addChecklistItem(ticketId, taskText, currentUser);
    input.value = '';
    this.renderTicketOpChecklist();
    this.renderCafmTickets();
    showToast('Inspection step added to checklist!', 'success');
  }

  // --- SUBTAB 2: PARTS & CONSUMABLES HANDLERS ---
  renderTicketOpParts() {
    const ticketId = document.getElementById('ticket-op-active-id').value;
    const parts = window.cafm.getTicketParts(ticketId);
    const tbody = document.getElementById('ticket-op-parts-tbody');
    const sumEl = document.getElementById('ticket-op-parts-summary');
    if (!tbody) return;

    let totalCost = 0;
    let billableCost = 0;

    if (parts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 16px;">No spare parts or consumables logged for this work order.</td></tr>`;
    } else {
      tbody.innerHTML = parts.map(p => {
        totalCost += p.total;
        if (p.billable) billableCost += p.total;

        return `
          <tr>
            <td><strong>${p.partName}</strong></td>
            <td class="font-mono" style="font-size: 11px; color: var(--sky-blue);">${p.partNumber || '—'}</td>
            <td style="text-align: center; font-weight: 700;">${p.quantity}</td>
            <td class="font-mono" style="text-align: right;">${formatINR(p.unitCost)}</td>
            <td class="font-mono font-bold" style="text-align: right; color: #10b981;">${formatINR(p.total)}</td>
            <td style="text-align: center;">
              <span class="badge" style="background: ${p.billable ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'}; color: ${p.billable ? '#f59e0b' : '#10b981'}; font-weight: 700; font-size: 10px;">
                ${p.billable ? '💳 Billable' : '🛡️ AMC Free'}
              </span>
            </td>
            <td style="text-align: right;">
              <button class="btn btn-danger btn-sm" onclick="app.deletePartFromTicket('${p.id}')" style="padding: 2px 8px; font-size: 11px;">✕</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    if (sumEl) {
      sumEl.innerHTML = `
        <span>Total Consumed: <strong style="color: #f8fafc;">${formatINR(totalCost)}</strong></span>
        ${billableCost > 0 ? `<span style="margin-left: 12px; color: var(--solar-amber); font-weight: 800;">Billable to Client: ${formatINR(billableCost)}</span>` : '<span style="margin-left: 12px; color: #10b981;">(100% AMC Covered)</span>'}
      `;
    }
  }

  onTicketPartSelected() {
    const sel = document.getElementById('ticket-op-part-select');
    const opt = sel.options[sel.selectedIndex];
    if (opt && opt.dataset.cost) {
      document.getElementById('ticket-op-part-cost').value = opt.dataset.cost;
    }
  }

  logPartToTicket() {
    const ticketId = document.getElementById('ticket-op-active-id').value;
    const sel = document.getElementById('ticket-op-part-select');
    const opt = sel.options[sel.selectedIndex];
    const qty = Number(document.getElementById('ticket-op-part-qty').value);
    const unitCost = Number(document.getElementById('ticket-op-part-cost').value);
    const billable = document.getElementById('ticket-op-part-billable').checked;

    if (!sel.value || qty <= 0 || isNaN(unitCost) || unitCost < 0) {
      showToast('Select a component, valid quantity, and unit cost.', 'error');
      return;
    }

    const partData = {
      partId: sel.value,
      partName: opt.textContent.split('(')[0].trim(),
      partNumber: opt.dataset.partno || '',
      quantity: qty,
      unitCost,
      billable
    };

    window.cafm.addPartToTicket(ticketId, partData);
    showToast(`Part logged to ticket!`, 'success');
    this.renderTicketOpParts();
    this.renderCafmTickets();
  }

  deletePartFromTicket(partUsageId) {
    const ticketId = document.getElementById('ticket-op-active-id').value;
    window.cafm.removePartFromTicket(ticketId, partUsageId);
    showToast('Part removed from ticket.', 'info');
    this.renderTicketOpParts();
    this.renderCafmTickets();
  }

  // --- SUBTAB 3: CLIENT APPROVAL & BILLING ---
  renderTicketOpApproval() {
    const ticketId = document.getElementById('ticket-op-active-id').value;
    const ticket = window.cafm.getTicketById(ticketId);
    if (!ticket) return;

    const appr = ticket.chargeableWork || {};
    document.getElementById('ticket-op-appr-status').value = appr.approvalStatus || 'N/A';
    document.getElementById('ticket-op-appr-amount').value = appr.estimatedAmount || 0;
    document.getElementById('ticket-op-appr-desc').value = appr.scopeDescription || '';
    document.getElementById('ticket-op-appr-by').value = appr.approvedBy || '';
    document.getElementById('ticket-op-appr-ref').value = appr.approvalReference || '';

    const invBtn = document.getElementById('ticket-op-invoice-btn');
    if (invBtn) {
      if (appr.invoiceId) {
        invBtn.textContent = `✅ Invoiced: ${appr.invoiceId} (View)`;
        invBtn.className = 'btn btn-secondary btn-sm';
        invBtn.disabled = false;
      } else if (appr.approvalStatus === 'Approved') {
        invBtn.textContent = '🧾 Generate Customer Invoice Draft';
        invBtn.className = 'btn btn-primary btn-sm';
        invBtn.disabled = false;
      } else {
        invBtn.textContent = '🧾 Generate Invoice (Requires Approval)';
        invBtn.className = 'btn btn-secondary btn-sm';
        invBtn.disabled = true;
      }
    }
  }

  saveTicketApprovalStatus() {
    const ticketId = document.getElementById('ticket-op-active-id').value;
    const status = document.getElementById('ticket-op-appr-status').value;
    const amount = Number(document.getElementById('ticket-op-appr-amount').value) || 0;
    const desc = document.getElementById('ticket-op-appr-desc').value.trim();
    const approvedBy = document.getElementById('ticket-op-appr-by').value.trim();
    const ref = document.getElementById('ticket-op-appr-ref').value.trim();

    window.cafm.updateChargeableWorkApproval(ticketId, status, approvedBy, ref, desc, amount);
    showToast(`Client authorization status updated to: ${status}!`, 'success');
    this.renderTicketOpApproval();
    this.renderCafmTickets();
  }

  convertTicketToInvoice() {
    const ticketId = document.getElementById('ticket-op-active-id').value;
    const ticket = window.cafm.getTicketById(ticketId);
    if (ticket && ticket.chargeableWork && ticket.chargeableWork.invoiceId) {
      this.closeAllModals();
      this.showView('quotes-invoices', true);
      return;
    }

    const invoice = window.cafm.convertChargeableWorkToInvoice(ticketId);
    if (invoice) {
      showToast(`Tax invoice ${invoice.id} created for ₹${invoice.amountBilled}!`, 'success');
      this.renderTicketOpApproval();
      this.renderCafmTickets();
    }
  }

  // --- SUBTAB 4: CUSTOMER NOTIFICATIONS ---
  renderTicketOpNotifs() {
    const ticketId = document.getElementById('ticket-op-active-id').value;
    const ticket = window.cafm.getTicketById(ticketId);
    const container = document.getElementById('ticket-op-notifs-container');
    if (!container || !ticket) return;

    const notifs = ticket.customerNotifications || [];
    if (notifs.length === 0) {
      container.innerHTML = `<div class="text-muted" style="font-size: 12px; padding: 12px; text-align: center;">No customer notifications sent yet. Use composer below to dispatch updates.</div>`;
      return;
    }

    container.innerHTML = notifs.map(n => `
      <div style="background: #0f172a; border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 14px;">${n.channel === 'WhatsApp' ? '💬' : '✉️'}</span>
            <strong style="font-size: 12px; color: ${n.channel === 'WhatsApp' ? '#10b981' : '#0284c7'};">${n.channel} Dispatch</strong>
            <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; font-size: 10px;">${n.status}</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted);">${new Date(n.sentAt).toLocaleString('en-IN')}</div>
        </div>
        <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; white-space: pre-wrap; font-family: sans-serif; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px;">${n.message}</div>
      </div>
    `).join('');
  }

  fillDefaultTicketNotificationMessage() {
    const ticketId = document.getElementById('ticket-op-active-id').value;
    const ticket = window.cafm.getTicketById(ticketId);
    const site = ticket ? window.cafm.getSiteById(ticket.siteId) : null;
    if (!ticket) return;

    const msg = `Dear ${site ? site.clientName : 'Customer'},\n\nUpdate on Service Ticket ${ticket.id} (${ticket.title}):\n• Facility: ${site ? site.name : 'Premises'}\n• Current Status: ${ticket.status}\n• Lead Engineer: ${ticket.assignedTech || 'MaxEco Field Operations'}\n\nOur team is actively maintaining scheduled SLA and safety compliance.\n\nWarm regards,\nMaxEco Energy & Tech, Guwahati, Assam`;
    document.getElementById('ticket-op-notif-msg').value = msg;
  }

  dispatchTicketCustomerNotification() {
    const ticketId = document.getElementById('ticket-op-active-id').value;
    const channel = document.getElementById('ticket-op-notif-channel').value;
    const msg = document.getElementById('ticket-op-notif-msg').value.trim();

    const res = window.cafm.sendCustomerNotification(ticketId, channel, msg);
    if (res && res.whatsappUrl) {
      window.open(res.whatsappUrl, '_blank');
    }

    document.getElementById('ticket-op-notif-msg').value = '';
    showToast(`${channel} notification logged and dispatched!`, 'success');
    this.renderTicketOpNotifs();
  }

  // =========================================================================
  // PHASE 2 OPERATIONS: A4 TECHNICAL SERVICE REPORT & AMC VISITS CONSOLE
  // =========================================================================

  openServiceReportModal(ticketId) {
    const html = window.cafm.generateServiceReportHtml(ticketId);
    const content = document.getElementById('cafm-service-report-view-content');
    if (content) content.innerHTML = html;
    document.getElementById('modal-cafm-service-report').classList.remove('hidden');
  }

  printCurrentTicketServiceReport() {
    const ticketId = document.getElementById('ticket-op-active-id').value;
    if (ticketId) {
      this.openServiceReportModal(ticketId);
    }
  }

  triggerServiceReportPrint() {
    window.print();
  }

  openAmcVisitsModal(amcId) {
    const amc = window.cafm.getAmcById(amcId);
    if (!amc) return;

    const compliance = window.cafm.getAmcVisitCompliance(amcId);
    const site = window.cafm.getSiteById(amc.siteId);

    document.getElementById('modal-amc-visits-title').textContent = `📅 Preventive Maintenance Visits: ${amc.title}`;
    
    const summaryBar = document.getElementById('amc-visits-summary-bar');
    if (summaryBar) {
      summaryBar.innerHTML = `
        <div>
          <div style="font-size: 13px; font-weight: 700; color: #f8fafc;">${amc.title} (${amc.id})</div>
          <div style="font-size: 11.5px; color: #94a3b8;">${site ? site.name : 'Client Site'} • Frequency: ${amc.billingFrequency}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 13px; font-weight: 800; color: ${compliance.compliancePercent === 100 ? '#10b981' : 'var(--solar-amber)'};">
            Fulfillment: ${compliance.completedVisits} / ${compliance.totalVisits} (${compliance.compliancePercent}%)
          </div>
          <div style="font-size: 11px; color: #94a3b8;">Emergency SLA: &lt; ${amc.emergencyResponseSlaHours || 4}h response</div>
        </div>
      `;
    }

    const tbody = document.getElementById('amc-visits-table-body');
    if (tbody) {
      const visits = amc.scheduledVisits || [];
      if (visits.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 16px;">No visits scheduled.</td></tr>`;
      } else {
        tbody.innerHTML = visits.map((v, idx) => `
          <tr>
            <td style="font-weight: 700;">${idx + 1}</td>
            <td style="font-weight: 600;">${v.quarter}</td>
            <td>${formatDate(v.targetDate)}</td>
            <td>${v.completedDate ? formatDate(v.completedDate) : '<span class="text-muted">—</span>'}</td>
            <td>
              <span class="badge" style="background: ${v.status === 'Completed' ? '#10b981' : '#f59e0b'}; color: ${v.status === 'Completed' ? '#fff' : '#0f172a'}; font-weight: 700;">
                ${v.status}
              </span>
            </td>
            <td>${v.technician || 'MaxEco Field Team'}</td>
            <td class="font-mono" style="font-size: 11px; color: var(--solar-amber);">${v.ticketId || '—'}</td>
          </tr>
        `).join('');
      }
    }

    document.getElementById('modal-amc-visits').classList.remove('hidden');
  }

  // =========================================================================
  // CAFM PHASE 3: SPACES & HIERARCHICAL SPACE MANAGEMENT
  // =========================================================================

  renderCafmSpaces() {
    const siteFilter = window.cafm.currentSiteFilter || 'all';
    const spaces = window.cafm.getFacilitySpaces('all', siteFilter);
    const fpContainer = document.getElementById('cafm-spaces-floorplan-container');
    if (fpContainer) {
      fpContainer.innerHTML = window.cafm.generateFloorPlanSvg(siteFilter);
    }

    const tableBody = document.getElementById('cafm-spaces-table-body');
    if (!tableBody) return;

    if (spaces.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding: 24px;">No spaces mapped yet. Click "➕ Add Space Zone" above to register building floors and rooms.</td></tr>`;
      return;
    }

    const allAssets = window.storage.getFacilityAssets() || [];

    tableBody.innerHTML = spaces.map(sp => {
      const linked = allAssets.filter(a => a.spaceId === sp.id || (a.location && a.location.toLowerCase().includes((sp.roomNumberOrName || '').toLowerCase())));
      const site = window.cafm.getSiteById(sp.siteId);
      const siteName = site ? site.name : sp.siteId;

      return `
        <tr>
          <td class="font-mono" style="font-weight: 700; color: #38bdf8;">${sp.id}</td>
          <td>
            <strong>${sp.buildingName || 'Main Facility'}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">${sp.floorLevel || 'Ground Level'} • ${siteName}</div>
          </td>
          <td>
            <strong>${sp.roomNumberOrName}</strong>
            ${sp.notes ? `<div style="font-size: 10.5px; color: var(--text-secondary);">${sp.notes}</div>` : ''}
          </td>
          <td style="font-weight: 600;">${(sp.areaSqFt || 0).toLocaleString('en-IN')} sq ft</td>
          <td>
            <span class="badge" style="background: rgba(56, 189, 248, 0.12); color: #38bdf8; font-size: 11px;">
              ${sp.occupancyType || 'General'}
            </span>
          </td>
          <td>
            <span class="badge" style="background: rgba(167, 139, 250, 0.15); color: #a78bfa; font-size: 11px;">
              ⚙️ ${linked.length} Assets
            </span>
          </td>
          <td>
            <span class="badge" style="background: ${sp.status === 'Operational' ? '#10b981' : '#f59e0b'}; color: ${sp.status === 'Operational' ? '#fff' : '#0f172a'}; font-weight: 700;">
              ${sp.status || 'Operational'}
            </span>
          </td>
          <td style="text-align: right;">
            <div class="flex gap-1 justify-end">
              <button class="btn btn-secondary btn-sm" onclick="app.openEditSpaceModal('${sp.id}')" title="Edit Space">✏️</button>
              <button class="btn btn-secondary btn-sm" onclick="app.deleteSpace('${sp.id}')" title="Delete Space" style="color: var(--accent-rose);">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  openAddSpaceModal(preselectedSiteId = '') {
    document.getElementById('space-modal-id').value = '';
    document.getElementById('modal-space-title').textContent = '📐 Add Facility Space Zone';
    
    const orgs = window.cafm.getOrganizations();
    const orgSel = document.getElementById('space-modal-org');
    if (orgSel) {
      orgSel.innerHTML = orgs.map(o => `<option value="${o.id}">🏢 ${o.name}</option>`).join('');
    }
    
    this.populateSpaceSitesDropdown(orgs[0]?.id || '', preselectedSiteId);
    document.getElementById('space-modal-building').value = '';
    document.getElementById('space-modal-floor').value = 'Rooftop Level';
    document.getElementById('space-modal-room').value = '';
    document.getElementById('space-modal-area').value = '';
    document.getElementById('space-modal-type').value = 'Solar PV Installation';
    document.getElementById('space-modal-status').value = 'Operational';
    document.getElementById('space-modal-notes').value = '';

    document.getElementById('modal-cafm-space').classList.remove('hidden');
  }

  openEditSpaceModal(id) {
    const sp = window.cafm.getSpaceById(id);
    if (!sp) return;

    document.getElementById('space-modal-id').value = sp.id;
    document.getElementById('modal-space-title').textContent = `📐 Edit Space Zone: ${sp.id}`;

    const orgs = window.cafm.getOrganizations();
    const orgSel = document.getElementById('space-modal-org');
    if (orgSel) {
      orgSel.innerHTML = orgs.map(o => `<option value="${o.id}" ${o.id === sp.organizationId ? 'selected' : ''}>🏢 ${o.name}</option>`).join('');
    }

    this.populateSpaceSitesDropdown(sp.organizationId || orgs[0]?.id || '', sp.siteId);
    document.getElementById('space-modal-building').value = sp.buildingName || '';
    document.getElementById('space-modal-floor').value = sp.floorLevel || '';
    document.getElementById('space-modal-room').value = sp.roomNumberOrName || '';
    document.getElementById('space-modal-area').value = sp.areaSqFt || '';
    document.getElementById('space-modal-type').value = sp.occupancyType || 'Solar PV Installation';
    document.getElementById('space-modal-status').value = sp.status || 'Operational';
    document.getElementById('space-modal-notes').value = sp.notes || '';

    document.getElementById('modal-cafm-space').classList.remove('hidden');
  }

  onSpaceOrgChange(orgId) {
    this.populateSpaceSitesDropdown(orgId);
  }

  populateSpaceSitesDropdown(orgId, preselectedSiteId = '') {
    const sites = window.cafm.getSites('all', orgId);
    const siteSel = document.getElementById('space-modal-site');
    if (siteSel) {
      if (sites.length === 0) {
        siteSel.innerHTML = '<option value="">No sites for this organization</option>';
      } else {
        siteSel.innerHTML = sites.map(s => `<option value="${s.id}" ${s.id === preselectedSiteId ? 'selected' : ''}>📍 ${s.name} (${s.id})</option>`).join('');
      }
    }
  }

  saveSpaceFromModal() {
    const id = document.getElementById('space-modal-id').value;
    const orgId = document.getElementById('space-modal-org').value;
    const siteId = document.getElementById('space-modal-site').value;
    const buildingName = document.getElementById('space-modal-building').value.trim();
    const floorLevel = document.getElementById('space-modal-floor').value.trim();
    const roomNumberOrName = document.getElementById('space-modal-room').value.trim();
    const areaSqFt = Number(document.getElementById('space-modal-area').value) || 0;
    const occupancyType = document.getElementById('space-modal-type').value;
    const status = document.getElementById('space-modal-status').value;
    const notes = document.getElementById('space-modal-notes').value.trim();

    if (!roomNumberOrName || !buildingName) {
      showToast('Please enter both building name and room/zone name.', 'error');
      return;
    }

    const spaceObj = {
      ...(id ? { id } : {}),
      organizationId: orgId,
      siteId: siteId,
      buildingName,
      floorLevel,
      roomNumberOrName,
      areaSqFt,
      occupancyType,
      status,
      notes
    };

    window.cafm.saveFacilitySpace(spaceObj, 'Admin', 'Facility Manager');
    this.closeAllModals();
    this.renderCafmSpaces();
    this.renderCafmTab();
    showToast(id ? 'Space updated successfully!' : 'Facility space registered successfully!', 'success');
  }

  deleteSpace(id) {
    if (confirm(`Are you sure you want to delete space ${id}?`)) {
      window.cafm.deleteFacilitySpace(id, 'Admin', 'Facility Manager');
      this.renderCafmSpaces();
      this.renderCafmTab();
      showToast(`Space ${id} removed.`, 'info');
    }
  }

  // =========================================================================
  // CAFM PHASE 3: ENERGY & UTILITY READINGS
  // =========================================================================

  renderCafmUtility() {
    const siteFilter = window.cafm.currentSiteFilter || 'all';
    const readings = window.cafm.getUtilityReadings('all', siteFilter);
    const metrics = window.cafm.calculateUtilityMetrics(siteFilter);

    // Update KPI displays
    const elImport = document.getElementById('utility-kpi-import');
    if (elImport) elImport.textContent = `${metrics.totalImportKwh.toLocaleString('en-IN')} kWh`;

    const elExport = document.getElementById('utility-kpi-export');
    if (elExport) elExport.textContent = `${metrics.totalExportKwh.toLocaleString('en-IN')} kWh`;

    const elOffset = document.getElementById('utility-kpi-offset');
    if (elOffset) elOffset.textContent = `${metrics.solarOffsetRatio}%`;

    const elPf = document.getElementById('utility-kpi-pf');
    if (elPf) {
      elPf.textContent = metrics.averagePowerFactor.toFixed(2);
      elPf.style.color = metrics.powerFactorAlert ? '#ef4444' : '#a78bfa';
    }

    const banner = document.getElementById('utility-pf-penalty-banner');
    if (banner) {
      if (metrics.powerFactorAlert) banner.classList.remove('hidden');
      else banner.classList.add('hidden');
    }

    const tableBody = document.getElementById('cafm-utility-table-body');
    if (!tableBody) return;

    if (readings.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="10" class="text-center text-muted" style="padding: 24px;">No utility readings logged yet. Click "➕ Log Monthly Reading" to track APDCL grid draw vs solar export.</td></tr>`;
      return;
    }

    tableBody.innerHTML = readings.map(r => {
      const site = window.cafm.getSiteById(r.siteId);
      const isPfLow = Number(r.powerFactor) < 0.90;

      return `
        <tr>
          <td class="font-mono" style="font-weight: 700; color: #38bdf8;">${r.id}</td>
          <td style="font-weight: 600;">${r.billingMonth}</td>
          <td>
            <strong>${site ? site.name : r.siteId}</strong>
            <div style="font-size: 11px; font-family: monospace; color: var(--text-muted);">Consumer: ${r.discomConsumerNo || '—'}</div>
          </td>
          <td style="font-weight: 600; color: #38bdf8;">${(r.gridUnitsImportedKwh || 0).toLocaleString('en-IN')}</td>
          <td style="font-weight: 600; color: var(--solar-amber);">${(r.solarUnitsExportedKwh || 0).toLocaleString('en-IN')}</td>
          <td style="font-weight: 700;">${(r.netUnitsBilledKwh || 0).toLocaleString('en-IN')}</td>
          <td>
            <span class="badge" style="background: ${isPfLow ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)'}; color: ${isPfLow ? '#ef4444' : '#10b981'}; font-weight: 700;">
              ${r.powerFactor || 0.98} ${isPfLow ? '⚠️ Surcharge' : '✓ Normal'}
            </span>
          </td>
          <td style="font-weight: 600;">${r.peakDemandKva || '—'}</td>
          <td style="font-weight: 700; color: #10b981;">₹${(r.totalBillAmountInr || 0).toLocaleString('en-IN')}</td>
          <td style="text-align: right;">
            <button class="btn btn-secondary btn-sm" onclick="app.deleteUtilityReading('${r.id}')" title="Delete Reading" style="color: var(--accent-rose);">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  openAddUtilityModal(preselectedSiteId = '') {
    document.getElementById('utility-modal-id').value = '';
    document.getElementById('modal-utility-title').textContent = '⚡ Log APDCL Electricity & Solar Reading';

    const orgs = window.cafm.getOrganizations();
    const orgSel = document.getElementById('utility-modal-org');
    if (orgSel) {
      orgSel.innerHTML = orgs.map(o => `<option value="${o.id}">🏢 ${o.name}</option>`).join('');
    }

    this.populateUtilitySitesDropdown(orgs[0]?.id || '', preselectedSiteId);
    document.getElementById('utility-modal-consumer-no').value = '012000045678';
    document.getElementById('utility-modal-month').value = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    document.getElementById('utility-modal-import').value = '';
    document.getElementById('utility-modal-export').value = '';
    document.getElementById('utility-modal-demand').value = '';
    document.getElementById('utility-modal-pf').value = '0.98';
    document.getElementById('utility-modal-bill').value = '';
    document.getElementById('utility-modal-notes').value = '';
    this.updateUtilityPreview();

    document.getElementById('modal-cafm-utility').classList.remove('hidden');
  }

  onUtilityOrgChange(orgId) {
    this.populateUtilitySitesDropdown(orgId);
  }

  populateUtilitySitesDropdown(orgId, preselectedSiteId = '') {
    const sites = window.cafm.getSites('all', orgId);
    const siteSel = document.getElementById('utility-modal-site');
    if (siteSel) {
      if (sites.length === 0) {
        siteSel.innerHTML = '<option value="">No sites for this organization</option>';
      } else {
        siteSel.innerHTML = sites.map(s => `<option value="${s.id}" ${s.id === preselectedSiteId ? 'selected' : ''}>📍 ${s.name} (${s.id})</option>`).join('');
      }
    }
  }

  updateUtilityPreview() {
    const imp = Number(document.getElementById('utility-modal-import')?.value) || 0;
    const exp = Number(document.getElementById('utility-modal-export')?.value) || 0;
    const net = Math.max(0, imp - exp);
    const offset = (imp + exp) > 0 ? Math.round((exp / (imp + exp)) * 100) : 0;

    const elNet = document.getElementById('utility-preview-net');
    if (elNet) elNet.textContent = `${net.toLocaleString('en-IN')} kWh`;

    const elOff = document.getElementById('utility-preview-offset');
    if (elOff) elOff.textContent = `${offset}%`;
  }

  saveUtilityFromModal() {
    const orgId = document.getElementById('utility-modal-org').value;
    const siteId = document.getElementById('utility-modal-site').value;
    const discomConsumerNo = document.getElementById('utility-modal-consumer-no').value.trim();
    const billingMonth = document.getElementById('utility-modal-month').value.trim();
    const gridUnitsImportedKwh = Number(document.getElementById('utility-modal-import').value) || 0;
    const solarUnitsExportedKwh = Number(document.getElementById('utility-modal-export').value) || 0;
    const peakDemandKva = Number(document.getElementById('utility-modal-demand').value) || 0;
    const powerFactor = Number(document.getElementById('utility-modal-pf').value) || 0.98;
    const totalBillAmountInr = Number(document.getElementById('utility-modal-bill').value) || 0;
    const notes = document.getElementById('utility-modal-notes').value.trim();

    if (!billingMonth || !discomConsumerNo) {
      showToast('Please enter billing month and APDCL consumer number.', 'error');
      return;
    }

    const reading = {
      organizationId: orgId,
      siteId: siteId,
      billingMonth,
      discomConsumerNo,
      gridUnitsImportedKwh,
      solarUnitsExportedKwh,
      netUnitsBilledKwh: Math.max(0, gridUnitsImportedKwh - solarUnitsExportedKwh),
      peakDemandKva,
      powerFactor,
      totalBillAmountInr,
      notes
    };

    window.cafm.saveUtilityReading(reading, 'Admin', 'Facility Manager');
    this.closeAllModals();
    this.renderCafmUtility();
    this.renderCafmTab();
    showToast('APDCL utility log recorded successfully!', 'success');
  }

  deleteUtilityReading(id) {
    if (confirm(`Delete utility reading ${id}?`)) {
      window.cafm.deleteUtilityReading(id, 'Admin', 'Facility Manager');
      this.renderCafmUtility();
      this.renderCafmTab();
      showToast(`Reading ${id} deleted.`, 'info');
    }
  }

  // =========================================================================
  // CAFM PHASE 3: VENDORS & CONTRACTORS
  // =========================================================================

  renderCafmVendors() {
    const vendors = window.cafm.getFacilityVendors('all');
    const tableBody = document.getElementById('cafm-vendors-table-body');
    if (!tableBody) return;

    if (vendors.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="10" class="text-center text-muted" style="padding: 24px;">No contractors or vendors registered yet. Click "➕ Register Contractor" to add service partners.</td></tr>`;
      return;
    }

    tableBody.innerHTML = vendors.map(v => {
      const stars = '★'.repeat(Math.min(5, Math.max(1, v.rating || 4))) + '☆'.repeat(5 - Math.min(5, Math.max(1, v.rating || 4)));
      const rawPhone = (v.phone || '').replace(/[^0-9]/g, '');
      const waPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
      const waMsg = encodeURIComponent(`Hello ${v.contactPerson || v.name}, contacting from MaxEco Energy & Tech regarding urgent facility work order under SLA (${v.slaResponseHours || 4}h target).`);
      const waUrl = `https://wa.me/${waPhone}?text=${waMsg}`;

      return `
        <tr>
          <td class="font-mono" style="font-weight: 700; color: #38bdf8;">${v.id}</td>
          <td>
            <strong>${v.name}</strong>
            ${v.notes ? `<div style="font-size: 11px; color: var(--text-muted);">${v.notes}</div>` : ''}
          </td>
          <td>
            <span class="badge" style="background: rgba(16, 185, 129, 0.12); color: #10b981; font-weight: 700;">
              ${v.tradeCategory}
            </span>
          </td>
          <td><strong>${v.contactPerson || '—'}</strong></td>
          <td>
            <div>${v.phone || '—'}</div>
            <a href="${waUrl}" target="_blank" class="btn btn-whatsapp btn-sm" style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px; font-size: 10.5px; margin-top: 3px;">
              💬 1-Click WhatsApp
            </a>
          </td>
          <td class="font-mono" style="font-size: 11px;">${v.gstin || '—'}</td>
          <td style="color: #f59e0b; font-size: 13px;">${stars}</td>
          <td>
            <span class="badge" style="background: rgba(139, 92, 246, 0.15); color: #a78bfa; font-weight: 700;">
              ⏱️ ${v.slaResponseHours || 4} Hours
            </span>
          </td>
          <td>
            <span class="badge" style="background: ${v.status === 'Active' ? '#10b981' : '#64748b'}; color: #fff; font-weight: 700;">
              ${v.status || 'Active'}
            </span>
          </td>
          <td style="text-align: right;">
            <div class="flex gap-1 justify-end">
              <button class="btn btn-secondary btn-sm" onclick="app.openEditVendorModal('${v.id}')" title="Edit Vendor">✏️</button>
              <button class="btn btn-secondary btn-sm" onclick="app.deleteVendor('${v.id}')" title="Delete Vendor" style="color: var(--accent-rose);">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  openAddVendorModal() {
    document.getElementById('vendor-modal-id').value = '';
    document.getElementById('modal-vendor-title').textContent = '🤝 Register Contractor / Facility Vendor';
    document.getElementById('vendor-modal-name').value = '';
    document.getElementById('vendor-modal-trade').value = 'Solar PV & Inverter Maintenance';
    document.getElementById('vendor-modal-contact').value = '';
    document.getElementById('vendor-modal-phone').value = '';
    document.getElementById('vendor-modal-email').value = '';
    document.getElementById('vendor-modal-gstin').value = '';
    document.getElementById('vendor-modal-rating').value = '4';
    document.getElementById('vendor-modal-sla').value = '4';
    document.getElementById('vendor-modal-notes').value = '';

    document.getElementById('modal-cafm-vendor').classList.remove('hidden');
  }

  openEditVendorModal(id) {
    const v = window.cafm.getVendorById(id);
    if (!v) return;

    document.getElementById('vendor-modal-id').value = v.id;
    document.getElementById('modal-vendor-title').textContent = `🤝 Edit Contractor: ${v.name}`;
    document.getElementById('vendor-modal-name').value = v.name || '';
    document.getElementById('vendor-modal-trade').value = v.tradeCategory || 'Solar PV & Inverter Maintenance';
    document.getElementById('vendor-modal-contact').value = v.contactPerson || '';
    document.getElementById('vendor-modal-phone').value = v.phone || '';
    document.getElementById('vendor-modal-email').value = v.email || '';
    document.getElementById('vendor-modal-gstin').value = v.gstin || '';
    document.getElementById('vendor-modal-rating').value = v.rating || '4';
    document.getElementById('vendor-modal-sla').value = v.slaResponseHours || '4';
    document.getElementById('vendor-modal-notes').value = v.notes || '';

    document.getElementById('modal-cafm-vendor').classList.remove('hidden');
  }

  saveVendorFromModal() {
    const id = document.getElementById('vendor-modal-id').value;
    const name = document.getElementById('vendor-modal-name').value.trim();
    const tradeCategory = document.getElementById('vendor-modal-trade').value;
    const contactPerson = document.getElementById('vendor-modal-contact').value.trim();
    const phone = document.getElementById('vendor-modal-phone').value.trim();
    const email = document.getElementById('vendor-modal-email').value.trim();
    const gstin = document.getElementById('vendor-modal-gstin').value.trim();
    const rating = Number(document.getElementById('vendor-modal-rating').value) || 4;
    const slaResponseHours = Number(document.getElementById('vendor-modal-sla').value) || 4;
    const notes = document.getElementById('vendor-modal-notes').value.trim();

    if (!name || !phone) {
      showToast('Please enter contractor company name and phone number.', 'error');
      return;
    }

    const vendor = {
      ...(id ? { id } : {}),
      name,
      tradeCategory,
      contactPerson,
      phone,
      email,
      gstin,
      status: 'Active',
      rating,
      slaResponseHours,
      notes
    };

    window.cafm.saveFacilityVendor(vendor, 'Admin', 'Facility Manager');
    this.closeAllModals();
    this.renderCafmVendors();
    this.renderCafmTab();
    showToast(id ? 'Contractor profile updated!' : 'Contractor registered successfully!', 'success');
  }

  deleteVendor(id) {
    if (confirm(`Remove contractor ${id}?`)) {
      window.cafm.deleteFacilityVendor(id, 'Admin', 'Facility Manager');
      this.renderCafmVendors();
      this.renderCafmTab();
      showToast(`Contractor ${id} removed.`, 'info');
    }
  }

  // =========================================================================
  // CAFM PHASE 3: STATUTORY & CEIG COMPLIANCE
  // =========================================================================

  renderCafmCompliance() {
    const alerts = window.cafm.getComplianceAlerts(60);
    const alertsContainer = document.getElementById('cafm-compliance-alerts-container');
    if (alertsContainer) {
      const urgentAlerts = alerts.filter(a => a.isExpired || a.isDueSoon);
      if (urgentAlerts.length > 0) {
        alertsContainer.innerHTML = `
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: var(--radius-md); padding: 14px 18px;">
            <div style="font-weight: 800; color: #ef4444; font-size: 14px; margin-bottom: 8px;">
              ⚠️ Statutory Inspection &amp; CEIG Renewal Action Required (${urgentAlerts.length} Certificates Pending)
            </div>
            <div class="grid grid-cols-2 gap-2">
              ${urgentAlerts.map(a => `
                <div style="background: rgba(15, 23, 42, 0.7); padding: 8px 12px; border-radius: 4px; border-left: 3px solid ${a.isExpired ? '#ef4444' : '#f59e0b'}; font-size: 11.5px;">
                  <strong style="color: #f8fafc;">${a.complianceType}</strong>
                  <div style="color: #94a3b8; font-size: 10.5px;">Cert No: ${a.certificateNumber || '—'} • ${a.inspectingAuthority}</div>
                  <div style="color: ${a.isExpired ? '#ef4444' : '#f59e0b'}; font-weight: 700; margin-top: 2px;">
                    ${a.isExpired ? `EXPIRED (${Math.abs(a.daysLeft)} days ago)` : `Expires in ${a.daysLeft} days (${a.expiryDate})`}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else {
        alertsContainer.innerHTML = `
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: var(--radius-md); padding: 12px 16px; font-size: 12px; color: #10b981;">
            ✓ All statutory CEIG, APDCL, and Fire Safety inspection certificates are valid and up to date.
          </div>
        `;
      }
    }

    const tableBody = document.getElementById('cafm-compliance-table-body');
    if (!tableBody) return;

    if (alerts.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="10" class="text-center text-muted" style="padding: 24px;">No compliance certificates logged yet. Click "➕ Register Certificate" to record CEIG, APDCL, and Fire NOC records.</td></tr>`;
      return;
    }

    tableBody.innerHTML = alerts.map(c => {
      let badgeStyle = 'background: #10b981; color: #fff;';
      let badgeText = `${c.daysLeft} Days Left`;
      if (c.isExpired) {
        badgeStyle = 'background: #ef4444; color: #fff;';
        badgeText = 'Expired';
      } else if (c.isDueSoon) {
        badgeStyle = 'background: #f59e0b; color: #0f172a;';
        badgeText = `Due Soon (${c.daysLeft}d)`;
      }

      return `
        <tr>
          <td class="font-mono" style="font-weight: 700; color: #38bdf8;">${c.id}</td>
          <td>
            <strong>${c.complianceType}</strong>
          </td>
          <td class="font-mono" style="font-size: 11px; font-weight: 600;">${c.certificateNumber || '—'}</td>
          <td style="font-size: 11.5px;">${c.inspectingAuthority || '—'}</td>
          <td>${c.issueDate || '—'}</td>
          <td style="font-weight: 600;">${c.expiryDate || '—'}</td>
          <td>
            <span class="badge" style="${badgeStyle} font-weight: 700; font-size: 10.5px;">
              ${badgeText}
            </span>
          </td>
          <td style="font-size: 11px;">${c.frequencyMonths ? `${c.frequencyMonths} Mos` : '—'}</td>
          <td style="font-size: 10.5px; color: var(--text-secondary); max-width: 220px;">${c.remarks || ''}</td>
          <td style="text-align: right;">
            <button class="btn btn-secondary btn-sm" onclick="app.deleteCompliance('${c.id}')" title="Delete Record" style="color: var(--accent-rose);">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  openAddComplianceModal(preselectedSiteId = '') {
    document.getElementById('compliance-modal-id').value = '';
    document.getElementById('modal-compliance-title').textContent = '📜 Register Statutory Compliance Record';

    const orgs = window.cafm.getOrganizations();
    const orgSel = document.getElementById('compliance-modal-org');
    if (orgSel) {
      orgSel.innerHTML = orgs.map(o => `<option value="${o.id}">🏢 ${o.name}</option>`).join('');
    }

    this.populateComplianceSitesDropdown(orgs[0]?.id || '', preselectedSiteId);
    document.getElementById('compliance-modal-type').value = 'CEIG Electrical Safety Certificate';
    document.getElementById('compliance-modal-cert-no').value = '';
    document.getElementById('compliance-modal-authority').value = 'Chief Electrical Inspectorate, Govt. of Assam';
    document.getElementById('compliance-modal-issue-date').value = new Date().toISOString().slice(0, 10);
    
    const exp = new Date();
    exp.setFullYear(exp.getFullYear() + 3);
    document.getElementById('compliance-modal-expiry-date').value = exp.toISOString().slice(0, 10);
    document.getElementById('compliance-modal-frequency').value = '36';
    document.getElementById('compliance-modal-remarks').value = '';

    document.getElementById('modal-cafm-compliance').classList.remove('hidden');
  }

  onComplianceOrgChange(orgId) {
    this.populateComplianceSitesDropdown(orgId);
  }

  populateComplianceSitesDropdown(orgId, preselectedSiteId = '') {
    const sites = window.cafm.getSites('all', orgId);
    const siteSel = document.getElementById('compliance-modal-site');
    if (siteSel) {
      if (sites.length === 0) {
        siteSel.innerHTML = '<option value="">No sites for this organization</option>';
      } else {
        siteSel.innerHTML = sites.map(s => `<option value="${s.id}" ${s.id === preselectedSiteId ? 'selected' : ''}>📍 ${s.name} (${s.id})</option>`).join('');
      }
    }
  }

  saveComplianceFromModal() {
    const orgId = document.getElementById('compliance-modal-org').value;
    const siteId = document.getElementById('compliance-modal-site').value;
    const complianceType = document.getElementById('compliance-modal-type').value;
    const certificateNumber = document.getElementById('compliance-modal-cert-no').value.trim();
    const inspectingAuthority = document.getElementById('compliance-modal-authority').value.trim();
    const issueDate = document.getElementById('compliance-modal-issue-date').value;
    const expiryDate = document.getElementById('compliance-modal-expiry-date').value;
    const frequencyMonths = Number(document.getElementById('compliance-modal-frequency').value) || 12;
    const remarks = document.getElementById('compliance-modal-remarks').value.trim();

    if (!certificateNumber || !expiryDate) {
      showToast('Please enter certificate number and expiry date.', 'error');
      return;
    }

    const rec = {
      organizationId: orgId,
      siteId: siteId,
      complianceType,
      certificateNumber,
      inspectingAuthority,
      issueDate,
      expiryDate,
      status: 'Valid',
      frequencyMonths,
      remarks
    };

    window.cafm.saveComplianceRecord(rec, 'Admin', 'Facility Manager');
    this.closeAllModals();
    this.renderCafmCompliance();
    this.renderCafmTab();
    showToast('Statutory certificate registered successfully!', 'success');
  }

  deleteCompliance(id) {
    if (confirm(`Delete compliance record ${id}?`)) {
      window.cafm.deleteComplianceRecord(id, 'Admin', 'Facility Manager');
      this.renderCafmCompliance();
      this.renderCafmTab();
      showToast(`Record ${id} removed.`, 'info');
    }
  }
}

// Global bootstrap
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
});
