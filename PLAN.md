# Enrique Dash — Product & Engineering Plan

## Vision

Build a polished, touch-first browser rhythm platformer for iPad, phones, and desktop. Players learn readable obstacle patterns, jump in time, retry quickly, and progress through themed levels. The current test campaign has twenty selectable courses and stops growing at a modest 150-unit cap until playtesting supports further expansion.

## Product principles

- **Instant play:** no account or install required for the core game.
- **Fair challenge:** clear hazard silhouettes, consistent collision rules, quick retries, and optional practice/checkpoints where appropriate.
- **Touch first:** no hover-only controls; test safe-area behavior and input on real devices.
- **Original identity:** use original or properly licensed art, music, and effects. Do not copy Geometry Dash branding or content.
- **Earn complexity:** keep the project a static client app until cloud saves, authoring, or community features justify services.

## Visual and interaction direction

- Deep indigo night (#090D1B), twilight navy (#10162A), luminous chartreuse (#C8FF52), and coral hazards.
- Barlow Condensed for kinetic headings; DM Sans for readable UI copy.
- A side-on 3D stage with a low-key geometric skyline. Enrique's supplied character sprite is animated as a 2D plane in the Three.js world.
- The HUD shows course, progress, attempts, music state, and software version. Pointer/touch and keyboard are supported.
- A native Fullscreen API button expands the stage; a CSS viewport fallback covers browsers without usable native fullscreen.
- Music is opt-in by user gesture: original procedural Web Audio, per-level BPM, scale, chord movement, lead motif, bass, and synthesized percussion. Mute is always available; gameplay does not rely on audio cues.

## Current build — v0.4.1 (test build)

- Vite + JavaScript + Three.js; static client-side app.
- Twenty selectable courses, with unique environment/hazard themes, authored layouts, and length progression from 78 to a 150-unit maximum.
- Course data includes gaps, raised/hover platforms, spring/dash/float/shield/phase portals, crawlers, drones, and optional shards; validation runs in Node tests.
- Touch selection and iOS callouts are disabled only inside the game surface; jump input has 140 ms buffering and 120 ms coyote time, with small obstacle/stomp forgiveness margins.
- Detailed course beats and coordinates are documented in [LEVEL_DESIGN_PLAN.md](LEVEL_DESIGN_PLAN.md).
- Browser-assisted completion checks have passed for a subset of courses; full end-to-end playtesting across all twenty and physical iPad/iPhone validation remain open.
- The supplied 81-frame atlas drives idle, run, jump ascent/apex/fall, hurt, and victory states. A cube fallback remains if the atlas fails to load.
- Three.js and the character atlas are deferred until the first play action. A lightweight CSS track preview remains before that interaction.
- Fullscreen, Escape-to-exit, touch/keyboard jump, music toggle, course select, local completed-course markers, and package version visible in the fullscreen HUD.
- GitHub Actions CI runs tests and the production build on branches/PRs; Pages deploys main after merge.

## Next phases

### Phase 1 — Tune gameplay and verify devices

- Playtest all twenty courses, tune jump windows and difficulty progression, and add practice checkpoints where they materially improve fairness.
- Test native fullscreen and CSS fallback on real iPadOS Safari, iOS Safari, Android Chrome, and desktop browsers; verify orientation and safe areas.
- Listen to the soundtrack on device speakers and headphones; adjust gain, transients, and tonal balance based on actual listening.
- Inspect sprite edges at full resolution and confirm redistribution/commercial rights.

### Phase 2 — Deeper level system

- Build a deterministic course simulator and course preview so layouts can be balanced before running the 3D game.
- Add best-time/progress records and a practice mode, while keeping local play private and account-free.
- Expand level art and environmental motion only where they improve readability and rhythm.
- Consider additional courses beyond twenty only after the campaign has been playtested and player feedback supports them.

### Phase 3 — Release quality

- Add browser automation for all twenty course layouts, portal effects, enemy collisions, collectible collection, fullscreen, mute/music start, restart, and course completion.
- Profile frame time, memory, and loading on target devices; handle WebGL loss and cap pixel ratio.
- Add telemetry only with privacy review, a clear notice, and consent as appropriate.
- Deploy immutable static assets over HTTPS with a verified version marker and rollback procedure.

### Phase 4 — Expand from player feedback

- Consider an editor/share codes only after validating demand and moderation/safety costs.
- Consider accounts/cloud sync only when cross-device progression is a demonstrated need; keep local play available.

## Architecture

```text
Browser (static web app)
  ├── DOM UI: landing, course selector, HUD, fullscreen/audio controls
  ├── Game loop: input → deterministic movement/collision → level state
  ├── Three.js (loaded on play): 3D environment, hazards, animated sprite plane
  ├── Content: validated level/music data + user-supplied licensed art
  ├── Web Audio: scheduled per-level synthesized music after user gesture
  └── Local storage: completed-level markers only

GitHub Actions → locked install → tests → Vite build → Pages artifact → GitHub Pages
```

Keep simulation and level data separate from rendering as content grows. No backend, multiplayer, or accounts without a product need.

## Quality, security, and release checklist

- **Gameplay fairness:** test collision timing and hitbox size; keep hazards visible and retries rapid.
- **Mobile performance:** cap pixel ratio, defer WebGL/atlas until play, and profile target devices.
- **Input reliability:** restrict browser gesture suppression to the game surface; test touch, stylus, and keyboard.
- **Fullscreen reliability:** observe `fullscreenchange`, support Escape, safe-area insets, and a CSS fallback.
- **Audio:** start/resume the AudioContext only in response to a user gesture, fade/suspend when muted or paused, keep a visible mute control, and listen on actual devices.
- **Asset rights:** the supplied sprite pack has no explicit commercial license in its README; confirm rights before monetization.
- **Accessibility:** keyboard support, visible focus, touch targets, readable contrast, reduced-motion preference, and no sound-only cues.
- **Privacy:** no analytics, accounts, or personal data collection.
- **Release identification:** bump `package.json`, align the lockfile, and display the exact version in the UI.
- **Change control:** branch-based development, CI on PRs, merge only after checks, deploy through Actions.

## Decisions to revisit

- Course completion/best-time persistence and optional checkpoints.
- Whether mobile fullscreen fallback should also offer an installable PWA mode.
- Music mix and per-level arrangements after live listening tests.
- Further content additions based on player feedback.
