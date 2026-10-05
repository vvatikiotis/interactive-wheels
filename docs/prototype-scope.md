# Interactive wheelchair prototype

## Purpose and limits

A browser-based visual configurator for a rigid-frame wheelchair. The chair should look connected as its dimensions change, but the model does not assess stability, safety, clinical suitability, or manufacturing feasibility. It has no occupant, backend, saved configurations, or imported 3D assets.

## Current controls

Sliders update the generated chair immediately, in 1 cm or 1° steps. Measurements are displayed beside each slider.

| Adjustment | Range | Default | Meaning |
|---|---:|---:|---|
| Seat width | 33–46 cm | 39 cm | Seating surface, excluding tubing |
| Seat depth | 36–46 cm | 40 cm | Full front-to-back measurement; the front 10% is uncovered |
| Rear-wheel camber | −4–6° | 2° | Positive brings wheel tops inward |
| Rear axle position | 0–12 cm | 8 cm | Forward from the seat's rear edge; zero aligns wheel centres beneath it |
| Backrest height | 10–45 cm | 20 cm | Measured along the backrest |
| Backrest angle to seat | 80–110° | 85° | 90° is perpendicular to the seat; larger values lean backward |
| Seat angle to ground | 0–12° | 6° | Positive lowers the rear while front height remains fixed |
| Footplate slope | 0–15° | 0° | Positive raises the front edge relative to the ground |

## Chair geometry

- The front seat height is 50 cm. The seat surface spans the rear 90% of the measured depth. Backrest supports start at the rear corners of this surface. Two downward-bent crossbars sit beneath it, 25% and 70% of the surface depth from its front edge.
- Front frame tubes descend at 70° to the ground in side view. Their lower spacing is 85% of their seat-width-derived upper spacing. A transverse rod joins their lower ends.
- The 10 mm thick footplate fits between the front tubes. Its centre is 4 cm behind the transverse rod; its height changes with slope so its underside meets the rod. Sloping it does not change its width or depth.
- Each caster-fork stem connects one quarter of the way up its front tube. An inverted-U fork straddles the caster, with its legs joining opposite ends of the axle perpendicular to the wheel. Each caster wheel has a 40 mm tyre centreline radius and a 10.4 mm tyre tube radius (100.8 mm overall diameter); the wheel centre adjusts to keep the tyre grounded. The fork top clears the tyre by at least 8 mm at its centreline, leaving room for the fork tube. The wheel face is perforated rather than spoked or solid.
- The rear wheels and their transverse axle tube move together as rear axle position changes. Supports join the rear seat corners and seat-side midpoints to the axle attachments. Rear-wheel camber tilts the wheels independently of the axle tube.

The model derives positions from shared configuration geometry and uses generated meshes. Wheel-ground contact and frame coherence are visual targets, not mechanical guarantees across every possible combination.

## Interaction

The desktop viewer starts in a three-quarter view. Drag to orbit and scroll to zoom; the camera stays above the ground and zoom is limited. The scene has a light background, a contrasting ground plane with a 20 cm reference grid, and a shadow to make ground contact and orientation visible. Mobile and touch controls are outside the present scope.

Fold / Unfold animates the backrest forward toward the seat over about 0.4 seconds, independently of the configured backrest angle. All eight sliders are disabled while folding, folded, or unfolding; orbit and zoom remain available. Unfolding restores the configured angle. Reset configuration restores all eight defaults and immediately unfolds, canceling any animation without moving the camera. Reset view restores the starting camera without changing the configuration.

## Not implemented

Collision-aware slider limits with an explanation when a setting is blocked are **not** part of the current prototype. No slider limit has been added solely because a long folded backrest extends beyond a short seat; overhang by itself is not a collision. If a visible collision is confirmed, stop at the last valid slider step rather than silently changing other values.

## Verification boundary

Unit tests check derived dimensions and key connections. Browser tests exercise the eight sliders, extreme settings (including narrow and wide backrest folding), both resets, orbit, and zoom in desktop Chrome. These checks do not prove collision-free geometry for all combinations or validate wheelchair safety.
