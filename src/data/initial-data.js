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
  ],

  // --- CAFM: CUSTOMER ORGANIZATIONS (MULTI-TENANT REGISTER) ---
  cafmOrganizations: [
    {
      id: "ORG-2026-001",
      name: "Brahmaputra Packaging & Logistics",
      type: "Commercial Factory & Logistics",
      industry: "Manufacturing & Distribution",
      contactPerson: "Pranab Barman",
      phone: "+91 98640 12345",
      email: "facilities@brahmaputrapack.in",
      billingAddress: "Plot 14, Amingaon Industrial Area, Guwahati, Kamrup, Assam 781031",
      gstin: "18AABCB9876D1Z1",
      status: "Active",
      notes: "Commercial rooftop solar installation with 24/7 industrial logistics warehouse."
    },
    {
      id: "ORG-2026-002",
      name: "Pragjyotish Diagnostic Clinic & Healthcare",
      type: "Healthcare & Diagnostic Lab",
      industry: "Healthcare & Diagnostics",
      contactPerson: "Dr. Anamika Kalita",
      phone: "+91 94350 98765",
      email: "admin@pragjyotishclinic.com",
      billingAddress: "Zoo Road, Guwahati, Kamrup Metro, Assam 781024",
      gstin: "18AACCP1122E1Z8",
      status: "Active",
      notes: "Critical medical equipment requiring uninterrupted UPS power and climate-controlled server room."
    },
    {
      id: "ORG-2026-003",
      name: "Assam Craft & Loom Retail Traders",
      type: "Commercial Retail Chain",
      industry: "Handloom & Retail Merchandising",
      contactPerson: "Rupjyoti Deka",
      phone: "+91 97060 44556",
      email: "ops@assamcraftloom.in",
      billingAddress: "Panbazar, Guwahati, Kamrup Metro, Assam 781001",
      gstin: "18AABCA3344F1Z3",
      status: "Active",
      notes: "Multi-point POS terminals, solar net-metering, and inventory management server."
    },
    {
      id: "ORG-2026-004",
      name: "Dihing Software Labs & Tech Park",
      type: "Corporate IT Office",
      industry: "Information Technology",
      contactPerson: "Siddhartha Sarma",
      phone: "+91 98640 77889",
      email: "facilities@dihinglabs.io",
      billingAddress: "Khanapara Tech Enclave, Guwahati, Kamrup Metro, Assam 781022",
      gstin: "18AADCD5566G1Z9",
      status: "Active",
      notes: "High-density enterprise server racks, dual ISP failover, and rooftop solar backup."
    }
  ],

  // --- CAFM: CLIENT FACILITY SITES & PREMISES REGISTRY ---
  facilitySites: [
    {
      id: "SITE-2026-001",
      organizationId: "ORG-2026-001",
      name: "Brahmaputra Packaging & Logistics Hub",
      clientName: "Brahmaputra Packaging & Logistics",
      siteType: "Commercial Factory & Warehouse",
      location: "Amingaon Industrial Area, Guwahati, Kamrup, Assam 781031",
      contactPerson: "Pranab Barman",
      contactPhone: "+91 98640 12345",
      apdclConsumerNo: "10984729102",
      sanctionedLoadKw: 40.0,
      solarCapacityKwp: 35.0,
      itScope: "Central Industrial Warehouse LAN & NVR Security",
      status: "Active",
      createdAt: "2026-01-10"
    },
    {
      id: "SITE-2026-002",
      organizationId: "ORG-2026-002",
      name: "Pragjyotish Diagnostic Clinic & Lab",
      clientName: "Pragjyotish Diagnostic Clinic & Healthcare",
      siteType: "Healthcare & Diagnostic Laboratory",
      location: "Zoo Road, Guwahati, Kamrup Metro, Assam 781024",
      contactPerson: "Dr. Anamika Kalita",
      contactPhone: "+91 94350 98765",
      apdclConsumerNo: "20847190234",
      sanctionedLoadKw: 15.0,
      solarCapacityKwp: 10.0,
      itScope: "Clinical Server, 10x Workstations & 5kVA Online UPS",
      status: "Active",
      createdAt: "2026-02-05"
    },
    {
      id: "SITE-2026-003",
      organizationId: "ORG-2026-003",
      name: "Assam Craft & Loom Commercial Center",
      clientName: "Assam Craft & Loom Retail Traders",
      siteType: "Commercial Retail & Showroom",
      location: "Panbazar, Guwahati, Kamrup Metro, Assam 781001",
      contactPerson: "Rupjyoti Deka",
      contactPhone: "+91 97060 44556",
      apdclConsumerNo: "10293847561",
      sanctionedLoadKw: 8.0,
      solarCapacityKwp: 5.0,
      itScope: "POS Terminals, Wi-Fi 6 Routers & Inventory Server",
      status: "Active",
      createdAt: "2026-03-01"
    }
  ],

  // --- CAFM: FACILITY ASSETS & EQUIPMENT INVENTORY ---
  facilityAssets: [
    {
      id: "AST-2026-001",
      organizationId: "ORG-2026-001",
      siteId: "SITE-2026-001",
      location: "Warehouse Rooftop Array Block A",
      category: "Solar EPC",
      name: "35 kWp Mono PERC Tier-1 Solar PV Array (65x 540Wp)",
      modelNumber: "Waaree / Adani 540Wp High-Efficiency",
      serialNumber: "WA-2026-0912-35K",
      installDate: "2026-01-15",
      warrantyExpiry: "2051-01-15",
      criticality: "High",
      maintenanceCycleDays: 30,
      lastServicedDate: "2026-09-25",
      nextServiceDate: "2026-10-25",
      status: "Service Due",
      qrCodePayload: "MAXECO-CAFM|ORG-2026-001|SITE-2026-001|AST-2026-001|WA-2026-0912-35K",
      serviceHistory: [
        {
          date: "2026-09-25",
          type: "PPM Routine",
          technician: "Raju Sharma",
          notes: "Module surface washing and clamp torque verification. Yield normalized at 4.6 kWh/kWp.",
          status: "Completed"
        },
        {
          date: "2026-08-25",
          type: "PPM Routine",
          technician: "Romen Kalita",
          notes: "Bi-weekly high-pressure washing. Clear weather.",
          status: "Completed"
        }
      ],
      notes: "Bi-weekly washing required to remove industrial highway particulate matter."
    },
    {
      id: "AST-2026-002",
      organizationId: "ORG-2026-001",
      siteId: "SITE-2026-001",
      location: "Main Electrical Control Room Bay 1",
      category: "Solar EPC",
      name: "30kW Three-Phase On-Grid Solar Inverter with Wi-Fi Logger",
      modelNumber: "Growatt MID 30KTL3-X",
      serialNumber: "GW-MID-30K-8812",
      installDate: "2026-01-15",
      warrantyExpiry: "2031-01-15",
      criticality: "Critical",
      maintenanceCycleDays: 90,
      lastServicedDate: "2026-08-15",
      nextServiceDate: "2026-11-15",
      status: "Operational",
      qrCodePayload: "MAXECO-CAFM|ORG-2026-001|SITE-2026-001|AST-2026-002|GW-MID-30K-8812",
      serviceHistory: [
        {
          date: "2026-08-15",
          type: "PPM Routine",
          technician: "Raju Sharma",
          notes: "DC switchgear terminal thermal scan. Maximum temp 38°C (within normal range). Inverter firmware v4.1.",
          status: "Completed"
        }
      ],
      notes: "Operating generation verified remotely on ShinePhone cloud telemetry."
    },
    {
      id: "AST-2026-003",
      organizationId: "ORG-2026-001",
      siteId: "SITE-2026-001",
      location: "Perimeter Yard (Pits 1-4)",
      category: "Electrical & CEIG",
      name: "4-Pit Chemical Earthing & Pure Copper Lightning Arrester System",
      modelNumber: "TruePower Copper-Bonded 3m Electrode",
      serialNumber: "CEIG-EARTH-2026-04",
      installDate: "2026-01-20",
      warrantyExpiry: "2036-01-20",
      criticality: "Critical",
      maintenanceCycleDays: 180,
      lastServicedDate: "2026-04-20",
      nextServiceDate: "2026-10-20",
      status: "Service Due",
      qrCodePayload: "MAXECO-CAFM|ORG-2026-001|SITE-2026-001|AST-2026-003|CEIG-EARTH-2026-04",
      serviceHistory: [
        {
          date: "2026-04-20",
          type: "CEIG Compliance Audit",
          technician: "Bikash Das",
          notes: "Megger earth resistance test measured 1.42 Ohms. Chemical compound topped with salt/charcoal slurry.",
          status: "Completed"
        }
      ],
      notes: "Mandatory CEIG inspection: earth resistance benchmark must stay < 2.0 ohms."
    },
    {
      id: "AST-2026-004",
      organizationId: "ORG-2026-002",
      siteId: "SITE-2026-002",
      location: "Diagnostics Server & Power Room",
      category: "IT Infrastructure",
      name: "5kVA Online High-Frequency UPS with 16x 12V 42Ah Battery Bank",
      modelNumber: "APC Smart-UPS On-Line SRC5000",
      serialNumber: "APC-SRC5K-99120",
      installDate: "2026-02-10",
      warrantyExpiry: "2028-02-10",
      criticality: "Critical",
      maintenanceCycleDays: 60,
      lastServicedDate: "2026-09-01",
      nextServiceDate: "2026-11-01",
      status: "Operational",
      qrCodePayload: "MAXECO-CAFM|ORG-2026-002|SITE-2026-002|AST-2026-004|APC-SRC5K-99120",
      serviceHistory: [
        {
          date: "2026-09-01",
          type: "PPM Routine",
          technician: "Debajit Sarma",
          notes: "Impedance and float voltage tested. Load discharge calibrated at 48 mins on 3kW load.",
          status: "Completed"
        }
      ],
      notes: "Dedicated backup power for clinical laboratory biochemistry analyzers."
    },
    {
      id: "AST-2026-005",
      organizationId: "ORG-2026-002",
      siteId: "SITE-2026-002",
      location: "Network Distribution Rack 42U",
      category: "IT Infrastructure",
      name: "24-Port Gigabit Managed L2 Network Switch with PoE+",
      modelNumber: "Cisco Catalyst 1000 Series",
      serialNumber: "CISCO-C1000-24P-332",
      installDate: "2026-02-10",
      warrantyExpiry: "2029-02-10",
      criticality: "Medium",
      maintenanceCycleDays: 90,
      lastServicedDate: "2026-09-10",
      nextServiceDate: "2026-12-10",
      status: "Operational",
      qrCodePayload: "MAXECO-CAFM|ORG-2026-002|SITE-2026-002|AST-2026-005|CISCO-C1000-24P-332",
      serviceHistory: [
        {
          date: "2026-09-10",
          type: "PPM Routine",
          technician: "Debajit Sarma",
          notes: "Port buffer status reviewed, zero packet drops, VLAN 10 & 20 isolated.",
          status: "Completed"
        }
      ],
      notes: "VLAN partitioned between patient reception and laboratory testing."
    },
    {
      id: "AST-2026-006",
      organizationId: "ORG-2026-003",
      siteId: "SITE-2026-003",
      location: "Back Office Server Alcove",
      category: "IT Infrastructure",
      name: "POS & Inventory Local Database Server Workstation",
      modelNumber: "Dell PowerEdge T150 Tower Server",
      serialNumber: "DELL-PE-T150-7761",
      installDate: "2026-03-01",
      warrantyExpiry: "2029-03-01",
      criticality: "High",
      maintenanceCycleDays: 60,
      lastServicedDate: "2026-08-30",
      nextServiceDate: "2026-10-30",
      status: "Operational",
      qrCodePayload: "MAXECO-CAFM|ORG-2026-003|SITE-2026-003|AST-2026-006|DELL-PE-T150-7761",
      serviceHistory: [
        {
          date: "2026-08-30",
          type: "PPM Routine",
          technician: "Debajit Sarma",
          notes: "RAID-1 disk consistency check passed. Backup image archived to encrypted external SSD.",
          status: "Completed"
        }
      ],
      notes: "RAID-1 mirror storage with automated daily offline archive backup."
    }
  ],

  // --- CAFM: SERVICE TICKETS & MAINTENANCE HELPDESK ---
  serviceTickets: [
    {
      id: "TCK-2026-001",
      organizationId: "ORG-2026-001",
      siteId: "SITE-2026-001",
      assetId: "AST-2026-001",
      title: "Bi-Weekly High-Pressure Solar Panel Dust Cleaning & Array Inspection",
      priority: "Normal",
      reportedDate: "2026-10-12",
      targetResponseDate: "2026-10-15",
      issueDescription: "Scheduled bi-weekly wash down of 65x PV modules to remove industrial dust.",
      assignedTech: "Romen Kalita (Solar Maintenance Crew)",
      status: "Dispatched",
      workOrderId: "WO-2026-001",
      resolutionNotes: "Dispatched under field work order WO-2026-001.",
      resolvedDate: null
    },
    {
      id: "TCK-2026-002",
      organizationId: "ORG-2026-001",
      siteId: "SITE-2026-001",
      assetId: "AST-2026-003",
      title: "Annual CEIG Earth Pit Megger Resistance Audit (< 2 Ohms Target)",
      priority: "High",
      reportedDate: "2026-10-10",
      targetResponseDate: "2026-10-14",
      issueDescription: "Pre-winter verification of earthing pit chemical compound and lightning protection continuity.",
      assignedTech: "Bikash Das (CEIG Certified Electrician)",
      status: "In Progress",
      workOrderId: "WO-2026-002",
      resolutionNotes: "Measuring earth resistance across all 4 bonded pits with calibrated megger.",
      resolvedDate: null
    },
    {
      id: "TCK-2026-003",
      organizationId: "ORG-2026-002",
      siteId: "SITE-2026-002",
      assetId: "AST-2026-004",
      title: "UPS Battery Bank Impedance & Voltage Float Charge Audit",
      priority: "Normal",
      reportedDate: "2026-10-05",
      targetResponseDate: "2026-10-08",
      issueDescription: "Quarterly preventative battery health test under full clinical analyzer load.",
      assignedTech: "Debajit Sarma (IT Infra Lead)",
      status: "Resolved",
      workOrderId: "WO-2026-003",
      resolutionNotes: "All 16 battery blocks checked at 13.6V float charge. Total runtime tested at 45 minutes without voltage sag.",
      resolvedDate: "2026-10-09"
    }
  ],

  // --- CAFM: ANNUAL MAINTENANCE CONTRACTS (AMC) & SLAS ---
  amcContracts: [
    {
      id: "AMC-2026-001",
      organizationId: "ORG-2026-001",
      siteId: "SITE-2026-001",
      title: "35 kWp Comprehensive Solar Rooftop O&M & APDCL Compliance Retainer",
      contractType: "Comprehensive Solar O&M",
      tier: "Comprehensive",
      annualFee: 45000,
      billingFrequency: "Quarterly",
      sacCode: "SAC 995461",
      startDate: "2026-02-01",
      endDate: "2027-01-31",
      nextBillingDate: "2026-11-01",
      renewalReminderDays: 45,
      scheduledVisitsPerYear: 24,
      completedVisits: 16,
      emergencyResponseSlaHours: 4,
      status: "Active",
      terms: "Includes 24x array washings per year, quarterly inverter thermography, 2x CEIG earthing audits, and guaranteed 4-hour breakdown on-site response in Kamrup."
    },
    {
      id: "AMC-2026-002",
      organizationId: "ORG-2026-002",
      siteId: "SITE-2026-002",
      title: "Clinical IT Network, UPS & Server Infrastructure Maintenance SLA",
      contractType: "IT Infra & Network SLA",
      tier: "Enterprise IT SLA",
      annualFee: 36000,
      billingFrequency: "Quarterly",
      sacCode: "SAC 998713",
      startDate: "2026-03-01",
      endDate: "2027-02-28",
      nextBillingDate: "2026-12-01",
      renewalReminderDays: 45,
      scheduledVisitsPerYear: 12,
      completedVisits: 7,
      emergencyResponseSlaHours: 2,
      status: "Active",
      terms: "Includes monthly preventive server maintenance, bi-monthly UPS battery impedance audits, managed switch firmware maintenance, and standby replacement hardware."
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
