"""Graph generation: profit-over-time curves per ore, per fleet size N."""

from __future__ import annotations

import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

from .ships import fleet_cost, fleet_rate, config_name, CONFIGS
from .calculations import payback_minutes, MSI_BURN_ISK_PER_S
from .ores import avg_isk_per_m3, isk_per_m3_list, ore_volume, ore_names

# Consistent colors per config
COLORS = {
    "Orca + Covetor": "#1f77b4",
    "Orca + Hulk": "#ff7f0e",
    "Porpoise + Covetor": "#2ca02c",
    "Porpoise + Hulk": "#d62728",
    "Orca + Pioneer": "#9467bd",
    "Porpoise + Pioneer": "#8c564b",
    "Orca + Alpha Pioneer": "#e377c2",
    "Porpoise + Alpha Pioneer": "#7f7f7f",
    "Orca + Venture": "#bcbd22",
    "Porpoise + Venture": "#17becf",
    "Orca + Alpha Venture": "#aec7e8",
    "Porpoise + Alpha Venture": "#ffbb78",
}

DEFAULT_NS = [1, 2, 3, 5, 10, 15, 20]


def _global_time_scale(ores: list[str], ns: list[int]) -> float:
    """Largest payback (using the cheapest ore variant) across all configs/N."""
    max_pb = 0.0
    for ore in ores:
        low = min(isk_per_m3_list(ore))
        for booster, miner in CONFIGS:
            for n in ns:
                pb = payback_minutes(booster, miner, n, low, with_msi=False)
                if pb > max_pb:
                    max_pb = pb
    return max_pb * 1.25


def generate_graphs(out_dir: str = "output/graphs",
                    ores: list[str] | None = None,
                    ns: list[int] | None = None,
                    xmax_minutes: float | None = None) -> None:
    """Generate profit-over-time PNGs: one per (ore, N)."""
    ores = ores or ore_names()
    ns = ns or DEFAULT_NS
    os.makedirs(out_dir, exist_ok=True)

    if xmax_minutes is None:
        xmax = _global_time_scale(ores, ns)
    else:
        xmax = xmax_minutes

    print(f"Global consistent time scale: 0 to {xmax:.0f} minutes")

    for ore in ores:
        vol = ore_volume(ore)
        isk_m3 = avg_isk_per_m3(ore)
        vals = isk_per_m3_list(ore)
        isk_min, isk_max = min(vals), max(vals)
        slug = ore.lower().replace(" ", "_")
        ore_dir = os.path.join(out_dir, slug)
        os.makedirs(ore_dir, exist_ok=True)

        for n in ns:
            fig, ax = plt.subplots(figsize=(10, 6))
            y_max = 0.0
            for booster, miner in CONFIGS:
                cname = config_name(booster, miner)
                cost = fleet_cost(booster, miner, n)
                rate = fleet_rate(booster, miner, n)
                rev_per_min = rate * isk_m3 * 60.0
                t = np.linspace(0, xmax, 400)
                profit = rev_per_min * t - cost
                ax.plot(t, profit / 1e6, label=cname, color=COLORS[cname],
                        linewidth=2.2)
                pb = payback_minutes(booster, miner, n, isk_m3, with_msi=False)
                ax.axvline(pb, color=COLORS[cname], linestyle="--",
                           alpha=0.5, linewidth=1.3)
                y_top = max(0.05, (profit.max() / 1e6) * 0.5)
                ax.annotate(f"pb {pb:.0f}m", xy=(pb, 0),
                            xytext=(pb, y_top),
                            textcoords="data", fontsize=8, color=COLORS[cname],
                            rotation=90, va="center", ha="right",
                            arrowprops=dict(arrowstyle="-",
                                            color=COLORS[cname], alpha=0.35))
                y_max = max(y_max, profit.max() / 1e6)
            ax.axhline(0, color="k", linewidth=0.8, alpha=0.6)
            ax.set_xlabel("Time (minutes)")
            ax.set_ylabel("Cumulative profit (M ISK)")
            ax.set_title(
                f"{ore} (vol {vol} m³) isk/m³: {isk_m3:.0f} [{isk_min:.0f}–{isk_max:.0f}] | N={n} miners"
            )
            ax.grid(True, alpha=0.3)
            ax.legend(fontsize=9, loc="upper left")
            ax.set_xlim(0, xmax)
            ax.set_ylim(bottom=-cost / 1e6 * 0.15, top=y_max * 1.12)

            out = os.path.join(ore_dir, f"{slug}_N{n}.png")
            fig.tight_layout()
            fig.savefig(out, dpi=150)
            plt.close(fig)
            print(f"saved {out}")
