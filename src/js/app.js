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
      if (e.key === 'Escape') this.closeAllModals();
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeAllModals();
      });
    });
  }

  handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const privateViews = ['dashboard', 'leads', 'quotes-invoices', 'finance', 'projects', 'settings', 'solar-feasibility'];

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
  }

  // --- RENDER PRIVATE VIEWS ---
  renderPrivateView(view) {
    if (view === 'dashboard') this.renderDashboardTab();
    else if (view === 'leads') this.renderLeadsTab();
    else if (view === 'quotes-invoices') this.renderQuotesInvoicesTab();
    else if (view === 'finance') this.renderFinanceTab();
    else if (view === 'projects') this.renderProjectsTab();
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
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderQuotesInvoicesTab() {
    const quotes = window.storage.getQuotations();
    const invoices = window.storage.getInvoices();

    // Quotes Table
    const quotesBody = document.getElementById('quotes-table-body');
    if (quotes.length === 0) {
      quotesBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding: 20px;">No quotations recorded yet.</td></tr>';
    } else {
      quotesBody.innerHTML = quotes.map(q => `
        <tr>
          <td><strong>${q.id}</strong><br><small class="text-muted">${formatDate(q.date)}</small></td>
          <td>${q.clientName}<br><small class="text-secondary">${q.service}</small></td>
          <td><strong>${formatINR(q.totalAmount)}</strong></td>
          <td>${formatINR(q.directCostEstimate)}<br><small class="text-emerald">Margin: ${formatINR(q.projectedMargin)} (${q.marginPercent || 0}%)</small></td>
          <td><span class="badge ${q.status === 'Accepted' ? 'badge-won' : 'badge-proposal'}">${q.status}</span></td>
          <td>
            <div class="flex gap-2">
              <button class="btn btn-secondary btn-sm" onclick="app.convertQuoteToInvoice('${q.id}')">Convert to Invoice</button>
              <button class="btn btn-danger btn-sm" onclick="app.deleteQuotation('${q.id}')">✕</button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    // Invoices Table
    const invoicesBody = document.getElementById('invoices-table-body');
    const today = new Date().toISOString().slice(0, 10);
    if (invoices.length === 0) {
      invoicesBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted" style="padding: 20px;">No invoices issued yet.</td></tr>';
    } else {
      invoicesBody.innerHTML = invoices.map(inv => {
        const outstanding = (Number(inv.amountBilled) || 0) - (Number(inv.amountCollected) || 0);
        const isOverdue = outstanding > 0 && inv.dueDate && inv.dueDate < today;
        let badgeClass = 'badge-new';
        if (inv.status === 'Paid') badgeClass = 'badge-won';
        else if (isOverdue) badgeClass = 'badge-lost';

        return `
          <tr>
            <td><strong>${inv.id}</strong><br><small class="text-muted">${formatDate(inv.date)}</small></td>
            <td>${inv.clientName}<br><small class="text-secondary">${inv.service}</small></td>
            <td><strong>${formatINR(inv.amountBilled)}</strong></td>
            <td>
              <span class="text-emerald"><strong>${formatINR(inv.amountCollected)}</strong></span><br>
              <small class="${outstanding > 0 ? 'text-amber' : 'text-muted'}">Due: ${formatINR(outstanding)}</small>
            </td>
            <td>
              <span class="${isOverdue ? 'text-rose' : ''}">${formatDate(inv.dueDate)}</span>
              ${isOverdue ? '<br><small class="text-rose">OVERDUE</small>' : ''}
            </td>
            <td><span class="badge ${badgeClass}">${inv.status}</span></td>
            <td>
              <div class="flex gap-2">
                ${outstanding > 0 ? `<button class="btn btn-primary btn-sm" onclick="app.openRecordPaymentModal('${inv.id}')">Record Payment</button>` : `<span class="text-emerald text-sm">Settled</span>`}
              </div>
            </td>
          </tr>
        `;
      }).join('');
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
          <td><button class="btn btn-danger btn-sm" onclick="app.deleteExpense('${exp.id}')">✕</button></td>
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
          <td><button class="btn btn-danger btn-sm" onclick="app.deleteDrawing('${d.id}')">✕</button></td>
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

  renderSettingsTab() {
    const settings = window.storage.getSettings();
    document.getElementById('setting-company-name').value = settings.companyName || '';
    document.getElementById('setting-phone').value = settings.contactPhone || '';
    document.getElementById('setting-email').value = settings.contactEmail || '';
    document.getElementById('setting-whatsapp').value = settings.whatsappNumber || '';
    document.getElementById('setting-tax-rate').value = settings.taxReserveRate || 18;
    document.getElementById('setting-admin-pin').value = settings.adminPin || 'maxeco2026';
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

  openAddExpenseModal() {
    document.getElementById('exp-category').value = 'Operating Overhead';
    document.getElementById('exp-desc').value = '';
    document.getElementById('exp-amount').value = '';
    document.getElementById('exp-paidto').value = '';
    document.getElementById('exp-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('exp-project').value = '';
    document.getElementById('modal-expense').classList.remove('hidden');
  }

  saveExpenseFromModal() {
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

    window.storage.saveExpense({
      category,
      description,
      amount,
      paidTo: paidTo || 'Vendor / Self',
      date,
      linkedProject: linkedProject || null,
      paymentMethod: 'UPI'
    });

    this.closeAllModals();
    showToast(`Expense recorded: ₹${amount.toLocaleString('en-IN')}`, 'success');
    this.renderFinanceTab();
  }

  openAddDrawingModal() {
    document.getElementById('drw-amount').value = '';
    document.getElementById('drw-purpose').value = 'Founder personal living allowance';
    document.getElementById('drw-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('modal-drawing').classList.remove('hidden');
  }

  saveDrawingFromModal() {
    const amount = Number(document.getElementById('drw-amount').value);
    const purpose = document.getElementById('drw-purpose').value.trim();
    const date = document.getElementById('drw-date').value;

    if (!amount || amount <= 0) {
      showToast('Please enter valid withdrawal amount.', 'error');
      return;
    }

    window.storage.saveDrawing({
      amount,
      purpose,
      date,
      account: 'Personal Bank Account'
    });

    this.closeAllModals();
    showToast(`Personal drawing logged: ₹${amount.toLocaleString('en-IN')}`, 'info');
    this.renderFinanceTab();
  }

  openAddQuotationModal() {
    document.getElementById('quote-client').value = '';
    const presetSelect = document.getElementById('quote-service-preset');
    if (presetSelect) presetSelect.value = '';
    document.getElementById('quote-service').value = '';
    document.getElementById('quote-amount').value = '';
    document.getElementById('quote-cost').value = '';
    document.getElementById('quote-terms').value = '15% advance with order, 45% upon module delivery, 25% upon mounting, 15% upon commissioning.';
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
    }
  }

  saveQuotationFromModal() {
    const clientName = document.getElementById('quote-client').value.trim();
    const service = document.getElementById('quote-service').value.trim();
    const totalAmount = Number(document.getElementById('quote-amount').value) || 0;
    const directCostEstimate = Number(document.getElementById('quote-cost').value) || 0;
    const terms = document.getElementById('quote-terms').value.trim();

    if (!clientName || !totalAmount) {
      showToast('Please provide Client Name and Total Amount.', 'error');
      return;
    }

    const projectedMargin = totalAmount - directCostEstimate;
    const marginPercent = totalAmount > 0 ? Math.round((projectedMargin / totalAmount) * 1000) / 10 : 0;

    window.storage.saveQuotation({
      clientName,
      service,
      totalAmount,
      directCostEstimate,
      projectedMargin,
      marginPercent,
      terms,
      status: 'Sent'
    });

    this.closeAllModals();
    showToast(`Quotation created for ${clientName}`, 'success');
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
      status: 'Sent'
    });

    quote.status = 'Accepted';
    window.storage.saveQuotation(quote);

    showToast(`Invoice ${invoice.id} created from quotation!`, 'success');
    this.renderQuotesInvoicesTab();
  }

  openLeadToQuoteModal(leadId) {
    const lead = window.storage.getLeads().find(l => l.id === leadId);
    if (!lead) return;

    document.getElementById('quote-client').value = lead.name;
    document.getElementById('quote-service').value = lead.service;
    document.getElementById('quote-amount').value = lead.estimatedValue || '';
    document.getElementById('quote-cost').value = Math.round((lead.estimatedValue || 0) * 0.8);
    document.getElementById('modal-quotation').classList.remove('hidden');
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

    window.storage.saveSettings({
      companyName,
      contactPhone,
      contactEmail,
      whatsappNumber,
      taxReserveRate,
      adminPin
    });

    showToast('System settings saved successfully!', 'success');
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
    const waUrl = window.solarCalculator.generateWhatsAppEnquiryUrl(result, settings.whatsappNumber || '919876543210');
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

    const waLink = `https://wa.me/${settings.whatsappNumber || '919876543210'}?text=${waText}`;

    showToast('Enquiry received! Opening WhatsApp to connect directly...', 'success');
    window.open(waLink, '_blank');

    // Reset form
    document.getElementById('public-contact-form').reset();
  }
}

// Global bootstrap
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
});
