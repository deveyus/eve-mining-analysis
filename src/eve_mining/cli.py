"""CLI entry point for eve-mining-analysis."""

from __future__ import annotations

import argparse
import sys

from .ships import CONFIGS, config_name, fleet_cost, fleet_rate, efficiency
from .calculations import payback_minutes, asymptotic_efficiency, MSI_BURN_ISK_PER_S
from .ores import ore_names, avg_isk_per_m3
from .msi import print_table
from .graphs import generate_graphs
from .summary import generate_summary
from .data_export import export_charts, export_metadata


def cmd_payback(args: argparse.Namespace) -> None:
    ns = args.n or [1, 2, 4, 6, 8]
    ores = args.ore or ["Pyroxeres", "Omber", "Gneiss", "Dark Ochre", "Hedbergite"]
    print(f"{'Config':<14}{'N':>4} | " + " | ".join(f"{o:>8}" for o in ores) + "  (isk/m^3)")
    print("-" * 70)
    for booster, miner in CONFIGS:
        for n in ns:
            row = f"{config_name(booster, miner):<14}{n:>4} | "
            cells = []
            for ore in ores:
                isk = avg_isk_per_m3(ore)
                pb = payback_minutes(booster, miner, n, isk)
                cells.append(f"{pb:>8.0f}m" if pb != float("inf") else "   inf  ")
            row += " | ".join(cells)
            print(row)
        print()


def cmd_graphs(args: argparse.Namespace) -> None:
    generate_graphs(out_dir=args.out, ns=args.n)


def cmd_msi(args: argparse.Namespace) -> None:
    print_table()


def cmd_summary(args: argparse.Namespace) -> None:
    generate_summary(args.out)


def cmd_data(args: argparse.Namespace) -> None:
    export_charts(out_dir=args.charts_out)
    export_metadata(out_dir=args.meta_out)


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="eve-mining",
                                description="EVE mining fleet economics")
    sub = p.add_subparsers(dest="command", required=True)

    p_pay = sub.add_parser("payback", help="Print payback table")
    p_pay.add_argument("--n", type=int, nargs="+")
    p_pay.add_argument("--ore", type=str, nargs="+")
    p_pay.set_defaults(func=cmd_payback)

    p_g = sub.add_parser("graphs", help="Generate profit-over-time graphs")
    p_g.add_argument("--out", default="output/graphs")
    p_g.add_argument("--n", type=int, nargs="+",
                     default=[1, 2, 3, 5, 10, 15, 20])
    p_g.set_defaults(func=cmd_graphs)

    p_m = sub.add_parser("msi", help="MSI impact analysis")
    p_m.set_defaults(func=cmd_msi)

    p_s = sub.add_parser("summary", help="Generate consolidated data summary")
    p_s.add_argument("--out", default="output/SUMMARY.md")
    p_s.set_defaults(func=cmd_summary)

    p_d = sub.add_parser("data", help="Export JSON data for eCharts webpage")
    p_d.add_argument("--charts-out", default="output/data/charts")
    p_d.add_argument("--meta-out", default="output/data")
    p_d.add_argument("--n", type=int, nargs="+",
                     default=[1, 2, 3, 5, 10, 15, 20])
    p_d.set_defaults(func=cmd_data)

    return p


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    args.func(args)
    return 0


if __name__ == "__main__":
    sys.exit(main())
