import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG, deriveGeometry } from './geometry'
import { deriveMannequin } from './mannequin'

const close = (actual: number, expected: number) => expect(actual).toBeCloseTo(expected, 5)

describe('seated mannequin', () => {
  it('keeps its waist slightly narrower than the seat and feet above the footplate as settings change', () => {
    for (const config of [DEFAULT_CONFIG, { ...DEFAULT_CONFIG, seatWidth: 33, seatDepth: 46, seatAngle: 12, footrestSlope: 15, frontCrossbarHeight: 2 }, { ...DEFAULT_CONFIG, frontCrossbarHeight: 10 }]) {
      const chair = deriveGeometry(config)
      const figure = deriveMannequin(chair)
      expect(figure.hips[0][0]).toBeGreaterThan(-chair.seat.width / 2)
      expect(figure.hips[1][0]).toBeLessThan(chair.seat.width / 2)
      close(figure.hips[1][0] - figure.hips[0][0], chair.seat.width * 0.95)
      close(figure.shoulders[1][0] - figure.shoulders[0][0], chair.seat.width)
      expect(figure.shoulders[1][0] - figure.shoulders[0][0]).toBeGreaterThan(figure.hips[1][0] - figure.hips[0][0])
      expect(figure.hips[0][1]).toBeGreaterThan(chair.seat.rear[1])
      expect(figure.knees[0][2]).toBeGreaterThan(figure.hips[0][2])
      expect(figure.toes[0][1]).toBeGreaterThan(chair.footrest.center[1])
      expect(figure.toes[0][2]).toBeGreaterThan(chair.footrest.center[2])
      expect(figure.head.center[1]).toBeGreaterThan(figure.shoulders[0][1])
      for (const [index, side] of [-1, 1].entries()) {
        const arm = figure.arms[index]
        const wheel = chair.rearWheels[index]
        close(arm[1][1], arm[0][1])
        expect(side * (arm[1][0] - wheel.center[0])).toBeGreaterThan(0)
        expect(side * (arm[2][0] - wheel.center[0])).toBeGreaterThan(0)
        expect(arm[2][1]).toBeGreaterThan(arm[3][1])
        expect(side * (arm[3][0] - wheel.center[0])).toBeGreaterThan(0)
        close(Math.abs(arm[3][0] - wheel.center[0]), 0.03)
        close(arm[3][1], wheel.center[1] + 0.03)
        close(arm[3][2], wheel.center[2])
      }
    }
  })

  it('leans with the configured backrest without changing the chair', () => {
    const upright = deriveMannequin(deriveGeometry({ ...DEFAULT_CONFIG, backrestAngle: 80 }))
    const reclined = deriveMannequin(deriveGeometry({ ...DEFAULT_CONFIG, backrestAngle: 110 }))
    expect(reclined.shoulders[0][2]).toBeLessThan(upright.shoulders[0][2])
    close(reclined.hips[0][2], upright.hips[0][2])
  })
})
