# Prototype implementation plan

See [prototype-scope.md](prototype-scope.md) for the current behavior and limits.

## Implemented

- React, TypeScript, Vite, React Three Fiber, and Drei render a generated chair and a mouse-controlled 3D view.
- `src/geometry.ts` derives seat, frame, backrest, footplate, axle, and wheel positions from ten configuration values. A separate fold progress moves the backrest without changing its configured angle. Internal distances are in metres; slider dimensions are in centimetres and angles in degrees. Caster centre height follows the tyre radius so thicker tyres remain grounded.
- `src/Wheelchair.tsx` renders the chair and optional articulated wireframe mannequin; `src/mannequin.ts` derives the mannequin pose. `src/main.tsx` owns slider state, mannequin visibility, the 0.4-second Fold / Unfold animation, both reset controls, and the viewer.
- `src/geometry.test.ts` covers derived measurements, structural connections, caster and footplate clearances, and backrest folding at all 1,024 slider-endpoint combinations with 11 fold samples each. `src/mannequin.test.ts` checks body anchors, arm lengths and bends, knee bends across those adjustment combinations, and how the pose follows backrest curvature. `tests/viewer.spec.ts` covers all ten sliders, the mannequin toggle, curvature response, extreme configurations, folding and unfolding, both resets, camera orbit, and zoom.

## Current limits

- Collision-free geometry for every continuous setting and every fold pose is not proven. Endpoint sampling does not cover every intermediate slider value.
- The mannequin is a visual scale cue, not an anatomical, fit, or clinical model.
- There is no backend, saved-configuration feature, export, or imported 3D asset.

Keep the solution small: use explicit geometry and targeted checks rather than a physics engine or a general mesh-collision system.
