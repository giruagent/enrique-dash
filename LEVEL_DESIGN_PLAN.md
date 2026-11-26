# Enrique Dash — 20-Level Course Plan

## How the courses are composed

Run `npm run levels:compose` to deterministically rebuild every layout from its level-id seed and the v0.6.0 blueprint. The composer preserves course identity, art, music, speed and length; lays combo phrases and fair rests against the real portal speed profile; places low bridges and apex shards; and rejects any layout that the unchanged auto-player cannot finish without a death or dead-band violation. See [the level verification pipeline](docs/LEVEL_PIPELINE.md) for the shared physics and checks.

## Individual designs

### 01 — Neon Run (78 units)
- **Signature:** A spike group into a gap in the same jump.
- **Rhythm:** 2 + 1 + 1 + 2 input beats; target 0.62 inputs/s, measured 0.63; 3 gaps and 0 compound bridges.
- **Design hook:** Neon Run lays out 3 spike groups and 3 gaps.
- **Layout:** Hazard groups at 9.84, 33.57 (double), 68.16; gaps at 15.53 (2.5), 51.61 (2.5), 63.75 (4.3); bridges: none; portals: none; enemies: none; shards: none.
- **Audio:** 118 BPM with the existing sixteen-step procedural motif.

### 02 — Skyline Rush (88 units)
- **Signature:** Gap, then a vent group in the same jump.
- **Rhythm:** 1 + 2 + 2 + 2 input beats; target 0.64 inputs/s, measured 0.67; 3 gaps and 0 compound bridges.
- **Design hook:** Skyline Rush lays out 4 vent groups, 3 gaps, 1 portal (float) and 1 apex shard.
- **Layout:** Hazard groups at 10.08, 32.69, 55.31, 77.92; gaps at 28.31 (4.3), 50.92 (4.3), 73.54 (4.3); bridges: none; portals: float at 38.89; enemies: none; shards: 7.67 (height 1.9).
- **Audio:** 124 BPM with the existing sixteen-step procedural motif.

### 03 — Solar Flare (92 units)
- **Signature:** Gap, then a solar panel group in the same jump.
- **Rhythm:** 1 + 2 + 2 + 2 input beats; target 0.66 inputs/s, measured 0.65; 3 gaps and 0 compound bridges.
- **Design hook:** Solar Flare lays out 4 solar panel groups, 3 gaps, 1 portal (spring) and 1 apex shard.
- **Layout:** Hazard groups at 10.2, 33.93, 57.8, 81.8; gaps at 29.63 (4.2), 53.36 (4.3), 77.23 (4.5); bridges: none; portals: spring at 40.54; enemies: none; shards: 7.55 (height 1.9).
- **Audio:** 130 BPM with the existing sixteen-step procedural motif.

### 04 — Gravity Garden (96 units)
- **Signature:** A vine group into a gap in the same jump.
- **Rhythm:** 3 + 2 + 3 input beats; target 0.68 inputs/s, measured 0.71; 4 gaps and 0 compound bridges.
- **Design hook:** Gravity Garden lays out 4 vine groups, 4 gaps, 1 portal (float) and 1 apex shard.
- **Layout:** Hazard groups at 10.2, 20.71, 50.37, 85.8; gaps at 16 (4.6), 45.8 (4.5), 75.47 (2.5), 81.37 (4.3); bridges: none; portals: float at 29.24; enemies: none; shards: 8.12 (height 1.9).
- **Audio:** 110 BPM with the existing sixteen-step procedural motif.

### 05 — Pixel Pier (100 units)
- **Signature:** A pixel block group into a gap in the same jump.
- **Rhythm:** 3 + 2 + 3 input beats; target 0.70 inputs/s, measured 0.69; 3 gaps and 1 compound bridge.
- **Design hook:** Pixel Pier lays out 5 pixel block groups, 3 gaps, 1 low pier bridge, 1 portal (spring) and 1 apex shard.
- **Layout:** Hazard groups at 10.32, 47.64, 53.6, 83.81, 89.68; gaps at 16.09 (2.5), 22.05 (2.5), 79.19 (4.5); bridges: pier at 22.05, width 2.5, height 0.05; portals: spring at 30.75; enemies: none; shards: 8.01 (height 1.9).
- **Audio:** 136 BPM with the existing sixteen-step procedural motif.

### 06 — Midnight Circuit (104 units)
- **Signature:** A circuit beam group into a gap in the same jump.
- **Rhythm:** 2 + 3 + 3 input beats; target 0.72 inputs/s, measured 0.70; 3 gaps and 1 compound bridge.
- **Design hook:** Midnight Circuit lays out 5 circuit beam groups, 3 gaps, 1 low curb bridge, 1 portal (dash) and 1 apex shard.
- **Layout:** Hazard groups at 10.44, 49.34, 55.37, 87.53, 93.56; gaps at 16.38 (2.5), 43.71 (5), 82.71 (4.7); bridges: curb at 16.38, width 2.5, height 0.05; portals: dash at 25.67; enemies: none; shards: 8.68 (height 1.9).
- **Audio:** 140 BPM with the existing sixteen-step procedural motif.

### 07 — Candy Comet (108 units)
- **Signature:** A candy cane group into a gap in the same jump.
- **Rhythm:** 3 + 3 + 3 input beats; target 0.74 inputs/s, measured 0.73; 4 gaps and 1 compound bridge.
- **Design hook:** Candy Comet lays out 4 candy cane groups, 4 gaps, 1 low nougat bridge, 1 portal (spring), 1 crawler and 1 apex shard.
- **Layout:** Hazard groups at 10.56, 49.04, 59.39 (double), 85.66; gaps at 16.66 (2.5), 22.76 (2.5), 54.94 (4.3), 91.77 (4.8); bridges: nougat at 22.76, width 2.5, height 0.05; portals: spring at 31.7; enemies: crawler at 96.64; shards: 8.28 (height 1.9).
- **Audio:** 126 BPM with the existing sixteen-step procedural motif.

### 08 — Aqua Pulse (112 units)
- **Signature:** A coral group into a gap in the same jump.
- **Rhythm:** 3 + 3 + 3 input beats; target 0.76 inputs/s, measured 0.71; 5 gaps and 3 compound bridges.
- **Design hook:** Aqua Pulse lays out 3 coral groups, 5 gaps, 3 low reef bridges, 1 portal (float), 1 crawler and 1 apex shard.
- **Layout:** Hazard groups at 10.68, 50.12, 62.46 (double); gaps at 16.85 (2.5), 23.02 (2.5), 56.29 (2.5), 89.56 (2.5), 95.73 (4.7); bridges: reef at 16.85, width 2.5, height 0.05; reef at 23.02, width 2.5, height 0.05; reef at 56.29, width 2.5, height 0.05; portals: float at 32.24; enemies: crawler at 100.52; shards: 8.23 (height 1.9).
- **Audio:** 132 BPM with the existing sixteen-step procedural motif.

### 09 — Crystal Cavern (116 units)
- **Signature:** Two crystal beam groups in one jump.
- **Rhythm:** 4 + 3 + 3 input beats; target 0.78 inputs/s, measured 0.78; 4 gaps and 2 compound bridges.
- **Design hook:** Crystal Cavern lays out 5 crystal beam groups, 4 gaps, 2 low crystal bridges, 1 portal (phase), 1 drone and 1 apex shard.
- **Layout:** Hazard groups at 10.8, 16.84, 55.2, 61.44, 93.57; gaps at 23.08 (2.5), 29.32 (2.5), 67.68 (2.5), 99.71 (4.6); bridges: crystal at 29.32, width 2.5, height 0.05; crystal at 67.68, width 2.5, height 0.05; portals: phase at 39.54; enemies: drone at 104.4; shards: 9.15 (height 1.9).
- **Audio:** 116 BPM with the existing sixteen-step procedural motif.

### 10 — Stormbreaker (120 units)
- **Signature:** A storm debris group into a gap in the same jump.
- **Rhythm:** 3 + 3 + 4 input beats; target 0.80 inputs/s, measured 0.79; 6 gaps and 5 compound bridges.
- **Design hook:** Stormbreaker lays out 3 storm debris groups, 6 gaps, 5 low cliff bridges, 2 portals (float and dash), 1 drone and 1 apex shard.
- **Layout:** Hazard groups at 10.92, 50.7, 91.06; gaps at 17.23 (2.5), 23.54 (2.5), 56.8 (2.5), 63.11 (2.5), 97.37 (2.5), 103.68 (4.5); bridges: cliff at 17.23, width 2.5, height 0.05; cliff at 23.54, width 2.5, height 0.05; cliff at 56.8, width 2.5, height 0.05; cliff at 63.11, width 2.5, height 0.05; cliff at 97.37, width 2.5, height 0.05; portals: float at 32.77, dash at 72.62; enemies: drone at 108.28; shards: 8.45 (height 1.9).
- **Audio:** 144 BPM with the existing sixteen-step procedural motif.

### 11 — Final Orbit (124 units)
- **Signature:** Two asteroid groups in one jump.
- **Rhythm:** 4 + 4 + 3 input beats; target 0.82 inputs/s, measured 0.85; 5 gaps and 5 compound bridges.
- **Design hook:** Final Orbit lays out 5 asteroid groups, 5 gaps, 5 low gantry bridges, 2 portals (spring and dash), 1 drone and 1 apex shard.
- **Layout:** Hazard groups at 11.04, 17.42, 55.35, 67.9, 99.4; gaps at 23.7 (2.5), 30.08 (2.5), 61.53 (2.5), 74.18 (2.5), 105.78 (2.5); bridges: gantry at 23.7, width 2.5, height 0.05; gantry at 30.08, width 2.5, height 0.05; gantry at 61.53, width 2.5, height 0.05; gantry at 74.18, width 2.5, height 0.05; gantry at 105.78, width 2.5, height 0.05; portals: spring at 38.67, dash at 82.76; enemies: drone at 112.16; shards: 8.55 (height 1.9).
- **Audio:** 150 BPM with the existing sixteen-step procedural motif.

### 12 — Mosslight Hollow (128 units)
- **Signature:** Gap, then a moss stump group in the same jump.
- **Rhythm:** 4 + 4 + 4 input beats; target 0.84 inputs/s, measured 0.86; 7 gaps and 5 compound bridges.
- **Design hook:** Mosslight Hollow lays out 4 moss stump groups, 7 gaps, 5 low hover bridges, 1 portal (float), 1 drone and 2 apex shards.
- **Layout:** Hazard groups at 17.42, 55, 67.65, 103.4; gaps at 11.04 (2.5), 23.8 (2.5), 30.18 (2.5), 61.27 (2.5), 73.93 (2.5), 98.75 (4.6), 109.78 (2.5); bridges: hover at 23.8, width 2.5, height 0.05; hover at 30.18, width 2.5, height 0.05; hover at 61.27, width 2.5, height 0.05; hover at 73.93, width 2.5, height 0.05; hover at 109.78, width 2.5, height 0.05; portals: float at 38.62; enemies: drone at 116.16; shards: 9.39 (height 1.9), 18.12 (height 1.88).
- **Audio:** 112 BPM with the existing sixteen-step procedural motif.

### 13 — Clockwork Orchard (132 units)
- **Signature:** Two gear fruit groups in one jump.
- **Rhythm:** 4 + 4 + 4 input beats; target 0.86 inputs/s, measured 0.88; 6 gaps and 5 compound bridges.
- **Design hook:** Clockwork Orchard lays out 5 gear fruit groups, 6 gaps, 5 low trellis bridges, 2 portals (dash and spring), 1 drone and 2 apex shards.
- **Layout:** Hazard groups at 11.16, 17.5, 56.75, 69.65, 107.14; gaps at 23.95 (2.5), 30.4 (2.5), 63.2 (2.5), 75.89 (2.5), 102.29 (4.8), 113.59 (2.5); bridges: trellis at 23.95, width 2.5, height 0.05; trellis at 30.4, width 2.5, height 0.05; trellis at 63.2, width 2.5, height 0.05; trellis at 75.89, width 2.5, height 0.05; trellis at 113.59, width 2.5, height 0.05; portals: dash at 39.36, spring at 84.86; enemies: drone at 120.04; shards: 8.64 (height 1.9), 16.72 (height 1.89).
- **Audio:** 120 BPM with the existing sixteen-step procedural motif.

### 14 — Tidal Foundry (136 units)
- **Signature:** Two foundry pipe groups in one jump.
- **Rhythm:** 4 + 4 + 4 input beats; target 0.88 inputs/s, measured 0.85; 6 gaps and 5 compound bridges.
- **Design hook:** Tidal Foundry lays out 5 foundry pipe groups, 6 gaps, 5 low conveyor bridges, 1 portal (dash), 1 drone and 2 apex shards.
- **Layout:** Hazard groups at 11.16, 17.4, 59.9, 72.8, 111.14; gaps at 23.75 (2.5), 30.19 (2.5), 66.35 (2.5), 79.25 (2.5), 106.29 (4.8), 117.59 (2.5); bridges: conveyor at 23.75, width 2.5, height 0.05; conveyor at 30.19, width 2.5, height 0.05; conveyor at 66.35, width 2.5, height 0.05; conveyor at 79.25, width 2.5, height 0.05; conveyor at 117.59, width 2.5, height 0.05; portals: dash at 40.29; enemies: drone at 124.04; shards: 8.41 (height 1.9), 16.63 (height 1.9).
- **Audio:** 138 BPM with the existing sixteen-step procedural motif.

### 15 — Paper Moon Parade (140 units)
- **Signature:** A paper banner group into a gap in the same jump.
- **Rhythm:** 5 + 4 + 4 input beats; target 0.90 inputs/s, measured 0.87; 7 gaps and 3 compound bridges.
- **Design hook:** Paper Moon Parade lays out 5 paper banner groups, 7 gaps, 3 low float bridges, 2 portals (spring), 1 drone and 2 apex shards.
- **Layout:** Hazard groups at 11.28, 22.6, 62.21, 73.57, 113.18; gaps at 17.69 (4.8), 28.9 (2.5), 35.42 (2.5), 68.52 (5), 79.98 (2.5), 119.7 (2.5), 126.22 (2.5); bridges: float at 35.42, width 2.5, height 0.05; float at 79.98, width 2.5, height 0.05; float at 126.22, width 2.5, height 0.05; portals: spring at 44.53, spring at 89.09; enemies: drone at 106.77; shards: 9.37 (height 1.9), 28.76 (height 1.89).
- **Audio:** 126 BPM with the existing sixteen-step procedural motif.

### 16 — Verdant Relay (144 units)
- **Signature:** A thorn group into a gap in the same jump.
- **Rhythm:** 3 + 3 + 4 + 4 input beats; target 0.92 inputs/s, measured 0.91; 7 gaps and 5 compound bridges.
- **Design hook:** Verdant Relay lays out 6 thorn groups, 7 gaps, 5 low leaf bridges, 1 portal (float), 1 drone and 3 apex shards.
- **Layout:** Hazard groups at 11.28, 43.57, 49.88, 80.91, 124.92, 131.44 (double); gaps at 17.59 (2.5), 24.11 (2.5), 56.39 (2.5), 75.86 (5), 87.22 (2.5), 93.74 (2.5), 119.72 (5); bridges: leaf at 17.59, width 2.5, height 0.05; leaf at 24.11, width 2.5, height 0.05; leaf at 56.39, width 2.5, height 0.05; leaf at 87.22, width 2.5, height 0.05; leaf at 93.74, width 2.5, height 0.05; portals: float at 63.01; enemies: drone at 113.2; shards: 8.98 (height 1.9), 41.25 (height 1.9), 49.11 (height 1.86).
- **Audio:** 120 BPM with the existing sixteen-step procedural motif.

### 17 — Shatterglass Express (146 units)
- **Signature:** A glass shard group into a gap in the same jump.
- **Rhythm:** 3 + 3 + 4 + 4 input beats; target 0.95 inputs/s, measured 0.94; 7 gaps and 5 compound bridges.
- **Design hook:** Shatterglass Express lays out 6 glass shard groups, 7 gaps, 5 low rail bridges, 2 portals (phase and dash), 1 drone and 2 apex shards.
- **Layout:** Hazard groups at 11.4, 42.88, 49.47, 83.86, 126.73, 133.32 (double); gaps at 17.99 (2.5), 24.58 (2.5), 56.05 (2.5), 77.28 (2.5), 90.45 (2.5), 97.04 (2.5), 121.93 (4.7); bridges: rail at 17.99, width 2.5, height 0.05; rail at 24.58, width 2.5, height 0.05; rail at 56.05, width 2.5, height 0.05; rail at 90.45, width 2.5, height 0.05; rail at 97.04, width 2.5, height 0.05; portals: phase at 30.8, dash at 63.27; enemies: drone at 115.34; shards: 9 (height 1.9), 40.51 (height 1.9).
- **Audio:** 148 BPM with the existing sixteen-step procedural motif.

### 18 — Cloudbreaker Causeway (148 units)
- **Signature:** A cloudstone group into a gap in the same jump.
- **Rhythm:** 3 + 4 + 4 + 4 input beats; target 0.97 inputs/s, measured 0.96; 8 gaps and 3 compound bridges.
- **Design hook:** Cloudbreaker Causeway lays out 6 cloudstone groups, 8 gaps, 3 low cloudstone bridges, 1 portal (shield), 1 drone and 2 apex shards.
- **Layout:** Hazard groups at 11.4, 43.91, 55.45, 86.33, 130.12, 136.6; gaps at 17.99 (2.5), 24.58 (2.5), 50.5 (4.9), 62.04 (2.5), 81.37 (4.9), 92.91 (2.5), 99.5 (2.5), 125.32 (4.7); bridges: cloudstone at 24.58, width 2.5, height 0.05; cloudstone at 62.04, width 2.5, height 0.05; cloudstone at 99.5, width 2.5, height 0.05; portals: shield at 68.61; enemies: drone at 118.84; shards: 8.68 (height 1.9), 17.23 (height 1.9).
- **Audio:** 128 BPM with the existing sixteen-step procedural motif.

### 19 — Magnetar Foundry (149 units)
- **Signature:** A magnetic core group into a gap in the same jump.
- **Rhythm:** 5 + 5 + 4 input beats; target 1.00 inputs/s, measured 0.97; 7 gaps and 7 compound bridges.
- **Design hook:** Magnetar Foundry lays out 6 magnetic core groups, 7 gaps, 7 low magnetic bridges, 2 portals (dash), 1 drone and 2 apex shards.
- **Layout:** Hazard groups at 11.52, 24.62, 63.21, 76.52, 83.07, 121.67; gaps at 17.96 (2.5), 31.28 (2.5), 37.93 (2.5), 69.87 (2.5), 89.73 (2.5), 128.32 (2.5), 134.98 (2.5); bridges: magnetic at 17.96, width 2.5, height 0.05; magnetic at 31.28, width 2.5, height 0.05; magnetic at 37.93, width 2.5, height 0.05; magnetic at 69.87, width 2.5, height 0.05; magnetic at 89.73, width 2.5, height 0.05; magnetic at 128.32, width 2.5, height 0.05; magnetic at 134.98, width 2.5, height 0.05; portals: dash at 47.92, dash at 99.72; enemies: drone at 115.01; shards: 9.02 (height 1.9), 25.43 (height 1.86).
- **Audio:** 152 BPM with the existing sixteen-step procedural motif.

### 20 — Eclipse Crown (150 units)
- **Signature:** A corona group into a gap in the same jump.
- **Rhythm:** 6 + 5 + 5 input beats; target 1.00 inputs/s, measured 1.02; 8 gaps and 7 compound bridges.
- **Design hook:** Eclipse Crown lays out 7 corona groups, 8 gaps, 7 low observatory bridges, 2 portals (shield and float), 1 drone and 3 apex shards.
- **Layout:** Hazard groups at 11.52, 24.83, 31.38, 64.86, 78.06, 84.51, 122.88; gaps at 18.18 (2.5), 37.93 (2.5), 44.59 (2.5), 71.41 (2.5), 90.95 (2.5), 117.87 (4.9), 129.32 (2.5), 135.98 (2.5); bridges: observatory at 18.18, width 2.5, height 0.05; observatory at 37.93, width 2.5, height 0.05; observatory at 44.59, width 2.5, height 0.05; observatory at 71.41, width 2.5, height 0.05; observatory at 90.95, width 2.5, height 0.05; observatory at 129.32, width 2.5, height 0.05; observatory at 135.98, width 2.5, height 0.05; portals: shield at 51.48, float at 97.84; enemies: drone at 111.22; shards: 9.1 (height 1.9), 25.72 (height 1.85), 33.66 (height 1.9).
- **Audio:** 154 BPM with the existing sixteen-step procedural motif.

## Playtest checklist

1. Confirm a single jump can clear each authored gap from its marked approach and that the destination has a clean landing window.
2. Confirm raised bridges are reachable with one jump and never require a midair second jump.
3. Confirm each portal effect is readable before its next hazard and does not imply protection from gaps.
4. Confirm crawlers can be stomped or jumped, drones have a clear vertical avoidance window, and shield portals can absorb a single enemy/hazard.
5. Test the collectible HUD and completion summary on courses 5, 8–13, and 15–20.
6. Run every course on a desktop browser and narrow mobile viewport; verify touch targets, fullscreen, safe areas, mute, and visible version.
7. Validate on physical iPad/iPhone Safari before claiming device-level verification; browser emulation is not a substitute.
