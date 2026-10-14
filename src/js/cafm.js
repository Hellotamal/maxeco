// MaxEco CAFM (Computer-Aided Facility Management) Controller
// Comprehensive Asset Lifecycle, Multi-Tenant Organizations, QR Identification, PPM & Helpdesk Engine

// Standalone Pure-JS QR Code SVG Generator (Zero External Dependency)
function generateQrSvg(text, size = 180) {
  if (!text) text = "MAXECO-CAFM";
  const utf8 = [];
  for (let i = 0; i < text.length; i++) {
    let c = text.charCodeAt(i);
    if (c < 128) utf8.push(c);
    else if (c < 2048) {
      utf8.push((c >> 6) | 192, (c & 63) | 128);
    } else {
      utf8.push((c >> 12) | 224, ((c >> 6) & 63) | 128, (c & 63) | 128);
    }
  }

  let version = 1;
  let totalDataCodewords = 19;
  let ecCodewords = 7;
  let matrixSize = 21;

  if (utf8.length <= 14) {
    version = 1; totalDataCodewords = 19; ecCodewords = 7; matrixSize = 21;
  } else if (utf8.length <= 26) {
    version = 2; totalDataCodewords = 34; ecCodewords = 10; matrixSize = 25;
  } else if (utf8.length <= 44) {
    version = 3; totalDataCodewords = 55; ecCodewords = 15; matrixSize = 29;
  } else {
    version = 4; totalDataCodewords = 80; ecCodewords = 20; matrixSize = 33;
  }

  const bits = [];
  function pushBits(val, len) {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  }

  pushBits(4, 4); // Byte mode indicator
  pushBits(utf8.length, 8); // Character count indicator
  for (let i = 0; i < utf8.length; i++) {
    pushBits(utf8[i], 8);
  }

  const maxDataBits = totalDataCodewords * 8;
  const termLen = Math.min(4, maxDataBits - bits.length);
  pushBits(0, termLen);

  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  const dataBytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bits[i + j];
    }
    dataBytes.push(b);
  }

  let padByte = 0xEC;
  while (dataBytes.length < totalDataCodewords) {
    dataBytes.push(padByte);
    padByte = (padByte === 0xEC) ? 0x11 : 0xEC;
  }

  // Galois Field GF(256) Math for Reed-Solomon Error Correction
  const EXP = new Uint8Array(512);
  const LOG = new Uint8Array(256);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    EXP[i + 255] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 256) x ^= 0x11d;
  }

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return EXP[LOG[a] + LOG[b]];
  }

  function rsGenPoly(n) {
    let p = [1];
    for (let i = 0; i < n; i++) {
      const next = new Array(p.length + 1).fill(0);
      for (let j = 0; j < p.length; j++) {
        next[j] ^= gfMul(p[j], EXP[i]);
        next[j + 1] ^= p[j];
      }
      p = next;
    }
    return p;
  }

  const gen = rsGenPoly(ecCodewords);
  const ecBytes = new Array(ecCodewords).fill(0);
  for (let i = 0; i < dataBytes.length; i++) {
    const factor = dataBytes[i] ^ ecBytes[0];
    ecBytes.shift();
    ecBytes.push(0);
    if (factor !== 0) {
      for (let j = 0; j < ecCodewords; j++) {
        ecBytes[j] ^= gfMul(gen[j], factor);
      }
    }
  }

  const allCodewords = dataBytes.concat(ecBytes);

  const matrix = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(null));
  const isFunction = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(false));

  function setFinder(startR, startC) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = (r === 0 || r === 6 || c === 0 || c === 6);
        const isCenter = (r >= 2 && r <= 4 && c >= 2 && c <= 4);
        matrix[startR + r][startC + c] = (isBorder || isCenter) ? 1 : 0;
        isFunction[startR + r][startC + c] = true;
      }
    }
  }

  setFinder(0, 0);
  setFinder(0, matrixSize - 7);
  setFinder(matrixSize - 7, 0);

  function setSeparator(r1, c1, r2, c2) {
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        if (r >= 0 && r < matrixSize && c >= 0 && c < matrixSize) {
          matrix[r][c] = 0;
          isFunction[r][c] = true;
        }
      }
    }
  }
  setSeparator(7, 0, 7, 7);
  setSeparator(0, 7, 7, 7);
  setSeparator(7, matrixSize - 8, 7, matrixSize - 1);
  setSeparator(0, matrixSize - 8, 7, matrixSize - 8);
  setSeparator(matrixSize - 8, 0, matrixSize - 8, 7);
  setSeparator(matrixSize - 8, 7, matrixSize - 1, 7);

  // Timing patterns
  for (let i = 8; i < matrixSize - 8; i++) {
    matrix[6][i] = (i % 2 === 0) ? 1 : 0;
    isFunction[6][i] = true;
    matrix[i][6] = (i % 2 === 0) ? 1 : 0;
    isFunction[i][6] = true;
  }

  // Dark module
  matrix[4 * version + 9][8] = 1;
  isFunction[4 * version + 9][8] = true;

  // Alignment pattern
  const alignCoords = { 2: [6, 18], 3: [6, 22], 4: [6, 26] };
  if (alignCoords[version]) {
    const coords = alignCoords[version];
    for (let r of coords) {
      for (let c of coords) {
        if (isFunction[r][c]) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBorder = (Math.abs(dr) === 2 || Math.abs(dc) === 2);
            const isCenter = (dr === 0 && dc === 0);
            matrix[r + dr][c + dc] = (isBorder || isCenter) ? 1 : 0;
            isFunction[r + dr][c + dc] = true;
          }
        }
      }
    }
  }

  // Format info (Level L, Mask 0) = 0x77C4
  const formatBits = 0x77c4;
  const fBits = [];
  for (let i = 14; i >= 0; i--) {
    fBits.push((formatBits >> i) & 1);
  }

  const formatPos1 = [
    [8,0], [8,1], [8,2], [8,3], [8,4], [8,5], [8,7], [8,8],
    [7,8], [5,8], [4,8], [3,8], [2,8], [1,8], [0,8]
  ];
  for (let i = 0; i < 15; i++) {
    const [r, c] = formatPos1[i];
    matrix[r][c] = fBits[i];
    isFunction[r][c] = true;
  }

  const formatPos2 = [
    [matrixSize - 1, 8], [matrixSize - 2, 8], [matrixSize - 3, 8], [matrixSize - 4, 8],
    [matrixSize - 5, 8], [matrixSize - 6, 8], [matrixSize - 7, 8],
    [8, matrixSize - 8], [8, matrixSize - 7], [8, matrixSize - 6], [8, matrixSize - 5],
    [8, matrixSize - 4], [8, matrixSize - 3], [8, matrixSize - 2], [8, matrixSize - 1]
  ];
  for (let i = 0; i < 15; i++) {
    const [r, c] = formatPos2[i];
    matrix[r][c] = fBits[i];
    isFunction[r][c] = true;
  }

  // Interleave data bits with Mask 0
  const allBits = [];
  for (let b of allCodewords) {
    for (let i = 7; i >= 0; i--) {
      allBits.push((b >> i) & 1);
    }
  }

  let bitIdx = 0;
  let dir = -1;
  let c = matrixSize - 1;

  while (c > 0) {
    if (c === 6) c--;
    for (let step = 0; step < matrixSize; step++) {
      const row = (dir === -1) ? (matrixSize - 1 - step) : step;
      for (let colOffset = 0; colOffset < 2; colOffset++) {
        const col = c - colOffset;
        if (!isFunction[row][col]) {
          let bit = (bitIdx < allBits.length) ? allBits[bitIdx++] : 0;
          if ((row + col) % 2 === 0) bit ^= 1;
          matrix[row][col] = bit;
        }
      }
    }
    dir = -dir;
    c -= 2;
  }

  // Render SVG string
  const quietZone = 4;
  const totalDim = matrixSize + quietZone * 2;
  let rects = '';
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c] === 1) {
        rects += `<rect x="${c + quietZone}" y="${r + quietZone}" width="1" height="1" fill="#0f172a"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalDim} ${totalDim}" width="${size}" height="${size}" shape-rendering="crispEdges"><rect width="${totalDim}" height="${totalDim}" fill="#ffffff"/>${rects}</svg>`;
}

class CafmController {
  constructor() {
    this.currentOrganizationFilter = 'all';
    this.companyProfile = {
      name: "MaxEco Energy & Tech",
      tagline: "Clean Energy Advisory • Solar EPC • IT Infra & CAFM Facilities Management",
      address: "Maligaon, Guwahati, Assam, Pin - 781011",
      phone: "+91 99544 93909",
      email: "maxecoenergyit@gmail.com",
      discom: "APDCL (Assam Power Distribution Company Limited)",
      logoImage: (typeof window !== 'undefined' && window.LOGO_EMBLEM_DATA_URI) || (typeof global !== 'undefined' && global.LOGO_EMBLEM_DATA_URI) || "assets/logo-emblem.png"
    };
  }

  get storage() {
    return (typeof window !== 'undefined' && window.storage) ? window.storage : (typeof global !== 'undefined' ? global.storage : null);
  }

  // --- MULTI-TENANT FILTERING ---
  setOrganizationFilter(orgId) {
    this.currentOrganizationFilter = orgId || 'all';
    return this.currentOrganizationFilter;
  }

  getOrganizationFilter() {
    return this.currentOrganizationFilter;
  }

  // --- EXECUTIVE SUMMARY & KPIS ---
  getSummary(orgId = null) {
    const filterOrg = orgId !== null ? orgId : this.currentOrganizationFilter;
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);

    if (!store) return {};

    const organizations = store.getOrganizations() || [];
    let sites = store.getFacilitySites() || [];
    let assets = store.getFacilityAssets() || [];
    let tickets = store.getServiceTickets() || [];
    let amcs = store.getAmcContracts() || [];

    // Filter by organization if specified
    if (filterOrg && filterOrg !== 'all') {
      sites = sites.filter(s => s.organizationId === filterOrg);
      assets = assets.filter(a => a.organizationId === filterOrg);
      tickets = tickets.filter(t => t.organizationId === filterOrg);
      amcs = amcs.filter(a => a.organizationId === filterOrg);
    }

    const totalOrganizations = organizations.length;
    const totalSites = sites.length;
    const totalSolarCapacityKwp = sites.reduce((acc, s) => acc + (Number(s.solarCapacityKwp) || 0), 0);
    const totalSanctionedLoadKw = sites.reduce((acc, s) => acc + (Number(s.sanctionedLoadKw) || 0), 0);

    const totalAssets = assets.length;
    const solarAssetsCount = assets.filter(a => a.category === 'Solar EPC').length;
    const itAssetsCount = assets.filter(a => a.category === 'IT Infrastructure').length;
    const electricalAssetsCount = assets.filter(a => a.category === 'Electrical & CEIG').length;

    // PPM due calculation: nextServiceDate within 15 days or past, or status === 'Service Due'
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + 15);
    const thresholdStr = thresholdDate.toISOString().slice(0, 10);

    const dueAssets = assets.filter(a => {
      if (a.status === 'Service Due') return true;
      if (a.nextServiceDate && a.nextServiceDate <= thresholdStr && a.status !== 'Retired') return true;
      return false;
    });

    const openTickets = tickets.filter(t => t.status === 'Open' || t.status === 'Dispatched' || t.status === 'In Progress');
    const criticalTickets = tickets.filter(t => (t.priority === 'Critical' || t.priority === 'High') && t.status !== 'Resolved' && t.status !== 'Closed');

    const activeAmcs = amcs.filter(a => a.status === 'Active');
    const totalAnnualAmcValue = activeAmcs.reduce((acc, a) => acc + (Number(a.annualFee) || 0), 0);

    // AMC Renewal reminders: expiring within 45 days
    const amcReminderThreshold = new Date();
    amcReminderThreshold.setDate(today.getDate() + 45);
    const amcThresholdStr = amcReminderThreshold.toISOString().slice(0, 10);

    const expiringAmcs = activeAmcs.filter(a => {
      if (!a.endDate) return false;
      return a.endDate <= amcThresholdStr;
    }).map(a => {
      const endD = new Date(a.endDate);
      const diffMs = endD - today;
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return {
        ...a,
        daysLeft,
        isExpired: daysLeft <= 0
      };
    });

    let spaces = store.getFacilitySpaces ? store.getFacilitySpaces() : [];
    let vendors = store.getFacilityVendors ? store.getFacilityVendors() : [];
    let utilities = store.getUtilityReadings ? store.getUtilityReadings() : [];
    let compliance = store.getComplianceRecords ? store.getComplianceRecords() : [];

    if (filterOrg && filterOrg !== 'all') {
      spaces = spaces.filter(s => s.organizationId === filterOrg);
      utilities = utilities.filter(u => u.organizationId === filterOrg);
      compliance = compliance.filter(c => c.organizationId === filterOrg);
    }

    // Compliance alerts: Expired or Due for Renewal or expiring within 45 days
    const dueCompliance = compliance.filter(c => {
      if (c.status === 'Expired' || c.status === 'Due for Renewal') return true;
      if (c.expiryDate && c.expiryDate <= thresholdStr) return true;
      return false;
    });

    // Solar offset ratio calculation across utility readings
    const totalGridImport = utilities.reduce((acc, u) => acc + (Number(u.gridUnitsImportedKwh) || 0), 0);
    const totalSolarExport = utilities.reduce((acc, u) => acc + (Number(u.solarUnitsExportedKwh) || 0), 0);
    const solarOffsetRatio = (totalGridImport + totalSolarExport) > 0 
      ? Math.round((totalSolarExport / (totalGridImport + totalSolarExport)) * 100) 
      : 0;

    return {
      totalOrganizations,
      totalSites,
      totalSolarCapacityKwp,
      totalSanctionedLoadKw,
      totalAssets,
      solarAssetsCount,
      itAssetsCount,
      electricalAssetsCount,
      dueAssetsCount: dueAssets.length,
      dueAssets,
      totalTicketsCount: tickets.length,
      openTicketsCount: openTickets.length,
      criticalTicketsCount: criticalTickets.length,
      totalAmcCount: amcs.length,
      activeAmcCount: activeAmcs.length,
      totalAnnualAmcValue,
      expiringAmcCount: expiringAmcs.length,
      expiringAmcs,
      totalSpaces: spaces.length,
      totalVendors: vendors.length,
      complianceAlertsCount: dueCompliance.length,
      dueCompliance,
      solarOffsetRatio,
      totalGridImport,
      totalSolarExport
    };
  }

  // --- CUSTOMER ORGANIZATIONS MANAGEMENT ---
  getOrganizations(status = 'all') {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (!store) return [];
    let list = store.getOrganizations() || [];
    if (status !== 'all') {
      list = list.filter(o => (o.status || '').toLowerCase() === status.toLowerCase());
    }
    return list;
  }

  getOrganizationById(id) {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    return store ? store.getOrganizationById(id) : null;
  }

  saveOrganization(org) {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    return store ? store.saveOrganization(org) : null;
  }

  deleteOrganization(id) {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (store) store.deleteOrganization(id);
  }

  // --- SITES MANAGEMENT ---
  getSites(filter = 'all', orgId = null) {
    const targetOrg = orgId !== null ? orgId : this.currentOrganizationFilter;
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (!store) return [];
    let list = store.getFacilitySites() || [];
    if (targetOrg && targetOrg !== 'all') {
      list = list.filter(s => s.organizationId === targetOrg);
    }
    if (filter !== 'all') {
      list = list.filter(s => (s.siteType || '').toLowerCase().includes(filter.toLowerCase()));
    }
    return list;
  }

  getSiteById(id) {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    return (store && store.getFacilitySites() || []).find(s => s.id === id) || null;
  }

  saveSite(site) {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    return store ? store.saveFacilitySite(site) : null;
  }

  deleteSite(id) {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (store) store.deleteFacilitySite(id);
  }

  // --- ASSETS MANAGEMENT ---
  getAssets(category = 'all', status = 'all', orgId = null) {
    const targetOrg = orgId !== null ? orgId : this.currentOrganizationFilter;
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (!store) return [];
    let list = store.getFacilityAssets() || [];
    if (targetOrg && targetOrg !== 'all') {
      list = list.filter(a => a.organizationId === targetOrg);
    }
    if (category !== 'all') {
      list = list.filter(a => (a.category || '').toLowerCase() === category.toLowerCase());
    }
    if (status !== 'all') {
      list = list.filter(a => (a.status || '').toLowerCase() === status.toLowerCase());
    }
    return list;
  }

  getAssetById(id) {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    return (store && store.getFacilityAssets() || []).find(a => a.id === id) || null;
  }

  saveAsset(asset) {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (!store) return null;
    if (!asset.qrCodePayload) {
      asset.qrCodePayload = `MAXECO-CAFM|${asset.organizationId || 'ORG'}|${asset.siteId || 'SITE'}|${asset.id || 'AST'}|${asset.serialNumber || 'SN'}`;
    }
    return store.saveFacilityAsset(asset);
  }

  updateAssetStatus(id, newStatus) {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    return store ? store.updateAssetStatus(id, newStatus) : null;
  }

  deleteAsset(id) {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (store) store.deleteFacilityAsset(id);
  }

  // --- QR CODE & ASSET IDENTIFICATION TAG GENERATORS ---
  generateAssetQrSvg(assetId, size = 180) {
    const asset = this.getAssetById(assetId);
    const payload = asset && asset.qrCodePayload ? asset.qrCodePayload : `MAXECO-CAFM|AST|${assetId}`;
    return generateQrSvg(payload, size);
  }

  generateAssetTagHtml(assetId) {
    const asset = this.getAssetById(assetId);
    if (!asset) return `<div style="padding: 20px; color: red;">Asset not found: ${assetId}</div>`;

    const site = this.getSiteById(asset.siteId);
    const org = this.getOrganizationById(asset.organizationId) || (site ? this.getOrganizationById(site.organizationId) : null);
    const qrSvg = this.generateAssetQrSvg(assetId, 140);
    const logoUri = this.companyProfile.logoImage;

    return `
      <div class="maxeco-asset-tag-sheet" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; color: #0f172a; border: 2px solid #0f172a; border-radius: 8px; padding: 16px; max-width: 140mm; margin: 0 auto; box-sizing: border-box;">
        
        <!-- Tag Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="${logoUri}" alt="MaxEco Logo" style="width: 32px; height: 32px; object-fit: contain;">
            <div>
              <div style="font-size: 13px; font-weight: 800; color: #0f172a; letter-spacing: 0.5px;">MAXECO ASSET IDENTIFICATION TAG</div>
              <div style="font-size: 9px; color: #64748b; font-weight: 600;">CAFM FACILITY &amp; HARDWARE REGISTER • GUWAHATI</div>
            </div>
          </div>
          <div style="text-align: right;">
            <span style="background: #0f172a; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; font-family: monospace;">${asset.id}</span>
          </div>
        </div>

        <!-- Tag Body Grid: QR Code Left, Details Right -->
        <div style="display: grid; grid-template-columns: 140px 1fr; gap: 14px; align-items: center;">
          <div style="text-align: center; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px; background: #f8fafc;">
            ${qrSvg}
            <div style="font-size: 8px; font-weight: 700; color: #475569; margin-top: 4px; text-transform: uppercase;">SCAN FOR SERVICE HISTORY</div>
          </div>

          <div>
            <div style="font-size: 13px; font-weight: 800; color: #0f172a; line-height: 1.25; margin-bottom: 4px;">${asset.name}</div>
            <div style="font-size: 10px; color: #475569; margin-bottom: 2px;">Category: <strong style="color: #0f172a;">${asset.category}</strong></div>
            <div style="font-size: 10px; color: #475569; margin-bottom: 2px;">Model: <strong style="color: #0f172a;">${asset.modelNumber || '—'}</strong></div>
            <div style="font-size: 10px; color: #475569; margin-bottom: 4px;">Serial No: <strong style="font-family: monospace; color: #0369a1;">${asset.serialNumber || '—'}</strong></div>
            
            <div style="background: #f1f5f9; padding: 6px 8px; border-radius: 4px; font-size: 9.5px; color: #334155; margin-bottom: 6px;">
              <div>Location: <strong>${asset.location || (site ? site.name : 'Central Facility')}</strong></div>
              <div>Organization: <strong>${org ? org.name : (site ? site.clientName : 'Client Organization')}</strong></div>
            </div>

            <div style="display: flex; gap: 8px; font-size: 8.5px;">
              <span style="background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 2px 6px; border-radius: 3px; font-weight: 700;">Warranty: ${asset.warrantyExpiry || 'Active'}</span>
              <span style="background: #fffbeb; color: #92400e; border: 1px solid #fde68a; padding: 2px 6px; border-radius: 3px; font-weight: 700;">Criticality: ${asset.criticality || 'Normal'}</span>
            </div>
          </div>
        </div>

        <!-- Tag Footer -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; margin-top: 12px; padding-top: 6px; font-size: 8.5px; color: #64748b;">
          <div>24/7 Breakdown &amp; CEIG Hotline: <strong style="color: #0f172a;">+91 99544 93909</strong></div>
          <div>Do Not Remove • Property of Client / MaxEco O&amp;M</div>
        </div>

      </div>
    `;
  }

  // --- PREVENTIVE MAINTENANCE (PPM) ENGINE ---
  getPpmDueAssets(daysAhead = 30, orgId = null) {
    const assets = this.getAssets('all', 'all', orgId);
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysAhead);
    const thresholdStr = thresholdDate.toISOString().slice(0, 10);
    const todayStr = today.toISOString().slice(0, 10);

    const dueList = [];

    assets.forEach(a => {
      if (a.status === 'Retired') return;

      const isStatusDue = (a.status === 'Service Due');
      const nextDue = a.nextServiceDate || '';
      const isDateDue = nextDue && nextDue <= thresholdStr;

      if (isStatusDue || isDateDue) {
        let urgency = 'normal';
        let daysLeft = 0;

        if (nextDue) {
          const diffMs = new Date(nextDue) - today;
          daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          if (daysLeft < 0) urgency = 'overdue';
          else if (daysLeft <= 7) urgency = 'urgent';
          else urgency = 'upcoming';
        } else if (isStatusDue) {
          urgency = 'overdue';
        }

        dueList.push({
          ...a,
          urgency,
          daysLeft
        });
      }
    });

    // Sort by urgency: overdue first, then urgent, then upcoming
    const urgencyOrder = { overdue: 0, urgent: 1, upcoming: 2, normal: 3 };
    dueList.sort((x, y) => urgencyOrder[x.urgency] - urgencyOrder[y.urgency]);

    return dueList;
  }

  createPpmTicket(assetId) {
    const asset = this.getAssetById(assetId);
    if (!asset) return null;

    const site = this.getSiteById(asset.siteId);
    const priority = (asset.criticality === 'Critical' || asset.criticality === 'High') ? 'High' : 'Normal';
    const intervalDays = asset.maintenanceCycleDays || 30;

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);

    const newTicket = {
      organizationId: asset.organizationId || (site ? site.organizationId : 'ORG-2026-001'),
      siteId: asset.siteId,
      assetId: asset.id,
      title: `[PPM Routine] ${asset.name}`,
      priority: priority,
      reportedDate: new Date().toISOString().slice(0, 10),
      targetResponseDate: targetDate.toISOString().slice(0, 10),
      issueDescription: `Scheduled preventive maintenance cycle (${intervalDays} days interval). Inspect equipment integrity, clean dust/debris, test operating voltages/impedance, and log operational telemetry.`,
      assignedTech: "MaxEco Field Engineering Team",
      status: "Open",
      workOrderId: null,
      resolutionNotes: ""
    };

    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    const saved = store ? store.saveServiceTicket(newTicket) : null;

    if (saved && store) {
      store.logAuditAction({
        action: 'CREATE_PPM_TICKET',
        entityType: 'serviceTicket',
        entityId: saved.id,
        details: `Auto-generated PPM ticket ${saved.id} for asset: ${asset.name} (${asset.id})`
      });
    }

    return saved;
  }

  // --- SERVICE TICKETS HELPDESK ---
  getTickets(status = 'all', priority = 'all', orgId = null) {
    const targetOrg = orgId !== null ? orgId : this.currentOrganizationFilter;
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (!store) return [];
    let list = store.getServiceTickets() || [];
    if (targetOrg && targetOrg !== 'all') {
      list = list.filter(t => t.organizationId === targetOrg);
    }
    if (status !== 'all') {
      list = list.filter(t => (t.status || '').toLowerCase() === status.toLowerCase());
    }
    if (priority !== 'all') {
      list = list.filter(t => (t.priority || '').toLowerCase() === priority.toLowerCase());
    }
    return list;
  }

  getTicketById(id) {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    return (store && store.getServiceTickets() || []).find(t => t.id === id) || null;
  }

  saveTicket(ticket) {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    return store ? store.saveServiceTicket(ticket) : null;
  }

  updateTicketStatus(id, newStatus, resolutionNotes = null) {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    return store ? store.updateServiceTicketStatus(id, newStatus, resolutionNotes) : null;
  }

  assignTechnicianToTicket(ticketId, techName, notes = null) {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return null;
    ticket.assignedTech = techName;
    if (notes) ticket.resolutionNotes = notes;
    if (ticket.status === 'Open') ticket.status = 'In Progress';
    return this.saveTicket(ticket);
  }

  deleteTicket(id) {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (store) store.deleteServiceTicket(id);
  }

  dispatchTicketToWorkOrder(ticketId) {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return null;

    const site = this.getSiteById(ticket.siteId);
    const asset = this.getAssetById(ticket.assetId);

    const isElectricalOrSolar = (asset && (asset.category === 'Solar EPC' || asset.category === 'Electrical & CEIG'));
    const safetyNote = isElectricalOrSolar
      ? "Full fall-arrest harness, hard hat, CEIG-rated insulated boots, calibrated megger & safety lifeline"
      : "Anti-static grounding wrist strap, clean cable labeling standards, and encrypted local storage protocols";

    const newWorkOrder = {
      projectId: site ? site.id : "CAFM-GENERAL",
      title: `[CAFM Facility Service] ${ticket.title}`,
      workType: asset ? `Maintenance & PPM (${asset.category})` : "General Facility Maintenance",
      assignedTo: ticket.assignedTech || "MaxEco Field Engineering Team",
      contactPhone: site ? site.contactPhone : "+91 99544 93909",
      scheduledDate: new Date().toISOString().slice(0, 10),
      targetCompletionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      contractorFee: 0,
      safetyCompliance: safetyNote,
      status: "Dispatched",
      notes: `Triggered from CAFM Ticket ${ticket.id} for facility: ${site ? site.name : 'Unknown'}. Asset: ${asset ? asset.name : 'General'}. Issue: ${ticket.issueDescription || ''}`
    };

    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (!store) return null;

    const savedWO = store.saveWorkOrder(newWorkOrder);
    ticket.workOrderId = savedWO.id;
    ticket.status = "Dispatched";
    store.saveServiceTicket(ticket);

    store.logAuditAction({
      action: 'DISPATCH_TICKET_TO_WORK_ORDER',
      entityType: 'serviceTicket',
      entityId: ticket.id,
      details: `Dispatched CAFM Ticket ${ticket.id} to Field Work Order ${savedWO.id}`
    });

    return savedWO;
  }

  // --- ANNUAL MAINTENANCE CONTRACTS (AMC) ---
  getAmcs(status = 'all', orgId = null) {
    const targetOrg = orgId !== null ? orgId : this.currentOrganizationFilter;
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (!store) return [];
    let list = store.getAmcContracts() || [];
    if (targetOrg && targetOrg !== 'all') {
      list = list.filter(a => a.organizationId === targetOrg);
    }
    if (status !== 'all') {
      list = list.filter(a => (a.status || '').toLowerCase() === status.toLowerCase());
    }
    return list;
  }

  getAmcById(id) {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    return (store && store.getAmcContracts() || []).find(a => a.id === id) || null;
  }

  saveAmc(amc) {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    return store ? store.saveAmcContract(amc) : null;
  }

  updateAmcStatus(id, newStatus) {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    return store ? store.updateAmcStatus(id, newStatus) : null;
  }

  deleteAmc(id) {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (store) store.deleteAmcContract(id);
  }

  getExpiringAmcs(daysAhead = 45, orgId = null) {
    const amcs = this.getAmcs('Active', orgId);
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysAhead);
    const thresholdStr = thresholdDate.toISOString().slice(0, 10);

    return amcs.filter(a => a.endDate && a.endDate <= thresholdStr).map(a => {
      const endD = new Date(a.endDate);
      const diffMs = endD - today;
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return {
        ...a,
        daysLeft,
        isExpired: daysLeft <= 0
      };
    });
  }

  createInvoiceFromAmc(amcId) {
    const amc = this.getAmcById(amcId);
    if (!amc) return null;

    const site = this.getSiteById(amc.siteId);
    const annualFee = Number(amc.annualFee) || 0;
    let billAmount = annualFee;
    let cycleLabel = "Annual Retainer";

    if (amc.billingFrequency === 'Quarterly') {
      billAmount = Math.round(annualFee / 4);
      cycleLabel = "Quarterly Retainer";
    } else if (amc.billingFrequency === 'Half-Yearly') {
      billAmount = Math.round(annualFee / 2);
      cycleLabel = "Half-Yearly Retainer";
    }

    const isSolar = (amc.contractType || '').toLowerCase().includes('solar');
    const sacCode = isSolar ? "995461" : "998713";
    const serviceType = isSolar ? "Solar Energy Advisory" : "IT Infra Sales & Support";

    const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const invoiceData = {
      clientName: site ? site.clientName : "Client Facility",
      clientAddress: site ? site.location : "Guwahati, Assam",
      service: `${amc.title} (${cycleLabel})`,
      serviceCategory: serviceType,
      amountBilled: billAmount,
      amountCollected: 0,
      status: "Unpaid",
      date: new Date().toISOString().slice(0, 10),
      dueDate: dueDate,
      notes: `Periodic AMC retainer for ${site ? site.name : 'Facility'}. Scope: ${amc.terms || ''}. SAC Code: ${sacCode}.`
    };

    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (!store) return null;

    const savedInv = store.saveInvoice(invoiceData);
    store.logAuditAction({
      action: 'GENERATE_AMC_INVOICE',
      entityType: 'amcContract',
      entityId: amc.id,
      details: `Generated GST Invoice ${savedInv.id} for AMC ${amc.id} (${formatINR(billAmount)})`
    });

    return savedInv;
  }

  // --- PRINTABLE FACILITY INSPECTION & SERVICE SLIP ---
  generateInspectionSlipHtml(ticketId) {
    const ticket = this.getTicketById(ticketId);
    const site = ticket ? this.getSiteById(ticket.siteId) : null;
    const asset = ticket ? this.getAssetById(ticket.assetId) : null;

    const logoUri = this.companyProfile.logoImage;
    const signUri = (typeof window !== 'undefined' && window.AUTHORISED_SIGNATURE_DATA_URI) || (typeof global !== 'undefined' && global.AUTHORISED_SIGNATURE_DATA_URI) || "assets/signature.png";

    const docId = ticket ? ticket.id : "FAC-INSP-2026";
    const dateStr = ticket && ticket.reportedDate ? window.formatDate(ticket.reportedDate) : (typeof formatDate !== 'undefined' ? formatDate(new Date().toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10));

    const isSolar = asset && asset.category === 'Solar EPC';
    const isElec = asset && asset.category === 'Electrical & CEIG';

    return `
      <div class="maxeco-invoice-sheet" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; color: #0f172a; padding: 24px; max-width: 190mm; margin: 0 auto; box-sizing: border-box; font-size: 11px; line-height: 1.4;">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 14px;">
          <div style="display: flex; gap: 12px; align-items: center;">
            <img src="${logoUri}" alt="MaxEco Logo" style="width: 44px; height: 44px; object-fit: contain;">
            <div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">${this.companyProfile.name}</div>
              <div style="font-size: 10px; color: #475569; font-weight: 600;">CAFM • FACILITY PREVENTIVE MAINTENANCE &amp; INSPECTION RECORD</div>
              <div style="font-size: 9.5px; color: #64748b;">${this.companyProfile.address} • Ph: ${this.companyProfile.phone}</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 15px; font-weight: 800; color: #0f172a;">SERVICE SLIP</div>
            <div style="font-size: 11px; font-family: monospace; font-weight: 700; color: #d97706;">${docId}</div>
            <div style="font-size: 9.5px; color: #64748b;">Date: ${dateStr}</div>
          </div>
        </div>

        <!-- Facility & Asset Profile Grid -->
        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 14px; margin-bottom: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
          <div>
            <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Client Facility Premise</div>
            <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${site ? site.name : (ticket ? ticket.title : 'Facility Service Site')}</div>
            <div style="font-size: 10px; color: #334155;">${site ? site.location : 'Guwahati, Assam'}</div>
            <div style="font-size: 9.5px; color: #475569; margin-top: 3px;">
              Client: <strong>${site ? site.clientName : 'Customer'}</strong> | Ph: ${site ? site.contactPhone : '—'}
            </div>
            ${site && site.apdclConsumerNo ? `<div style="font-size: 9.5px; color: #0284c7; margin-top: 2px;">APDCL Consumer No: <strong>${site.apdclConsumerNo}</strong></div>` : ''}
          </div>

          <div>
            <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Inspected Asset Information</div>
            <div style="font-size: 12px; font-weight: 700; color: #0f172a;">${asset ? asset.name : 'Facility Hardware'}</div>
            <div style="font-size: 10px; color: #334155;">Category: <strong>${asset ? asset.category : 'General'}</strong> | Model: ${asset ? asset.modelNumber : '—'}</div>
            <div style="font-size: 9.5px; font-family: monospace; color: #475569; margin-top: 2px;">Serial No: ${asset ? asset.serialNumber : '—'}</div>
            <div style="font-size: 9.5px; color: #16a34a; margin-top: 2px;">Status: <strong>${ticket ? ticket.status : 'Inspected'}</strong> (Priority: ${ticket ? ticket.priority : 'Normal'})</div>
          </div>
        </div>

        <!-- Task / Work Summary -->
        <div style="margin-bottom: 14px; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
          <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Maintenance Scope &amp; Reported Issue</div>
          <div style="font-size: 11px; font-weight: 600; color: #0f172a; margin-bottom: 2px;">${ticket ? ticket.title : 'Routine Facility Inspection'}</div>
          <div style="font-size: 10px; color: #475569; line-height: 1.4;">${ticket && ticket.issueDescription ? ticket.issueDescription : 'Preventive maintenance inspection and system health assessment.'}</div>
          ${ticket && ticket.workOrderId ? `<div style="font-size: 9.5px; color: #059669; font-weight: 600; margin-top: 4px;">Linked Work Order: ${ticket.workOrderId}</div>` : ''}
        </div>

        <!-- Preventive Maintenance (PPM) Verification Checklist -->
        <div style="margin-bottom: 14px;">
          <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Technical Verification Checklist (CAFM Benchmarks)</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 9.5px;">
            <thead>
              <tr style="background: #0f172a; color: #ffffff;">
                <th style="padding: 5px 8px; text-align: left; width: 35px;">#</th>
                <th style="padding: 5px 8px; text-align: left;">Inspection Checkpoint</th>
                <th style="padding: 5px 8px; text-align: left; width: 140px;">Standard Benchmark</th>
                <th style="padding: 5px 8px; text-align: center; width: 80px;">Result</th>
              </tr>
            </thead>
            <tbody>
              ${isSolar ? `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px 8px;">1</td>
                  <td style="padding: 5px 8px;">Solar PV Array Surface Cleanliness</td>
                  <td style="padding: 5px 8px;">Dust &amp; soot-free, zero bird-dropping hot spots</td>
                  <td style="padding: 5px 8px; text-align: center; color: #16a34a; font-weight: 700;">[ PASS ]</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px 8px;">2</td>
                  <td style="padding: 5px 8px;">String Inverter DC/AC Terminal Torquing &amp; Heat Sink</td>
                  <td style="padding: 5px 8px;">Clean air flow, no thermal warning, cable tight</td>
                  <td style="padding: 5px 8px; text-align: center; color: #16a34a; font-weight: 700;">[ PASS ]</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px 8px;">3</td>
                  <td style="padding: 5px 8px;">Chemical Earthing Pit Resistance (CEIG)</td>
                  <td style="padding: 5px 8px;">Earth electrode resistance &lt; 2.0 Ohms</td>
                  <td style="padding: 5px 8px; text-align: center; color: #16a34a; font-weight: 700;">1.45 Ω [PASS]</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px 8px;">4</td>
                  <td style="padding: 5px 8px;">APDCL Bi-Directional Net-Meter Daily Yield</td>
                  <td style="padding: 5px 8px;">Synchronized kWh import/export logging verified</td>
                  <td style="padding: 5px 8px; text-align: center; color: #16a34a; font-weight: 700;">[ PASS ]</td>
                </tr>
              ` : (isElec ? `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px 8px;">1</td>
                  <td style="padding: 5px 8px;">Earth Resistance Testing (Fall of Potential)</td>
                  <td style="padding: 5px 8px;">Benchmark &lt; 2.0 Ohms (CEIG Mandate)</td>
                  <td style="padding: 5px 8px; text-align: center; color: #16a34a; font-weight: 700;">1.20 Ω [PASS]</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px 8px;">2</td>
                  <td style="padding: 5px 8px;">Lightning Arrester Copper Strip Continuity</td>
                  <td style="padding: 5px 8px;">Zero mechanical break, solid down conductor</td>
                  <td style="padding: 5px 8px; text-align: center; color: #16a34a; font-weight: 700;">[ PASS ]</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px 8px;">3</td>
                  <td style="padding: 5px 8px;">ACDB / DCDB Surge Protection Device (SPD)</td>
                  <td style="padding: 5px 8px;">Indicator green (No surge breakdown)</td>
                  <td style="padding: 5px 8px; text-align: center; color: #16a34a; font-weight: 700;">[ PASS ]</td>
                </tr>
              ` : `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px 8px;">1</td>
                  <td style="padding: 5px 8px;">UPS Float Voltage &amp; Battery Bank Load Test</td>
                  <td style="padding: 5px 8px;">13.5V – 13.8V per 12V block under load</td>
                  <td style="padding: 5px 8px; text-align: center; color: #16a34a; font-weight: 700;">13.6V [PASS]</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px 8px;">2</td>
                  <td style="padding: 5px 8px;">Server / Network Rack Cable Management &amp; Temps</td>
                  <td style="padding: 5px 8px;">Ambient temp &lt; 25°C, structured patch routing</td>
                  <td style="padding: 5px 8px; text-align: center; color: #16a34a; font-weight: 700;">[ PASS ]</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px 8px;">3</td>
                  <td style="padding: 5px 8px;">Managed Switch Port Error CRC Check &amp; Backup</td>
                  <td style="padding: 5px 8px;">Zero packet drop, config auto-archived</td>
                  <td style="padding: 5px 8px; text-align: center; color: #16a34a; font-weight: 700;">[ PASS ]</td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>

        <!-- Field Resolution / Observations -->
        <div style="border: 1px dashed #cbd5e1; border-radius: 6px; padding: 8px 10px; margin-bottom: 16px;">
          <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Field Technician Findings &amp; Resolution Remarks</div>
          <div style="font-size: 10px; color: #0f172a;">
            ${ticket && ticket.resolutionNotes ? ticket.resolutionNotes : 'All operational parameters inspected and within certified manufacturer tolerance. System handed over in optimal operating condition.'}
          </div>
          <div style="font-size: 9px; color: #64748b; margin-top: 4px;">
            Inspecting Engineer: <strong>${ticket ? ticket.assignedTech : 'MaxEco Field Engineer'}</strong>
          </div>
        </div>

        <!-- Two-Column Signatory Block -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border-top: 1px solid #cbd5e1; padding-top: 10px;">
          <div>
            <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Customer Facility Acceptance</div>
            <div style="font-size: 9.5px; color: #475569; margin-bottom: 20px;">
              Confirmed service execution, checklist inspection, and operational safety clearance.
            </div>
            <div style="border-top: 1px solid #0f172a; width: 140px; margin-top: 25px; padding-top: 3px; font-size: 9px; font-weight: 700;">
              Customer Sign &amp; Stamp
            </div>
          </div>

          <div style="text-align: right;">
            <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">For MaxEco Energy &amp; Tech</div>
            <div style="display: inline-block; padding: 2px 6px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 4px; font-size: 8.5px; font-weight: 700; color: #047857; margin-bottom: 4px;">
              🛡️ DIGITALLY VERIFIED CAFM INSPECTION
            </div>
            <div>
              <img src="${signUri}" alt="Authorised Signature" style="height: 34px; max-width: 120px; object-fit: contain;">
            </div>
            <div style="font-size: 10px; font-weight: 700; color: #0f172a;">Tamal Roy</div>
            <div style="font-size: 9px; color: #64748b;">Authorised Signatory • Guwahati</div>
          </div>
        </div>

        <div style="text-align: center; font-size: 8.5px; color: #94a3b8; margin-top: 14px; border-top: 1px dashed #e2e8f0; padding-top: 6px;">
          MaxEco Energy &amp; Tech Computer-Aided Facility Management (CAFM) System • Maligaon, Guwahati, Assam
        </div>

      </div>
    `;
  }

  // ========================================================
  // PHASE 2: OPERATIONS ENGINE
  // ========================================================

  // --- SPARE PARTS CATALOG WRAPPERS ---
  getPartsCatalog(category = 'all') {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : (typeof global !== 'undefined' ? global.storage : null);
    if (!store) return [];
    return store.getPartsCatalog(category);
  }

  getPartById(id) {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : (typeof global !== 'undefined' ? global.storage : null);
    if (!store) return null;
    return store.getPartById(id);
  }

  savePart(partData) {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : (typeof global !== 'undefined' ? global.storage : null);
    if (!store) return null;
    return store.savePart(partData);
  }

  deletePart(id) {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : (typeof global !== 'undefined' ? global.storage : null);
    if (!store) return false;
    return store.deletePart(id);
  }

  getDefaultChecklist(category = 'Solar EPC') {
    if (category === 'Solar EPC') {
      return [
        { id: "chk-" + Math.random().toString(36).substr(2, 6), text: "Lock-Out / Tag-Out (LOTO) safety protocol activated on DC isolator", task: "Lock-Out / Tag-Out (LOTO) safety protocol activated on DC isolator", done: false, completed: false, checkedAt: null, checkedBy: null },
        { id: "chk-" + Math.random().toString(36).substr(2, 6), text: "Visual inspection for glass cracks, delamination, or snail trails", task: "Visual inspection for glass cracks, delamination, or snail trails", done: false, completed: false, checkedAt: null, checkedBy: null },
        { id: "chk-" + Math.random().toString(36).substr(2, 6), text: "De-ionized water pressure wash without abrasive cleaning agents", task: "De-ionized water pressure wash without abrasive cleaning agents", done: false, completed: false, checkedAt: null, checkedBy: null },
        { id: "chk-" + Math.random().toString(36).substr(2, 6), text: "Verify module clamp tightness & aluminum torque integrity (9.5 Nm)", task: "Verify module clamp tightness & aluminum torque integrity (9.5 Nm)", done: false, completed: false, checkedAt: null, checkedBy: null },
        { id: "chk-" + Math.random().toString(36).substr(2, 6), text: "Measure DC string open circuit Voc voltage & confirm inverter power logger", task: "Measure DC string open circuit Voc voltage & confirm inverter power logger", done: false, completed: false, checkedAt: null, checkedBy: null }
      ];
    } else if (category === 'IT Infrastructure') {
      return [
        { id: "chk-" + Math.random().toString(36).substr(2, 6), text: "Server rack cable dressing, ventilation fan & ambient airflow check", task: "Server rack cable dressing, ventilation fan & ambient airflow check", done: false, completed: false, checkedAt: null, checkedBy: null },
        { id: "chk-" + Math.random().toString(36).substr(2, 6), text: "Online UPS battery bank impedance & individual 12V float charge test", task: "Online UPS battery bank impedance & individual 12V float charge test", done: false, completed: false, checkedAt: null, checkedBy: null },
        { id: "chk-" + Math.random().toString(36).substr(2, 6), text: "Managed switch ports link integrity & packet loss diagnostic test", task: "Managed switch ports link integrity & packet loss diagnostic test", done: false, completed: false, checkedAt: null, checkedBy: null },
        { id: "chk-" + Math.random().toString(36).substr(2, 6), text: "Simulated utility power loss cutover & runtime discharge verification", task: "Simulated utility power loss cutover & runtime discharge verification", done: false, completed: false, checkedAt: null, checkedBy: null },
        { id: "chk-" + Math.random().toString(36).substr(2, 6), text: "Chassis dust filter cleaning and firmware error log archive", task: "Chassis dust filter cleaning and firmware error log archive", done: false, completed: false, checkedAt: null, checkedBy: null }
      ];
    } else {
      // Electrical & CEIG
      return [
        { id: "chk-" + Math.random().toString(36).substr(2, 6), text: "Megger Earth Resistance 4-terminal test measured (< 2.0 Ohms standard)", task: "Megger Earth Resistance 4-terminal test measured (< 2.0 Ohms standard)", done: false, completed: false, checkedAt: null, checkedBy: null },
        { id: "chk-" + Math.random().toString(36).substr(2, 6), text: "Copper busbar terminal disconnect & oxide layer brushing", task: "Copper busbar terminal disconnect & oxide layer brushing", done: false, completed: false, checkedAt: null, checkedBy: null },
        { id: "chk-" + Math.random().toString(36).substr(2, 6), text: "Chemical compound slurry hydration & cover chamber inspection", task: "Chemical compound slurry hydration & cover chamber inspection", done: false, completed: false, checkedAt: null, checkedBy: null },
        { id: "chk-" + Math.random().toString(36).substr(2, 6), text: "Verify lightning arrester down conductor continuity to roof finial", task: "Verify lightning arrester down conductor continuity to roof finial", done: false, completed: false, checkedAt: null, checkedBy: null },
        { id: "chk-" + Math.random().toString(36).substr(2, 6), text: "Record readings on statutory CEIG Inspection Verification Slip", task: "Record readings on statutory CEIG Inspection Verification Slip", done: false, completed: false, checkedAt: null, checkedBy: null }
      ];
    }
  }

  getTicketChecklist(ticketId) {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return [];
    if (!ticket.checklist || ticket.checklist.length === 0) {
      const asset = ticket.assetId ? this.getAssetById(ticket.assetId) : null;
      ticket.checklist = this.getDefaultChecklist(asset ? asset.category : 'Solar EPC');
      this.saveTicket(ticket);
    }
    // Normalize properties for backwards compatibility
    ticket.checklist.forEach(i => {
      if (!i.task && i.text) i.task = i.text;
      if (!i.text && i.task) i.text = i.task;
      if (i.completed === undefined) i.completed = Boolean(i.done);
      if (i.done === undefined) i.done = Boolean(i.completed);
    });
    return ticket.checklist;
  }

  toggleChecklistItem(ticketId, itemId, checkedBy = '') {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return null;
    if (!ticket.checklist || ticket.checklist.length === 0) {
      this.getTicketChecklist(ticketId);
    }

    const item = ticket.checklist.find(i => i.id === itemId);
    if (!item) return null;

    const newStatus = !(item.done || item.completed);
    item.done = newStatus;
    item.completed = newStatus;
    if (newStatus) {
      item.checkedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
      item.checkedBy = checkedBy || ticket.assignedTech || 'MaxEco Field Engineer';
    } else {
      item.checkedAt = null;
      item.checkedBy = null;
    }

    this.saveTicket(ticket);
    if (this.storage && this.storage.logAuditAction) {
      this.storage.logAuditAction(
        'CHECKLIST_TOGGLE',
        'serviceTickets',
        ticket.id,
        `Task "${item.text || item.task}" marked ${item.done ? 'COMPLETED' : 'PENDING'} by ${item.checkedBy || 'engineer'}`
      );
    }
    return item;
  }

  addChecklistItem(ticketId, taskText, checkedBy = '') {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return null;
    if (!ticket.checklist) ticket.checklist = [];

    const newItem = {
      id: "chk-" + Math.random().toString(36).substr(2, 6),
      text: taskText.trim(),
      task: taskText.trim(),
      done: false,
      completed: false,
      checkedAt: null,
      checkedBy: null
    };

    ticket.checklist.push(newItem);
    this.saveTicket(ticket);
    if (this.storage && this.storage.logAuditAction) {
      this.storage.logAuditAction(
        'CHECKLIST_ADD',
        'serviceTickets',
        ticket.id,
        `Added custom inspection task: "${taskText}"`
      );
    }
    return newItem;
  }

  // --- PARTS & CONSUMABLES TRACKING ---
  getTicketParts(ticketId) {
    const ticket = this.getTicketById(ticketId);
    const parts = ticket && ticket.partsUsed ? ticket.partsUsed : [];
    parts.forEach(p => {
      if (!p.partName && p.name) p.partName = p.name;
      if (!p.name && p.partName) p.name = p.partName;
      if (!p.quantity && p.qty) p.quantity = p.qty;
      if (!p.qty && p.quantity) p.qty = p.quantity;
      if (p.total === undefined && p.totalCost !== undefined) p.total = p.totalCost;
      if (p.totalCost === undefined && p.total !== undefined) p.totalCost = p.total;
      if (p.billable === undefined && p.isBillable !== undefined) p.billable = p.isBillable;
      if (p.isBillable === undefined && p.billable !== undefined) p.isBillable = p.billable;
    });
    return parts;
  }

  addPartToTicket(ticketId, partData) {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return null;
    if (!ticket.partsUsed) ticket.partsUsed = [];

    const qty = Number(partData.qty !== undefined ? partData.qty : partData.quantity) || 1;
    const unitCost = Number(partData.unitCost) || 0;
    const totalCost = qty * unitCost;
    const name = partData.name || partData.partName || 'Consumable Item';
    const isBillable = Boolean(partData.isBillable !== undefined ? partData.isBillable : partData.billable);

    const partUsage = {
      id: "PU-" + Date.now().toString().slice(-6),
      partId: partData.partId || null,
      name,
      partName: name,
      partNumber: partData.partNumber || '',
      qty,
      quantity: qty,
      unitCost,
      totalCost,
      total: totalCost,
      isBillable,
      billable: isBillable,
      notes: partData.notes ? partData.notes.trim() : ''
    };

    ticket.partsUsed.push(partUsage);

    // If billable, update chargeableWork total
    if (partUsage.isBillable) {
      if (!ticket.chargeableWork) {
        ticket.chargeableWork = { isChargeable: true, estimatedAmount: 0, scopeDescription: '', approvalStatus: 'Pending', approvalReference: '', approvedAt: null, approvedBy: null };
      }
      ticket.chargeableWork.isChargeable = true;
      ticket.chargeableWork.estimatedAmount = (Number(ticket.chargeableWork.estimatedAmount) || 0) + totalCost;
      if (ticket.chargeableWork.approvalStatus === 'N/A') {
        ticket.chargeableWork.approvalStatus = 'Pending';
      }
    }

    this.saveTicket(ticket);
    if (this.storage && this.storage.logAuditAction) {
      this.storage.logAuditAction(
        'PARTS_LOGGED',
        'serviceTickets',
        ticket.id,
        `Logged ${qty}x ${partUsage.name} (₹${totalCost.toLocaleString('en-IN')}) - ${partUsage.isBillable ? 'Billable to Customer' : 'Covered under AMC'}`
      );
    }
    return partUsage;
  }

  removePartFromTicket(ticketId, partUsageId) {
    const ticket = this.getTicketById(ticketId);
    if (!ticket || !ticket.partsUsed) return false;

    const idx = ticket.partsUsed.findIndex(p => p.id === partUsageId);
    if (idx === -1) return false;

    const removed = ticket.partsUsed.splice(idx, 1)[0];
    if (removed.isBillable && ticket.chargeableWork) {
      ticket.chargeableWork.estimatedAmount = Math.max(0, (Number(ticket.chargeableWork.estimatedAmount) || 0) - removed.totalCost);
      if (ticket.chargeableWork.estimatedAmount === 0 && (!ticket.chargeableWork.scopeDescription || ticket.chargeableWork.scopeDescription === '')) {
        ticket.chargeableWork.isChargeable = false;
        ticket.chargeableWork.approvalStatus = 'N/A';
      }
    }

    this.saveTicket(ticket);
    if (this.storage && this.storage.logAuditAction) {
      this.storage.logAuditAction(
        'PARTS_REMOVED',
        'serviceTickets',
        ticket.id,
        `Removed part: ${removed.name}`
      );
    }
    return true;
  }

  // --- CUSTOMER APPROVAL FOR CHARGEABLE WORK ---
  updateChargeableWorkApproval(ticketId, approvalStatus, approvedBy = '', approvalReference = '', scopeDescription = null, estimatedAmount = null) {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return null;

    if (!ticket.chargeableWork) {
      ticket.chargeableWork = { isChargeable: true, estimatedAmount: 0, scopeDescription: '', approvalStatus: 'Pending', approvalReference: '', approvedAt: null, approvedBy: null };
    }

    ticket.chargeableWork.approvalStatus = approvalStatus;
    if (approvedBy) ticket.chargeableWork.approvedBy = approvedBy.trim();
    if (approvalReference) ticket.chargeableWork.approvalReference = approvalReference.trim();
    if (scopeDescription !== null) ticket.chargeableWork.scopeDescription = scopeDescription.trim();
    if (estimatedAmount !== null) ticket.chargeableWork.estimatedAmount = Number(estimatedAmount) || 0;

    if (approvalStatus === 'Approved') {
      ticket.chargeableWork.approvedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
    } else if (approvalStatus === 'Pending') {
      ticket.chargeableWork.approvedAt = null;
    }

    this.saveTicket(ticket);
    if (this.storage && this.storage.logAuditAction) {
      this.storage.logAuditAction(
        'CHARGEABLE_APPROVAL',
        'serviceTickets',
        ticket.id,
        `Chargeable work (₹${(ticket.chargeableWork.estimatedAmount || 0).toLocaleString('en-IN')}) status changed to: ${approvalStatus} by ${approvedBy || 'Operator'}`
      );
    }
    return ticket.chargeableWork;
  }

  convertChargeableWorkToInvoice(ticketId) {
    const ticket = this.getTicketById(ticketId);
    if (!ticket || !this.storage) return null;

    const cw = ticket.chargeableWork;
    if (!cw || cw.approvalStatus !== 'Approved') {
      return null;
    }

    const site = this.getSiteById(ticket.siteId);
    const org = this.getOrganizationById(ticket.organizationId || (site ? site.organizationId : ''));
    const billableParts = (ticket.partsUsed || []).filter(p => p.isBillable || p.billable);

    const lineItems = billableParts.map(p => ({
      description: `${p.name || p.partName} [P/N: ${p.partNumber || 'OEM'}] - Installed during ${ticket.id}`,
      hsnCode: '8504',
      quantity: p.qty || p.quantity || 1,
      unit: 'Nos',
      rate: p.unitCost,
      amount: p.totalCost || p.total || ((p.qty || 1) * p.unitCost)
    }));

    const partsTotal = lineItems.reduce((acc, it) => acc + (it.amount || 0), 0);
    const laborOrScopeAmount = Math.max(0, (cw.estimatedAmount || 0) - partsTotal);

    if (laborOrScopeAmount > 0 || lineItems.length === 0) {
      lineItems.push({
        description: cw.scopeDescription || `Out-of-scope maintenance and technical servicing labor for ticket ${ticket.id}`,
        hsnCode: '998713',
        quantity: 1,
        unit: 'Job',
        rate: laborOrScopeAmount > 0 ? laborOrScopeAmount : (cw.estimatedAmount || 0),
        amount: laborOrScopeAmount > 0 ? laborOrScopeAmount : (cw.estimatedAmount || 0)
      });
    }

    const subtotal = lineItems.reduce((acc, it) => acc + (it.amount || 0), 0);
    const gstRate = 18;
    const gstAmount = Math.round(subtotal * (gstRate / 100));
    const totalAmount = subtotal + gstAmount;
    const amountBilled = cw.estimatedAmount > 0 ? cw.estimatedAmount : subtotal;

    const invoiceData = {
      clientName: org ? org.name : (site ? site.clientName : 'Client Customer'),
      customerName: org ? org.name : (site ? site.clientName : 'Client Customer'),
      contactPerson: org ? org.contactPerson : (site ? site.contactPerson : ''),
      contactPhone: org ? org.phone : (site ? site.contactPhone : ''),
      contactEmail: org ? org.email : '',
      clientAddress: org ? org.billingAddress : (site ? site.location : 'Guwahati, Assam'),
      billingAddress: org ? org.billingAddress : (site ? site.location : 'Guwahati, Assam'),
      gstin: org ? org.gstin : '',
      service: `Out-of-Scope Facility Maintenance (Ticket ${ticket.id})`,
      serviceType: 'IT Infra Sales & Support',
      sacCode: '998713',
      date: new Date().toISOString().slice(0, 10),
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      status: 'Sent',
      lineItems,
      subtotal,
      gstRate,
      gstAmount,
      totalAmount,
      amountBilled,
      amountCollected: 0,
      notes: `Generated from Approved CAFM Maintenance Ticket ${ticket.id} (${ticket.title}). SAC 998713. Approval Ref: ${cw.approvalReference || 'Confirmed'}.`
    };

    const savedInvoice = this.storage.saveInvoice(invoiceData);
    if (savedInvoice) {
      ticket.chargeableWork.invoiceId = savedInvoice.id;
      this.saveTicket(ticket);
      if (this.storage.logAuditAction) {
        this.storage.logAuditAction(
          'INVOICE_GENERATED',
          'serviceTickets',
          ticket.id,
          `Generated Customer Invoice ${savedInvoice.id} for ₹${amountBilled.toLocaleString('en-IN')}`
        );
      }
    }
    return savedInvoice;
  }

  // --- CUSTOMER NOTIFICATIONS ENGINE ---
  sendCustomerNotification(ticketId, channel = 'WhatsApp', customMessage = '') {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return null;
    if (!ticket.customerNotifications) ticket.customerNotifications = [];

    const site = this.getSiteById(ticket.siteId);
    const org = this.getOrganizationById(ticket.organizationId || (site ? site.organizationId : ''));
    const recipientPhone = org ? org.phone : (site ? site.contactPhone : '+91 99544 93909');
    const recipientEmail = org ? org.email : 'client@example.com';
    const recipientName = org ? org.contactPerson : (site ? site.contactPerson : 'Facility Manager');

    let messageText = customMessage;
    if (!messageText) {
      if (ticket.status === 'Dispatched') {
        messageText = `MaxEco Facility Alert: Our field engineer ${ticket.assignedTech || 'Tamal Roy'} has been dispatched for ${ticket.title} (Ref: ${ticket.id}). Emergency Helpline: +91 99544 93909.`;
      } else if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
        messageText = `MaxEco Service Complete: Maintenance work for "${ticket.title}" (Ref: ${ticket.id}) has been successfully executed and certified at ${site ? site.name : 'Facility'}.`;
      } else if (ticket.chargeableWork && ticket.chargeableWork.isChargeable && ticket.chargeableWork.approvalStatus === 'Pending') {
        messageText = `MaxEco Approval Request: Ticket ${ticket.id} requires replacement parts/work totaling ₹${(ticket.chargeableWork.estimatedAmount || 0).toLocaleString('en-IN')}. Please reply 'APPROVED' to authorize dispatch.`;
      } else {
        messageText = `MaxEco Facility Notice: Update on maintenance ticket ${ticket.id} (${ticket.title}) - Status: ${ticket.status}. Lead Tech: ${ticket.assignedTech || 'MaxEco'}.`;
      }
    }

    const notif = {
      id: "NOTIF-" + Date.now().toString().slice(-4),
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      channel,
      recipient: channel === 'WhatsApp' ? `${recipientPhone} (${recipientName})` : recipientEmail,
      message: messageText,
      status: "Sent"
    };

    ticket.customerNotifications.unshift(notif);
    this.saveTicket(ticket);

    if (this.storage && this.storage.logAuditAction) {
      this.storage.logAuditAction(
        'CUSTOMER_NOTIFICATION',
        'serviceTickets',
        ticket.id,
        `Sent ${channel} notice to ${notif.recipient}: "${messageText.slice(0, 60)}..."`
      );
    }

    const cleanPhone = (recipientPhone || '').replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent('MaxEco Facility Maintenance Notice - ' + ticket.id)}&body=${encodeURIComponent(messageText)}`;

    return { notif, whatsappUrl, mailtoUrl };
  }

  // --- SLA RESPONSE & TARGET TRACKING ---
  calculateTicketSla(ticket) {
    if (!ticket) return { slaStatus: 'N/A', remainingText: 'N/A', isBreached: false, remainingHours: 0, elapsedHours: 0, targetHours: 24 };

    const targetHours = ticket.slaTargetHours || (ticket.priority === 'Critical' ? 4 : (ticket.priority === 'High' ? 12 : 24));
    
    // Reported base time
    const repDateStr = ticket.reportedDate || new Date().toISOString().slice(0, 10);
    const reportedTime = new Date(`${repDateStr}T09:00:00`).getTime();
    const deadlineTime = reportedTime + targetHours * 3600 * 1000;
    const now = Date.now();
    const elapsedHours = Math.max(0, (now - reportedTime) / (3600 * 1000));
    const remainingHours = Math.max(0, (deadlineTime - now) / (3600 * 1000));

    const isResolved = ticket.status === 'Resolved' || ticket.status === 'Closed';
    const resolvedTime = ticket.resolvedDate ? new Date(`${ticket.resolvedDate}T17:00:00`).getTime() : now;

    if (isResolved) {
      const metSla = resolvedTime <= deadlineTime;
      return {
        targetHours,
        slaStatus: metSla ? 'Within SLA' : 'SLA Breached',
        remainingText: metSla ? 'Resolved On Time' : 'Resolved Past Target',
        isBreached: !metSla,
        remainingHours: 0,
        elapsedHours
      };
    }

    if (now <= deadlineTime) {
      const diffMs = deadlineTime - now;
      const hoursLeft = Math.floor(diffMs / (3600 * 1000));
      const minsLeft = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
      return {
        targetHours,
        slaStatus: 'Within SLA',
        remainingText: `⏱️ ${hoursLeft}h ${minsLeft}m remaining`,
        isBreached: false,
        remainingHours,
        elapsedHours
      };
    } else {
      const breachMs = now - deadlineTime;
      const hoursPast = Math.floor(breachMs / (3600 * 1000));
      return {
        targetHours,
        slaStatus: 'SLA Breached',
        remainingText: `🚨 Breached by ${hoursPast}h`,
        isBreached: true,
        remainingHours: 0,
        elapsedHours
      };
    }
  }

  // --- AMC VISIT COMPLIANCE TRACKING ---
  getAmcVisitCompliance(amcId) {
    const amc = this.getAmcById(amcId);
    if (!amc) return { percentage: 0, compliancePercent: 0, completed: 0, completedVisits: 0, total: 0, totalVisits: 0, statusText: 'No contract' };

    const scheduled = amc.scheduledVisits || [];
    const total = scheduled.length > 0 ? scheduled.length : (amc.scheduledVisitsPerYear || 4);
    const completed = scheduled.length > 0 ? scheduled.filter(v => v.status === 'Completed').length : (amc.completedVisits || 0);
    const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

    let statusText = 'On Track';
    if (percentage >= 100) statusText = 'Fully Fulfilled';
    else if (percentage < 50 && new Date(amc.endDate).getTime() - Date.now() < 90 * 86400000) statusText = 'Behind Schedule';

    return {
      percentage,
      compliancePercent: percentage,
      completed,
      completedVisits: completed,
      total,
      totalVisits: total,
      statusText,
      scheduledVisits: scheduled
    };
  }

  // --- COMPREHENSIVE SERVICE REPORT GENERATOR (PRINTABLE A4) ---
  generateServiceReportHtml(ticketId) {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return '<p>Service ticket not found.</p>';

    const site = this.getSiteById(ticket.siteId);
    const org = this.getOrganizationById(ticket.organizationId || (site ? site.organizationId : ''));
    const asset = ticket.assetId ? this.getAssetById(ticket.assetId) : null;
    const settings = this.storage ? this.storage.getSettings() : {};
    const qrSvg = asset ? this.generateAssetQrSvg(asset.id, 90) : '';
    const sla = this.calculateTicketSla(ticket);
    const checklist = ticket.checklist || [];
    const parts = ticket.partsUsed || [];

    const logoUri = (typeof LOGO_WORDMARK_DATA_URI !== 'undefined') ? LOGO_WORDMARK_DATA_URI : 'assets/logo-wordmark.png';
    const signUri = (typeof AUTHORISED_SIGNATURE_DATA_URI !== 'undefined') ? AUTHORISED_SIGNATURE_DATA_URI : 'assets/signature.png';

    const billableTotal = parts.filter(p => p.isBillable || p.billable).reduce((acc, p) => acc + (p.totalCost || p.total || 0), 0);

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.4; padding: 24px; max-width: 800px; margin: 0 auto; background: #ffffff;">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 14px;">
          <div>
            <img src="${logoUri}" alt="MaxEco Energy & Tech" style="height: 38px; max-width: 170px; object-fit: contain; margin-bottom: 4px;">
            <div style="font-size: 10px; color: #475569;">
              ${settings.location || 'Maligaon, Guwahati, Assam 781011'}<br>
              Phone: ${settings.contactPhone || '+91 99544 93909'} • Email: ${settings.contactEmail || 'maxecoenergyit@gmail.com'}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 15px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">TECHNICAL SERVICE &amp; SAFETY AUDIT REPORT</div>
            <div style="font-size: 12px; font-weight: 700; color: #d97706; margin-top: 2px;">Report Ref: ${ticket.id}</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
              Date: <strong>${ticket.reportedDate}</strong> • Priority: <strong>${ticket.priority}</strong>
            </div>
            <div style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 9.5px; font-weight: 700; margin-top: 4px; background: ${sla.isBreached ? '#fee2e2' : '#ecfdf5'}; color: ${sla.isBreached ? '#b91c1c' : '#047857'}; border: 1px solid ${sla.isBreached ? '#fca5a5' : '#a7f3d0'};">
              SLA Compliance: ${sla.slaStatus} (${ticket.slaTargetHours || 24}h Target)
            </div>
          </div>
        </div>

        <!-- 2-Col Scope Summary -->
        <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 14px; margin-bottom: 14px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; font-size: 11px;">
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px; font-size: 12px;">CLIENT &amp; FACILITY PREMISE</div>
            <div><strong>Organization:</strong> ${org ? org.name : (site ? site.clientName : 'Client Organization')}</div>
            <div><strong>Facility Site:</strong> ${site ? site.name : 'Client Facility'} (${site ? site.siteType : ''})</div>
            <div><strong>Site Address:</strong> ${site ? site.location : 'Guwahati, Assam'}</div>
            <div><strong>Contact:</strong> ${site ? site.contactPerson : ''} (${site ? site.contactPhone : ''})</div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; font-size: 11px; display: flex; gap: 10px;">
            <div style="flex: 1;">
              <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px; font-size: 12px;">EQUIPMENT DETAILS</div>
              <div><strong>Asset:</strong> ${asset ? asset.name : 'General Facility'}</div>
              <div><strong>Category:</strong> ${asset ? asset.category : 'General'}</div>
              <div><strong>Serial No:</strong> <span style="font-family: monospace;">${asset ? asset.serialNumber : 'N/A'}</span></div>
              <div><strong>Location:</strong> ${asset ? (asset.location || 'On-Site') : 'Site Wide'}</div>
            </div>
            ${qrSvg ? `<div style="text-align: center;">${qrSvg}<div style="font-size: 8px; color: #64748b;">Asset QR</div></div>` : ''}
          </div>
        </div>

        <!-- Service Objective -->
        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 12px; margin-bottom: 14px; font-size: 11.5px;">
          <div style="font-weight: 700; color: #0f172a; font-size: 12px; margin-bottom: 3px;">SERVICE SUMMARY &amp; ISSUE DETAILS</div>
          <div style="color: #1e293b; font-weight: 600;">${ticket.title}</div>
          <div style="color: #475569; font-size: 10.5px; margin-top: 2px;">${ticket.issueDescription || 'Scheduled preventative servicing and diagnostic testing.'}</div>
        </div>

        <!-- Technical Checklist Table -->
        <div style="margin-bottom: 14px;">
          <div style="font-size: 11.5px; font-weight: 700; color: #0f172a; margin-bottom: 6px; text-transform: uppercase;">
            Technical Verification &amp; Safety Checklist
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; border: 1px solid #cbd5e1;">
            <thead>
              <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; text-align: left;">
                <th style="padding: 6px 8px; width: 30px;">#</th>
                <th style="padding: 6px 8px;">Inspection Task &amp; Safety Protocol</th>
                <th style="padding: 6px 8px; width: 80px; text-align: center;">Status</th>
                <th style="padding: 6px 8px; width: 120px;">Verified Timestamp</th>
                <th style="padding: 6px 8px; width: 110px;">Engineer</th>
              </tr>
            </thead>
            <tbody>
              ${checklist.length > 0 ? checklist.map((chk, i) => `
                <tr style="border-bottom: 1px solid #e2e8f0; background: ${i % 2 === 0 ? '#fff' : '#fafafa'};">
                  <td style="padding: 5px 8px; text-align: center; color: #64748b;">${i + 1}</td>
                  <td style="padding: 5px 8px;">${chk.task || chk.text}</td>
                  <td style="padding: 5px 8px; text-align: center; font-weight: 700; color: ${(chk.done || chk.completed) ? '#16a34a' : '#ea580c'};">
                    ${(chk.done || chk.completed) ? '[ PASS ]' : '[ PENDING ]'}
                  </td>
                  <td style="padding: 5px 8px; color: #475569; font-size: 9.5px;">${chk.checkedAt || '—'}</td>
                  <td style="padding: 5px 8px; color: #475569; font-size: 9.5px;">${chk.checkedBy || '—'}</td>
                </tr>
              `).join('') : `
                <tr><td colspan="5" style="padding: 10px; text-align: center; color: #64748b;">No checklist tasks logged for this service event.</td></tr>
              `}
            </tbody>
          </table>
        </div>

        <!-- Spare Parts & Consumables Logged -->
        <div style="margin-bottom: 14px;">
          <div style="font-size: 11.5px; font-weight: 700; color: #0f172a; margin-bottom: 6px; text-transform: uppercase;">
            Components &amp; Consumables Logged
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; border: 1px solid #cbd5e1;">
            <thead>
              <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; text-align: left;">
                <th style="padding: 6px 8px; width: 30px;">#</th>
                <th style="padding: 6px 8px;">Component Description / Part No</th>
                <th style="padding: 6px 8px; width: 50px; text-align: center;">Qty</th>
                <th style="padding: 6px 8px; width: 80px; text-align: right;">Unit Rate</th>
                <th style="padding: 6px 8px; width: 85px; text-align: right;">Total Amount</th>
                <th style="padding: 6px 8px; width: 110px; text-align: center;">Billing Tier</th>
              </tr>
            </thead>
            <tbody>
              ${parts.length > 0 ? parts.map((p, i) => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px 8px; text-align: center; color: #64748b;">${i + 1}</td>
                  <td style="padding: 5px 8px;">
                    <strong>${p.name || p.partName}</strong> ${p.partNumber ? `<span style="font-family: monospace; font-size: 9.5px; color: #64748b;">[${p.partNumber}]</span>` : ''}
                    ${p.notes ? `<div style="font-size: 9.5px; color: #64748b;">${p.notes}</div>` : ''}
                  </td>
                  <td style="padding: 5px 8px; text-align: center;">${p.qty || p.quantity}</td>
                  <td style="padding: 5px 8px; text-align: right;">₹${(p.unitCost || 0).toLocaleString('en-IN')}</td>
                  <td style="padding: 5px 8px; text-align: right; font-weight: 600;">₹${(p.totalCost || p.total || 0).toLocaleString('en-IN')}</td>
                  <td style="padding: 5px 8px; text-align: center;">
                    <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 8.5px; font-weight: 700; background: ${(p.isBillable || p.billable) ? '#fef3c7' : '#f0fdf4'}; color: ${(p.isBillable || p.billable) ? '#b45309' : '#15803d'};">
                      ${(p.isBillable || p.billable) ? 'Billable' : 'Included in AMC'}
                    </span>
                  </td>
                </tr>
              `).join('') : `
                <tr><td colspan="6" style="padding: 8px; text-align: center; color: #64748b;">Zero spare parts consumed; standard preventive cleaning & adjustment only.</td></tr>
              `}
            </tbody>
          </table>
          ${billableTotal > 0 ? `
            <div style="text-align: right; font-size: 11px; margin-top: 4px;">
              <strong>Chargeable Amount:</strong> ₹${billableTotal.toLocaleString('en-IN')} + GST (${ticket.chargeableWork ? ticket.chargeableWork.approvalStatus : 'Pending'})
            </div>
          ` : ''}
        </div>

        <!-- Field Resolution Remarks -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 12px; margin-bottom: 16px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Field Resolution Remarks &amp; Technical Observations</div>
          <div style="font-size: 11px; color: #0f172a;">
            ${ticket.resolutionNotes || 'All checklist parameters tested. Equipment verified within certified electrical tolerances.'}
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
            Assigned Field Lead: <strong>${ticket.assignedTech || 'MaxEco Lead Engineer'}</strong> • Status: <strong>${ticket.status}</strong>
          </div>
        </div>

        <!-- Signatory & Acceptance Block -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border-top: 2px solid #0f172a; padding-top: 14px;">
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #0f172a; text-transform: uppercase;">Customer Acceptance &amp; Sign-Off</div>
            <div style="font-size: 9.5px; color: #475569; margin-top: 2px; line-height: 1.4;">
              I confirm the servicing was completed satisfactorily, safety procedures observed, and asset returned to operational control.
            </div>
            <div style="font-size: 9.5px; color: #475569; margin-top: 6px;">
              Approval Ref: <strong>${ticket.chargeableWork && ticket.chargeableWork.approvalReference ? ticket.chargeableWork.approvalReference : 'Confirmed on-site'}</strong>
            </div>
            <div style="border-top: 1px solid #0f172a; width: 170px; margin-top: 36px; padding-top: 3px; font-size: 9.5px; font-weight: 700;">
              Customer Authorized Signatory &amp; Stamp
            </div>
          </div>

          <div style="text-align: right;">
            <div style="font-size: 10px; font-weight: 700; color: #0f172a; text-transform: uppercase;">For MaxEco Energy &amp; Tech</div>
            <div style="display: inline-block; padding: 2px 8px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 4px; font-size: 9px; font-weight: 700; color: #047857; margin-top: 4px; margin-bottom: 6px;">
              🛡️ DIGITALLY VERIFIED SERVICE REPORT
            </div>
            <div>
              <img src="${signUri}" alt="Authorised Signature" style="height: 38px; max-width: 130px; object-fit: contain;">
            </div>
            <div style="font-size: 11px; font-weight: 700; color: #0f172a;">Tamal Roy</div>
            <div style="font-size: 9.5px; color: #64748b;">Authorised Signatory • Guwahati Operations Hub</div>
          </div>
        </div>

        <div style="text-align: center; font-size: 9px; color: #94a3b8; margin-top: 16px; border-top: 1px dashed #cbd5e1; padding-top: 6px;">
          MaxEco Energy &amp; Tech ERP • Computer-Aided Facility Management • Computer-generated technical audit report
        </div>

      </div>
    `;
  }

  // --- CAFM PHASE 3: SPACES & HIERARCHICAL SPACE MANAGEMENT ---
  getFacilitySpaces(orgId = 'all', siteId = 'all') {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (!store) return [];
    let list = store.getFacilitySpaces ? store.getFacilitySpaces() : [];
    const targetOrg = (orgId !== 'all') ? orgId : this.currentOrganizationFilter;
    if (targetOrg && targetOrg !== 'all') {
      list = list.filter(s => s.organizationId === targetOrg);
    }
    if (siteId && siteId !== 'all') {
      list = list.filter(s => s.siteId === siteId);
    }
    return list;
  }

  getSpaceById(id) {
    const spaces = this.getFacilitySpaces('all', 'all');
    return spaces.find(s => s.id === id) || null;
  }

  saveFacilitySpace(space, user = 'Admin', role = 'Operator') {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (!store) return null;
    const isNew = !space.id;
    const saved = store.saveFacilitySpace(space);
    if (store.logAuditAction) {
      store.logAuditAction(
        isNew ? 'CREATE_FACILITY_SPACE' : 'UPDATE_FACILITY_SPACE',
        'facilitySpaces',
        saved.id,
        `${isNew ? 'Created' : 'Updated'} facility space ${saved.roomNumberOrName || saved.id} in building ${saved.buildingName || ''}`,
        user,
        role
      );
    }
    return saved;
  }

  deleteFacilitySpace(id, user = 'Admin', role = 'Operator') {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (!store) return false;
    store.deleteFacilitySpace(id);
    if (store.logAuditAction) {
      store.logAuditAction(
        'DELETE_FACILITY_SPACE',
        'facilitySpaces',
        id,
        `Deleted facility space ${id}`,
        user,
        role
      );
    }
    return true;
  }

  // Pure SVG Interactive Visual Floor Plan Generator
  generateFloorPlanSvg(siteId = 'all') {
    const spaces = this.getFacilitySpaces('all', siteId);
    const assets = this.getAssets('all', 'all', 'all');
    const tickets = this.getTickets('all', 'all');
    const openTickets = tickets.filter(t => t.status !== 'Closed' && t.status !== 'Resolved');

    if (!spaces || spaces.length === 0) {
      return `
        <svg viewBox="0 0 800 360" width="100%" height="280" xmlns="http://www.w3.org/2000/svg" style="background: #0f172a; border-radius: 8px;">
          <text x="400" y="180" fill="#94a3b8" font-size="14" font-family="system-ui, sans-serif" text-anchor="middle">
            No spatial zones or rooms mapped for this facility site yet. Add spaces to render layout.
          </text>
        </svg>
      `;
    }

    // Grid coordinates for rendering clean isometric-style 2D floorplan rooms
    const cols = Math.min(3, spaces.length);
    const rows = Math.ceil(spaces.length / cols);
    const boxWidth = 230;
    const boxHeight = 130;
    const gapX = 25;
    const gapY = 25;
    const startX = 25;
    const startY = 45;
    const totalSvgWidth = Math.max(760, startX * 2 + cols * boxWidth + (cols - 1) * gapX);
    const totalSvgHeight = startY + rows * (boxHeight + gapY) + 30;

    let roomsMarkup = '';

    spaces.forEach((sp, idx) => {
      const colIdx = idx % cols;
      const rowIdx = Math.floor(idx / cols);
      const x = startX + colIdx * (boxWidth + gapX);
      const y = startY + rowIdx * (boxHeight + gapY);

      // Link assets to this space
      const spaceAssets = assets.filter(a => a.spaceId === sp.id || (a.location && a.location.toLowerCase().includes((sp.roomNumberOrName || '').toLowerCase())));
      const spaceAssetIds = spaceAssets.map(a => a.id);
      const spaceTickets = openTickets.filter(t => spaceAssetIds.includes(t.assetId));
      const hasCriticalTicket = spaceTickets.some(t => t.priority === 'Critical' || t.priority === 'Urgent');
      const hasDueAssets = spaceAssets.some(a => a.status === 'Service Due');

      let statusColor = '#10b981'; // Green: Normal / Good
      let statusBg = 'rgba(16, 185, 129, 0.12)';
      let statusBorder = '#059669';
      let statusLabel = 'HEALTHY';

      if (hasCriticalTicket) {
        statusColor = '#ef4444'; // Red: Critical ticket
        statusBg = 'rgba(239, 68, 68, 0.15)';
        statusBorder = '#dc2626';
        statusLabel = 'CRITICAL ALERT';
      } else if (hasDueAssets || spaceTickets.length > 0) {
        statusColor = '#f59e0b'; // Amber: Maintenance due or open ticket
        statusBg = 'rgba(245, 158, 11, 0.15)';
        statusBorder = '#d97706';
        statusLabel = 'SERVICE DUE';
      }

      const escapedName = (sp.roomNumberOrName || sp.id || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const escapedBld = (sp.buildingName || 'Building').replace(/&/g, '&amp;');
      const escapedFloor = (sp.floorLevel || 'L1').replace(/&/g, '&amp;');

      roomsMarkup += `
        <g class="space-node" style="cursor: pointer;" transform="translate(${x}, ${y})">
          <!-- Room Card Box -->
          <rect width="${boxWidth}" height="${boxHeight}" rx="8" fill="#1e293b" stroke="${statusBorder}" stroke-width="2" />
          <rect width="${boxWidth}" height="28" rx="8" fill="${statusBg}" />
          
          <!-- Room Code & Floor Tag -->
          <text x="12" y="19" fill="#f8fafc" font-size="11" font-weight="bold" font-family="system-ui, sans-serif">
            ${sp.id} • ${escapedFloor}
          </text>
          <circle cx="${boxWidth - 18}" cy="14" r="5" fill="${statusColor}" />

          <!-- Room Title -->
          <text x="12" y="48" fill="#f1f5f9" font-size="12" font-weight="bold" font-family="system-ui, sans-serif">
            ${escapedName.length > 24 ? escapedName.slice(0, 22) + '...' : escapedName}
          </text>
          <text x="12" y="65" fill="#94a3b8" font-size="10" font-family="system-ui, sans-serif">
            ${escapedBld} • ${sp.occupancyType || 'General'}
          </text>

          <!-- Metrics Row -->
          <rect x="12" y="74" width="${boxWidth - 24}" height="24" rx="4" fill="#0f172a" />
          <text x="20" y="90" fill="#38bdf8" font-size="10" font-weight="bold" font-family="system-ui, sans-serif">
            📐 ${sp.areaSqFt || 0} sq ft
          </text>
          <text x="${boxWidth - 30}" y="90" fill="#a78bfa" font-size="10" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="end">
            ⚙️ ${spaceAssets.length} Assets
          </text>

          <!-- Status Badge -->
          <rect x="12" y="104" width="${boxWidth - 24}" height="18" rx="3" fill="${statusBg}" />
          <text x="${boxWidth / 2}" y="117" fill="${statusColor}" font-size="9" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="middle">
            ● ${statusLabel} ${spaceTickets.length ? `(${spaceTickets.length} Active Tickets)` : ''}
          </text>
        </g>
      `;
    });

    return `
      <svg viewBox="0 0 ${totalSvgWidth} ${totalSvgHeight}" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="background: #0f172a; border-radius: 8px; font-family: system-ui, sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
        <defs>
          <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" stroke-width="0.5" stroke-opacity="0.4"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gridPattern)" />

        <!-- Header / Legend -->
        <text x="25" y="26" fill="#f8fafc" font-size="14" font-weight="bold">
          🏢 Spatial Digital Twin &amp; Zone Health Status Layout
        </text>
        <g transform="translate(${totalSvgWidth - 380}, 14)">
          <circle cx="10" cy="10" r="4" fill="#10b981" />
          <text x="18" y="14" fill="#94a3b8" font-size="10">Operational</text>
          <circle cx="95" cy="10" r="4" fill="#f59e0b" />
          <text x="103" y="14" fill="#94a3b8" font-size="10">PPM Due / Ticket</text>
          <circle cx="215" cy="10" r="4" fill="#ef4444" />
          <text x="223" y="14" fill="#94a3b8" font-size="10">Critical Alert</text>
        </g>

        <!-- Dynamic Spaces -->
        ${roomsMarkup}
      </svg>
    `;
  }

  // --- CAFM PHASE 3: VENDORS & CONTRACTORS ---
  getFacilityVendors(tradeCategory = 'all') {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (!store) return [];
    let list = store.getFacilityVendors ? store.getFacilityVendors() : [];
    if (tradeCategory && tradeCategory !== 'all') {
      list = list.filter(v => (v.tradeCategory || '').toLowerCase().includes(tradeCategory.toLowerCase()));
    }
    return list;
  }

  getVendorById(id) {
    const vendors = this.getFacilityVendors('all');
    return vendors.find(v => v.id === id) || null;
  }

  saveFacilityVendor(vendor, user = 'Admin', role = 'Operator') {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (!store) return null;
    const isNew = !vendor.id;
    const saved = store.saveFacilityVendor(vendor);
    if (store.logAuditAction) {
      store.logAuditAction(
        isNew ? 'CREATE_FACILITY_VENDOR' : 'UPDATE_FACILITY_VENDOR',
        'facilityVendors',
        saved.id,
        `${isNew ? 'Registered' : 'Updated'} contractor/vendor ${saved.name} (${saved.tradeCategory})`,
        user,
        role
      );
    }
    return saved;
  }

  deleteFacilityVendor(id, user = 'Admin', role = 'Operator') {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (!store) return false;
    store.deleteFacilityVendor(id);
    if (store.logAuditAction) {
      store.logAuditAction(
        'DELETE_FACILITY_VENDOR',
        'facilityVendors',
        id,
        `Deleted contractor/vendor ${id}`,
        user,
        role
      );
    }
    return true;
  }

  // --- CAFM PHASE 3: ENERGY & UTILITY READINGS ---
  getUtilityReadings(orgId = 'all', siteId = 'all') {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (!store) return [];
    let list = store.getUtilityReadings ? store.getUtilityReadings() : [];
    const targetOrg = (orgId !== 'all') ? orgId : this.currentOrganizationFilter;
    if (targetOrg && targetOrg !== 'all') {
      list = list.filter(u => u.organizationId === targetOrg);
    }
    if (siteId && siteId !== 'all') {
      list = list.filter(u => u.siteId === siteId);
    }
    return list;
  }

  saveUtilityReading(reading, user = 'Admin', role = 'Operator') {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (!store) return null;
    const isNew = !reading.id;
    // Auto-compute net billed units if not explicitly provided
    if (reading.gridUnitsImportedKwh !== undefined && reading.solarUnitsExportedKwh !== undefined) {
      const imp = Number(reading.gridUnitsImportedKwh) || 0;
      const exp = Number(reading.solarUnitsExportedKwh) || 0;
      reading.netUnitsBilledKwh = Math.max(0, imp - exp);
    }
    const saved = store.saveUtilityReading(reading);
    if (store.logAuditAction) {
      store.logAuditAction(
        isNew ? 'RECORD_UTILITY_READING' : 'UPDATE_UTILITY_READING',
        'utilityReadings',
        saved.id,
        `${isNew ? 'Recorded' : 'Updated'} APDCL utility log for month ${saved.billingMonth || ''} (Import: ${saved.gridUnitsImportedKwh} kWh, Solar: ${saved.solarUnitsExportedKwh} kWh)`,
        user,
        role
      );
    }
    return saved;
  }

  deleteUtilityReading(id, user = 'Admin', role = 'Operator') {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (!store) return false;
    store.deleteUtilityReading(id);
    if (store.logAuditAction) {
      store.logAuditAction(
        'DELETE_UTILITY_READING',
        'utilityReadings',
        id,
        `Deleted utility reading record ${id}`,
        user,
        role
      );
    }
    return true;
  }

  calculateUtilityMetrics(siteId = 'all') {
    const readings = this.getUtilityReadings('all', siteId);
    if (!readings || readings.length === 0) {
      return {
        totalImportKwh: 0,
        totalExportKwh: 0,
        netKwh: 0,
        totalBilledInr: 0,
        averagePowerFactor: 0.98,
        powerFactorAlert: false,
        peakDemandKvaMax: 0,
        solarOffsetRatio: 0,
        count: 0
      };
    }

    const totalImportKwh = readings.reduce((acc, r) => acc + (Number(r.gridUnitsImportedKwh) || 0), 0);
    const totalExportKwh = readings.reduce((acc, r) => acc + (Number(r.solarUnitsExportedKwh) || 0), 0);
    const netKwh = readings.reduce((acc, r) => acc + (Number(r.netUnitsBilledKwh) || 0), 0);
    const totalBilledInr = readings.reduce((acc, r) => acc + (Number(r.totalBillAmountInr) || 0), 0);
    const pfSum = readings.reduce((acc, r) => acc + (Number(r.powerFactor) || 0.98), 0);
    const averagePowerFactor = Number((pfSum / readings.length).toFixed(3));
    const peakDemandKvaMax = Math.max(...readings.map(r => Number(r.peakDemandKva) || 0));
    const solarOffsetRatio = (totalImportKwh + totalExportKwh) > 0 
      ? Math.round((totalExportKwh / (totalImportKwh + totalExportKwh)) * 100) 
      : 0;

    // APDCL Low Power Factor Penalty Alert: if power factor is less than 0.90
    const powerFactorAlert = averagePowerFactor < 0.90 || readings.some(r => Number(r.powerFactor) < 0.90);

    return {
      totalImportKwh,
      totalExportKwh,
      netKwh,
      totalBilledInr,
      averagePowerFactor,
      powerFactorAlert,
      peakDemandKvaMax,
      solarOffsetRatio,
      count: readings.length
    };
  }

  // --- CAFM PHASE 3: STATUTORY & CEIG COMPLIANCE ---
  getComplianceRecords(orgId = 'all', siteId = 'all') {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (!store) return [];
    let list = store.getComplianceRecords ? store.getComplianceRecords() : [];
    const targetOrg = (orgId !== 'all') ? orgId : this.currentOrganizationFilter;
    if (targetOrg && targetOrg !== 'all') {
      list = list.filter(c => c.organizationId === targetOrg);
    }
    if (siteId && siteId !== 'all') {
      list = list.filter(c => c.siteId === siteId);
    }
    return list;
  }

  getComplianceAlerts(thresholdDays = 45) {
    const records = this.getComplianceRecords('all', 'all');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return records.map(rec => {
      let daysLeft = 999;
      let alertLevel = 'Valid'; // 'Valid', 'Due Soon', 'Expired'

      if (rec.expiryDate) {
        const exp = new Date(rec.expiryDate);
        exp.setHours(0, 0, 0, 0);
        const diffMs = exp - today;
        daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (daysLeft <= 0) {
          alertLevel = 'Expired';
        } else if (daysLeft <= thresholdDays) {
          alertLevel = 'Due Soon';
        }
      }

      return {
        ...rec,
        daysLeft,
        alertLevel,
        isExpired: alertLevel === 'Expired',
        isDueSoon: alertLevel === 'Due Soon'
      };
    }).sort((a, b) => a.daysLeft - b.daysLeft);
  }

  saveComplianceRecord(record, user = 'Admin', role = 'Operator') {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (!store) return null;
    const isNew = !record.id;
    const saved = store.saveComplianceRecord(record);
    if (store.logAuditAction) {
      store.logAuditAction(
        isNew ? 'CREATE_COMPLIANCE_RECORD' : 'UPDATE_COMPLIANCE_RECORD',
        'complianceRecords',
        saved.id,
        `${isNew ? 'Registered' : 'Updated'} statutory compliance certificate: ${saved.complianceType} (${saved.certificateNumber || 'No Ref'})`,
        user,
        role
      );
    }
    return saved;
  }

  deleteComplianceRecord(id, user = 'Admin', role = 'Operator') {
    const store = (typeof window !== 'undefined' && window.storage) ? window.storage : 
                  ((typeof global !== 'undefined' && global.storage) ? global.storage : null);
    if (!store) return false;
    store.deleteComplianceRecord(id);
    if (store.logAuditAction) {
      store.logAuditAction(
        'DELETE_COMPLIANCE_RECORD',
        'complianceRecords',
        id,
        `Deleted statutory compliance record ${id}`,
        user,
        role
      );
    }
    return true;
  }
}

// Global Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CafmController;
}
if (typeof window !== 'undefined') {
  window.CafmController = CafmController;
  window.cafm = new CafmController();
}
if (typeof global !== 'undefined') {
  global.CafmController = CafmController;
  global.cafm = new CafmController();
}
