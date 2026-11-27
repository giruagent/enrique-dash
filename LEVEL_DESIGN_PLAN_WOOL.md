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
- **Rhythm:** 1 + 2 + 2 + 2 + 1 input beats; target 0.68 inputs/s, measured 0.71; 3 open gaps and 1 kerb and 1 bounce pad.
- **Design hook:** Loom Lake lays four hazard groups across spike, yarn spike, felt block and spike, opens three gaps, raises a kerb at 15 and a pad at 40, adds one beetle and threads a five-shard arc over the second hole.
- **Layout:** Hazard groups at 34.64 [spike], 59.45 [yarn-spike], 74.6 [felt-block], 82.16 [spike]; gaps at 27.06 (2.5), 51.86 (2.5), 67.02 (2.5); platforms: kerb at 15, width 4.5, height 0.45; bounce at 40, width 3.5, height 0.35; portals: none; enemies: bunny at 9.84; shards: 8.72 (height 1.85), 17.25 (height 1.65), 25.28 (height 1.24, arc of 3), 26.92 (height 1.85), 28.49 (height 1.23). arches: none; pom-poms: 3
- **Audio:** 118 BPM with the existing sixteen-step procedural motif.

### 06 — Patchwork Square (96 units)
- **Signature:** A pad pops you over the square's first hole, a float carries the second crossing, and a beetle and a bunny share the long middle stretch.
- **Rhythm:** 2 + 2 + 2 + 2 input beats; target 0.70 inputs/s, measured 0.69; 4 open gaps and 1 kerb and 1 bounce pad.
- **Design hook:** Patchwork Square threads four gaps around a pad at 24.5 and a kerb at 70, puts a float portal at 40.3, and fills the lane with two spike groups, a beetle at 34.6 and a bunny at 79.9 behind a five-shard arc.
- **Layout:** Hazard groups at 17.61 (double) [spike], 62.92 (double) [yarn-spike]; gaps at 9.96 (2.5), 38.29 (2.5), 55.28 (2.5), 83.54 (2.5); platforms: kerb at 70, width 4.5, height 0.45; bounce at 24.5, width 3.5, height 0.35; portals: float at 40.33; enemies: beetle at 34.59, bunny at 79.91; shards: 9.8 (height 1.85), 72.25 (height 1.65), 26.42 (height 1.21, arc of 3), 27.32 (height 1.3), 28.36 (height 1.24). arches: none; pom-poms: 4
- **Audio:** 120 BPM with the existing sixteen-step procedural motif.

### 07 — Bobble Bridge (100 units)
- **Signature:** A spike run of 4 hazard groups over 4 open gaps, every landing clear.
- **Rhythm:** 1 + 2 + 1 + 1 + 2 + 2 input beats; target 0.72 inputs/s, measured 0.76; 4 open gaps and 1 kerb and 1 bounce pad.
- **Design hook:** Bobble Bridge lays out 4 spike groups, 4 open gaps, 1 portal (spring), 1 crawler and 1 shard.
- **Layout:** Hazard groups at 34.59 [spike], 58.21 [yarn-spike], 73.67 [felt-block]; gaps at 26.88 (2.5), 48.08 (2.5), 65.96 (2.5), 81.41 (2.5); platforms: kerb at 15, width 4.5, height 0.45; bounce at 38.5, width 3.5, height 0.35; portals: spring at 49.29; enemies: beetle at 89.12, bunny at 10.08; shards: 8.91 (height 1.85), 17.25 (height 1.65), 24.99 (height 1.24, arc of 3), 26.67 (height 1.85), 28.28 (height 1.23). arches: none; pom-poms: 4
- **Audio:** 122 BPM with the existing sixteen-step procedural motif.

## Playtest checklist

1. Confirm a single jump can clear each authored gap from its marked approach and that the destination has a clean landing window.
2. Confirm raised bridges are reachable with one jump and never require a midair second jump.
3. Confirm each portal effect is readable before its next hazard and does not imply protection from gaps.
4. Confirm crawlers can be stomped or jumped, drones have a clear vertical avoidance window, and shield portals can absorb a single enemy/hazard.
5. Test the collectible HUD and completion summary on every course that carries shards.
6. Run every course on a desktop browser and narrow mobile viewport; verify touch targets, fullscreen, safe areas, mute, and visible version.
7. Validate on physical iPad/iPhone Safari before claiming device-level verification; browser emulation is not a substitute.
