# Interactive wheelchair prototype

Status: scope confirmed; all seven adjustment controls implemented. Folding and resets remain.

## Agreed objective

Build a small browser prototype that shows how adjustments change a wheelchair visually. Users must be able to rotate the view, zoom in and out, and change adjustments interactively.

The wheelchair must remain visually whole: no disconnected parts or visibly strange configurations. Manufacturing feasibility, clinical suitability, and engineering validation are not goals.

## Agreed adjustments

- Seat width
- Seat depth
- Rear-wheel camber
- Rear axle position (moves both rear wheels forward or backward together relative to the seat)
- Backrest height
- Backrest angle relative to the seat
- Seat angle relative to the ground

Changing the seat angle keeps the front seat height fixed and moves the rear up or down. The backrest moves with the seat, preserving its selected angle relative to the seat.

## Agreed wheelchair style

Use a generic rigid-frame active wheelchair with two large rear wheels, two small front casters, a seat, backrest, and footrest. Use recognizable tubing and wheels with simple materials.

The backrest support rods attach directly to the back corners of the seat surface. The seat's frontmost 10% of measured depth is uncovered; the surface covers the rear 90%, aligned to the back edge. Two left-to-right metal rods attach beneath the rectangular seat surface, one 25% and the other 70% of the surface depth in from its front edge. Both centres bend downward beneath the surface; they do not attach to the front legs. In side view, they angle 70 degrees above the ground. Their lower ends are 15% narrower than their upper attachment points, with the proportion scaling with seat width (for example, 34 cm seat width gives 28.9 cm lower spacing). Connect the lower ends of the front frame tubes with a transverse metal rod, continuing the frame across the front. Place the footrest platform above this rod and between the front frame tubes, with its center shifted 4 cm rearward from the rod. The platform is 10 mm thick. Attach each caster-fork stem to its front frame tube 25% of the tube's length up from the lower end. The stem joins the top of an inverted-U fork; its legs flank the caster and connect to opposite ends of the axle rod, which is perpendicular to the wheel. No brand-specific details, folding frame mechanism, or occupant.

## Agreed backrest folding

Provide a Fold / Unfold button that animates the backrest forward toward the seat. Folding is separate from the configured backrest angle. Unfolding restores the selected backrest angle relative to the seat. Disable all adjustment sliders, including rear axle position, while folded and during folding or unfolding. Keep camera rotation and zoom available. Enable adjustments again once unfolding finishes.

## Agreed browser controls

Target desktop browsers with mouse or trackpad input. Mobile browsers and touch controls are out of scope for this prototype.

Drag to rotate the view and scroll to zoom. Put adjustment controls in a side panel and provide a Reset view button.

## Agreed adjustment controls

Use sliders with visible measurements, without editable number fields. Show dimensions in centimetres and angles in degrees. Update the wheelchair as the user drags.

Provide Reset configuration separately from Reset view. Reset configuration immediately restores all adjustment defaults and the unfolded backrest without changing the camera position. If a fold or unfold animation is running, reset cancels it.

## Agreed measurement conventions

Seat width and depth describe the seating surface, excluding frame tubing. Front seat height is measured from the ground to the top of the seat at its front edge. Rear axle position is the horizontal forward distance from the rear edge of the seat to both rear-wheel centres, measured in centimetres. Zero places the wheel centres directly below the seat's rear edge; values are non-negative. The slider labels indicate the forward direction. Changing seat depth moves the rear wheels and axle tube with the rear seat edge, preserving the selected rear axle position.

Measure backrest angle from the forward direction along the seat to the backrest: values above 90° lean backward. In the folded position, the backrest is approximately parallel to the seat and stops just above it to avoid overlap, rather than reaching an exact 0° angle.

## Agreed fixed dimensions and slider steps

Use a front seat height of 50 cm, rear-wheel diameter of 61 cm (approximately 24 inches), and caster diameter of 10 cm. Dimension sliders use 1 cm steps; angle sliders use 1° steps.

Derive the remaining frame and footrest geometry to keep the chair connected rather than adding controls beyond those listed above.

## Agreed ground contact and geometry

Keep wheel sizes fixed and wheels in contact with the ground as adjustments change. Adapt the simplified tubing and connections around the selected dimensions so the chair remains connected.

Moving the rear axle position moves both rear-wheel centres and a visible transverse axle tube together, without moving the seat, front casters, or footrest. Show the tube between the rear-wheel axle attachments at hub height. Connect the rear corners of the seat surface directly to this axle tube with frame supports. Add a second support on each side from the midpoint of the seat side rail to the same axle-tube attachment. Rear-wheel camber still tilts the wheels independently of this tube. This is not a calculation of the tipping point or stability.

Seat tilt changes the seat and its supporting geometry, not the orientation of the whole chair. This is a connected visual model, not a reproduction of real adjustment mechanisms.

## Agreed visual constraints

Use conservative slider ranges and restrict combinations where necessary to keep the wheelchair connected and visually coherent. Preserve selected dimensions rather than silently changing them to hide collisions. These restrictions are visual limits, not safety or manufacturing validation.

The following ranges are provisional visual ranges, not validated wheelchair specifications. Narrow them if visual testing reveals collisions.

| Adjustment | Range | Default |
|---|---:|---:|
| Seat width | 33–46 cm | 39 cm |
| Seat depth | 36–46 cm | 40 cm |
| Rear-wheel camber | −4–6° | 2° |
| Rear axle position | 0 to +12 cm | +8 cm |
| Backrest height | 10–45 cm | 20 cm |
| Backrest angle to seat | 80–110° | 85° |
| Seat angle to ground | 0–12° | 6° |

Positive seat angle means the rear is lower than the front. A 90° backrest angle is perpendicular to the seat. Positive camber means the rear wheels lean inward at the top. Measure backrest height along the backrest from the seat junction.

If a combination would cause a visible collision, stop the affected slider at the valid limit and show a short explanation, such as “Limited to avoid wheel/frame overlap.” Do not silently change other settings. Allow the full agreed ranges wherever the simplified geometry can accommodate them. Collision limits and explanations remain to be implemented.

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
- All adjustment sliders, including rear axle position, update the chair and display the selected measurements. The current checkpoint covers all seven sliders.
- At defaults, limits, and tested combinations, parts stay connected, wheels stay grounded, and no obvious intersections appear. Full geometry validation for combinations remains.
- Restricted combinations stop with an explanation.
- Folding and unfolding work at allowed settings without visible collisions. Folding remains to be implemented.
- Rotation, zoom, both resets, and slider disabling behave as agreed.
- Automated geometry checks cover dimensions and ground contact; browser checks cover appearance and interaction.

These checks validate the visual prototype, not engineering accuracy.

## Interview status

The user confirmed the initial scope and requested rear axle position as an additional control. Its range is 0 to +12 cm in 1 cm steps, with a +8 cm default. This addition was authorized and implemented as a geometry and UI control.
