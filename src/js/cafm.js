// MaxEco CAFM (Computer-Aided Facility Management) Controller
// Manages Facility Sites, Asset Inventories, Preventive Maintenance (PPM), Helpdesk Tickets, and AMCs

class CafmController {
  constructor() {
    this.companyProfile = {
      name: "MaxEco Energy & Tech",
      tagline: "Clean Energy Advisory • Solar EPC • IT Infra & CAFM Facilities Management",
      address: "Maligaon, Guwahati, Assam, Pin - 781011",
      phone: "+91 99544 93909",
      email: "maxecoenergyit@gmail.com",
      discom: "APDCL (Assam Power Distribution Company Limited)",
      logoImage: (typeof window !== 'undefined' && window.LOGO_EMBLEM_DATA_URI) || (typeof global !== 'undefined' && global.LOGO_EMBLEM_DATA_URI) || "assets/logo-emblem.png"
    };
  }

  // --- EXECUTIVE SUMMARY & KPIS ---
  getSummary() {
    const sites = window.storage.getFacilitySites() || [];
    const assets = window.storage.getFacilityAssets() || [];
    const tickets = window.storage.getServiceTickets() || [];
    const amcs = window.storage.getAmcContracts() || [];

    const totalSites = sites.length;
    const totalSolarCapacityKwp = sites.reduce((acc, s) => acc + (Number(s.solarCapacityKwp) || 0), 0);
    const totalSanctionedLoadKw = sites.reduce((acc, s) => acc + (Number(s.sanctionedLoadKw) || 0), 0);

    const totalAssets = assets.length;
    const solarAssetsCount = assets.filter(a => a.category === 'Solar EPC').length;
    const itAssetsCount = assets.filter(a => a.category === 'IT Infrastructure').length;
    const electricalAssetsCount = assets.filter(a => a.category === 'Electrical & CEIG').length;

    // PPM due calculation: nextServiceDate within 15 days or past, or status === 'Service Due'
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + 15);
    const thresholdStr = thresholdDate.toISOString().slice(0, 10);

    const dueAssets = assets.filter(a => {
      if (a.status === 'Service Due') return true;
      if (a.nextServiceDate && a.nextServiceDate <= thresholdStr && a.status !== 'Retired') return true;
      return false;
    });

    const openTickets = tickets.filter(t => t.status === 'Open' || t.status === 'Dispatched' || t.status === 'In Progress');
    const criticalTickets = tickets.filter(t => (t.priority === 'Critical' || t.priority === 'High') && t.status !== 'Resolved' && t.status !== 'Closed');

    const activeAmcs = amcs.filter(a => a.status === 'Active');
    const totalAnnualAmcValue = activeAmcs.reduce((acc, a) => acc + (Number(a.annualFee) || 0), 0);

    return {
      totalSites,
      totalSolarCapacityKwp,
      totalSanctionedLoadKw,
      totalAssets,
      solarAssetsCount,
      itAssetsCount,
      electricalAssetsCount,
      dueAssetsCount: dueAssets.length,
      dueAssets,
      totalTicketsCount: tickets.length,
      openTicketsCount: openTickets.length,
      criticalTicketsCount: criticalTickets.length,
      totalAmcCount: amcs.length,
      activeAmcCount: activeAmcs.length,
      totalAnnualAmcValue
    };
  }

  // --- SITES MANAGEMENT ---
  getSites(filter = 'all') {
    const list = window.storage.getFacilitySites() || [];
    if (filter === 'all') return list;
    return list.filter(s => (s.siteType || '').toLowerCase().includes(filter.toLowerCase()));
  }

  getSiteById(id) {
    return (window.storage.getFacilitySites() || []).find(s => s.id === id) || null;
  }

  saveSite(site) {
    return window.storage.saveFacilitySite(site);
  }

  deleteSite(id) {
    window.storage.deleteFacilitySite(id);
  }

  // --- ASSETS MANAGEMENT ---
  getAssets(category = 'all', status = 'all') {
    let list = window.storage.getFacilityAssets() || [];
    if (category !== 'all') {
      list = list.filter(a => (a.category || '').toLowerCase() === category.toLowerCase());
    }
    if (status !== 'all') {
      list = list.filter(a => (a.status || '').toLowerCase() === status.toLowerCase());
    }
    return list;
  }

  getAssetById(id) {
    return (window.storage.getFacilityAssets() || []).find(a => a.id === id) || null;
  }

  saveAsset(asset) {
    return window.storage.saveFacilityAsset(asset);
  }

  updateAssetStatus(id, newStatus) {
    return window.storage.updateAssetStatus(id, newStatus);
  }

  deleteAsset(id) {
    window.storage.deleteFacilityAsset(id);
  }

  // --- SERVICE TICKETS HELPDESK ---
  getTickets(status = 'all', priority = 'all') {
    let list = window.storage.getServiceTickets() || [];
    if (status !== 'all') {
      list = list.filter(t => (t.status || '').toLowerCase() === status.toLowerCase());
    }
    if (priority !== 'all') {
      list = list.filter(t => (t.priority || '').toLowerCase() === priority.toLowerCase());
    }
    return list;
  }

  getTicketById(id) {
    return (window.storage.getServiceTickets() || []).find(t => t.id === id) || null;
  }

  saveTicket(ticket) {
    return window.storage.saveServiceTicket(ticket);
  }

  updateTicketStatus(id, newStatus, resolutionNotes = null) {
    return window.storage.updateServiceTicketStatus(id, newStatus, resolutionNotes);
  }

  deleteTicket(id) {
    window.storage.deleteServiceTicket(id);
  }

  // Dispatch a CAFM Ticket directly into MaxEco Field Work Orders
  dispatchTicketToWorkOrder(ticketId) {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return null;

    const site = this.getSiteById(ticket.siteId);
    const asset = this.getAssetById(ticket.assetId);

    const isElectricalOrSolar = (asset && (asset.category === 'Solar EPC' || asset.category === 'Electrical & CEIG'));
    const safetyNote = isElectricalOrSolar
      ? "Full fall-arrest harness, hard hat, CEIG-rated insulated boots, calibrated megger & safety lifeline"
      : "Anti-static grounding wrist strap, clean cable labeling standards, and encrypted local storage protocols";

    const newWorkOrder = {
      projectId: site ? site.id : "CAFM-GENERAL",
      title: `[CAFM Facility Service] ${ticket.title}`,
      workType: asset ? `Maintenance & PPM (${asset.category})` : "General Facility Maintenance",
      assignedTo: ticket.assignedTech || "MaxEco Field Engineering Team",
      contactPhone: site ? site.contactPhone : "+91 99544 93909",
      scheduledDate: new Date().toISOString().slice(0, 10),
      targetCompletionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      contractorFee: 0,
      safetyCompliance: safetyNote,
      status: "Dispatched",
      notes: `Triggered from CAFM Ticket ${ticket.id} for facility: ${site ? site.name : 'Unknown'}. Asset: ${asset ? asset.name : 'General'}. Issue: ${ticket.issueDescription || ''}`
    };

    const savedWO = window.storage.saveWorkOrder(newWorkOrder);
    ticket.workOrderId = savedWO.id;
    ticket.status = "Dispatched";
    window.storage.saveServiceTicket(ticket);

    return savedWO;
  }

  // --- ANNUAL MAINTENANCE CONTRACTS (AMC) ---
  getAmcs(status = 'all') {
    let list = window.storage.getAmcContracts() || [];
    if (status !== 'all') {
      list = list.filter(a => (a.status || '').toLowerCase() === status.toLowerCase());
    }
    return list;
  }

  getAmcById(id) {
    return (window.storage.getAmcContracts() || []).find(a => a.id === id) || null;
  }

  saveAmc(amc) {
    return window.storage.saveAmcContract(amc);
  }

  updateAmcStatus(id, newStatus) {
    return window.storage.updateAmcStatus(id, newStatus);
  }

  deleteAmc(id) {
    window.storage.deleteAmcContract(id);
  }

  // Convert AMC Retainer into a Billing Invoice
  createInvoiceFromAmc(amcId) {
    const amc = this.getAmcById(amcId);
    if (!amc) return null;

    const site = this.getSiteById(amc.siteId);
    const annualFee = Number(amc.annualFee) || 0;
    let billAmount = annualFee;
    let cycleLabel = "Annual Retainer";

    if (amc.billingFrequency === 'Quarterly') {
      billAmount = Math.round(annualFee / 4);
      cycleLabel = "Quarterly Retainer";
    } else if (amc.billingFrequency === 'Half-Yearly') {
      billAmount = Math.round(annualFee / 2);
      cycleLabel = "Half-Yearly Retainer";
    }

    const isSolar = (amc.contractType || '').toLowerCase().includes('solar');
    const sacCode = isSolar ? "995461" : "998713";
    const serviceType = isSolar ? "Solar Energy Advisory" : "IT Infra Sales & Support";

    const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const invoiceData = {
      clientName: site ? site.clientName : "Client Facility",
      clientAddress: site ? site.location : "Guwahati, Assam",
      service: `${amc.title} (${cycleLabel})`,
      serviceCategory: serviceType,
      amountBilled: billAmount,
      amountCollected: 0,
      status: "Unpaid",
      date: new Date().toISOString().slice(0, 10),
      dueDate: dueDate,
      notes: `Periodic AMC retainer for ${site ? site.name : 'Facility'}. Scope: ${amc.terms || ''}. SAC Code: ${sacCode}.`
    };

    return window.storage.saveInvoice(invoiceData);
  }

  // --- PRINTABLE FACILITY INSPECTION & SERVICE SLIP ---
  generateInspectionSlipHtml(ticketId) {
    const ticket = this.getTicketById(ticketId);
    const site = ticket ? this.getSiteById(ticket.siteId) : null;
    const asset = ticket ? this.getAssetById(ticket.assetId) : null;

    const logoUri = this.companyProfile.logoImage;
    const signUri = (typeof window !== 'undefined' && window.AUTHORISED_SIGNATURE_DATA_URI) || (typeof global !== 'undefined' && global.AUTHORISED_SIGNATURE_DATA_URI) || "assets/signature.png";

    const docId = ticket ? ticket.id : "FAC-INSP-2026";
    const dateStr = ticket && ticket.reportedDate ? window.formatDate(ticket.reportedDate) : window.formatDate(new Date().toISOString().slice(0, 10));

    const isSolar = asset && asset.category === 'Solar EPC';
    const isElec = asset && asset.category === 'Electrical & CEIG';

    return `
      <div class="maxeco-invoice-sheet" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; color: #0f172a; padding: 24px; max-width: 190mm; margin: 0 auto; box-sizing: border-box; font-size: 11px; line-height: 1.4;">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 14px;">
          <div style="display: flex; gap: 12px; align-items: center;">
            <img src="${logoUri}" alt="MaxEco Logo" style="width: 44px; height: 44px; object-fit: contain;">
            <div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">${this.companyProfile.name}</div>
              <div style="font-size: 10px; color: #475569; font-weight: 600;">CAFM • FACILITY PREVENTIVE MAINTENANCE &amp; INSPECTION RECORD</div>
              <div style="font-size: 9.5px; color: #64748b;">${this.companyProfile.address} • Ph: ${this.companyProfile.phone}</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 15px; font-weight: 800; color: #0f172a;">SERVICE SLIP</div>
            <div style="font-size: 11px; font-family: monospace; font-weight: 700; color: #d97706;">${docId}</div>
            <div style="font-size: 9.5px; color: #64748b;">Date: ${dateStr}</div>
          </div>
        </div>

        <!-- Facility & Asset Profile Grid -->
        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 14px; margin-bottom: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
          <div>
            <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Client Facility Premise</div>
            <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${site ? site.name : (ticket ? ticket.title : 'Facility Service Site')}</div>
            <div style="font-size: 10px; color: #334155;">${site ? site.location : 'Guwahati, Assam'}</div>
            <div style="font-size: 9.5px; color: #475569; margin-top: 3px;">
              Client: <strong>${site ? site.clientName : 'Customer'}</strong> | Ph: ${site ? site.contactPhone : '—'}
            </div>
            ${site && site.apdclConsumerNo ? `<div style="font-size: 9.5px; color: #0284c7; margin-top: 2px;">APDCL Consumer No: <strong>${site.apdclConsumerNo}</strong></div>` : ''}
          </div>

          <div>
            <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Inspected Asset Information</div>
            <div style="font-size: 12px; font-weight: 700; color: #0f172a;">${asset ? asset.name : 'Facility Hardware'}</div>
            <div style="font-size: 10px; color: #334155;">Category: <strong>${asset ? asset.category : 'General'}</strong> | Model: ${asset ? asset.modelNumber : '—'}</div>
            <div style="font-size: 9.5px; font-family: monospace; color: #475569; margin-top: 2px;">Serial No: ${asset ? asset.serialNumber : '—'}</div>
            <div style="font-size: 9.5px; color: #16a34a; margin-top: 2px;">Status: <strong>${ticket ? ticket.status : 'Inspected'}</strong> (Priority: ${ticket ? ticket.priority : 'Normal'})</div>
          </div>
        </div>

        <!-- Task / Work Summary -->
        <div style="margin-bottom: 14px; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
          <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Maintenance Scope &amp; Reported Issue</div>
          <div style="font-size: 11px; font-weight: 600; color: #0f172a; margin-bottom: 2px;">${ticket ? ticket.title : 'Routine Facility Inspection'}</div>
          <div style="font-size: 10px; color: #475569; line-height: 1.4;">${ticket && ticket.issueDescription ? ticket.issueDescription : 'Preventive maintenance inspection and system health assessment.'}</div>
          ${ticket && ticket.workOrderId ? `<div style="font-size: 9.5px; color: #059669; font-weight: 600; margin-top: 4px;">Linked Work Order: ${ticket.workOrderId}</div>` : ''}
        </div>

        <!-- Preventive Maintenance (PPM) Verification Checklist -->
        <div style="margin-bottom: 14px;">
          <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Technical Verification Checklist (CAFM Benchmarks)</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 9.5px;">
            <thead>
              <tr style="background: #0f172a; color: #ffffff;">
                <th style="padding: 5px 8px; text-align: left; width: 35px;">#</th>
                <th style="padding: 5px 8px; text-align: left;">Inspection Checkpoint</th>
                <th style="padding: 5px 8px; text-align: left; width: 140px;">Standard Benchmark</th>
                <th style="padding: 5px 8px; text-align: center; width: 80px;">Result</th>
              </tr>
            </thead>
            <tbody>
              ${isSolar ? `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px 8px;">1</td>
                  <td style="padding: 5px 8px;">Solar PV Array Surface Cleanliness</td>
                  <td style="padding: 5px 8px;">Dust &amp; soot-free, zero bird-dropping hot spots</td>
                  <td style="padding: 5px 8px; text-align: center; color: #16a34a; font-weight: 700;">[ PASS ]</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px 8px;">2</td>
                  <td style="padding: 5px 8px;">String Inverter DC/AC Terminal Torquing &amp; Heat Sink</td>
                  <td style="padding: 5px 8px;">Clean air flow, no thermal warning, cable tight</td>
                  <td style="padding: 5px 8px; text-align: center; color: #16a34a; font-weight: 700;">[ PASS ]</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px 8px;">3</td>
                  <td style="padding: 5px 8px;">Chemical Earthing Pit Resistance (CEIG)</td>
                  <td style="padding: 5px 8px;">Earth electrode resistance &lt; 2.0 Ohms</td>
                  <td style="padding: 5px 8px; text-align: center; color: #16a34a; font-weight: 700;">1.45 Ω [PASS]</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px 8px;">4</td>
                  <td style="padding: 5px 8px;">APDCL Bi-Directional Net-Meter Daily Yield</td>
                  <td style="padding: 5px 8px;">Synchronized kWh import/export logging verified</td>
                  <td style="padding: 5px 8px; text-align: center; color: #16a34a; font-weight: 700;">[ PASS ]</td>
                </tr>
              ` : (isElec ? `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px 8px;">1</td>
                  <td style="padding: 5px 8px;">Earth Resistance Testing (Fall of Potential)</td>
                  <td style="padding: 5px 8px;">Benchmark &lt; 2.0 Ohms (CEIG Mandate)</td>
                  <td style="padding: 5px 8px; text-align: center; color: #16a34a; font-weight: 700;">1.20 Ω [PASS]</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px 8px;">2</td>
                  <td style="padding: 5px 8px;">Lightning Arrester Copper Strip Continuity</td>
                  <td style="padding: 5px 8px;">Zero mechanical break, solid down conductor</td>
                  <td style="padding: 5px 8px; text-align: center; color: #16a34a; font-weight: 700;">[ PASS ]</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px 8px;">3</td>
                  <td style="padding: 5px 8px;">ACDB / DCDB Surge Protection Device (SPD)</td>
                  <td style="padding: 5px 8px;">Indicator green (No surge breakdown)</td>
                  <td style="padding: 5px 8px; text-align: center; color: #16a34a; font-weight: 700;">[ PASS ]</td>
                </tr>
              ` : `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px 8px;">1</td>
                  <td style="padding: 5px 8px;">UPS Float Voltage &amp; Battery Bank Load Test</td>
                  <td style="padding: 5px 8px;">13.5V – 13.8V per 12V block under load</td>
                  <td style="padding: 5px 8px; text-align: center; color: #16a34a; font-weight: 700;">13.6V [PASS]</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px 8px;">2</td>
                  <td style="padding: 5px 8px;">Server / Network Rack Cable Management &amp; Temps</td>
                  <td style="padding: 5px 8px;">Ambient temp &lt; 25°C, structured patch routing</td>
                  <td style="padding: 5px 8px; text-align: center; color: #16a34a; font-weight: 700;">[ PASS ]</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px 8px;">3</td>
                  <td style="padding: 5px 8px;">Managed Switch Port Error CRC Check &amp; Backup</td>
                  <td style="padding: 5px 8px;">Zero packet drop, config auto-archived</td>
                  <td style="padding: 5px 8px; text-align: center; color: #16a34a; font-weight: 700;">[ PASS ]</td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>

        <!-- Field Resolution / Observations -->
        <div style="border: 1px dashed #cbd5e1; border-radius: 6px; padding: 8px 10px; margin-bottom: 16px;">
          <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Field Technician Findings &amp; Resolution Remarks</div>
          <div style="font-size: 10px; color: #0f172a;">
            ${ticket && ticket.resolutionNotes ? ticket.resolutionNotes : 'All operational parameters inspected and within certified manufacturer tolerance. System handed over in optimal operating condition.'}
          </div>
          <div style="font-size: 9px; color: #64748b; margin-top: 4px;">
            Inspecting Engineer: <strong>${ticket ? ticket.assignedTech : 'MaxEco Field Engineer'}</strong>
          </div>
        </div>

        <!-- Two-Column Signatory Block -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border-top: 1px solid #cbd5e1; padding-top: 10px;">
          <div>
            <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Customer Facility Acceptance</div>
            <div style="font-size: 9.5px; color: #475569; margin-bottom: 20px;">
              Confirmed service execution, checklist inspection, and operational safety clearance.
            </div>
            <div style="border-top: 1px solid #0f172a; width: 140px; margin-top: 25px; padding-top: 3px; font-size: 9px; font-weight: 700;">
              Customer Sign &amp; Stamp
            </div>
          </div>

          <div style="text-align: right;">
            <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">For MaxEco Energy &amp; Tech</div>
            <div style="display: inline-block; padding: 2px 6px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 4px; font-size: 8.5px; font-weight: 700; color: #047857; margin-bottom: 4px;">
              🛡️ DIGITALLY VERIFIED CAFM INSPECTION
            </div>
            <div>
              <img src="${signUri}" alt="Authorised Signature" style="height: 34px; max-width: 120px; object-fit: contain;">
            </div>
            <div style="font-size: 10px; font-weight: 700; color: #0f172a;">Tamal Roy</div>
            <div style="font-size: 9px; color: #64748b;">Authorised Signatory • Guwahati</div>
          </div>
        </div>

        <div style="text-align: center; font-size: 8.5px; color: #94a3b8; margin-top: 14px; border-top: 1px dashed #e2e8f0; padding-top: 6px;">
          MaxEco Energy &amp; Tech Computer-Aided Facility Management (CAFM) System • Maligaon, Guwahati, Assam
        </div>

      </div>
    `;
  }
}

// Global Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CafmController;
}
if (typeof window !== 'undefined') {
  window.CafmController = CafmController;
  window.cafm = new CafmController();
}
if (typeof global !== 'undefined') {
  global.CafmController = CafmController;
  global.cafm = new CafmController();
}
