# EVE Mining Analysis

Tools for analyzing EVE Online mining fleet economics: ISK efficiency, payback
time (time until the fleet pays for itself), and the impact of Mobile Scan
Inhibitors (MSI / "portable bush") in dangerous space.

## Project structure

```
eve-mining-analysis/
├── pyproject.toml
├── README.md
├── flake.nix
├── shell.nix
├── src/eve_mining/
│   ├── __init__.py
│   ├── ships.py        # Ship stats (cost, boost rates)
│   ├── ores.py         # Ore data parsed from low_ore.png
│   ├── calculations.py # Payback & efficiency math
│   ├── msi.py          # Mobile Scan Inhibitor impact
│   ├── graphs.py       # Graph generation (PNG)
│   ├── summary.py      # Consolidated Markdown summary
│   ├── data_export.py  # JSON export for eCharts webpage
│   └── cli.py          # Command-line entry point
├── data/ores.json          # Input ore data (parsed from low_ore.png)
└── output/
    ├── graphs/<ore>/<ore>_N{n}.png   # Profit-over-time graphs (70 PNGs)
    ├── data/
    │   ├── ships.json        # Ship/rate metadata
    │   ├── ores.json         # Ore metadata
    │   └── charts/<ore>/<ore>_N{n}.json  # eCharts-ready series (70 JSONs)
    └── SUMMARY.md            # Consolidated data summary
├── web/
│   ├── viewer.html          # standalone eCharts viewer (file:// friendly)
│   ├── calculations.js      # ported EVE mining math (costs, rates, payback)
│   └── echarts.min.js       # eCharts library (~1 MB, local for offline use)
```

## Installation

```bash
cd ~/dev/eve-mining-analysis
pip install -e .
```

A Nix shell is also provided (`nix-shell`) with python3, pip, matplotlib, and
numpy, and sets `PYTHONPATH` to `src/`.

## Usage

```bash
# Payback table (minutes) for all configs × N × ore
python3 -m eve_mining.cli payback --n 6 --ore Gneiss

# Generate PNG graphs (one per ore × N, consistent time scale)
python3 -m eve_mining.cli graphs --out output/graphs

# MSI impact table (payback with/without Mobile Scan Inhibitor)
python3 -m eve_mining.cli msi

# Generate consolidated Markdown summary
python3 -m eve_mining.cli summary --out output/SUMMARY.md

# Export JSON data for an eCharts-powered webpage
python3 -m eve_mining.cli data --charts-out output/data/charts --meta-out output/data
```

## Supported ships

Boosters (cost in M ISK): Orca (1110), Porpoise (112)

Miners (cost in M ISK): Covetor (50), Hulk (213), Pioneer (6.85), Alpha Pioneer
(6.85), Venture (2.27), Alpha Venture (2.27)

Mining rates (m³/s per miner) are stored per (booster, miner) pair — see
`output/data/ships.json`.

## Key formulas

- **Cost (ISK)** = booster_cost + N × miner_cost
- **Rate (m³/s)** = N × rate_per_miner
- **Efficiency** = Rate ÷ Cost (m³/s per M ISK)
- **Payback time** = Cost ÷ (Rate × ore_value_isk_per_m³)
- **With MSI**: net revenue = gross − (35 M ISK ÷ 3600 s ≈ 9,722 isk/s)

## eCharts webpage data

Run `python3 -m eve_mining.cli data` to emit:

- `output/data/ships.json` — booster/miner costs, rates, and config list
- `output/data/ores.json` — per-ore volume, grade variants, avg/min/max isk/m³
- `output/data/charts/<ore>/<ore>_N{n}.json` — for each ore and fleet size N:
  a `series` array (one entry per config) with `data: [[time_min, profit_M], ...]`
  and a `markLine` at the payback time. All charts share a consistent x-axis
  (`x_max_minutes`) so they're directly comparable.

Feed these into eCharts with a `line` series per config, `xAxis: time` (minutes),
`yAxis: value` (M ISK profit), and the embedded `markLine` for payback.

## Findings (from `low_ore.png`)

- **Porpoise + Covetor (N=4–6)** is the safest fleet for dangerous space:
  cheapest to field, fastest to pay back, least ISK lost if ganked.
- **Orca fleets** take 2–3× longer to pay back; only worth it in safe space
  where you want maximum raw throughput.
- **MSI** can double payback on low-value ores / small fleets, and makes
  payback infinite when gross revenue < 35M/hour burn (~20–135 isk/m³
  depending on fleet size).
- **Venture / Pioneer** frigates have excellent asymptotic efficiency but are
  limited in practice to N=1–2 per character.

## Output

All generated artifacts live in `output/`:

- `output/graphs/<ore>/<ore>_N{n}.png` — profit-over-time graphs (70 PNGs)
- `output/data/charts/<ore>/<ore>_N{n}.json` — eCharts-ready series (70 JSONs)
- `output/data/ships.json` — ship/rate metadata
- `output/data/ores.json` — ore metadata
- `output/SUMMARY.md` — complete consolidated data summary

## Web viewer (`web/viewer.html` + `web/calculations.js` + `web/echarts.min.js`)

Open `web/viewer.html` directly in a browser — no server and no network needed. All math runs client-side in `web/calculations.js` (ported from `src/eve_mining/`), and eCharts renders the charts:

- Pick an ore (or override its isk/m³), toggle MSI on/off
- Build a fleet by adding rows: booster, miner, count (N) — mix and match any combination
- Each row plots its own payback curve; a combined "COMBINED fleet" curve sums cost + rate across all rows
- Dashed vertical lines mark each fleet's payback time; all charts share a consistent x-axis
- Hover for exact time/profit values

Regenerate nothing — edit `web/calculations.js` if you want to change ship costs, rates, or ore values.
