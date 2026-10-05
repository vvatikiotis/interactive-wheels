# Prototype implementation plan

Status: all seven adjustment sliders and live generated geometry implemented; folding and resets remain.

## Scope review

The scope is suitable for a small interactive prototype. Keep the seven agreed controls, folding, and camera interaction; do not add assets, persistence, a backend, or engineering validation.

The main complexity is maintaining connected geometry while dimensions and angles change. The controls cannot be implemented as unrelated mesh transformations.

### Risks to address first

- **Seat anchoring:** keep the top of the front seating surface at 50 cm, accounting for upholstery thickness. Derive the rear seat position and backrest hinge from seat depth and tilt.
- **Tapered front frame:** set the front tubes to 70 degrees above ground in side view. Derive upper leg spacing from seat width and lower spacing as 85% of that width. Attach two transverse seat rods beneath the rectangular seat surface, at 25% and 70% of its depth in from the front edge. Bend each rod downward at its centre; neither attaches to the front legs. Connect the lower front-frame endpoints with a transverse rod and place the footrest platform directly on top of it. Derive the platform width from lower tube spacing so it stays between the tubes across seat-width adjustments. Attach each caster fork to its front frame tube 25% of the tube's length up from the lower end.
- **Rear axle position:** derive both rear-wheel centres and a transverse axle tube at hub height from one seat-relative fore–aft value. Keep the seat, front casters, and footrest in place; connect the rear seat-surface corners directly to the axle tube, and add a second support per side from the midpoint of each seat side rail to the same axle-tube attachment. Camber tilts the wheels independently of the tube. When seat depth changes, the tube and rear wheels follow the rear seat edge, keeping the displayed axle position unchanged. Review clearance against backrest, frame, and folded path throughout its range. This changes the chair's visible balance, not a computed tipping point.
- **Cambered wheels:** derive axle height from the rendered tire's vertical extent after tilting, including tire thickness. A fixed axle height can lift a tilted wheel off the ground. Derive lateral clearance from the seat and frame.
- **Folding sweep:** test the path, not just the endpoints. A 45 cm backrest is longer than a 36 cm seat and may extend past its front edge when folded. That overhang is not inherently invalid, but intersections with tubing, wheels, or footrest are.
- **Constraint complexity:** avoid a physics engine or general mesh-collision system. Use simple geometry designed for clearance, then explicit rules for demonstrated collision risks. Intended overlaps at tube joints are not collisions.
- **Coverage:** minimum/maximum combinations alone do not establish correctness at intermediate angles. Include intermediate poses and sampled folding paths alongside analytic checks.

The rear axle position range is 0 to +12 cm, default +8 cm in 1 cm steps, measured horizontally from the rear seat edge; positive is forward. Its geometry and slider are implemented. Backrest height ranges from 10–45 cm with a 20 cm default. Rear-wheel camber ranges from −4–6° with a 2° default. The revised height default and camber range are implemented. Coordinate axes, internal units, tube thicknesses, hinge offsets, and fixed attachment positions are implementation choices within the agreed scope. Surface any required change to agreed behavior rather than silently expanding or weakening the scope.

## Implementation sequence

### 1. Establish geometry and tests

Define a single coordinate convention and use metres internally, converting centimetres and degrees at the UI boundary. Centralize defaults, ranges, fixed dimensions, and geometry thicknesses.

Create a pure `deriveGeometry(configuration, foldProgress)` function returning component anchors, dimensions, and orientations. Derive seat geometry first, then backrest supports attached directly to the rear seat-surface corners, grounded wheels, and connecting frame/footrest geometry.

Test seat dimensions, fixed front height, backrest angle relative to seat, left/right symmetry, tire-ground contact, and how both rear-wheel centres and the axle tube move together while the seat, casters, and footrest stay put. Use geometry constants shared with rendering rather than separate approximations. Include a geometry test for 40 cm upper spacing and 34 cm lower spacing at a 40 cm seat width, and test proportional taper at other seat widths.

### 2. Render the default chair

Scaffold React, TypeScript, Vite, React Three Fiber, and Drei. Render the default chair entirely from generated shapes driven by the derived geometry.

Check that the chair is recognizable, connected, grounded, and dimensionally consistent before adding the controls. Add basic camera interaction for inspection.

### 3. Exercise adjustments and clearances

Test each slider's extrema, all 128 minimum/maximum combinations for seven controls, and targeted intermediate combinations. The current checkpoint smoke-tests the all-maximum corner; exhaustive combinations and geometry-specific collision checks remain. For rear axle position, also inspect wheel/frame clearance and connecting tubes at both ends of its range. Establish folding clearance early, before treating a configuration as accepted.

Prefer geometry that supports the full agreed ranges. Add explicit clearance checks where required. On an invalid proposed change, stop at the last valid slider step reachable from the current value; do not jump over an invalid interval or modify other settings. Display a short reason.

Connect all seven sliders with visible units and immediate geometry updates. The current checkpoint implements direct updates but not collision limits or their explanations.

### 4. Add folding and reset behavior

Represent unfolded, folding, folded, and unfolding states explicitly. Animate fold progress over approximately 0.4 seconds, retaining the selected backrest angle separately.

Check clearance along the folding path, including tall-backrest/short-seat configurations. Disable all seven sliders while not fully unfolded, ignore repeated fold-button clicks during animation, and keep camera controls available.

Reset configuration cancels animation, restores all seven defaults, and unfolds immediately without moving the camera.

### 5. Finish presentation and acceptance checks

Add the agreed light background, contrasting materials, ground plane, soft shadow, initial three-quarter view, and camera limits. Implement Reset view independently from Reset configuration.

Use a small unit-test setup for geometry and browser tests for interaction. Verify in current desktop Chrome:

- Slider updates, displayed values, bounds, and any restriction explanations, including rear axle position.
- Default and extreme configurations from multiple viewing angles.
- Folding path, disabled controls, repeated clicks, and reset during animation.
- Rotation and zoom while folded.
- Configuration reset preserves camera position; view reset preserves configuration.
- Local startup instructions work.

Use browser visual inspection to catch problems that numerical tests cannot establish, such as recognizability or visually awkward tubing. Do not describe sampled testing as exhaustive collision proof.

## Suggested file boundaries

- `src/geometry.ts`: configuration constants, geometry derivation, and clearance rules.
- `src/geometry.test.ts`: geometry and constraint tests.
- `src/Wheelchair.tsx`: generated meshes consuming derived geometry.
- `src/App.tsx`: controls, folding state, resets, and scene integration.
- `tests/configurator.spec.ts`: browser interaction checks.

These are starting boundaries, not a requirement to build a framework. Add modules only when the implementation needs them.

## First checkpoint

The default-chair viewer and all seven adjustment controls are implemented. Next, implement folding, reset behavior, and validated visual restrictions, extending geometry and browser tests.
