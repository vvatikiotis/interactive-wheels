# Interactive wheelchair prototype

Status: design interview complete; scope confirmed by the user. Application implementation is not authorized yet.

## Agreed objective

Build a small browser prototype that shows how adjustments change a wheelchair visually. Users must be able to rotate the view, zoom in and out, and change adjustments interactively.

The wheelchair must remain visually whole: no disconnected parts or visibly strange configurations. Manufacturing feasibility, clinical suitability, and engineering validation are not goals.

## Agreed adjustments

- Seat width
- Seat depth
- Rear-wheel camber
- Backrest height
- Backrest angle relative to the seat
- Seat angle relative to the ground

Changing the seat angle keeps the front seat height fixed and moves the rear up or down. The backrest moves with the seat, preserving its selected angle relative to the seat.

## Agreed wheelchair style

Use a generic rigid-frame active wheelchair with two large rear wheels, two small front casters, a seat, backrest, and footrest. Use recognizable tubing and wheels with simple materials. No brand-specific details, folding frame mechanism, or occupant.

## Agreed backrest folding

Provide a Fold / Unfold button that animates the backrest forward toward the seat. Folding is separate from the configured backrest angle. Unfolding restores the selected backrest angle relative to the seat. Disable all six adjustment sliders while folded and during folding or unfolding. Keep camera rotation and zoom available. Enable adjustments again once unfolding finishes.

## Agreed browser controls

Target desktop browsers with mouse or trackpad input. Mobile browsers and touch controls are out of scope for this prototype.

Drag to rotate the view and scroll to zoom. Put adjustment controls in a side panel and provide a Reset view button.

## Agreed adjustment controls

Use sliders with visible measurements, without editable number fields. Show dimensions in centimetres and angles in degrees. Update the wheelchair as the user drags.

Provide Reset configuration separately from Reset view. Reset configuration immediately restores all six defaults and the unfolded backrest without changing the camera position. If a fold or unfold animation is running, reset cancels it.

## Agreed measurement conventions

Seat width and depth describe the seating surface, excluding frame tubing. Front seat height is measured from the ground to the top of the seat at its front edge.

Measure backrest angle from the forward direction along the seat to the backrest: values above 90° lean backward. In the folded position, the backrest is approximately parallel to the seat and stops just above it to avoid overlap, rather than reaching an exact 0° angle.

## Agreed fixed dimensions and slider steps

Use a front seat height of 50 cm, rear-wheel diameter of 61 cm (approximately 24 inches), and caster diameter of 10 cm. Dimension sliders use 1 cm steps; angle sliders use 1° steps.

Derive the remaining frame and footrest geometry to keep the chair connected rather than adding controls.

## Agreed ground contact and geometry

Keep wheel sizes fixed and wheels in contact with the ground as adjustments change. Adapt the simplified tubing and connections around the selected dimensions so the chair remains connected.

Seat tilt changes the seat and its supporting geometry, not the orientation of the whole chair. This is a connected visual model, not a reproduction of real adjustment mechanisms.

## Agreed visual constraints

Use conservative slider ranges and restrict combinations where necessary to keep the wheelchair connected and visually coherent. Preserve selected dimensions rather than silently changing them to hide collisions. These restrictions are visual limits, not safety or manufacturing validation.

The following ranges are provisional visual ranges, not validated wheelchair specifications. Narrow them if visual testing reveals collisions.

| Adjustment | Range | Default |
|---|---:|---:|
| Seat width | 33–46 cm | 39 cm |
| Seat depth | 36–46 cm | 40 cm |
| Rear-wheel camber | 0–6° | 2° |
| Backrest height | 25–45 cm | 35 cm |
| Backrest angle to seat | 80–110° | 95° |
| Seat angle to ground | 0–12° | 6° |

Positive seat angle means the rear is lower than the front. A 90° backrest angle is perpendicular to the seat. Positive camber means the rear wheels lean inward at the top. Measure backrest height along the backrest from the seat junction.

If a combination would cause a visible collision, stop the affected slider at the valid limit and show a short explanation, such as “Limited to avoid wheel/frame overlap.” Do not silently change other settings. Allow the full agreed ranges wherever the simplified geometry can accommodate them.

## Agreed implementation scope

Use React, TypeScript, and Vite, with React Three Fiber and Drei for the 3D view. Generate all geometry in code, including tubing, wheels, seat, and backrest. No imported models or backend.

Run locally in a desktop browser. Defer Blender assets, hosting, saving configurations, and export.

## Agreed animation behavior

Slider changes follow input directly, without an additional transition animation. Animate normal folding and unfolding over approximately 0.4 seconds. Ignore repeated fold-button clicks during that animation.

## Agreed presentation

Use a light background, a ground plane with a soft shadow, and contrasting frame and upholstery. Start with a three-quarter view showing the front and one side.

Keep the camera above ground and limit zoom to avoid navigating inside the chair. No decorative environment, automatic rotation, or extra visual effects.

## Agreed acceptance checks

- Runs locally in a current desktop Chrome browser.
- All six sliders update the chair and display the selected measurements.
- At defaults, limits, and tested combinations, parts stay connected, wheels stay grounded, and no obvious intersections appear.
- Restricted combinations stop with an explanation.
- Folding and unfolding work at allowed settings without visible collisions.
- Rotation, zoom, both resets, and slider disabling behave as agreed.
- Automated geometry checks cover dimensions and ground contact; browser checks cover appearance and interaction.

These checks validate the visual prototype, not engineering accuracy.

## Interview status

The user confirmed the scope and shared understanding. The design interview is complete. Application implementation awaits explicit authorization.
