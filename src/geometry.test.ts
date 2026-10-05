import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG, deriveGeometry } from './geometry'

const close = (actual: number, expected: number) => expect(actual).toBeCloseTo(expected, 5)

describe('configured wheelchair', () => {
  it('keeps the front seating surface 50 cm above the ground and measures seat dimensions at the surface', () => {
    const chair = deriveGeometry(DEFAULT_CONFIG)
    close(chair.seat.front[1], 0.5)
    close(chair.seat.width, 0.39)
    close(chair.seat.depth, 0.4)
    expect(chair.seat.rear[1]).toBeLessThan(chair.seat.front[1])
  })

  it('attaches the seat-front rod under the seat surface and bends its center downward', () => {
    const chair = deriveGeometry({ ...DEFAULT_CONFIG, seatDepth: 40 })
    const { start, control, end } = chair.frontFrame.seatRods[0]
    const inset = chair.seat.surfaceDepth * 0.25
    close(start[0], -chair.seat.width / 2)
    close(end[0], chair.seat.width / 2)
    close(start[1], end[1])
    close(start[2], chair.seat.surfaceFront[2] - inset * Math.cos(chair.seat.tilt) + 0.018 * Math.sin(chair.seat.tilt))
    close(start[1], chair.seat.surfaceFront[1] - inset * Math.sin(chair.seat.tilt) - 0.018 * Math.cos(chair.seat.tilt))
    const midpoint = start.map((value, axis) => value * 0.25 + control[axis] * 0.5 + end[axis] * 0.25)
    close(midpoint[0], 0)
    close(midpoint[1], start[1] - 0.02)
    close(midpoint[2], start[2])
  })

  it('places a second downward-bent seat rod 70 percent along the seat surface', () => {
    const chair = deriveGeometry({ ...DEFAULT_CONFIG, seatDepth: 40 })
    const { start, control, end } = chair.frontFrame.seatRods[1]
    const inset = chair.seat.surfaceDepth * 0.7
    close(start[2], chair.seat.surfaceFront[2] - inset * Math.cos(chair.seat.tilt) + 0.018 * Math.sin(chair.seat.tilt))
    close(end[2], start[2])
    const midpoint = start.map((value, axis) => value * 0.25 + control[axis] * 0.5 + end[axis] * 0.25)
    close(midpoint[1], start[1] - 0.02)
  })

  it('leaves the frontmost ten percent of the measured seat depth uncovered', () => {
    const chair = deriveGeometry({ ...DEFAULT_CONFIG, seatDepth: 40 })
    close(chair.seat.surfaceDepth, 0.36)
    close(chair.seat.surfaceCenter[2] + chair.seat.surfaceDepth * Math.cos(chair.seat.tilt) / 2, chair.seat.front[2] - 0.1 * chair.seat.depth * Math.cos(chair.seat.tilt))
    close(chair.seat.surfaceCenter[2] - chair.seat.surfaceDepth * Math.cos(chair.seat.tilt) / 2, chair.seat.rear[2])
  })

  it('keeps front height fixed as the rear drops with seat tilt', () => {
    const chair = deriveGeometry({ ...DEFAULT_CONFIG, seatAngle: 12 })
    close(chair.seat.front[1], 0.5)
    close(chair.seat.rear[1], 0.41684)
  })

  it('measures backrest height along the backrest and preserves its angle to a tilted seat', () => {
    const chair = deriveGeometry({ ...DEFAULT_CONFIG, seatAngle: 0, backrestAngle: 90, backrestHeight: 45 })
    close(chair.backrest.top[1] - chair.backrest.base[1], 0.45)
    close(chair.backrest.top[2] - chair.backrest.base[2], 0)
  })

  it('carries the backrest with the tilted seat while retaining its selected length and relative angle', () => {
    const chair = deriveGeometry({ ...DEFAULT_CONFIG, backrestHeight: 35, backrestAngle: 95 })
    close(chair.backrest.top[1], 0.80176)
    close(chair.backrest.top[2], -0.26569)
  })

  it('moves both rear wheels and axle tube together relative to the seat rear edge', () => {
    const chair = deriveGeometry({ ...DEFAULT_CONFIG, rearAxlePosition: 8 })
    close(chair.rearWheels[0].center[2], -0.118904379)
    close(chair.rearWheels[1].center[2], -0.118904379)
    close(chair.axleTube.start[2], chair.rearWheels[0].center[2])
    close(chair.axleTube.end[2], chair.rearWheels[1].center[2])
    close(chair.rearAxlePosition, 0.08)
  })

  it('keeps the selected rear axle position when seat depth changes', () => {
    const chair = deriveGeometry({ ...DEFAULT_CONFIG, seatDepth: 46, rearAxlePosition: -5 })
    close(chair.rearWheels[0].center[2] - chair.seat.rear[2], -0.05)
    close(chair.rearAxlePosition, -0.05)
  })

  it('changes wheel camber independently of the transverse axle tube', () => {
    const straight = deriveGeometry({ ...DEFAULT_CONFIG, wheelCamber: 0 })
    const cambered = deriveGeometry({ ...DEFAULT_CONFIG, wheelCamber: 6 })
    close(straight.axleTube.start[1], 0.305)
    close(cambered.axleTube.start[1], 0.303329178)
    close(cambered.rearWheels[0].camber, -6 * Math.PI / 180)
  })

  it('tapers front frame tubes to 85 percent of seat width and centers the footrest between them', () => {
    const standard = deriveGeometry({ ...DEFAULT_CONFIG, seatWidth: 40 })
    close(standard.frontFrame.upperSpacing, 0.4)
    close(standard.frontFrame.lowerSpacing, 0.34)
    close(standard.footrest.center[0], 0)
    expect(standard.footrest.width).toBeLessThan(standard.frontFrame.lowerSpacing)
    close(standard.frontFrame.crossbar.start[0], standard.frontFrame.lowerLeft[0])
    close(standard.frontFrame.crossbar.start[1], standard.frontFrame.lowerLeft[1])
    close(standard.frontFrame.crossbar.start[2], standard.frontFrame.lowerLeft[2])
    close(standard.frontFrame.crossbar.end[0], standard.frontFrame.lowerRight[0])
    close(standard.frontFrame.crossbar.end[1], standard.frontFrame.lowerRight[1])
    close(standard.frontFrame.crossbar.end[2], standard.frontFrame.lowerRight[2])
    close(standard.footrest.center[1] - 0.009, standard.frontFrame.lowerLeft[1] + standard.frontFrame.crossbar.radius)
    close(standard.footrest.center[2], standard.frontFrame.lowerLeft[2])
    const narrow = deriveGeometry({ ...DEFAULT_CONFIG, seatWidth: 34 })
    close(narrow.frontFrame.upperSpacing, 0.34)
    close(narrow.frontFrame.lowerSpacing, 0.289)
  })

  it('sets the front frame tubes 70 degrees above the ground in side view', () => {
    const chair = deriveGeometry(DEFAULT_CONFIG)
    const lower = chair.frontFrame.lowerLeft
    const upper = chair.frontFrame.upperLeft
    const angle = Math.atan2(upper[1] - lower[1], Math.abs(upper[2] - lower[2])) * 180 / Math.PI
    close(angle, 70)
  })

  it('attaches each caster fork one quarter of the front-frame tube length above its lower end', () => {
    const chair = deriveGeometry({ ...DEFAULT_CONFIG, seatWidth: 40 })
    for (const [index, side] of [-1, 1].entries()) {
      const lower = side < 0 ? chair.frontFrame.lowerLeft : chair.frontFrame.lowerRight
      const upper = side < 0 ? chair.frontFrame.upperLeft : chair.frontFrame.upperRight
      const attachment = chair.casters[index].forkAttachment
      const tubeLength = Math.hypot(...upper.map((value, axis) => value - lower[axis]) as [number, number, number])
      const attachmentFromBottom = Math.hypot(...attachment.map((value, axis) => value - lower[axis]) as [number, number, number])
      close(attachmentFromBottom / tubeLength, 0.25)
      close(attachment[0], side * (chair.frontFrame.lowerSpacing / 2 + (chair.frontFrame.upperSpacing - chair.frontFrame.lowerSpacing) * 0.125))
    }
  })

  it('preserves the front seat height while seat depth and tilt change', () => {
    const chair = deriveGeometry({ ...DEFAULT_CONFIG, seatDepth: 46, seatAngle: 12 })
    close(chair.seat.front[1], 0.5)
    close(chair.seat.width, 0.39)
    close(chair.seat.depth, 0.46)
    close(chair.seat.seatRear[2], chair.seat.rear[2])
    expect(chair.seat.rear[1]).toBeLessThan(0.5)
    close(chair.rearWheels[0].center[2] - chair.seat.rear[2], 0.08)
  })

  it('keeps both positively cambered rear tires and casters grounded and symmetric', () => {
    const chair = deriveGeometry({ ...DEFAULT_CONFIG, wheelCamber: 6, seatWidth: 46 })
    close(chair.rearWheels[0].center[1], 0.303329178)
    close(chair.rearWheels[1].center[1], 0.303329178)
    close(chair.rearWheels[0].center[1] - (0.295 + 0.01) * Math.cos(6 * Math.PI / 180), 0)
    close(chair.rearWheels[1].center[1] - (0.295 + 0.01) * Math.cos(6 * Math.PI / 180), 0)
    close(chair.casters[0].center[1], 0.05)
    close(chair.casters[1].center[1], 0.05)
    close(chair.rearWheels[0].center[0], -chair.rearWheels[1].center[0])
  })

  it('uses the agreed backrest height and angle defaults', () => {
    const chair = deriveGeometry(DEFAULT_CONFIG)
    close(chair.backrest.height, 0.2)
    close(chair.backrest.angle - chair.seat.tilt, 85 * Math.PI / 180)
  })

  it('supports four degrees of negative camber with both rear tires grounded and outward tilt', () => {
    const chair = deriveGeometry({ ...DEFAULT_CONFIG, wheelCamber: -4 })
    close(chair.rearWheels[0].center[1], 0.304257035)
    close(chair.rearWheels[1].center[1], 0.304257035)
    close(chair.rearWheels[0].camber, 4 * Math.PI / 180)
    close(chair.rearWheels[1].camber, -4 * Math.PI / 180)
    close(chair.rearWheels[0].center[1] - (0.295 + 0.01) * Math.cos(4 * Math.PI / 180), 0)
    close(chair.rearWheels[1].center[1] - (0.295 + 0.01) * Math.cos(4 * Math.PI / 180), 0)
  })
})
