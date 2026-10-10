# MaxEco Business Operating System — Comprehensive Implementation Plan

**Client**: MaxEco Energy & Tech  
**Founder Location**: Guwahati, Kamrup Metropolitan, Assam, India (Northeast India)  
**Author**: Senior Full-Stack Developer & Business Systems Architect  
**Version**: `1.0.0-PROPOSAL`  
**Status**: Pending Founder Review & Approval Gate  
**Target Environment**: Windows 11 Desktop + Mobile Browsers (Offline / Local First)

---

## 1. Executive Summary & Strategic Context

MaxEco Energy & Tech is a founder-led enterprise operating out of Guwahati, Assam, offering:
1. **Solar Energy Consulting & Project Advisory**: Commercial & Industrial (C&I) solar advisory, CAPEX/OPEX feasibility, net metering liaison with APDCL and regional Northeast DISCOMs.
2. **Solar EPC Business Development & Project Coordination**: Partner-driven delivery coordination, vendor evaluation, milestone oversight.
3. **Small-Business Websites & IT Consulting**: Fast, modern, responsive websites for local SMBs, professionals, and institutions in Assam and Northeast India.
4. **Website Maintenance & Basic AI Workflow Automation**: Retainer-based maintenance, document processing, and basic business workflow automation.

### Current Operating Reality
- **Team**: Solo founder operating alongside external project execution partners.
- **Financial Profile**: Zero current revenue, bootstrap capital, strictly low-cost operating model.
- **Core Directive**: **Zero unnecessary enterprise overhead**. No costly SaaS subscriptions, no heavy multi-gigabyte virtual machines, no complex multi-tenant servers, and no unapproved recurring fees.
- **Priority Hierarchy**: **Lead Generation $\rightarrow$ Quotations & Pipeline $\rightarrow$ Customer Cash Collections $\rightarrow$ Cash-Flow Visibility & Tax Reserves $\rightarrow$ Project Handover**.

---

## 2. Environment & Technical Audit (Step 1 Findings)

| Attribute | Detected Value | Assessment & Architecture Recommendation |
|---|---|---|
| **Operating System** | Windows 11 Home 64-bit | Local-first browser-accessible responsive application. |
| **Node.js** | Node.js `v24.20.0` | Modern JavaScript/TypeScript runtime for bundling and server hosting. |
| **npm** | `11.19.0` | Standard package management. |
| **Python** | `Python 3.14.7` | Python runtime available for local background utilities and mock servers. |
| **Git** | `git version 2.56.0.windows.1` | Git repository to be initialized cleanly with explicit version history. |
| **Existing Workspace** | `C:\Users\ramat\OneDrive\Desktop\ERP Packaged` | Directory verified and initialized. |
| **Preservation Rule** | Baseline assets preserved | Historical research and reference data retained intact in AppData artifacts. |

---

## 3. Proposed Technology Stack: Practical, Fast, Low-Cost

We propose a **modular, standalone, single-port or local static-served Single Page Application (SPA) with a lightweight local data persistence engine**:

```
+-----------------------------------------------------------------------------------+
|                        MAXECO BUSINESS OPERATING SYSTEM                           |
|                                                                                   |
|  +-------------------------------------+   +------------------------------------+ |
|  |         PUBLIC WEBSITE              |   |     PRIVATE FOUNDER DASHBOARD      | |
|  |   - Home (Hero, Value Prop)         |   |   - Executive Real-Time BI & KPIs  | |
|  |   - Solar Services (C&I, Advisory)  |   |   - Sales CRM (Pipeline & Leads)   | |
|  |   - IT & Website Services (SMB)     |   |   - Quotations & Invoices Register | |
|  |   - About MaxEco (Guwahati Focus)   |   |   - Cash Collections Tracker       | |
|  |   - Contact & Direct WhatsApp CTA   |   |   - Expenses & Delivery Costs      | |
|  |   - Interactive Solar Estimator     |   |   - Tax Reserve & Withdrawals      | |
|  |   - Instant Lead Capture Form       |   |   - 90-Day Cash Flow Forecast      | |
|  +-------------------------------------+   |   - Solar EPC Project Tracker      | |
|                                            |   - IT & Web Project Tracker       | |
|                                            |   - Export / Import JSON & CSV     | |
|                                            +------------------------------------+ |
|                                                                                   |
|  +------------------------------------------------------------------------------+ |
|  | LOCAL PERSISTENCE ENGINE (LocalStorage + IndexedDB + JSON/CSV Export/Backup) | |
|  | Optional: Zero-cost Node.js / Python local server with password protection    | |
|  +------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------+
```

### Why This Stack?
1. **Zero Recurring Cost**: Runs 100% locally on your computer and phone via browser without hosting charges, domain renewals, or database subscription fees.
2. **Speed & Responsiveness**: Instant page loads (<50ms), mobile-optimized for site visits in Guwahati or customer meetings across Assam.
3. **Offline Resilience**: Works without active internet connectivity during field site surveys or rural travel.
4. **Data Ownership & Privacy**: All client names, financial figures, quotes, and bank collections remain strictly on your local disk; zero third-party cloud leaks.
5. **Human Approval Safeguard**: No automated emailing, SMS, or WhatsApp bots that trigger without your review. WhatsApp links open with pre-filled drafted text in your own app so you review before hitting Send.

---

## 4. Module Architecture & Functional Specifications

### Module A: Public Website
- **Target Market**: Commercial businesses, institutions, tea estates, schools, hotels, and SMBs in Guwahati, Assam, and the Northeast.
- **Key Sections**:
  - **Header / Navigation**: Brand logo, Navigation links, "Get a Free Consultation" CTA, Direct WhatsApp shortcut button.
  - **Hero Section**: Pragmatic positioning — *Empowering Northeast India's Transition to Clean Energy & Modern Digital Presence*.
  - **Solar Advisory & Consulting**: Rooftop solar viability, CAPEX vs RESCO models, APDCL net-metering guidance, CEIG compliance advisory.
  - **IT & Web Services**: Fast, high-converting professional websites for small businesses, local SEO, Google Business profile setup, automated customer capture.
  - **Interactive Solar Sizing Calculator (Guwahati / NER Specific)**: Sizing based on APDCL tariff slabs, sanctioned load, and Northeast solar irradiation (3.8–4.2 kWh/m²/day). Includes transparent disclaimer of assumptions.
  - **About MaxEco**: Founder-led ethos, grounded local execution in Assam, external engineering partner network. No fake certifications or fabricated numbers.
  - **Contact & Enquiry Form**: Validated intake (Name, Phone, Email, Service Needed, City/District, Estimated Monthly Bill), instant handoff to local storage and direct WhatsApp launcher.

### Module B: Private Business Dashboard
- **Access Control**: Password-protected gate. Session stored in secure local state.
- **Top Metrics (Indian Rupee `₹` Formatting)**:
  - Total Active Pipeline Value
  - Actual Cash Collected (Bank / Cash in hand)
  - Outstanding Receivables (Delivered vs Unpaid)
  - Unearned Customer Advances (Obligated Delivery Balance)
  - Tax Reserve Set-Aside (18% GST / Advance Tax provision)
  - Net Available Operating Balance
  - Personal Drawings to Date
- **Quick Action Bar**: New Lead, New Quote, Record Payment, New Project, Backup Database.

### Module C: Sales CRM
- **Fields**: Lead ID (`LEAD-2026-XXXX`), Contact Name, Company/Business, Mobile Phone, Email, Location (Guwahati, Dibrugarh, Silchar, Jorhat, etc.), Service Category (`Solar Advisory`, `Solar EPC Coordination`, `SMB Website`, `Web Maintenance/AI Automation`), Lead Source (`Referral`, `Direct Outreach`, `Website Form`, `WhatsApp`, `Partner`), Estimated Deal Value (`₹`), Current Stage, Last Contact Date, Next Follow-Up Date, Next Action, Strategy Notes.
- **Stages**: `New`, `Contacted`, `Meeting Scheduled`, `Qualified`, `Proposal Sent`, `Negotiation`, `Won`, `Lost`, `Follow-up Later`.
- **Governance**: Moving a deal to `Lost` prompts a mandatory Reason Code (e.g. Budget Constraints, Competitor, Project Postponed). Moving to `Won` prompts one-click creation of a Project and Billing record.

### Module D: Strict Finance & Cash-Flow Controls
- **Accounting Principle**: **Cash-basis reality with accrual transparency**.
  - **Quoted Value**: Total prospective contract sum.
  - **Invoiced Value**: Legally billed amount against milestone deliverables.
  - **Actual Cash Collected**: Realized funds cleared in the bank. (Never recognized prematurely).
  - **Customer Advances**: Tracked as a delivery liability until milestone signoff, preventing false profit assumptions.
  - **Direct Project Costs**: Subcontractor fees, hardware supply costs, site survey expenses.
  - **Gross Profit**: Billed Deliverables less Direct Costs.
  - **Operating Overheads**: Internet, local travel, phone, software tools.
  - **Tax Reserve**: Configurable reserve (e.g. 18% GST or estimated income tax) calculated automatically and locked away from available spending.
  - **Personal Drawings**: Dedicated tracker for founder drawings for living expenses, giving clear visibility into personal vs business cash.
- **90-Day Rolling Cash Flow Engine**:
  - Highlights projected dips below minimum cash threshold.
  - Flags overdue customer collections with color-coded severity.

### Module E: Solar Project Tracker
- **Project Profile**: Customer Name, Installation Site Address, DISCOM (`APDCL`, `MePDCL`, `TSECL`, etc.), Consumer Account Number, Sanctioned Load (kW), Proposed Solar System Capacity (kWp).
- **Assumptions Panel**: Specific generation assumptions (e.g., 1 kWp $\approx$ 120 units/month in Assam climate), tilt angle, structure type (RCC Flat Roof, Tin Shed, Elevated), Net Metering status with APDCL sub-division.
- **Milestones**: Site Audit & Feasibility $\rightarrow$ Layout Design & Costing $\rightarrow$ Vendor Procurement $\rightarrow$ Civil & Structural Installation $\rightarrow$ Electrical & Inverter Wiring $\rightarrow$ Net Metering & CEIG Inspection $\rightarrow$ Final Handover.
- **Payment Linkage**: Customer payment stages tied directly to construction milestones.

### Module F: IT & Website Project Tracker
- **Project Profile**: Client Business Name, Website Scope (1-Page Starter, 5-Page SMB, Service Booking, E-Commerce), Domain & Hosting Ownership (Client-owned vs MaxEco-managed), External Developer/Partner Costs.
- **Credential & Secret Vault**: Separation of sensitive hosting/domain credentials from notes. Masked inputs with local master key unlock.
- **Lifecycle Checklist**: Brief & Content Received $\rightarrow$ Mockup Approval $\rightarrow$ Development $\rightarrow$ Client Review $\rightarrow$ Mobile & Speed Test $\rightarrow$ Launch & Handover $\rightarrow$ Maintenance Retainer.

---

## 5. Security, Privacy & Backup Specifications

1. **Zero Secret Leakage**: No API keys, credentials, or customer financial records exposed in public client bundles.
2. **Local Backup Engine**:
   - **1-Click Full JSON Export**: Downloads complete operational state (leads, projects, financials, settings) in a timestamped file (`maxeco_backup_YYYY-MM-DD.json`).
   - **1-Click Restore**: Validates schema and restores system state safely.
   - **CSV Export**: Individual spreadsheets for Leads, Invoices, Expenses, and Cash Flow for easy offline analysis or filing with a local Chartered Accountant (CA).
3. **Data Storage Integrity**: Dual-layer persistence using browser `localStorage` and `IndexedDB` with automated validation guards.

---

## 6. Service & Cost Analysis (Zero-Cost Baseline)

| Component | Recommended Solution | Setup Cost | Monthly / Ongoing Cost | Paid Alternatives (Only If Desired Later) |
|---|---|:---:|:---:|---|
| **Local Runtime** | Modern Browser / HTML5 / Local Web Engine | **₹0.00** | **₹0.00** | None needed |
| **Domain Name** | Optional later (e.g., `maxeco.in` via INRegistry) | **₹0.00** | **₹0.00** | ~₹600–₹800/year when ready to launch public domain |
| **Public Hosting** | Local test preview first; Cloudflare Pages / GitHub Pages / Vercel Free Tier when ready | **₹0.00** | **₹0.00** | Standard free tiers are 100% adequate |
| **Database** | Local Storage + Encrypted File Backup | **₹0.00** | **₹0.00** | Supabase Free Tier (500MB) if multi-device sync is requested |
| **WhatsApp Lead Link** | Standard WhatsApp Click-to-Chat URI (`wa.me`) | **₹0.00** | **₹0.00** | Paid WhatsApp Business API (unnecessary for solo founder) |
| **Email** | Standard Gmail / Manual Client Dispatch | **₹0.00** | **₹0.00** | Google Workspace (₹125/user/mo) only when corporate domain is live |
| **Total Immediate Cash Required** | **₹0.00** | **₹0.00** | Zero capital expenditure |

---

## 7. Phased Implementation Roadmap & Approval Gates

- [x] **Stage 1**: Inspection, Audit, and Written Implementation Plan (**Current Step**).
- [ ] **Stage 2**: Public Website (Responsive, Guwahati/Assam focused, Solar & IT services, Interactive Sizing Calculator, WhatsApp CTA).
- [ ] **Stage 3**: Private Admin Authentication & CRM (Leads, Stages, Search, Filters, Lost Reason Codes).
- [ ] **Stage 4**: Finance Engine & 90-Day Cash-Flow Dashboard (Collected vs Invoiced, Delivery Cost, Tax Reserve, Personal Drawings).
- [ ] **Stage 5**: Solar EPC & IT Project Trackers (Milestones, Assumptions, Credential Vault, Handover).
- [ ] **Stage 6**: Backup & Restore (JSON / CSV Exports) + Local Host / Preview Script.
- [ ] **Stage 7**: Quality Assurance, Accessibility, Mobile Viewport & Security Verification.
- [ ] **Stage 8**: Final Delivery Review and User Runbook.

---

## 8. Files to be Created

```
C:\Users\ramat\OneDrive\Desktop\ERP Packaged\
├── docs\
│   └── maxeco-os-implementation-plan.md   <-- Detailed Technical & Business Plan
├── public\
│   └── index.html                         <-- High-Performance Unified Responsive App (Public Web + Admin Dashboard)
├── src\
│   ├── css\style.css                      <-- Premium, restrained renewable-energy design system
│   ├── js\
│   │   ├── app.js                         <-- State manager, router, authentication gate
│   │   ├── crm.js                         <-- Lead pipeline & follow-up controller
│   │   ├── finance.js                     <-- Cash flow, invoices, tax reserve, drawings controller
│   │   ├── projects.js                    <-- Solar & IT project milestone controllers
│   │   ├── storage.js                     <-- Local persistence, JSON backup & CSV export
│   │   └── calculator.js                  <-- Assam solar radiation & sizing engine
│   └── data\initial-data.js               <-- Realistic demo seed data for immediate evaluation
├── .env.example                           <-- Sample environment configuration template
└── README.md                              <-- System Manual, Operator Guide & FAQ
```

---

## 9. Definition of Done & Success Criteria

1. **Lead Intake**: New web enquiries captured locally with instant WhatsApp trigger.
2. **Sales Pipeline**: Full visibility of every lead with overdue follow-up alerts.
3. **Cash Flow Certainty**: Distinguishes between paper revenue and cash in bank; displays personal drawings vs business capital.
4. **Project Execution**: Tracks solar and IT milestones without complex ERP overhead.
5. **Data Portability**: Full backup and restore via standard JSON/CSV files.
6. **Cost Control**: 100% operational with **₹0 initial capital expenditure**.
