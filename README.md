# Enrique Dash

A mobile-first browser platformer prototype built with Three.js. The player character is intentionally a luminous placeholder cube; Enrique's character art will replace it once supplied.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the local Vite URL in a modern browser with WebGL enabled. Production build:

```sh
npm run build
npm run preview
```

## Play

Tap or click the game area, or press Space, Arrow Up, or W to jump. The game is designed for touch input and adapts to narrow screens. Sound is optional and starts disabled. The first level is playable; the other worlds shown on the landing page are roadmap previews, not yet playable.

## Current scope

- Three.js-rendered 3D scene with a side-on runner, obstacles, skyline, progress, restart loop, and a simple procedural sound toggle.
- Responsive desktop, iPad, and mobile layout with pointer and keyboard controls.
- One short playable level, Neon Run. Additional level cards are concept concepts only.
- No character artwork, accounts, cloud saves, monetization, or level editor yet.

## Roadmap

See [PLAN.md](PLAN.md) for the proposed production roadmap and quality gates. The first step is to replace the placeholder player with the character asset Enrique provides, after checking that its format and usage rights are clear.

## Architecture

A small Vite application with one Three.js scene and a lightweight DOM interface. Game state, input, rendering, level data, and presentation are separated within `src/main.js` and `src/style.css` for now. Keep the first release a simple client-side app; introduce a backend only when accounts, cloud progress, or community features are real requirements.

## Deployment

Any static host that serves Vite's `dist/` output over HTTPS can run the game. WebGL and touch behavior should be validated on real iPad/iPhone/Android hardware before a public launch.

## License

No project license has been selected yet. Add one before accepting contributions or redistributing the project.
