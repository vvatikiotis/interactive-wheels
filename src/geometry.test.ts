import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG, deriveGeometry, WHEEL } from './geometry'

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

  it('anchors vertical backrest supports directly at the rear seat-surface corners', () => {
    const chair = deriveGeometry(DEFAULT_CONFIG)
    for (const [index, side] of [-1, 1].entries()) {
      const support = chair.backrest.supports[index]
      close(support.base[0], side * chair.seat.width / 2)
      close(support.base[1], chair.seat.seatRear[1])
      close(support.base[2], chair.seat.seatRear[2])
      close(support.top[0], support.base[0])
    }
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

  it('connects the two rear seat-surface corners directly to the axle rod', () => {
    const chair = deriveGeometry(DEFAULT_CONFIG)
    for (const [index, side] of [-1, 1].entries()) {
      const connection = chair.rearFrameConnections[index]
      close(connection.seatPoint[0], side * chair.seat.width / 2)
      close(connection.seatPoint[1], chair.seat.seatRear[1])
      close(connection.seatPoint[2], chair.seat.seatRear[2])
      close(connection.axlePoint[1], chair.axleTube.start[1])
      close(connection.axlePoint[2], chair.axleTube.start[2])
      expect(Math.abs(connection.axlePoint[0])).toBeLessThan(Math.abs(chair.axleTube.end[0]))
    }
  })

  it('adds a second support from each side-rail midpoint to the existing axle attachment', () => {
    const chair = deriveGeometry(DEFAULT_CONFIG)
    for (const [index, side] of [-1, 1].entries()) {
      const existing = chair.rearFrameConnections[index]
      const added = chair.rearFrameMidConnections[index]
      close(added.axlePoint[0], existing.axlePoint[0])
      close(added.axlePoint[1], existing.axlePoint[1])
      close(added.axlePoint[2], existing.axlePoint[2])
      close(added.seatPoint[0], side * (chair.seat.width / 2 + 0.005))
      close(added.seatPoint[1], (chair.frontFrame.upperLeft[1] + chair.seat.seatRear[1]) / 2)
      close(added.seatPoint[2], (chair.frontFrame.upperLeft[2] + chair.seat.seatRear[2]) / 2)
    }
  })

  it('keeps the selected rear axle position when seat depth changes', () => {
    const chair = deriveGeometry({ ...DEFAULT_CONFIG, seatDepth: 46, rearAxlePosition: 0 })
    close(chair.rearWheels[0].center[2] - chair.seat.rear[2], 0)
    close(chair.rearAxlePosition, 0)
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
    close(standard.footrest.thickness, 0.01)
    close(standard.footrest.center[1] - standard.footrest.thickness / 2, standard.frontFrame.lowerLeft[1] + standard.frontFrame.crossbar.radius)
    close(standard.footrest.center[2], standard.frontFrame.lowerLeft[2] - 0.04)
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


  it('places each caster inside an inverted-U fork with axle across its legs and stem at the top', () => {
    const chair = deriveGeometry(DEFAULT_CONFIG)
    for (const caster of chair.casters) {
      const [leftAxle, rightAxle] = caster.forkAxle
      const [leftLeg, rightLeg] = caster.forkLegs
      close(caster.center[0] - leftAxle[0], 0.025)
      close(rightAxle[0] - caster.center[0], 0.025)
      close(leftAxle[1], caster.center[1])
      close(rightAxle[1], caster.center[1])
      close(leftAxle[2], caster.center[2])
      close(rightAxle[2], caster.center[2])
      close(leftLeg[1][0], leftAxle[0])
      close(leftLeg[1][1], leftAxle[1])
      close(leftLeg[1][2], leftAxle[2])
      close(rightLeg[1][0], rightAxle[0])
      close(rightLeg[1][1], rightAxle[1])
      close(rightLeg[1][2], rightAxle[2])
      expect(leftLeg[0][1]).toBeGreaterThan(leftLeg[1][1])
      expect(rightLeg[0][1]).toBeGreaterThan(rightLeg[1][1])
      close(caster.forkStem[0][0], caster.forkAttachment[0])
      close(caster.forkStem[0][1], caster.forkAttachment[1])
      close(caster.forkStem[0][2], caster.forkAttachment[2])
      close(caster.forkStem[1][0], caster.forkTop[0])
      close(caster.forkStem[1][1], caster.forkTop[1])
      close(caster.forkStem[1][2], caster.forkTop[2])
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

  it('uses smaller-radius, thick caster tyres and keeps the front wheels grounded', () => {
    close(WHEEL.casterRadius, 0.04)
    close(WHEEL.casterTire, 0.008)
    const chair = deriveGeometry(DEFAULT_CONFIG)
    close(chair.casters[0].center[1], 0.048)
    close(chair.casters[1].center[1], 0.048)
  })

  it('keeps both positively cambered rear tires and casters grounded and symmetric', () => {
    const chair = deriveGeometry({ ...DEFAULT_CONFIG, wheelCamber: 6, seatWidth: 46 })
    close(chair.rearWheels[0].center[1], 0.303329178)
    close(chair.rearWheels[1].center[1], 0.303329178)
    close(chair.rearWheels[0].center[1] - (0.295 + 0.01) * Math.cos(6 * Math.PI / 180), 0)
    close(chair.rearWheels[1].center[1] - (0.295 + 0.01) * Math.cos(6 * Math.PI / 180), 0)
    close(chair.casters[0].center[1], 0.048)
    close(chair.casters[1].center[1], 0.048)
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
