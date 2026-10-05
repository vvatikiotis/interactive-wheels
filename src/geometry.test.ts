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
    const chair = deriveGeometry({ ...DEFAULT_CONFIG, backrestHeight: 35 })
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

  it('uses a 10 cm backrest height by default', () => {
    const chair = deriveGeometry(DEFAULT_CONFIG)
    close(chair.backrest.height, 0.1)
  })

  it('supports two degrees of negative camber with both rear tires grounded and outward tilt', () => {
    const chair = deriveGeometry({ ...DEFAULT_CONFIG, wheelCamber: -2 })
    close(chair.rearWheels[0].center[1], 0.3048142)
    close(chair.rearWheels[1].center[1], 0.3048142)
    close(chair.rearWheels[0].camber, 2 * Math.PI / 180)
    close(chair.rearWheels[1].camber, -2 * Math.PI / 180)
    close(chair.rearWheels[0].center[1] - (0.295 + 0.01) * Math.cos(2 * Math.PI / 180), 0)
    close(chair.rearWheels[1].center[1] - (0.295 + 0.01) * Math.cos(2 * Math.PI / 180), 0)
  })
})
