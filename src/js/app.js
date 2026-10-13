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
              <button class="btn btn-secondary btn-sm" onclick="app.viewQuotationFormat('${q.id}')" title="View & Print Official Proposal Format">📄 Proposal</button>
              <button class="btn btn-secondary btn-sm" onclick="app.convertQuoteToInvoice('${q.id}')">Convert to Invoice</button>
              <button class="btn btn-secondary btn-sm" onclick="app.openEditQuotationModal('${q.id}')">✏️ Edit</button>
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
                <button class="btn btn-secondary btn-sm" onclick="app.viewInvoiceFormat('${inv.id}')" title="View & Print Official Invoice Format">📄 Format</button>
                ${outstanding > 0 ? `<button class="btn btn-primary btn-sm" onclick="app.openRecordPaymentModal('${inv.id}')">Record Payment</button>` : `<span class="text-emerald text-sm">Settled</span>`}
                <button class="btn btn-secondary btn-sm" onclick="app.openEditInvoiceModal('${inv.id}')">✏️ Edit</button>
                <button class="btn btn-danger btn-sm" onclick="app.deleteInvoice('${inv.id}')">✕</button>
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

  // --- QUOTATION CONTROLS ---
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
    const editId = document.getElementById('quote-edit-id').value.trim();
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

    const quoteData = {
      clientName,
      service,
      totalAmount,
      directCostEstimate,
      projectedMargin,
      marginPercent,
      terms
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

    document.getElementById('quote-edit-id').value = '';
    const titleEl = document.getElementById('quote-modal-title');
    if (titleEl) titleEl.textContent = 'Create Formal Quotation';
    const btnEl = document.getElementById('quote-modal-btn');
    if (btnEl) btnEl.textContent = 'Save Quotation';
    document.getElementById('quote-client').value = lead.name;
    document.getElementById('quote-service').value = lead.service;
    document.getElementById('quote-amount').value = lead.estimatedValue || '';
    document.getElementById('quote-cost').value = Math.round((lead.estimatedValue || 0) * 0.8);
    document.getElementById('modal-quotation').classList.remove('hidden');
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
    document.getElementById('modal-invoice').classList.remove('hidden');
  }

  saveInvoiceFromModal() {
    const editId = document.getElementById('invoice-edit-id').value.trim();
    const clientName = document.getElementById('invoice-client').value.trim();
    const service = document.getElementById('invoice-service').value.trim();
    const amountBilled = Number(document.getElementById('invoice-billed').value) || 0;
    const amountCollected = Number(document.getElementById('invoice-collected').value) || 0;
    const dueDate = document.getElementById('invoice-due-date').value;
    const status = document.getElementById('invoice-status').value;
    const clientAddress = document.getElementById('invoice-address') ? document.getElementById('invoice-address').value.trim() : '';
    const clientGstin = document.getElementById('invoice-gstin') ? document.getElementById('invoice-gstin').value.trim() : '';
    const invoiceType = document.getElementById('invoice-type') ? document.getElementById('invoice-type').value : 'TAX INVOICE';
    const hsnSac = document.getElementById('invoice-hsn') ? document.getElementById('invoice-hsn').value.trim() : '';
    const terms = document.getElementById('invoice-notes') ? document.getElementById('invoice-notes').value.trim() : '';

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
      terms
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
    } else if (type === 'expense') {
      items = window.storage.getExpenses().map(e => ({ id: e.id, label: `[${e.id}] ${e.description} — ${formatINR(e.amount)} (${e.category})` }));
    } else if (type === 'drawing') {
      items = window.storage.getDrawings().map(d => ({ id: d.id, label: `[${d.id}] ${d.purpose} — ${formatINR(d.amount)} (${formatDate(d.date)})` }));
    } else if (type === 'solar') {
      items = window.storage.getSolarProjects().map(p => ({ id: p.id, label: `[${p.id}] ${p.clientName} (${p.systemCapacityKwp} kWp) — ${formatINR(p.totalContractValue)}` }));
    } else if (type === 'it') {
      items = window.storage.getItProjects().map(p => ({ id: p.id, label: `[${p.id}] ${p.clientName} — ${formatINR(p.contractValue)}` }));
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
    } else if (type === 'expense') {
      this.openEditExpenseModal(id);
    } else if (type === 'drawing') {
      this.openEditDrawingModal(id);
    } else if (type === 'solar') {
      this.openEditSolarProjectModal(id);
    } else if (type === 'it') {
      this.openEditItProjectModal(id);
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
    } else if (type === 'expense') {
      items = window.storage.getExpenses().map(e => ({ id: e.id, label: `[${e.id}] ${e.description} — ${formatINR(e.amount)} (${e.category})` }));
    } else if (type === 'drawing') {
      items = window.storage.getDrawings().map(d => ({ id: d.id, label: `[${d.id}] ${d.purpose} — ${formatINR(d.amount)} (${formatDate(d.date)})` }));
    } else if (type === 'solar') {
      items = window.storage.getSolarProjects().map(p => ({ id: p.id, label: `[${p.id}] ${p.clientName} (${p.systemCapacityKwp} kWp) — ${formatINR(p.totalContractValue)}` }));
    } else if (type === 'it') {
      items = window.storage.getItProjects().map(p => ({ id: p.id, label: `[${p.id}] ${p.clientName} — ${formatINR(p.contractValue)}` }));
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
    } else if (type === 'expense') {
      this.deleteExpense(id);
    } else if (type === 'drawing') {
      this.deleteDrawing(id);
    } else if (type === 'solar') {
      this.deleteSolarProject(id);
    } else if (type === 'it') {
      this.deleteItProject(id);
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
}

// Global bootstrap
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
});
