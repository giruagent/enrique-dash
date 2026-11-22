# Enrique Dash — Product & Engineering Plan

## Vision

Build a high-quality, touch-first browser rhythm platformer for iPad, phones, and desktop. Players learn readable obstacle patterns, jump in time, retry quickly, and progress through authored themed levels. The first course is **Neon Run**; this project intentionally does not promise a large level count until those levels have been built and playtested.

## Product principles

- **Instant play:** no account or install required for the core game.
- **Fair challenge:** clear hazard silhouettes, consistent collision rules, quick retries, and optional practice/checkpoints where appropriate.
- **Touch first:** no hover-only controls; test safe-area behavior and input on real devices.
- **Original identity:** use original or properly licensed level art, music, and effects. Do not copy Geometry Dash branding/content.
- **Earn complexity:** keep the project a static client app until cloud saves, authoring, or community features justify services.

## Visual and interaction direction

- Deep indigo night (#090D1B), twilight navy (#10162A), luminous chartreuse (#C8FF52), and coral hazards.
- Barlow Condensed for kinetic headings; DM Sans for readable UI copy.
- A side-on 3D scene with a low-key geometric skyline. Enrique's supplied character sprite is animated as a 2D plane in the Three.js world.
- The HUD shows course, progress, attempts, mute state, and software version. Jump is available through pointer/touch or keyboard.
- Sound is opt-in; do not depend on sound alone to communicate hazards.

## Current build — v0.2.0

- Vite + JavaScript + Three.js; static client-side app.
- Neon Run: full short course from start to finish, with six obstacle groups, jump physics, collision, death/retry, completion, and progress display.
- The supplied 81-frame character atlas drives idle, run, rising, apex, falling, hurt, and victory states. The placeholder cube remains a graceful fallback.
- Keyboard and pointer controls; optional generated sound, off by default.
- Skyline Rush, Solar Flare, and Gravity Garden are menu previews only; no gameplay has been implemented for them.
- GitHub Actions CI builds branches and pull requests. The Pages deploy workflow deploys main after merge, subject to Pages being enabled for the repository.

## Delivery roadmap

### Phase 0 — Foundation and first level (implemented)

- Responsive Three.js scene, landing UI, jump/collision loop, HUD, character animation, first course, and version label.
- Build and browser-test start, play, collision/retry, completion, mobile-width layout, and asset loading before calling v0.2.0 ready.

### Phase 1 — Tune feel and device support

- Tune jump arc, timing windows, obstacle hitboxes, camera framing, input buffering/coyote time, and restart latency through playtests.
- Add a proper pause action and accessible interaction labels without obstructing play.
- Verify current iPadOS Safari, iOS Safari, Android Chrome, desktop Chrome/Firefox/Safari on physical devices.
- Inspect sprite edges at full resolution and confirm redistribution/commercial rights.

### Phase 2 — Reusable content pipeline

- Move course geometry, timing, hazards, checkpoints, and metadata into validated, versioned data files.
- Build and playtest 10–20 authored levels with gradual difficulty across several worlds.
- Add level select, completion/best-progress state, and local persistence.
- Replace generated beeps with original or properly licensed level music/effects and document licenses.

### Phase 3 — Release quality

- Add automated unit tests for movement, collision, and progression; browser tests for start, jump, death, retry, completion, touch layouts, and keyboard use.
- Profile frame time and memory on target devices; handle WebGL loss and cap pixel ratio.
- Add telemetry only with privacy review, a clear notice, and consent as appropriate.
- Deploy immutable static assets over HTTPS with verified version marker and rollback procedure.

### Phase 4 — Expand from player feedback

- Grow to 30+ levels only if authored content and playtesting sustain quality.
- Consider a level editor/share codes only after validating demand and the associated moderation/safety costs.
- Consider accounts/cloud sync only when cross-device progression is a demonstrated need; keep local play available.

## Architecture

```text
Browser (static web app)
  ├── DOM UI: landing, HUD, level previews, accessible controls
  ├── Game loop: input → movement/collision → level state
  ├── Three.js: camera, 3D environment/hazards, sprite character plane
  ├── Content: level definitions and original/licensed assets
  └── Local storage: settings/progress (future)

GitHub Actions → locked install → Vite build → Pages artifact → GitHub Pages
```

Keep simulation deterministic and decouple level data from rendering as content grows. No backend, multiplayer, or accounts without a product need.

## Quality, security, and release checklist

- **Gameplay fairness:** test collision timing and hitbox size; keep hazards visible and retry rapid.
- **Mobile performance:** cap pixel ratio, keep effects restrained, and profile target hardware.
- **Input reliability:** constrain browser gesture suppression to the active playfield; test touch, stylus, and keyboard.
- **Asset rights:** supplied sprite pack has no explicit license noted in its README. Confirm rights before commercial use or broad redistribution.
- **Accessibility:** keyboard support, visible focus, readable contrast, reduced-motion preference, and no sound-only cues.
- **Privacy:** no analytics, accounts, or personal data collection in this build.
- **Scope:** a level count is not a feature until levels are authored, tested, and playable.
- **Release identification:** bump `package.json` for each test release, keep lockfile aligned, and display the package version in the UI.
- **Change control:** branch-based development; CI validates pull requests; merge to main only after checks, and deploy through Actions.

## Decisions to revisit

- Difficulty curve/checkpoint policy after playtests.
- Music approach and properly licensed audio assets.
- Target launch level count after measuring content-production pace.
- Whether static GitHub Pages remains adequate as the feature set grows.
