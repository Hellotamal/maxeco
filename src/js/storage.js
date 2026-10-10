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
            solarGenPerKwp: 120
          },
          leads: [],
          quotations: [],
          invoices: [],
          expenses: [],
          drawings: [],
          solarProjects: [],
          itProjects: []
        });
      }
    } else {
      // Automatic update if previously cached with placeholder contacts
      try {
        const parsed = JSON.parse(existing);
        if (parsed && parsed.settings && (parsed.settings.contactEmail === 'contact@maxeco.in' || parsed.settings.contactPhone === '+91 98765 43210')) {
          parsed.settings.location = "Maligaon, Guwahati, Assam, Pin - 781011";
          parsed.settings.contactPhone = "+91 99544 93909";
          parsed.settings.contactEmail = "maxecoenergyit@gmail.com";
          parsed.settings.whatsappNumber = "919954493909";
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

  // --- CSV EXPORT FOR CA / ACCOUNTS ---
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
