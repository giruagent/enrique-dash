# Enrique Dash

**Current test version: 0.9.1** — a touch-first Three.js rhythm platformer with twenty selectable courses. This is a test build: course data and mechanics are in place, while end-to-end playtesting of every course and physical iPad/iPhone validation remain in progress. The exact package version is visible in the page header, footer, and game HUD, including fullscreen.

## Play locally

Requirements: Node.js 22 (the CI runner uses Node 22).

```sh
npm ci
npm run dev
```

Open the Vite URL in a browser with WebGL enabled. To verify a production build:

```sh
npm test
npm run build
npm run preview
```

Tap/click the playfield, or press Space, Arrow Up, or W to jump; press P or the Pause button to pause. While paused, tap/click the playfield or press P, Space, or Resume to continue the same run without forcing a jump. The first user interaction loads the 3D engine and character atlas; until then a lightweight static preview is shown. Use **Fullscreen** to expand the game and **Exit fullscreen** or Escape to return. Browsers that do not allow the Fullscreen API use a fixed-viewport fallback. Music starts with play after a user gesture and can be muted at any time. The user-supplied scream effect plays when a run ends in a loss.

## Performance budget

- The character atlas is a 455 kB WebP (was a 2 628 kB PNG), sized 1280×1280 with 23 frames from the 7 animations used by the game.
- First Play downloads the atlas, an 8 kB sprite map, and the Three.js chunk (~181 kB gzip).
- After changing `assets/character/`, regenerate the atlas with `python3 scripts/pack_atlas.py`.

## Known limits

- The render delta-time is clamped to 40 ms on purpose, favoring fairness over wall-clock speed.
- GitHub Pages serves no custom security headers, so the Content Security Policy is meta-only.

## Playable courses

01 Neon Run · 02 Skyline Rush · 03 Solar Flare · 04 Gravity Garden · 05 Pixel Pier · 06 Midnight Circuit · 07 Candy Comet · 08 Aqua Pulse · 09 Crystal Cavern · 10 Stormbreaker · 11 Final Orbit · 12 Mosslight Hollow · 13 Clockwork Orchard · 14 Tidal Foundry · 15 Paper Moon Parade · 16 Verdant Relay · 17 Shatterglass Express · 18 Cloudbreaker Causeway · 19 Magnetar Foundry · 20 Eclipse Crown.

Each level has its own speed, obstacle sequence, color palette, tempo, scale, chord progression, and lead motif. Level clears are saved locally in the browser; no account is needed.

See [the level verification pipeline](docs/LEVEL_PIPELINE.md) for the auto-player, fair-spacing rules, and catalogue report.

## What changed in v0.3.0

- Added ten more playable courses (eleven total) and a keyboard-accessible level selector.
- Added native fullscreen with Escape handling, plus an iOS/browser CSS fallback and safe-area-aware controls.
- Replaced the old one-shot beeps with original procedural Web Audio music: kick, snare, hi-hats, bass, chord pads, arpeggiated lead, and per-level tempo/scale/motif. No third-party audio assets are downloaded.
- Added a mute toggle and start audio only following a user gesture.
- Deferred loading Three.js and the 2.6 MB character atlas until the first play action, retaining a static preview and cube fallback.
- Added Node's built-in test runner for level validation, collision/progress rules, and music theory helpers.

### v0.9.1

- Clearing a course and tapping the playfield used to replay the same course: the tap handler treated "dead" and "completed" the same way. A tap (or Space) after a clear now advances to the next course, the overlay names it, and only a loss restarts in place.
- The next-course button and every other way of continuing share one function, so they cannot drift apart again.

### v0.9.0

- Every course of 120 units or more now has one checkpoint: `safeCheckpointDistance()` picks the clearest half-unit spot inside the 38–62 % window, away from hazards, gaps, enemies and portals. The flag is a white pole, a two-triangle cyan pennant and a cyan lane strip, scrolls with the world and announces `Checkpoint.` when passed.
- Dying after the flag now resumes from the checkpoint: the course is rebuilt shifted by the attempt start, features at or behind the runner are dropped, the progress bar starts where the flag sits and the overlay reads “One more try — from the checkpoint.” The Play button still restarts from zero.
- A new gold medal rewards a clear that never used the course checkpoint; it is stored as `noCheckpoint` and never downgraded. Gold beats silver, and short courses earn it by clearing normally.

### v0.8.2

- Active power-ups are visible for their whole duration: a HUD row under the level name shows one pill per live effect, named in its gameplay colour, with a thin bar that drains by the remaining ratio. Dash 2.2 s, float 2.8 s, phase 2.4 s, and shield until its saved hit is spent; the row hides when nothing is active.
- The character carries a soft aura ring on the lane for as long as any effect is live, tinted by the effect colour and fading with the strongest remaining ratio. Shield adds a thin blue halo above the head so a saved hit is understandable. Pulsing is disabled, with static opacity, under `prefers-reduced-motion`.

### v0.8.1

- Course progress is now remembered per level in `enrique-dash.progress.v2`: the furthest distance reached, the best shard count and whether the course was cleared. Old completion saves migrate automatically and both formats are written, so downgrading keeps working.
- Every selector card shows a thin progress bar with its percent, gold shard pips (`◆ 2/3`) when the course has shards, and a bronze or silver medal dot for a clear or a full-shard clear. The accessible name now reads, for example, “Play level 7: Candy Comet, best 82 percent, 2 of 3 shards, bronze medal”.
- Runs record progress once when they end, on a crash or a finish; pausing never writes.

### v0.8.0

- Every course now ends at a visible finish gate: two white pillars, a top beam with lime emissive trim, a checkered banner and a four-segment checkered strip on the lane. It spawns at `level.length` through `finishGateDistance()`, scrolls with the world and never collides.
- Added a remaining-distance HUD chip: `⚑ FINISH 30` counts down through the last 30 units, switches to `⚑ FINISH!` under three, and stays hidden otherwise.
- Every power-up now carries a camera-facing label above its ring with the portal name and effect, and announces the effect through the HUD and `#game-status` for 1.6 seconds.

### v0.7.0

- A tap or keypress that starts (or restarts) a run no longer doubles as a jump: with the composed courses that dropped the player straight into the first gap on thirteen of the twenty courses.
- Jump feel: asymmetric gravity (rise 27, fall ×1.45) keeps the same 1.85 apex but cuts air time from 0.90 s to 0.68 s, so two jumps can be chained in rhythm.
- One colour language for the whole game: hazards are always crimson, shards are gold faceted diamonds, platforms are slate, portals keep their per-type colour with a white core and a marker strip on the lane. A legend under the playfield names the four roles.
- Platform archetypes: kerbs, long shelves, hexagonal islands over gaps, bobbing hover stones and perches with a crawler standing on them. Every placement is still replayed through the auto-player and reverted if it breaks the course.
- All twenty courses recomposed for the shorter jump; gates unchanged (20/20 completable, zero dead bands, zero telegraph violations).

### v0.6.1

- Hazards now use a dedicated warning colour (crimson on cool courses, amber on warm ones) instead of the course accent, so spikes, vents and panels no longer disappear into the scenery that shares their hue.

### v0.6.0

- Recomposed all twenty courses with `tools/compose-levels.mjs`: deliberate two-in-one beats sit at or below 0.80 jump reach and every other interval is a full 1.35-reach reaction rest, so no authored beat lands in the unfair 0.80–1.35 dead band.
- Made every gap real: bridges are optional and capped per tier, every course from the fifth on keeps at least two open gaps, and the auto-player now jumps at least 75% of jump-triggering beats (Eclipse Crown jumps 12 of 16).
- Raised the campaign from **0.55 to 0.82 average inputs/s** (+49%) and made the curve climb in every five-course block: 0.67, 0.76, 0.86, 0.97; Neon Run now runs at 0.63 and Eclipse Crown at 1.02.
- All twenty courses finish under the unchanged auto-player with zero deaths; the report shows 20/20 completed, 0 dead-band violations, 0 first-beat telegraph violations and a tightest jump margin of 0.51 units.
- Added level regression tests for jump ratio, bridge caps and open gaps, landing margin, first-beat telegraph, ±5% input-rate accuracy, curve, variety, compounds and apex shards.

### v0.3.1

- Keep the exact app version visible inside the game HUD, including fullscreen mode.

### v0.5.5

- Kept music alive across losses, restarts, and browser audio interruptions: suspended contexts retry, a state watcher re-arms scheduling without replaying the backlog, and delayed suspension respects the desired playback state.
- Added six deterministic fake-AudioContext lifecycle regressions and dev-only music lifecycle diagnostics.

### v0.5.4

- The music scheduler no longer replays a backlog: if the audio context was suspended long enough for the cursor to fall behind, it resyncs to the present instead of firing every missed step at once (which could be hundreds of oscillators in a single tick).
- Added a per-tick burst guard of eight steps and four tests for the scheduling window, the stale-cursor resync and the guard.

### v0.5.3

- Moved the vertical physics (platform step-up, support lookup, coyote time, gravity, landing and the fall limit) out of the render loop into `stepPlayerMotion()` in `game-logic.js`, with `motionTuning` for its constants.
- Added `src/motion.test.js`: eight tests covering a full jump arc, air time, platform crossing, an unclimbable platform, a gap fall, landing from above and the float portal.
- Behaviour is unchanged: 6 000 simulated steps match the previous inline block exactly, and the Mosslight Hollow browser trace is identical.

### v0.5.2

- Shipped the 455 kB, 1280×1280 lossless WebP character atlas and documented the first-play payload budget.
- Made production builds use the project base path independently of GitHub Actions, with `BASE_PATH` available as an override.
- Added a Content Security Policy, recoverable course-validation errors, and reduced-motion handling for decorative rotations and platform bob.

### v0.5.1

- Restored normal keyboard and touch scrolling outside active gameplay while keeping the full playfield available for tap-to-start, jump, and retry.
- Added focused keyboard controls, discrete screen-reader status announcements, five-percent progress updates, and stable Music and Fullscreen toggle names.
- Added the lime `E` favicon and removed obsolete level-card and font-import CSS.

### v0.5.0

- Fixed raised-platform collision so grounded runners step onto low platforms, airborne runners can pass underneath, and platforms over gaps act as bridges while preserving landings from above.

### v0.4.4

- Play Enrique's supplied scream once whenever a run ends in a loss; serve normalized Ogg Opus or MP3 depending on browser support.
- Keep the audio off the landing-page network path and load it after the first user-initiated game start.

### v0.4.3

- Added a dedicated Pause/Resume control plus the `P` shortcut; backgrounding pauses the run, stops its animation loop and audio, and resumes without duplicating course features or triggering a surprise jump.
- Paused gameplay now has a contrast-backed message panel, with system colors preserved in forced-colors mode.
- Retained a jump pressed during deferred 3D-scene initialization, preventing the first input from being lost while the engine loads.
- Ignore repeated keyboard events and use a constant-acceleration vertical step to keep jump height consistent across common render rates.
- Made the playfield keyboard-focusable and tied it to visible instructions; improved mobile controls with 44 px touch targets and a clearer stacked control row.
- Added regression and UI-contract tests for pause state, feature initialization, repeated input, vertical motion, and keyboard access.

### v0.4.2

- Added a curated set of 13 project-local game-development skills for platforming, touch input, physics, level design, Three.js, audio, performance, saves, documentation, and assets.
- Pinned their upstream source in `skills-lock.json`, retained the Apache-2.0 license, and added `.claude/skills` symlinks to the shared `.agents/skills` files.
- These are development-time instructions only; no gameplay code changed and the skills are not included in the Pages build.

### v0.4.1

- Prevents iPhone long-press selection and the system callout inside the game surface, without disabling text selection elsewhere on the page.
- Makes jumps more responsive with a slightly higher initial impulse, a 140 ms input buffer, and a 120 ms coyote-time window; obstacle clearance and crawler stomps also have small forgiveness windows.
- Added regression coverage for jump timing and collision boundaries. Physical iPhone/iPad validation remains pending.

### v0.4.0

- Expanded the course catalog to twenty distinct themes with a capped progression from 78 to 150 course units.
- Added authored gaps, raised/hover platforms, spring/dash/float/shield/phase portals, crawlers, drones, and optional collectible shards.
- Added per-level environment silhouettes and hazard profiles, plus a shard counter and clear summary.
- Added automated validation for level count, unique course identity, feature bounds, music data, and course-length progression.
- See [LEVEL_DESIGN_PLAN.md](LEVEL_DESIGN_PLAN.md) for the detailed course-by-course design and playtest checklist.
- This test release has not yet had complete browser playtesting across all twenty levels or physical iPad/iPhone validation.

## Versioning and branch workflow

- Develop changes on feature/fix branches, not directly on `main`.
- Bump `package.json` for each test release/meaningful game update and keep `package-lock.json` in sync.
- Open a pull request. CI runs `npm test` and a production build on branches and pull requests.
- After a checked change merges to `main`, GitHub Actions builds and deploys the Pages artifact. The site shows the exact package version being tested.

## Project-local agent skills

The project vendors 13 applicable skills under `.agents/skills`; `.claude/skills` contains relative symlinks to the same files. This is a curated subset of the 80 skills in [Enrique’s Writing Adventure](https://github.com/giruagent/enriques-writing-adventure); engine-specific Godot, Unity, Roblox, and other unrelated skills were left out. `skills-lock.json` pins the imported set to [awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills) at commit `c6ca6c41c839b68319ffc08430b99ab768debc32`; its Apache-2.0 license is at `.agents/skills/LICENSE`. These are development-time files and are not included in the Pages build.

Included: `platformer`, `game-feel`, `game-ui-ux`, `input-systems`, `physics-tuning`, `level-design`, `threejs-scene-setup`, `threejs-materials-lighting`, `performance-optimization`, `audio-design`, `save-systems`, `game-docs`, and `create-game-assets`.

## Live site

[https://giruagent.github.io/enrique-dash/](https://giruagent.github.io/enrique-dash/)

GitHub Pages and production builds use the `/enrique-dash/` project base path by default; set `BASE_PATH` to override it. The Vite dev server uses `/`.

## Project notes

- See [PLAN.md](PLAN.md) for scope and next steps.
- See [public/character/ASSET_NOTES.md](public/character/ASSET_NOTES.md) for sprite source details and handling notes.
- Enrique confirms he created the character assets; the supplied archive and metadata are retained for traceability.
- No accounts, analytics, cloud saves, or personal data collection are included.
- No project license has been selected; choose one before accepting contributions.
