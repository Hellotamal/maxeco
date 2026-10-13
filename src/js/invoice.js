// MaxEco Energy & Tech - Professional Indian Tax Invoice & Bill of Supply Engine
// Generates compliant, printable, and shareable invoice documents for Solar and IT services.
// Headquarters: Maligaon, Guwahati, Assam, Pin - 781011 | Contact: +91 99544 93909

class InvoiceController {
  constructor() {
    this.companyProfile = {
      name: "MaxEco Energy & Tech",
      tagline: "Clean Energy Advisory & Digital Solutions for Northeast India",
      address: "Maligaon, Guwahati, Assam, Pin - 781011",
      phone: "+91 99544 93909",
      email: "maxecoenergyit@gmail.com",
      whatsapp: "919954493909",
      state: "Assam",
      stateCode: "18",
      bankName: "State Bank of India (SBI)",
      accountName: "MaxEco Energy & Tech",
      accountType: "Current / Business Account",
      accountNo: "XXXXXXXXXXXX (Available upon request)",
      ifscCode: "SBIN0000000",
      upiId: "9954493909@upi",
      jurisdiction: "Guwahati, Assam"
    };
  }

  // Convert Indian Rupee numerical amounts into English words (Lakhs / Crores)
  numberToWordsINR(amount) {
    if (!amount || isNaN(amount) || amount <= 0) return 'Rupees Zero Only';
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
               'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function inWords(n) {
      if (n === 0) return '';
      if (n < 20) return a[n] + ' ';
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + a[n % 10] : '') + ' ';
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred ' + inWords(n % 100);
      if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + inWords(n % 1000);
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + inWords(n % 100000);
      return inWords(Math.floor(n / 10000000)) + 'Crore ' + inWords(n % 10000000);
    }

    const intPart = Math.floor(amount);
    const paisePart = Math.round((amount - intPart) * 100);
    let str = 'Rupees ' + inWords(intPart).trim();
    if (paisePart > 0) {
      str += ' and ' + inWords(paisePart).trim() + ' Paise';
    }
    return str + ' Only';
  }

  // Determine standard HSN/SAC code based on service description
  detectHsnSac(serviceDesc) {
    const s = (serviceDesc || '').toLowerCase();
    if (s.includes('solar') || s.includes('epc') || s.includes('pv') || s.includes('rooftop')) {
      return { code: '995461', label: 'Solar Power Plant Consulting & Project Coordination' };
    }
    if (s.includes('web') || s.includes('it') || s.includes('software') || s.includes('ai') || s.includes('automation')) {
      return { code: '998313', label: 'IT Consulting, Web Development & Automation Services' };
    }
    return { code: '998319', label: 'Other Professional & Technical Advisory Services' };
  }

  // Format currency in Indian standard format
  formatCurrency(val) {
    return '₹' + Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  }

  // Format date in Indian convention (DD-MM-YYYY)
  formatDateIndian(dateStr) {
    if (!dateStr) return '—';
    const parts = String(dateStr).split('-');
    if (parts.length === 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mIdx = parseInt(parts[1], 10) - 1;
      return `${parts[2]}-${months[mIdx] || parts[1]}-${parts[0]}`;
    }
    return dateStr;
  }

  // Generate full HTML for printable/displayable Invoice Format
  generateInvoiceHTML(invoice, options = {}) {
    if (!invoice) return '<p>No invoice found.</p>';

    const billed = Number(invoice.amountBilled) || 0;
    const collected = Number(invoice.amountCollected) || 0;
    const outstanding = Math.max(0, billed - collected);
    const today = new Date().toISOString().slice(0, 10);
    const isOverdue = outstanding > 0 && invoice.dueDate && invoice.dueDate < today;

    // Detect or use custom HSN/SAC
    const hsnInfo = this.detectHsnSac(invoice.service);
    const sacCode = invoice.hsnSac || hsnInfo.code;
    
    // Tax handling: support tax breakdown (CGST+SGST / IGST / Bill of Supply)
    const taxType = options.taxType || invoice.taxType || 'composition'; // 'gst_breakdown', 'igst', 'composition'
    const taxRate = Number(invoice.taxRatePercent) || (taxType === 'gst_breakdown' ? 18 : 0);
    
    let subtotal = billed;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (taxType === 'gst_breakdown' && taxRate > 0) {
      // Assuming billed amount includes 18% GST (back-calculated) or exclusive
      if (options.taxInclusive !== false) {
        subtotal = Math.round((billed / (1 + (taxRate / 100))) * 100) / 100;
        const totalTax = Math.round((billed - subtotal) * 100) / 100;
        cgstAmount = Math.round((totalTax / 2) * 100) / 100;
        sgstAmount = Math.round((totalTax - cgstAmount) * 100) / 100;
      } else {
        cgstAmount = Math.round((subtotal * (taxRate / 200)) * 100) / 100;
        sgstAmount = cgstAmount;
      }
    }

    const docTitle = invoice.invoiceType || (taxRate > 0 ? 'TAX INVOICE' : 'BILL OF SUPPLY / INVOICE');
    const words = this.numberToWordsINR(billed);

    let statusBadgeColor = '#10b981'; // Green
    let statusLabel = 'PAID & SETTLED';
    if (isOverdue) {
      statusBadgeColor = '#ef4444'; // Red
      statusLabel = 'PAYMENT OVERDUE';
    } else if (outstanding > 0 && collected > 0) {
      statusBadgeColor = '#f59e0b'; // Amber
      statusLabel = 'PARTIALLY PAID';
    } else if (outstanding > 0) {
      statusBadgeColor = '#3b82f6'; // Blue
      statusLabel = 'PAYMENT DUE';
    }

    return `
      <div class="maxeco-invoice-sheet" id="invoice-printable-area">
        <!-- INVOICE HEADER -->
        <div class="inv-header">
          <div class="inv-brand">
            <div class="inv-logo-box">
              <span class="inv-logo-char">M</span>
            </div>
            <div class="inv-company-meta">
              <h1 class="inv-company-name">${this.companyProfile.name}</h1>
              <p class="inv-tagline">${this.companyProfile.tagline}</p>
              <p class="inv-address">${this.companyProfile.address}</p>
              <p class="inv-contact">
                <strong>Phone:</strong> ${this.companyProfile.phone} &nbsp;|&nbsp; 
                <strong>Email:</strong> ${this.companyProfile.email}
              </p>
              <p class="inv-state"><strong>State:</strong> ${this.companyProfile.state} &nbsp;|&nbsp; <strong>State Code:</strong> ${this.companyProfile.stateCode}</p>
            </div>
          </div>
          <div class="inv-title-box">
            <div class="inv-doc-title">${docTitle}</div>
            <div class="inv-status-pill" style="background: ${statusBadgeColor}20; color: ${statusBadgeColor}; border-color: ${statusBadgeColor};">
              ● ${statusLabel}
            </div>
          </div>
        </div>

        <hr class="inv-divider">

        <!-- METADATA & BILL TO ROW -->
        <div class="inv-meta-grid">
          <!-- Left: Bill To -->
          <div class="inv-bill-to">
            <div class="inv-section-label">BILLED TO (CUSTOMER):</div>
            <h3 class="inv-client-name">${invoice.clientName || 'Valued Client'}</h3>
            <p class="inv-client-address">${invoice.clientAddress || 'Guwahati, Assam, India'}</p>
            ${invoice.clientContact ? `<p><strong>Contact:</strong> ${invoice.clientContact}</p>` : ''}
            ${invoice.clientGstin ? `<p><strong>GSTIN:</strong> ${invoice.clientGstin}</p>` : ''}
            <p><strong>Place of Supply:</strong> ${invoice.placeOfSupply || 'Assam (18)'}</p>
          </div>

          <!-- Right: Invoice Specifics -->
          <div class="inv-doc-details">
            <table class="inv-details-table">
              <tr>
                <td><strong>Invoice No:</strong></td>
                <td class="font-mono inv-highlight">${invoice.id}</td>
              </tr>
              <tr>
                <td><strong>Invoice Date:</strong></td>
                <td>${this.formatDateIndian(invoice.date)}</td>
              </tr>
              <tr>
                <td><strong>Due Date:</strong></td>
                <td class="${isOverdue ? 'text-danger' : ''}"><strong>${this.formatDateIndian(invoice.dueDate)}</strong></td>
              </tr>
              <tr>
                <td><strong>Payment Terms:</strong></td>
                <td>${invoice.terms || 'Due on Receipt / Milestone'}</td>
              </tr>
              ${invoice.referenceNo ? `<tr><td><strong>Ref / UTR:</strong></td><td class="font-mono text-xs">${invoice.referenceNo}</td></tr>` : ''}
            </table>
          </div>
        </div>

        <!-- ITEMS / SERVICES TABLE -->
        <table class="inv-items-table">
          <thead>
            <tr>
              <th style="width: 5%; text-align: center;">#</th>
              <th style="width: 55%;">Description of Goods / Services</th>
              <th style="width: 15%; text-align: center;">HSN / SAC</th>
              <th style="width: 10%; text-align: center;">Qty</th>
              <th style="width: 15%; text-align: right;">Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center; vertical-align: top;">1</td>
              <td>
                <div class="inv-item-title"><strong>${invoice.service || 'Professional Advisory & Services'}</strong></div>
                <div class="inv-item-desc">${invoice.serviceDescription || hsnInfo.label}</div>
              </td>
              <td style="text-align: center; vertical-align: top;" class="font-mono">${sacCode}</td>
              <td style="text-align: center; vertical-align: top;">1 Job</td>
              <td style="text-align: right; vertical-align: top;" class="font-mono"><strong>${this.formatCurrency(subtotal)}</strong></td>
            </tr>
          </tbody>
        </table>

        <!-- TOTALS & TAX BREAKDOWN -->
        <div class="inv-summary-grid">
          <div class="inv-words-block">
            <div class="inv-words-label">AMOUNT IN WORDS:</div>
            <div class="inv-words-val"><em>${words}</em></div>
            
            <!-- Remittance Bank Details -->
            <div class="inv-bank-box">
              <div class="inv-bank-title">💳 BANK REMITTANCE & UPI DETAILS</div>
              <table class="inv-bank-table">
                <tr><td><strong>Beneficiary:</strong></td><td>${this.companyProfile.accountName}</td></tr>
                <tr><td><strong>Bank Name:</strong></td><td>${this.companyProfile.bankName}</td></tr>
                <tr><td><strong>Account Type:</strong></td><td>${this.companyProfile.accountType}</td></tr>
                <tr><td><strong>UPI ID:</strong></td><td class="font-mono"><strong>${this.companyProfile.upiId}</strong></td></tr>
                <tr><td><strong>Scan & Pay:</strong></td><td>GPay / PhonePe / Paytm to <strong>+91 99544 93909</strong></td></tr>
              </table>
            </div>
          </div>

          <div class="inv-totals-block">
            <table class="inv-totals-table">
              <tr>
                <td>Subtotal (Taxable Value):</td>
                <td class="font-mono">${this.formatCurrency(subtotal)}</td>
              </tr>
              ${cgstAmount > 0 ? `
              <tr>
                <td>CGST (${taxRate / 2}%):</td>
                <td class="font-mono">${this.formatCurrency(cgstAmount)}</td>
              </tr>
              <tr>
                <td>SGST (${taxRate / 2}%):</td>
                <td class="font-mono">${this.formatCurrency(sgstAmount)}</td>
              </tr>` : ''}
              <tr class="inv-grand-total-row">
                <td><strong>TOTAL INVOICED:</strong></td>
                <td class="font-mono"><strong>${this.formatCurrency(billed)}</strong></td>
              </tr>
              <tr>
                <td class="text-emerald">Amount Received / Paid:</td>
                <td class="font-mono text-emerald">(-) ${this.formatCurrency(collected)}</td>
              </tr>
              <tr class="inv-balance-row">
                <td><strong>BALANCE DUE:</strong></td>
                <td class="font-mono ${outstanding > 0 ? 'text-amber' : 'text-emerald'}"><strong>${this.formatCurrency(outstanding)}</strong></td>
              </tr>
            </table>
          </div>
        </div>

        <!-- TERMS & SIGNATURE ROW -->
        <div class="inv-footer-grid">
          <div class="inv-terms-box">
            <div class="inv-terms-label">TERMS & CONDITIONS:</div>
            <ol class="inv-terms-list">
              <li>Payment is due on or before <strong>${this.formatDateIndian(invoice.dueDate)}</strong>.</li>
              <li>Please mention Invoice No <strong>${invoice.id}</strong> in your payment remarks or UTR share.</li>
              <li>For Solar EPC, milestones align with structural mounting, APDCL approvals, and CEIG clearances.</li>
              <li>Subject to ${this.companyProfile.jurisdiction} jurisdiction.</li>
            </ol>
          </div>

          <div class="inv-sign-box">
            <p style="font-size: 11px; color: #475569;">For <strong>${this.companyProfile.name}</strong></p>
            <div class="inv-stamp-zone">
              <span class="inv-stamp-tag">[ Digitally Issued ]</span>
            </div>
            <div class="inv-sign-line"></div>
            <p style="font-weight: 700; font-size: 12px; margin-top: 4px;">Authorized Signatory / Founder</p>
            <p style="font-size: 10px; color: #64748b;">Maligaon, Guwahati, Assam</p>
          </div>
        </div>

        <div class="inv-bottom-note">
          This is a computer-generated invoice issued by MaxEco Energy & Tech Business Operating System.
        </div>
      </div>
    `;
  }

  // Open the Invoice Format Viewer Modal
  openInvoiceFormatModal(invoiceId) {
    const invoices = (window.storage && window.storage.getInvoices) ? window.storage.getInvoices() : [];
    const invoice = invoices.find(i => i.id === invoiceId) || invoices[0];
    if (!invoice) {
      if (typeof showToast === 'function') showToast('No invoice found to preview.', 'error');
      return;
    }

    const container = document.getElementById('invoice-format-preview-container');
    if (container) {
      container.innerHTML = this.generateInvoiceHTML(invoice);
    }

    const activeIdEl = document.getElementById('invoice-active-view-id');
    if (activeIdEl) activeIdEl.value = invoice.id;

    const modal = document.getElementById('modal-invoice-format-viewer');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  // Trigger browser print dialog for current active invoice
  printInvoice() {
    window.print();
  }

  // Share formatted invoice details via WhatsApp
  shareInvoiceWhatsApp(invoiceId) {
    const invoices = (window.storage && window.storage.getInvoices) ? window.storage.getInvoices() : [];
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;

    const outstanding = Math.max(0, (Number(inv.amountBilled) || 0) - (Number(inv.amountCollected) || 0));
    const text = `*INVOICE FROM MAXECO ENERGY & TECH*\n` +
      `Invoice No: ${inv.id}\n` +
      `Client: ${inv.clientName}\n` +
      `Service: ${inv.service}\n` +
      `Total Billed: ${this.formatCurrency(inv.amountBilled)}\n` +
      `Due Date: ${this.formatDateIndian(inv.dueDate)}\n` +
      `Balance Due: ${this.formatCurrency(outstanding)}\n\n` +
      `Bank Remittance Details:\n` +
      `A/C Name: ${this.companyProfile.accountName}\n` +
      `Bank: ${this.companyProfile.bankName}\n` +
      `UPI ID: ${this.companyProfile.upiId}\n\n` +
      `Thank you for choosing MaxEco Energy & Tech (Guwahati, Assam).`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  // Copy plain text invoice summary to clipboard
  copyInvoiceText(invoiceId) {
    const invoices = (window.storage && window.storage.getInvoices) ? window.storage.getInvoices() : [];
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;

    const outstanding = Math.max(0, (Number(inv.amountBilled) || 0) - (Number(inv.amountCollected) || 0));
    const text = `====================================================\n` +
      `MAXECO ENERGY & TECH — TAX INVOICE\n` +
      `Maligaon, Guwahati, Assam, Pin - 781011 | +91 99544 93909\n` +
      `====================================================\n` +
      `Invoice No: ${inv.id} | Date: ${this.formatDateIndian(inv.date)}\n` +
      `Due Date: ${this.formatDateIndian(inv.dueDate)}\n` +
      `Client: ${inv.clientName}\n` +
      `Service: ${inv.service}\n` +
      `Total Billed: ${this.formatCurrency(inv.amountBilled)}\n` +
      `Amount Received: ${this.formatCurrency(inv.amountCollected)}\n` +
      `Balance Due: ${this.formatCurrency(outstanding)}\n` +
      `Amount in Words: ${this.numberToWordsINR(inv.amountBilled)}\n` +
      `UPI ID: ${this.companyProfile.upiId}\n` +
      `====================================================\n`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        if (typeof showToast === 'function') showToast('Invoice text copied to clipboard.', 'success');
      });
    }
  }

  // --- CUSTOMER QUOTATION GENERATION & FORMATTING (MAXECO) ---
  generateQuotationHTML(quotation, options = {}) {
    if (!quotation) return '<p>No quotation found.</p>';

    const total = Number(quotation.totalAmount !== undefined ? quotation.totalAmount : (quotation.amount !== undefined ? quotation.amount : quotation.estimatedValue)) || 0;
    const directCost = Number(quotation.directCostEstimate !== undefined ? quotation.directCostEstimate : (quotation.estimatedCost !== undefined ? quotation.estimatedCost : quotation.directCost)) || 0;
    const margin = Number(quotation.projectedMargin) || (total - directCost);
    const words = this.numberToWordsINR(total);
    const hsnInfo = this.detectHsnSac(quotation.service);
    const isSolar = (quotation.service || '').toLowerCase().includes('solar');

    let statusPillColor = '#3b82f6';
    let statusPillText = 'PROPOSAL SUBMITTED';
    if (quotation.status === 'Accepted') {
      statusPillColor = '#10b981';
      statusPillText = 'PROPOSAL ACCEPTED';
    } else if (quotation.status === 'Declined') {
      statusPillColor = '#ef4444';
      statusPillText = 'DECLINED';
    }

    const scopeBullets = isSolar ? [
      'Preliminary site survey, rooftop structural analysis & orientation geometry check',
      'APDCL Net-Metering NOC liaison, SLD (Single Line Diagram) & CEIG compliance planning',
      'Tier-1 Solar PV modules & grid-interactive inverter technical specification & procurement coordination',
      'Civil mounting structures, DC/AC cabling, earthing pits & lightning protection installation audit',
      'Final grid synchronization, bidirectional net-meter testing, and handover documentation'
    ] : [
      'Full-stack website design, mobile responsiveness, fast loading & Northeast India local SEO optimization',
      'Integration of WhatsApp direct customer enquiry buttons and lead routing',
      'Contact forms, Google Maps embed, SSL security configuration and domain linkage',
      'Content staging, doctor/product schedules, or e-commerce catalog showcase',
      '30 days post-launch technical warranty & maintenance support'
    ];

    return `
      <div class="maxeco-invoice-sheet maxeco-quotation-sheet" id="quotation-printable-area">
        <!-- HEADER -->
        <div class="inv-header">
          <div class="inv-brand">
            <div class="inv-logo-box">
              <span class="inv-logo-char">M</span>
            </div>
            <div class="inv-company-meta">
              <h1 class="inv-company-name">${this.companyProfile.name}</h1>
              <p class="inv-tagline">${this.companyProfile.tagline}</p>
              <p class="inv-address">${this.companyProfile.address}</p>
              <p class="inv-contact">
                <strong>Phone:</strong> ${this.companyProfile.phone} &nbsp;|&nbsp; 
                <strong>Email:</strong> ${this.companyProfile.email}
              </p>
              <p class="inv-state"><strong>State:</strong> ${this.companyProfile.state} &nbsp;|&nbsp; <strong>State Code:</strong> ${this.companyProfile.stateCode}</p>
            </div>
          </div>
          <div class="inv-title-box">
            <div class="inv-doc-title" style="color: #0284c7;">FORMAL QUOTATION</div>
            <div class="inv-status-pill" style="background: ${statusPillColor}20; color: ${statusPillColor}; border-color: ${statusPillColor};">
              ● ${statusPillText}
            </div>
          </div>
        </div>

        <hr class="inv-divider">

        <!-- CLIENT & QUOTE META -->
        <div class="inv-meta-grid">
          <div class="inv-bill-to">
            <div class="inv-section-label">PREPARED FOR (PROSPECT / CLIENT):</div>
            <h3 class="inv-client-name">${quotation.clientName || 'Valued Client'}</h3>
            <p class="inv-client-address">${quotation.clientLocation || quotation.clientAddress || 'Guwahati, Assam, India'}</p>
            <p><strong>Service Requested:</strong> ${quotation.service}</p>
          </div>

          <div class="inv-doc-details">
            <table class="inv-details-table">
              <tr>
                <td><strong>Quotation Ref:</strong></td>
                <td class="font-mono inv-highlight" style="color: #0284c7;">${quotation.id}</td>
              </tr>
              <tr>
                <td><strong>Proposal Date:</strong></td>
                <td>${this.formatDateIndian(quotation.date)}</td>
              </tr>
              <tr>
                <td><strong>Price Validity:</strong></td>
                <td><strong>${this.formatDateIndian(quotation.validUntil)}</strong> (Firm Fixed Price)</td>
              </tr>
              <tr>
                <td><strong>Service Category:</strong></td>
                <td>${hsnInfo.label}</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- SCOPE OF DELIVERABLES -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; margin-bottom: 20px;">
          <div class="inv-section-label" style="color: #0f172a; font-size: 11px;">SCOPE OF WORK & DELIVERABLES:</div>
          <p style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">${quotation.service}</p>
          <ul style="font-size: 12px; color: #334155; padding-left: 18px; line-height: 1.6;">
            ${scopeBullets.map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>

        <!-- COMMERCIAL SCHEDULE TABLE -->
        <table class="inv-items-table">
          <thead>
            <tr>
              <th style="width: 5%; text-align: center;">#</th>
              <th style="width: 55%;">Deliverable Package / Scope Item</th>
              <th style="width: 15%; text-align: center;">HSN / SAC</th>
              <th style="width: 10%; text-align: center;">Qty</th>
              <th style="width: 15%; text-align: right;">Quoted Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center; vertical-align: top;">1</td>
              <td>
                <div class="inv-item-title"><strong>${quotation.service}</strong></div>
                <div class="inv-item-desc">${isSolar ? 'Solar engineering, advisory & complete vendor execution coordination.' : 'Full-lifecycle SMB website design, deployment and maintenance setup.'}</div>
              </td>
              <td style="text-align: center; vertical-align: top;" class="font-mono">${hsnInfo.code}</td>
              <td style="text-align: center; vertical-align: top;">1 Turnkey Job</td>
              <td style="text-align: right; vertical-align: top;" class="font-mono"><strong>${this.formatCurrency(total)}</strong></td>
            </tr>
          </tbody>
        </table>

        <!-- TOTALS & AMOUNT IN WORDS -->
        <div class="inv-summary-grid">
          <div class="inv-words-block">
            <div class="inv-words-label">TOTAL AMOUNT IN WORDS:</div>
            <div class="inv-words-val" style="color: #0284c7;"><em>${words}</em></div>
            
            <div style="font-size: 11px; color: #475569; margin-top: 6px;">
              <strong>Payment Terms:</strong> ${quotation.terms || '20% with Work Order, 60% upon delivery/erection, 20% on testing & signoff'}
            </div>
          </div>

          <div class="inv-totals-block">
            <table class="inv-totals-table">
              <tr class="inv-grand-total-row">
                <td style="color: #0284c7 !important;"><strong>TOTAL QUOTED VALUE:</strong></td>
                <td class="font-mono" style="color: #0284c7 !important; font-size: 16px;"><strong>${this.formatCurrency(total)}</strong></td>
              </tr>
              <tr>
                <td style="font-size: 11px; color: #64748b;">Pricing Structure:</td>
                <td style="font-size: 11px; color: #64748b;">All Inclusive / Net Payable</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- CLIENT ACCEPTANCE & SIGNATURE BLOCK -->
        <div class="inv-footer-grid" style="margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          <div style="border-right: 1px dashed #cbd5e1; padding-right: 20px;">
            <div class="inv-terms-label" style="color: #0f172a;">CLIENT WORK ORDER ACCEPTANCE:</div>
            <p style="font-size: 11px; color: #64748b; margin: 4px 0 16px 0;">We confirm and accept the above proposal scope, pricing, and milestone schedule.</p>
            <div style="border-top: 1px dashed #94a3b8; width: 180px; margin-top: 36px;"></div>
            <p style="font-size: 11px; font-weight: 700; color: #334155; margin-top: 2px;">Authorized Client Representative</p>
            <p style="font-size: 10px; color: #64748b;">Signature, Seal &amp; Date</p>
          </div>

          <div class="inv-sign-box">
            <p style="font-size: 11px; color: #475569;">Issued for <strong>${this.companyProfile.name}</strong></p>
            <div class="inv-stamp-zone">
              <span class="inv-stamp-tag" style="border-color: #0284c7; color: #0284c7;">[ Formal Quotation Issued ]</span>
            </div>
            <div class="inv-sign-line"></div>
            <p style="font-weight: 700; font-size: 12px; margin-top: 4px;">Founder &amp; Principal Consultant</p>
            <p style="font-size: 10px; color: #64748b;">MaxEco Energy &amp; Tech, Guwahati</p>
          </div>
        </div>

        <div class="inv-bottom-note">
          This quotation is issued by MaxEco Energy & Tech Business Operating System. Validity expires on ${this.formatDateIndian(quotation.validUntil)}.
        </div>
      </div>
    `;
  }

  // Open the Quotation Format Viewer Modal
  openQuotationFormatModal(quoteId) {
    const quotations = (window.storage && window.storage.getQuotations) ? window.storage.getQuotations() : [];
    const quote = quotations.find(q => q.id === quoteId) || quotations[0];
    if (!quote) {
      if (typeof showToast === 'function') showToast('No quotation found to preview.', 'error');
      return;
    }

    const container = document.getElementById('quotation-format-preview-container');
    if (container) {
      container.innerHTML = this.generateQuotationHTML(quote);
    }

    const activeIdEl = document.getElementById('quotation-active-view-id');
    if (activeIdEl) activeIdEl.value = quote.id;

    const modal = document.getElementById('modal-quotation-format-viewer');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  printQuotation() {
    window.print();
  }

  shareQuotationWhatsApp(quoteId) {
    const quotations = (window.storage && window.storage.getQuotations) ? window.storage.getQuotations() : [];
    const q = quotations.find(item => item.id === quoteId);
    if (!q) return;

    const text = `*FORMAL PROPOSAL FROM MAXECO ENERGY & TECH*\n` +
      `Quotation Ref: ${q.id}\n` +
      `Client: ${q.clientName}\n` +
      `Service: ${q.service}\n` +
      `Total Quoted Value: ${this.formatCurrency(q.totalAmount)}\n` +
      `Validity: Until ${this.formatDateIndian(q.validUntil)}\n` +
      `Terms: ${q.terms}\n\n` +
      `We look forward to partnering with you.\n` +
      `MaxEco Energy & Tech | Maligaon, Guwahati, Assam | +91 99544 93909`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  copyQuotationText(quoteId) {
    const quotations = (window.storage && window.storage.getQuotations) ? window.storage.getQuotations() : [];
    const q = quotations.find(item => item.id === quoteId);
    if (!q) return;

    const text = `====================================================\n` +
      `MAXECO ENERGY & TECH — FORMAL QUOTATION\n` +
      `Maligaon, Guwahati, Assam, Pin - 781011 | +91 99544 93909\n` +
      `====================================================\n` +
      `Quotation Ref: ${q.id} | Date: ${this.formatDateIndian(q.date)}\n` +
      `Valid Until: ${this.formatDateIndian(q.validUntil)}\n` +
      `Client: ${q.clientName}\n` +
      `Service: ${q.service}\n` +
      `Total Quoted Value: ${this.formatCurrency(q.totalAmount)} (${this.numberToWordsINR(q.totalAmount)})\n` +
      `Terms: ${q.terms}\n` +
      `====================================================\n`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        if (typeof showToast === 'function') showToast('Quotation text copied to clipboard.', 'success');
      });
    }
  }

  convertQuoteToInvoiceAndOpen(quoteId) {
    if (window.app && typeof window.app.convertQuoteToInvoice === 'function') {
      window.app.convertQuoteToInvoice(quoteId);
      // Find the newly created invoice for this client
      const invoices = window.storage.getInvoices();
      const quote = window.storage.getQuotations().find(q => q.id === quoteId);
      const matchedInv = invoices.find(inv => inv.clientName === quote?.clientName);
      if (matchedInv) {
        this.openInvoiceFormatModal(matchedInv.id);
      }
    }
  }

  // --- OFFICIAL PAYMENT RECEIPT & ACKNOWLEDGEMENT (MAXECO) ---
  generatePaymentReceiptHTML(receipt, invoice = null) {
    if (!receipt) return '<p>No payment receipt found.</p>';
    const amount = Number(receipt.amount) || 0;
    const words = this.numberToWordsINR(amount);
    const balance = Number(receipt.balanceRemaining !== undefined ? receipt.balanceRemaining : (invoice ? Math.max(0, invoice.amountBilled - invoice.amountCollected) : 0));

    return `
      <div class="maxeco-invoice-sheet" id="payment-receipt-printable-area" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- HEADER -->
        <div class="inv-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
          <div class="inv-brand" style="display: flex; gap: 14px; align-items: center;">
            <div style="width: 44px; height: 44px; border-radius: 8px; background: linear-gradient(135deg, #10b981, #0284c7); display: flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; font-size: 20px;">
              M
            </div>
            <div>
              <h1 style="font-size: 18px; margin: 0; color: #0f172a; font-weight: 800;">${this.companyProfile.name}</h1>
              <p style="font-size: 11px; margin: 2px 0; color: #475569;">${this.companyProfile.tagline}</p>
              <p style="font-size: 11px; margin: 0; color: #64748b;">${this.companyProfile.address} | Phone: ${this.companyProfile.phone}</p>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 16px; font-weight: 800; color: #10b981; text-transform: uppercase;">OFFICIAL PAYMENT RECEIPT</div>
            <div style="font-size: 11px; font-weight: 700; color: #10b981; background: rgba(16, 185, 129, 0.12); border: 1px solid #10b981; padding: 3px 8px; border-radius: 4px; display: inline-block; margin-top: 4px;">
              ● PAYMENT RECEIVED &amp; VERIFIED
            </div>
          </div>
        </div>

        <hr style="border: 0; border-top: 2px solid #e2e8f0; margin: 12px 0 16px 0;">

        <!-- RECEIPT DETAILS & PAYER -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
            <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">RECEIVED WITH THANKS FROM:</div>
            <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 4px;">${receipt.clientName}</div>
            <div style="font-size: 12px; color: #334155; margin-top: 2px;">Towards: <strong>${receipt.service || 'Professional Advisory & Services'}</strong></div>
            ${receipt.notes ? `<div style="font-size: 11px; color: #64748b; margin-top: 4px;">Milestone / Purpose: ${receipt.notes}</div>` : ''}
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
            <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
              <tr><td style="color: #64748b; padding: 2px 0;">Receipt Voucher No:</td><td style="font-weight: 700; font-family: monospace; color: #10b981; text-align: right;">${receipt.id}</td></tr>
              <tr><td style="color: #64748b; padding: 2px 0;">Invoice Reference:</td><td style="font-weight: 700; font-family: monospace; color: #0f172a; text-align: right;">${receipt.invoiceId || 'DIRECT'}</td></tr>
              <tr><td style="color: #64748b; padding: 2px 0;">Payment Settlement Date:</td><td style="color: #0f172a; text-align: right;">${this.formatDateIndian(receipt.date)}</td></tr>
              <tr><td style="color: #64748b; padding: 2px 0;">Payment Method:</td><td style="font-weight: 600; color: #0f172a; text-align: right;">${receipt.paymentMethod || 'UPI / Bank Transfer'}</td></tr>
              <tr><td style="color: #64748b; padding: 2px 0;">Bank UTR / Reference:</td><td style="font-family: monospace; color: #0f172a; text-align: right;">${receipt.referenceNo || 'Verified'}</td></tr>
            </table>
          </div>
        </div>

        <!-- PAYMENT SUM BLOCK -->
        <div style="background: rgba(16, 185, 129, 0.06); border: 2px solid #10b981; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #047857; text-transform: uppercase;">AMOUNT RECEIVED:</div>
              <div style="font-size: 26px; font-weight: 800; font-family: monospace; color: #065f46; margin-top: 2px;">
                ${this.formatCurrency(amount)}
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b;">REMAINING BALANCE DUE:</div>
              <div style="font-size: 18px; font-weight: 700; font-family: monospace; color: ${balance > 0 ? '#b45309' : '#059669'}; margin-top: 2px;">
                ${balance > 0 ? this.formatCurrency(balance) : '₹0 (Settled)'}
              </div>
            </div>
          </div>
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed rgba(16, 185, 129, 0.4); font-size: 12px; color: #047857;">
            <strong>Amount in Words:</strong> <em>${words}</em>
          </div>
        </div>

        <!-- REMITTANCE VERIFICATION -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 24px; font-size: 11px; color: #475569;">
          <div><strong>Beneficiary Settlement Account:</strong> ${this.companyProfile.accountName} • ${this.companyProfile.bankName} (UPI: ${this.companyProfile.upiId})</div>
          <div style="margin-top: 4px;">Payment received and verified into MaxEco operating treasury account in accordance with RBI cash-basis accounting protocols.</div>
        </div>

        <!-- SIGNATURE BLOCK -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 24px; padding-top: 16px; border-top: 1px dashed #cbd5e1;">
          <div>
            <div style="font-size: 11px; color: #64748b;">Electronic Computer Generated Receipt</div>
            <div style="font-size: 10px; color: #94a3b8;">MaxEco ERP Business Operating System</div>
          </div>
          <div style="text-align: right;">
            <div style="border-bottom: 1px solid #94a3b8; height: 35px; width: 180px; margin-left: auto;"></div>
            <div style="font-size: 11px; font-weight: 700; color: #334155; margin-top: 4px;">For ${this.companyProfile.name}</div>
            <div style="font-size: 10px; color: #64748b;">Authorized Accounts Signatory</div>
          </div>
        </div>
      </div>
    `;
  }
}

// Global initialization
const invoiceController = new InvoiceController();
if (typeof window !== 'undefined') {
  window.InvoiceController = InvoiceController;
  window.invoiceController = invoiceController;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InvoiceController;
}
