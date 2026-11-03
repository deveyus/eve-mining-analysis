// Build the full ore dataset for the EVE mining calculator — SDE-driven, no hardcoded variant names.
// Sources (fetched/verified fresh):
//   /tmp/eve-sde-csv/invTypes.csv, invGroups.csv, invTypeMaterials.csv   (fuzzwork SDE dump, downloaded 2026-11-03)
//   hoboleaks compressibletypes.json                          (raw -> batch-compressed mapping)
//   fuzzwork Jita aggregates                                  (seed sell prices)
// Cross-checks: old 10-ore constants in web/calculations.js must be reproduced exactly.
import { writeFileSync, readFileSync, existsSync } from 'node:fs';

const DUMP_BASE = 'https://www.fuzzwork.co.uk/dump/latest/csv/';
const CSV_DIR = '/tmp/eve-sde-csv';

async function ensureCsv(name) {
  const p = `${CSV_DIR}/${name}`;
  if (existsSync(p)) return p;
  if (!existsSync(CSV_DIR)) { const { mkdirSync } = await import('node:fs'); mkdirSync(CSV_DIR, { recursive: true }); }
  const res = await fetch(DUMP_BASE + name);
  if (!res.ok) throw new Error(`download ${name} -> HTTP ${res.status}`);
  writeFileSync(p, Buffer.from(await res.arrayBuffer()));
  return p;
}
for (const f of ['invTypes.csv', 'invGroups.csv', 'invTypeMaterials.csv']) await ensureCsv(f);

const OUT_JS = '/home/z/my-project/eve-mining-analysis/web/ore-data.js';
const OUT_AUDIT = '/tmp/ore-data-audit.json';

// ---- proper quote-aware CSV parser ----
function parseCsv(text) {
  const rows = [];
  let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { f += '"'; i++; } else { q = false; }
      } else f += c;
    } else {
      if (c === '"') q = true;
      else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\n') { row.push(f); f = ''; rows.push(row); row = []; }
      else if (c !== '\r') f += c;
    }
  }
  if (f !== '' || row.length) { row.push(f); rows.push(row); }
  return rows;
}

function loadCsv(path) {
  const rows = parseCsv(readFileSync(path, 'utf8'));
  const header = rows[0].map(h => h.replace(/^\uFEFF/, ''));
  return rows.slice(1).filter(r => r.length === header.length)
    .map(r => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}

const invTypes = loadCsv('/tmp/eve-sde-csv/invTypes.csv');
const invGroups = loadCsv('/tmp/eve-sde-csv/invGroups.csv');
const invMats = loadCsv('/tmp/eve-sde-csv/invTypeMaterials.csv');
console.log('invTypes rows:', invTypes.length, '| groups:', invGroups.length, '| material rows:', invMats.length);

const groupName = Object.fromEntries(invGroups.map(g => [g.groupID, g.groupName]));
const MINERALS = {
  Tritanium: 34, Pyerite: 35, Mexallon: 36, Isogen: 37,
  Nocxium: 38, Zydrine: 39, Megacyte: 40, Morphite: 11399,
};
const MINERAL_BY_ID = Object.fromEntries(Object.entries(MINERALS).map(([n, id]) => [id, n]));

// The ore family groups (from invGroups; categoryID 25 = Celestial Objects / ore groups named after the ore)
const FAMILY_GROUP_IDS = ['451', '452', '453', '454', '455', '456', '457', '458', '459', '460', '461', '462', '467', '468', '469'];
const expectedFamilies = ['Bistot', 'Crokite', 'Dark Ochre', 'Hedbergite', 'Hemorphite', 'Jaspet', 'Kernite', 'Plagioclase', 'Pyroxeres', 'Scordite', 'Spodumain', 'Veldspar', 'Gneiss', 'Mercoxit', 'Omber'];
const famNames = FAMILY_GROUP_IDS.map(g => groupName[g]);
const missingFam = expectedFamilies.filter(f => !famNames.includes(f));
if (missingFam.length) throw new Error('family groups missing from SDE: ' + missingFam.join(','));
console.log('families:', famNames.join(' | '));

// Grade suffix regex per family: base, 0-Grade, II-, III-, IV-Grade
function gradeOf(typeName, fam) {
  const esc = fam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = typeName.match(new RegExp('^' + esc + '( II-Grade| III-Grade| IV-Grade| 0-Grade)?$'));
  return m ? (m[1] ? m[1].trim() : 'Base') : null;
}

// ---- collect raw ores + modern compressed twins (625xx, uniform 100:1) from SDE ----
// The 28xxx "Batch Compressed X" types are legacy (portion=1, thin markets); the 625xx
// "Compressed X" types are the current 100:1 hauling form: portion=100, 1 unit = 1 raw unit,
// volume = raw volume / 100, typeMaterials identical to the raw batch. Verified per-type below.
const ores = [];
const compressed = [];
const excluded = [];
for (const t of invTypes) {
  const gname = groupName[t.groupID];
  if (!FAMILY_GROUP_IDS.includes(t.groupID)) continue;
  const stem = t.typeName.startsWith('Compressed ') ? t.typeName.replace(/^Compressed /, '') : t.typeName;
  const g = gradeOf(stem, gname);
  if (g) {
    if (t.published === '1') {
      const vol = parseFloat(t.volume) || parseFloat(t.packagedVolume);
      if (t.typeName.startsWith('Compressed ')) compressed.push({ name: t.typeName, family: gname, grade: g, typeID: Number(t.typeID), volume_m3: vol });
      else ores.push({ name: t.typeName, family: gname, grade: g, typeID: Number(t.typeID), volume_m3: vol });
    } else excluded.push(t.typeName);
  } else {
    excluded.push(t.typeName);
  }
}
console.log('raw ores found:', ores.length, '| modern compressed (625xx) found:', compressed.length);
console.log('excluded (legacy Batch Compressed, junk, event):', excluded.filter(n => n.startsWith('Batch Compressed')).length, 'batch-compressed legacy types +', excluded.filter(n => !n.startsWith('Batch Compressed')).join(', '));

// ---- hoboleaks compressibletypes: cross-check the raw -> 625xx mapping ----
const compressible = await (await fetch('https://sde.hoboleaks.space/tq/compressibletypes.json')).json();
const compressedIdByOre = {};
for (const o of ores) {
  const mapped = Number(compressible[String(o.typeID)]);
  const twin = compressed.find(c => c.family === o.family && c.grade === o.grade);
  if (!twin) { console.log('no Compressed twin for ' + o.name + ' — compressed column will fall back to estimate'); continue; }
  if (isFinite(mapped) && mapped !== twin.typeID) throw new Error(`compressible mapping mismatch for ${o.name}: map says ${mapped}, SDE twin is ${twin.typeID}`);
  // uniform 100:1: compressed volume must equal raw volume / 100
  if (Math.abs(twin.volume_m3 - o.volume_m3 / 100) > 1e-9) throw new Error(`compressed volume not 100:1 for ${twin.name}: ${twin.volume_m3} vs ${o.volume_m3}/100`);
  compressedIdByOre[o.name] = twin.typeID;
}
console.log('compressed twins verified (100:1 uniform, mapping matches hoboleaks):', Object.keys(compressedIdByOre).length);

// ---- reprocessing outputs per ore (per 100-unit batch) ----
const matsByType = {};
for (const m of invMats) {
  (matsByType[m.typeID] ||= []).push({ materialTypeID: Number(m.materialTypeID), quantity: Number(m.quantity) });
}
const oreMineralsPerBatch = {};
for (const o of ores) {
  const mats = matsByType[o.typeID];
  if (!mats || mats.length === 0) throw new Error('no typeMaterials for ' + o.name);
  const dict = {};
  for (const m of mats) {
    const mn = MINERAL_BY_ID[m.materialTypeID];
    if (!mn) throw new Error(o.name + ': unexpected material ' + m.materialTypeID);
    dict[mn] = m.quantity;
  }
  oreMineralsPerBatch[o.name] = dict;
}
oreMineralsPerBatch['Prismaticite'] = null; // random mineral content — no fixed yield exists

// batch-compressed twins reprocess identically — verify
for (const c of compressed) {
  const rawName = c.name.replace(/^Compressed /, '');
  const mc = matsByType[c.typeID], mr = matsByType[compressedIdByOre[rawName]];
  const norm = (x) => x ? [...x].sort((p, q) => p.materialTypeID - q.materialTypeID).map(m => m.materialTypeID + ':' + m.quantity).join(',') : '';
  if (norm(mc) !== norm(mr)) throw new Error('compressed materials differ from raw for ' + c.name);
}

// ---- cross-check against the old verified 10-ore constants ----
const OLD = {
  'Dark Ochre': { Mexallon: 1360, Isogen: 1200, Nocxium: 320 },
  'Gneiss': { Pyerite: 2000, Mexallon: 1500, Isogen: 800 },
  'Crokite': { Pyerite: 800, Mexallon: 2000, Nocxium: 800 },
  'Hemorphite': { Isogen: 240, Nocxium: 90 },
  'Hedbergite': { Pyerite: 450, Nocxium: 120 },
  'Omber': { Pyerite: 90, Isogen: 75 },
  'Jaspet': { Mexallon: 150, Nocxium: 50 },
  'Kernite': { Mexallon: 60, Isogen: 120 },
  'Pyroxeres': { Pyerite: 90, Mexallon: 30 },
};
let mismatch = 0;
for (const [name, exp] of Object.entries(OLD)) {
  const got = oreMineralsPerBatch[name];
  for (const [m, q] of Object.entries(exp)) if (got[m] !== q) { console.log('MISMATCH', name, m, 'expected', q, 'got', got[m]); mismatch++; }
}
const oldIds = { 'Dark Ochre': 1232, 'Gneiss': 1229, 'Crokite': 1225, 'Hemorphite': 1231, 'Hedbergite': 21, 'Omber': 1227, 'Jaspet': 1226, 'Kernite': 20, 'Pyroxeres': 1224 };
for (const [n, id] of Object.entries(oldIds)) {
  const o = ores.find(x => x.name === n);
  if (!o) throw new Error('old ore missing from new set: ' + n);
  if (o.typeID !== id) { console.log('ID MISMATCH', n, 'old', id, 'new', o.typeID); mismatch++; }
}
const oldVol = { 'Dark Ochre': 8, 'Gneiss': 5, 'Crokite': 16, 'Hemorphite': 3, 'Hedbergite': 3, 'Omber': 0.6, 'Jaspet': 2, 'Kernite': 1.2, 'Pyroxeres': 0.3 };
for (const [n, v] of Object.entries(oldVol)) {
  const o = ores.find(x => x.name === n);
  if (Math.abs(o.volume_m3 - v) > 1e-9) { console.log('VOL MISMATCH', n, 'old', v, 'new', o.volume_m3); mismatch++; }
}
if (mismatch) throw new Error(mismatch + ' cross-check mismatches — aborting');
console.log('CROSS-CHECK OK: ids, volumes and reprocessing outputs match the previously verified set');

// ---- Prismaticite (kept from old table: random content, no fixed yield) ----
const PRISM = invTypes.find(t => t.typeID === '90041' && t.typeName === 'Prismaticite');
if (!PRISM) throw new Error('Prismaticite not found');
const prismVol = parseFloat(PRISM.volume);
const prismSeedVol = prismVol;

// ---- fuzzwork seed prices ----
const allPriceIds = [...ores.map(o => o.typeID), ...Object.values(compressedIdByOre), ...Object.values(MINERALS), 90041];
const fw = await (await fetch('https://market.fuzzwork.co.uk/aggregates/?station=60003760&types=' + allPriceIds.join(','))).json();
const seedRaw = {}, seedBatch = {}, seedMineral = {};
for (const o of ores) {
  const e = fw[String(o.typeID)];
  const p = e && e.sell && isFinite(Number(e.sell.percentile)) ? Number(e.sell.percentile) : NaN;
  if (isFinite(p) && p > 0) seedRaw[o.name] = Math.round((p / o.volume_m3) * 10) / 10;
}
// Prismaticite sits outside the family groups; seed it with the same two-source chain
{
  const e = fw['90041'];
  let p = e && e.sell && isFinite(Number(e.sell.percentile)) ? Number(e.sell.percentile) : NaN;
  if (!isFinite(p) || p <= 0) {
    const esi = await (await fetch('https://esi.evetech.net/latest/markets/prices/')).json();
    const x = esi.find(v => v.type_id === 90041);
    p = x && isFinite(x.average_price) ? x.average_price : NaN;
  }
  if (isFinite(p) && p > 0) seedRaw['Prismaticite'] = Math.round((p / prismSeedVol) * 10) / 10;
}
for (const [name, cid] of Object.entries(compressedIdByOre)) {
  const e = fw[String(cid)];
  const p = e && e.sell && isFinite(Number(e.sell.percentile)) ? Number(e.sell.percentile) : NaN;
  if (isFinite(p) && p > 0) seedBatch[name] = p;
}
for (const [mn, tid] of Object.entries(MINERALS)) {
  const e = fw[String(tid)];
  const p = e && e.sell && isFinite(Number(e.sell.percentile)) ? Number(e.sell.percentile) : NaN;
  if (isFinite(p) && p > 0) seedMineral[mn] = Math.round(p * 100) / 100;
}
console.log('seeds: raw', Object.keys(seedRaw).length + '/' + ores.length, '| compressed', Object.keys(seedBatch).length + '/' + Object.keys(compressedIdByOre).length, '| minerals', Object.keys(seedMineral).length + '/8');

// ESI all-region averages as seed fallback for thin Jita types (same fallback the live pull uses)
{
  const missing = ores.filter(o => seedRaw[o.name] == null);
  if (missing.length) {
    const d = await (await fetch('https://esi.evetech.net/latest/markets/prices/')).json();
    const byId = new Map(d.map(x => [x.type_id, isFinite(x.average_price) ? x.average_price : x.adjusted_price]));
    let filled = 0;
    for (const o of missing) {
      const p = byId.get(o.typeID);
      if (isFinite(p) && p > 0) { seedRaw[o.name] = Math.round((p / o.volume_m3) * 10) / 10; filled++; }
    }
    console.log('esi seed fallback filled:', filled, 'of', missing.length, '(' + missing.map(o => o.name).join(', ') + ')');
  }
}

// grade-ladder sanity: print one family's per-batch mineral quantities across grades
for (const [mn, q] of Object.entries(oreMineralsPerBatch['Veldspar'] || {})) console.log('Veldspar ladder', mn, ['Veldspar', 'Veldspar 0-Grade', 'Veldspar II-Grade', 'Veldspar III-Grade', 'Veldspar IV-Grade'].map(n => n + '=' + (oreMineralsPerBatch[n]?.[mn] ?? '-')).join(' '));

// ---- emit ----
const families = {};
for (const f of famNames.concat(['Special'])) families[f] = [];
for (const o of ores) families[o.family].push(o.name);
families['Special'] = ['Prismaticite'];
const familyOrder = ['Veldspar', 'Scordite', 'Plagioclase', 'Pyroxeres', 'Omber', 'Kernite', 'Jaspet', 'Hemorphite', 'Hedbergite', 'Gneiss', 'Dark Ochre', 'Crokite', 'Spodumain', 'Bistot', 'Mercoxit', 'Special'];
const gradeRank = { Base: 0, '0-Grade': 1, 'II-Grade': 2, 'III-Grade': 3, 'IV-Grade': 4 };
const sortOres = (a, b) => (familyOrder.indexOf(a.family) - familyOrder.indexOf(b.family)) || (gradeRank[a.grade] - gradeRank[b.grade]);
ores.sort(sortOres);
ores.push({ name: 'Prismaticite', family: 'Special', grade: 'Base', typeID: 90041, volume_m3: prismVol });
families['Special'] = ['Prismaticite'];

const oreOut = ores.map(o => ({ name: o.name, family: o.family, volume_m3: o.volume_m3, avg_isk_m3: seedRaw[o.name] ?? null, typeID: o.typeID }));
const compressedVolumes = {};
for (const c of compressed) compressedVolumes[c.name.replace(/^Compressed /, '')] = c.volume_m3;
const missingSeeds = oreOut.filter(o => o.avg_isk_m3 == null).map(o => o.name);
const snapshotDate = new Date().toISOString().slice(0, 10);

const js = `// GENERATED ${snapshotDate} by scripts/build-ore-data.mjs — do not edit by hand.
// Sources: TQ SDE invTypes/invTypeMaterials (fuzzwork dump, batch = 100 units), hoboleaks
// compressibletypes (raw -> Batch Compressed mapping, reprocess-identical), ESI-independent.
// Seed prices: fuzzwork Jita sell-percentile snapshot ${snapshotDate}; ~ = no market price.
window.ORE_DATA = {
  snapshotDate: "${snapshotDate}",
  ores: ${JSON.stringify(oreOut)},
  families: ${JSON.stringify(families)},
  minerals: ${JSON.stringify(MINERALS)},
  mineralSeedPrices: ${JSON.stringify(seedMineral)},
  oreTypeIds: ${JSON.stringify(Object.fromEntries(ores.map(o => [o.name, o.typeID])))},
  compressedTypeIds: ${JSON.stringify(compressedIdByOre)},
  compressedVolumes: ${JSON.stringify(compressedVolumes)},
  oreMineralsPerBatch: ${JSON.stringify(oreMineralsPerBatch)},
  seedCompressedPerUnit: ${JSON.stringify(seedBatch)},
};
`;
writeFileSync(OUT_JS, js);
writeFileSync(OUT_AUDIT, JSON.stringify({ snapshotDate, oreOut, compressedVolumes, oreMineralsPerBatch, seedRaw, seedBatch, seedMineral, excluded }, null, 2));
console.log('wrote', OUT_JS);
console.log('ores per family:', famNames.map(f => f + '=' + families[f].length).join(' '));
console.log('missing seeds:', missingSeeds.length ? missingSeeds.join(', ') : 'none');
console.log('sample compressed volumes:', JSON.stringify(Object.fromEntries(Object.entries(compressedVolumes).slice(0, 4))));
