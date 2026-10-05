# Interactive wheelchair prototype

A browser-based rigid-frame wheelchair configurator with nine sliders, a folding backrest, an optional wireframe mannequin, separate configuration and camera resets, and a generated 3D view. Drag to rotate; scroll to zoom. It is a visual prototype, not a clinical or engineering validation tool.

**Live demo:** https://vvatikiotis.github.io/interactive-wheels/

## Run

Requires Node.js 20.19+ or 22.12+ and a current desktop Chrome browser.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite.

## Check

```sh
npm test
npm run typecheck
npm run build
npm run test:browser
```

Browser tests launch Google Chrome from the standard macOS application path. See [prototype scope](docs/prototype-scope.md) for current behavior and [implementation plan](docs/implementation-plan.md) for remaining work.
