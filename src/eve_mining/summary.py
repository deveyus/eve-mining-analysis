"""Generate a consolidated data summary for the EVE mining analysis."""

from __future__ import annotations

import os

from .ships import (
    BOOSTER_COST, MINER_COST, MINING_RATE, BOOSTERS, MINERS,
    CONFIGS, config_name,
)
from .ores import ORES, isk_per_m3_list, ore_volume, avg_isk_per_m3
from .calculations import (
    payback_minutes, msi_break_even_isk_per_m3, MSI_BURN_ISK_PER_S,
    asymptotic_efficiency,
)
from .msi import DEFAULT_ORES, DEFAULT_NS

NS_ALL = [1, 2, 3, 5, 10, 15, 20]


def build_summary() -> str:
    lines: list[str] = []
    lines.append("# EVE Mining Fleet Analysis — Complete Data Summary")
    lines.append("")
    lines.append("All figures derived from ship stats and ore prices parsed from `~/Downloads/low_ore.png`.")
    lines.append("")

    # ---- 1. Ships ----
    lines.append("## 1. Ship Data")
    lines.append("")
    lines.append("### Boosters (cost in M ISK)")
    for b in BOOSTERS:
        lines.append(f"- {b}: {BOOSTER_COST[b]:,.0f} M ISK")
    lines.append("")
    lines.append("### Miners (cost in M ISK)")
    for m in MINERS:
        lines.append(f"- {m}: {MINER_COST[m]:,.0f} M ISK")
    lines.append("")
    lines.append("### Mining Rates (m^3/s per miner, by booster)")
    lines.append("| Booster \\\\ Miner | Covetor | Hulk |")
    lines.append("|---|---|---|")
    for b in BOOSTERS:
        row = f"| {b} |"
        for m in MINERS:
            row += f" {MINING_RATE[(b,m)]} |"
        lines.append(row)
    lines.append("")
    lines.append("### Asymptotic efficiency (N -> inf, m^3/s per M ISK)")
    for b in BOOSTERS:
        for m in MINERS:
            lines.append(f"- {b} + {m}: {asymptotic_efficiency(b, m):.4f}")
    lines.append("")

    # ---- 2. Ores ----
    lines.append("## 2. Ore Data (isk/m^3 = raw ore price / volume)")
    lines.append("")
    lines.append("| Ore | Volume (m^3) | Variants (isk/m^3) | Avg (isk/m^3) | Min | Max |")
    lines.append("|---|---|---|---:|---:|---:|")
    for name, vol, prices in ORES:
        vals = isk_per_m3_list(name)
        v_str = ", ".join(f"{v:.0f}" for v in vals)
        lines.append(
            f"| {name} | {vol} | {v_str} | {avg_isk_per_m3(name):.0f} | {min(vals):.0f} | {max(vals):.0f} |"
        )
    lines.append("")

    # ---- 3. Formulas ----
    lines.append("## 3. Formulas")
    lines.append("")
    lines.append("- **Cost (ISK)** = booster_cost + N × miner_cost")
    lines.append("- **Rate (m^3/s)** = N × rate_per_miner")
    lines.append("- **Efficiency** = Rate ÷ Cost (m^3/s per M ISK)")
    lines.append("- **Payback time** = Cost ÷ (Rate × ore_value_isk_per_m^3)")
    lines.append("- **With MSI**: net revenue = gross − (35 M ISK ÷ 3600 s) ≈ 9,722 isk/s")
    lines.append("- **MSI break-even ore** = MSI_burn ÷ rate (below this, fleet never pays back while MSI active)")
    lines.append("")

    # ---- 4. Payback table ----
    lines.append("## 4. Fleet Payback Time (minutes) — No MSI")
    lines.append("")
    lines.append("Fleet = 1 booster + N miners.")
    lines.append("")
    ore_order = ["Pyroxeres", "Omber", "Gneiss", "Dark Ochre", "Hedbergite"]
    header = "| Config | N | " + " | ".join(ore_order) + " |"
    lines.append(header)
    lines.append("|---|---:" + "|".join([":---:"] * len(ore_order)) + "|")
    for booster, miner in CONFIGS:
        cname = config_name(booster, miner)
        for n in [1, 2, 4, 6]:
            row = f"| {cname} | {n} |"
            for ore in ore_order:
                isk = avg_isk_per_m3(ore)
                pb = payback_minutes(booster, miner, n, isk, with_msi=False)
                row += f" {'∞' if pb == float('inf') else f'{pb:.0f}'} |"
            lines.append(row)
    lines.append("")

    lines.append("### Payback by N (all ores), representative: Porpoise + Covetor")
    lines.append("")
    lines.append("| Ore (isk/m^3) | N=1 | N=2 | N=3 | N=5 | N=10 | N=15 | N=20 |")
    lines.append("|---|---:|---:|---:|---:|---:|---:|---:|")
    for ore in ore_order:
        isk = avg_isk_per_m3(ore)
        row = f"| {ore} ({isk:.0f}) |"
        for n in NS_ALL:
            pb = payback_minutes("Porpoise", "Covetor", n, isk, with_msi=False)
            row += f" {'∞' if pb == float('inf') else f'{pb:.0f}'} |"
        lines.append(row)
    lines.append("")

    # ---- 5. MSI impact ----
    lines.append("## 5. Mobile Scan Inhibitor (MSI) Impact")
    lines.append("")
    lines.append("MSI cost: 35 M ISK per hour ≈ 9,722 isk/s burn, applied to the whole fleet.")
    lines.append("")
    lines.append(
        "| Config | N | Ore (isk/m^3) | No MSI (m) | With MSI (m) | Extra (m) | MSI break-even (isk/m^3) |"
    )
    lines.append(
        "|---|---:|---:|---:|---:|---:|---:|---:|"
    )
    for booster, miner in CONFIGS:
        cname = config_name(booster, miner)
        for n in DEFAULT_NS:
            for ore in DEFAULT_ORES:
                isk = avg_isk_per_m3(ore)
                no_msi = payback_minutes(booster, miner, n, isk, with_msi=False)
                with_msi = payback_minutes(booster, miner, n, isk, with_msi=True)
                extra = with_msi - no_msi
                be = msi_break_even_isk_per_m3(booster, miner, n)
                no_s = "∞" if no_msi == float("inf") else f"{no_msi:.0f}"
                with_s = "∞" if with_msi == float("inf") else f"{with_msi:.0f}"
                extra_s = "∞" if extra == float("inf") else f"{extra:.0f}"
                lines.append(
                    f"| {cname} | {n} | {ore} ({isk:.0f}) | {no_s} | {with_s} | {extra_s} | {be:.1f} |"
                )
    lines.append("")
    lines.append("### MSI break-even ore values (below this, fleet never pays back while MSI active)")
    lines.append("")
    lines.append("| Config | N=1 | N=6 |")
    lines.append("|---|---:|---:|")
    for booster, miner in CONFIGS:
        cname = config_name(booster, miner)
        row = f"| {cname} |"
        for n in [1, 6]:
            be = msi_break_even_isk_per_m3(booster, miner, n)
            row += f" {be:.1f} |"
        lines.append(row)
    lines.append("")

    # ---- 6. Key findings ----
    lines.append("## 6. Key Findings (Dangerous Space)")
    lines.append("")
    lines.append("- **Best ISK efficiency / safety:** Porpoise + Covetor. Cheapest booster (112 M) + cheapest miner (50 M). Fastest payback, least ISK lost if ganked.")
    lines.append("- **Orca liability:** Orca costs 1110 M (~10× Porpoise). Orca fleets take 2–3× longer to pay back. Only worth it in safe space where you want maximum raw throughput (Orca+Hulk N=6 = 642 m^3/s).")
    lines.append("- **Payback scales ~1/N:** Doubling miners roughly halves payback time; diminishing returns after N≈6–8.")
    lines.append("- **Ore value is the swing factor:** At 50–100 isk/m^3 (Pyroxeres) even the best fleet takes hours to pay back. At 500+ isk/m^3 (Dark Ochre, Gneiss) Porpoise+Covetor N=6 is covered in ~30–40 minutes.")
    lines.append("- **MSI is dangerous on low-value ores:** On Pyroxeres (~93 isk/m^3), Porpoise+Covetor N=1 never pays back with MSI active; N=2 takes ~956 m vs ~263 m without. On high-value ores (Gneiss, Dark Ochre) with N≥4, MSI adds only a few minutes.")
    lines.append("- **Recommended dangerous-space fleet:** Porpoise + Covetor, N=4–6. Minimizes both loss value and exposure window before the fleet pays for itself.")
    lines.append("")

    # ---- 7. Graph output ----
    lines.append("## 7. Graph Output")
    lines.append("")
    lines.append("70 PNG graphs generated at `output/graphs/<ore>/<ore>_N{n}.png` (10 ores × 7 N values: 1, 2, 3, 5, 10, 15, 20).")
    lines.append("All graphs share an identical x-axis scale: 0 to ~3,270 minutes (~54.5 hours).")
    lines.append("Each graph shows cumulative profit (M ISK) vs time for all 4 configs, with a dashed vertical line at payback time.")
    lines.append("")
    lines.append("Ores included: Dark Ochre, Primsaticite, Gneiss, Crokite, Hemorphite, Hedbergite, Omber, Jaspet, Kernite, Pyroxeres.")
    lines.append("")

    lines.append("---")
    lines.append("Source: `~/dev/eve-mining-analysis/` — `pyproject.toml`, `src/eve_mining/`, `data/ores.json`")
    lines.append("Run: `nix-shell` then `python3 -m eve_mining.cli {payback|graphs|msi|summary}`")

    return "\n".join(lines) + "\n"


def generate_summary(out_path: str) -> None:
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    content = build_summary()
    with open(out_path, "w") as f:
        f.write(content)
    print(f"Wrote {out_path}")
