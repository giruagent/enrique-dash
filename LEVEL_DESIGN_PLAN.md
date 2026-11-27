# Enrique Dash — 20-Level Course Plan

## How the courses are composed

Run `npm run levels:compose` to deterministically rebuild every layout from its level-id seed and the v0.6.0 blueprint. The composer preserves course identity, art, music, speed and length; lays deliberate combo beats and full reaction rests against the real portal speed profile; keeps bridges optional, places apex shards, and writes each signature and design hook from the layout it actually built. It rejects any layout that the unchanged auto-player cannot finish without a death, a dead-band violation or a short first-beat telegraph. See [the level verification pipeline](docs/LEVEL_PIPELINE.md) for the shared physics and checks.

## Individual designs

### 01 — Neon Run (78 units)
- **Signature:** Three open gaps on a clean straight, each one a single jump.
- **Rhythm:** 2 + 1 + 1 + 2 input beats; target 0.62 inputs/s, measured 0.63; 3 open gaps and 0 bridges.
- **Design hook:** Neon Run lays out 3 spike groups and 3 gaps.
- **Layout:** Hazard groups at 9.84, 31.54 (double), 68.16; gaps at 13.5 (2.5), 49.58 (2.5), 60.58 (2.5); bridges: none; portals: none; enemies: none; shards: none.
- **Audio:** 118 BPM with the existing sixteen-step procedural motif.

### 02 — Skyline Rush (88 units)
- **Signature:** A float portal stretches the arc you need over the middle hole.
- **Rhythm:** 1 + 2 + 2 + 2 input beats; target 0.64 inputs/s, measured 0.67; 3 open gaps and 0 bridges.
- **Design hook:** Skyline Rush lays out 4 vent groups, 3 gaps, 1 portal (float) and 1 shard.
- **Layout:** Hazard groups at 10.08, 34.59, 59.1, 77.92; gaps at 26.88 (2.5), 51.39 (2.5), 70.21 (2.5); bridges: none; portals: float at 36.6; enemies: none; shards: 8.56 (height 1.85).
- **Audio:** 124 BPM with the existing sixteen-step procedural motif.

### 03 — Solar Flare (92 units)
- **Signature:** A spring portal turns the last gap into a long, slow hop.
- **Rhythm:** 1 + 2 + 2 + 2 input beats; target 0.66 inputs/s, measured 0.65; 3 open gaps and 0 bridges.
- **Design hook:** Solar Flare lays out 4 solar panel groups, 3 gaps, 1 portal (spring) and 1 shard.
- **Layout:** Hazard groups at 10.2, 34.99, 59.78, 81.8; gaps at 27.2 (2.5), 51.99 (2.5), 74.01 (2.5); bridges: none; portals: spring at 37.03; enemies: none; shards: 8.6 (height 1.85).
- **Audio:** 130 BPM with the existing sixteen-step procedural motif.

### 04 — Gravity Garden (96 units)
- **Signature:** Float first, so both gaps ask for a lazier jump than they look.
- **Rhythm:** 3 + 2 + 3 input beats; target 0.68 inputs/s, measured 0.71; 3 open gaps and 0 bridges.
- **Design hook:** Gravity Garden lays out 5 vine groups, 3 gaps, 1 portal (float) and 1 shard.
- **Layout:** Hazard groups at 10.2, 21.71, 49.86, 78.01, 85.8; gaps at 13.92 (2.5), 42.07 (2.5), 70.22 (2.5); bridges: none; portals: float at 24.15; enemies: none; shards: 8.96 (height 1.85).
- **Audio:** 110 BPM with the existing sixteen-step procedural motif.

### 05 — Pixel Pier (100 units)
- **Signature:** A crawler on the opening straight, then a kerb you jump onto for the shard.
- **Rhythm:** 3 + 2 + 3 input beats; target 0.70 inputs/s, measured 0.69; 3 open gaps and 1 bridge.
- **Design hook:** Pixel Pier lays out 4 pixel block groups, 3 gaps, 1 kerb, 1 portal (spring), 1 crawler and 2 shards.
- **Layout:** Hazard groups at 21.89, 51.84, 81.8, 89.68; gaps at 14.01 (2.5), 43.96 (2.5), 73.91 (2.5); bridges: kerb at 29.5, width 4.5, height 0.45; portals: spring at 24.54; enemies: crawler at 10.32; shards: 9.15 (height 1.85), 31.75 (height 1.65).
- **Audio:** 136 BPM with the existing sixteen-step procedural motif.

### 06 — Midnight Circuit (104 units)
- **Signature:** Dash compresses the run-up, so the second gap arrives early.
- **Rhythm:** 2 + 3 + 3 input beats; target 0.72 inputs/s, measured 0.70; 2 open gaps and 1 bridge.
- **Design hook:** Midnight Circuit lays out 5 circuit beam groups, 2 gaps, 1 kerb, 1 portal (dash), 1 crawler and 2 shards.
- **Layout:** Hazard groups at 18.41 (double), 48.01, 57.9, 85.59, 93.56; gaps at 38.12 (2.5), 77.61 (2.5); bridges: kerb at 64.5, width 4.5, height 0.45; portals: dash at 20.78; enemies: crawler at 10.44; shards: 9.22 (height 1.85), 66.75 (height 1.65).
- **Audio:** 140 BPM with the existing sixteen-step procedural motif.

### 07 — Candy Comet (108 units)
- **Signature:** Four holes, one launcher, and a crawler waiting after the last of them.
- **Rhythm:** 3 + 3 + 3 input beats; target 0.74 inputs/s, measured 0.73; 4 open gaps and 1 bridge.
- **Design hook:** Candy Comet lays out 4 candy cane groups, 4 gaps, 1 kerb, 1 portal (spring), 1 crawler and 2 shards.
- **Layout:** Hazard groups at 10.56, 22.55, 55.82, 84.88; gaps at 14.48 (2.5), 47.75 (2.5), 59.67 (2.5), 88.57 (2.5); bridges: kerb at 31.5, width 4.5, height 0.45; portals: spring at 25.57; enemies: crawler at 96.64; shards: 9.12 (height 1.85), 33.75 (height 1.65).
- **Audio:** 126 BPM with the existing sixteen-step procedural motif.

### 08 — Aqua Pulse (112 units)
- **Signature:** Float across four holes, then a kerb for the shard.
- **Rhythm:** 4 + 3 + 3 input beats; target 0.76 inputs/s, measured 0.79; 4 open gaps and 1 bridge.
- **Design hook:** Aqua Pulse lays out 5 coral groups, 4 gaps, 1 kerb, 1 portal (float), 1 crawler and 2 shards.
- **Layout:** Hazard groups at 10.68, 18.84, 30.96, 61.81, 88.24; gaps at 22.8 (2.5), 53.65 (2.5), 65.55 (2.5), 92.36 (2.5); bridges: kerb at 76, width 4.5, height 0.45; portals: float at 34.82; enemies: crawler at 100.52; shards: 9.23 (height 1.85), 78.25 (height 1.65).
- **Audio:** 132 BPM with the existing sixteen-step procedural motif.

### 09 — Crystal Cavern (116 units)
- **Signature:** Phase through the wall of hazards, then jump the holes that follow.
- **Rhythm:** 4 + 3 + 3 input beats; target 0.78 inputs/s, measured 0.78; 4 open gaps and 2 bridges.
- **Design hook:** Crystal Cavern lays out 4 crystal beam groups, 4 gaps, 1 kerb and 1 island, 1 portal (phase), 1 drone and 1 crawler and 3 shards.
- **Layout:** Hazard groups at 22.83, 31.08, 63.77, 92.14; gaps at 14.58 (2.5), 55.52 (2.5), 67.7 (4.9), 96.15 (2.5); bridges: kerb at 79, width 4.5, height 0.45; island at 67.7, width 2.5, height 0.5; portals: phase at 34.01; enemies: drone at 104.4, crawler at 10.8; shards: 9.5 (height 1.85), 81.25 (height 1.65), 68.95 (height 1.7).
- **Audio:** 116 BPM with the existing sixteen-step procedural motif.

### 10 — Stormbreaker (120 units)
- **Signature:** Float opens the gaps up, dash closes the last one down again.
- **Rhythm:** 3 + 3 + 4 input beats; target 0.80 inputs/s, measured 0.79; 4 open gaps and 2 bridges.
- **Design hook:** Stormbreaker lays out 4 storm debris groups, 4 gaps, 1 kerb and 1 island, 2 portals (float and dash), 1 drone and 1 crawler and 3 shards.
- **Layout:** Hazard groups at 11.92, 43.5, 55.82, 93.62; gaps at 16.05 (4.9), 47.48 (2.5), 83.28 (2.5), 97.94 (2.5); bridges: kerb at 66, width 4.5, height 0.45; island at 16.05, width 2.5, height 0.5; portals: float at 19.35, dash at 59.12; enemies: drone at 108.28, crawler at 10.92; shards: 9.98 (height 1.81), 68.25 (height 1.65), 17.3 (height 1.7).
- **Audio:** 144 BPM with the existing sixteen-step procedural motif.

### 11 — Final Orbit (124 units)
- **Signature:** Spring into a dash: one arc is long, the next is fast.
- **Rhythm:** 4 + 4 + 3 input beats; target 0.82 inputs/s, measured 0.85; 4 open gaps and 2 bridges.
- **Design hook:** Final Orbit lays out 5 asteroid groups, 4 gaps, 1 kerb and 1 island, 2 portals (spring and dash), 1 drone and 1 crawler and 3 shards.
- **Layout:** Hazard groups at 23.73, 32.16, 62.78, 75.15 (double), 97.34; gaps at 15.3 (2.5), 54.34 (2.5), 66.72 (2.5), 101.7 (4.9); bridges: kerb at 84.5, width 4.5, height 0.45; island at 101.7, width 2.5, height 0.5; portals: spring at 34.82, dash at 77.82; enemies: drone at 112.16, crawler at 11.04; shards: 9.69 (height 1.85), 86.75 (height 1.65), 102.95 (height 1.7).
- **Audio:** 150 BPM with the existing sixteen-step procedural motif.

### 12 — Mosslight Hollow (128 units)
- **Signature:** Five holes and two kerbs: the shards are all above the step-ups.
- **Rhythm:** 4 + 4 + 4 input beats; target 0.84 inputs/s, measured 0.86; 4 open gaps and 3 bridges.
- **Design hook:** Mosslight Hollow lays out 5 moss stump groups, 4 gaps, 1 kerb, 1 island and 1 perch, 1 portal (float), 1 drone and 2 crawlers and 4 shards.
- **Layout:** Hazard groups at 12.04, 24.34, 63.94, 95.27, 103.7; gaps at 15.91 (2.5), 55.51 (2.5), 68.2 (4.9), 107.73 (2.5); bridges: kerb at 35.5, width 4.5, height 0.45; island at 68.2, width 2.5, height 0.5; perch at 49.16, width 4.5, height 0.45; portals: float at 27.59; enemies: drone at 116.16, crawler at 11.04, crawler at 51.41; shards: 10.1 (height 1.84), 15.79 (height 1.75), 37.75 (height 1.65), 69.45 (height 1.7).
- **Audio:** 112 BPM with the existing sixteen-step procedural motif.

### 13 — Clockwork Orchard (132 units)
- **Signature:** Dash into spring, with gears turning between the five holes.
- **Rhythm:** 4 + 4 + 4 input beats; target 0.86 inputs/s, measured 0.88; 5 open gaps and 3 bridges.
- **Design hook:** Clockwork Orchard lays out 4 gear fruit groups, 5 gaps, 1 kerb, 1 island and 1 perch, 2 portals (dash and spring), 1 drone and 2 crawlers and 4 shards.
- **Layout:** Hazard groups at 32.28, 63.43, 78.42 (double), 107.53; gaps at 15.23 (2.5), 52.86 (4.9), 67.85 (2.5), 99 (2.5), 111.52 (2.5); bridges: kerb at 39, width 4.5, height 0.45; island at 52.86, width 2.5, height 0.5; perch at 21.5, width 4.5, height 0.45; portals: dash at 34.75, spring at 80.89; enemies: drone at 120.04, crawler at 11.16, crawler at 23.75; shards: 9.81 (height 1.85), 15.06 (height 1.66), 41.25 (height 1.65), 54.11 (height 1.7).
- **Audio:** 120 BPM with the existing sixteen-step procedural motif.

### 14 — Tidal Foundry (136 units)
- **Signature:** One dash portal, five gaps, no second chances on the landing.
- **Rhythm:** 4 + 4 + 4 input beats; target 0.88 inputs/s, measured 0.85; 5 open gaps and 3 bridges.
- **Design hook:** Tidal Foundry lays out 4 foundry pipe groups, 5 gaps, 1 kerb, 1 island and 1 perch, 1 portal (dash), 1 drone and 2 crawlers and 4 shards.
- **Layout:** Hazard groups at 32.12, 65.31, 80.3 (double), 111.45; gaps at 15.07 (2.5), 54.74 (4.9), 69.73 (2.5), 102.92 (2.5), 115.52 (2.5); bridges: kerb at 40, width 4.5, height 0.45; island at 54.74, width 2.5, height 0.5; perch at 21.34, width 4.5, height 0.45; portals: dash at 34.83; enemies: drone at 124.04, crawler at 11.16, crawler at 23.59; shards: 9.81 (height 1.85), 14.91 (height 1.61), 42.25 (height 1.65), 55.99 (height 1.7).
- **Audio:** 138 BPM with the existing sixteen-step procedural motif.

### 15 — Paper Moon Parade (140 units)
- **Signature:** Two springs, five gaps: the parade never quite touches the ground.
- **Rhythm:** 5 + 4 + 4 input beats; target 0.90 inputs/s, measured 0.87; 5 open gaps and 3 bridges.
- **Design hook:** Paper Moon Parade lays out 5 paper banner groups, 5 gaps, 2 shelfs and 1 perch, 2 portals (spring), 1 drone and 2 crawlers and 4 shards.
- **Layout:** Hazard groups at 36.73 (double), 70.16, 82.73, 120.1, 128.72; gaps at 15.39 (2.5), 28.12 (2.5), 61.54 (2.5), 74.11 (2.5), 111.49 (2.5); bridges: shelf at 90, width 10, height 0.5; shelf at 43.5, width 10, height 0.5; perch at 21.76, width 4.5, height 0.45; portals: spring at 39.71, spring at 85.7; enemies: drone at 107.54, crawler at 11.28, crawler at 24.01; shards: 9.92 (height 1.85), 15.25 (height 1.67), 99.45 (height 1.7), 52.95 (height 1.7).
- **Audio:** 126 BPM with the existing sixteen-step procedural motif.

### 16 — Verdant Relay (144 units)
- **Signature:** Float through five holes and three shards spaced a beat apart.
- **Rhythm:** 3 + 3 + 4 + 4 input beats; target 0.92 inputs/s, measured 0.91; 5 open gaps and 3 bridges.
- **Design hook:** Verdant Relay lays out 6 thorn groups, 5 gaps, 2 hovers and 1 perch, 1 portal (float), 1 drone and 2 crawlers and 5 shards.
- **Layout:** Hazard groups at 23.85, 56.89, 81.32, 94.29, 122.82, 131.44 (double); gaps at 15.23 (2.5), 39.66 (2.5), 72.7 (2.5), 85.67 (2.5), 114.21 (2.5); bridges: hover at 99.5, width 4.5, height 0.45; hover at 28.5, width 4.5, height 0.45; perch at 46.03, width 4.5, height 0.45; portals: float at 61.16; enemies: drone at 110.1, crawler at 11.28, crawler at 48.28; shards: 9.92 (height 1.85), 15.1 (height 1.62), 22.77 (height 1.85), 101.75 (height 1.65), 30.75 (height 1.65).
- **Audio:** 120 BPM with the existing sixteen-step procedural motif.

### 17 — Shatterglass Express (146 units)
- **Signature:** Phase then dash: skip a hazard wall, then outrun the glass.
- **Rhythm:** 3 + 3 + 4 + 4 input beats; target 0.95 inputs/s, measured 0.94; 5 open gaps and 3 bridges.
- **Design hook:** Shatterglass Express lays out 6 glass shard groups, 5 gaps, 2 islands and 1 perch, 2 portals (phase and dash), 1 drone and 2 crawlers and 4 shards.
- **Layout:** Hazard groups at 24.42, 56.22, 81.82, 97.12, 124.61, 133.32 (double); gaps at 15.72 (2.5), 38.81 (2.5), 71.02 (4.9), 86.33 (4.9), 115.9 (2.5); bridges: island at 71.02, width 2.5, height 0.5; island at 86.33, width 2.5, height 0.5; perch at 45.27, width 4.5, height 0.45; portals: phase at 26.15, dash at 58; enemies: drone at 111.51, crawler at 11.4, crawler at 47.52; shards: 9.99 (height 1.85), 15.58 (height 1.73), 72.27 (height 1.7), 87.58 (height 1.7).
- **Audio:** 148 BPM with the existing sixteen-step procedural motif.

### 18 — Cloudbreaker Causeway (148 units)
- **Signature:** Shield for the wall, then six gaps to spend it before.
- **Rhythm:** 3 + 4 + 4 + 4 input beats; target 0.97 inputs/s, measured 0.96; 6 open gaps and 3 bridges.
- **Design hook:** Cloudbreaker Causeway lays out 6 cloudstone groups, 6 gaps, 2 hovers and 1 perch, 1 portal (shield), 1 drone and 2 crawlers and 4 shards.
- **Layout:** Hazard groups at 48.93, 61.63, 86.21, 99.15 (double), 127.89, 136.6; gaps at 15.63 (2.5), 40.22 (2.5), 52.92 (2.5), 77.5 (2.5), 90.45 (2.5), 119.18 (2.5); bridges: hover at 105, width 4.5, height 0.45; hover at 66, width 4.5, height 0.45; perch at 22.09, width 4.5, height 0.45; portals: shield at 63.53; enemies: drone at 115.03, crawler at 11.4, crawler at 24.34; shards: 9.99 (height 1.85), 15.48 (height 1.7), 107.25 (height 1.65), 68.25 (height 1.65).
- **Audio:** 128 BPM with the existing sixteen-step procedural motif.

### 19 — Magnetar Foundry (149 units)
- **Signature:** Two dash portals, five holes, and a drone waiting after the second.
- **Rhythm:** 5 + 5 + 5 input beats; target 1.00 inputs/s, measured 1.04; 5 open gaps and 3 bridges.
- **Design hook:** Magnetar Foundry lays out 7 magnetic core groups, 5 gaps, 2 islands and 1 perch, 2 portals (dash), 1 drone and 2 crawlers and 4 shards.
- **Layout:** Hazard groups at 37.68 (double), 63.53, 79, 87.8, 113.65, 124.56, 137.48; gaps at 15.72 (2.5), 28.88 (2.5), 52.62 (4.9), 68.09 (4.9), 128.68 (2.5); bridges: island at 52.62, width 2.5, height 0.5; island at 68.09, width 2.5, height 0.5; perch at 22.27, width 4.5, height 0.45; portals: dash at 39.47, dash at 89.59; enemies: drone at 102.74, crawler at 11.52, crawler at 24.52; shards: 10.03 (height 1.85), 15.59 (height 1.7), 53.87 (height 1.7), 69.34 (height 1.7).
- **Audio:** 152 BPM with the existing sixteen-step procedural motif.

### 20 — Eclipse Crown (150 units)
- **Signature:** Shield and float, five holes, three shards: the finale asks for both.
- **Rhythm:** 6 + 5 + 5 input beats; target 1.00 inputs/s, measured 1.02; 5 open gaps and 3 bridges.
- **Design hook:** Eclipse Crown lays out 8 corona groups, 5 gaps, 2 hovers and 1 perch, 2 portals (shield and float), 1 drone and 2 crawlers and 5 shards.
- **Layout:** Hazard groups at 24.44, 37.6, 38.6 (double), 79.54, 88.33, 116.44, 125.24, 138.48; gaps at 15.64 (2.5), 28.8 (2.5), 57.9 (2.5), 70.74 (2.5), 129.68 (2.5); bridges: hover at 95, width 4.5, height 0.45; hover at 45.5, width 4.5, height 0.45; perch at 64.45, width 4.5, height 0.45; portals: shield at 42.84, float at 92.58; enemies: drone at 107.64, crawler at 11.52, crawler at 66.7; shards: 10.03 (height 1.85), 15.49 (height 1.67), 23.15 (height 1.85), 97.25 (height 1.65), 47.75 (height 1.65).
- **Audio:** 154 BPM with the existing sixteen-step procedural motif.

## Playtest checklist

1. Confirm a single jump can clear each authored gap from its marked approach and that the destination has a clean landing window.
2. Confirm raised bridges are reachable with one jump and never require a midair second jump.
3. Confirm each portal effect is readable before its next hazard and does not imply protection from gaps.
4. Confirm crawlers can be stomped or jumped, drones have a clear vertical avoidance window, and shield portals can absorb a single enemy/hazard.
5. Test the collectible HUD and completion summary on courses 5, 8–13, and 15–20.
6. Run every course on a desktop browser and narrow mobile viewport; verify touch targets, fullscreen, safe areas, mute, and visible version.
7. Validate on physical iPad/iPhone Safari before claiming device-level verification; browser emulation is not a substitute.
