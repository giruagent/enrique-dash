# Enrique Dash — 20-Level Course Plan

## How the courses are composed

Run `npm run levels:compose` to deterministically rebuild every layout from its level-id seed and the v0.6.0 blueprint. The composer preserves course identity, art, music, speed and length; lays deliberate combo beats and full reaction rests against the real portal speed profile; keeps bridges optional, places apex shards, and writes each signature and design hook from the layout it actually built. It rejects any layout that the unchanged auto-player cannot finish without a death, a dead-band violation or a short first-beat telegraph. See [the level verification pipeline](docs/LEVEL_PIPELINE.md) for the shared physics and checks.

## Individual designs

### 01 — Neon Run (78 units)
- **Signature:** Three open gaps on a clean straight, each one a single jump.
- **Rhythm:** 2 + 1 + 1 + 2 input beats; target 0.62 inputs/s, measured 0.63; 3 open gaps and 0 bridges.
- **Design hook:** Six hazard-free openings and three holes, spaced so you can land and look before the next.
- **Layout:** Hazard groups at 9.84, 32.7 (double), 68.16; gaps at 14.66 (2.5), 48.15 (2.5), 58.24 (2.5); bridges: none; portals: none; enemies: none; shards: none.
- **Audio:** 118 BPM with the existing sixteen-step procedural motif.

### 02 — Skyline Rush (88 units)
- **Signature:** A float portal stretches the arc you need over the middle hole.
- **Rhythm:** 1 + 2 + 2 + 2 input beats; target 0.64 inputs/s, measured 0.67; 3 open gaps and 0 bridges.
- **Design hook:** Three gaps, one float portal before the second, and a shard parked at the top of the arc.
- **Layout:** Hazard groups at 10.08, 37.04, 57.54, 77.92; gaps at 26.88 (2.5), 47.38 (2.5), 67.76 (2.5); bridges: none; portals: float at 38.28; enemies: none; shards: 7.67 (height 1.9).
- **Audio:** 124 BPM with the existing sixteen-step procedural motif.

### 03 — Solar Flare (92 units)
- **Signature:** A spring portal turns the last gap into a long, slow hop.
- **Rhythm:** 1 + 2 + 2 + 2 input beats; target 0.66 inputs/s, measured 0.65; 3 open gaps and 0 bridges.
- **Design hook:** Three open gaps with a spring launcher ahead of the third and one shard above it.
- **Layout:** Hazard groups at 10.2, 37.35, 61.17, 81.8; gaps at 27.07 (2.5), 50.89 (2.5), 71.52 (2.5); bridges: none; portals: spring at 38.98; enemies: none; shards: 7.55 (height 1.9).
- **Audio:** 130 BPM with the existing sixteen-step procedural motif.

### 04 — Gravity Garden (96 units)
- **Signature:** Float first, so both gaps ask for a lazier jump than they look.
- **Rhythm:** 3 + 2 + 3 input beats; target 0.68 inputs/s, measured 0.71; 3 open gaps and 0 bridges.
- **Design hook:** Three holes with a float portal early, and the shard hangs where the low gravity carries you.
- **Layout:** Hazard groups at 10.2, 25.39, 51.82, 75.52, 85.8; gaps at 15.11 (2.5), 41.54 (2.5), 65.24 (2.5); bridges: none; portals: float at 27.33; enemies: none; shards: 8.12 (height 1.9).
- **Audio:** 110 BPM with the existing sixteen-step procedural motif.

### 05 — Pixel Pier (100 units)
- **Signature:** A crawler on the opening straight, then a kerb you jump onto for the shard.
- **Rhythm:** 3 + 2 + 3 input beats; target 0.70 inputs/s, measured 0.69; 3 open gaps and 1 bridge.
- **Design hook:** Crawler at the first beat, three gaps, a spring portal and one raised kerb with a shard over it.
- **Layout:** Hazard groups at 25.59, 52.43, 79.28, 89.68; gaps at 15.19 (2.5), 42.03 (2.5), 68.87 (2.5); bridges: kerb at 57.5, width 4, height 0.45; portals: spring at 27.56; enemies: crawler at 10.32; shards: 8.01 (height 1.9).
- **Audio:** 136 BPM with the existing sixteen-step procedural motif.

### 06 — Midnight Circuit (104 units)
- **Signature:** Dash compresses the run-up, so the second gap arrives early.
- **Rhythm:** 2 + 3 + 3 input beats; target 0.72 inputs/s, measured 0.70; 2 open gaps and 1 bridge.
- **Design hook:** Two gaps and a dash portal that shortens the approach, with a kerb to land the shard jump.
- **Layout:** Hazard groups at 20.96 (double), 48.8, 59.33, 83.04, 93.56; gaps at 35.75 (2.5), 72.51 (2.5); bridges: kerb at 41.5, width 4, height 0.45; portals: dash at 22.74; enemies: crawler at 10.44; shards: 8.68 (height 1.9).
- **Audio:** 140 BPM with the existing sixteen-step procedural motif.

### 07 — Candy Comet (108 units)
- **Signature:** Four holes, one launcher, and a crawler waiting after the last of them.
- **Rhythm:** 3 + 3 + 3 input beats; target 0.74 inputs/s, measured 0.73; 4 open gaps and 1 bridge.
- **Design hook:** Spring portal mid-course, four open gaps and a crawler at the finish line of the rhythm.
- **Layout:** Hazard groups at 10.56, 26.38, 56.53, 81.11; gaps at 15.74 (2.5), 45.89 (2.5), 61.61 (2.5), 85.99 (2.5); bridges: kerb at 33, width 4, height 0.45; portals: spring at 28.72; enemies: crawler at 96.64; shards: 8.28 (height 1.9).
- **Audio:** 126 BPM with the existing sixteen-step procedural motif.

### 08 — Aqua Pulse (112 units)
- **Signature:** Float across four holes, then a kerb for the shard.
- **Rhythm:** 4 + 3 + 3 input beats; target 0.76 inputs/s, measured 0.79; 4 open gaps and 1 bridge.
- **Design hook:** Four gaps under a float portal and one raised kerb near the end; a crawler guards the run-in.
- **Layout:** Hazard groups at 10.68, 21.45, 37.55 (double), 64.05, 84.82; gaps at 26.78 (2.5), 53.28 (2.5), 69.08 (2.5), 89.75 (2.5); bridges: kerb at 76, width 4, height 0.45; portals: float at 44.16; enemies: crawler at 100.52; shards: 8.23 (height 1.9).
- **Audio:** 132 BPM with the existing sixteen-step procedural motif.

### 09 — Crystal Cavern (116 units)
- **Signature:** Phase through the wall of hazards, then jump the holes that follow.
- **Rhythm:** 4 + 3 + 3 input beats; target 0.78 inputs/s, measured 0.78; 4 open gaps and 2 bridges.
- **Design hook:** Phase portal before a cluster, four gaps, two kerbs and a drone that closes the course.
- **Layout:** Hazard groups at 26.68, 37.57, 65.74, 88.22; gaps at 15.79 (2.5), 54.85 (2.5), 70.93 (2.5), 93.51 (2.5); bridges: kerb at 79, width 4, height 0.45; kerb at 44, width 4, height 0.45; portals: phase at 39.64; enemies: drone at 104.4, crawler at 10.8; shards: 9.15 (height 1.9), 81 (height 1.9).
- **Audio:** 116 BPM with the existing sixteen-step procedural motif.

### 10 — Stormbreaker (120 units)
- **Signature:** Float opens the gaps up, dash closes the last one down again.
- **Rhythm:** 3 + 3 + 4 input beats; target 0.80 inputs/s, measured 0.79; 4 open gaps and 2 bridges.
- **Design hook:** Float portal early, dash portal late, four holes, two kerbs and a drone-crawler pair.
- **Layout:** Hazard groups at 49.43, 50.43, 78.06, 91.71; gaps at 10.92 (2.5), 27.49 (2.5), 55.89 (2.5), 97.27 (2.5); bridges: kerb at 66, width 4, height 0.45; kerb at 37.5, width 4, height 0.45; portals: float at 31.22, dash at 59.66; enemies: drone at 108.28, crawler at 21.93; shards: 9.28 (height 1.9), 68 (height 1.9).
- **Audio:** 144 BPM with the existing sixteen-step procedural motif.

### 11 — Final Orbit (124 units)
- **Signature:** Spring into a dash: one arc is long, the next is fast.
- **Rhythm:** 4 + 4 + 3 input beats; target 0.82 inputs/s, measured 0.85; 4 open gaps and 2 bridges.
- **Design hook:** Spring then dash across four gaps, with two kerbs and a drone holding the final stretch.
- **Layout:** Hazard groups at 27.48, 28.48 (double), 58.3, 74.53, 92.6; gaps at 16.35 (2.5), 47.17 (2.5), 63.4 (2.5), 98.36 (2.5); bridges: kerb at 82, width 4, height 0.45; kerb at 36, width 4, height 0.45; portals: spring at 31.66, dash at 77.6; enemies: drone at 112.16, crawler at 11.04; shards: 8.55 (height 1.9), 84 (height 1.9).
- **Audio:** 150 BPM with the existing sixteen-step procedural motif.

### 12 — Mosslight Hollow (128 units)
- **Signature:** Five holes and two kerbs: the shards are all above the step-ups.
- **Rhythm:** 4 + 4 + 4 input beats; target 0.84 inputs/s, measured 0.86; 5 open gaps and 2 bridges.
- **Design hook:** Float portal, five gaps, two raised kerbs and a drone over the last third of the hollow.
- **Layout:** Hazard groups at 22.17, 38.4, 61.06, 77.29 (double), 88.49; gaps at 27.27 (2.5), 49.93 (2.5), 66.17 (2.5), 93.9 (2.5), 105.03 (2.5); bridges: kerb at 15, width 4, height 0.45; kerb at 81.5, width 4, height 0.45; portals: float at 43.24; enemies: drone at 116.16, crawler at 11.04; shards: 8.24 (height 1.9), 19.36 (height 1.9).
- **Audio:** 112 BPM with the existing sixteen-step procedural motif.

### 13 — Clockwork Orchard (132 units)
- **Signature:** Dash into spring, with gears turning between the five holes.
- **Rhythm:** 4 + 4 + 4 input beats; target 0.86 inputs/s, measured 0.88; 5 open gaps and 2 bridges.
- **Design hook:** Dash and spring portals split the course; five gaps, two kerbs and a drone at the far end.
- **Layout:** Hazard groups at 27.88, 28.88 (double), 58.78, 75.29, 103.11; gaps at 16.63 (2.5), 44.83 (2.5), 64.04 (2.5), 91.86 (2.5), 108.79 (2.5); bridges: kerb at 51, width 4, height 0.45; kerb at 82.5, width 4, height 0.45; portals: dash at 31.59, spring at 78.11; enemies: drone at 120.04, crawler at 11.16; shards: 8.64 (height 1.9), 16.47 (height 1.87).
- **Audio:** 120 BPM with the existing sixteen-step procedural motif.

### 14 — Tidal Foundry (136 units)
- **Signature:** One dash portal, five gaps, no second chances on the landing.
- **Rhythm:** 4 + 4 + 4 input beats; target 0.88 inputs/s, measured 0.85; 5 open gaps and 2 bridges.
- **Design hook:** Dash portal before the middle gap, two kerbs for shards, crawler and drone on the closing run.
- **Layout:** Hazard groups at 27.57, 38.82, 67.19, 83.7 (double), 107.42; gaps at 16.32 (2.5), 53.24 (2.5), 72.45 (2.5), 96.17 (2.5), 112.79 (2.5); bridges: kerb at 59.5, width 4, height 0.45; kerb at 31, width 4, height 0.45; portals: dash at 40.55; enemies: drone at 124.04, crawler at 11.16; shards: 8.41 (height 1.9), 16.18 (height 1.86).
- **Audio:** 138 BPM with the existing sixteen-step procedural motif.

### 15 — Paper Moon Parade (140 units)
- **Signature:** Two springs, five gaps: the parade never quite touches the ground.
- **Rhythm:** 5 + 4 + 4 input beats; target 0.90 inputs/s, measured 0.87; 5 open gaps and 2 bridges.
- **Design hook:** Spring portals at both ends of the course, five holes, two kerbs and a drone in between.
- **Layout:** Hazard groups at 28.39, 45.5, 75.34, 92.35 (double), 127.72, 128.72; gaps at 17.02 (2.5), 34.13 (2.5), 63.97 (2.5), 80.98 (2.5), 116.35 (2.5); bridges: kerb at 100, width 4, height 0.45; kerb at 53, width 4, height 0.45; portals: spring at 48.64, spring at 95.49; enemies: drone at 110.82, crawler at 11.28; shards: 9.37 (height 1.9), 16.88 (height 1.8).
- **Audio:** 126 BPM with the existing sixteen-step procedural motif.

### 16 — Verdant Relay (144 units)
- **Signature:** Float through five holes and three shards spaced a beat apart.
- **Rhythm:** 3 + 3 + 4 + 4 input beats; target 0.92 inputs/s, measured 0.91; 5 open gaps and 2 bridges.
- **Design hook:** Float portal, five gaps, two kerbs and the campaign's densest run of shards.
- **Layout:** Hazard groups at 27.97, 50.82, 51.82, 74.68, 91.68, 120.07, 131.44 (double); gaps at 16.6 (2.5), 39.45 (2.5), 63.31 (2.5), 80.31 (2.5), 108.7 (2.5); bridges: kerb at 95, width 4, height 0.45; kerb at 123, width 4, height 0.45; portals: float at 53.78; enemies: drone at 103.17, crawler at 11.28; shards: 8.98 (height 1.9), 16.44 (height 1.79), 25.9 (height 1.9).
- **Audio:** 120 BPM with the existing sixteen-step procedural motif.

### 17 — Shatterglass Express (146 units)
- **Signature:** Phase then dash: skip a hazard wall, then outrun the glass.
- **Rhythm:** 3 + 3 + 4 + 4 input beats; target 0.95 inputs/s, measured 0.94; 5 open gaps and 2 bridges.
- **Design hook:** Phase and dash portals, five gaps, two kerbs and a drone on the express straight.
- **Layout:** Hazard groups at 28.37, 47.49, 48.49, 72.01, 92.21, 121.83, 133.32 (double); gaps at 16.88 (2.5), 40.7 (2.5), 63.59 (2.5), 77.96 (2.5), 110.34 (2.5); bridges: kerb at 96, width 4, height 0.45; kerb at 84.5, width 4, height 0.45; portals: phase at 34.17, dash at 55.59; enemies: drone at 104.53, crawler at 11.4; shards: 9 (height 1.9), 16.75 (height 1.83).
- **Audio:** 148 BPM with the existing sixteen-step procedural motif.

### 18 — Cloudbreaker Causeway (148 units)
- **Signature:** Shield for the wall, then six gaps to spend it before.
- **Rhythm:** 3 + 4 + 4 + 4 input beats; target 0.97 inputs/s, measured 0.96; 6 open gaps and 2 bridges.
- **Design hook:** Shield portal early, six open gaps, two kerbs and a drone near the causeway end.
- **Layout:** Hazard groups at 23.89, 47.84, 65.13, 89.08, 106.06 (double), 135.6, 136.6; gaps at 17.1 (2.5), 36.35 (2.5), 53.64 (2.5), 77.59 (2.5), 94.57 (2.5), 124.11 (2.5); bridges: kerb at 110.5, width 4, height 0.45; kerb at 27, width 4, height 0.45; portals: shield at 70.36; enemies: drone at 118.52, crawler at 11.4; shards: 8.68 (height 1.9), 16.93 (height 1.89).
- **Audio:** 128 BPM with the existing sixteen-step procedural motif.

### 19 — Magnetar Foundry (149 units)
- **Signature:** Two dash portals, five holes, and a drone waiting after the second.
- **Rhythm:** 5 + 5 + 5 input beats; target 1.00 inputs/s, measured 1.04; 5 open gaps and 2 bridges.
- **Design hook:** Dash at the top and bottom of the course, five gaps, two kerbs and the hardest spacing in the campaign.
- **Layout:** Hazard groups at 28.67, 45.61, 75.02, 87.74, 88.74, 104.75, 119.15, 136.2 (double); gaps at 17.06 (2.5), 34 (2.5), 60.62 (2.5), 80.88 (2.5), 124.59 (2.5); bridges: kerb at 110, width 4, height 0.45; kerb at 67, width 4, height 0.45; portals: dash at 49.66, dash at 92.8; enemies: drone at 103.75, crawler at 11.52; shards: 9.02 (height 1.9), 16.91 (height 1.84).
- **Audio:** 152 BPM with the existing sixteen-step procedural motif.

### 20 — Eclipse Crown (150 units)
- **Signature:** Shield and float, five holes, three shards: the finale asks for both.
- **Rhythm:** 6 + 5 + 5 input beats; target 1.00 inputs/s, measured 1.02; 5 open gaps and 2 bridges.
- **Design hook:** Shield then float, five gaps, two kerbs and every mechanic the campaign has taught.
- **Layout:** Hazard groups at 28.78, 46.26, 57.87 (double), 87.76, 104.8, 105.8, 125.08, 126.08, 138.48; gaps at 17.17 (2.5), 34.64 (2.5), 76.14 (2.5), 93.19 (2.5), 131.62 (2.5); bridges: kerb at 49.5, width 4, height 0.45; kerb at 39.5, width 4, height 0.45; portals: shield at 65.54, float at 113.48; enemies: drone at 124.08, crawler at 11.52; shards: 9.1 (height 1.9), 17.04 (height 1.85), 26.38 (height 1.9).
- **Audio:** 154 BPM with the existing sixteen-step procedural motif.

## Playtest checklist

1. Confirm a single jump can clear each authored gap from its marked approach and that the destination has a clean landing window.
2. Confirm raised bridges are reachable with one jump and never require a midair second jump.
3. Confirm each portal effect is readable before its next hazard and does not imply protection from gaps.
4. Confirm crawlers can be stomped or jumped, drones have a clear vertical avoidance window, and shield portals can absorb a single enemy/hazard.
5. Test the collectible HUD and completion summary on courses 5, 8–13, and 15–20.
6. Run every course on a desktop browser and narrow mobile viewport; verify touch targets, fullscreen, safe areas, mute, and visible version.
7. Validate on physical iPad/iPhone Safari before claiming device-level verification; browser emulation is not a substitute.
