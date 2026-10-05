# Prototype implementation plan

See [prototype-scope.md](prototype-scope.md) for the current behavior, ranges, and remaining requirements.

## Implemented

- React, TypeScript, Vite, React Three Fiber, and Drei render a generated chair and a mouse-controlled 3D view.
- `src/geometry.ts` derives seat, frame, backrest, footplate, axle, and wheel positions from eight configuration values. A separate fold progress moves the backrest without changing its configured angle. Internal distances are in metres; slider dimensions are in centimetres and angles in degrees. Caster centre height follows the tyre radius so thicker tyres remain grounded.
- `src/Wheelchair.tsx` renders those shapes; `src/main.tsx` owns slider state, the 0.4-second Fold / Unfold animation, both reset controls, and the viewer.
- `src/geometry.test.ts` covers key derived measurements, connections, and sampled backrest fold poses. `tests/viewer.spec.ts` covers slider values, two extreme configurations, folding and unfolding, both resets, camera orbit, and zoom.

## Remaining work, if completing the earlier scope

1. **Folding clearance:** Inspect the full backrest motion path at different backrest heights and seat depths; endpoints alone cannot reveal collisions.
2. **Visual limits:** Inspect problematic combinations, including intermediate values and footplate slopes. Add targeted clearance rules only where geometry cannot remain coherent. Stop at the last valid slider step and explain the limit, without changing other settings. Tube joints may intentionally overlap; do not treat them as collisions.
3. **Verification:** Extend geometry tests for those rules and browser tests for blocked settings. Inspect the chair from multiple angles in Chrome. Sampling extremes or combinations is not proof of collision-free behavior or engineering safety.

Keep the solution small: use explicit geometry and targeted checks rather than a physics engine or a general mesh-collision system. No backend, persistence, export, or imported 3D models are needed.
