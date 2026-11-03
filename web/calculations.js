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

// ---- Ore dataset (generated) ----
// ore-data.js (loaded before this file) carries the full SDE-verified ore table: every family,
// every grade variant, modern 100:1 compressed twins, per-batch reprocessing outputs and
// Jita seed-price snapshots. See scripts/build-ore-data.mjs for provenance.
const D = (typeof window !== "undefined") ? window.ORE_DATA : null;
if (!D) throw new Error("ore-data.js missing — load it before calculations.js");

const ORES = D.ores;
const MINERALS = D.minerals;
const MINERAL_SEED_PRICES = D.mineralSeedPrices;
const ORE_TYPE_IDS = D.oreTypeIds;
const ORE_FAMILIES = D.families;
const SNAPSHOT_DATE = D.snapshotDate;

// Modern compressed ore ("Compressed X" types): the current 100:1 hauling form.
// 1 compressed unit = 1 raw unit compressed 100x in volume (volume = raw volume / 100);
// 100 compressed units reprocess as one 100-unit batch with identical outputs.
const COMPRESSED_TYPE_IDS = D.compressedTypeIds;
const COMPRESSED_VOLUMES = D.compressedVolumes;
const SEED_COMPRESSED_PER_UNIT = D.seedCompressedPerUnit;
const COMPRESSION_RATIO = 100;

// Minerals per batch (100 units). Verified against SDE typeMaterials (exact quantities).
// Prismaticite = null: random mineral content — no fixed yield exists.
const ORE_MINERALS_PER_BATCH = D.oreMineralsPerBatch;

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
  return ore ? (ore.avg_isk_m3 || 0) : 0;
}

// Value of one m^3 of a given ore under the chosen valuation basis.
// A typed override IS the valuation — it wins on every basis. Otherwise falls back to the
// raw-ore value whenever the requested basis has no usable data.
function basisValuePerM3(entry, ctx) {
  const ore = oreByName(entry.ore);
  const v = (entry.iskOverride === '' || entry.iskOverride == null)
    ? NaN
    : parseFloat(entry.iskOverride);
  if (isFinite(v)) return v;
  if (ctx && ctx.basis === 'minerals') {
    const mv = mineralValuePerM3(entry.ore, ctx.yieldPct, ctx.mineralPrices);
    if (isFinite(mv)) return mv;
  }
  if (ctx && ctx.basis === 'compressed') {
    const cv = compressedValuePerRawM3(entry.ore, ctx.livePrices);
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

// Volume of one unit of the modern compressed form (m^3): raw volume / 100 (uniform 100:1).
function compressedUnitVolume(oreName) {
  const v = COMPRESSED_VOLUMES[oreName];
  if (isFinite(v) && v > 0) return v;
  const ore = oreByName(oreName);
  return ore ? ore.volume_m3 / COMPRESSION_RATIO : NaN;
}

// Compressed-unit price: live pull first, Jita seed snapshot as offline default.
function compressedUnitPrice(oreName, livePrices) {
  const live = livePrices ? livePrices["Compressed " + oreName] : NaN;
  if (isFinite(live) && live > 0) return live;
  const seed = SEED_COMPRESSED_PER_UNIT[oreName];
  return isFinite(seed) && seed > 0 ? seed : NaN;
}

// Value per m^3 OF THE COMPRESSED ORE — the hauling number (what one m^3 in the container is worth).
function compressedIskPerM3(oreName, livePrices) {
  const vol = compressedUnitVolume(oreName);
  const p = compressedUnitPrice(oreName, livePrices);
  if (!isFinite(vol) || !isFinite(p)) return NaN;
  return p / vol;
}

// Value per m^3 OF RAW ORE EQUIVALENT (1 raw unit compresses into 1 unit worth p): p / raw volume.
// This is the number that belongs in payback math — the fleet mines raw m^3.
function compressedValuePerRawM3(oreName, livePrices) {
  const ore = oreByName(oreName);
  const p = compressedUnitPrice(oreName, livePrices);
  if (!ore || !isFinite(p) || !(ore.volume_m3 > 0)) return NaN;
  return p / ore.volume_m3;
}

// Estimate when the compressed form has no market price at all: unit-price parity with raw ore
// (1 compressed unit = 1 raw unit, so ~ raw unit price per unit = raw isk/m3 x 100 per m^3 hauled).
function compressedEstimatePerM3(oreName, rawIskPerM3) {
  return isFinite(rawIskPerM3) ? rawIskPerM3 * COMPRESSION_RATIO : NaN;
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
    MINERALS, MINERAL_SEED_PRICES, ORE_TYPE_IDS, COMPRESSED_TYPE_IDS, ORE_FAMILIES, SNAPSHOT_DATE,
    ORE_MINERALS_PER_BATCH, COMPRESSION_RATIO,
    fleetCost, fleetRate, efficiency, paybackSeconds, paybackMinutes,
    msiBreakEvenIskPerM3, asymptoticEfficiency,
    combinedCost, combinedRate, combinedPaybackSeconds,
    configName, seriesPoints, round2,
    oreByName, effectiveIskPerM3, basisValuePerM3, mineralValuePerM3,
    compressedUnitVolume, compressedUnitPrice, compressedIskPerM3, compressedValuePerRawM3,
    compressedEstimatePerM3, blendComposition, compositionPaybackMinutes,
  };
}
