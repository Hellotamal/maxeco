// MaxEco Sales CRM Controller
// Founder-led deal pipeline, follow-up scheduler, and WhatsApp outreach generator

class CrmController {
  constructor() {
    this.currentFilterStage = 'ALL';
    this.currentSearchQuery = '';
    this.currentServiceFilter = 'ALL';
  }

  getStages() {
    return [
      'New',
      'Contacted',
      'Meeting',
      'Qualified',
      'Proposal Sent',
      'Negotiation',
      'Won',
      'Lost',
      'Follow-up Later'
    ];
  }

  getServices() {
    return [
      'Solar EPC Coordination',
      'Solar Energy Advisory',
      'SMB Website',
      'Web Maintenance & AI Automation'
    ];
  }

  getCustomerTypes() {
    return [
      'Commercial & Industrial',
      'Residential / Domestic',
      'Healthcare / Small Business',
      'Educational Institution',
      'Retail SMB',
      'Government / PSU'
    ];
  }

  getLeadSources() {
    return [
      'Direct Referral',
      'Website Form',
      'WhatsApp Outreach',
      'Cold Visit / Field Outreach',
      'Industry Event',
      'Past Client'
    ];
  }

  getFilteredLeads() {
    const leads = window.storage.getLeads();
    const query = this.currentSearchQuery.toLowerCase().trim();

    return leads.filter(lead => {
      // Stage filter
      if (this.currentFilterStage !== 'ALL' && lead.stage !== this.currentFilterStage) {
        return false;
      }
      // Service filter
      if (this.currentServiceFilter !== 'ALL' && lead.service !== this.currentServiceFilter) {
        return false;
      }
      // Search query
      if (query) {
        const matchName = (lead.name || '').toLowerCase().includes(query);
        const matchContact = (lead.contactPerson || '').toLowerCase().includes(query);
        const matchPhone = (lead.phone || '').toLowerCase().includes(query);
        const matchLocation = (lead.location || '').toLowerCase().includes(query);
        const matchNotes = (lead.notes || '').toLowerCase().includes(query);
        return matchName || matchContact || matchPhone || matchLocation || matchNotes;
      }
      return true;
    });
  }

  getMetrics() {
    const leads = window.storage.getLeads();
    const today = new Date().toISOString().slice(0, 10);

    let totalLeads = leads.length;
    let activePipelineValue = 0;
    let overdueFollowUpsCount = 0;
    let wonCount = 0;
    let wonValue = 0;
    let proposalPendingCount = 0;

    leads.forEach(lead => {
      const val = Number(lead.estimatedValue) || 0;
      const isClosed = lead.stage === 'Won' || lead.stage === 'Lost';

      if (!isClosed) {
        activePipelineValue += val;
        if (lead.nextFollowUpDate && lead.nextFollowUpDate < today) {
          overdueFollowUpsCount++;
        }
        if (lead.stage === 'Proposal Sent') {
          proposalPendingCount++;
        }
      }

      if (lead.stage === 'Won') {
        wonCount++;
        wonValue += val;
      }
    });

    return {
      totalLeads,
      activePipelineValue,
      overdueFollowUpsCount,
      wonCount,
      wonValue,
      proposalPendingCount
    };
  }

  generateWhatsAppFollowUpUrl(lead) {
    const settings = window.storage.getSettings();
    const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
    let targetPhone = cleanPhone;
    if (targetPhone.length === 10) {
      targetPhone = '91' + targetPhone;
    }

    const greeting = lead.contactPerson ? `Dear ${lead.contactPerson},` : `Hello,`;
    const message = encodeURIComponent(
      `${greeting}\n\n` +
      `Hope you are having a productive week. Following up from MaxEco Energy & Tech regarding your enquiry for ${lead.service} (${lead.name}).\n\n` +
      `Next planned step: ${lead.nextAction || 'Discuss preliminary feasibility & solution design'}.\n\n` +
      `Please let me know if you have 10 minutes today or tomorrow for a quick call or meeting.\n\n` +
      `Best regards,\n` +
      `${settings.companyName || 'MaxEco Energy & Tech'} | Guwahati`
    );

    return `https://wa.me/${targetPhone}?text=${message}`;
  }

  renderLeadBadge(stage) {
    let badgeClass = 'badge-new';
    if (stage === 'Won') badgeClass = 'badge-won';
    else if (stage === 'Lost') badgeClass = 'badge-lost';
    else if (stage === 'Proposal Sent' || stage === 'Negotiation') badgeClass = 'badge-proposal';

    return `<span class="badge ${badgeClass}">${stage}</span>`;
  }
}

window.crmController = new CrmController();
