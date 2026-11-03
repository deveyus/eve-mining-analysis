// EVE mining fleet calculations (ported from src/eve_mining/)
// All costs in millions of ISK; rates in m^3/s; payback in minutes.

// Booster cost (M ISK)
const BOOSTER_COST = {
  Orca: 1110.0,
  Porpoise: 112.0,
};

// Miner cost (M ISK)
const MINER_COST = {
  Covetor: 50.0,
  Hulk: 213.0,
  Pioneer: 6.85,
  "Alpha Pioneer": 6.85,
  Venture: 2.27,
  "Alpha Venture": 2.27,
};

// Mining rate (m^3/s) per miner for "booster|miner"
const MINING_RATE = {
  "Orca|Hulk": 107.0,
  "Porpoise|Hulk": 97.1,
  "Orca|Covetor": 79.2,
  "Porpoise|Covetor": 71.9,
  "Orca|Pioneer": 26.6,
  "Porpoise|Pioneer": 24.2,
  "Orca|Alpha Pioneer": 15.8,
  "Porpoise|Alpha Pioneer": 14.4,
  "Orca|Venture": 18.1,
  "Porpoise|Venture": 16.5,
  "Orca|Alpha Venture": 12.9,
  "Porpoise|Alpha Venture": 11.7,
};

// Mobile Scan Inhibitor: 35 M ISK per hour burn, applied to whole fleet
const MSI_BURN_ISK_PER_S = 35e6 / 3600.0; // ~9,722.22 isk/s

// Ore data (isk/m^3 = raw ore price / volume), parsed from low_ore.png
const ORES = [
  { name: "Dark Ochre", volume_m3: 8, avg_isk_m3: 505, min_isk_m3: 475, max_isk_m3: 550 },
  { name: "Prismaticite", volume_m3: 40, avg_isk_m3: 1096, min_isk_m3: 1096, max_isk_m3: 1096 },
  { name: "Gneiss", volume_m3: 5, avg_isk_m3: 484, min_isk_m3: 420, max_isk_m3: 600 },
  { name: "Crokite", volume_m3: 16, avg_isk_m3: 347, min_isk_m3: 312, max_isk_m3: 381 },
  { name: "Hemorphite", volume_m3: 3, avg_isk_m3: 301, min_isk_m3: 216, max_isk_m3: 353 },
  { name: "Hedbergite", volume_m3: 3, avg_isk_m3: 571, min_isk_m3: 250, max_isk_m3: 1133 },
  { name: "Omber", volume_m3: 0.6, avg_isk_m3: 214, min_isk_m3: 172, max_isk_m3: 248 },
  { name: "Jaspet", volume_m3: 2, avg_isk_m3: 291, min_isk_m3: 138, max_isk_m3: 450 },
  { name: "Kernite", volume_m3: 1.2, avg_isk_m3: 395, min_isk_m3: 250, max_isk_m3: 497 },
  { name: "Pyroxeres", volume_m3: 0.3, avg_isk_m3: 119, min_isk_m3: 93, max_isk_m3: 150 },
];

// ---- Verified live-data constants (2026-11-03) ----
// Sources: TQ SDE typeMaterials via hoboleaks mirror; ESI /universe/types volumes; EVE University
// Reprocessing + Ore pages (mineral sets cross-checked against SDE, exact match).
// SDE typeMaterials quantities are PER BATCH OF 100 UNITS (ore batch size = 100).
const MINERALS = {
  Tritanium: 34, Pyerite: 35, Mexallon: 36, Isogen: 37,
  Nocxium: 38, Zydrine: 39, Megacyte: 40, Morphite: 11399,
};

const ORE_TYPE_IDS = {
  "Dark Ochre": 1232, "Prismaticite": 90041, "Gneiss": 1229, "Crokite": 1225,
  "Hemorphite": 1231, "Hedbergite": 21, "Omber": 1227, "Jaspet": 1226,
  "Kernite": 20, "Pyroxeres": 1224,
};

// Batch-compressed ore (the 100:1 hauling form produced by structure compression).
// 1 batch unit = one 100-unit reprocessing batch — SDE typeMaterials of batch types are IDENTICAL
// to the raw ore's per-batch quantities (verified 2026-11-03). Volumes per ore from ESI /universe/types.
// Prismaticite has no batch-compressed type (2025 ore) — compressed column falls back to an estimate.
// Note: the plain "Compressed X" types (625xx) are the old Orca-style 1-unit-per-raw-unit compaction
// and trade near single-unit parity — NOT the hauling product; deliberately unused.
const BATCH_COMPRESSED_TYPE_IDS = {
  "Dark Ochre": 28394, "Gneiss": 28397, "Crokite": 28391, "Hemorphite": 28403,
  "Hedbergite": 28401, "Omber": 28416, "Jaspet": 28406, "Kernite": 28410, "Pyroxeres": 28424,
};

const BATCH_COMPRESSED_VOLUME_M3 = {
  "Dark Ochre": 4.2, "Gneiss": 1.8, "Crokite": 7.81, "Hemorphite": 0.86,
  "Hedbergite": 0.47, "Omber": 0.3, "Jaspet": 0.15, "Kernite": 0.19, "Pyroxeres": 0.16,
};

// Minerals per batch (100 units). Verified against SDE typeMaterials (exact quantities).
// Prismaticite = null: random mineral content (Catalyst expansion) — no fixed yield exists.
const ORE_MINERALS_PER_BATCH = {
  "Dark Ochre": { Mexallon: 1360, Isogen: 1200, Nocxium: 320 },
  "Prismaticite": null,
  "Gneiss": { Pyerite: 2000, Mexallon: 1500, Isogen: 800 },
  "Crokite": { Pyerite: 800, Mexallon: 2000, Nocxium: 800 },
  "Hemorphite": { Isogen: 240, Nocxium: 90 },
  "Hedbergite": { Pyerite: 450, Nocxium: 120 },
  "Omber": { Pyerite: 90, Isogen: 75 },
  "Jaspet": { Mexallon: 150, Nocxium: 50 },
  "Kernite": { Mexallon: 60, Isogen: 120 },
  "Pyroxeres": { Pyerite: 90, Mexallon: 30 },
};

// 1 compressed unit = 100 raw units; compressed volume = raw volume / 100
// (ESI /universe/types: Compressed Gneiss = 0.05 m3, Compressed Dark Ochre = 0.08 m3).
const COMPRESSION_RATIO = 100;

const BOOSTERS = ["Orca", "Porpoise"];
const MINERS = ["Covetor", "Hulk", "Pioneer", "Alpha Pioneer", "Venture", "Alpha Venture"];

function rateKey(booster, miner) {
  return booster + "|" + miner;
}

function fleetCost(booster, miner, n) {
  return (BOOSTER_COST[booster] + n * MINER_COST[miner]) * 1e6; // ISK
}

function fleetRate(booster, miner, n) {
  return n * MINING_RATE[rateKey(booster, miner)]; // m^3/s
}

function efficiency(booster, miner, n) {
  // m^3/s per M ISK
  return fleetRate(booster, miner, n) / (fleetCost(booster, miner, n) / 1e6);
}

function paybackSeconds(booster, miner, n, iskPerM3, withMsi) {
  const cost = fleetCost(booster, miner, n);
  const gross = fleetRate(booster, miner, n) * iskPerM3; // isk/s
  const net = gross - (withMsi ? MSI_BURN_ISK_PER_S : 0);
  if (net <= 0) return Infinity;
  return cost / net;
}

function paybackMinutes(booster, miner, n, iskPerM3, withMsi) {
  return paybackSeconds(booster, miner, n, iskPerM3, withMsi) / 60.0;
}

function msiBreakEvenIskPerM3(booster, miner, n) {
  // Ore value at which MSI burn equals gross revenue (net = 0, never pays back)
  return MSI_BURN_ISK_PER_S / fleetRate(booster, miner, n);
}

function asymptoticEfficiency(booster, miner) {
  // Efficiency as N -> inf: rate / miner_cost (m^3/s per M ISK)
  return MINING_RATE[rateKey(booster, miner)] / MINER_COST[miner];
}

// Combined fleet (multiple rows): total cost / total rate.
// Boosters are shared across rows (one Porpoise boosts any number of miners),
// so each distinct booster type is counted exactly once.
function combinedCost(rows) {
  // rows: [{booster, miner, n}]
  const boosters = new Set();
  let total = 0;
  for (const r of rows) {
    boosters.add(r.booster);
    total += r.n * MINER_COST[r.miner] * 1e6; // ISK
  }
  for (const b of boosters) total += BOOSTER_COST[b] * 1e6; // ISK
  return total;
}

function combinedRate(rows) {
  let total = 0;
  for (const r of rows) total += fleetRate(r.booster, r.miner, r.n);
  return total;
}

function combinedPaybackSeconds(rows, iskPerM3, withMsi) {
  const cost = combinedCost(rows);
  const gross = combinedRate(rows) * iskPerM3;
  const net = gross - (withMsi ? MSI_BURN_ISK_PER_S : 0);
  if (net <= 0) return Infinity;
  return cost / net;
}

function configName(booster, miner) {
  return booster + " + " + miner;
}

function oreByName(name) {
  return ORES.find(o => o.name === name) || null;
}

// Ore Composition mixer: weighted average isk/m^3 across ore types.
// composition: [{ore, ratio, iskOverride?}]  ratio = relative share (e.g. 60 for 60%)
// An iskOverride that is empty/null/NaN falls back to live price, then the ore's average price.
// ctx (optional): { basis: 'raw'|'minerals'|'compressed', yieldPct, livePrices, mineralPrices }
// Returns {avgIskPerM3, totalRatio} or null if empty/invalid.
function effectiveIskPerM3(entry, ctx) {
  const ore = oreByName(entry.ore);
  const v = (entry.iskOverride === '' || entry.iskOverride == null)
    ? NaN
    : parseFloat(entry.iskOverride);
  if (isFinite(v)) return v;
  if (ctx && ctx.livePrices && ore) {
    const live = ctx.livePrices[ore.name];
    if (isFinite(live) && live > 0) return live;
  }
  return ore ? ore.avg_isk_m3 : 0;
}

// Value of one m^3 of a given ore under the chosen valuation basis.
// Falls back to the raw-ore value whenever the requested basis has no usable data.
function basisValuePerM3(entry, ctx) {
  if (ctx && ctx.basis === 'minerals') {
    const mv = mineralValuePerM3(entry.ore, ctx.yieldPct, ctx.mineralPrices);
    if (isFinite(mv)) return mv;
  }
  if (ctx && ctx.basis === 'compressed') {
    const cv = compressedIskPerM3(entry.ore, ctx.livePrices);
    if (isFinite(cv)) return cv;
  }
  return effectiveIskPerM3(entry, ctx);
}

// Minerals worth per m^3 of raw ore, reprocessed at yieldPct percent.
// Per batch of 100 units: value@100% = SUM(quantity x mineral price); batch volume = 100 x unit volume.
function mineralValuePerM3(oreName, yieldPct, mineralPrices) {
  const perBatch = ORE_MINERALS_PER_BATCH[oreName];
  const ore = oreByName(oreName);
  if (!perBatch || !ore || !mineralPrices || !isFinite(yieldPct) || yieldPct <= 0) return NaN;
  let v = 0;
  for (const [m, qty] of Object.entries(perBatch)) {
    const p = mineralPrices[m];
    if (!isFinite(p)) return NaN;
    v += qty * p;
  }
  return (v * (yieldPct / 100.0)) / (100 * ore.volume_m3);
}

// Batch-compressed market price expressed per m^3 of compressed ore: isk/m^3 = batch price / batch volume.
// (1 batch unit = 100 raw units; volumes differ per ore, see BATCH_COMPRESSED_VOLUME_M3.)
function compressedIskPerM3(oreName, livePrices) {
  const vol = BATCH_COMPRESSED_VOLUME_M3[oreName];
  if (!vol) return NaN;
  const p = livePrices ? livePrices["Batch Compressed " + oreName] : NaN;
  if (isFinite(p) && p > 0) return p / vol;
  return NaN;
}

// Estimate when no batch-compressed market price exists: value = 100 raw units' worth spread over
// the batch volume (or the naive x100 when even the batch volume is unknown, e.g. Prismaticite).
function compressedEstimatePerM3(oreName, rawIskPerM3) {
  const vol = BATCH_COMPRESSED_VOLUME_M3[oreName];
  const ore = oreByName(oreName);
  if (!ore || !isFinite(rawIskPerM3)) return NaN;
  if (vol) return (rawIskPerM3 * 100 * ore.volume_m3) / vol;
  return rawIskPerM3 * 100;
}

function blendComposition(composition, ctx) {
  if (!composition || composition.length === 0) return null;
  let weightedSum = 0;
  let totalRatio = 0;
  for (const c of composition) {
    const r = parseFloat(c.ratio) || 0;
    if (r <= 0) continue;
    weightedSum += r * basisValuePerM3(c, ctx);
    totalRatio += r;
  }
  if (totalRatio <= 0) return null;
  return { avgIskPerM3: weightedSum / totalRatio, totalRatio };
}

// Composition payback: fleet cost / (combined rate * blended isk/m^3)
function compositionPaybackSeconds(rows, composition, withMsi) {
  const blended = blendComposition(composition);
  if (!blended) return Infinity;
  return combinedPaybackSeconds(rows, blended.avgIskPerM3, withMsi);
}

function compositionPaybackMinutes(rows, composition, withMsi) {
  return compositionPaybackSeconds(rows, composition, withMsi) / 60.0;
}

function seriesPoints(booster, miner, n, iskPerM3, withMsi, xMaxMinutes, steps = 200) {
  const cost = fleetCost(booster, miner, n);
  const rate = fleetRate(booster, miner, n);
  const revPerMin = rate * iskPerM3 * 60.0; // ISK per minute
  const costM = cost / 1e6;
  const pb = paybackMinutes(booster, miner, n, iskPerM3, withMsi);
  const pbFinite = isFinite(pb);

  const times = [0.0];
  if (pbFinite && pb > 0 && pb < xMaxMinutes) times.push(pb);
  for (let i = 1; i <= steps; i++) {
    const t = (xMaxMinutes * i) / steps;
    if (pbFinite && Math.abs(t - pb) < 1e-6) continue;
    times.push(t);
  }
  times.sort((a, b) => a - b);

  const points = [];
  for (const t of times) {
    if (t > xMaxMinutes + 1e-9) continue;
    const profitM = (revPerMin * t - cost) / 1e6;
    points.push([round2(t), round2(profitM)]);
  }
  return { points, costM, pb: pbFinite ? pb : null };
}

function round2(x) {
  return Math.round(x * 100) / 100;
}

if (typeof window !== "undefined") {
  window.EVE_MINING_CALC = {
    BOOSTER_COST, MINER_COST, MINING_RATE, MSI_BURN_ISK_PER_S, ORES,
    BOOSTERS, MINERS,
    MINERALS, ORE_TYPE_IDS, BATCH_COMPRESSED_TYPE_IDS, BATCH_COMPRESSED_VOLUME_M3,
    ORE_MINERALS_PER_BATCH, COMPRESSION_RATIO,
    fleetCost, fleetRate, efficiency, paybackSeconds, paybackMinutes,
    msiBreakEvenIskPerM3, asymptoticEfficiency,
    combinedCost, combinedRate, combinedPaybackSeconds,
    configName, seriesPoints, round2,
    oreByName, effectiveIskPerM3, basisValuePerM3, mineralValuePerM3,
    compressedIskPerM3, compressedEstimatePerM3, blendComposition, compositionPaybackMinutes,
  };
}
