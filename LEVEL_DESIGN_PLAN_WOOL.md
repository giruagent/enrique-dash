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
- **Signature:** Three open gaps in the meadow, each one a single soft landing.
- **Rhythm:** 1 + 2 + 1 + 2 input beats; target 0.62 inputs/s, measured 0.62; 3 open gaps and 0 bridges.
- **Design hook:** Thimble Meadow lays out 3 spike groups, 3 gaps and 1 shard.
- **Layout:** Hazard groups at 9.36, 33.86, 65.36 (double); gaps at 26.52 (2.5), 50.69 (2.5), 58.02 (2.5); bridges: none; portals: none; enemies: none; shards: 8.36 (height 1.85).
- **Audio:** 108 BPM with the existing sixteen-step procedural motif.

## Playtest checklist

1. Confirm a single jump can clear each authored gap from its marked approach and that the destination has a clean landing window.
2. Confirm raised bridges are reachable with one jump and never require a midair second jump.
3. Confirm each portal effect is readable before its next hazard and does not imply protection from gaps.
4. Confirm crawlers can be stomped or jumped, drones have a clear vertical avoidance window, and shield portals can absorb a single enemy/hazard.
5. Test the collectible HUD and completion summary on every course that carries shards.
6. Run every course on a desktop browser and narrow mobile viewport; verify touch targets, fullscreen, safe areas, mute, and visible version.
7. Validate on physical iPad/iPhone Safari before claiming device-level verification; browser emulation is not a substitute.
