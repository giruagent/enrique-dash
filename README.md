# Enrique Dash

**Current test version: 0.3.1** — a touch-first Three.js rhythm platformer. Eleven courses are playable, and the game expands to fullscreen from the in-game control. The exact package version stays visible in the page header/footer and in the game HUD while fullscreen.

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

Tap/click the playfield, or press Space, Arrow Up, or W to jump. The first user interaction loads the 3D engine and character atlas; until then a lightweight static preview is shown. Use **Fullscreen** to expand the game and **Exit fullscreen** or Escape to return. Browsers that do not allow the Fullscreen API use a fixed-viewport fallback. Music starts with play after a user gesture and can be muted at any time.

## Playable courses

01 Neon Run · 02 Skyline Rush · 03 Solar Flare · 04 Gravity Garden · 05 Pixel Pier · 06 Midnight Circuit · 07 Candy Comet · 08 Aqua Pulse · 09 Crystal Cavern · 10 Stormbreaker · 11 Final Orbit.

Each level has its own speed, obstacle sequence, color palette, tempo, scale, chord progression, and lead motif. Level clears are saved locally in the browser; no account is needed.

## What changed in v0.3.0

- Added ten more playable courses (eleven total) and a keyboard-accessible level selector.
- Added native fullscreen with Escape handling, plus an iOS/browser CSS fallback and safe-area-aware controls.
- Replaced the old one-shot beeps with original procedural Web Audio music: kick, snare, hi-hats, bass, chord pads, arpeggiated lead, and per-level tempo/scale/motif. No third-party audio assets are downloaded.
- Added a mute toggle and start audio only following a user gesture.
- Deferred loading Three.js and the 2.6 MB character atlas until the first play action, retaining a static preview and cube fallback.
- Added Node's built-in test runner for level validation, collision/progress rules, and music theory helpers.

### v0.3.1

- Keep the exact app version visible inside the game HUD, including fullscreen mode.

## Versioning and branch workflow

- Develop changes on feature/fix branches, not directly on `main`.
- Bump `package.json` for each test release/meaningful game update and keep `package-lock.json` in sync.
- Open a pull request. CI runs `npm test` and a production build on branches and pull requests.
- After a checked change merges to `main`, GitHub Actions builds and deploys the Pages artifact. The site shows the exact package version being tested.

## Live site

[https://giruagent.github.io/enrique-dash/](https://giruagent.github.io/enrique-dash/)

GitHub Pages uses the `/enrique-dash/` project base path. Local Vite uses `/`.

## Project notes

- See [PLAN.md](PLAN.md) for scope and next steps.
- See [public/character/ASSET_NOTES.md](public/character/ASSET_NOTES.md) for sprite provenance and rights cautions.
- The supplied sprite ZIP notes that the illustrations were extracted from reference art; confirm commercial redistribution rights before monetizing.
- No accounts, analytics, cloud saves, or personal data collection are included.
- No project license has been selected; choose one before accepting contributions.
