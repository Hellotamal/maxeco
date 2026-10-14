const fs = require('fs');
const path = require('path');

const srcHtml = fs.readFileSync('public/index.html', 'utf8');
const lines = srcHtml.split(/\r?\n/);

const privateStart = lines.findIndex(l => l.includes('<main id="private-dashboard"'));
const scriptStart = lines.findIndex(l => l.includes('<script src="../src/data/initial-data.js">'));

if (privateStart === -1 || scriptStart === -1) {
  console.error('Failed to locate private-dashboard or scriptStart');
  process.exit(1);
}

// Slice out the entire private dashboard and modals section (lines ~510 to 4434)
let privateContent = lines.slice(privateStart, scriptStart).join('\n');

// Replace relative paths
privateContent = privateContent.replace(/src="assets\//g, 'src="./assets/');
privateContent = privateContent.replace(/href="assets\//g, 'href="./assets/');

const erpHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MaxEco ERP &amp; Founder OS | Enterprise Operations &amp; CAFM</title>
  <!-- Security: Prevent indexing of internal business management application -->
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">

  <link rel="icon" type="image/png" href="./assets/logo-emblem.png">
  <link rel="apple-touch-icon" href="./assets/logo-emblem.png">
  <link rel="stylesheet" href="./css/style.css">

  <style>
    /* Dedicated ERP Styles & Security Gateway */
    :root {
      --erp-primary: #0f172a;
      --erp-accent: #f59e0b;
      --erp-card-bg: #1e293b;
      --erp-border: #334155;
    }

    body {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--bg-body, #0b1120);
      color: var(--text-primary, #f8fafc);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
    }

    .erp-top-header {
      background: rgba(15, 23, 42, 0.95);
      border-bottom: 1px solid var(--border-color, #334155);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 10px 0;
    }

    .erp-login-container {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .erp-login-card {
      width: 100%;
      max-width: 480px;
      background: var(--bg-card, #1e293b);
      border: 1px solid var(--border-color, #334155);
      border-radius: 12px;
      padding: 36px 32px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .data-safety-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 20px;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .hidden { display: none !important; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  </style>
</head>
<body>

  <!-- Top Navigation Bar -->
  <header class="erp-top-header">
    <div class="container flex justify-between items-center" style="display: flex; justify-content: space-between; align-items: center; max-width: 1400px; margin: 0 auto; padding: 0 16px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <a href="#dashboard" style="text-decoration: none; display: flex; align-items: center; gap: 10px;">
          <div style="width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
            <img src="./assets/logo-emblem.png" alt="MaxEco Logo" style="width: 100%; height: 100%; object-fit: contain;" onerror="if(window.LOGO_EMBLEM_DATA_URI) this.src=window.LOGO_EMBLEM_DATA_URI">
          </div>
          <div>
            <div style="font-size: 15px; font-weight: 800; color: #f8fafc; letter-spacing: -0.2px;">
              MaxEco <span style="color: #f59e0b;">ERP &amp; CAFM</span>
            </div>
            <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">
              Business Operating System • Private Enterprise
            </div>
          </div>
        </a>
      </div>

      <!-- Private Nav Links (Visible when authenticated) -->
      <nav id="private-nav-links" class="flex items-center gap-1 nav-menu hidden" style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
        <a href="#dashboard" class="nav-link active">Overview</a>
        <a href="#leads" class="nav-link">Leads &amp; CRM</a>
        <a href="#quotes-invoices" class="nav-link">Quotes &amp; Invoices</a>
        <a href="#finance" class="nav-link">Cash Flow</a>
        <a href="#solar-feasibility" class="nav-link">☀️ Solar Engine</a>
        <a href="#projects" class="nav-link">Projects &amp; ERP</a>
        <a href="#cafm" class="nav-link">🏢 Facilities &amp; CAFM</a>
        <a href="#settings" class="nav-link">Settings &amp; Backup</a>
      </nav>

      <!-- Top Utility / Auth Controls -->
      <div style="display: flex; align-items: center; gap: 10px;">
        <div id="data-status-badge" class="data-safety-pill">
          <span>🟢</span> Storage: Offline-First Local Store
        </div>
        <a href="../" class="btn btn-secondary btn-sm" style="font-size: 11px; text-decoration: none;" title="Open Public Corporate Website">
          🌐 Public Site
        </a>
        <button id="btn-auth-toggle" class="btn btn-secondary btn-sm" style="font-size: 11px;" onclick="app.lockSession()">
          🔒 Lock ERP
        </button>
      </div>
    </div>
  </header>

  <!-- ======================================================== -->
  <!-- DEDICATED ERP AUTHENTICATION GATEWAY (WHEN UNLOGGED)     -->
  <!-- ======================================================== -->
  <section id="erp-login-gateway" class="erp-login-container">
    <div class="erp-login-card">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 56px; height: 56px; margin: 0 auto 12px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 26px;">
          🔒
        </div>
        <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 6px; color: #f8fafc;">
          MaxEco Business Command Center
        </h2>
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          Restricted Founder &amp; Operations Access • Guwahati, Assam
        </p>
      </div>

      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 8px; padding: 14px; margin-bottom: 20px; font-size: 11px; line-height: 1.5; color: #cbd5e1;">
        <strong style="color: #38bdf8;">🛡️ Data Safety Guarantee:</strong>
        Business records (CRM leads, quotes, invoices, assets, compliance) are stored offline-first in browser storage and your synced database. Updating the public website or pushing Git commits will never delete your data.
      </div>

      <form id="erp-login-form" onsubmit="event.preventDefault(); app.verifyPinFromGateway();">
        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label" style="font-size: 11px; font-weight: 600; color: #94a3b8;">Operator Role</label>
          <select id="erp-operator-role" class="form-control" style="width: 100%; padding: 8px 12px; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px;">
            <option value="founder">Founder &amp; Managing Director</option>
            <option value="cafm_manager">CAFM &amp; Facility Operations Manager</option>
            <option value="solar_engineer">Solar EPC Project Engineer</option>
            <option value="auditor">Auditor &amp; Read-Only Executive</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label" style="font-size: 11px; font-weight: 600; color: #94a3b8;">Security PIN / Passcode</label>
          <input type="password" id="erp-gateway-pin" class="form-control" placeholder="Enter Security Access PIN" required style="width: 100%; padding: 10px 14px; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; font-size: 14px;">
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 11px; font-weight: 700; font-size: 13px; background: #f59e0b; color: #0f172a; border: none; border-radius: 6px; cursor: pointer;">
          🔑 Unlock Business Command Center
        </button>
      </form>

      <div style="border-top: 1px solid #334155; margin-top: 24px; padding-top: 16px; display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
        <span style="color: #64748b;">Data Recovery:</span>
        <button type="button" class="btn btn-secondary btn-sm" style="font-size: 10px;" onclick="storage.triggerRestoreFilePicker()">
          📥 Restore from JSON Backup
        </button>
      </div>
    </div>
  </section>

  <!-- ======================================================== -->
  <!-- MAIN PRIVATE ERP DASHBOARD (VISIBLE WHEN AUTHENTICATED)  -->
  <!-- ======================================================== -->
  <div id="erp-authenticated-view" class="hidden">
    ${privateContent}
  </div>

  <!-- Hidden dummy public-portal to satisfy any legacy DOM lookups -->
  <div id="public-portal" class="hidden"></div>

  <!-- Hidden File Input for 1-Click JSON Database Restore -->
  <input type="file" id="global-restore-file-input" accept=".json" style="display: none;" onchange="storage.handleRestoreFile(event)">

  <!-- Fixed Toast Notification Container -->
  <div id="toast-container"></div>

  <!-- Application Scripts (Zero External Dependencies, All Relative Paths) -->
  <script src="./data/initial-data.js"></script>
  <script src="./data/payment-qr-data.js"></script>
  <script src="./data/signature-data.js"></script>
  <script src="./data/logo-data.js"></script>
  <script src="./js/storage.js"></script>
  <script src="./js/calculator.js"></script>
  <script src="./js/crm.js"></script>
  <script src="./js/finance.js"></script>
  <script src="./js/invoice.js"></script>
  <script src="./js/projects.js"></script>
  <script src="./js/operations.js"></script>
  <script src="./js/cafm.js"></script>
  <script src="./js/app.js"></script>
</body>
</html>
`;

fs.writeFileSync('public/erp/index.html', erpHtml, 'utf8');
console.log('Successfully generated public/erp/index.html');
