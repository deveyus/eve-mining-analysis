"""Core payback and efficiency calculations."""

from __future__ import annotations

from .ores import avg_isk_per_m3, ore_volume, isk_per_m3_list
from .ships import fleet_cost, fleet_rate, efficiency, config_name, CONFIGS

# MSI: 35 M ISK per hour burn
MSI_COST_ISK = 35e6
MSI_DURATION_S = 3600.0
MSI_BURN_ISK_PER_S = MSI_COST_ISK / MSI_DURATION_S


def payback_seconds(booster: str, miner: str, n_miners: int,
                    isk_per_m3: float, with_msi: bool = False) -> float:
    """Seconds for the fleet to pay for itself.

    Returns float('inf') if net revenue <= 0 (never pays back).
    """
    cost = fleet_cost(booster, miner, n_miners)
    gross = fleet_rate(booster, miner, n_miners) * isk_per_m3  # isk/s
    net = gross - (MSI_BURN_ISK_PER_S if with_msi else 0.0)
    if net <= 0:
        return float("inf")
    return cost / net


def payback_minutes(*args, **kwargs) -> float:
    return payback_seconds(*args, **kwargs) / 60.0


def msi_break_even_isk_per_m3(booster: str, miner: str, n_miners: int) -> float:
    """Ore value (isk/m^3) at which MSI burn equals gross revenue.

    Below this, net revenue <= 0 and the fleet never pays back while MSI active.
    """
    rate = fleet_rate(booster, miner, n_miners)
    return MSI_BURN_ISK_PER_S / rate


def asymptotic_efficiency(booster: str, miner: str) -> float:
    """Efficiency as N -> inf: rate / miner_cost (m^3/s per M ISK)."""
    from .ships import MINING_RATE, MINER_COST
    return MINING_RATE[(booster, miner)] / MINER_COST[miner]
