// MaxEco Local-First Data Storage & Persistence Controller
// Zero-cost, 100% offline-capable, runs on browser localStorage

const STORAGE_KEY = 'maxeco_os_database_v1';

class StorageController {
  constructor() {
    this.init();
  }

  init() {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      const seed = (typeof initialSeedData !== 'undefined') ? initialSeedData : 
                   ((typeof window !== 'undefined' && window.initialSeedData) ? window.initialSeedData : 
                   ((typeof global !== 'undefined' && global.initialSeedData) ? global.initialSeedData : null));
      if (seed) {
        this.saveStore(JSON.parse(JSON.stringify(seed)));
      } else {
        this.saveStore({
          settings: {
            companyName: "MaxEco Energy & Tech",
            location: "Maligaon, Guwahati, Assam, Pin - 781011",
            contactPhone: "+91 99544 93909",
            contactEmail: "maxecoenergyit@gmail.com",
            whatsappNumber: "919954493909",
            adminPin: "maxeco2026",
            currencySymbol: "₹",
            taxReserveRate: 18,
            solarTariffCommercial: 7.85,
            solarTariffDomestic: 6.20,
            solarGenPerKwp: 120,
            bankAccountName: "Tamal Roy",
            bankName: "Punjab National Bank",
            bankAccountNo: "4589000100072219",
            bankIfscCode: "PUNB0458900",
            bankBranch: "Maligaon, Guwahati",
            bankAccountType: "Saving Account",
            paymentQrPath: "assets/payment-qr.png"
          },
          leads: [],
          quotations: [],
          invoices: [],
          expenses: [],
          drawings: [],
          solarProjects: [],
          itProjects: [],
          procurements: [],
          workOrders: [],
          payments: [],
          facilitySites: [],
          facilityAssets: [],
          serviceTickets: [],
          amcContracts: [],
          cafmOrganizations: [],
          cafmAuditLog: []
        });
      }
    } else {
      // Automatic update if previously cached with placeholder contacts or missing ERP modules
      try {
        const seed = (typeof initialSeedData !== 'undefined') ? initialSeedData : 
                     ((typeof window !== 'undefined' && window.initialSeedData) ? window.initialSeedData : 
                     ((typeof global !== 'undefined' && global.initialSeedData) ? global.initialSeedData : null));
        const parsed = JSON.parse(existing);
        let updated = false;

        if (parsed && parsed.settings && (parsed.settings.contactEmail === 'contact@maxeco.in' || parsed.settings.contactPhone === '+91 98765 43210')) {
          parsed.settings.location = "Maligaon, Guwahati, Assam, Pin - 781011";
          parsed.settings.contactPhone = "+91 99544 93909";
          parsed.settings.contactEmail = "maxecoenergyit@gmail.com";
          parsed.settings.whatsappNumber = "919954493909";
          updated = true;
        }

        if (parsed && parsed.settings && !parsed.settings.bankAccountNo) {
          parsed.settings.bankAccountName = "Tamal Roy";
          parsed.settings.bankName = "Punjab National Bank";
          parsed.settings.bankAccountNo = "4589000100072219";
          parsed.settings.bankIfscCode = "PUNB0458900";
          parsed.settings.bankBranch = "Maligaon, Guwahati";
          parsed.settings.bankAccountType = "Saving Account";
          parsed.settings.paymentQrPath = "assets/payment-qr.png";
          updated = true;
        }

        // Migrate ERP Operations tables if absent
        if (parsed && (!parsed.procurements || parsed.procurements.length === 0)) {
          parsed.procurements = (seed && seed.procurements) ? JSON.parse(JSON.stringify(seed.procurements)) : [];
          updated = true;
        }
        if (parsed && (!parsed.workOrders || parsed.workOrders.length === 0)) {
          parsed.workOrders = (seed && seed.workOrders) ? JSON.parse(JSON.stringify(seed.workOrders)) : [];
          updated = true;
        }
        if (parsed && (!parsed.payments || parsed.payments.length === 0)) {
          parsed.payments = (seed && seed.payments) ? JSON.parse(JSON.stringify(seed.payments)) : [];
          updated = true;
        }

        // Migrate CAFM Facilities Management tables if absent
        if (parsed && (!parsed.cafmOrganizations || parsed.cafmOrganizations.length === 0)) {
          parsed.cafmOrganizations = (seed && seed.cafmOrganizations) ? JSON.parse(JSON.stringify(seed.cafmOrganizations)) : [];
          updated = true;
        }
        if (parsed && (!parsed.facilitySites || parsed.facilitySites.length === 0)) {
          parsed.facilitySites = (seed && seed.facilitySites) ? JSON.parse(JSON.stringify(seed.facilitySites)) : [];
          updated = true;
        }
        if (parsed && (!parsed.facilityAssets || parsed.facilityAssets.length === 0)) {
          parsed.facilityAssets = (seed && seed.facilityAssets) ? JSON.parse(JSON.stringify(seed.facilityAssets)) : [];
          updated = true;
        }
        if (parsed && (!parsed.serviceTickets || parsed.serviceTickets.length === 0)) {
          parsed.serviceTickets = (seed && seed.serviceTickets) ? JSON.parse(JSON.stringify(seed.serviceTickets)) : [];
          updated = true;
        }
        if (parsed && (!parsed.amcContracts || parsed.amcContracts.length === 0)) {
          parsed.amcContracts = (seed && seed.amcContracts) ? JSON.parse(JSON.stringify(seed.amcContracts)) : [];
          updated = true;
        }
        if (parsed && !parsed.cafmAuditLog) {
          parsed.cafmAuditLog = [];
          updated = true;
        }

        // Backfill organizationId on cached sites if missing
        if (parsed && parsed.facilitySites) {
          parsed.facilitySites.forEach(s => {
            if (!s.organizationId) {
              if (s.id === 'SITE-2026-001') s.organizationId = 'ORG-2026-001';
              else if (s.id === 'SITE-2026-002') s.organizationId = 'ORG-2026-002';
              else if (s.id === 'SITE-2026-003') s.organizationId = 'ORG-2026-003';
              else s.organizationId = 'ORG-2026-001';
              updated = true;
            }
          });
        }

        // Backfill organizationId and QR payload on cached assets if missing
        if (parsed && parsed.facilityAssets) {
          parsed.facilityAssets.forEach(a => {
            if (!a.organizationId) {
              const matchedSite = (parsed.facilitySites || []).find(s => s.id === a.siteId);
              a.organizationId = matchedSite ? matchedSite.organizationId : 'ORG-2026-001';
              updated = true;
            }
            if (!a.qrCodePayload) {
              a.qrCodePayload = `MAXECO-CAFM|${a.organizationId || 'ORG'}|${a.siteId || 'SITE'}|${a.id}|${a.serialNumber || 'SN'}`;
              updated = true;
            }
          });
        }

        if (updated) {
          this.saveStore(parsed);
        }
      } catch (e) {
        console.error('Error parsing existing storage', e);
      }
    }
  }

  getStore() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error reading localStorage', e);
      return null;
    }
  }

  saveStore(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error writing to localStorage', e);
      return false;
    }
  }

  // --- SETTINGS ---
  getSettings() {
    const store = this.getStore();
    return store ? store.settings : {};
  }

  saveSettings(newSettings) {
    const store = this.getStore();
    store.settings = { ...store.settings, ...newSettings };
    this.saveStore(store);
    return store.settings;
  }

  // --- LEADS ---
  getLeads() {
    const store = this.getStore();
    return store && store.leads ? store.leads : [];
  }

  saveLead(lead) {
    const store = this.getStore();
    if (!lead.id) {
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const count = (store.leads.length + 1).toString().padStart(3, '0');
      lead.id = `LEAD-${timestamp}-${count}`;
      lead.createdAt = new Date().toISOString().slice(0, 10);
      store.leads.unshift(lead);
    } else {
      const idx = store.leads.findIndex(l => l.id === lead.id);
      if (idx !== -1) {
        store.leads[idx] = { ...store.leads[idx], ...lead, updatedAt: new Date().toISOString().slice(0, 10) };
      } else {
        store.leads.unshift(lead);
      }
    }
    this.saveStore(store);
    return lead;
  }

  deleteLead(id) {
    const store = this.getStore();
    store.leads = store.leads.filter(l => l.id !== id);
    this.saveStore(store);
  }

  // --- QUOTATIONS ---
  getQuotations() {
    const store = this.getStore();
    return store && store.quotations ? store.quotations : [];
  }

  saveQuotation(quote) {
    const store = this.getStore();
    if (!quote.id) {
      const year = new Date().getFullYear();
      const count = (store.quotations.length + 1).toString().padStart(3, '0');
      quote.id = `QT-${year}-${count}`;
      quote.date = quote.date || new Date().toISOString().slice(0, 10);
      store.quotations.unshift(quote);
    } else {
      const idx = store.quotations.findIndex(q => q.id === quote.id);
      if (idx !== -1) {
        store.quotations[idx] = { ...store.quotations[idx], ...quote };
      } else {
        store.quotations.unshift(quote);
      }
    }
    this.saveStore(store);
    return quote;
  }

  deleteQuotation(id) {
    const store = this.getStore();
    store.quotations = store.quotations.filter(q => q.id !== id);
    this.saveStore(store);
  }

  // --- INVOICES ---
  getInvoices() {
    const store = this.getStore();
    return store && store.invoices ? store.invoices : [];
  }

  saveInvoice(invoice) {
    const store = this.getStore();
    if (!invoice.id) {
      const year = new Date().getFullYear();
      const count = (store.invoices.length + 1).toString().padStart(3, '0');
      invoice.id = `INV-${year}-${count}`;
      invoice.date = invoice.date || new Date().toISOString().slice(0, 10);
      invoice.amountCollected = invoice.amountCollected || 0;
      invoice.status = invoice.amountCollected >= invoice.amountBilled ? 'Paid' : (invoice.amountCollected > 0 ? 'Partially Paid' : 'Sent');
      store.invoices.unshift(invoice);
    } else {
      const idx = store.invoices.findIndex(inv => inv.id === invoice.id);
      if (idx !== -1) {
        store.invoices[idx] = { ...store.invoices[idx], ...invoice };
      } else {
        store.invoices.unshift(invoice);
      }
    }
    this.saveStore(store);
    return invoice;
  }

  recordInvoicePayment(invoiceId, paymentAmount, paymentMethod, referenceNo, paymentDate) {
    const store = this.getStore();
    const invoice = store.invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return null;

    invoice.amountCollected = (Number(invoice.amountCollected) || 0) + Number(paymentAmount);
    invoice.paymentMethod = paymentMethod || 'UPI / Bank Transfer';
    invoice.referenceNo = referenceNo || '';
    invoice.paymentDate = paymentDate || new Date().toISOString().slice(0, 10);

    if (invoice.amountCollected >= invoice.amountBilled) {
      invoice.status = 'Paid';
    } else if (invoice.amountCollected > 0) {
      invoice.status = 'Partially Paid';
    }

    this.saveStore(store);
    return invoice;
  }

  deleteInvoice(id) {
    const store = this.getStore();
    store.invoices = (store.invoices || []).filter(inv => inv.id !== id);
    this.saveStore(store);
  }

  // --- CUSTOMER PAYMENTS & RECEIPTS ---
  getPayments() {
    const store = this.getStore();
    return store && store.payments ? store.payments : [];
  }

  recordCustomerPayment(invoiceId, paymentAmount, paymentMethod, referenceNo, paymentDate, notes) {
    const store = this.getStore();
    if (!store.payments) store.payments = [];
    const invoice = (store.invoices || []).find(inv => inv.id === invoiceId);
    if (!invoice) return null;

    const amount = Number(paymentAmount) || 0;
    invoice.amountCollected = (Number(invoice.amountCollected) || 0) + amount;
    invoice.paymentMethod = paymentMethod || 'UPI / Bank Transfer';
    invoice.referenceNo = referenceNo || '';
    invoice.paymentDate = paymentDate || new Date().toISOString().slice(0, 10);

    if (invoice.amountCollected >= invoice.amountBilled) {
      invoice.status = 'Paid';
    } else if (invoice.amountCollected > 0) {
      invoice.status = 'Partially Paid';
    }

    const year = new Date().getFullYear();
    const count = (store.payments.length + 1).toString().padStart(3, '0');
    const paymentRecord = {
      id: `REC-${year}-${count}`,
      invoiceId: invoice.id,
      clientName: invoice.clientName,
      service: invoice.service,
      amount: amount,
      paymentMethod: invoice.paymentMethod,
      referenceNo: invoice.referenceNo,
      date: invoice.paymentDate,
      balanceRemaining: Math.max(0, invoice.amountBilled - invoice.amountCollected),
      notes: notes || 'Customer payment received and credited.'
    };
    store.payments.unshift(paymentRecord);
    this.saveStore(store);
    return { invoice, paymentRecord };
  }

  deletePayment(id) {
    const store = this.getStore();
    store.payments = (store.payments || []).filter(p => p.id !== id);
    this.saveStore(store);
  }

  // --- EXPENSES ---
  getExpenses() {
    const store = this.getStore();
    return store && store.expenses ? store.expenses : [];
  }

  saveExpense(expense) {
    const store = this.getStore();
    if (!expense.id) {
      const year = new Date().getFullYear();
      const count = (store.expenses.length + 1).toString().padStart(3, '0');
      expense.id = `EXP-${year}-${count}`;
      expense.date = expense.date || new Date().toISOString().slice(0, 10);
      store.expenses.unshift(expense);
    } else {
      const idx = store.expenses.findIndex(e => e.id === expense.id);
      if (idx !== -1) {
        store.expenses[idx] = { ...store.expenses[idx], ...expense };
      } else {
        store.expenses.unshift(expense);
      }
    }
    this.saveStore(store);
    return expense;
  }

  deleteExpense(id) {
    const store = this.getStore();
    store.expenses = store.expenses.filter(e => e.id !== id);
    this.saveStore(store);
  }

  // --- DRAWINGS (FOUNDER LIVING WITHDRAWALS) ---
  getDrawings() {
    const store = this.getStore();
    return store && store.drawings ? store.drawings : [];
  }

  saveDrawing(drawing) {
    const store = this.getStore();
    if (!drawing.id) {
      const year = new Date().getFullYear();
      const count = (store.drawings.length + 1).toString().padStart(3, '0');
      drawing.id = `DRW-${year}-${count}`;
      drawing.date = drawing.date || new Date().toISOString().slice(0, 10);
      store.drawings.unshift(drawing);
    } else {
      const idx = store.drawings.findIndex(d => d.id === drawing.id);
      if (idx !== -1) {
        store.drawings[idx] = { ...store.drawings[idx], ...drawing };
      } else {
        store.drawings.unshift(drawing);
      }
    }
    this.saveStore(store);
    return drawing;
  }

  deleteDrawing(id) {
    const store = this.getStore();
    store.drawings = store.drawings.filter(d => d.id !== id);
    this.saveStore(store);
  }

  // --- SOLAR PROJECTS ---
  getSolarProjects() {
    const store = this.getStore();
    return store && store.solarProjects ? store.solarProjects : [];
  }

  saveSolarProject(project) {
    const store = this.getStore();
    if (!project.id) {
      const year = new Date().getFullYear();
      const count = (store.solarProjects.length + 1).toString().padStart(3, '0');
      project.id = `SOL-${year}-${count}`;
      store.solarProjects.unshift(project);
    } else {
      const idx = store.solarProjects.findIndex(p => p.id === project.id);
      if (idx !== -1) {
        store.solarProjects[idx] = { ...store.solarProjects[idx], ...project };
      } else {
        store.solarProjects.unshift(project);
      }
    }
    this.saveStore(store);
    return project;
  }

  updateSolarMilestone(projectId, milestoneIndex, newStatus) {
    const store = this.getStore();
    const proj = store.solarProjects.find(p => p.id === projectId);
    if (proj && proj.milestones && proj.milestones[milestoneIndex]) {
      proj.milestones[milestoneIndex].status = newStatus;
      this.saveStore(store);
      return proj;
    }
    return null;
  }

  deleteSolarProject(id) {
    const store = this.getStore();
    store.solarProjects = (store.solarProjects || []).filter(p => p.id !== id);
    this.saveStore(store);
  }

  // --- IT & WEB PROJECTS ---
  getItProjects() {
    const store = this.getStore();
    return store && store.itProjects ? store.itProjects : [];
  }

  saveItProject(project) {
    const store = this.getStore();
    if (!project.id) {
      const year = new Date().getFullYear();
      const count = (store.itProjects.length + 1).toString().padStart(3, '0');
      project.id = `IT-${year}-${count}`;
      store.itProjects.unshift(project);
    } else {
      const idx = store.itProjects.findIndex(p => p.id === project.id);
      if (idx !== -1) {
        store.itProjects[idx] = { ...store.itProjects[idx], ...project };
      } else {
        store.itProjects.unshift(project);
      }
    }
    this.saveStore(store);
    return project;
  }

  updateItMilestone(projectId, milestoneIndex, newStatus) {
    const store = this.getStore();
    const proj = store.itProjects.find(p => p.id === projectId);
    if (proj && proj.milestones && proj.milestones[milestoneIndex]) {
      proj.milestones[milestoneIndex].status = newStatus;
      this.saveStore(store);
      return proj;
    }
    return null;
  }

  deleteItProject(id) {
    const store = this.getStore();
    store.itProjects = (store.itProjects || []).filter(p => p.id !== id);
    this.saveStore(store);
  }

  // --- ERP OPERATIONS: MATERIAL PROCUREMENTS (BOM) ---
  getProcurements() {
    const store = this.getStore();
    return store && store.procurements ? store.procurements : [];
  }

  saveProcurement(proc) {
    const store = this.getStore();
    if (!store.procurements) store.procurements = [];
    if (!proc.id) {
      const year = new Date().getFullYear();
      const count = (store.procurements.length + 1).toString().padStart(3, '0');
      proc.id = `PO-${year}-${count}`;
      proc.orderDate = proc.orderDate || new Date().toISOString().slice(0, 10);
      store.procurements.unshift(proc);
    } else {
      const idx = store.procurements.findIndex(p => p.id === proc.id);
      if (idx !== -1) {
        store.procurements[idx] = { ...store.procurements[idx], ...proc };
      } else {
        store.procurements.unshift(proc);
      }
    }
    this.saveStore(store);
    return proc;
  }

  updateProcurementStatus(id, newStatus) {
    const store = this.getStore();
    const item = (store.procurements || []).find(p => p.id === id);
    if (item) {
      item.status = newStatus;
      this.saveStore(store);
      return item;
    }
    return null;
  }

  deleteProcurement(id) {
    const store = this.getStore();
    store.procurements = (store.procurements || []).filter(p => p.id !== id);
    this.saveStore(store);
  }

  // --- ERP OPERATIONS: FIELD WORK ORDERS & CONTRACTOR DISPATCH ---
  getWorkOrders() {
    const store = this.getStore();
    return store && store.workOrders ? store.workOrders : [];
  }

  saveWorkOrder(wo) {
    const store = this.getStore();
    if (!store.workOrders) store.workOrders = [];
    if (!wo.id) {
      const year = new Date().getFullYear();
      const count = (store.workOrders.length + 1).toString().padStart(3, '0');
      wo.id = `WO-${year}-${count}`;
      wo.scheduledDate = wo.scheduledDate || new Date().toISOString().slice(0, 10);
      store.workOrders.unshift(wo);
    } else {
      const idx = store.workOrders.findIndex(w => w.id === wo.id);
      if (idx !== -1) {
        store.workOrders[idx] = { ...store.workOrders[idx], ...wo };
      } else {
        store.workOrders.unshift(wo);
      }
    }
    this.saveStore(store);
    return wo;
  }

  updateWorkOrderStatus(id, newStatus) {
    const store = this.getStore();
    const wo = (store.workOrders || []).find(w => w.id === id);
    if (wo) {
      wo.status = newStatus;
      this.saveStore(store);
      return wo;
    }
    return null;
  }

  deleteWorkOrder(id) {
    const store = this.getStore();
    store.workOrders = (store.workOrders || []).filter(w => w.id !== id);
    this.saveStore(store);
  }

  // --- CAFM: CUSTOMER ORGANIZATIONS (MULTI-TENANT REGISTER) ---
  getOrganizations() {
    const store = this.getStore();
    return store && store.cafmOrganizations ? store.cafmOrganizations : [];
  }

  getOrganizationById(id) {
    const orgs = this.getOrganizations();
    return orgs.find(o => o.id === id) || null;
  }

  saveOrganization(org) {
    const store = this.getStore();
    if (!store.cafmOrganizations) store.cafmOrganizations = [];
    if (!org.id) {
      const year = new Date().getFullYear();
      const count = (store.cafmOrganizations.length + 1).toString().padStart(3, '0');
      org.id = `ORG-${year}-${count}`;
      org.status = org.status || 'Active';
      store.cafmOrganizations.unshift(org);
    } else {
      const idx = store.cafmOrganizations.findIndex(o => o.id === org.id);
      if (idx !== -1) {
        store.cafmOrganizations[idx] = { ...store.cafmOrganizations[idx], ...org };
      } else {
        store.cafmOrganizations.unshift(org);
      }
    }
    this.saveStore(store);
    this.logAuditAction({
      action: org.id ? 'UPDATE_ORGANIZATION' : 'CREATE_ORGANIZATION',
      entityType: 'cafmOrganization',
      entityId: org.id,
      details: `Saved customer organization: ${org.name} (${org.id})`
    });
    return org;
  }

  deleteOrganization(id) {
    const store = this.getStore();
    store.cafmOrganizations = (store.cafmOrganizations || []).filter(o => o.id !== id);
    this.saveStore(store);
    this.logAuditAction({
      action: 'DELETE_ORGANIZATION',
      entityType: 'cafmOrganization',
      entityId: id,
      details: `Deleted customer organization: ${id}`
    });
  }

  // --- CAFM: TENANT-SCOPED QUERIES ---
  getSitesByOrganization(orgId) {
    if (!orgId || orgId === 'all') return this.getFacilitySites();
    return this.getFacilitySites().filter(s => s.organizationId === orgId);
  }

  getAssetsByOrganization(orgId) {
    if (!orgId || orgId === 'all') return this.getFacilityAssets();
    return this.getFacilityAssets().filter(a => a.organizationId === orgId);
  }

  getTicketsByOrganization(orgId) {
    if (!orgId || orgId === 'all') return this.getServiceTickets();
    return this.getServiceTickets().filter(t => t.organizationId === orgId);
  }

  getAmcsByOrganization(orgId) {
    if (!orgId || orgId === 'all') return this.getAmcContracts();
    return this.getAmcContracts().filter(c => c.organizationId === orgId);
  }

  // --- CAFM: AUDIT LOG JOURNAL ---
  logAuditAction(entry) {
    try {
      const store = this.getStore();
      if (!store) return;
      if (!store.cafmAuditLog) store.cafmAuditLog = [];
      const id = `AUD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
      const logItem = {
        id,
        timestamp: new Date().toISOString(),
        user: entry.user || 'Tamal Roy (Admin)',
        role: entry.role || 'Administrator',
        action: entry.action || 'GENERAL_ACTION',
        entityType: entry.entityType || 'system',
        entityId: entry.entityId || '',
        details: entry.details || ''
      };
      store.cafmAuditLog.unshift(logItem);
      // Keep latest 250 log entries to bound storage size
      if (store.cafmAuditLog.length > 250) {
        store.cafmAuditLog = store.cafmAuditLog.slice(0, 250);
      }
      this.saveStore(store);
      return logItem;
    } catch (e) {
      console.warn('Could not record audit log entry:', e);
      return null;
    }
  }

  getAuditLogs() {
    const store = this.getStore();
    return store && store.cafmAuditLog ? store.cafmAuditLog : [];
  }

  // --- CAFM: FACILITY SITES & PREMISES ---
  getFacilitySites() {
    const store = this.getStore();
    return store && store.facilitySites ? store.facilitySites : [];
  }

  saveFacilitySite(site) {
    const store = this.getStore();
    if (!store.facilitySites) store.facilitySites = [];
    if (!site.id) {
      const year = new Date().getFullYear();
      const count = (store.facilitySites.length + 1).toString().padStart(3, '0');
      site.id = `SITE-${year}-${count}`;
      site.createdAt = site.createdAt || new Date().toISOString().slice(0, 10);
      store.facilitySites.unshift(site);
    } else {
      const idx = store.facilitySites.findIndex(s => s.id === site.id);
      if (idx !== -1) {
        store.facilitySites[idx] = { ...store.facilitySites[idx], ...site };
      } else {
        store.facilitySites.unshift(site);
      }
    }
    this.saveStore(store);
    return site;
  }

  deleteFacilitySite(id) {
    const store = this.getStore();
    store.facilitySites = (store.facilitySites || []).filter(s => s.id !== id);
    this.saveStore(store);
  }

  // --- CAFM: FACILITY ASSETS & HARDWARE ---
  getFacilityAssets() {
    const store = this.getStore();
    return store && store.facilityAssets ? store.facilityAssets : [];
  }

  saveFacilityAsset(asset) {
    const store = this.getStore();
    if (!store.facilityAssets) store.facilityAssets = [];
    if (!asset.id) {
      const year = new Date().getFullYear();
      const count = (store.facilityAssets.length + 1).toString().padStart(3, '0');
      asset.id = `AST-${year}-${count}`;
      asset.installDate = asset.installDate || new Date().toISOString().slice(0, 10);
      store.facilityAssets.unshift(asset);
    } else {
      const idx = store.facilityAssets.findIndex(a => a.id === asset.id);
      if (idx !== -1) {
        store.facilityAssets[idx] = { ...store.facilityAssets[idx], ...asset };
      } else {
        store.facilityAssets.unshift(asset);
      }
    }
    this.saveStore(store);
    return asset;
  }

  updateAssetStatus(id, newStatus) {
    const store = this.getStore();
    const asset = (store.facilityAssets || []).find(a => a.id === id);
    if (asset) {
      asset.status = newStatus;
      this.saveStore(store);
      return asset;
    }
    return null;
  }

  deleteFacilityAsset(id) {
    const store = this.getStore();
    store.facilityAssets = (store.facilityAssets || []).filter(a => a.id !== id);
    this.saveStore(store);
  }

  // --- CAFM: SERVICE TICKETS & MAINTENANCE HELPDESK ---
  getServiceTickets() {
    const store = this.getStore();
    return store && store.serviceTickets ? store.serviceTickets : [];
  }

  saveServiceTicket(ticket) {
    const store = this.getStore();
    if (!store.serviceTickets) store.serviceTickets = [];
    if (!ticket.id) {
      const year = new Date().getFullYear();
      const count = (store.serviceTickets.length + 1).toString().padStart(3, '0');
      ticket.id = `TCK-${year}-${count}`;
      ticket.reportedDate = ticket.reportedDate || new Date().toISOString().slice(0, 10);
      ticket.status = ticket.status || 'Open';
      store.serviceTickets.unshift(ticket);
    } else {
      const idx = store.serviceTickets.findIndex(t => t.id === ticket.id);
      if (idx !== -1) {
        store.serviceTickets[idx] = { ...store.serviceTickets[idx], ...ticket };
      } else {
        store.serviceTickets.unshift(ticket);
      }
    }
    this.saveStore(store);
    return ticket;
  }

  updateServiceTicketStatus(id, newStatus, resolutionNotes = null) {
    const store = this.getStore();
    const ticket = (store.serviceTickets || []).find(t => t.id === id);
    if (ticket) {
      ticket.status = newStatus;
      if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;
      if (newStatus === 'Resolved' || newStatus === 'Closed') {
        ticket.resolvedDate = new Date().toISOString().slice(0, 10);
      }
      this.saveStore(store);
      return ticket;
    }
    return null;
  }

  deleteServiceTicket(id) {
    const store = this.getStore();
    store.serviceTickets = (store.serviceTickets || []).filter(t => t.id !== id);
    this.saveStore(store);
  }

  // --- CAFM: ANNUAL MAINTENANCE CONTRACTS (AMC) ---
  getAmcContracts() {
    const store = this.getStore();
    return store && store.amcContracts ? store.amcContracts : [];
  }

  saveAmcContract(amc) {
    const store = this.getStore();
    if (!store.amcContracts) store.amcContracts = [];
    if (!amc.id) {
      const year = new Date().getFullYear();
      const count = (store.amcContracts.length + 1).toString().padStart(3, '0');
      amc.id = `AMC-${year}-${count}`;
      amc.status = amc.status || 'Active';
      store.amcContracts.unshift(amc);
    } else {
      const idx = store.amcContracts.findIndex(a => a.id === amc.id);
      if (idx !== -1) {
        store.amcContracts[idx] = { ...store.amcContracts[idx], ...amc };
      } else {
        store.amcContracts.unshift(amc);
      }
    }
    this.saveStore(store);
    return amc;
  }

  updateAmcStatus(id, newStatus) {
    const store = this.getStore();
    const amc = (store.amcContracts || []).find(a => a.id === id);
    if (amc) {
      amc.status = newStatus;
      this.saveStore(store);
      return amc;
    }
    return null;
  }

  deleteAmcContract(id) {
    const store = this.getStore();
    store.amcContracts = (store.amcContracts || []).filter(a => a.id !== id);
    this.saveStore(store);
  }

  // --- BACKUP & RESTORE ---
  exportJsonBackup() {
    const data = this.getStore();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maxeco-os-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importJsonBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.settings || !parsed.leads) {
        throw new Error('Invalid MaxEco OS backup format');
      }
      this.saveStore(parsed);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }

  resetToInitialData() {
    if (typeof initialSeedData !== 'undefined') {
      this.saveStore(initialSeedData);
      return true;
    }
    return false;
  }

  // --- CSV EXPORT FOR CA / ACCOUNTS / OPERATIONS ---
  exportCsv(entityType) {
    const store = this.getStore();
    let csvContent = "";
    let filename = `maxeco-${entityType}-${new Date().toISOString().slice(0, 10)}.csv`;

    if (entityType === 'invoices') {
      csvContent = "Invoice ID,Client Name,Service,Date,Due Date,Amount Billed (INR),Amount Collected (INR),Status,Payment Date,Payment Method,Reference No\n";
      (store.invoices || []).forEach(inv => {
        csvContent += `"${inv.id}","${inv.clientName}","${inv.service}","${inv.date}","${inv.dueDate}",${inv.amountBilled},${inv.amountCollected},"${inv.status}","${inv.paymentDate || ''}","${inv.paymentMethod || ''}","${inv.referenceNo || ''}"\n`;
      });
    } else if (entityType === 'expenses') {
      csvContent = "Expense ID,Date,Category,Description,Amount (INR),Paid To,Linked Project,Payment Method\n";
      (store.expenses || []).forEach(exp => {
        csvContent += `"${exp.id}","${exp.date}","${exp.category}","${exp.description.replace(/"/g, '""')}",${exp.amount},"${exp.paidTo}","${exp.linkedProject || ''}","${exp.paymentMethod || ''}"\n`;
      });
    } else if (entityType === 'leads') {
      csvContent = "Lead ID,Name,Contact Person,Phone,Email,Location,Customer Type,Service,Source,Estimated Value (INR),Stage,Last Contact,Next Follow Up,Next Action\n";
      (store.leads || []).forEach(l => {
        csvContent += `"${l.id}","${l.name}","${l.contactPerson || ''}","${l.phone}","${l.email || ''}","${l.location || ''}","${l.customerType || ''}","${l.service}","${l.source || ''}",${l.estimatedValue || 0},"${l.stage}","${l.lastContactDate || ''}","${l.nextFollowUpDate || ''}","${(l.nextAction || '').replace(/"/g, '""')}"\n`;
      });
    } else if (entityType === 'procurements') {
      csvContent = "PO ID,Project ID,Category,Item Name,Supplier,Quantity,Estimated Cost (INR),Actual Cost (INR),Order Date,Target Delivery,Status,Invoice Ref,Notes\n";
      (store.procurements || []).forEach(p => {
        csvContent += `"${p.id}","${p.projectId || ''}","${p.itemCategory}","${(p.itemName || '').replace(/"/g, '""')}","${(p.supplierName || '').replace(/"/g, '""')}","${p.quantity || ''}",${p.estimatedCost || 0},${p.actualCost || 0},"${p.orderDate || ''}","${p.targetDeliveryDate || ''}","${p.status}","${p.invoiceRef || ''}","${(p.notes || '').replace(/"/g, '""')}"\n`;
      });
    } else if (entityType === 'workOrders') {
      csvContent = "WO ID,Project ID,Work Title,Work Type,Assigned Contractor,Phone,Scheduled Date,Target Completion,Contractor Fee (INR),Safety Compliance,Status,Notes\n";
      (store.workOrders || []).forEach(w => {
        csvContent += `"${w.id}","${w.projectId || ''}","${(w.title || '').replace(/"/g, '""')}","${w.workType || ''}","${(w.assignedTo || '').replace(/"/g, '""')}","${w.contactPhone || ''}","${w.scheduledDate || ''}","${w.targetCompletionDate || ''}",${w.contractorFee || 0},"${(w.safetyCompliance || '').replace(/"/g, '""')}","${w.status}","${(w.notes || '').replace(/"/g, '""')}"\n`;
      });
    } else if (entityType === 'payments') {
      csvContent = "Receipt ID,Invoice ID,Client Name,Service,Amount Received (INR),Payment Method,Reference No,Date,Balance Remaining (INR),Notes\n";
      (store.payments || []).forEach(p => {
        csvContent += `"${p.id}","${p.invoiceId || ''}","${p.clientName}","${(p.service || '').replace(/"/g, '""')}",${p.amount || 0},"${p.paymentMethod || ''}","${p.referenceNo || ''}","${p.date || ''}",${p.balanceRemaining || 0},"${(p.notes || '').replace(/"/g, '""')}"\n`;
      });
    } else if (entityType === 'cafmOrganizations') {
      csvContent = "Organization ID,Organization Name,Type,Industry,Contact Person,Phone,Email,Billing Address,GSTIN,Status,Notes\n";
      (store.cafmOrganizations || []).forEach(o => {
        csvContent += `"${o.id}","${(o.name || '').replace(/"/g, '""')}","${o.type || ''}","${o.industry || ''}","${(o.contactPerson || '').replace(/"/g, '""')}","${o.phone || ''}","${o.email || ''}","${(o.billingAddress || '').replace(/"/g, '""')}","${o.gstin || ''}","${o.status || ''}","${(o.notes || '').replace(/"/g, '""')}"\n`;
      });
    } else if (entityType === 'facilitySites') {
      csvContent = "Site ID,Organization ID,Facility Name,Client Name,Site Type,Location,Contact Person,Phone,APDCL Consumer No,Sanctioned Load (kW),Solar Capacity (kWp),IT Scope,Status\n";
      (store.facilitySites || []).forEach(s => {
        csvContent += `"${s.id}","${s.organizationId || ''}","${(s.name || '').replace(/"/g, '""')}","${(s.clientName || '').replace(/"/g, '""')}","${s.siteType || ''}","${(s.location || '').replace(/"/g, '""')}","${s.contactPerson || ''}","${s.contactPhone || ''}","${s.apdclConsumerNo || ''}",${s.sanctionedLoadKw || 0},${s.solarCapacityKwp || 0},"${(s.itScope || '').replace(/"/g, '""')}","${s.status || ''}"\n`;
      });
    } else if (entityType === 'facilityAssets') {
      csvContent = "Asset ID,Organization ID,Site ID,Category,Asset Name,Model Number,Serial Number,Install Date,Warranty Expiry,Criticality,Maintenance Cycle (Days),Last Serviced,Next Service Due,Status,Notes\n";
      (store.facilityAssets || []).forEach(a => {
        csvContent += `"${a.id}","${a.organizationId || ''}","${a.siteId || ''}","${a.category || ''}","${(a.name || '').replace(/"/g, '""')}","${a.modelNumber || ''}","${a.serialNumber || ''}","${a.installDate || ''}","${a.warrantyExpiry || ''}","${a.criticality || ''}",${a.maintenanceCycleDays || 0},"${a.lastServicedDate || ''}","${a.nextServiceDate || ''}","${a.status || ''}","${(a.notes || '').replace(/"/g, '""')}"\n`;
      });
    } else if (entityType === 'serviceTickets') {
      csvContent = "Ticket ID,Organization ID,Site ID,Asset ID,Title,Priority,Reported Date,Target Response Date,Assigned Tech,Status,Linked Work Order,Resolved Date,Description,Resolution Notes\n";
      (store.serviceTickets || []).forEach(t => {
        csvContent += `"${t.id}","${t.organizationId || ''}","${t.siteId || ''}","${t.assetId || ''}","${(t.title || '').replace(/"/g, '""')}","${t.priority || ''}","${t.reportedDate || ''}","${t.targetResponseDate || ''}","${(t.assignedTech || '').replace(/"/g, '""')}","${t.status || ''}","${t.workOrderId || ''}","${t.resolvedDate || ''}","${(t.issueDescription || '').replace(/"/g, '""')}","${(t.resolutionNotes || '').replace(/"/g, '""')}"\n`;
      });
    } else if (entityType === 'amcContracts') {
      csvContent = "AMC ID,Organization ID,Site ID,Title,Contract Type,Tier,Annual Fee (INR),Billing Frequency,SAC Code,Start Date,End Date,Next Billing Date,Renewal Reminder Days,Status,Terms\n";
      (store.amcContracts || []).forEach(c => {
        csvContent += `"${c.id}","${c.organizationId || ''}","${c.siteId || ''}","${(c.title || '').replace(/"/g, '""')}","${c.contractType || ''}","${c.tier || ''}",${c.annualFee || 0},"${c.billingFrequency || ''}","${c.sacCode || ''}","${c.startDate || ''}","${c.endDate || ''}","${c.nextBillingDate || ''}",${c.renewalReminderDays || 45},"${c.status || ''}","${(c.terms || '').replace(/"/g, '""')}"\n`;
      });
    } else if (entityType === 'cafmAuditLog') {
      csvContent = "Log ID,Timestamp,User,Role,Action,Entity Type,Entity ID,Details\n";
      (store.cafmAuditLog || []).forEach(l => {
        csvContent += `"${l.id}","${l.timestamp}","${l.user}","${l.role}","${l.action}","${l.entityType}","${l.entityId}","${(l.details || '').replace(/"/g, '""')}"\n`;
      });
    } else {
      return false;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  }
}

// Utility formatting helpers
const formatINR = (val) => {
  const num = Number(val) || 0;
  return '₹' + num.toLocaleString('en-IN');
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
};

window.StorageController = StorageController;
window.storage = new StorageController();
window.formatINR = formatINR;
window.formatDate = formatDate;
