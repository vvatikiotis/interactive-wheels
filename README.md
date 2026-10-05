# Interactive wheelchair prototype

First checkpoint: a generated rigid-frame wheelchair at the default dimensions, with drag-to-rotate and scroll-to-zoom camera controls. Sliders and backrest folding are planned but not implemented yet. See `docs/prototype-scope.md` and `docs/implementation-plan.md`.

## Run

Requires Node.js 20.19+ or 22.12+ and a current desktop Chrome browser.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Run `npm test`, `npm run typecheck`, and `npm run build` for automated checks. Run `npm run test:browser` for the production Chrome rotation/zoom check, or `npm run test:dev-browser` to check the development server (requires Google Chrome installed at the standard macOS path).

The chair is a visual prototype, not a clinical or engineering validation tool.
