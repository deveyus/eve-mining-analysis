"""Ship statistics for EVE mining boosters and miners.

All costs in millions of ISK. Rates in m^3/s per miner with the given booster.
"""

# Booster cost (M ISK)
BOOSTER_COST = {
    "Orca": 1110.0,
    "Porpoise": 112.0,
}

# Miner cost (M ISK)
MINER_COST = {
    "Covetor": 50.0,
    "Hulk": 213.0,
    "Pioneer": 6.85,
    "Alpha Pioneer": 6.85,
    "Venture": 2.27,
    "Alpha Venture": 2.27,
}

# Mining rate (m^3/s) per miner for (booster, miner)
MINING_RATE = {
    ("Orca", "Hulk"): 107.0,
    ("Porpoise", "Hulk"): 97.1,
    ("Orca", "Covetor"): 79.2,
    ("Porpoise", "Covetor"): 71.9,
    ("Orca", "Pioneer"): 26.6,
    ("Porpoise", "Pioneer"): 24.2,
    ("Orca", "Alpha Pioneer"): 15.8,
    ("Porpoise", "Alpha Pioneer"): 14.4,
    ("Orca", "Venture"): 18.1,
    ("Porpoise", "Venture"): 16.5,
    ("Orca", "Alpha Venture"): 12.9,
    ("Porpoise", "Alpha Venture"): 11.7,
}

BOOSTERS = list(BOOSTER_COST.keys())
MINERS = list(MINER_COST.keys())

CONFIGS = [
    (b, m) for b in BOOSTERS for m in MINERS
]

def fleet_cost(booster: str, miner: str, n_miners: int) -> float:
    """Total fleet cost in ISK (1 booster + n miners)."""
    return (BOOSTER_COST[booster] + n_miners * MINER_COST[miner]) * 1e6

def fleet_rate(booster: str, miner: str, n_miners: int) -> float:
    """Total fleet mining rate in m^3/s."""
    return n_miners * MINING_RATE[(booster, miner)]

def efficiency(booster: str, miner: str, n_miners: int) -> float:
    """ISK efficiency: m^3/s per M ISK."""
    return fleet_rate(booster, miner, n_miners) / (fleet_cost(booster, miner, n_miners) / 1e6)

def config_name(booster: str, miner: str) -> str:
    return f"{booster} + {miner}"
