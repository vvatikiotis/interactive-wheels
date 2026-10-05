# Interactive wheelchair prototype

Current checkpoint: a generated rigid-frame wheelchair with drag-to-rotate and scroll-to-zoom camera controls, plus a rear axle position slider. Other adjustment sliders and backrest folding are planned but not implemented yet. See `docs/prototype-scope.md` and `docs/implementation-plan.md`.

## Run

Requires Node.js 20.19+ or 22.12+ and a current desktop Chrome browser.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. If the development server was already running, stop it and restart it to load this update. Run `npm test`, `npm run typecheck`, and `npm run build` for automated checks. Run `npm run test:browser` for the production Chrome interaction checks, or `npm run test:dev-browser` for development-server checks (requires Google Chrome installed at the standard macOS path).

The chair is a visual prototype, not a clinical or engineering validation tool.
