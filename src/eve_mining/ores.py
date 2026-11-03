"""Ore data parsed from ~/Downloads/low_ore.png.

Each entry: (name, volume_m3, [raw ore price per grade variant]).
isk/m^3 = raw_ore_price / volume.
"""

# (name, volume_m3, [raw ore price per grade])
ORES = [
    ("Dark Ochre",     8,   [3980.0, 3978.0, 3800.0, 4399.0]),
    ("Primsaticite",  40,   [43850.0]),
    ("Gneiss",         5,   [2199.0, 3000.0, 2100.0, 2374.0]),
    ("Crokite",       16,   [5000.0, 6100.0, 5100.0, 6000.0]),
    ("Hemorphite",     3,   [1059.0, 649.1, 999.0]),
    ("Hedbergite",     3,   [3400.0, 750.0, 987.0]),
    ("Omber",        0.6,   [123.0, 139.0, 103.3, 148.9]),
    ("Jaspet",         2,   [700.0, 275.3, 450.0, 900.0]),
    ("Kernite",      1.2,   [596.5, 300.0, 500.0, 500.0]),
    ("Pyroxeres",    0.3,   [40.4, 30.0, 27.99, 45.0]),
]


def isk_per_m3_list(name: str) -> list[float]:
    """Return the isk/m^3 values for all grade variants of an ore."""
    for ore_name, vol, prices in ORES:
        if ore_name == name:
            return [p / vol for p in prices]
    raise ValueError(f"Unknown ore: {name}")


def avg_isk_per_m3(name: str) -> float:
    """Average isk/m^3 across grade variants."""
    return sum(isk_per_m3_list(name)) / len(isk_per_m3_list(name))


def ore_names() -> list[str]:
    return [o[0] for o in ORES]


def ore_volume(name: str) -> float:
    for ore_name, vol, _ in ORES:
        if ore_name == name:
            return vol
    raise ValueError(f"Unknown ore: {name}")
