import { type Point, type deriveGeometry } from './geometry'

type Chair = ReturnType<typeof deriveGeometry>
type Segment = [Point, Point]

export function deriveMannequin({ seat, backrest, footrest }: Chair) {
  const hipCenter: Point = [0, seat.rear[1] + 0.025, seat.rear[2] + 0.07]
  const shoulderCenter: Point = [
    0,
    hipCenter[1] + 0.31 * Math.sin(backrest.angle),
    hipCenter[2] + 0.31 * Math.cos(backrest.angle),
  ]
  const head = { center: [0, shoulderCenter[1] + 0.11, shoulderCenter[2]] as Point, radius: 0.07 }
  const hips = ([-1, 1] as const).map(side => [side * Math.min(seat.width * 0.25, 0.1), hipCenter[1], hipCenter[2]] as Point)
  const shoulders = ([-1, 1] as const).map(side => [side * Math.min(seat.width * 0.4, 0.16), shoulderCenter[1], shoulderCenter[2]] as Point)
  const knees = ([-1, 1] as const).map(side => [side * Math.min(seat.width * 0.22, 0.09), seat.front[1] + 0.075, seat.front[2] + 0.04] as Point)
  const ankles = knees.map(knee => [knee[0], footrest.center[1] + 0.065, footrest.center[2] - 0.025] as Point)
  const toes = ankles.map(ankle => [ankle[0], footrest.center[1] + 0.015 + 0.04 * Math.tan(footrest.angle), footrest.center[2] + 0.04] as Point)
  const segments: Segment[] = [
    [hips[0], hips[1]], [hips[0], shoulders[0]], [hips[1], shoulders[1]],
    [shoulders[0], shoulders[1]], [hipCenter, shoulderCenter],
    [shoulderCenter, [0, head.center[1] - head.radius, head.center[2]]],
  ]
  for (const [index, side] of [-1, 1].entries()) {
    const elbow: Point = [shoulders[index][0] + side * 0.025, shoulders[index][1] - 0.19, shoulders[index][2] + 0.07]
    const hand: Point = [side * seat.width * 0.41, seat.front[1] + 0.065, seat.front[2] - 0.06]
    segments.push([shoulders[index], elbow], [elbow, hand], [hips[index], knees[index]], [knees[index], ankles[index]], [ankles[index], toes[index]])
  }
  return { head, hips, shoulders, knees, ankles, toes, segments }
}
