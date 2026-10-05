import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG, deriveGeometry } from './geometry'
import { deriveMannequin } from './mannequin'

const close = (actual: number, expected: number) => expect(actual).toBeCloseTo(expected, 5)

describe('seated mannequin', () => {
  it('keeps its hips over the seat and feet above the footplate as settings change', () => {
    for (const config of [DEFAULT_CONFIG, { ...DEFAULT_CONFIG, seatWidth: 33, seatDepth: 46, seatAngle: 12, footrestSlope: 15 }]) {
      const chair = deriveGeometry(config)
      const figure = deriveMannequin(chair)
      expect(figure.hips[0][0]).toBeGreaterThan(-chair.seat.width / 2)
      expect(figure.hips[1][0]).toBeLessThan(chair.seat.width / 2)
      expect(figure.hips[0][1]).toBeGreaterThan(chair.seat.rear[1])
      expect(figure.knees[0][2]).toBeGreaterThan(figure.hips[0][2])
      expect(figure.toes[0][1]).toBeGreaterThan(chair.footrest.center[1])
      expect(figure.toes[0][2]).toBeGreaterThan(chair.footrest.center[2])
      expect(figure.head.center[1]).toBeGreaterThan(figure.shoulders[0][1])
    }
  })

  it('leans with the configured backrest without changing the chair', () => {
    const upright = deriveMannequin(deriveGeometry({ ...DEFAULT_CONFIG, backrestAngle: 80 }))
    const reclined = deriveMannequin(deriveGeometry({ ...DEFAULT_CONFIG, backrestAngle: 110 }))
    expect(reclined.shoulders[0][2]).toBeLessThan(upright.shoulders[0][2])
    close(reclined.hips[0][2], upright.hips[0][2])
  })
})
