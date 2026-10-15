// Canonical initial dataset for MaxEco Business Operating System
// Synced from data/database.json for repository persistence & Cloudflare Pages edge hosting

const initialSeedData = {
  "settings": {
    "companyName": "MaxEco Energy & Tech",
    "tagline": "Clean Energy Advisory & Digital Solutions for Northeast India",
    "location": "Maligaon, Guwahati, Assam, Pin - 781011",
    "contactPhone": "+91 99544 93909",
    "contactEmail": "maxecoenergyit@gmail.com",
    "whatsappNumber": "919954493909",
    "adminPin": "maxeco2026",
    "currencySymbol": "₹",
    "taxReserveRate": 18,
    "solarTariffCommercial": 7.85,
    "solarTariffDomestic": 6.2,
    "solarGenPerKwp": 120,
    "bankAccountName": "Tamal Roy",
    "bankName": "Punjab National Bank",
    "bankAccountNo": "4589000100072219",
    "bankIfscCode": "PUNB0458900",
    "bankBranch": "Maligaon, Guwahati",
    "bankAccountType": "Saving Account",
    "paymentQrPath": "assets/payment-qr.png"
  },
  "leads": [
    {
      "id": "LEAD-2026-001",
      "name": "Brahmaputra Packaging & Logistics",
      "contactPerson": "Pranab Barman",
      "phone": "+91 98640 12345",
      "email": "pranab@brahmaputrapack.com",
      "location": "Amingaon Industrial Area, Guwahati",
      "customerType": "Commercial & Industrial",
      "service": "Solar EPC Coordination",
      "source": "Direct Referral",
      "estimatedValue": 1450000,
      "stage": "Proposal Sent",
      "lastContactDate": "2026-10-04",
      "nextFollowUpDate": "2026-10-12",
      "nextAction": "Review 35 kWp rooftop proposal & APDCL net metering feasibility",
      "notes": "Client has 40 kW sanctioned load from APDCL. Monthly electricity bill ~₹38,000. Flat RCC roof available.",
      "createdAt": "2026-09-28"
    },
    {
      "id": "LEAD-2026-002",
      "name": "Pragjyotish Diagnostic Clinic",
      "contactPerson": "Dr. Anamika Kalita",
      "phone": "+91 94350 98765",
      "email": "pragjyotishclinic@gmail.com",
      "location": "Zoo Road, Guwahati",
      "customerType": "Healthcare / Small Business",
      "service": "SMB Website",
      "source": "Website Form",
      "estimatedValue": 42000,
      "stage": "Qualified",
      "lastContactDate": "2026-10-07",
      "nextFollowUpDate": "2026-10-11",
      "nextAction": "Send 5-page diagnostic center website scope and quotation",
      "notes": "Needs online test booking form, doctor schedule, and WhatsApp direct consultation button.",
      "createdAt": "2026-10-02"
    },
    {
      "id": "LEAD-2026-003",
      "name": "Kaziranga Organic Tea Estate",
      "contactPerson": "Sanjib Saikia",
      "phone": "+91 99541 33221",
      "email": "sanjib@kazirangatea.in",
      "location": "Golaghat / Guwahati Office (Beltola)",
      "customerType": "Commercial & Agro",
      "service": "Solar Energy Advisory",
      "source": "Industry Event",
      "estimatedValue": 180000,
      "stage": "Meeting",
      "lastContactDate": "2026-10-08",
      "nextFollowUpDate": "2026-10-14",
      "nextAction": "In-person advisory meeting on captive solar viability vs DG backup",
      "notes": "Tea processing shed with high diesel generation costs. Evaluating 50 kWp grid-interactive setup.",
      "createdAt": "2026-10-05"
    },
    {
      "id": "LEAD-2026-004",
      "name": "Assam Craft & Loom Traders",
      "contactPerson": "Rupjyoti Deka",
      "phone": "+91 97060 44556",
      "email": "rupjyoti@assamcrafts.com",
      "location": "Panbazar, Guwahati",
      "customerType": "Retail SMB",
      "service": "Web Maintenance & AI Automation",
      "source": "WhatsApp Outreach",
      "estimatedValue": 24000,
      "stage": "Won",
      "lastContactDate": "2026-10-09",
      "nextFollowUpDate": "2026-10-25",
      "nextAction": "Deliver first batch of product catalog updates & setup WhatsApp catalog link",
      "notes": "Agreed to ₹2,000/month recurring maintenance retainer. ₹6,000 quarterly advance received.",
      "createdAt": "2026-09-20"
    }
  ],
  "quotations": [
    {
      "id": "QT-2026-001",
      "leadId": "LEAD-2026-001",
      "clientName": "Brahmaputra Packaging & Logistics",
      "service": "Solar EPC Coordination (35 kWp Rooftop System)",
      "date": "2026-10-03",
      "validUntil": "2026-10-24",
      "totalAmount": 1450000,
      "directCostEstimate": 1180000,
      "projectedMargin": 270000,
      "marginPercent": 18.6,
      "status": "Sent",
      "terms": "15% with work order, 45% upon module/inverter delivery, 25% upon structural erection, 15% upon APDCL net-meter sync."
    },
    {
      "id": "QT-2026-002",
      "leadId": "LEAD-2026-004",
      "clientName": "Assam Craft & Loom Traders",
      "service": "Website Maintenance Retainer (Quarterly Advance)",
      "date": "2026-09-25",
      "validUntil": "2026-10-15",
      "totalAmount": 6000,
      "directCostEstimate": 1000,
      "projectedMargin": 5000,
      "marginPercent": 83.3,
      "status": "Accepted",
      "terms": "Quarterly advance for 3 months maintenance & WhatsApp catalog link setup."
    }
  ],
  "invoices": [
    {
      "id": "INV-2026-001",
      "clientName": "Assam Craft & Loom Traders",
      "service": "Website Maintenance (Q4 2026 Retainer)",
      "date": "2026-09-26",
      "dueDate": "2026-10-05",
      "amountBilled": 6000,
      "amountCollected": 6000,
      "status": "Paid",
      "paymentDate": "2026-09-28",
      "paymentMethod": "UPI / Bank Transfer (SBI)",
      "referenceNo": "UPI/20260928/998124"
    }
  ],
  "payments": [
    {
      "id": "REC-2026-001",
      "invoiceId": "INV-2026-001",
      "clientName": "Assam Craft & Loom Traders",
      "service": "Website Maintenance (Q4 2026 Retainer)",
      "amount": 6000,
      "paymentMethod": "UPI / Bank Transfer (SBI)",
      "referenceNo": "UPI/20260928/998124",
      "date": "2026-09-28",
      "balanceRemaining": 0,
      "notes": "Full settlement received via UPI. Q4 retainer activated."
    }
  ],
  "expenses": [
    {
      "id": "EXP-2026-001",
      "date": "2026-09-27",
      "category": "Direct Delivery Cost",
      "description": "Freelance graphic asset preparation for craft website",
      "amount": 1000,
      "paidTo": "Diganta Graphic Studio, Chandmari",
      "linkedProject": "IT-2026-001",
      "paymentMethod": "UPI"
    },
    {
      "id": "EXP-2026-002",
      "date": "2026-10-01",
      "category": "Operating Overhead",
      "description": "Broadband internet bill (Airtel Xstream Guwahati)",
      "amount": 943,
      "paidTo": "Airtel Broadband",
      "linkedProject": null,
      "paymentMethod": "UPI"
    },
    {
      "id": "EXP-2026-003",
      "date": "2026-10-03",
      "category": "Direct Delivery Cost",
      "description": "Site survey travel & structural inspection at Amingaon",
      "amount": 650,
      "paidTo": "Fuel / Cab reimbursement",
      "linkedProject": "SOL-2026-001",
      "paymentMethod": "Cash"
    }
  ],
  "drawings": [
    {
      "id": "DRW-2026-001",
      "date": "2026-10-05",
      "amount": 2500,
      "purpose": "Founder personal living allowance",
      "account": "Personal Bank Account"
    }
  ],
  "solarProjects": [
    {
      "id": "SOL-2026-001",
      "clientName": "Brahmaputra Packaging & Logistics",
      "siteLocation": "Amingaon, North Guwahati",
      "discom": "APDCL (Assam Power Distribution Co. Ltd.)",
      "consumerNo": "1023849102",
      "sanctionedLoadKw": 40,
      "systemCapacityKwp": 35,
      "totalContractValue": 1450000,
      "collectedAmount": 0,
      "costCommitted": 650,
      "status": "Site Feasibility Completed",
      "applicationNo": "APDCL-SR-2026-00412",
      "dtrCode": "DTR-AMN-11KV-04",
      "feasibilityNocStatus": "In Progress",
      "ceigStatus": "Pending",
      "netMeterStatus": "Pending",
      "milestones": [
        {
          "name": "Site Audit & Structural Feasibility",
          "status": "Completed",
          "date": "2026-10-03"
        },
        {
          "name": "APDCL Net-Metering NOC Submission",
          "status": "In Progress",
          "date": "2026-10-15"
        },
        {
          "name": "Partner Equipment Procurement",
          "status": "Pending",
          "date": "2026-10-25"
        },
        {
          "name": "Civil & Structural Mounting",
          "status": "Pending",
          "date": "2026-11-05"
        },
        {
          "name": "Wiring, Inverter & CEIG Testing",
          "status": "Pending",
          "date": "2026-11-15"
        },
        {
          "name": "Commissioning & Handover",
          "status": "Pending",
          "date": "2026-11-20"
        }
      ],
      "assumptions": "Solar generation estimated at 120 units/kWp/month (4,200 units/mo). APDCL net metering clearance subject to distribution transformer capacity margin."
    }
  ],
  "itProjects": [
    {
      "id": "IT-2026-001",
      "clientName": "Assam Craft & Loom Traders",
      "serviceScope": "E-Commerce Catalog Maintenance & WhatsApp Store",
      "contractValue": 6000,
      "collectedAmount": 6000,
      "partnerCost": 1000,
      "status": "In Progress",
      "milestones": [
        {
          "name": "Product Asset Collection",
          "status": "Completed",
          "date": "2026-09-29"
        },
        {
          "name": "Catalog Upload & Optimization",
          "status": "In Progress",
          "date": "2026-10-10"
        },
        {
          "name": "WhatsApp Direct Order Testing",
          "status": "Pending",
          "date": "2026-10-12"
        },
        {
          "name": "Client Preview & Handover",
          "status": "Pending",
          "date": "2026-10-15"
        }
      ],
      "vaultNotes": "Client WordPress admin and WhatsApp Business account credentials stored securely in local vault."
    }
  ],
  "procurements": [
    {
      "id": "PO-2026-001",
      "projectId": "SOL-2026-001",
      "projectType": "solar",
      "clientName": "Brahmaputra Packaging & Logistics",
      "itemCategory": "Solar Modules",
      "itemName": "Tier-1 550W Mono PERC Solar Panels (64 Modules = 35.2 kWp)",
      "supplierName": "Waaree Certified Distributor (Guwahati Branch)",
      "quantity": "64 Modules",
      "estimatedCost": 680000,
      "actualCost": 675000,
      "orderDate": "2026-10-06",
      "targetDeliveryDate": "2026-10-22",
      "status": "PO Issued",
      "invoiceRef": "PO-MAX-2026-041",
      "notes": "Advance payment approved. Logistics coordinated with Amingaon factory yard."
    },
    {
      "id": "PO-2026-002",
      "projectId": "SOL-2026-001",
      "projectType": "solar",
      "clientName": "Brahmaputra Packaging & Logistics",
      "itemCategory": "Inverter & Electrical",
      "itemName": "30kW Three-Phase On-Grid Solar Inverter with Dual MPPT & Remote Wi-Fi Logger",
      "supplierName": "Growatt / Sungrow Regional Partner",
      "quantity": "1 Unit",
      "estimatedCost": 210000,
      "actualCost": 205000,
      "orderDate": "2026-10-07",
      "targetDeliveryDate": "2026-10-24",
      "status": "Requisitioned",
      "invoiceRef": "REQ-MAX-INV-02",
      "notes": "Awaiting DISCOM Net-Metering technical clearance confirmation."
    },
    {
      "id": "PO-2026-003",
      "projectId": "SOL-2026-001",
      "projectType": "solar",
      "clientName": "Brahmaputra Packaging & Logistics",
      "itemCategory": "Mounting Structures",
      "itemName": "HDG (Hot Dip Galvanized) 80 Micron Elevated Module Mounting Structure",
      "supplierName": "Assam Structural Steel Fabricators, Paltan Bazar",
      "quantity": "1 Complete Set (35 kWp)",
      "estimatedCost": 140000,
      "actualCost": 138000,
      "orderDate": "2026-10-05",
      "targetDeliveryDate": "2026-10-18",
      "status": "In Transit",
      "invoiceRef": "DC-ASSAM-9912",
      "notes": "Dispatched by truck. Expected on site Wednesday."
    },
    {
      "id": "PO-2026-004",
      "projectId": "IT-2026-001",
      "projectType": "it",
      "clientName": "Assam Craft & Loom Traders",
      "itemCategory": "Cloud & Software",
      "itemName": "Managed VPS Hosting & WhatsApp Cloud API Enterprise Gateway",
      "supplierName": "Hostinger / Meta Cloud Service",
      "quantity": "Annual Retainer",
      "estimatedCost": 3500,
      "actualCost": 3500,
      "orderDate": "2026-09-29",
      "targetDeliveryDate": "2026-09-29",
      "status": "Delivered at Site",
      "invoiceRef": "INV-HST-881902",
      "notes": "Server provisioned and secured with SSL."
    }
  ],
  "workOrders": [
    {
      "id": "WO-2026-001",
      "projectId": "SOL-2026-001",
      "title": "35 kWp Elevated GI Structure Erection & Civil Chemical Anchor Fastening",
      "workType": "Civil & Structural Fabrication",
      "assignedTo": "Kamrup Solar Structural Fabricators (Lead: Romen Kalita)",
      "contactPhone": "+91 94351 22334",
      "scheduledDate": "2026-10-19",
      "targetCompletionDate": "2026-10-25",
      "contractorFee": 45000,
      "safetyCompliance": "Full fall-arrest harness, hard hats, steel-toe boots & lifeline ropes verified",
      "status": "Dispatched",
      "notes": "Strict safety guidelines on Amingaon industrial RCC roof. No drilling into beam joints."
    },
    {
      "id": "WO-2026-002",
      "projectId": "SOL-2026-001",
      "title": "DC/AC Cabling, Inverter Placement, 4x Chemical Earthing Pits & Lightning Arrester",
      "workType": "Electrical Installation & Earthing",
      "assignedTo": "Brahmaputra Electrical Contractors (Supervisor: Bikash Das)",
      "contactPhone": "+91 98642 55667",
      "scheduledDate": "2026-10-26",
      "targetCompletionDate": "2026-11-05",
      "contractorFee": 55000,
      "safetyCompliance": "Earthing resistance < 2 ohms benchmark required by CEIG inspection",
      "status": "Scheduled",
      "notes": "Maintain dedicated copper bonded earth electrodes for solar arrays, inverter and LA."
    },
    {
      "id": "WO-2026-003",
      "projectId": "IT-2026-001",
      "title": "Product Photography Upload, Mobile UX Audit & Direct WhatsApp Checkout Linking",
      "workType": "Software & Digital Integration",
      "assignedTo": "MaxEco Digital Lab (In-house Developer: Debajit Sarma)",
      "contactPhone": "+91 99544 93909",
      "scheduledDate": "2026-10-09",
      "targetCompletionDate": "2026-10-14",
      "contractorFee": 3500,
      "safetyCompliance": "Encrypted credential storage & clean code standards",
      "status": "In Progress",
      "notes": "Verify mobile checkout response time across Airtel and Jio Northeast networks."
    }
  ],
  "cafmOrganizations": [
    {
      "id": "ORG-2026-001",
      "name": "Brahmaputra Packaging & Logistics",
      "type": "Commercial Factory & Logistics",
      "industry": "Manufacturing & Distribution",
      "contactPerson": "Pranab Barman",
      "phone": "+91 98640 12345",
      "email": "facilities@brahmaputrapack.in",
      "billingAddress": "Plot 14, Amingaon Industrial Area, Guwahati, Kamrup, Assam 781031",
      "gstin": "18AABCB9876D1Z1",
      "status": "Active",
      "notes": "Commercial rooftop solar installation with 24/7 industrial logistics warehouse."
    },
    {
      "id": "ORG-2026-002",
      "name": "Pragjyotish Diagnostic Clinic & Healthcare",
      "type": "Healthcare & Diagnostic Lab",
      "industry": "Healthcare & Diagnostics",
      "contactPerson": "Dr. Anamika Kalita",
      "phone": "+91 94350 98765",
      "email": "admin@pragjyotishclinic.com",
      "billingAddress": "Zoo Road, Guwahati, Kamrup Metro, Assam 781024",
      "gstin": "18AACCP1122E1Z8",
      "status": "Active",
      "notes": "Critical medical equipment requiring uninterrupted UPS power and climate-controlled server room."
    },
    {
      "id": "ORG-2026-003",
      "name": "Assam Craft & Loom Retail Traders",
      "type": "Commercial Retail Chain",
      "industry": "Handloom & Retail Merchandising",
      "contactPerson": "Rupjyoti Deka",
      "phone": "+91 97060 44556",
      "email": "ops@assamcraftloom.in",
      "billingAddress": "Panbazar, Guwahati, Kamrup Metro, Assam 781001",
      "gstin": "18AABCA3344F1Z3",
      "status": "Active",
      "notes": "Multi-point POS terminals, solar net-metering, and inventory management server."
    },
    {
      "id": "ORG-2026-004",
      "name": "Dihing Software Labs & Tech Park",
      "type": "Corporate IT Office",
      "industry": "Information Technology",
      "contactPerson": "Siddhartha Sarma",
      "phone": "+91 98640 77889",
      "email": "facilities@dihinglabs.io",
      "billingAddress": "Khanapara Tech Enclave, Guwahati, Kamrup Metro, Assam 781022",
      "gstin": "18AADCD5566G1Z9",
      "status": "Active",
      "notes": "High-density enterprise server racks, dual ISP failover, and rooftop solar backup."
    }
  ],
  "facilitySites": [
    {
      "id": "SITE-2026-001",
      "organizationId": "ORG-2026-001",
      "name": "Brahmaputra Packaging & Logistics Hub",
      "clientName": "Brahmaputra Packaging & Logistics",
      "siteType": "Commercial Factory & Warehouse",
      "location": "Amingaon Industrial Area, Guwahati, Kamrup, Assam 781031",
      "contactPerson": "Pranab Barman",
      "contactPhone": "+91 98640 12345",
      "apdclConsumerNo": "10984729102",
      "sanctionedLoadKw": 40,
      "solarCapacityKwp": 35,
      "itScope": "Central Industrial Warehouse LAN & NVR Security",
      "status": "Active",
      "createdAt": "2026-01-10"
    },
    {
      "id": "SITE-2026-002",
      "organizationId": "ORG-2026-002",
      "name": "Pragjyotish Diagnostic Clinic & Lab",
      "clientName": "Pragjyotish Diagnostic Clinic & Healthcare",
      "siteType": "Healthcare & Diagnostic Laboratory",
      "location": "Zoo Road, Guwahati, Kamrup Metro, Assam 781024",
      "contactPerson": "Dr. Anamika Kalita",
      "contactPhone": "+91 94350 98765",
      "apdclConsumerNo": "20847190234",
      "sanctionedLoadKw": 15,
      "solarCapacityKwp": 10,
      "itScope": "Clinical Server, 10x Workstations & 5kVA Online UPS",
      "status": "Active",
      "createdAt": "2026-02-05"
    },
    {
      "id": "SITE-2026-003",
      "organizationId": "ORG-2026-003",
      "name": "Assam Craft & Loom Commercial Center",
      "clientName": "Assam Craft & Loom Retail Traders",
      "siteType": "Commercial Retail & Showroom",
      "location": "Panbazar, Guwahati, Kamrup Metro, Assam 781001",
      "contactPerson": "Rupjyoti Deka",
      "contactPhone": "+91 97060 44556",
      "apdclConsumerNo": "10293847561",
      "sanctionedLoadKw": 8,
      "solarCapacityKwp": 5,
      "itScope": "POS Terminals, Wi-Fi 6 Routers & Inventory Server",
      "status": "Active",
      "createdAt": "2026-03-01"
    }
  ],
  "facilityAssets": [
    {
      "id": "AST-2026-001",
      "organizationId": "ORG-2026-001",
      "siteId": "SITE-2026-001",
      "location": "Warehouse Rooftop Array Block A",
      "category": "Solar EPC",
      "name": "35 kWp Mono PERC Tier-1 Solar PV Array (65x 540Wp)",
      "modelNumber": "Waaree / Adani 540Wp High-Efficiency",
      "serialNumber": "WA-2026-0912-35K",
      "installDate": "2026-01-15",
      "warrantyExpiry": "2051-01-15",
      "criticality": "High",
      "maintenanceCycleDays": 30,
      "lastServicedDate": "2026-09-25",
      "nextServiceDate": "2026-10-25",
      "status": "Service Due",
      "qrCodePayload": "MAXECO-CAFM|ORG-2026-001|SITE-2026-001|AST-2026-001|WA-2026-0912-35K",
      "serviceHistory": [
        {
          "date": "2026-09-25",
          "type": "PPM Routine",
          "technician": "Raju Sharma",
          "notes": "Module surface washing and clamp torque verification. Yield normalized at 4.6 kWh/kWp.",
          "status": "Completed"
        },
        {
          "date": "2026-08-25",
          "type": "PPM Routine",
          "technician": "Romen Kalita",
          "notes": "Bi-weekly high-pressure washing. Clear weather.",
          "status": "Completed"
        }
      ],
      "notes": "Bi-weekly washing required to remove industrial highway particulate matter."
    },
    {
      "id": "AST-2026-002",
      "organizationId": "ORG-2026-001",
      "siteId": "SITE-2026-001",
      "location": "Main Electrical Control Room Bay 1",
      "category": "Solar EPC",
      "name": "30kW Three-Phase On-Grid Solar Inverter with Wi-Fi Logger",
      "modelNumber": "Growatt MID 30KTL3-X",
      "serialNumber": "GW-MID-30K-8812",
      "installDate": "2026-01-15",
      "warrantyExpiry": "2031-01-15",
      "criticality": "Critical",
      "maintenanceCycleDays": 90,
      "lastServicedDate": "2026-08-15",
      "nextServiceDate": "2026-11-15",
      "status": "Operational",
      "qrCodePayload": "MAXECO-CAFM|ORG-2026-001|SITE-2026-001|AST-2026-002|GW-MID-30K-8812",
      "serviceHistory": [
        {
          "date": "2026-08-15",
          "type": "PPM Routine",
          "technician": "Raju Sharma",
          "notes": "DC switchgear terminal thermal scan. Maximum temp 38°C (within normal range). Inverter firmware v4.1.",
          "status": "Completed"
        }
      ],
      "notes": "Operating generation verified remotely on ShinePhone cloud telemetry."
    },
    {
      "id": "AST-2026-003",
      "organizationId": "ORG-2026-001",
      "siteId": "SITE-2026-001",
      "location": "Perimeter Yard (Pits 1-4)",
      "category": "Electrical & CEIG",
      "name": "4-Pit Chemical Earthing & Pure Copper Lightning Arrester System",
      "modelNumber": "TruePower Copper-Bonded 3m Electrode",
      "serialNumber": "CEIG-EARTH-2026-04",
      "installDate": "2026-01-20",
      "warrantyExpiry": "2036-01-20",
      "criticality": "Critical",
      "maintenanceCycleDays": 180,
      "lastServicedDate": "2026-04-20",
      "nextServiceDate": "2026-10-20",
      "status": "Service Due",
      "qrCodePayload": "MAXECO-CAFM|ORG-2026-001|SITE-2026-001|AST-2026-003|CEIG-EARTH-2026-04",
      "serviceHistory": [
        {
          "date": "2026-04-20",
          "type": "CEIG Compliance Audit",
          "technician": "Bikash Das",
          "notes": "Megger earth resistance test measured 1.42 Ohms. Chemical compound topped with salt/charcoal slurry.",
          "status": "Completed"
        }
      ],
      "notes": "Mandatory CEIG inspection: earth resistance benchmark must stay < 2.0 ohms."
    },
    {
      "id": "AST-2026-004",
      "organizationId": "ORG-2026-002",
      "siteId": "SITE-2026-002",
      "location": "Diagnostics Server & Power Room",
      "category": "IT Infrastructure",
      "name": "5kVA Online High-Frequency UPS with 16x 12V 42Ah Battery Bank",
      "modelNumber": "APC Smart-UPS On-Line SRC5000",
      "serialNumber": "APC-SRC5K-99120",
      "installDate": "2026-02-10",
      "warrantyExpiry": "2028-02-10",
      "criticality": "Critical",
      "maintenanceCycleDays": 60,
      "lastServicedDate": "2026-09-01",
      "nextServiceDate": "2026-11-01",
      "status": "Operational",
      "qrCodePayload": "MAXECO-CAFM|ORG-2026-002|SITE-2026-002|AST-2026-004|APC-SRC5K-99120",
      "serviceHistory": [
        {
          "date": "2026-09-01",
          "type": "PPM Routine",
          "technician": "Debajit Sarma",
          "notes": "Impedance and float voltage tested. Load discharge calibrated at 48 mins on 3kW load.",
          "status": "Completed"
        }
      ],
      "notes": "Dedicated backup power for clinical laboratory biochemistry analyzers."
    },
    {
      "id": "AST-2026-005",
      "organizationId": "ORG-2026-002",
      "siteId": "SITE-2026-002",
      "location": "Network Distribution Rack 42U",
      "category": "IT Infrastructure",
      "name": "24-Port Gigabit Managed L2 Network Switch with PoE+",
      "modelNumber": "Cisco Catalyst 1000 Series",
      "serialNumber": "CISCO-C1000-24P-332",
      "installDate": "2026-02-10",
      "warrantyExpiry": "2029-02-10",
      "criticality": "Medium",
      "maintenanceCycleDays": 90,
      "lastServicedDate": "2026-09-10",
      "nextServiceDate": "2026-12-10",
      "status": "Operational",
      "qrCodePayload": "MAXECO-CAFM|ORG-2026-002|SITE-2026-002|AST-2026-005|CISCO-C1000-24P-332",
      "serviceHistory": [
        {
          "date": "2026-09-10",
          "type": "PPM Routine",
          "technician": "Debajit Sarma",
          "notes": "Port buffer status reviewed, zero packet drops, VLAN 10 & 20 isolated.",
          "status": "Completed"
        }
      ],
      "notes": "VLAN partitioned between patient reception and laboratory testing."
    },
    {
      "id": "AST-2026-006",
      "organizationId": "ORG-2026-003",
      "siteId": "SITE-2026-003",
      "location": "Back Office Server Alcove",
      "category": "IT Infrastructure",
      "name": "POS & Inventory Local Database Server Workstation",
      "modelNumber": "Dell PowerEdge T150 Tower Server",
      "serialNumber": "DELL-PE-T150-7761",
      "installDate": "2026-03-01",
      "warrantyExpiry": "2029-03-01",
      "criticality": "High",
      "maintenanceCycleDays": 60,
      "lastServicedDate": "2026-08-30",
      "nextServiceDate": "2026-10-30",
      "status": "Operational",
      "qrCodePayload": "MAXECO-CAFM|ORG-2026-003|SITE-2026-003|AST-2026-006|DELL-PE-T150-7761",
      "serviceHistory": [
        {
          "date": "2026-08-30",
          "type": "PPM Routine",
          "technician": "Debajit Sarma",
          "notes": "RAID-1 disk consistency check passed. Backup image archived to encrypted external SSD.",
          "status": "Completed"
        }
      ],
      "notes": "RAID-1 mirror storage with automated daily offline archive backup."
    }
  ],
  "cafmPartsCatalog": [
    {
      "id": "PRT-001",
      "name": "1000V 15A gPV Solar DC String Fuse (10x38mm)",
      "category": "Solar EPC",
      "partNumber": "FUSE-GPV-1000V-15A",
      "unitCost": 450,
      "stockQuantity": 40,
      "unit": "Nos",
      "compatibleOEM": "Schneider / Bussmann / Growatt"
    },
    {
      "id": "PRT-002",
      "name": "Type-2 DC Surge Protection Device (SPD) 1000V 40kA",
      "category": "Solar EPC",
      "partNumber": "SPD-DC-1000V-40KA",
      "unitCost": 2200,
      "stockQuantity": 12,
      "unit": "Nos",
      "compatibleOEM": "Dehn / CITEL / Suntree"
    },
    {
      "id": "PRT-003",
      "name": "MC4 Solar Photovoltaic Connector Pair (IP68 Waterproof)",
      "category": "Solar EPC",
      "partNumber": "MC4-CONN-IP68",
      "unitCost": 120,
      "stockQuantity": 150,
      "unit": "Pair",
      "compatibleOEM": "Staubli / Multicontact"
    },
    {
      "id": "PRT-004",
      "name": "Bentonite Earth Enhancing Chemical Slurry Compound (25kg Bag)",
      "category": "Electrical & CEIG",
      "partNumber": "EARTH-BENT-25KG",
      "unitCost": 1450,
      "stockQuantity": 18,
      "unit": "Bag",
      "compatibleOEM": "TruePower / Marconite"
    },
    {
      "id": "PRT-005",
      "name": "Cat6 Shielded RJ45 Modular Keystone Jacks (Pack of 10)",
      "category": "IT Infrastructure",
      "partNumber": "CAT6-STP-KEY-10PK",
      "unitCost": 850,
      "stockQuantity": 25,
      "unit": "Pack",
      "compatibleOEM": "D-Link / CommScope"
    },
    {
      "id": "PRT-006",
      "name": "12V 42Ah VRLA AGM Deep-Cycle Sealed Lead Acid Battery",
      "category": "IT Infrastructure",
      "partNumber": "BAT-VRLA-12V-42AH",
      "unitCost": 5800,
      "stockQuantity": 8,
      "unit": "Nos",
      "compatibleOEM": "Exide Powersafe / Amaron Quanta"
    },
    {
      "id": "PRT-007",
      "name": "High-Conductivity Thermal Interface Compound (30g Syringe)",
      "category": "IT Infrastructure",
      "partNumber": "THERM-PASTE-30G",
      "unitCost": 650,
      "stockQuantity": 15,
      "unit": "Tube",
      "compatibleOEM": "Arctic MX-4 / Noctua"
    },
    {
      "id": "PRT-008",
      "name": "Inverter High-CFM Ball Bearing DC Cooling Fan 120mm",
      "category": "Solar EPC",
      "partNumber": "FAN-DC12V-120MM-CFM",
      "unitCost": 1850,
      "stockQuantity": 10,
      "unit": "Nos",
      "compatibleOEM": "Growatt / Sungrow / Delta"
    }
  ],
  "serviceTickets": [
    {
      "id": "TCK-2026-001",
      "organizationId": "ORG-2026-001",
      "siteId": "SITE-2026-001",
      "assetId": "AST-2026-001",
      "title": "Bi-Weekly High-Pressure Solar Panel Dust Cleaning & Array Inspection",
      "priority": "Normal",
      "reportedDate": "2026-10-12",
      "targetResponseDate": "2026-10-15",
      "slaTargetHours": 48,
      "slaStatus": "Within SLA",
      "issueDescription": "Scheduled bi-weekly wash down of 65x PV modules to remove industrial dust.",
      "assignedTech": "Romen Kalita (Solar Maintenance Crew)",
      "status": "Dispatched",
      "workOrderId": "WO-2026-001",
      "resolutionNotes": "Dispatched under field work order WO-2026-001.",
      "resolvedDate": null,
      "checklist": [
        {
          "id": "chk-01",
          "text": "Lock-Out / Tag-Out (LOTO) safety protocol activated on DC isolator",
          "done": true,
          "checkedAt": "2026-10-12 09:30",
          "checkedBy": "Romen Kalita"
        },
        {
          "id": "chk-02",
          "text": "Visual inspection for glass cracks, delamination, or snail trails",
          "done": true,
          "checkedAt": "2026-10-12 10:15",
          "checkedBy": "Romen Kalita"
        },
        {
          "id": "chk-03",
          "text": "De-ionized water pressure wash without abrasive cleaning agents",
          "done": true,
          "checkedAt": "2026-10-12 11:30",
          "checkedBy": "Romen Kalita"
        },
        {
          "id": "chk-04",
          "text": "Verify module clamp tightness & aluminum torque integrity (9.5 Nm)",
          "done": false,
          "checkedAt": null,
          "checkedBy": null
        },
        {
          "id": "chk-05",
          "text": "Confirm inverter string input current recovery on cloud logger",
          "done": false,
          "checkedAt": null,
          "checkedBy": null
        }
      ],
      "partsUsed": [],
      "chargeableWork": {
        "isChargeable": false,
        "estimatedAmount": 0,
        "scopeDescription": "Standard bi-weekly wash included in Annual Comprehensive Solar O&M Retainer.",
        "approvalStatus": "N/A",
        "approvalReference": "Covered under AMC-2026-001",
        "approvedAt": null,
        "approvedBy": null
      },
      "customerNotifications": [
        {
          "id": "NOTIF-001",
          "timestamp": "2026-10-12 09:00",
          "channel": "WhatsApp",
          "recipient": "+91 98640 12345 (Pranab Barman)",
          "message": "MaxEco Facility Alert: Service crew led by Romen Kalita has been dispatched to Amingaon Hub for routine Solar Panel Washing (TCK-2026-001).",
          "status": "Sent"
        }
      ]
    },
    {
      "id": "TCK-2026-002",
      "organizationId": "ORG-2026-001",
      "siteId": "SITE-2026-001",
      "assetId": "AST-2026-003",
      "title": "Annual CEIG Earth Pit Megger Resistance Audit (< 2 Ohms Target)",
      "priority": "High",
      "reportedDate": "2026-10-10",
      "targetResponseDate": "2026-10-14",
      "slaTargetHours": 12,
      "slaStatus": "Within SLA",
      "issueDescription": "Pre-winter verification of earthing pit chemical compound and lightning protection continuity.",
      "assignedTech": "Bikash Das (CEIG Certified Electrician)",
      "status": "In Progress",
      "workOrderId": "WO-2026-002",
      "resolutionNotes": "Measuring earth resistance across all 4 bonded pits with calibrated megger.",
      "resolvedDate": null,
      "checklist": [
        {
          "id": "chk-11",
          "text": "Megger Earth Resistance 4-terminal test measured (< 2.0 Ohms)",
          "done": true,
          "checkedAt": "2026-10-11 11:00",
          "checkedBy": "Bikash Das"
        },
        {
          "id": "chk-12",
          "text": "Copper busbar terminal disconnect & oxide layer brushing",
          "done": true,
          "checkedAt": "2026-10-11 11:45",
          "checkedBy": "Bikash Das"
        },
        {
          "id": "chk-13",
          "text": "Replenish 2x bags chemical compound slurry into earth pit chambers",
          "done": true,
          "checkedAt": "2026-10-11 14:00",
          "checkedBy": "Bikash Das"
        },
        {
          "id": "chk-14",
          "text": "Verify lightning arrester down conductor continuity to roof finial",
          "done": false,
          "checkedAt": null,
          "checkedBy": null
        },
        {
          "id": "chk-15",
          "text": "Record readings on statutory CEIG Inspection Verification Slip",
          "done": false,
          "checkedAt": null,
          "checkedBy": null
        }
      ],
      "partsUsed": [
        {
          "id": "PU-001",
          "partId": "PRT-004",
          "name": "Bentonite Earth Enhancing Chemical Slurry Compound (25kg Bag)",
          "partNumber": "EARTH-BENT-25KG",
          "qty": 2,
          "unitCost": 1450,
          "totalCost": 2900,
          "isBillable": false,
          "notes": "Replenished in Earthing Pit #2 and #4 under preventive contract."
        }
      ],
      "chargeableWork": {
        "isChargeable": false,
        "estimatedAmount": 0,
        "scopeDescription": "Earth compound replenishment covered under Comprehensive Solar O&M SLA.",
        "approvalStatus": "Approved",
        "approvalReference": "AMC-2026-001 SLA Clause 4.2",
        "approvedAt": "2026-10-10 10:30",
        "approvedBy": "Tamal Roy (Authorised Signatory)"
      },
      "customerNotifications": [
        {
          "id": "NOTIF-002",
          "timestamp": "2026-10-10 10:00",
          "channel": "Email",
          "recipient": "pranab@brahmaputrapack.com",
          "message": "MaxEco Technical Notice: Statutory CEIG Earthing Pit Megger testing scheduled at Amingaon Logistics Hub on 2026-10-11 by Bikash Das.",
          "status": "Sent"
        }
      ]
    },
    {
      "id": "TCK-2026-003",
      "organizationId": "ORG-2026-002",
      "siteId": "SITE-2026-002",
      "assetId": "AST-2026-004",
      "title": "UPS Battery Bank Impedance & Voltage Float Charge Audit",
      "priority": "Normal",
      "reportedDate": "2026-10-05",
      "targetResponseDate": "2026-10-08",
      "slaTargetHours": 24,
      "slaStatus": "Within SLA",
      "issueDescription": "Quarterly preventative battery health test under full clinical analyzer load.",
      "assignedTech": "Debajit Sarma (IT Infra Lead)",
      "status": "Resolved",
      "workOrderId": "WO-2026-003",
      "resolutionNotes": "All 16 battery blocks checked at 13.6V float charge. Replaced 1 weak battery block under approved work order.",
      "resolvedDate": "2026-10-09",
      "checklist": [
        {
          "id": "chk-21",
          "text": "Measurement of individual 16x 12V battery open circuit voltages",
          "done": true,
          "checkedAt": "2026-10-06 10:00",
          "checkedBy": "Debajit Sarma"
        },
        {
          "id": "chk-22",
          "text": "Internal resistance impedance test per block (< 15 mOhms)",
          "done": true,
          "checkedAt": "2026-10-06 10:45",
          "checkedBy": "Debajit Sarma"
        },
        {
          "id": "chk-23",
          "text": "Terminal torque tightening to 4.5 Nm with insulated wrench",
          "done": true,
          "checkedAt": "2026-10-06 11:30",
          "checkedBy": "Debajit Sarma"
        },
        {
          "id": "chk-24",
          "text": "Simulated utility power loss cutover test under 3kW analyzer load",
          "done": true,
          "checkedAt": "2026-10-06 12:15",
          "checkedBy": "Debajit Sarma"
        },
        {
          "id": "chk-25",
          "text": "Replaced 1x weak battery (Block #11 measured 10.8V sag)",
          "done": true,
          "checkedAt": "2026-10-08 14:00",
          "checkedBy": "Debajit Sarma"
        }
      ],
      "partsUsed": [
        {
          "id": "PU-002",
          "partId": "PRT-006",
          "name": "12V 42Ah VRLA AGM Deep-Cycle Sealed Lead Acid Battery",
          "partNumber": "BAT-VRLA-12V-42AH",
          "qty": 1,
          "unitCost": 5800,
          "totalCost": 5800,
          "isBillable": true,
          "notes": "Block #11 battery replacement beyond free consumable threshold; client approved."
        }
      ],
      "chargeableWork": {
        "isChargeable": true,
        "estimatedAmount": 5800,
        "scopeDescription": "Replacement of 1x 12V 42Ah VRLA AGM battery block (Block #11) with 24-month OEM warranty.",
        "approvalStatus": "Approved",
        "approvalReference": "WhatsApp sign-off by Dr. Anamika Kalita on 2026-10-07",
        "approvedAt": "2026-10-07 16:15",
        "approvedBy": "Dr. Anamika Kalita (Director)"
      },
      "customerNotifications": [
        {
          "id": "NOTIF-003",
          "timestamp": "2026-10-07 14:30",
          "channel": "WhatsApp",
          "recipient": "+91 94350 98765 (Dr. Anamika Kalita)",
          "message": "MaxEco Approval Request: UPS Block #11 replacement required (₹5,800 + GST). Please reply 'APPROVED' to authorize replacement.",
          "status": "Sent"
        },
        {
          "id": "NOTIF-004",
          "timestamp": "2026-10-09 16:00",
          "channel": "WhatsApp",
          "recipient": "+91 94350 98765 (Dr. Anamika Kalita)",
          "message": "MaxEco Service Completed: UPS battery bank service verified. Total runtime calibrated at 48 mins under load. Service Slip ref: TCK-2026-003.",
          "status": "Sent"
        }
      ]
    }
  ],
  "amcContracts": [
    {
      "id": "AMC-2026-001",
      "organizationId": "ORG-2026-001",
      "siteId": "SITE-2026-001",
      "title": "35 kWp Comprehensive Solar Rooftop O&M & APDCL Compliance Retainer",
      "contractType": "Comprehensive Solar O&M",
      "tier": "Comprehensive",
      "annualFee": 45000,
      "billingFrequency": "Quarterly",
      "sacCode": "SAC 995461",
      "startDate": "2026-02-01",
      "endDate": "2027-01-31",
      "nextBillingDate": "2026-11-01",
      "renewalReminderDays": 45,
      "scheduledVisitsPerYear": 24,
      "completedVisits": 16,
      "emergencyResponseSlaHours": 4,
      "status": "Active",
      "terms": "Includes 24x array washings per year, quarterly inverter thermography, 2x CEIG earthing audits, and guaranteed 4-hour breakdown on-site response in Kamrup.",
      "scheduledVisits": [
        {
          "visitNumber": 1,
          "quarter": "Q1-2026",
          "dueDate": "2026-02-15",
          "completedDate": "2026-02-14",
          "status": "Completed",
          "ticketId": "TCK-HIST-001",
          "technician": "Raju Sharma"
        },
        {
          "visitNumber": 2,
          "quarter": "Q1-2026",
          "dueDate": "2026-03-15",
          "completedDate": "2026-03-15",
          "status": "Completed",
          "ticketId": "TCK-HIST-002",
          "technician": "Romen Kalita"
        },
        {
          "visitNumber": 3,
          "quarter": "Q2-2026",
          "dueDate": "2026-04-20",
          "completedDate": "2026-04-20",
          "status": "Completed",
          "ticketId": "TCK-HIST-003",
          "technician": "Bikash Das"
        },
        {
          "visitNumber": 4,
          "quarter": "Q2-2026",
          "dueDate": "2026-05-15",
          "completedDate": "2026-05-16",
          "status": "Completed",
          "ticketId": "TCK-HIST-004",
          "technician": "Raju Sharma"
        },
        {
          "visitNumber": 5,
          "quarter": "Q3-2026",
          "dueDate": "2026-08-15",
          "completedDate": "2026-08-15",
          "status": "Completed",
          "ticketId": "TCK-HIST-005",
          "technician": "Raju Sharma"
        },
        {
          "visitNumber": 6,
          "quarter": "Q4-2026",
          "dueDate": "2026-10-15",
          "completedDate": null,
          "status": "Scheduled",
          "ticketId": "TCK-2026-001",
          "technician": "Romen Kalita"
        },
        {
          "visitNumber": 7,
          "quarter": "Q4-2026",
          "dueDate": "2026-11-15",
          "completedDate": null,
          "status": "Scheduled",
          "ticketId": null,
          "technician": "Pending Assignment"
        },
        {
          "visitNumber": 8,
          "quarter": "Q4-2026",
          "dueDate": "2026-12-15",
          "completedDate": null,
          "status": "Scheduled",
          "ticketId": null,
          "technician": "Pending Assignment"
        }
      ]
    },
    {
      "id": "AMC-2026-002",
      "organizationId": "ORG-2026-002",
      "siteId": "SITE-2026-002",
      "title": "Clinical IT Network, UPS & Server Infrastructure Maintenance SLA",
      "contractType": "IT Infra & Network SLA",
      "tier": "Enterprise IT SLA",
      "annualFee": 36000,
      "billingFrequency": "Quarterly",
      "sacCode": "SAC 998713",
      "startDate": "2026-03-01",
      "endDate": "2027-02-28",
      "nextBillingDate": "2026-12-01",
      "renewalReminderDays": 45,
      "scheduledVisitsPerYear": 12,
      "completedVisits": 7,
      "emergencyResponseSlaHours": 2,
      "status": "Active",
      "terms": "Includes monthly preventive server maintenance, bi-monthly UPS battery impedance audits, managed switch firmware maintenance, and standby replacement hardware.",
      "scheduledVisits": [
        {
          "visitNumber": 1,
          "quarter": "Q1-2026",
          "dueDate": "2026-03-10",
          "completedDate": "2026-03-09",
          "status": "Completed",
          "ticketId": "TCK-HIST-010",
          "technician": "Debajit Sarma"
        },
        {
          "visitNumber": 2,
          "quarter": "Q2-2026",
          "dueDate": "2026-05-10",
          "completedDate": "2026-05-10",
          "status": "Completed",
          "ticketId": "TCK-HIST-011",
          "technician": "Debajit Sarma"
        },
        {
          "visitNumber": 3,
          "quarter": "Q3-2026",
          "dueDate": "2026-07-10",
          "completedDate": "2026-07-11",
          "status": "Completed",
          "ticketId": "TCK-HIST-012",
          "technician": "Debajit Sarma"
        },
        {
          "visitNumber": 4,
          "quarter": "Q3-2026",
          "dueDate": "2026-09-01",
          "completedDate": "2026-09-01",
          "status": "Completed",
          "ticketId": "TCK-HIST-013",
          "technician": "Debajit Sarma"
        },
        {
          "visitNumber": 5,
          "quarter": "Q4-2026",
          "dueDate": "2026-10-05",
          "completedDate": "2026-10-09",
          "status": "Completed",
          "ticketId": "TCK-2026-003",
          "technician": "Debajit Sarma"
        },
        {
          "visitNumber": 6,
          "quarter": "Q4-2026",
          "dueDate": "2026-11-05",
          "completedDate": null,
          "status": "Scheduled",
          "ticketId": null,
          "technician": "Debajit Sarma"
        },
        {
          "visitNumber": 7,
          "quarter": "Q4-2026",
          "dueDate": "2026-12-05",
          "completedDate": null,
          "status": "Scheduled",
          "ticketId": null,
          "technician": "Debajit Sarma"
        }
      ]
    }
  ],
  "facilitySpaces": [
    {
      "id": "SPC-2026-001",
      "organizationId": "ORG-2026-001",
      "siteId": "SITE-2026-001",
      "buildingName": "Main Warehouse & Admin Block",
      "floorLevel": "Rooftop Level",
      "roomNumberOrName": "Solar PV Array & Inverter Bay North",
      "areaSqFt": 3500,
      "occupancyType": "Mechanical / Solar Array",
      "status": "Active",
      "linkedAssetCount": 2,
      "notes": "Reinforced flat RCC rooftop housing 65x 540Wp Tier-1 Mono PERC panels and 35 kW string inverter."
    },
    {
      "id": "SPC-2026-002",
      "organizationId": "ORG-2026-001",
      "siteId": "SITE-2026-001",
      "buildingName": "Main Warehouse",
      "floorLevel": "Ground Floor",
      "roomNumberOrName": "LT Switchgear & Net-Metering Substation",
      "areaSqFt": 450,
      "occupancyType": "Electrical Utility",
      "status": "Active",
      "linkedAssetCount": 1,
      "notes": "Contains 100A 4-pole ACDB, APDCL bi-directional meter cabinet, and earthing busbars."
    },
    {
      "id": "SPC-2026-003",
      "organizationId": "ORG-2026-002",
      "siteId": "SITE-2026-002",
      "buildingName": "Diagnostic Wing",
      "floorLevel": "Ground Floor",
      "roomNumberOrName": "Server & UPS Network Hub 101",
      "areaSqFt": 180,
      "occupancyType": "IT Server Facility",
      "status": "Active",
      "linkedAssetCount": 2,
      "notes": "Dedicated 18U rack, dual 3kVA online UPS with precision AC climate control."
    },
    {
      "id": "SPC-2026-004",
      "organizationId": "ORG-2026-002",
      "siteId": "SITE-2026-002",
      "buildingName": "Diagnostic Wing",
      "floorLevel": "1st Floor",
      "roomNumberOrName": "Pathology & Clinical Lab Zone A",
      "areaSqFt": 850,
      "occupancyType": "Clinical / Lab",
      "status": "Active",
      "linkedAssetCount": 0,
      "notes": "Biomedical diagnostic workstations, refrigerated reagent storage, and emergency lighting."
    },
    {
      "id": "SPC-2026-005",
      "organizationId": "ORG-2026-003",
      "siteId": "SITE-2026-003",
      "buildingName": "Cold Storage Bay 1",
      "floorLevel": "Mezzanine Floor",
      "roomNumberOrName": "Ammonia Compressor & HVAC Plant Room",
      "areaSqFt": 1200,
      "occupancyType": "HVAC / Refrigeration",
      "status": "Active",
      "linkedAssetCount": 1,
      "notes": "Heavy industrial cooling compressors and condenser coil bank."
    }
  ],
  "facilityVendors": [
    {
      "id": "VND-2026-001",
      "name": "Assam Power Tech Engineering",
      "tradeCategory": "Electrical & CEIG Contractor",
      "contactPerson": "Pranab Goswami",
      "phone": "+91 98640 55443",
      "email": "info@assampowertech.in",
      "gstin": "18AABCA1234F1Z5",
      "status": "Verified",
      "rating": 4.8,
      "slaResponseHours": 4,
      "notes": "Licensed Class-1 electrical contractor for HT/LT switchgear, CEIG statutory inspections, and transformer testing."
    },
    {
      "id": "VND-2026-002",
      "name": "North East Climate Solutions",
      "tradeCategory": "HVAC & Commercial Refrigeration",
      "contactPerson": "Bhaskar Jyoti Roy",
      "phone": "+91 94350 44332",
      "email": "service@neclimatesolutions.com",
      "gstin": "18BBCDE5678G1Z2",
      "status": "Verified",
      "rating": 4.6,
      "slaResponseHours": 6,
      "notes": "Authorized Daikin & Blue Star industrial VRV/HVAC service contractor with 24/7 breakdown support."
    },
    {
      "id": "VND-2026-003",
      "name": "Brahmaputra Solar Power Services",
      "tradeCategory": "Solar PV Module Washing & Structural Maintenance",
      "contactPerson": "Dipankar Deka",
      "phone": "+91 98540 99887",
      "email": "solarclean@brahmaputrasolar.in",
      "gstin": "18CCDEF9012H1Z9",
      "status": "Verified",
      "rating": 4.9,
      "slaResponseHours": 8,
      "notes": "Deionized water panel washing with automated rotary brushes and torque verification for aluminum racking."
    },
    {
      "id": "VND-2026-004",
      "name": "Kamrup Network & Fiber Solutions",
      "tradeCategory": "Structured Cabling & Fiber Splicing",
      "contactPerson": "Anupam Das",
      "phone": "+91 97060 11223",
      "email": "support@kamrupnetwork.in",
      "gstin": "18DDEFG3456I1Z6",
      "status": "Verified",
      "rating": 4.7,
      "slaResponseHours": 4,
      "notes": "Fluke-certified optical fiber fusion splicing and Cat6 network cabling infrastructure."
    }
  ],
  "utilityReadings": [
    {
      "id": "UTL-2026-001",
      "siteId": "SITE-2026-001",
      "organizationId": "ORG-2026-001",
      "billingMonth": "2026-09",
      "discomConsumerNo": "100200300401",
      "gridUnitsImportedKwh": 4850,
      "solarUnitsExportedKwh": 3920,
      "netUnitsBilledKwh": 930,
      "peakDemandKva": 34.2,
      "powerFactor": 0.96,
      "totalBillAmountInr": 7850,
      "recordedAt": "2026-10-02",
      "notes": "Solar array offset 80.8% of gross daytime energy demand. Power factor healthy (>0.95)."
    },
    {
      "id": "UTL-2026-002",
      "siteId": "SITE-2026-001",
      "organizationId": "ORG-2026-001",
      "billingMonth": "2026-08",
      "discomConsumerNo": "100200300401",
      "gridUnitsImportedKwh": 5120,
      "solarUnitsExportedKwh": 3740,
      "netUnitsBilledKwh": 1380,
      "peakDemandKva": 35.8,
      "powerFactor": 0.95,
      "totalBillAmountInr": 11200,
      "recordedAt": "2026-09-03",
      "notes": "Monsoon cloud cover lowered export slightly. Net bill remains ₹27,000 below pre-solar baseline."
    },
    {
      "id": "UTL-2026-003",
      "siteId": "SITE-2026-002",
      "organizationId": "ORG-2026-002",
      "billingMonth": "2026-09",
      "discomConsumerNo": "100200500602",
      "gridUnitsImportedKwh": 2150,
      "solarUnitsExportedKwh": 0,
      "netUnitsBilledKwh": 2150,
      "peakDemandKva": 14.5,
      "powerFactor": 0.94,
      "totalBillAmountInr": 16870,
      "recordedAt": "2026-10-04",
      "notes": "Clinic rooftop solar proposal under client review for 10 kWp net-metering installation."
    },
    {
      "id": "UTL-2026-004",
      "siteId": "SITE-2026-003",
      "organizationId": "ORG-2026-003",
      "billingMonth": "2026-09",
      "discomConsumerNo": "100200700803",
      "gridUnitsImportedKwh": 6400,
      "solarUnitsExportedKwh": 1850,
      "netUnitsBilledKwh": 4550,
      "peakDemandKva": 42,
      "powerFactor": 0.97,
      "totalBillAmountInr": 35800,
      "recordedAt": "2026-10-03",
      "notes": "Cold storage compressor optimization with 15 kWp partial solar support."
    }
  ],
  "complianceRecords": [
    {
      "id": "CMP-2026-001",
      "siteId": "SITE-2026-001",
      "organizationId": "ORG-2026-001",
      "complianceType": "CEIG Statutory Electrical Safety Certificate",
      "certificateNumber": "CEIG/ASM/KAM/2025/1104",
      "inspectingAuthority": "Chief Electrical Inspectorate Govt of Assam (CEIG)",
      "issueDate": "2025-11-15",
      "expiryDate": "2026-11-14",
      "status": "Valid",
      "frequencyMonths": 12,
      "remarks": "Covers 35 kWp rooftop solar plant and 11kV step-down transformer substation. Earthing verified at 1.4 Ohms."
    },
    {
      "id": "CMP-2026-002",
      "siteId": "SITE-2026-001",
      "organizationId": "ORG-2026-001",
      "complianceType": "APDCL Bi-Directional Net-Meter Test Report",
      "certificateNumber": "APDCL/MRT/GHY/2026/045",
      "inspectingAuthority": "APDCL Meter Relay & Testing (MRT) Division",
      "issueDate": "2026-01-20",
      "expiryDate": "2031-01-19",
      "status": "Valid",
      "frequencyMonths": 60,
      "remarks": "LT-CT operated 0.5s accuracy class bi-directional smart meter verified and sealed."
    },
    {
      "id": "CMP-2026-003",
      "siteId": "SITE-2026-002",
      "organizationId": "ORG-2026-002",
      "complianceType": "Fire Safety NOC & Extinguisher Inspection",
      "certificateNumber": "FS/ASM/GHY/2025/892",
      "inspectingAuthority": "State Fire Service Organization, Assam",
      "issueDate": "2025-10-25",
      "expiryDate": "2026-10-24",
      "status": "Due for Renewal",
      "frequencyMonths": 12,
      "remarks": "Annual inspection due within 10 days. Server room clean-agent FM-200 gas suppression inspection scheduled."
    },
    {
      "id": "CMP-2026-004",
      "siteId": "SITE-2026-003",
      "organizationId": "ORG-2026-003",
      "complianceType": "Earthing Pit Resistance Test Certification",
      "certificateNumber": "MAX/EARTH/2026/088",
      "inspectingAuthority": "MaxEco Energy & Tech Testing Bureau",
      "issueDate": "2026-04-10",
      "expiryDate": "2026-10-09",
      "status": "Expired",
      "frequencyMonths": 6,
      "remarks": "Six-month periodic test expired. Chemical re-treatment required for cold storage earth pit #3."
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = initialSeedData;
}
if (typeof window !== 'undefined') {
  window.initialSeedData = initialSeedData;
}
