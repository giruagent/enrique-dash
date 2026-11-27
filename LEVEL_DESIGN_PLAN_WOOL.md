# Enrique Dash — Wool Road Course Plan

## How the courses are composed

Run `npm run levels:compose:wool` to deterministically rebuild every Wool Road layout from its level-id seed and the wool blueprint. The composer keeps each course's identity, palette, music, speed and length, lays deliberate combo beats and full reaction rests against the real portal speed profile, and writes each signature and design hook from the layout it actually built. It rejects any layout that the unchanged auto-player cannot finish without a death, a dead-band violation or a short first-beat telegraph. See [the level verification pipeline](docs/LEVEL_PIPELINE.md) for the shared physics and checks.

## Tier table

| Tier | Courses | Length | Speed | Target inputs/s |
| --- | --- | --- | --- | --- |
| 1 | 1–5 | 76–92 | 7.8–8.2 | 0.60–0.68 |
| 2 | 6–10 | 96–112 | 8.3–8.7 | 0.70–0.78 |
| 3 | 11–15 | 116–132 | 8.8–9.2 | 0.80–0.94 |
| 4 | 16–20 | 136–150 | 9.3–9.6 | 0.96–1.05 |

## Individual designs

### 01 — Thimble Meadow (76 units)
- **Signature:** Three open gaps in the meadow, a yarn-and-felt hazard mix and one shard arc over the middle hole.
- **Rhythm:** 1 + 2 + 1 + 2 input beats; target 0.62 inputs/s, measured 0.62; 3 open gaps and 1 bounce pad.
- **Design hook:** Thimble Meadow lays out 3 hazard groups (spike, yarn spike and felt block), 3 gaps, 1 bounce pad, 4 shards in 1 arc and 1 thread arch.
- **Layout:** Hazard groups at 9.36 [spike], 33.86 [yarn-spike], 65.36 (double) [felt-block]; gaps at 26.52 (2.5), 50.69 (2.5), 58.02 (2.5); platforms: bounce at 15, width 3.5, height 0.35; portals: none; enemies: none; shards: 8.36 (height 1.85), 49.14 (height 1.24, arc of 3), 50.7 (height 1.85), 52.19 (height 1.23). arches: finish; pom-poms: 4
- **Audio:** 108 BPM with the existing sixteen-step procedural motif.

### 02 — Button Bush (82 units)
- **Signature:** A plush pad launches you through a shard arc at the wide gap; a beetle waits on the last stitch.
- **Rhythm:** 1 + 1 + 1 + 2 + 2 input beats; target 0.67 inputs/s, measured 0.67; 3 open gaps and 1 bounce pad.
- **Design hook:** Button Bush lays out 3 hazard groups (button bomb and spike), 3 gaps, 1 bounce pad, 1 beetle, 3 shards in 1 arc and 1 thread arch.
- **Layout:** Hazard groups at 9.48 [button-bomb], 43.16 [spike], 57.84 [button-bomb]; gaps at 26.86 (4), 50.44 (2.5), 65.12 (2.5); platforms: bounce at 20.5, width 3.5, height 0.35; portals: none; enemies: beetle at 72.52; shards: 22.32 (height 1.21, arc of 3), 23.04 (height 1.31), 24.16 (height 1.24). arches: checkpoint; pom-poms: 5
- **Audio:** 112 BPM with the existing sixteen-step procedural motif.

### 03 — Darning Dell (86 units)
- **Signature:** A beetle waits on the first stitch, a plush pad throws you through a shard arc, then three gaps pull the dell apart.
- **Rhythm:** 2 + 1 + 1 + 1 + 2 input beats; target 0.64 inputs/s, measured 0.65; 3 open gaps and 1 bounce pad.
- **Design hook:** Darning Dell mixes three hazard skins (spike, yarn spike, felt block), opens three gaps, adds one pad before the middle rest, one beetle and a four-shard arc over the first hole.
- **Layout:** Hazard groups at 30.83 [spike], 61.56 [yarn-spike], 76.4 [felt-block]; gaps at 13.23 (2.5), 48.43 (2.5), 68.94 (2.5); platforms: bounce at 21.5, width 3.5, height 0.35; portals: none; enemies: bunny at 9.6; shards: 8.48 (height 1.85), 12.33 (height 1.24, arc of 3), 13.93 (height 1.85), 15.47 (height 1.23). arches: none; pom-poms: 3
- **Audio:** 112 BPM with the existing sixteen-step procedural motif.

### 04 — Pillow Pines (89 units)
- **Signature:** A plush pad springs you over the middle stitch while three gaps open between pine-shadow hazards.
- **Rhythm:** 1 + 1 + 1 + 2 + 2 input beats; target 0.66 inputs/s, measured 0.64; 3 open gaps and 1 bounce pad.
- **Design hook:** Pillow Pines mixes spike, yarn spike and felt block over four hazard groups, opens three gaps, and threads one pad before the middle hole with a four-shard arc over the first.
- **Layout:** Hazard groups at 45.36 [spike], 64.29 [yarn-spike], 79.28 [felt-block]; gaps at 27.54 (2.5), 56.77 (2.5), 71.76 (2.5); platforms: bounce at 36, width 3.5, height 0.35; portals: none; enemies: bunny at 9.72; shards: 8.6 (height 1.85), 25.85 (height 1.24, arc of 3), 27.47 (height 1.85), 29.02 (height 1.23). arches: none; pom-poms: 3
- **Audio:** 116 BPM with the existing sixteen-step procedural motif.

### 05 — Loom Lake (92 units)
- **Signature:** A stitched kerb lifts the near shore, a plush pad skips the lake's middle hole, and four silhouettes crowd the far bank.
- **Rhythm:** 1 + 2 + 2 + 2 + 1 input beats; target 0.68 inputs/s, measured 0.71; 3 open gaps and 1 bounce pad.
- **Design hook:** Loom Lake lays four hazard groups across spike, yarn spike, felt block and spike, opens three gaps, raises a kerb at 15 and a pad at 40, adds one beetle and threads a five-shard arc over the second hole.
- **Layout:** Hazard groups at 34.64 [spike], 59.45 [yarn-spike], 74.6 [felt-block], 82.16 [spike]; gaps at 27.06 (2.5), 51.86 (2.5), 67.02 (2.5); platforms: bounce at 15.5, width 3.5, height 0.35; portals: none; enemies: bunny at 9.84; shards: 8.72 (height 1.85), 25.28 (height 1.24, arc of 3), 26.92 (height 1.85), 28.49 (height 1.23). arches: none; pom-poms: 3
- **Audio:** 118 BPM with the existing sixteen-step procedural motif.

### 06 — Patchwork Square (96 units)
- **Signature:** A pad pops you over the square's first hole, a float carries the second crossing, and a beetle and a bunny share the long middle stretch.
- **Rhythm:** 2 + 2 + 2 + 2 input beats; target 0.70 inputs/s, measured 0.69; 4 open gaps and 1 bounce pad.
- **Design hook:** Patchwork Square threads four gaps around a pad at 24.5 and a kerb at 70, puts a float portal at 40.3, and fills the lane with two spike groups, a beetle at 34.6 and a bunny at 79.9 behind a five-shard arc.
- **Layout:** Hazard groups at 17.61 (double) [spike], 62.92 (double) [yarn-spike]; gaps at 9.96 (2.5), 38.29 (2.5), 55.28 (2.5), 83.54 (2.5); platforms: bounce at 70.5, width 3.5, height 0.35; portals: float at 40.33; enemies: beetle at 34.59, bunny at 79.91; shards: 9.8 (height 1.85), 72.42 (height 1.21, arc of 3), 73.32 (height 1.3), 74.35 (height 1.24). arches: none; pom-poms: 4
- **Audio:** 120 BPM with the existing sixteen-step procedural motif.

### 07 — Bobble Bridge (100 units)
- **Signature:** A bunny opens the bridge, a kerb lifts the first span, and a pad into a spring portal hands you across the middle.
- **Rhythm:** 1 + 2 + 1 + 1 + 2 + 2 input beats; target 0.72 inputs/s, measured 0.76; 4 open gaps and 1 bounce pad.
- **Design hook:** Bobble Bridge spans four gaps with a kerb at 15, a pad at 38.5 and a spring portal at 49.3, then closes on spike, yarn spike and felt block behind a beetle at 89.1 and a five-shard arc.
- **Layout:** Hazard groups at 34.59 [spike], 58.21 [yarn-spike], 73.67 [felt-block]; gaps at 26.88 (2.5), 48.08 (2.5), 65.96 (2.5), 81.41 (2.5); platforms: bounce at 15.5, width 3.5, height 0.35; portals: spring at 49.29; enemies: beetle at 89.12, bunny at 10.08; shards: 8.91 (height 1.85), 24.99 (height 1.24, arc of 3), 26.67 (height 1.85), 28.28 (height 1.23). arches: none; pom-poms: 4
- **Audio:** 122 BPM with the existing sixteen-step procedural motif.

### 08 — Spool Street (104 units)
- **Signature:** A pad launches the opening block, a float picks up the drop, and a kerb carries the long straight past a bunny and a beetle.
- **Rhythm:** 1 + 2 + 2 + 2 + 2 input beats; target 0.74 inputs/s, measured 0.74; 4 open gaps and 1 bounce pad.
- **Design hook:** Spool Street chains a pad at 18 into a float at 37 and a kerb at 40, opens four gaps, and threads spike, yarn spike and felt block between a bunny at 27.2 and a beetle at 93 behind a five-shard arc.
- **Layout:** Hazard groups at 34.99 [spike], 59.78 [yarn-spike], 73.51 [felt-block]; gaps at 10.2 (2.5), 51.99 (2.5), 77.37 (2.5), 85.21 (2.5); platforms: bounce at 18, width 3.5, height 0.35; portals: float at 37.03; enemies: beetle at 93, bunny at 27.2; shards: 10.04 (height 1.85), 19.97 (height 1.21, arc of 3), 20.9 (height 1.3), 21.96 (height 1.24). arches: none; pom-poms: 4
- **Audio:** 124 BPM with the existing sixteen-step procedural motif.

### 09 — Cardigan Cove (108 units)
- **Signature:** A pad and a stitched island break the wide cove crossing, a kerb lifts the middle, and a dash portal flattens the back straight.
- **Rhythm:** 1 + 1 + 1 + 2 + 2 + 2 input beats; target 0.76 inputs/s, measured 0.75; 4 open gaps and 1 kerb and 1 bounce pad.
- **Design hook:** Cardigan Cove opens with a pad at 14.5 and an island inside its 4.9-wide gap at 27.1, adds a kerb at 34.5 and a dash portal at 45.3, and closes on three skins, a bunny at 10.3, a beetle at 96.9 and a six-shard arc.
- **Layout:** Hazard groups at 43.86 [spike], 65.26 [yarn-spike], 81.07 [felt-block]; gaps at 27.09 (2.5), 55.48 (2.5), 73.19 (2.5), 89 (2.5); platforms: kerb at 34.5, width 4.5, height 0.45; bounce at 15.5, width 3.5, height 0.35; portals: dash at 45.25; enemies: beetle at 96.88, bunny at 10.32; shards: 9.15 (height 1.85), 36.75 (height 1.65), 25.08 (height 1.24, arc of 3), 26.8 (height 1.85), 28.45 (height 1.23). arches: none; pom-poms: 4
- **Audio:** 126 BPM with the existing sixteen-step procedural motif.

### 10 — Tassel Terrace (112 units)
- **Signature:** A float, a pad and a spring hand you along the terrace, and the widest gap is stitched with an island under the spring landing.
- **Rhythm:** 2 + 2 + 2 + 2 + 2 input beats; target 0.78 inputs/s, measured 0.78; 4 open gaps and 1 kerb and 1 bounce pad.
- **Design hook:** Tassel Terrace runs a float at 21.3, a pad at 26 and a spring at 66.4 over four gaps, stitches the 4.9-wide hole with an island at 64.3, and closes on four hazard skins, a bunny, a beetle and a six-shard arc.
- **Layout:** Hazard groups at 43.35 [spike], 60.32 [yarn-spike], 76.7 [felt-block], 84.68 [spike]; gaps at 10.44 (2.5), 35.38 (2.5), 64.27 (2.5), 92.79 (2.5); platforms: kerb at 49.5, width 4.5, height 0.45; bounce at 26, width 3.5, height 0.35; portals: float at 21.3, spring at 66.38; enemies: beetle at 100.76, bunny at 18.41; shards: 10.23 (height 1.85), 51.75 (height 1.65), 27.55 (height 1.23, arc of 3), 28.2 (height 1.61), 28.78 (height 1.87). arches: none; pom-poms: 4
- **Audio:** 128 BPM with the existing sixteen-step procedural motif.

### 11 — Yarnstorm Ridge (116 units)
- **Signature:** A pad chain over the ridge — pad, stitched island, pad — with a float bridging the wide hole and a moth on the last stretch.
- **Rhythm:** 1 + 1 + 1 + 2 + 2 + 2 + 2 input beats; target 0.80 inputs/s, measured 0.83; 4 open gaps and 1 kerb and 2 bounce pads.
- **Design hook:** Yarnstorm Ridge chains two pads at 32 and 52.5 around an island in its 4.9-wide hole, adds a float at 45.8 and a kerb at 16.5, and fills the lane with five groups across four skins, a beetle at 10.6, a moth at 104.6 and a six-shard arc.
- **Layout:** Hazard groups at 27.28 (double) [spike], 59.1 [yarn-spike], 60.1 (double) [felt-block], 76.28 [button-bomb], 84.39 [spike]; gaps at 44 (2.5), 68.21 (2.5), 88.46 (2.5), 96.57 (2.5); platforms: kerb at 16.5, width 4.5, height 0.45; bounce at 33.5, width 3.5, height 0.35; bounce at 52.5, width 3.5, height 0.35; portals: float at 45.81; enemies: moth at 104.64, beetle at 10.56; shards: 9.26 (height 1.85), 18.75 (height 1.65), 41.8 (height 1.24, arc of 3), 43.56 (height 1.85), 45.25 (height 1.23), 35.49 (height 1.21, arc of 3), 36.52 (height 1.29), 37.55 (height 1.24). arches: finish; pom-poms: 4
- **Audio:** 132 BPM with the existing sixteen-step procedural motif.

### 12 — Tangled Thicket (120 units)
- **Signature:** Four platforms stack the thicket — a shelf, a pad, a perch and a kerb — while a spring and a float split the lane around three wool enemies.
- **Rhythm:** 1 + 1 + 1 + 2 + 2 + 2 + 2 input beats; target 0.83 inputs/s, measured 0.82; 4 open gaps and 1 kerb, 1 shelf and 1 bounce pad.
- **Design hook:** Tangled Thicket stacks a 10-wide shelf at 14.5, a pad at 35.5, a perch at 42.3 and a kerb at 49.5, splits four gaps with a spring at 30.5 and a float at 65.2, and puts a beetle, a bunny and a moth against four hazard skins and a six-shard arc.
- **Layout:** Hazard groups at 44.5 [spike], 59.88 [yarn-spike], 72.05 [felt-block], 84 [button-bomb], 92.16 [spike]; gaps at 27.59 (2.5), 63.85 (2.5), 75.79 (2.5), 100.36 (2.5); platforms: kerb at 49.5, width 4.5, height 0.45; shelf at 14.5, width 10, height 0.5; bounce at 35.5, width 3.5, height 0.35; portals: spring at 30.46, float at 65.24; enemies: moth at 108.52, beetle at 10.68; shards: 9.38 (height 1.85), 51.75 (height 1.65), 23.95 (height 1.7), 38.2 (height 1.21, arc of 3), 39.23 (height 1.64), 40.27 (height 1.24). arches: finish; pom-poms: 4
- **Audio:** 134 BPM with the existing sixteen-step procedural motif.

### 13 — Kite String (124 units)
- **Signature:** An island threads the opening hole, a dash snaps the middle, and a float drops you onto a perch held by a bunny.
- **Rhythm:** 1 + 1 + 1 + 2 + 2 + 2 + 2 input beats; target 0.86 inputs/s, measured 0.83; 5 open gaps and 1 kerb and 1 island.
- **Design hook:** Kite String stitches its 4.9-wide opening with an island at 10.8, lifts a kerb at 18, snaps a dash at 34.4, holds a perch at 63 and floats at 70, with a beetle, a bunny and a moth across five gaps.
- **Layout:** Hazard groups at 44.1 (double) [spike], 66.45 [yarn-spike], 83.18 [felt-block], 91.66 [button-bomb]; gaps at 10.8 (4.9), 56.22 (2.5), 74.93 (2.5), 95.67 (2.5), 104.15 (2.5); platforms: kerb at 18, width 4.5, height 0.45; island at 10.8, width 2.5, height 0.5; portals: dash at 34.44, float at 70.01; enemies: moth at 112.4, beetle at 27.45; shards: 12 (height 1.21, arc of 3), 13.27 (height 1.33), 14.55 (height 1.23). arches: finish; pom-poms: 4
- **Audio:** 136 BPM with the existing sixteen-step procedural motif.

### 14 — Winder's Climb (128 units)
- **Signature:** Two pads and two portals stack the climb: a spring at 14, a bounce at 18, a kerb at 42, a dash at 64 and a second bounce at 68.5 carry the ridge.
- **Rhythm:** 2 + 2 + 2 + 3 + 3 input beats; target 0.90 inputs/s, measured 0.89; 5 open gaps and 1 kerb and 2 bounce pads.
- **Design hook:** Winder's Climb stacks five gaps under a spring at 13.9, a pad at 18, a kerb at 42, a dash at 64.3 and a pad at 68.5, and threads four hazard skins, a beetle, a moth and two shard arcs.
- **Layout:** Hazard groups at 11.92 (double) [spike], 37.1 [yarn-spike], 62.27 [felt-block], 89.45 [button-bomb], 103.96 [spike]; gaps at 28.76 (2.5), 53.93 (2.5), 79.11 (2.5), 93.77 (2.5), 107.94 (2.5); platforms: kerb at 42, width 4.5, height 0.45; bounce at 18, width 3.5, height 0.35; bounce at 68.5, width 3.5, height 0.35; portals: spring at 13.94, dash at 64.29; enemies: moth at 116.28, beetle at 10.92; shards: 9.99 (height 1.59), 44.25 (height 1.65), 27.38 (height 1.24, arc of 3), 29.2 (height 1.85), 30.94 (height 1.23), 21.61 (height 1.23, arc of 3), 23.13 (height 1.66), 24.57 (height 1.24). arches: finish; pom-poms: 4
- **Audio:** 138 BPM with the existing sixteen-step procedural motif.

### 15 — Frayed Frontier (132 units)
- **Signature:** A hover chain and two pads fray the frontier — 24, 29.5, 51, 79 — with a float and a spring splitting five gaps.
- **Rhythm:** 2 + 2 + 3 + 3 + 3 input beats; target 0.94 inputs/s, measured 0.91; 5 open gaps and 2 hovers and 2 bounce pads.
- **Design hook:** Frayed Frontier stacks two hovers at 24 and 51, two pads at 29.5 and 79, a float at 22.3 and a spring at 75.6 over five gaps, with five hazard skins, a beetle, a moth and two shard arcs.
- **Layout:** Hazard groups at 19.47 [spike], 44.47 (double) [yarn-spike], 61.03 [felt-block], 73.4 (double) [button-bomb], 94.79 [spike], 107.63 [yarn-spike]; gaps at 36.03 (2.5), 64.97 (2.5), 86.36 (2.5), 99.05 (2.5), 111.73 (2.5); platforms: hover at 51, width 4.5, height 0.45; hover at 24, width 4.5, height 0.45; bounce at 79, width 3, height 0.35; bounce at 29.5, width 3, height 0.35; portals: float at 22.29, spring at 75.61; enemies: moth at 120.16, beetle at 11.04; shards: 9.69 (height 1.85), 53.25 (height 1.65), 26.25 (height 1.65), 31.89 (height 1.22, arc of 3), 32.2 (height 1.45), 32.43 (height 1.61), 64.78 (height 1.24, arc of 3), 66.62 (height 1.85), 68.39 (height 1.23). arches: finish; pom-poms: 4
- **Audio:** 140 BPM with the existing sixteen-step procedural motif.

### 16 — Button Barrel (136 units)
- **Signature:** A float carries the first barrel, a dash the second, and an island stitches the widest hole under a hover.
- **Rhythm:** 2 + 2 + 2 + 2 + 3 + 3 input beats; target 0.96 inputs/s, measured 0.99; 4 open gaps and 1 island and 1 hover.
- **Design hook:** Button Barrel runs seven hazard groups across four skins, splits four gaps with a float at 33 and a dash at 67.4, stitches its 4.9-wide hole at 76.8, and keeps a hover at 90, a beetle, a bunny and a moth plus a shard arc.
- **Layout:** Hazard groups at 12.16 (double) [spike], 49.07 [yarn-spike], 66.16 (double) [felt-block], 87.37 [button-bomb], 97.94 (double) [spike], 115.04 [yarn-spike], 123.56 (double) [felt-block]; gaps at 23.44 (2.5), 40.54 (2.5), 57.64 (2.5), 76.8 (4.9); platforms: island at 76.8, width 2.5, height 0.5; hover at 90, width 4.5, height 0.45; portals: float at 33, dash at 67.44; enemies: moth at 106.51, beetle at 11.16, bunny at 31.97; shards: 21.08 (height 1.24, arc of 3), 22.94 (height 1.85), 24.72 (height 1.23). arches: checkpoint, finish; pom-poms: 5
- **Audio:** 144 BPM with the existing sixteen-step procedural motif.

### 17 — Needle Nook (140 units)
- **Signature:** Two hovers frame the needle alley, a spring at 50 and a float at 96 thread it, and eight hazard groups close in on the last stretch.
- **Rhythm:** 2 + 2 + 2 + 3 + 3 + 3 input beats; target 0.98 inputs/s, measured 1.01; 4 open gaps and 2 hovers.
- **Design hook:** Needle Nook sets two hovers at 25.5 and 85.5 around a spring at 50.3 and a float at 95.8, opens four gaps, and lines eight hazard groups across four skins with a beetle, a bunny, a moth and two shard arcs.
- **Layout:** Hazard groups at 19.9 (double) [spike], 66.26 [yarn-spike], 83.54 [felt-block], 92.15 [button-bomb], 109.44 [spike], 110.44 [yarn-spike], 120.1 [felt-block], 128.72 [button-bomb]; gaps at 36.35 (2.5), 57.64 (2.5), 74.92 (2.5), 100.82 (2.5); platforms: hover at 25.5, width 4.5, height 0.45; hover at 85.5, width 4.5, height 0.45; portals: spring at 50.29, float at 95.79; enemies: moth at 119.1, beetle at 11.28, bunny at 44.96; shards: 9.92 (height 1.85), 27.75 (height 1.65), 87.75 (height 1.65), 33.92 (height 1.24, arc of 3), 35.8 (height 1.85), 37.6 (height 1.23), 58.12 (height 1.24, arc of 3), 60 (height 1.85), 61.8 (height 1.23). arches: checkpoint, finish; pom-poms: 5
- **Audio:** 146 BPM with the existing sixteen-step procedural motif.

### 18 — Dust Bunny Run (144 units)
- **Signature:** A hover at each end, a pad at 82.5 and a float into a spring in the middle, with a bunny waiting at 33.9.
- **Rhythm:** 2 + 2 + 2 + 3 + 3 + 3 input beats; target 1.00 inputs/s, measured 0.99; 4 open gaps and 2 hovers and 1 bounce pad.
- **Design hook:** Dust Bunny Run brackets the run with hovers at 16 and 126, puts a pad at 82.5 before a float at 35 and a spring at 78.9, and lines eight hazard groups across four skins with a beetle, a bunny, a moth and a shard arc.
- **Layout:** Hazard groups at 12.4 (double) [spike], 51.37 [yarn-spike], 68.84 [felt-block], 77.55 [button-bomb], 97.72 [spike], 106.43 [yarn-spike], 123.89 [felt-block], 132.6 [button-bomb]; gaps at 25.2 (2.5), 42.67 (2.5), 60.13 (2.5), 89.01 (2.5); platforms: hover at 16, width 4.5, height 0.45; hover at 126, width 4.5, height 0.45; bounce at 82.5, width 3, height 0.35; portals: float at 34.96, spring at 78.92; enemies: moth at 115.18, beetle at 11.4, bunny at 33.91; shards: 23.51 (height 1.24, arc of 3), 25.41 (height 1.85), 27.23 (height 1.23). arches: checkpoint, finish; pom-poms: 5
- **Audio:** 148 BPM with the existing sixteen-step procedural motif.

### 19 — Spoolworks (147 units)
- **Signature:** Two spike groups on one arc.
- **Rhythm:** 2 + 2 + 2 + 3 + 3 + 3 input beats; target 1.02 inputs/s, measured 1.01; 4 open gaps and 1 island and 1 hover.
- **Design hook:** Spoolworks lays out 10 spike groups, 4 open gaps, 2 portals (dash and float), 1 drone and 1 shard.
- **Layout:** Hazard groups at 20.21 (double) [spike], 72.11 [yarn-spike], 89.67 [felt-block], 98.42 [button-bomb], 115.98 [spike], 116.98 [yarn-spike], 126.79 [felt-block], 135.54 [button-bomb]; gaps at 36.45 (2.5), 61.26 (4.9), 80.92 (2.5), 107.23 (2.5); platforms: island at 61.26, width 2.5, height 0.5; hover at 25.5, width 4.5, height 0.45; portals: dash at 51.94, float at 102.12; enemies: moth at 125.79, beetle at 11.46, bunny at 45.2; shards: 10.08 (height 1.85), 62.51 (height 1.7), 27.75 (height 1.65), 33.98 (height 1.24, arc of 3), 35.89 (height 1.85), 37.72 (height 1.23). arches: checkpoint, finish; pom-poms: 5
- **Audio:** 150 BPM with the existing sixteen-step procedural motif.

## Playtest checklist

1. Confirm a single jump can clear each authored gap from its marked approach and that the destination has a clean landing window.
2. Confirm raised bridges are reachable with one jump and never require a midair second jump.
3. Confirm each portal effect is readable before its next hazard and does not imply protection from gaps.
4. Confirm crawlers can be stomped or jumped, drones have a clear vertical avoidance window, and shield portals can absorb a single enemy/hazard.
5. Test the collectible HUD and completion summary on every course that carries shards.
6. Run every course on a desktop browser and narrow mobile viewport; verify touch targets, fullscreen, safe areas, mute, and visible version.
7. Validate on physical iPad/iPhone Safari before claiming device-level verification; browser emulation is not a substitute.
