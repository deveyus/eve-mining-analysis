// Haul paste parser: turns free-form copied lines into haul items.
// Accepts whatever the client or a spreadsheet hands out — tab-separated inventory
// copy ("Veldspar\t12345"), survey-scanner lines with distances
// ("Veldspar 1.0 km 12345"), hand-typed ("Veldspar 12345"), numbers before or
// after the name, thousands separators as commas or space-groups.
// kind: 'ore' (raw), 'comp' (modern "Compressed X" types; the legacy
// "Batch Compressed X" spelling matches too — same 100:1 haul form), 'mineral'.
(function() {
  'use strict';

  // Longest-name-first lookup so "Compressed Gneiss" and "Gneiss II-Grade" win
  // over plain "Gneiss". One entry per raw ore + its compressed twin + minerals.
  function buildHaulNames(CALC) {
    const names = [];
    for (const o of CALC.ORES) {
      names.push({ low: o.name.toLowerCase(), disp: o.name, kind: 'ore', key: o.name });
      names.push({ low: ('Compressed ' + o.name).toLowerCase(), disp: 'Compressed ' + o.name, kind: 'comp', key: o.name });
    }
    for (const m of Object.keys(CALC.MINERALS)) {
      names.push({ low: m.toLowerCase(), disp: m, kind: 'mineral', key: m });
    }
    names.sort((a, b) => b.low.length - a.low.length);
    return names;
  }

  // "1 234 567" → "1234567": merge space-grouped digit triples until stable.
  function collapseSpaceGroups(s) {
    let cur = String(s).replace(/\u00a0/g, ' ');
    for (let i = 0; i < 6; i++) {
      const next = cur.replace(/(\d) (\d{3})(?!\d)/g, '$1$2');
      if (next === cur) break;
      cur = next;
    }
    return cur;
  }

  function toNumber(token) {
    const clean = token.replace(/[',\s]/g, '');
    if (!/^\d+(\.\d+)?$/.test(clean)) return NaN;
    const n = parseFloat(clean);
    return isFinite(n) && n > 0 ? n : NaN;
  }

  // Numeric candidates in a segment, skipping numbers that belong to a unit
  // cell ("1.0 km", "12968.85 m³") so distances and volumes never pose as quantities.
  function numericCandidates(segment) {
    const out = [];
    if (!segment) return out;
    const s = collapseSpaceGroups(segment);
    for (const cell of s.split('\t')) {
      const tokens = cell.trim().split(/\s+/).filter(Boolean);
      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (!/^\d[\d',.]*$/.test(t)) continue;
        const next = (tokens[i + 1] || '').toLowerCase().replace(/\./g, '');
        if (/^(km|au|m|m3|%)$/.test(next)) continue;
        const num = toNumber(t);
        if (!isFinite(num)) continue;
        out.push({ num, isInt: /^\d+$/.test(t.replace(/[',]/g, '')) });
      }
    }
    return out;
  }

  // Prefer whole-number candidates (quantities are integers; distances are decimals).
  function pickQty(cands) {
    if (!cands.length) return NaN;
    const int = cands.find(c => c.isInt);
    return (int || cands[0]).num;
  }

  function findName(line, names) {
    const low = line.toLowerCase();
    for (const c of names) {
      let from = 0;
      while (true) {
        const idx = low.indexOf(c.low, from);
        if (idx === -1) break;
        const before = idx > 0 ? low[idx - 1] : ' ';
        const after = idx + c.low.length < low.length ? low[idx + c.low.length] : ' ';
        if (!/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after)) return { c, idx };
        from = idx + 1;
      }
    }
    return null;
  }

  function parseHaulText(text, names) {
    const items = [];
    const skipped = [];
    const byName = new Map();
    for (const rawLine of String(text || '').split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line) continue;
      const hit = findName(line, names);
      if (!hit) {
        // drop obvious header rows ("Name  Quantity"), surface anything else
        if (!/\d/.test(line) && /^(name|item|type|group|ore)\b/i.test(line)) continue;
        skipped.push(line);
        continue;
      }
      const after = line.slice(hit.idx + hit.c.low.length);
      const pre = line.slice(0, hit.idx);
      let qty = pickQty(numericCandidates(after));
      if (!isFinite(qty)) qty = pickQty(numericCandidates(pre));
      if (!isFinite(qty)) { skipped.push(line + '  — no quantity'); continue; }
      if (qty > 1e13) { skipped.push(line + '  — quantity looked wrong'); continue; }
      const disp = hit.c.kind === 'comp' ? 'Compressed ' + hit.c.key : hit.c.disp;
      if (byName.has(disp)) {
        byName.get(disp).qty += qty; // same stack split over several lines
      } else {
        const item = { disp, kind: hit.c.kind, key: hit.c.key, qty };
        byName.set(disp, item);
        items.push(item);
      }
    }
    return { items, skipped };
  }

  const api = { buildHaulNames, parseHaulText, numericCandidates, collapseSpaceGroups, findName };
  if (typeof window !== 'undefined') window.HAUL_PARSE = api;
  else if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
