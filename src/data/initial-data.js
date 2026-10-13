// Initial seed dataset for MaxEco Business Operating System
// Realistic demo data based in Guwahati, Assam for offline testing

const initialSeedData = {
  settings: {
    companyName: "MaxEco Energy & Tech",
    tagline: "Clean Energy Advisory & Digital Solutions for Northeast India",
    location: "Maligaon, Guwahati, Assam, Pin - 781011",
    contactPhone: "+91 99544 93909",
    contactEmail: "maxecoenergyit@gmail.com",
    whatsappNumber: "919954493909",
    adminPin: "maxeco2026",
    currencySymbol: "₹",
    taxReserveRate: 18, // 18% GST / estimated tax reserve
    solarTariffCommercial: 7.85, // APDCL benchmark
    solarTariffDomestic: 6.20,
    solarGenPerKwp: 120, // units/month in Assam
    bankAccountName: "Tamal Roy",
    bankName: "Punjab National Bank",
    bankAccountNo: "4589000100072219",
    bankIfscCode: "PUNB0458900",
    bankBranch: "Maligaon, Guwahati",
    bankAccountType: "Saving Account",
    paymentQrPath: "assets/payment-qr.png"
  },

  leads: [
    {
      id: "LEAD-2026-001",
      name: "Brahmaputra Packaging & Logistics",
      contactPerson: "Pranab Barman",
      phone: "+91 98640 12345",
      email: "pranab@brahmaputrapack.com",
      location: "Amingaon Industrial Area, Guwahati",
      customerType: "Commercial & Industrial",
      service: "Solar EPC Coordination",
      source: "Direct Referral",
      estimatedValue: 1450000,
      stage: "Proposal Sent",
      lastContactDate: "2026-10-04",
      nextFollowUpDate: "2026-10-12",
      nextAction: "Review 35 kWp rooftop proposal & APDCL net metering feasibility",
      notes: "Client has 40 kW sanctioned load from APDCL. Monthly electricity bill ~₹38,000. Flat RCC roof available.",
      createdAt: "2026-09-28"
    },
    {
      id: "LEAD-2026-002",
      name: "Pragjyotish Diagnostic Clinic",
      contactPerson: "Dr. Anamika Kalita",
      phone: "+91 94350 98765",
      email: "pragjyotishclinic@gmail.com",
      location: "Zoo Road, Guwahati",
      customerType: "Healthcare / Small Business",
      service: "SMB Website",
      source: "Website Form",
      estimatedValue: 42000,
      stage: "Qualified",
      lastContactDate: "2026-10-07",
      nextFollowUpDate: "2026-10-11",
      nextAction: "Send 5-page diagnostic center website scope and quotation",
      notes: "Needs online test booking form, doctor schedule, and WhatsApp direct consultation button.",
      createdAt: "2026-10-02"
    },
    {
      id: "LEAD-2026-003",
      name: "Kaziranga Organic Tea Estate",
      contactPerson: "Sanjib Saikia",
      phone: "+91 99541 33221",
      email: "sanjib@kazirangatea.in",
      location: "Golaghat / Guwahati Office (Beltola)",
      customerType: "Commercial & Agro",
      service: "Solar Energy Advisory",
      source: "Industry Event",
      estimatedValue: 180000,
      stage: "Meeting",
      lastContactDate: "2026-10-08",
      nextFollowUpDate: "2026-10-14",
      nextAction: "In-person advisory meeting on captive solar viability vs DG backup",
      notes: "Tea processing shed with high diesel generation costs. Evaluating 50 kWp grid-interactive setup.",
      createdAt: "2026-10-05"
    },
    {
      id: "LEAD-2026-004",
      name: "Assam Craft & Loom Traders",
      contactPerson: "Rupjyoti Deka",
      phone: "+91 97060 44556",
      email: "rupjyoti@assamcrafts.com",
      location: "Panbazar, Guwahati",
      customerType: "Retail SMB",
      service: "Web Maintenance & AI Automation",
      source: "WhatsApp Outreach",
      estimatedValue: 24000,
      stage: "Won",
      lastContactDate: "2026-10-09",
      nextFollowUpDate: "2026-10-25",
      nextAction: "Deliver first batch of product catalog updates & setup WhatsApp catalog link",
      notes: "Agreed to ₹2,000/month recurring maintenance retainer. ₹6,000 quarterly advance received.",
      createdAt: "2026-09-20"
    }
  ],

  quotations: [
    {
      id: "QT-2026-001",
      leadId: "LEAD-2026-001",
      clientName: "Brahmaputra Packaging & Logistics",
      service: "Solar EPC Coordination (35 kWp Rooftop System)",
      date: "2026-10-03",
      validUntil: "2026-10-24",
      totalAmount: 1450000,
      directCostEstimate: 1180000,
      projectedMargin: 270000,
      marginPercent: 18.6,
      status: "Sent",
      terms: "15% with work order, 45% upon module/inverter delivery, 25% upon structural erection, 15% upon APDCL net-meter sync."
    },
    {
      id: "QT-2026-002",
      leadId: "LEAD-2026-004",
      clientName: "Assam Craft & Loom Traders",
      service: "Website Maintenance Retainer (Quarterly Advance)",
      date: "2026-09-25",
      validUntil: "2026-10-15",
      totalAmount: 6000,
      directCostEstimate: 1000,
      projectedMargin: 5000,
      marginPercent: 83.3,
      status: "Accepted",
      terms: "Quarterly advance for 3 months maintenance & WhatsApp catalog link setup."
    }
  ],

  invoices: [
    {
      id: "INV-2026-001",
      clientName: "Assam Craft & Loom Traders",
      service: "Website Maintenance (Q4 2026 Retainer)",
      date: "2026-09-26",
      dueDate: "2026-10-05",
      amountBilled: 6000,
      amountCollected: 6000,
      status: "Paid",
      paymentDate: "2026-09-28",
      paymentMethod: "UPI / Bank Transfer (SBI)",
      referenceNo: "UPI/20260928/998124"
    }
  ],

  // --- CUSTOMER PAYMENT RECEIPTS & SETTLEMENTS ---
  payments: [
    {
      id: "REC-2026-001",
      invoiceId: "INV-2026-001",
      clientName: "Assam Craft & Loom Traders",
      service: "Website Maintenance (Q4 2026 Retainer)",
      amount: 6000,
      paymentMethod: "UPI / Bank Transfer (SBI)",
      referenceNo: "UPI/20260928/998124",
      date: "2026-09-28",
      balanceRemaining: 0,
      notes: "Full settlement received via UPI. Q4 retainer activated."
    }
  ],

  expenses: [
    {
      id: "EXP-2026-001",
      date: "2026-09-27",
      category: "Direct Delivery Cost",
      description: "Freelance graphic asset preparation for craft website",
      amount: 1000,
      paidTo: "Diganta Graphic Studio, Chandmari",
      linkedProject: "IT-2026-001",
      paymentMethod: "UPI"
    },
    {
      id: "EXP-2026-002",
      date: "2026-10-01",
      category: "Operating Overhead",
      description: "Broadband internet bill (Airtel Xstream Guwahati)",
      amount: 943,
      paidTo: "Airtel Broadband",
      linkedProject: null,
      paymentMethod: "UPI"
    },
    {
      id: "EXP-2026-003",
      date: "2026-10-03",
      category: "Direct Delivery Cost",
      description: "Site survey travel & structural inspection at Amingaon",
      amount: 650,
      paidTo: "Fuel / Cab reimbursement",
      linkedProject: "SOL-2026-001",
      paymentMethod: "Cash"
    }
  ],

  drawings: [
    {
      id: "DRW-2026-001",
      date: "2026-10-05",
      amount: 2500,
      purpose: "Founder personal living allowance",
      account: "Personal Bank Account"
    }
  ],

  solarProjects: [
    {
      id: "SOL-2026-001",
      clientName: "Brahmaputra Packaging & Logistics",
      siteLocation: "Amingaon, North Guwahati",
      discom: "APDCL (Assam Power Distribution Co. Ltd.)",
      consumerNo: "1023849102",
      sanctionedLoadKw: 40,
      systemCapacityKwp: 35,
      totalContractValue: 1450000,
      collectedAmount: 0,
      costCommitted: 650,
      status: "Site Feasibility Completed",
      applicationNo: "APDCL-SR-2026-00412",
      dtrCode: "DTR-AMN-11KV-04",
      feasibilityNocStatus: "In Progress",
      ceigStatus: "Pending",
      netMeterStatus: "Pending",
      milestones: [
        { name: "Site Audit & Structural Feasibility", status: "Completed", date: "2026-10-03" },
        { name: "APDCL Net-Metering NOC Submission", status: "In Progress", date: "2026-10-15" },
        { name: "Partner Equipment Procurement", status: "Pending", date: "2026-10-25" },
        { name: "Civil & Structural Mounting", status: "Pending", date: "2026-11-05" },
        { name: "Wiring, Inverter & CEIG Testing", status: "Pending", date: "2026-11-15" },
        { name: "Commissioning & Handover", status: "Pending", date: "2026-11-20" }
      ],
      assumptions: "Solar generation estimated at 120 units/kWp/month (4,200 units/mo). APDCL net metering clearance subject to distribution transformer capacity margin."
    }
  ],

  itProjects: [
    {
      id: "IT-2026-001",
      clientName: "Assam Craft & Loom Traders",
      serviceScope: "E-Commerce Catalog Maintenance & WhatsApp Store",
      contractValue: 6000,
      collectedAmount: 6000,
      partnerCost: 1000,
      status: "In Progress",
      milestones: [
        { name: "Product Asset Collection", status: "Completed", date: "2026-09-29" },
        { name: "Catalog Upload & Optimization", status: "In Progress", date: "2026-10-10" },
        { name: "WhatsApp Direct Order Testing", status: "Pending", date: "2026-10-12" },
        { name: "Client Preview & Handover", status: "Pending", date: "2026-10-15" }
      ],
      vaultNotes: "Client WordPress admin and WhatsApp Business account credentials stored securely in local vault."
    }
  ],

  // --- ERP OPERATIONS: BILL OF MATERIALS (BOM) & MATERIAL PROCUREMENTS ---
  procurements: [
    {
      id: "PO-2026-001",
      projectId: "SOL-2026-001",
      projectType: "solar",
      clientName: "Brahmaputra Packaging & Logistics",
      itemCategory: "Solar Modules",
      itemName: "Tier-1 550W Mono PERC Solar Panels (64 Modules = 35.2 kWp)",
      supplierName: "Waaree Certified Distributor (Guwahati Branch)",
      quantity: "64 Modules",
      estimatedCost: 680000,
      actualCost: 675000,
      orderDate: "2026-10-06",
      targetDeliveryDate: "2026-10-22",
      status: "PO Issued",
      invoiceRef: "PO-MAX-2026-041",
      notes: "Advance payment approved. Logistics coordinated with Amingaon factory yard."
    },
    {
      id: "PO-2026-002",
      projectId: "SOL-2026-001",
      projectType: "solar",
      clientName: "Brahmaputra Packaging & Logistics",
      itemCategory: "Inverter & Electrical",
      itemName: "30kW Three-Phase On-Grid Solar Inverter with Dual MPPT & Remote Wi-Fi Logger",
      supplierName: "Growatt / Sungrow Regional Partner",
      quantity: "1 Unit",
      estimatedCost: 210000,
      actualCost: 205000,
      orderDate: "2026-10-07",
      targetDeliveryDate: "2026-10-24",
      status: "Requisitioned",
      invoiceRef: "REQ-MAX-INV-02",
      notes: "Awaiting DISCOM Net-Metering technical clearance confirmation."
    },
    {
      id: "PO-2026-003",
      projectId: "SOL-2026-001",
      projectType: "solar",
      clientName: "Brahmaputra Packaging & Logistics",
      itemCategory: "Mounting Structures",
      itemName: "HDG (Hot Dip Galvanized) 80 Micron Elevated Module Mounting Structure",
      supplierName: "Assam Structural Steel Fabricators, Paltan Bazar",
      quantity: "1 Complete Set (35 kWp)",
      estimatedCost: 140000,
      actualCost: 138000,
      orderDate: "2026-10-05",
      targetDeliveryDate: "2026-10-18",
      status: "In Transit",
      invoiceRef: "DC-ASSAM-9912",
      notes: "Dispatched by truck. Expected on site Wednesday."
    },
    {
      id: "PO-2026-004",
      projectId: "IT-2026-001",
      projectType: "it",
      clientName: "Assam Craft & Loom Traders",
      itemCategory: "Cloud & Software",
      itemName: "Managed VPS Hosting & WhatsApp Cloud API Enterprise Gateway",
      supplierName: "Hostinger / Meta Cloud Service",
      quantity: "Annual Retainer",
      estimatedCost: 3500,
      actualCost: 3500,
      orderDate: "2026-09-29",
      targetDeliveryDate: "2026-09-29",
      status: "Delivered at Site",
      invoiceRef: "INV-HST-881902",
      notes: "Server provisioned and secured with SSL."
    }
  ],

  // --- ERP OPERATIONS: FIELD CONTRACTOR WORK ORDERS & DISPATCH ---
  workOrders: [
    {
      id: "WO-2026-001",
      projectId: "SOL-2026-001",
      title: "35 kWp Elevated GI Structure Erection & Civil Chemical Anchor Fastening",
      workType: "Civil & Structural Fabrication",
      assignedTo: "Kamrup Solar Structural Fabricators (Lead: Romen Kalita)",
      contactPhone: "+91 94351 22334",
      scheduledDate: "2026-10-19",
      targetCompletionDate: "2026-10-25",
      contractorFee: 45000,
      safetyCompliance: "Full fall-arrest harness, hard hats, steel-toe boots & lifeline ropes verified",
      status: "Dispatched",
      notes: "Strict safety guidelines on Amingaon industrial RCC roof. No drilling into beam joints."
    },
    {
      id: "WO-2026-002",
      projectId: "SOL-2026-001",
      title: "DC/AC Cabling, Inverter Placement, 4x Chemical Earthing Pits & Lightning Arrester",
      workType: "Electrical Installation & Earthing",
      assignedTo: "Brahmaputra Electrical Contractors (Supervisor: Bikash Das)",
      contactPhone: "+91 98642 55667",
      scheduledDate: "2026-10-26",
      targetCompletionDate: "2026-11-05",
      contractorFee: 55000,
      safetyCompliance: "Earthing resistance < 2 ohms benchmark required by CEIG inspection",
      status: "Scheduled",
      notes: "Maintain dedicated copper bonded earth electrodes for solar arrays, inverter and LA."
    },
    {
      id: "WO-2026-003",
      projectId: "IT-2026-001",
      title: "Product Photography Upload, Mobile UX Audit & Direct WhatsApp Checkout Linking",
      workType: "Software & Digital Integration",
      assignedTo: "MaxEco Digital Lab (In-house Developer: Debajit Sarma)",
      contactPhone: "+91 99544 93909",
      scheduledDate: "2026-10-09",
      targetCompletionDate: "2026-10-14",
      contractorFee: 3500,
      safetyCompliance: "Encrypted credential storage & clean code standards",
      status: "In Progress",
      notes: "Verify mobile checkout response time across Airtel and Jio Northeast networks."
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = initialSeedData;
}
if (typeof window !== 'undefined') {
  window.initialSeedData = initialSeedData;
}
if (typeof global !== 'undefined') {
  global.initialSeedData = initialSeedData;
}
