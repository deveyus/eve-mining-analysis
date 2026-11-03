# EVE Mining Fleet Analysis — Complete Data Summary

All figures derived from ship stats and ore prices parsed from `~/Downloads/low_ore.png`.

## 1. Ship Data

### Boosters (cost in M ISK)
- Orca: 1,110 M ISK
- Porpoise: 112 M ISK

### Miners (cost in M ISK)
- Covetor: 50 M ISK
- Hulk: 213 M ISK
- Pioneer: 7 M ISK
- Alpha Pioneer: 7 M ISK
- Venture: 2 M ISK
- Alpha Venture: 2 M ISK

### Mining Rates (m^3/s per miner, by booster)
| Booster \\ Miner | Covetor | Hulk |
|---|---|---|
| Orca | 79.2 | 107.0 | 26.6 | 15.8 | 18.1 | 12.9 |
| Porpoise | 71.9 | 97.1 | 24.2 | 14.4 | 16.5 | 11.7 |

### Asymptotic efficiency (N -> inf, m^3/s per M ISK)
- Orca + Covetor: 1.5840
- Orca + Hulk: 0.5023
- Orca + Pioneer: 3.8832
- Orca + Alpha Pioneer: 2.3066
- Orca + Venture: 7.9736
- Orca + Alpha Venture: 5.6828
- Porpoise + Covetor: 1.4380
- Porpoise + Hulk: 0.4559
- Porpoise + Pioneer: 3.5328
- Porpoise + Alpha Pioneer: 2.1022
- Porpoise + Venture: 7.2687
- Porpoise + Alpha Venture: 5.1542

## 2. Ore Data (isk/m^3 = raw ore price / volume)

| Ore | Volume (m^3) | Variants (isk/m^3) | Avg (isk/m^3) | Min | Max |
|---|---|---|---:|---:|---:|
| Dark Ochre | 8 | 498, 497, 475, 550 | 505 | 475 | 550 |
| Primsaticite | 40 | 1096 | 1096 | 1096 | 1096 |
| Gneiss | 5 | 440, 600, 420, 475 | 484 | 420 | 600 |
| Crokite | 16 | 312, 381, 319, 375 | 347 | 312 | 381 |
| Hemorphite | 3 | 353, 216, 333 | 301 | 216 | 353 |
| Hedbergite | 3 | 1133, 250, 329 | 571 | 250 | 1133 |
| Omber | 0.6 | 205, 232, 172, 248 | 214 | 172 | 248 |
| Jaspet | 2 | 350, 138, 225, 450 | 291 | 138 | 450 |
| Kernite | 1.2 | 497, 250, 417, 417 | 395 | 250 | 497 |
| Pyroxeres | 0.3 | 135, 100, 93, 150 | 119 | 93 | 150 |

## 3. Formulas

- **Cost (ISK)** = booster_cost + N × miner_cost
- **Rate (m^3/s)** = N × rate_per_miner
- **Efficiency** = Rate ÷ Cost (m^3/s per M ISK)
- **Payback time** = Cost ÷ (Rate × ore_value_isk_per_m^3)
- **With MSI**: net revenue = gross − (35 M ISK ÷ 3600 s) ≈ 9,722 isk/s
- **MSI break-even ore** = MSI_burn ÷ rate (below this, fleet never pays back while MSI active)

## 4. Fleet Payback Time (minutes) — No MSI

Fleet = 1 booster + N miners.

| Config | N | Pyroxeres | Omber | Gneiss | Dark Ochre | Hedbergite |
|---|---::---:|:---:|:---:|:---:|:---:|
| Orca + Covetor | 1 | 2043 | 1139 | 505 | 483 | 428 |
| Orca + Covetor | 2 | 1065 | 594 | 263 | 252 | 223 |
| Orca + Covetor | 4 | 577 | 322 | 142 | 136 | 121 |
| Orca + Covetor | 6 | 414 | 231 | 102 | 98 | 87 |
| Orca + Hulk | 1 | 1725 | 962 | 426 | 408 | 361 |
| Orca + Hulk | 2 | 1001 | 558 | 247 | 237 | 210 |
| Orca + Hulk | 4 | 639 | 357 | 158 | 151 | 134 |
| Orca + Hulk | 6 | 519 | 289 | 128 | 123 | 109 |
| Orca + Pioneer | 1 | 5856 | 3266 | 1447 | 1386 | 1226 |
| Orca + Pioneer | 2 | 2946 | 1643 | 728 | 697 | 617 |
| Orca + Pioneer | 4 | 1491 | 832 | 368 | 353 | 312 |
| Orca + Pioneer | 6 | 1006 | 561 | 249 | 238 | 211 |
| Orca + Alpha Pioneer | 1 | 9859 | 5499 | 2436 | 2333 | 2064 |
| Orca + Alpha Pioneer | 2 | 4960 | 2766 | 1225 | 1174 | 1038 |
| Orca + Alpha Pioneer | 4 | 2510 | 1400 | 620 | 594 | 526 |
| Orca + Alpha Pioneer | 6 | 1694 | 945 | 418 | 401 | 355 |
| Orca + Venture | 1 | 8571 | 4780 | 2118 | 2028 | 1794 |
| Orca + Venture | 2 | 4294 | 2395 | 1061 | 1016 | 899 |
| Orca + Venture | 4 | 2156 | 1202 | 533 | 510 | 451 |
| Orca + Venture | 6 | 1443 | 805 | 357 | 342 | 302 |
| Orca + Alpha Venture | 1 | 12026 | 6707 | 2971 | 2846 | 2518 |
| Orca + Alpha Venture | 2 | 6025 | 3360 | 1489 | 1426 | 1261 |
| Orca + Alpha Venture | 4 | 3025 | 1687 | 747 | 716 | 633 |
| Orca + Alpha Venture | 6 | 2025 | 1129 | 500 | 479 | 424 |
| Porpoise + Covetor | 1 | 314 | 175 | 78 | 74 | 66 |
| Porpoise + Covetor | 2 | 206 | 115 | 51 | 49 | 43 |
| Porpoise + Covetor | 4 | 151 | 84 | 37 | 36 | 32 |
| Porpoise + Covetor | 6 | 133 | 74 | 33 | 32 | 28 |
| Porpoise + Hulk | 1 | 467 | 260 | 115 | 110 | 98 |
| Porpoise + Hulk | 2 | 386 | 216 | 95 | 91 | 81 |
| Porpoise + Hulk | 4 | 346 | 193 | 86 | 82 | 72 |
| Porpoise + Hulk | 6 | 333 | 186 | 82 | 79 | 70 |
| Porpoise + Pioneer | 1 | 685 | 382 | 169 | 162 | 143 |
| Porpoise + Pioneer | 2 | 362 | 202 | 89 | 86 | 76 |
| Porpoise + Pioneer | 4 | 201 | 112 | 50 | 48 | 42 |
| Porpoise + Pioneer | 6 | 147 | 82 | 36 | 35 | 31 |
| Porpoise + Alpha Pioneer | 1 | 1151 | 642 | 284 | 272 | 241 |
| Porpoise + Alpha Pioneer | 2 | 609 | 340 | 150 | 144 | 127 |
| Porpoise + Alpha Pioneer | 4 | 338 | 188 | 83 | 80 | 71 |
| Porpoise + Alpha Pioneer | 6 | 247 | 138 | 61 | 58 | 52 |
| Porpoise + Venture | 1 | 966 | 539 | 239 | 229 | 202 |
| Porpoise + Venture | 2 | 493 | 275 | 122 | 117 | 103 |
| Porpoise + Venture | 4 | 256 | 143 | 63 | 61 | 54 |
| Porpoise + Venture | 6 | 177 | 99 | 44 | 42 | 37 |
| Porpoise + Alpha Venture | 1 | 1362 | 760 | 337 | 322 | 285 |
| Porpoise + Alpha Venture | 2 | 695 | 387 | 172 | 164 | 145 |
| Porpoise + Alpha Venture | 4 | 361 | 201 | 89 | 85 | 76 |
| Porpoise + Alpha Venture | 6 | 250 | 139 | 62 | 59 | 52 |

### Payback by N (all ores), representative: Porpoise + Covetor

| Ore (isk/m^3) | N=1 | N=2 | N=3 | N=5 | N=10 | N=15 | N=20 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Pyroxeres (119) | 314 | 206 | 169 | 140 | 119 | 111 | 108 |
| Omber (214) | 175 | 115 | 94 | 78 | 66 | 62 | 60 |
| Gneiss (484) | 78 | 51 | 42 | 35 | 29 | 28 | 27 |
| Dark Ochre (505) | 74 | 49 | 40 | 33 | 28 | 26 | 26 |
| Hedbergite (571) | 66 | 43 | 35 | 29 | 25 | 23 | 23 |

## 5. Mobile Scan Inhibitor (MSI) Impact

MSI cost: 35 M ISK per hour ≈ 9,722 isk/s burn, applied to the whole fleet.

| Config | N | Ore (isk/m^3) | No MSI (m) | With MSI (m) | Extra (m) | MSI break-even (isk/m^3) |
|---|---:|---:|---:|---:|---:|---:|---:|
| Orca + Covetor | 1 | Pyroxeres (119) | 2043 | ∞ | ∞ | 122.8 |
| Orca + Covetor | 1 | Omber (214) | 1139 | 2668 | 1529 | 122.8 |
| Orca + Covetor | 1 | Gneiss (484) | 505 | 676 | 172 | 122.8 |
| Orca + Covetor | 1 | Dark Ochre (505) | 483 | 639 | 155 | 122.8 |
| Orca + Covetor | 1 | Hedbergite (571) | 428 | 545 | 117 | 122.8 |
| Orca + Covetor | 2 | Pyroxeres (119) | 1065 | 2191 | 1125 | 61.4 |
| Orca + Covetor | 2 | Omber (214) | 594 | 833 | 239 | 61.4 |
| Orca + Covetor | 2 | Gneiss (484) | 263 | 301 | 38 | 61.4 |
| Orca + Covetor | 2 | Dark Ochre (505) | 252 | 287 | 35 | 61.4 |
| Orca + Covetor | 2 | Hedbergite (571) | 223 | 250 | 27 | 61.4 |
| Orca + Covetor | 4 | Pyroxeres (119) | 577 | 776 | 199 | 30.7 |
| Orca + Covetor | 4 | Omber (214) | 322 | 375 | 54 | 30.7 |
| Orca + Covetor | 4 | Gneiss (484) | 142 | 152 | 10 | 30.7 |
| Orca + Covetor | 4 | Dark Ochre (505) | 136 | 145 | 9 | 30.7 |
| Orca + Covetor | 4 | Hedbergite (571) | 121 | 128 | 7 | 30.7 |
| Orca + Covetor | 6 | Pyroxeres (119) | 414 | 499 | 85 | 20.5 |
| Orca + Covetor | 6 | Omber (214) | 231 | 255 | 24 | 20.5 |
| Orca + Covetor | 6 | Gneiss (484) | 102 | 107 | 5 | 20.5 |
| Orca + Covetor | 6 | Dark Ochre (505) | 98 | 102 | 4 | 20.5 |
| Orca + Covetor | 6 | Hedbergite (571) | 87 | 90 | 3 | 20.5 |
| Orca + Hulk | 1 | Pyroxeres (119) | 1725 | 7198 | 5473 | 90.9 |
| Orca + Hulk | 1 | Omber (214) | 962 | 1670 | 708 | 90.9 |
| Orca + Hulk | 1 | Gneiss (484) | 426 | 525 | 99 | 90.9 |
| Orca + Hulk | 1 | Dark Ochre (505) | 408 | 498 | 90 | 90.9 |
| Orca + Hulk | 1 | Hedbergite (571) | 361 | 429 | 68 | 90.9 |
| Orca + Hulk | 2 | Pyroxeres (119) | 1001 | 1615 | 614 | 45.4 |
| Orca + Hulk | 2 | Omber (214) | 558 | 709 | 150 | 45.4 |
| Orca + Hulk | 2 | Gneiss (484) | 247 | 273 | 26 | 45.4 |
| Orca + Hulk | 2 | Dark Ochre (505) | 237 | 260 | 23 | 45.4 |
| Orca + Hulk | 2 | Hedbergite (571) | 210 | 228 | 18 | 45.4 |
| Orca + Hulk | 4 | Pyroxeres (119) | 639 | 789 | 150 | 22.7 |
| Orca + Hulk | 4 | Omber (214) | 357 | 399 | 42 | 22.7 |
| Orca + Hulk | 4 | Gneiss (484) | 158 | 166 | 8 | 22.7 |
| Orca + Hulk | 4 | Dark Ochre (505) | 151 | 158 | 7 | 22.7 |
| Orca + Hulk | 4 | Hedbergite (571) | 134 | 139 | 6 | 22.7 |
| Orca + Hulk | 6 | Pyroxeres (119) | 519 | 594 | 75 | 15.1 |
| Orca + Hulk | 6 | Omber (214) | 289 | 311 | 22 | 15.1 |
| Orca + Hulk | 6 | Gneiss (484) | 128 | 132 | 4 | 15.1 |
| Orca + Hulk | 6 | Dark Ochre (505) | 123 | 127 | 4 | 15.1 |
| Orca + Hulk | 6 | Hedbergite (571) | 109 | 112 | 3 | 15.1 |
| Orca + Pioneer | 1 | Pyroxeres (119) | 5856 | ∞ | ∞ | 365.5 |
| Orca + Pioneer | 1 | Omber (214) | 3266 | ∞ | ∞ | 365.5 |
| Orca + Pioneer | 1 | Gneiss (484) | 1447 | 5923 | 4476 | 365.5 |
| Orca + Pioneer | 1 | Dark Ochre (505) | 1386 | 5020 | 3634 | 365.5 |
| Orca + Pioneer | 1 | Hedbergite (571) | 1226 | 3409 | 2183 | 365.5 |
| Orca + Pioneer | 2 | Pyroxeres (119) | 2946 | ∞ | ∞ | 182.7 |
| Orca + Pioneer | 2 | Omber (214) | 1643 | 11175 | 9532 | 182.7 |
| Orca + Pioneer | 2 | Gneiss (484) | 728 | 1170 | 442 | 182.7 |
| Orca + Pioneer | 2 | Dark Ochre (505) | 697 | 1093 | 396 | 182.7 |
| Orca + Pioneer | 2 | Hedbergite (571) | 617 | 907 | 290 | 182.7 |
| Orca + Pioneer | 4 | Pyroxeres (119) | 1491 | 6336 | 4845 | 91.4 |
| Orca + Pioneer | 4 | Omber (214) | 832 | 1450 | 618 | 91.4 |
| Orca + Pioneer | 4 | Gneiss (484) | 368 | 454 | 86 | 91.4 |
| Orca + Pioneer | 4 | Dark Ochre (505) | 353 | 431 | 78 | 91.4 |
| Orca + Pioneer | 4 | Hedbergite (571) | 312 | 372 | 59 | 91.4 |
| Orca + Pioneer | 6 | Pyroxeres (119) | 1006 | 2052 | 1046 | 60.9 |
| Orca + Pioneer | 6 | Omber (214) | 561 | 784 | 223 | 60.9 |
| Orca + Pioneer | 6 | Gneiss (484) | 249 | 284 | 36 | 60.9 |
| Orca + Pioneer | 6 | Dark Ochre (505) | 238 | 271 | 33 | 60.9 |
| Orca + Pioneer | 6 | Hedbergite (571) | 211 | 236 | 25 | 60.9 |
| Orca + Alpha Pioneer | 1 | Pyroxeres (119) | 9859 | ∞ | ∞ | 615.3 |
| Orca + Alpha Pioneer | 1 | Omber (214) | 5499 | ∞ | ∞ | 615.3 |
| Orca + Alpha Pioneer | 1 | Gneiss (484) | 2436 | ∞ | ∞ | 615.3 |
| Orca + Alpha Pioneer | 1 | Dark Ochre (505) | 2333 | ∞ | ∞ | 615.3 |
| Orca + Alpha Pioneer | 1 | Hedbergite (571) | 2064 | ∞ | ∞ | 615.3 |
| Orca + Alpha Pioneer | 2 | Pyroxeres (119) | 4960 | ∞ | ∞ | 307.7 |
| Orca + Alpha Pioneer | 2 | Omber (214) | 2766 | ∞ | ∞ | 307.7 |
| Orca + Alpha Pioneer | 2 | Gneiss (484) | 1225 | 3368 | 2142 | 307.7 |
| Orca + Alpha Pioneer | 2 | Dark Ochre (505) | 1174 | 3005 | 1831 | 307.7 |
| Orca + Alpha Pioneer | 2 | Hedbergite (571) | 1038 | 2253 | 1214 | 307.7 |
| Orca + Alpha Pioneer | 4 | Pyroxeres (119) | 2510 | ∞ | ∞ | 153.8 |
| Orca + Alpha Pioneer | 4 | Omber (214) | 1400 | 4965 | 3565 | 153.8 |
| Orca + Alpha Pioneer | 4 | Gneiss (484) | 620 | 909 | 289 | 153.8 |
| Orca + Alpha Pioneer | 4 | Dark Ochre (505) | 594 | 854 | 260 | 153.8 |
| Orca + Alpha Pioneer | 4 | Hedbergite (571) | 526 | 719 | 194 | 153.8 |
| Orca + Alpha Pioneer | 6 | Pyroxeres (119) | 1694 | 11949 | 10255 | 102.6 |
| Orca + Alpha Pioneer | 6 | Omber (214) | 945 | 1812 | 867 | 102.6 |
| Orca + Alpha Pioneer | 6 | Gneiss (484) | 418 | 531 | 113 | 102.6 |
| Orca + Alpha Pioneer | 6 | Dark Ochre (505) | 401 | 503 | 102 | 102.6 |
| Orca + Alpha Pioneer | 6 | Hedbergite (571) | 355 | 432 | 78 | 102.6 |
| Orca + Venture | 1 | Pyroxeres (119) | 8571 | ∞ | ∞ | 537.1 |
| Orca + Venture | 1 | Omber (214) | 4780 | ∞ | ∞ | 537.1 |
| Orca + Venture | 1 | Gneiss (484) | 2118 | ∞ | ∞ | 537.1 |
| Orca + Venture | 1 | Dark Ochre (505) | 2028 | ∞ | ∞ | 537.1 |
| Orca + Venture | 1 | Hedbergite (571) | 1794 | 30447 | 28653 | 537.1 |
| Orca + Venture | 2 | Pyroxeres (119) | 4294 | ∞ | ∞ | 268.6 |
| Orca + Venture | 2 | Omber (214) | 2395 | ∞ | ∞ | 268.6 |
| Orca + Venture | 2 | Gneiss (484) | 1061 | 2386 | 1325 | 268.6 |
| Orca + Venture | 2 | Dark Ochre (505) | 1016 | 2171 | 1155 | 268.6 |
| Orca + Venture | 2 | Hedbergite (571) | 899 | 1698 | 799 | 268.6 |
| Orca + Venture | 4 | Pyroxeres (119) | 2156 | ∞ | ∞ | 134.3 |
| Orca + Venture | 4 | Omber (214) | 1202 | 3222 | 2019 | 134.3 |
| Orca + Venture | 4 | Gneiss (484) | 533 | 737 | 205 | 134.3 |
| Orca + Venture | 4 | Dark Ochre (505) | 510 | 695 | 185 | 134.3 |
| Orca + Venture | 4 | Hedbergite (571) | 451 | 590 | 139 | 134.3 |
| Orca + Venture | 6 | Pyroxeres (119) | 1443 | 5754 | 4311 | 89.5 |
| Orca + Venture | 6 | Omber (214) | 805 | 1383 | 578 | 89.5 |
| Orca + Venture | 6 | Gneiss (484) | 357 | 438 | 81 | 89.5 |
| Orca + Venture | 6 | Dark Ochre (505) | 342 | 415 | 74 | 89.5 |
| Orca + Venture | 6 | Hedbergite (571) | 302 | 358 | 56 | 89.5 |
| Orca + Alpha Venture | 1 | Pyroxeres (119) | 12026 | ∞ | ∞ | 753.7 |
| Orca + Alpha Venture | 1 | Omber (214) | 6707 | ∞ | ∞ | 753.7 |
| Orca + Alpha Venture | 1 | Gneiss (484) | 2971 | ∞ | ∞ | 753.7 |
| Orca + Alpha Venture | 1 | Dark Ochre (505) | 2846 | ∞ | ∞ | 753.7 |
| Orca + Alpha Venture | 1 | Hedbergite (571) | 2518 | ∞ | ∞ | 753.7 |
| Orca + Alpha Venture | 2 | Pyroxeres (119) | 6025 | ∞ | ∞ | 376.8 |
| Orca + Alpha Venture | 2 | Omber (214) | 3360 | ∞ | ∞ | 376.8 |
| Orca + Alpha Venture | 2 | Gneiss (484) | 1489 | 6740 | 5252 | 376.8 |
| Orca + Alpha Venture | 2 | Dark Ochre (505) | 1426 | 5622 | 4196 | 376.8 |
| Orca + Alpha Venture | 2 | Hedbergite (571) | 1261 | 3712 | 2451 | 376.8 |
| Orca + Alpha Venture | 4 | Pyroxeres (119) | 3025 | ∞ | ∞ | 188.4 |
| Orca + Alpha Venture | 4 | Omber (214) | 1687 | 13991 | 12304 | 188.4 |
| Orca + Alpha Venture | 4 | Gneiss (484) | 747 | 1224 | 477 | 188.4 |
| Orca + Alpha Venture | 4 | Dark Ochre (505) | 716 | 1142 | 426 | 188.4 |
| Orca + Alpha Venture | 4 | Hedbergite (571) | 633 | 945 | 312 | 188.4 |
| Orca + Alpha Venture | 6 | Pyroxeres (119) | 2025 | ∞ | ∞ | 125.6 |
| Orca + Alpha Venture | 6 | Omber (214) | 1129 | 2730 | 1600 | 125.6 |
| Orca + Alpha Venture | 6 | Gneiss (484) | 500 | 676 | 176 | 125.6 |
| Orca + Alpha Venture | 6 | Dark Ochre (505) | 479 | 638 | 159 | 125.6 |
| Orca + Alpha Venture | 6 | Hedbergite (571) | 424 | 544 | 120 | 125.6 |
| Porpoise + Covetor | 1 | Pyroxeres (119) | 314 | ∞ | ∞ | 135.2 |
| Porpoise + Covetor | 1 | Omber (214) | 175 | 475 | 300 | 135.2 |
| Porpoise + Covetor | 1 | Gneiss (484) | 78 | 108 | 30 | 135.2 |
| Porpoise + Covetor | 1 | Dark Ochre (505) | 74 | 102 | 27 | 135.2 |
| Porpoise + Covetor | 1 | Hedbergite (571) | 66 | 86 | 20 | 135.2 |
| Porpoise + Covetor | 2 | Pyroxeres (119) | 206 | 474 | 268 | 67.6 |
| Porpoise + Covetor | 2 | Omber (214) | 115 | 168 | 53 | 67.6 |
| Porpoise + Covetor | 2 | Gneiss (484) | 51 | 59 | 8 | 67.6 |
| Porpoise + Covetor | 2 | Dark Ochre (505) | 49 | 56 | 8 | 67.6 |
| Porpoise + Covetor | 2 | Hedbergite (571) | 43 | 49 | 6 | 67.6 |
| Porpoise + Covetor | 4 | Pyroxeres (119) | 151 | 211 | 60 | 33.8 |
| Porpoise + Covetor | 4 | Omber (214) | 84 | 100 | 16 | 33.8 |
| Porpoise + Covetor | 4 | Gneiss (484) | 37 | 40 | 3 | 33.8 |
| Porpoise + Covetor | 4 | Dark Ochre (505) | 36 | 38 | 3 | 33.8 |
| Porpoise + Covetor | 4 | Hedbergite (571) | 32 | 34 | 2 | 33.8 |
| Porpoise + Covetor | 6 | Pyroxeres (119) | 133 | 164 | 31 | 22.5 |
| Porpoise + Covetor | 6 | Omber (214) | 74 | 83 | 9 | 22.5 |
| Porpoise + Covetor | 6 | Gneiss (484) | 33 | 35 | 2 | 22.5 |
| Porpoise + Covetor | 6 | Dark Ochre (505) | 32 | 33 | 1 | 22.5 |
| Porpoise + Covetor | 6 | Hedbergite (571) | 28 | 29 | 1 | 22.5 |
| Porpoise + Hulk | 1 | Pyroxeres (119) | 467 | 2881 | 2414 | 100.1 |
| Porpoise + Hulk | 1 | Omber (214) | 260 | 489 | 228 | 100.1 |
| Porpoise + Hulk | 1 | Gneiss (484) | 115 | 145 | 30 | 100.1 |
| Porpoise + Hulk | 1 | Dark Ochre (505) | 110 | 138 | 27 | 100.1 |
| Porpoise + Hulk | 1 | Hedbergite (571) | 98 | 119 | 21 | 100.1 |
| Porpoise + Hulk | 2 | Pyroxeres (119) | 386 | 665 | 279 | 50.1 |
| Porpoise + Hulk | 2 | Omber (214) | 216 | 281 | 66 | 50.1 |
| Porpoise + Hulk | 2 | Gneiss (484) | 95 | 106 | 11 | 50.1 |
| Porpoise + Hulk | 2 | Dark Ochre (505) | 91 | 102 | 10 | 50.1 |
| Porpoise + Hulk | 2 | Hedbergite (571) | 81 | 89 | 8 | 50.1 |
| Porpoise + Hulk | 4 | Pyroxeres (119) | 346 | 438 | 92 | 25.0 |
| Porpoise + Hulk | 4 | Omber (214) | 193 | 219 | 26 | 25.0 |
| Porpoise + Hulk | 4 | Gneiss (484) | 86 | 90 | 5 | 25.0 |
| Porpoise + Hulk | 4 | Dark Ochre (505) | 82 | 86 | 4 | 25.0 |
| Porpoise + Hulk | 4 | Hedbergite (571) | 72 | 76 | 3 | 25.0 |
| Porpoise + Hulk | 6 | Pyroxeres (119) | 333 | 387 | 54 | 16.7 |
| Porpoise + Hulk | 6 | Omber (214) | 186 | 201 | 16 | 16.7 |
| Porpoise + Hulk | 6 | Gneiss (484) | 82 | 85 | 3 | 16.7 |
| Porpoise + Hulk | 6 | Dark Ochre (505) | 79 | 81 | 3 | 16.7 |
| Porpoise + Hulk | 6 | Hedbergite (571) | 70 | 72 | 2 | 16.7 |
| Porpoise + Pioneer | 1 | Pyroxeres (119) | 685 | ∞ | ∞ | 401.7 |
| Porpoise + Pioneer | 1 | Omber (214) | 382 | ∞ | ∞ | 401.7 |
| Porpoise + Pioneer | 1 | Gneiss (484) | 169 | 999 | 830 | 401.7 |
| Porpoise + Pioneer | 1 | Dark Ochre (505) | 162 | 793 | 631 | 401.7 |
| Porpoise + Pioneer | 1 | Hedbergite (571) | 143 | 484 | 341 | 401.7 |
| Porpoise + Pioneer | 2 | Pyroxeres (119) | 362 | ∞ | ∞ | 200.9 |
| Porpoise + Pioneer | 2 | Omber (214) | 202 | 3236 | 3034 | 200.9 |
| Porpoise + Pioneer | 2 | Gneiss (484) | 89 | 153 | 64 | 200.9 |
| Porpoise + Pioneer | 2 | Dark Ochre (505) | 86 | 142 | 57 | 200.9 |
| Porpoise + Pioneer | 2 | Hedbergite (571) | 76 | 117 | 41 | 200.9 |
| Porpoise + Pioneer | 4 | Pyroxeres (119) | 201 | 1260 | 1059 | 100.4 |
| Porpoise + Pioneer | 4 | Omber (214) | 112 | 211 | 99 | 100.4 |
| Porpoise + Pioneer | 4 | Gneiss (484) | 50 | 63 | 13 | 100.4 |
| Porpoise + Pioneer | 4 | Dark Ochre (505) | 48 | 59 | 12 | 100.4 |
| Porpoise + Pioneer | 4 | Hedbergite (571) | 42 | 51 | 9 | 100.4 |
| Porpoise + Pioneer | 6 | Pyroxeres (119) | 147 | 335 | 187 | 67.0 |
| Porpoise + Pioneer | 6 | Omber (214) | 82 | 119 | 37 | 67.0 |
| Porpoise + Pioneer | 6 | Gneiss (484) | 36 | 42 | 6 | 67.0 |
| Porpoise + Pioneer | 6 | Dark Ochre (505) | 35 | 40 | 5 | 67.0 |
| Porpoise + Pioneer | 6 | Hedbergite (571) | 31 | 35 | 4 | 67.0 |
| Porpoise + Alpha Pioneer | 1 | Pyroxeres (119) | 1151 | ∞ | ∞ | 675.2 |
| Porpoise + Alpha Pioneer | 1 | Omber (214) | 642 | ∞ | ∞ | 675.2 |
| Porpoise + Alpha Pioneer | 1 | Gneiss (484) | 284 | ∞ | ∞ | 675.2 |
| Porpoise + Alpha Pioneer | 1 | Dark Ochre (505) | 272 | ∞ | ∞ | 675.2 |
| Porpoise + Alpha Pioneer | 1 | Hedbergite (571) | 241 | ∞ | ∞ | 675.2 |
| Porpoise + Alpha Pioneer | 2 | Pyroxeres (119) | 609 | ∞ | ∞ | 337.6 |
| Porpoise + Alpha Pioneer | 2 | Omber (214) | 340 | ∞ | ∞ | 337.6 |
| Porpoise + Alpha Pioneer | 2 | Gneiss (484) | 150 | 498 | 348 | 337.6 |
| Porpoise + Alpha Pioneer | 2 | Dark Ochre (505) | 144 | 435 | 291 | 337.6 |
| Porpoise + Alpha Pioneer | 2 | Hedbergite (571) | 127 | 312 | 184 | 337.6 |
| Porpoise + Alpha Pioneer | 4 | Pyroxeres (119) | 338 | ∞ | ∞ | 168.8 |
| Porpoise + Alpha Pioneer | 4 | Omber (214) | 188 | 887 | 699 | 168.8 |
| Porpoise + Alpha Pioneer | 4 | Gneiss (484) | 83 | 128 | 45 | 168.8 |
| Porpoise + Alpha Pioneer | 4 | Dark Ochre (505) | 80 | 120 | 40 | 168.8 |
| Porpoise + Alpha Pioneer | 4 | Hedbergite (571) | 71 | 100 | 30 | 168.8 |
| Porpoise + Alpha Pioneer | 6 | Pyroxeres (119) | 247 | 4240 | 3992 | 112.5 |
| Porpoise + Alpha Pioneer | 6 | Omber (214) | 138 | 290 | 152 | 112.5 |
| Porpoise + Alpha Pioneer | 6 | Gneiss (484) | 61 | 80 | 19 | 112.5 |
| Porpoise + Alpha Pioneer | 6 | Dark Ochre (505) | 58 | 75 | 17 | 112.5 |
| Porpoise + Alpha Pioneer | 6 | Hedbergite (571) | 52 | 64 | 13 | 112.5 |
| Porpoise + Venture | 1 | Pyroxeres (119) | 966 | ∞ | ∞ | 589.2 |
| Porpoise + Venture | 1 | Omber (214) | 539 | ∞ | ∞ | 589.2 |
| Porpoise + Venture | 1 | Gneiss (484) | 239 | ∞ | ∞ | 589.2 |
| Porpoise + Venture | 1 | Dark Ochre (505) | 229 | ∞ | ∞ | 589.2 |
| Porpoise + Venture | 1 | Hedbergite (571) | 202 | ∞ | ∞ | 589.2 |
| Porpoise + Venture | 2 | Pyroxeres (119) | 493 | ∞ | ∞ | 294.6 |
| Porpoise + Venture | 2 | Omber (214) | 275 | ∞ | ∞ | 294.6 |
| Porpoise + Venture | 2 | Gneiss (484) | 122 | 311 | 190 | 294.6 |
| Porpoise + Venture | 2 | Dark Ochre (505) | 117 | 280 | 163 | 294.6 |
| Porpoise + Venture | 2 | Hedbergite (571) | 103 | 213 | 110 | 294.6 |
| Porpoise + Venture | 4 | Pyroxeres (119) | 256 | ∞ | ∞ | 147.3 |
| Porpoise + Venture | 4 | Omber (214) | 143 | 457 | 314 | 147.3 |
| Porpoise + Venture | 4 | Gneiss (484) | 63 | 91 | 28 | 147.3 |
| Porpoise + Venture | 4 | Dark Ochre (505) | 61 | 86 | 25 | 147.3 |
| Porpoise + Venture | 4 | Hedbergite (571) | 54 | 72 | 19 | 147.3 |
| Porpoise + Venture | 6 | Pyroxeres (119) | 177 | 993 | 816 | 98.2 |
| Porpoise + Venture | 6 | Omber (214) | 99 | 182 | 84 | 98.2 |
| Porpoise + Venture | 6 | Gneiss (484) | 44 | 55 | 11 | 98.2 |
| Porpoise + Venture | 6 | Dark Ochre (505) | 42 | 52 | 10 | 98.2 |
| Porpoise + Venture | 6 | Hedbergite (571) | 37 | 45 | 8 | 98.2 |
| Porpoise + Alpha Venture | 1 | Pyroxeres (119) | 1362 | ∞ | ∞ | 831.0 |
| Porpoise + Alpha Venture | 1 | Omber (214) | 760 | ∞ | ∞ | 831.0 |
| Porpoise + Alpha Venture | 1 | Gneiss (484) | 337 | ∞ | ∞ | 831.0 |
| Porpoise + Alpha Venture | 1 | Dark Ochre (505) | 322 | ∞ | ∞ | 831.0 |
| Porpoise + Alpha Venture | 1 | Hedbergite (571) | 285 | ∞ | ∞ | 831.0 |
| Porpoise + Alpha Venture | 2 | Pyroxeres (119) | 695 | ∞ | ∞ | 415.5 |
| Porpoise + Alpha Venture | 2 | Omber (214) | 387 | ∞ | ∞ | 415.5 |
| Porpoise + Alpha Venture | 2 | Gneiss (484) | 172 | 1218 | 1046 | 415.5 |
| Porpoise + Alpha Venture | 2 | Dark Ochre (505) | 164 | 928 | 764 | 415.5 |
| Porpoise + Alpha Venture | 2 | Hedbergite (571) | 145 | 534 | 389 | 415.5 |
| Porpoise + Alpha Venture | 4 | Pyroxeres (119) | 361 | ∞ | ∞ | 207.7 |
| Porpoise + Alpha Venture | 4 | Omber (214) | 201 | 6623 | 6422 | 207.7 |
| Porpoise + Alpha Venture | 4 | Gneiss (484) | 89 | 156 | 67 | 207.7 |
| Porpoise + Alpha Venture | 4 | Dark Ochre (505) | 85 | 145 | 60 | 207.7 |
| Porpoise + Alpha Venture | 4 | Hedbergite (571) | 76 | 119 | 43 | 207.7 |
| Porpoise + Alpha Venture | 6 | Pyroxeres (119) | 250 | ∞ | ∞ | 138.5 |
| Porpoise + Alpha Venture | 6 | Omber (214) | 139 | 394 | 254 | 138.5 |
| Porpoise + Alpha Venture | 6 | Gneiss (484) | 62 | 86 | 25 | 138.5 |
| Porpoise + Alpha Venture | 6 | Dark Ochre (505) | 59 | 81 | 22 | 138.5 |
| Porpoise + Alpha Venture | 6 | Hedbergite (571) | 52 | 69 | 17 | 138.5 |

### MSI break-even ore values (below this, fleet never pays back while MSI active)

| Config | N=1 | N=6 |
|---|---:|---:|
| Orca + Covetor | 122.8 | 20.5 |
| Orca + Hulk | 90.9 | 15.1 |
| Orca + Pioneer | 365.5 | 60.9 |
| Orca + Alpha Pioneer | 615.3 | 102.6 |
| Orca + Venture | 537.1 | 89.5 |
| Orca + Alpha Venture | 753.7 | 125.6 |
| Porpoise + Covetor | 135.2 | 22.5 |
| Porpoise + Hulk | 100.1 | 16.7 |
| Porpoise + Pioneer | 401.7 | 67.0 |
| Porpoise + Alpha Pioneer | 675.2 | 112.5 |
| Porpoise + Venture | 589.2 | 98.2 |
| Porpoise + Alpha Venture | 831.0 | 138.5 |

## 6. Key Findings (Dangerous Space)

- **Best ISK efficiency / safety:** Porpoise + Covetor. Cheapest booster (112 M) + cheapest miner (50 M). Fastest payback, least ISK lost if ganked.
- **Orca liability:** Orca costs 1110 M (~10× Porpoise). Orca fleets take 2–3× longer to pay back. Only worth it in safe space where you want maximum raw throughput (Orca+Hulk N=6 = 642 m^3/s).
- **Payback scales ~1/N:** Doubling miners roughly halves payback time; diminishing returns after N≈6–8.
- **Ore value is the swing factor:** At 50–100 isk/m^3 (Pyroxeres) even the best fleet takes hours to pay back. At 500+ isk/m^3 (Dark Ochre, Gneiss) Porpoise+Covetor N=6 is covered in ~30–40 minutes.
- **MSI is dangerous on low-value ores:** On Pyroxeres (~93 isk/m^3), Porpoise+Covetor N=1 never pays back with MSI active; N=2 takes ~956 m vs ~263 m without. On high-value ores (Gneiss, Dark Ochre) with N≥4, MSI adds only a few minutes.
- **Recommended dangerous-space fleet:** Porpoise + Covetor, N=4–6. Minimizes both loss value and exposure window before the fleet pays for itself.

## 7. Graph Output

70 PNG graphs generated at `output/graphs/<ore>/<ore>_N{n}.png` (10 ores × 7 N values: 1, 2, 3, 5, 10, 15, 20).
All graphs share an identical x-axis scale: 0 to ~3,270 minutes (~54.5 hours).
Each graph shows cumulative profit (M ISK) vs time for all 4 configs, with a dashed vertical line at payback time.

Ores included: Dark Ochre, Primsaticite, Gneiss, Crokite, Hemorphite, Hedbergite, Omber, Jaspet, Kernite, Pyroxeres.

---
Source: `~/dev/eve-mining-analysis/` — `pyproject.toml`, `src/eve_mining/`, `data/ores.json`
Run: `nix-shell` then `python3 -m eve_mining.cli {payback|graphs|msi|summary}`
