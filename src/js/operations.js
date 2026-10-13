// MaxEco ERP Operations & Field Execution Tracker Controller
// Handles Bill of Materials (BOM), Contractor Work Orders, APDCL Regulatory Approvals, and Project Delivery

class OperationsController {
  constructor() {
    this.companyProfile = {
      name: "MaxEco Energy & Tech",
      tagline: "Clean Energy Advisory • Solar EPC Coordination • Digital Solutions",
      address: "Maligaon, Guwahati, Assam, Pin - 781011",
      phone: "+91 99544 93909",
      email: "maxecoenergyit@gmail.com",
      discom: "APDCL (Assam Power Distribution Company Limited)",
      logoImage: (typeof window !== 'undefined' && window.LOGO_EMBLEM_DATA_URI) || (typeof global !== 'undefined' && global.LOGO_EMBLEM_DATA_URI) || "assets/logo-emblem.png"
    };
  }

  // --- OPERATIONAL SUMMARY & KPIS ---
  getOperationalSummary() {
    const solarProjects = window.storage.getSolarProjects() || [];
    const itProjects = window.storage.getItProjects() || [];
    const procurements = window.storage.getProcurements() || [];
    const workOrders = window.storage.getWorkOrders() || [];

    // Capacity & Contracts
    const totalSolarKwp = solarProjects.reduce((acc, p) => acc + (Number(p.systemCapacityKwp) || 0), 0);
    const totalSolarValue = solarProjects.reduce((acc, p) => acc + (Number(p.totalContractValue) || 0), 0);
    const totalItValue = itProjects.reduce((acc, p) => acc + (Number(p.contractValue) || 0), 0);

    // BOM Procurement metrics
    const totalBOMItems = procurements.length;
    const bomEstTotal = procurements.reduce((acc, p) => acc + (Number(p.estimatedCost) || 0), 0);
    const bomActualTotal = procurements.reduce((acc, p) => acc + (Number(p.actualCost) || 0), 0);
    const bomDeliveredCount = procurements.filter(p => p.status === 'Delivered at Site' || p.status === 'Quality Inspected').length;
    const bomInTransitCount = procurements.filter(p => p.status === 'In Transit' || p.status === 'PO Issued').length;
    const bomRequisitionCount = procurements.filter(p => p.status === 'Requisitioned').length;

    // Field Work Orders metrics
    const totalWorkOrders = workOrders.length;
    const woActiveCount = workOrders.filter(w => w.status === 'In Progress' || w.status === 'Dispatched' || w.status === 'Scheduled').length;
    const woCompletedCount = workOrders.filter(w => w.status === 'Completed' || w.status === 'Completed & Signed Off').length;
    const woFeesTotal = workOrders.reduce((acc, w) => acc + (Number(w.contractorFee) || 0), 0);

    // APDCL Regulatory metrics
    let apdclUnderReview = 0;
    let apdclApproved = 0;
    let netMeterSyncCount = 0;

    solarProjects.forEach(proj => {
      if (proj.feasibilityNocStatus === 'Approved') apdclApproved++;
      else apdclUnderReview++;
      if (proj.netMeterStatus === 'Completed' || proj.netMeterStatus === 'Synchronized') netMeterSyncCount++;
    });

    return {
      totalSolarKwp,
      solarProjectsCount: solarProjects.length,
      itProjectsCount: itProjects.length,
      totalSolarValue,
      totalItValue,
      totalBOMItems,
      bomEstTotal,
      bomActualTotal,
      bomDeliveredCount,
      bomInTransitCount,
      bomRequisitionCount,
      totalWorkOrders,
      woActiveCount,
      woCompletedCount,
      woFeesTotal,
      apdclUnderReview,
      apdclApproved,
      netMeterSyncCount
    };
  }

  // --- PROCUREMENTS (BOM) METHODS ---
  getProcurements(filter = 'all') {
    const list = window.storage.getProcurements() || [];
    if (filter === 'all') return list;
    if (filter === 'pending') {
      return list.filter(p => p.status === 'Requisitioned' || p.status === 'PO Issued' || p.status === 'In Transit');
    }
    if (filter === 'delivered') {
      return list.filter(p => p.status === 'Delivered at Site' || p.status === 'Quality Inspected');
    }
    return list.filter(p => (p.itemCategory || '').toLowerCase() === filter.toLowerCase());
  }

  saveProcurement(proc) {
    return window.storage.saveProcurement(proc);
  }

  updateProcurementStatus(id, newStatus) {
    return window.storage.updateProcurementStatus(id, newStatus);
  }

  deleteProcurement(id) {
    window.storage.deleteProcurement(id);
  }

  // --- WORK ORDERS METHODS ---
  getWorkOrders(filter = 'all') {
    const list = window.storage.getWorkOrders() || [];
    if (filter === 'all') return list;
    if (filter === 'active') {
      return list.filter(w => w.status === 'Scheduled' || w.status === 'Dispatched' || w.status === 'In Progress');
    }
    if (filter === 'completed') {
      return list.filter(w => w.status === 'Completed' || w.status === 'Completed & Signed Off');
    }
    return list.filter(w => (w.workType || '').toLowerCase().includes(filter.toLowerCase()));
  }

  saveWorkOrder(wo) {
    return window.storage.saveWorkOrder(wo);
  }

  updateWorkOrderStatus(id, newStatus) {
    return window.storage.updateWorkOrderStatus(id, newStatus);
  }

  deleteWorkOrder(id) {
    window.storage.deleteWorkOrder(id);
  }

  // --- GENERATE DAILY OPERATIONAL STANDUP BRIEF (WHATSAPP / MEMO) ---
  generateOperationalStandupDigest() {
    const summary = this.getOperationalSummary();
    const procurements = window.storage.getProcurements() || [];
    const workOrders = window.storage.getWorkOrders() || [];
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    let text = `⚡ *MAXECO ENERGY & TECH — DAILY OPERATIONS BRIEF*\n`;
    text += `📅 Date: ${today} | Base: Guwahati, Assam\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    text += `🏗️ *PROJECT EXECUTION PIPELINE*\n`;
    text += `• Solar EPC Execution: ${summary.solarProjectsCount} Project(s) (${summary.totalSolarKwp} kWp Active)\n`;
    text += `• IT & Web Retainers: ${summary.itProjectsCount} Active Engagement(s)\n`;
    text += `• APDCL Regulatory Track: ${summary.apdclUnderReview} NOC In Review | ${summary.apdclApproved} Feasibility Cleared\n\n`;

    text += `📦 *MATERIAL PROCUREMENTS & BOM HEALTH*\n`;
    text += `• Requisitions / In-Transit: ${summary.bomInTransitCount + summary.bomRequisitionCount} components\n`;
    text += `• Delivered to Site: ${summary.bomDeliveredCount} / ${summary.totalBOMItems} items\n`;
    text += `• Committed Procurement Spend: ₹${summary.bomActualTotal.toLocaleString('en-IN')}\n\n`;

    const pendingPO = procurements.filter(p => p.status === 'In Transit' || p.status === 'PO Issued').slice(0, 3);
    if (pendingPO.length > 0) {
      text += `🚚 *CRITICAL MATERIAL SHIPMENTS:*\n`;
      pendingPO.forEach(p => {
        text += `  - [${p.status}] ${p.itemName} (Target: ${p.targetDeliveryDate || 'TBD'})\n`;
      });
      text += `\n`;
    }

    text += `👷 *FIELD CONTRACTOR DISPATCH & TASKS*\n`;
    text += `• Active Work Orders: ${summary.woActiveCount} tasks\n`;
    text += `• Completed / Signed-Off: ${summary.woCompletedCount} tasks\n\n`;

    const activeWO = workOrders.filter(w => w.status === 'In Progress' || w.status === 'Dispatched' || w.status === 'Scheduled').slice(0, 3);
    if (activeWO.length > 0) {
      text += `🔨 *ACTIVE WORK TEAMS TODAY:*\n`;
      activeWO.forEach(w => {
        text += `  - ${w.title} | ${w.assignedTo} (${w.status})\n`;
      });
      text += `\n`;
    }

    text += `⚠️ *SAFETY & COMPLIANCE MANDATE:*\n`;
    text += `Verify full fall-arrest harnesses, hard hats and CEIG earthing resistance before rooftop sign-off.\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `*MaxEco Founder OS* • Guwahati Operations Hub`;

    return text;
  }

  // --- PRINTABLE FIELD WORK ORDER SLIP (HTML) ---
  generateWorkOrderSlipHTML(workOrder) {
    if (!workOrder) return '<p>No work order selected.</p>';

    const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const solarProjects = window.storage.getSolarProjects() || [];
    const linkedProj = solarProjects.find(p => p.id === workOrder.projectId) || {};

    let statusPillColor = '#f59e0b';
    if (workOrder.status === 'Completed' || workOrder.status === 'Completed & Signed Off') statusPillColor = '#10b981';
    else if (workOrder.status === 'In Progress') statusPillColor = '#0284c7';

    return `
      <div class="maxeco-invoice-sheet" id="workorder-printable-area" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- HEADER -->
        <div class="inv-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
          <div class="inv-brand" style="display: flex; gap: 14px; align-items: center;">
            <div style="width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <img src="${this.companyProfile.logoImage}" alt="MaxEco Logo" style="max-height: 50px; max-width: 50px; object-fit: contain;" onerror="if(typeof window !== 'undefined' && window.LOGO_EMBLEM_DATA_URI) this.src=window.LOGO_EMBLEM_DATA_URI" />
            </div>
            <div>
              <h1 style="font-size: 18px; margin: 0; color: #0f172a; font-weight: 800;">${this.companyProfile.name}</h1>
              <p style="font-size: 11px; margin: 2px 0; color: #475569;">${this.companyProfile.tagline}</p>
              <p style="font-size: 11px; margin: 0; color: #64748b;">${this.companyProfile.address} | Phone: ${this.companyProfile.phone}</p>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 16px; font-weight: 800; color: #f59e0b; text-transform: uppercase;">FIELD WORK ORDER</div>
            <div style="font-size: 11px; font-weight: 700; color: ${statusPillColor}; background: ${statusPillColor}15; border: 1px solid ${statusPillColor}; padding: 3px 8px; border-radius: 4px; display: inline-block; margin-top: 4px;">
              ● ${workOrder.status || 'SCHEDULED'}
            </div>
          </div>
        </div>

        <hr style="border: 0; border-top: 2px solid #e2e8f0; margin: 12px 0 16px 0;">

        <!-- META DETAILS -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
            <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">CONTRACTOR / FIELD TEAM ASSIGNED:</div>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 4px;">${workOrder.assignedTo}</div>
            <div style="font-size: 12px; color: #334155; margin-top: 2px;">Phone: <strong>${workOrder.contactPhone || '—'}</strong></div>
            <div style="font-size: 12px; color: #334155; margin-top: 2px;">Work Category: <strong>${workOrder.workType}</strong></div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
            <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
              <tr><td style="color: #64748b; padding: 2px 0;">Work Order No:</td><td style="font-weight: 700; font-family: monospace; color: #0f172a; text-align: right;">${workOrder.id}</td></tr>
              <tr><td style="color: #64748b; padding: 2px 0;">Linked Project:</td><td style="font-weight: 700; color: #0f172a; text-align: right;">${workOrder.projectId} ${linkedProj.clientName ? `(${linkedProj.clientName})` : ''}</td></tr>
              <tr><td style="color: #64748b; padding: 2px 0;">Site Location:</td><td style="color: #0f172a; text-align: right;">${linkedProj.siteLocation || 'Guwahati Site'}</td></tr>
              <tr><td style="color: #64748b; padding: 2px 0;">Scheduled Date:</td><td style="color: #0f172a; text-align: right;">${workOrder.scheduledDate}</td></tr>
              <tr><td style="color: #64748b; padding: 2px 0;">Target Handover:</td><td style="font-weight: 700; color: #0284c7; text-align: right;">${workOrder.targetCompletionDate || 'Prompt'}</td></tr>
            </table>
          </div>
        </div>

        <!-- SCOPE OF EXECUTION -->
        <div style="margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 6px;">TASK TITLE & SCOPE OF EXECUTION:</div>
          <div style="background: #fff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; font-size: 13px; font-weight: 600; color: #0f172a;">
            ${workOrder.title}
          </div>
        </div>

        <!-- SAFETY & TECHNICAL COMPLIANCE -->
        <div style="background: rgba(245, 158, 11, 0.08); border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 800; color: #b45309; text-transform: uppercase;">⚠️ SAFETY & STATUTORY CEIG COMPLIANCE GUIDELINES:</div>
          <div style="font-size: 12px; color: #78350f; margin-top: 4px; line-height: 1.5;">
            ${workOrder.safetyCompliance || 'Mandatory safety helmets, fall-arrest harnesses, safety shoes, and strict adherence to APDCL / CEIG electrical safety standards.'}
          </div>
        </div>

        <!-- COMMERCIAL & SITE NOTES -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; border: 1px solid #e2e8f0;">
          <tr style="background: #f1f5f9;">
            <th style="padding: 8px 12px; text-align: left; border: 1px solid #e2e8f0;">Contractor Agreed Work Order Fee</th>
            <th style="padding: 8px 12px; text-align: right; border: 1px solid #e2e8f0;">Payment Schedule Terms</th>
          </tr>
          <tr>
            <td style="padding: 10px 12px; font-size: 15px; font-weight: 800; font-family: monospace; color: #0f172a; border: 1px solid #e2e8f0;">
              ₹${(Number(workOrder.contractorFee) || 0).toLocaleString('en-IN')}
            </td>
            <td style="padding: 10px 12px; text-align: right; color: #475569; border: 1px solid #e2e8f0;">
              Milestone completion & quality signoff by MaxEco Project Lead
            </td>
          </tr>
          ${workOrder.notes ? `
          <tr>
            <td colspan="2" style="padding: 8px 12px; background: #fafafa; font-size: 11px; color: #475569; border: 1px solid #e2e8f0;">
              <strong>Special Instructions:</strong> ${workOrder.notes}
            </td>
          </tr>` : ''}
        </table>

        <!-- SIGNATURE & HANDOVER -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 36px; padding-top: 20px; border-top: 1px dashed #cbd5e1;">
          <div>
            <div style="border-bottom: 1px solid #94a3b8; height: 35px;"></div>
            <div style="font-size: 11px; font-weight: 700; color: #334155; margin-top: 4px;">Assigned Contractor / Team Lead Signature</div>
            <div style="font-size: 10px; color: #64748b;">(Acceptance of scope & safety protocols)</div>
          </div>
          <div style="text-align: right;">
            <div style="min-height: 48px; display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-end; margin-bottom: 2px;">
              <img src="${(typeof window !== 'undefined' && window.AUTHORISED_SIGNATURE_DATA_URI) || (typeof global !== 'undefined' && global.AUTHORISED_SIGNATURE_DATA_URI) || 'assets/signature.png'}" alt="Tamal Roy Authorised Signature" style="height: 44px; max-width: 140px; display: block; object-fit: contain; margin-bottom: -4px;" onerror="if(typeof window !== 'undefined' && window.AUTHORISED_SIGNATURE_DATA_URI) this.src=window.AUTHORISED_SIGNATURE_DATA_URI">
              <div style="border-bottom: 1.5px solid #0f172a; width: 170px;"></div>
            </div>
            <div style="display: flex; align-items: center; justify-content: flex-end; margin-top: 4px;">
              <span style="background: rgba(2, 132, 199, 0.12); color: #0284c7; border: 1px solid rgba(2, 132, 199, 0.3); font-size: 8px; padding: 1px 5px; font-weight: 700; border-radius: 4px; display: inline-block;">DIGITALLY VERIFIED SIGNATURE</span>
            </div>
            <div style="font-size: 11px; font-weight: 700; color: #0f172a; margin-top: 3px;">Tamal Roy • Founder & Authorised Signatory</div>
            <div style="font-size: 10px; color: #64748b;">For MaxEco Energy & Tech</div>
          </div>
        </div>
      </div>
    `;
  }
}

// Global bootstrap
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OperationsController;
}
if (typeof window !== 'undefined') {
  window.OperationsController = OperationsController;
  window.operationsController = new OperationsController();
}
