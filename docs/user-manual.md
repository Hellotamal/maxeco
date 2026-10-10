# MaxEco Energy & Tech — Business Operating System
## Complete Installation & User Operations Manual

**Organization:** MaxEco Energy & Tech  
**Headquarters:** Guwahati, Assam, India  
**Applicability:** Production Packaged Web Application  
**License:** Proprietary Founder Edition (Zero Recurring Software Cost)

---

## 1. Quick Start & Launch Guide

The MaxEco Operating System is engineered to run immediately on any computer running Windows, macOS, or Linux, as well as on Android or iOS mobile devices.

### Method A: Instant Zero-Install Launch (Recommended for Desktop)
1. Open Windows File Explorer and navigate to your project directory:  
   `C:\Users\ramat\OneDrive\Desktop\ERP Packaged\public`
2. Double-click the file: **`index.html`**
3. It will open immediately in your default web browser (Chrome, Edge, Firefox, or Brave).
4. No software installation, no command prompt, and no database configuration required.

### Method B: Local Web Server Launch (Optional for Mobile on Local Wi-Fi)
If you wish to access the application on your mobile phone or tablet over your home/office Wi-Fi network:
1. Open PowerShell in `C:\Users\ramat\OneDrive\Desktop\ERP Packaged`
2. Run:
   ```powershell
   npx serve public
   ```
   *(Or using Python: `python -m http.server 8080 --directory public`)*
3. The terminal will display your local network address (e.g., `http://192.168.1.15:3000`).
4. Open that URL on your phone browser.

---

## 2. Authentication & Security Access

- **Public View:** Visitors or prospective clients see the public showcase, services, solar sizing calculator, and WhatsApp inquiry buttons.
- **Private Founder Command Center:**
  - Click the **"🔑 Founder Login"** button in the top-right corner or the **"Founder OS"** link in the footer.
  - Enter the Founder Security PIN:
    ```
    maxeco2026
    ```
  - Upon unlocking, the full business dashboard, CRM leads, quotations, invoices, bank balances, and cash-flow registers become accessible.
  - When finished, click **"🔒 Lock Founder OS"** to secure your records immediately.

---

## 3. Daily Operational Workflows

### Workflow 1: Managing Inquiries & Leads (CRM)
1. Go to **"Leads & CRM"** from the top menu.
2. Click **"+ Add Lead"** to record new prospects (or review inquiries submitted automatically from the public website contact form).
3. Fill in:
   - Client / Business Name & Contact Person
   - Phone Number & Location (e.g., Guwahati, North Guwahati, Tezpur)
   - Service Interest (Solar EPC, Solar Advisory, SMB Website, Maintenance)
   - Deal Value & Stage
   - Next Follow-Up Date & Next Action
4. **1-Click WhatsApp Follow-up:** Click the green **💬 WhatsApp** button next to any lead. The system automatically prepares a polite, professional follow-up message in WhatsApp with the client's name and next action. Review and hit send!
5. **Marking a Deal as Lost:** If a prospect declines, change the stage to "Lost". The system will require you to log the **Lost Reason** (e.g., budget constraint, competitor chosen, APDCL transformer overloaded) so you can review and improve your win rate over time.

---

### Workflow 2: Quotes to Invoices & Cash Collections
1. Go to **"Quotes & Invoices"**.
2. **Create a Quotation:** Click **"+ New Quotation"** (or click **"📄 Quote"** directly on a lead card). Enter the quotation amount, estimated fulfillment costs, and milestone terms.
3. **Convert to Invoice:** Once the client accepts, click **"Convert to Invoice"**. The quote is marked accepted and an official invoice is created with a 14-day payment due date.
4. **Record Collection (Cash-Basis):** When the client pays an advance or final balance via UPI or bank transfer:
   - Click **"Record Payment"** next to the invoice.
   - Enter the exact amount received, payment method, and UPI transaction reference number.
   - The invoice balance updates automatically and reflects immediately in your real cash balance.
   - *Remember:* Unpaid invoices are tracked separately as receivables and are never counted as cash in hand until actually collected.

---

### Workflow 3: Controlling Cash Flow & Liquidity
1. Go to **"Cash Flow"** to view your financial command center:
   - **Net Available Cash:** True cash remaining after direct project costs, operating expenses, statutory tax reserves, and personal drawings.
   - **Tax Reserve (18%):** Automatically calculates your tax set-aside so you never spend money owed for GST or income tax.
2. **Log Business Expenses:**
   - Click **"+ Add Expense"**.
   - Categorize as **Direct Delivery Cost** (money paid to freelance developers, structural fabricators, or survey fuel for a specific project) or **Operating Overhead** (internet, office supplies).
3. **Log Personal Living Withdrawals:**
   - Click **"+ Log Withdrawal"** whenever you transfer money from the business account for personal living expenses.
   - Keeping personal living drawings separated protects your company from unexpected cash shortfalls.
4. **90-Day Rolling Forecast:** Review the 3 forward month cards. If any month predicts a negative cash balance, a red **"Deficit Alert"** appears, prompting you to accelerate pending invoice follow-ups or close new deals.

---

### Workflow 4: Solar Feasibility, PVGIS Simulation & Proposal Advisory
1. Open the **"Solar Calculator"** tab (accessible publicly and within the Founder OS).
2. Enter the client's commercial and site parameters:
   - **Sanctioned Connected Load with APDCL (kW)**: Ensures capacity does not violate the 100% net-metering limit.
   - **Average Monthly Electricity Bill (₹)** and **Tariff Category** (Commercial LT ~₹7.85, Domestic ~₹6.20, Industrial ~₹7.20).
   - **Available Rooftop Area (sq ft)**.
   - **Northeast District / Location**: Select from presets (Guwahati, Dibrugarh, Silchar, Tezpur, Jorhat, Shillong, Agartala) with satellite coordinates.
   - **Module Tilt Angle (°)**: Default 25° (optimal for Assam latitude) or lower slope for industrial sheds.
   - **Roof Orientation / Azimuth**: True South (0° optimal), South-East (-45°), South-West (+45°), or East/West (±90°).
   - **Near/Far Shading Derate**: Minimal (0%–3%), Minor (5%), Moderate (10%), or Significant (15%+).
   - **System Loss Factor**: Default 14% matching European Commission PVGIS standard.
3. Click **"Calculate Sizing & PVGIS Simulation"**.
4. The system calculates:
   - Recommended capacity (kWp) capped by APDCL sanctioned load and roof area.
   - Specific Yield ($kWh/kWp/year$) based on the PVGIS SARAH-2 satellite dataset.
   - Monthly & Annual generation units and bill savings.
   - Benchmark turnkey project investment range and payback period (years).
   - 25-Year cumulative savings and carbon offset.
   - **12-Month Seasonal Generation Profile**: Visualizes spring peaks and the monsoon dip (June–August).
5. **Verify in Official PVGIS Tool**: Click **"🌐 Open Official PVGIS Tool ↗"** to launch the European Commission PVGIS simulator pre-filled with the exact latitude, longitude, kWp capacity, tilt, and azimuth for third-party satellite verification.
6. **Proposal Feasibility Checklist**: Review the 5-point engineering checklist (Azimuth/Tilt verification, Shading survey, Wind Zone 5 load design, ALMM/BIS datasheets, and APDCL transformer headroom) before preparing formal quotes.
7. Click **"💬 Discuss Results on WhatsApp"** to share the personalized summary directly with your client.

---

### Workflow 5: Tracking Project Execution
1. Go to **"Projects"**.
2. **Solar EPC Projects:** Track your delivery pipeline through 6 key milestones:
   - Site Audit & Structural Feasibility
   - APDCL Net-Metering NOC Submission
   - Partner Equipment Procurement
   - Civil & Structural Mounting
   - Wiring, Inverter & CEIG Testing
   - Commissioning & Handover
   Update each milestone status (`Pending` → `In Progress` → `Completed`) to maintain transparent client communication.
3. **IT Projects & Credential Vault:** Track client website milestones and store sensitive server credentials (hosting logins, WordPress admin keys, domain DNS) in the **Secure Local Credential Vault**. These credentials remain stored strictly on your local machine and are never transmitted over the internet.

---

### Workflow 6: Data Backup, Recovery & Tax Export
1. Go to **"Settings & Backup"**.
2. **Download Regular Backups:**
   - Click **"💾 Download Full JSON Database Backup"** at least once a week or after major financial transactions.
   - Save the downloaded file to your local drive, external USB, or secure cloud storage.
3. **Restore Backup:**
   - If switching to a new laptop, simply open the app, go to Settings, choose your latest `.json` backup file, and click **"Restore Database"**. All your records restore in one click.
4. **Accounting & Tax Filing:**
   - Click **"📥 Export CSV"** on Invoices, Expenses, or Leads to generate clean spreadsheets formatted for your Chartered Accountant or GST returns.

---

## 4. Key Configuration Options

To customize company information, navigate to **Settings**:
- **Company Name:** Defaults to `MaxEco Energy & Tech`
- **Contact Phone & WhatsApp:** Update your preferred contact numbers
- **Tax Reserve Benchmark:** Defaults to 18% (can be adjusted according to your tax structure)
- **Founder Admin PIN:** Change the default `maxeco2026` PIN anytime to your own personal code
