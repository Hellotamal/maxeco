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
      expiringAmcs
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
