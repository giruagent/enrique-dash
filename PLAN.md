# Enrique Dash — Product & Engineering Plan

## Vision

Build a polished, touch-first rhythm platformer for browsers on iPad, phones, and desktop. The player reads obstacle patterns, jumps on rhythm, learns from fast retries, and progresses through a substantial collection of themed levels. The name is **Enrique Dash**. Character design is deliberately provisional until Enrique's art arrives.

## Product principles

- **Instant play:** no account or install required for the core game.
- **Fair challenge:** clear silhouettes, predictable collision rules, quick restarts, and optional practice/checkpoints where appropriate.
- **Touch first:** generous input handling, no hover-only controls, safe-area-aware layout, and real-device testing.
- **Original identity:** original level art, music, effects, and character assets; do not reuse Geometry Dash branding, levels, or copyrighted assets.
- **Earn complexity:** keep a static client app until cloud saves, authoring, or community features justify services.

## Initial visual direction

- Deep indigo night (#090D1B), twilight navy (#10162A), luminous chartreuse (#C8FF52), and coral hazard accents.
- Barlow Condensed for kinetic display type; DM Sans for legible interface copy.
- Side-on 3D stage with a quiet geometric skyline; the player/level rhythm is the focal point.
- UI stays calm and legible while gameplay is high-contrast; reduced-motion preference is respected.
- The current glowing cube is a temporary stand-in. Integrate Enrique's character only after receiving the asset and confirming its format and licensing.

## Current prototype

- Vite + JavaScript + Three.js; one static web app.
- Neon Run is an initial short playable test course with jump, collision, death/retry, completion, and progress bar.
- Keyboard and pointer controls; touch target is the full play field. Sound is optional and off by default.
- Three additional world concepts appear as roadmap previews only; they are not implemented playable content.

## Proposed roadmap

### Phase 0 — Foundation (current)

- Establish responsive Three.js scene, launch screen, core jump loop, HUD, and repository documentation.
- Done when build succeeds and the demo works in a desktop browser; physical-device behavior remains to verify.

### Phase 1 — Character and feel

- Import Enrique's supplied character model or sprite; define asset dimensions, animation states, attribution, and fallback.
- Tune jump arc, obstacle hitboxes, camera framing, input buffering/coyote time, and restart latency.
- Add accessible pause/retry controls, mute, and reduced-motion handling.
- Validate on current Safari iPadOS and iOS, Android Chrome, and desktop browsers.

### Phase 2 — Level system and content pipeline

- Move level geometry, timing, hazards, checkpoints, and metadata into validated data files.
- Build 10–20 authored levels across distinct worlds, with a gradual difficulty curve and practice/checkpoints.
- Add level select, completion state, best progress, and local persistence; test all collision timings.
- Commission/create original music and effects with documented licenses; align hazard cues to musical beats.

### Phase 3 — Release quality

- Add automated unit tests for movement/collision/progression and browser tests for start, jump, death, retry, completion, touch-size layouts, and keyboard navigation.
- Profile frame time and memory on representative mid-range devices; cap pixel ratio and gracefully handle WebGL loss.
- Add error reporting only with a clear privacy policy and consent-appropriate telemetry.
- Deploy immutable static assets over HTTPS with cache headers and a rollback path.

### Phase 4 — Expand based on player feedback

- Grow to 30+ levels if content quality and playtesting support the cadence.
- Consider a simple level editor/share codes only after validating demand and moderation/safety costs.
- Consider accounts/cloud sync only when cross-device progression is a demonstrated need; keep local play available.

## Architecture proposal

```text
Browser (static app)
  ├── DOM UI: menus, level select, accessible controls, HUD
  ├── Game runtime: input → simulation/collision → level progression
  ├── Three.js renderer: scene, camera, effects, character/obstacles
  ├── Content: versioned level data + original licensed assets
  └── Local storage: settings and local progress (later phase)

Static hosting / CDN → HTML, JS, level data, assets
```

Keep simulation deterministic where feasible so collision behavior is testable. Separate game state from rendering before adding levels at scale. Avoid a backend or multiplayer architecture without a product need.

## Quality and risk checklist

- **Gameplay fairness:** collisions can feel arbitrary at high speed. Use explicit hitboxes, readable hazard cues, and replayable test cases.
- **Mobile performance:** WebGL memory and fill rate vary. Cap device pixel ratio, keep effects restrained, and profile actual target hardware.
- **Input reliability:** prevent page scroll/zoom conflicts only inside the active play area; test touch, stylus, and keyboard.
- **Asset rights:** confirm character/music/level asset ownership and licenses before public redistribution.
- **Accessibility:** keyboard support, visible focus, semantic controls, adequate contrast, motion preference, and no sound-only cues.
- **Scope:** many levels require authoring and playtesting, not just code. Ship a small polished set before promising a large catalog.
- **Privacy:** no analytics, accounts, or personal data collection in this prototype.

## Decisions to revisit

- Character asset format and animation style, after delivery.
- Whether music is level-synced and which original/licensed audio assets to use.
- Exact launch content count and difficulty curve after playtests.
- Hosting provider, selected after choosing a deployment/account setup.
