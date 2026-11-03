"""Export analysis data to JSON for eCharts-powered web visualization."""

from __future__ import annotations

import json
import math
import os

from .ships import fleet_cost, fleet_rate, config_name, CONFIGS, BOOSTERS, MINERS, BOOSTER_COST, MINER_COST, MINING_RATE
from .calculations import payback_minutes
from .ores import ORES, ore_volume, avg_isk_per_m3, isk_per_m3_list

DEFAULT_NS = [1, 2, 3, 5, 10, 15, 20]


def _series_points(booster, miner, n, isk_per_m3, x_max_minutes, steps=200):
    """Build [time_min, profit_M] points for a config."""
    cost = fleet_cost(booster, miner, n)
    rate = fleet_rate(booster, miner, n)
    rev_per_min = rate * isk_per_m3 * 60.0  # isk/min
    cost_M = cost / 1e6

    points = []
    # Include payback point precisely, plus start/end
    pb = payback_minutes(booster, miner, n, isk_per_m3, with_msi=False)
    pb_finite = math.isfinite(pb)

    # Build time samples
    times = [0.0]
    if pb_finite and 0 < pb < x_max_minutes:
        times.append(pb)
    # linear samples
    for i in range(1, steps + 1):
        t = x_max_minutes * i / steps
        if pb_finite and abs(t - pb) < 1e-6:
            continue
        times.append(t)
    times = sorted(set(times))
    times = [t for t in times if t <= x_max_minutes + 1e-9]

    for t in times:
        profit_M = (rev_per_min * t - cost) / 1e6
        points.append([round(t, 2), round(profit_M, 2)])

    return points, cost_M, (pb if pb_finite else None)


def export_charts(out_dir: str = "output/data/charts",
                  ns: list[int] | None = None,
                  ores: list[str] | None = None) -> None:
    """Write one JSON per (ore, N) containing all config series for eCharts."""
    ns = ns or DEFAULT_NS
    ores = ores or [o[0] for o in ORES]
    os.makedirs(out_dir, exist_ok=True)

    # Global consistent x-axis max (using cheapest ore variant for worst case)
    global_max = 0.0
    for ore_name in ores:
        low = min(isk_per_m3_list(ore_name))
        for booster, miner in CONFIGS:
            for n in ns:
                pb = payback_minutes(booster, miner, n, low, with_msi=False)
                if math.isfinite(pb) and pb > global_max:
                    global_max = pb
    x_max = global_max * 1.25 if global_max > 0 else 600.0

    for ore_name in ores:
        vol = ore_volume(ore_name)
        isk_m3 = avg_isk_per_m3(ore_name)
        vals = isk_per_m3_list(ore_name)

        for n in ns:
            series = []
            y_max = 0.0
            for booster, miner in CONFIGS:
                points, cost_M, pb = _series_points(
                    booster, miner, n, isk_m3, x_max
                )
                if not points:
                    continue
                y_max = max(y_max, max(p[1] for p in points))
                entry = {
                    "name": config_name(booster, miner),
                    "type": "line",
                    "data": points,
                }
                if pb is not None:
                    entry["markLine"] = {
                        "silent": True,
                        "data": [
                            {
                                "xAxis": round(pb, 2),
                                "label": {
                                    "formatter": "payback {:.0f}m".format(pb),
                                    "position": "insideStartTop",
                                },
                                "lineStyle": {"type": "dashed"},
                            }
                        ],
                    }
                series.append(entry)

            payload = {
                "ore": ore_name,
                "volume_m3": vol,
                "isk_per_m3": round(isk_m3, 2),
                "isk_per_m3_min": round(min(vals), 2),
                "isk_per_m3_max": round(max(vals), 2),
                "n_miners": n,
                "x_max_minutes": round(x_max, 2),
                "y_max_M": round(y_max * 1.12, 2),
                "series": series,
            }

            slug = ore_name.lower().replace(" ", "_")
            ore_dir = os.path.join(out_dir, slug)
            os.makedirs(ore_dir, exist_ok=True)
            out = os.path.join(ore_dir, "{}_N{}.json".format(slug, n))
            with open(out, "w") as f:
                json.dump(payload, f, indent=2)
            print("wrote {}".format(out))

    print("Global x-axis scale: 0 to {:.0f} minutes".format(x_max))


def export_metadata(out_dir: str = "output/data") -> None:
    """Write ships.json and ores.json metadata."""
    os.makedirs(out_dir, exist_ok=True)

    ships = {
        "boosters": {b: BOOSTER_COST[b] for b in BOOSTERS},
        "miners": {m: MINER_COST[m] for m in MINERS},
        "rates": {"{}|{}".format(b, m): r for (b, m), r in MINING_RATE.items()},
        "configs": [{"booster": b, "miner": m, "name": config_name(b, m)}
                    for b, m in CONFIGS],
    }
    with open(os.path.join(out_dir, "ships.json"), "w") as f:
        json.dump(ships, f, indent=2)
    print("wrote {}/ships.json".format(out_dir))

    ores_meta = []
    for name, vol, prices in ORES:
        vals = isk_per_m3_list(name)
        ores_meta.append({
            "name": name,
            "volume_m3": vol,
            "raw_prices": prices,
            "isk_per_m3": {str(i): round(v, 2) for i, v in enumerate(vals)},
            "avg_isk_per_m3": round(avg_isk_per_m3(name), 2),
            "min_isk_per_m3": round(min(vals), 2),
            "max_isk_per_m3": round(max(vals), 2),
        })
    with open(os.path.join(out_dir, "ores.json"), "w") as f:
        json.dump(ores_meta, f, indent=2)
    print("wrote {}/ores.json".format(out_dir))
