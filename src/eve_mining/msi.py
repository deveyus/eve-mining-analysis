"""Mobile Scan Inhibitor (MSI / 'portable bush') impact analysis."""

from __future__ import annotations

from .calculations import (
    payback_minutes, msi_break_even_isk_per_m3, MSI_BURN_ISK_PER_S,
)
from .ships import config_name, CONFIGS
from .ores import avg_isk_per_m3, ore_names

DEFAULT_ORES = ["Pyroxeres", "Omber", "Gneiss", "Dark Ochre", "Hedbergite"]
DEFAULT_NS = [1, 2, 4, 6]


def msi_table(ores: list[str] | None = None,
              ns: list[int] | None = None) -> list[dict]:
    """Build a table of payback times with and without MSI."""
    ores = ores or DEFAULT_ORES
    ns = ns or DEFAULT_NS
    rows = []
    for ore in ores:
        isk = avg_isk_per_m3(ore)
        for booster, miner in CONFIGS:
            for n in ns:
                no_msi = payback_minutes(booster, miner, n, isk, with_msi=False)
                with_msi = payback_minutes(booster, miner, n, isk, with_msi=True)
                rows.append({
                    "ore": ore,
                    "isk_m3": isk,
                    "config": config_name(booster, miner),
                    "n": n,
                    "no_msi_min": no_msi,
                    "with_msi_min": with_msi,
                    "extra_min": with_msi - no_msi,
                    "break_even_isk_m3": msi_break_even_isk_per_m3(booster, miner, n),
                })
    return rows


def print_table(ores: list[str] | None = None,
                ns: list[int] | None = None) -> None:
    rows = msi_table(ores, ns)
    print(f"{'Config':<12}{'N':>3} | {'ore':<14} {'noMSI':>7} {'withMSI':>7} {'extra':>7}  (minutes)")
    print("-" * 72)
    current_ore = None
    for row in rows:
        if row["ore"] != current_ore:
            current_ore = row["ore"]
            print()
        a = row["no_msi_min"]
        b = row["with_msi_min"]
        extra = row["extra_min"]
        a_s = f"{a:>7.0f}" if a != float("inf") else "   inf"
        b_s = f"{b:>7.0f}" if b != float("inf") else "   inf"
        e_s = f"{extra:>7.0f}" if extra != float("inf") else "   inf"
        print(f"{row['config']:<12}{row['n']:>3} | {row['ore']:<14} {a_s} {b_s} {e_s}")

    print("\n=== ore isk/m^3 where MSI burn == gross rev (net=0, never pays back) ===")
    seen = set()
    for row in rows:
        key = (row["config"], row["n"])
        if key in seen:
            continue
        seen.add(key)
        print(f"  {row['config']} N={row['n']}: {row['break_even_isk_m3']:.1f} isk/m^3")
