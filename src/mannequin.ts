import { type Point, type deriveGeometry } from './geometry'

type Chair = ReturnType<typeof deriveGeometry>

export function deriveMannequin({ seat, backrest, footrest }: Chair) {
  const hipCenter: Point = [0, seat.rear[1] + 0.025, seat.rear[2] + 0.07]
  const shoulderCenter: Point = [
    0,
    hipCenter[1] + 0.31 * Math.sin(backrest.angle) + backrest.curvature * Math.cos(backrest.angle),
    hipCenter[2] + 0.31 * Math.cos(backrest.angle) - backrest.curvature * Math.sin(backrest.angle),
  ]
  const head = { center: [0, shoulderCenter[1] + 0.11, shoulderCenter[2]] as Point, radius: 0.07 }
  const hips = ([-1, 1] as const).map(side => [side * seat.width * 0.475, hipCenter[1], hipCenter[2]] as Point)
  const thighs = ([-1, 1] as const).map(side => [side * seat.width * 0.3, hipCenter[1], hipCenter[2]] as Point)
  const shoulders = ([-1, 1] as const).map(side => [side * seat.width * 0.5, shoulderCenter[1], shoulderCenter[2]] as Point)
  const knees = ([-1, 1] as const).map(side => [side * Math.min(seat.width * 0.22, 0.09), seat.front[1] + 0.075, seat.front[2] + 0.04] as Point)
  const ankles = knees.map(knee => [knee[0], footrest.center[1] + 0.065, footrest.center[2] - 0.025] as Point)
  const toes = ankles.map(ankle => [ankle[0], footrest.center[1] + 0.015 + 0.04 * Math.tan(footrest.angle), footrest.center[2] + 0.04] as Point)
  const upperArmLength = 0.2465
  const forearmLength = 0.221
  const arms = ([-1, 1] as const).map((side, index) => {
    const shoulder = shoulders[index]
    const hand: Point = [shoulder[0] + side * 0.1, shoulder[1] - 0.45, shoulder[2]]
    const deltaX = hand[0] - shoulder[0]
    const deltaY = hand[1] - shoulder[1]
    const distance = Math.hypot(deltaX, deltaY)
    const along = (upperArmLength ** 2 - forearmLength ** 2 + distance ** 2) / (2 * distance)
    const across = Math.sqrt(upperArmLength ** 2 - along ** 2)
    const elbow: Point = [
      shoulder[0] + along * deltaX / distance - side * across * deltaY / distance,
      shoulder[1] + along * deltaY / distance + side * across * deltaX / distance,
      shoulder[2],
    ]
    return [shoulder, elbow, hand] as [Point, Point, Point]
  })
  return { head, hipCenter, shoulderCenter, hips, thighs, shoulders, arms, knees, ankles, toes }
}
