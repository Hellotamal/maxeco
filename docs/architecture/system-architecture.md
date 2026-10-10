# MaxEco Energy & Tech — Business Operating System
## System Architecture & Technical Specifications

**Version:** 1.0 (Production Packaged)  
**Location:** Guwahati, Assam, India  
**Target Organization:** MaxEco Energy & Tech (Founder-led Solar Advisory & Digital Services)  
**Operating Cost:** ₹0 / month (Local-first, Zero Recurring Infrastructure)

---

## 1. System Architecture

The MaxEco Operating System is engineered as a **local-first, zero-cloud-cost, client-side web application** that operates natively on any desktop, laptop, or mobile browser without requiring virtual machines, server runtimes, paid database licenses, or internet connectivity.

```mermaid
flowchart TD
    subgraph ClientRuntime["Browser Client Runtime (Desktop / Tablet / Mobile)"]
        UI["Modern Web Interface (HTML5 / Vanilla JS / CSS3)"]
        Router["Client-Side Router (Hash-based Routing)"]
        AuthGate["Founder Security Gate (PIN Authentication)"]
        
        subgraph CoreControllers["Core Application Controllers"]
            CRM["Sales CRM Controller (Pipeline, Follow-ups, WhatsApp Links)"]
            Calc["Solar Sizing Engine (APDCL Model, Assam Solar Factor)"]
            Finance["Finance Controller (Cash-Basis, 90-Day Forecast, Tax Reserve)"]
            Projects["Project Tracker (Solar Milestones & IT Vault)"]
            Storage["Storage Controller (CRUD, JSON Backup, CSV Export)"]
        end

        subgraph LocalPersistence["Local-First Storage"]
            LStore[("Browser LocalStorage\nKey: maxeco_os_database_v1")]
            SessionStore[("Browser SessionStorage\nSession Auth State")]
        end
    end

    subgraph ExternalHumanActions["Founder-Supervised External Actions (Approval Gates)"]
        WhatsApp["WhatsApp Web / App (Click-to-Chat with Pre-Drafted Text)"]
        CA["Chartered Accountant / Tax Filing (CSV Reports Export)"]
        JSONBackup["Offline Safe Storage (JSON Backup Downloads)"]
    end

    Router --> AuthGate
    AuthGate --> CoreControllers
    UI --> Router
    CoreControllers <--> LocalPersistence
    CRM -.-> WhatsApp
    Storage -.-> JSONBackup
    Storage -.-> CA
```

---

## 2. Application Architecture

1. **Presentation Layer (`public/index.html` & `src/css/style.css`)**:
   - Single unified HTML bundle offering dual roles:
     - **Public Web Portal**: Customer-facing showcase for Solar Advisory and IT services, interactive Guwahati Solar Sizing Calculator, and WhatsApp contact intake.
     - **Private Business Operating System**: Secure founder command center with real-time liquidity indicators, lead pipeline, quotations, invoicing, expense tracking, and milestone delivery.
   - Clean, professional design system tailored for renewable energy and modern tech with high contrast, responsive grid layouts, and zero heavy front-end frameworks.

2. **Controller Layer (`src/js/`)**:
   - Modular, object-oriented controllers with clear separation of concerns:
     - `storage.js`: Persistence, transactions, data serialization, schema upgrades, and CSV/JSON exports.
     - `calculator.js`: Solar physics, regional insolation models (~120 units/kWp/mo in Assam), and APDCL tariff economics.
     - `crm.js`: Stage management, search, filtering, overdue follow-up alerts, and WhatsApp message formatting.
     - `finance.js`: Strict cash-basis accounting calculations, 90-day rolling cash forecast, tax reserve isolation, and personal drawings.
     - `projects.js`: Milestones for solar EPC installations and IT website deliverables.
     - `app.js`: Master router, PIN authorization lifecycle, modal controllers, and notification toasts.

3. **Persistence Layer**:
   - Web Storage API (`localStorage` for durable database records, `sessionStorage` for temporary session credentials).
   - Instant load time (< 50ms) and zero network latency.

---

## 3. Module Architecture

```mermaid
graph TD
    A["MaxEco Operating System"] --> B["Module 01: Public Portal"]
    A --> C["Module 02: Sales CRM"]
    A --> D["Module 03: Solar Engineering & Advisory"]
    A --> E["Module 04: Finance & Cash Flow"]
    A --> F["Module 05: Project Execution"]
    A --> G["Module 06: Administration & Backup"]

    B --> B1["Services Showcase"]
    B --> B2["Interactive Solar Calculator"]
    B --> B3["WhatsApp Enquiry Intake"]

    C --> C1["Lead Pipeline (9 Stages)"]
    C --> C2["Overdue Action Scheduler"]
    C --> C3["Mandatory Lost Reason Analytics"]

    D --> D1["APDCL Sanctioned Load Sizing"]
    D --> D2["Rooftop Area Shadow Check"]
    D --> D3["25-Year Financial & Payback Model"]

    E --> E1["Cash vs Invoiced Separation"]
    E --> E2["18% Tax Reserve Isolation"]
    E --> E3["Founder Personal Drawings Log"]
    E --> E4["90-Day Rolling Forecast"]

    F --> F1["Solar EPC Milestones (NOC, Mounting, CEIG)"]
    F --> F2["IT Retainers & Local Credential Vault"]

    G --> G1["PIN Security Gate"]
    G --> G2["One-Click JSON Backup & Restore"]
    G --> G3["CSV Accounting Exports for CA"]
```

---

## 4. Data Models & Relationships

```mermaid
erDiagram
    LEAD ||--o{ QUOTATION : "generates"
    QUOTATION ||--o{ INVOICE : "converts to"
    INVOICE ||--o{ PAYMENT : "collects"
    LEAD ||--o{ PROJECT : "initiates"
    PROJECT ||--o{ EXPENSE : "incurs direct cost"
    EXPENSE }o--|| FINANCE_CATEGORY : "categorized by"
    DRAWING }o--|| FOUNDER_EQUITY : "reduces cash balance"

    LEAD {
        string id PK
        string name
        string contactPerson
        string phone
        string email
        string location
        string customerType
        string service
        string source
        number estimatedValue
        string stage
        string lostReason
        string nextFollowUpDate
        string nextAction
        string notes
    }

    QUOTATION {
        string id PK
        string leadId FK
        string clientName
        string service
        number totalAmount
        number directCostEstimate
        number projectedMargin
        string status
        string terms
    }

    INVOICE {
        string id PK
        string clientName
        string service
        number amountBilled
        number amountCollected
        string dueDate
        string status
        string paymentMethod
        string referenceNo
    }

    EXPENSE {
        string id PK
        string date
        string category
        string description
        number amount
        string paidTo
        string linkedProject FK
    }

    DRAWING {
        string id PK
        string date
        number amount
        string purpose
        string account
    }

    PROJECT {
        string id PK
        string clientName
        string type
        number contractValue
        number collectedAmount
        string status
        json milestones
        string vaultNotes
    }
```

---

## 5. Financial Integrity Rules

1. **Cash-Basis Revenue Recognition**:
   - An unpaid invoice is categorized strictly as an **Outstanding Receivable**.
   - It is **never** added to the Available Cash Balance.
2. **Customer Advance Obligations**:
   - Cash advances received from clients are recorded with matching project milestones and direct fulfillment obligations.
   - Advance money cannot be treated as discretionary profit.
3. **Statutory Tax Reserve Isolation**:
   - An automatic 18% reserve (configurable in settings) is deducted from all collected cash into a quarantined Tax Reserve indicator.
   - The founder is prevented from confusing tax obligations with operational spending power.
4. **Founder Personal Drawings Isolation**:
   - Personal withdrawals for household living expenses are logged separately in the `drawings` register.
   - This prevents commingling business working capital with personal expenditures.
5. **Liquidity Formula**:
   $$\text{Available Cash} = \text{Cash Collected} - \text{Direct Costs} - \text{Operating Overheads} - \text{Tax Reserve} - \text{Drawings}$$

---

## 6. Solar Advisory Engineering Parameters (Assam / APDCL)

- **Regional Solar Generation Factor**: $\approx 120 \text{ kWh / kWp / month}$ ($4.0 \text{ kWh / kWp / day}$ effective peak sun hours).
- **APDCL Net-Metering Cap**: Sanctioned solar capacity cannot exceed $100\%$ of consumer sanctioned load under AERC regulations, subject to local distribution transformer headroom.
- **Rooftop Area Footprint**: $\approx 95 \text{ sq. ft.}$ of shadow-free south-facing area per $1 \text{ kWp}$ of Tier-1 crystalline panels.
- **APDCL Benchmark Tariffs**:
  - Commercial LT: ₹7.85 / unit
  - Domestic: ₹6.20 / unit
  - Industrial LT/HT: ₹7.20 / unit
- **Investment Benchmark in Northeast India**: ₹48,000 to ₹58,000 per kWp for turnkey on-grid systems.
- **Mandatory Engineering Disclaimer**: All public calculations display the caveat: *"Preliminary advisory calculations. Final capacity subject to physical shadow analysis and APDCL transformer capacity approval."*

---

## 7. Security & Privacy Architecture

1. **Air-Gapped Client-Side Execution**:
   - Customer leads, business proposals, financial revenues, and project credentials never leave the founder's physical device.
   - Zero telemetry, zero external trackers, zero third-party advertising scripts.
2. **Founder Access Control**:
   - Sensitive business modules are guarded by the Founder Security Gate (`PIN: maxeco2026`).
   - Session tokens are stored in `sessionStorage` and expire immediately upon closing the browser tab or clicking "Lock Founder OS".
3. **Approval Gates for Communications**:
   - No automatic emails or background WhatsApp transmissions occur without human oversight.
   - All client contact links pre-fill a draft message into WhatsApp Web / Desktop for the founder to review, edit, and send manually.

---

## 8. Backup & Business Continuity Architecture

1. **One-Click JSON Backup**:
   - Serializes the entire database into a clean, human-readable file: `maxeco-os-backup-YYYY-MM-DD.json`.
   - Restorable anytime on any device by choosing the file in the Settings tab.
2. **Chartered Accountant CSV Exports**:
   - Instant export of Invoices, Expenses, and Leads formatted for Excel and accounting software.
   - Streamlines quarterly GST filings and annual income tax assessments.
3. **Zero Maintenance Burden**:
   - No database server to patch, no Docker daemon to maintain, and no cloud hosting bills.
