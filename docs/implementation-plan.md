# Prototype implementation plan

See [prototype-scope.md](prototype-scope.md) for the current behavior, ranges, and remaining requirements.

## Implemented

- React, TypeScript, Vite, React Three Fiber, and Drei render a generated chair and a mouse-controlled 3D view.
- `src/geometry.ts` derives seat, frame, backrest, footplate, axle, and wheel positions from ten configuration values. A separate fold progress moves the backrest without changing its configured angle. Internal distances are in metres; slider dimensions are in centimetres and angles in degrees. Caster centre height follows the tyre radius so thicker tyres remain grounded.
- `src/Wheelchair.tsx` renders those shapes and an optional wireframe mannequin derived in `src/mannequin.ts`; `src/main.tsx` owns slider state, mannequin visibility, the 0.4-second Fold / Unfold animation, both reset controls, and the viewer.
- `src/geometry.test.ts` covers key derived measurements, connections, and sampled backrest fold poses. `src/mannequin.test.ts` checks the figure's seat, footplate, and backrest anchors. `tests/viewer.spec.ts` covers slider values, the mannequin toggle, two extreme configurations, folding and unfolding, both resets, camera orbit, and zoom.

## Remaining work, if completing the earlier scope

1. **Folding clearance:** Geometry tests sample 11 fold poses for all 512 combinations of slider endpoints, checking caster grounding, fork-top clearance, footplate clearance, and the backrest tip against the seat plane. Open, intermediate, and folded views have also been inspected at narrow and wide configurations from a three-quarter view and a sideward view. Browser tests check that both extreme configurations fold and unfold without rendering errors. The tall backrest overhangs the shortest seat when folded, but overhang alone is not a collision. These checks do not establish complete collision clearance.
2. **Visual limits:** The thicker caster tyre reduced fork-top clearance, so the fork now follows tyre size and clears it. Do not add arbitrary slider restrictions. If a specific setting produces a visible collision, add a targeted rule that stops at the last valid slider step and explains why, without changing other settings. Tube joints may intentionally overlap.
3. **Verification:** Extend geometry and browser tests for any demonstrated restriction, including intermediate values and footplate slopes. Sampling extremes or combinations is not proof of collision-free behavior or engineering safety.

Keep the solution small: use explicit geometry and targeted checks rather than a physics engine or a general mesh-collision system. No backend, persistence, export, or imported 3D models are needed.
