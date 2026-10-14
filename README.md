# MaxEco Energy & Tech — Corporate Platform & Engineering Desk

> **Smarter Energy. Stronger Digital Growth.**  
> Practical clean energy advisory and digital solutions for commercial enterprises and growing businesses across Guwahati, Assam, and Northeast India.  
> **Headquarters**: Maligaon, Guwahati, Assam, Pin - 781011  
> **Contact**: +91 99544 93909 | **Email**: maxecoenergyit@gmail.com | **WhatsApp**: [Chat on WhatsApp](https://wa.me/919954493909)

---

## 🏛️ Business Positioning

MaxEco Energy & Tech is an independent engineering consultancy and digital solutions provider founded to help commercial enterprises, institutions, and businesses in Northeast India lower operating costs and build digital authority.

We operate through two focused divisions:

### Division A — Clean Energy Advisory & Solar Solutions
* **Rooftop Solar Opportunity Assessment**: Structural feasibility, shadow-gradient mapping, and optimal capacity sizing.
* **Commercial Electricity-Cost Analysis**: APDCL commercial and industrial tariff audit, Time-of-Day (ToD) optimization, and levelized cost benchmarking.
* **Solar Project Planning & Feasibility**: Single-line diagrams (SLD), Tier-1 hardware specification, and vendor evaluation.
* **APDCL Net-Metering & Regulatory Support**: Procedural guidance for DISCOM portal submission, bi-directional meter testing, and CEIG statutory compliance.
* **Preventive Solar O&M / AMC**: Scheduled maintenance, thermal imaging, and string inverter diagnostics for Northeast monsoon climates.

### Division B — Digital Growth & Technology Solutions
* **Corporate Website Design & Development**: Bespoke, high-performance multi-page React web architectures built without slow templates.
* **High-Converting Business Landing Pages**: Laser-focused commercial inquiry capture engineered for mobile speed and local credibility.
* **Northeast Local Search SEO Foundations**: Verified Schema.org structured data, canonical tags, and Guwahati commercial keyword targeting.
* **Speed, Performance & Accessibility Audits**: Core Web Vitals remediation (sub-second LCP) and WCAG 2.2 AA contrast compliance.
* **IT Infrastructure & Networking Advisory**: Structured Cat6 cabling layouts, commercial UPS backup runtime calculations, and hardware procurement planning.

---

## 🔒 Security Hardening & Architecture Isolation

To protect proprietary business operations and customer confidentiality:

1. **Decoupled Architecture**: The public corporate website is completely segregated from any internal business applications.
2. **Zero Exposed Credentials**: No passwords, master PINs, or internal keys are published in code, HTML, or documentation.
3. **Safe Form Transmission**: Inquiries are verified with client-side validation and anti-spam honeypot fields. Leads are transmitted directly via verified endpoints or direct encrypted WhatsApp/Email dispatch—never stored in unmonitored browser `localStorage`.
4. **Security Headers**: Includes `X-Content-Type-Options: nosniff` and strict cross-origin referrer policies.

---

## 💻 Technical Stack

* **Framework**: React 19 (JSX)
* **Build Tool**: Vite 8 (with `@vitejs/plugin-react` and rolldown pipeline)
* **Routing**: React Router DOM 7
* **Icons**: Lucide React
* **Styling**: Modern CSS design tokens (`theme.css`) with light/dark theme switching
* **Standards**: WCAG 2.2 AA accessibility, semantic HTML5 landmarks, and Schema.org JSON-LD

---

## 🚀 Local Development & Build Commands

### Prerequisites
* Node.js v18+ and npm installed.

### Installation
```bash
git clone https://github.com/Hellotamal/maxeco.git
cd maxeco
npm install
```

### Run Local Development Server
```bash
npm run dev
```
Starts the local development server at `http://localhost:3000/maxeco/` with Hot Module Replacement (HMR).

### Run Automated Test Suite
```bash
npm test
```
Executes the comprehensive verification test suite (258 automated tests covering business logic, solar algorithms, SEO artifacts, and security boundaries).

### Production Build
```bash
npm run build
```
Generates the optimized static release in the `dist/` directory:
* Bundled and minified HTML, JavaScript, and CSS assets.
* Static `robots.txt` and `sitemap.xml`.
* Single Page App redirect fallback script `404.html`.

### Preview Production Build
```bash
npm run preview
```

---

## 🌐 Deployment to GitHub Pages

The repository is configured for static hosting on GitHub Pages under the repository path `/maxeco/`:

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. In GitHub repository **Settings** → **Pages**:
   * **Source**: Deploy from a branch.
   * **Branch**: `main` or your designated release branch (folder `/dist` or root).
3. The live corporate platform is served at:
   ```
   https://hellotamal.github.io/maxeco/
   ```

### Direct Navigation & Refresh Support
GitHub Pages serves `404.html` when a user directly navigates to or refreshes a sub-route (e.g., `/clean-energy` or `/contact`). Our included `public/404.html` seamlessly captures the route and restores the page through React Router without 404 errors.

---

## 🧪 Verification & Audit Results

* **Automated Tests**: 258 of 258 passing (100% success rate).
* **Security Barriers**: 0 links to internal ERP, 0 plaintext passwords or PINs.
* **Accessibility**: Tested across keyboard navigation, visible focus indicators, and high contrast.
* **Responsive Breakpoints**: Verified for 360px (mobile), 768px (tablet), 1024px (laptop), 1440px (desktop), and 1920px (ultrawide).

---

## 📄 License & Ownership

Designed, engineered, and maintained for **MaxEco Energy & Tech**, Guwahati, Assam, India. All rights reserved.
