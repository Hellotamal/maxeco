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
