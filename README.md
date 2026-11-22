# Enrique Dash

**Current test version: 0.2.0** — a touch-first browser platformer built with Three.js. The first course, **Neon Run**, is playable from start to finish. The game shows its version in the header and footer; code changes are developed on branches and should bump `package.json` before merging.

## Play locally

Requirements: Node.js 22 (the CI runner uses Node 22).

```sh
npm ci
npm run dev
```

Open the Vite URL in a browser with WebGL enabled. To verify a release build:

```sh
npm run build
npm run preview
```

Tap/click the playfield or press Space, Arrow Up, or W to jump. Tap/click again (or press a supported key) to retry after a crash or completion. Sound is optional and starts off.

## What's in this version

- One complete playable course: **Neon Run**, with six obstacle groups, jump physics, collision, a progress meter, clear/retry states, and keyboard/touch input.
- Enrique's supplied character sprite sheet is animated for idle, run, jump ascent/apex/fall, hurt, and victory. The original mapping data and alpha atlas are in `public/character/`.
- The game scene and hazards render in Three.js; the character is a 2D sprite plane inside the 3D side-on scene.
- Skyline, level preview cards, responsive layout, optional sound, and a placeholder cube fallback if the character atlas cannot load.
- `Skyline Rush`, `Solar Flare`, and `Gravity Garden` are previews only, not playable levels.

## Versioning and branch workflow

- Work on a feature/fix branch; do not commit implementation directly to `main`.
- Bump `package.json` for every release candidate/meaningful test build and keep `package-lock.json` in sync. The UI reads the version from `package.json`.
- Open a pull request to `main`. The CI workflow installs the lockfile and runs a production build on branches and pull requests.
- After changes merge to `main`, the Pages workflow builds the project-site base path and deploys it. Manual deployment is available with `workflow_dispatch`.
- Tags/releases can be added when a tested version is approved; a visible version identifies the artifact being tested but is not itself a release approval.

## GitHub Pages

The target GitHub Pages project URL is `https://giruagent.github.io/enrique-dash/`, but it is **not live yet**. Creating Pages through GitHub's API returned HTTP 422: the current GitHub plan does not support Pages for this private repository. The source and character assets remain private; they were not made public as a workaround. To publish, choose whether to make the repository public (which also discloses the code and supplied character assets), enable a GitHub plan that supports Pages for a private repository, or use another host. After that decision, the Pages source can be set to **GitHub Actions** and the existing workflow will deploy `dist/` with the correct `/enrique-dash/` base path.

## Project notes

- See [PLAN.md](PLAN.md) for product scope, risks, and upcoming phases.
- See [public/character/ASSET_NOTES.md](public/character/ASSET_NOTES.md) for sprite asset provenance and rights cautions.
- The supplied ZIP's README notes that artwork was extracted from reference illustrations and recommends edge inspection; confirm commercial redistribution rights before a public commercial launch.
- No accounts, analytics, cloud saves, or personal data collection are included.
- No project license has been selected; choose one before accepting contributions.
